/**
 * 日本語の文字列を「文節」に分ける。W-01。
 *
 * ブラウザは日本語を文字単位で折り返すので、狭いボタンでは「プロフィールを編｜集」のように
 * 語の途中で改行される。読み手が期待するのは「プロフィールを｜編集」であり、
 * 「プロフィール｜を編集」（助詞が行頭に来る）でもない。
 *
 * 依存を足さずにこれを決めるため、2 段で判定する。
 *
 *   1. 候補 … Intl.Segmenter（全主要ブラウザと Node が標準で持つ）の語の境目
 *   2. 判定 … 境目の両側の文字種で「ここで折ってよいか」を決める
 *
 * Intl.Segmenter の語分割だけでは足りない。ICU の辞書は「読｜んで」「戻｜せ｜ま｜せん」のように
 * 動詞の活用の途中でも切るので、境目をそのまま改行位置にすると、かえって不自然になる。
 * 改行してよいのは、おおむね「付属語（ひらがな）の後に、次の内容語（漢字・カタカナ・英数字）が始まる」ところで、
 * これは境目の候補に文字種の規則を重ねれば決まる。
 *
 * 機械学習の分割器（BudouX など）ほど賢くはないが、規則が読めて、依存が無く、
 * サーバーとクライアントで同じ結果を返す（hydration がずれない）。
 */

type CharClass = 'hira' | 'kata' | 'han' | 'alnum' | 'open' | 'close' | 'space' | 'other';

const HIRAGANA = /\p{Script=Hiragana}/u;
const KATAKANA = /\p{Script=Katakana}/u;
const HAN = /\p{Script=Han}/u;
const ALNUM = /[\p{Script=Latin}\p{Nd}]/u;
const SPACE = /\s/u;
/** 開き括弧・開き引用符。後ろの語に付ける。 */
const OPEN = /[「『（(［[｛{〈《【〔“‘]/u;
/** 閉じ括弧・句読点・中黒など、行頭に来てはいけない記号。前の語に付ける。 */
const CLOSE = /[」』）)］\]｝}〉》】〕”’、。，．,.!！?？…‥・:：;；〜~]/u;
/** かな（ひらがな・カタカナ）を含むか。含まない文字列（中国語・英語）には手を出さない。W-04。 */
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

function classOf(ch: string): CharClass {
  if (SPACE.test(ch)) return 'space';
  // 長音符はひらがな・カタカナどちらにも付く。カタカナとして扱えば「データ」の中で折らない。
  if (ch === 'ー') return 'kata';
  if (HIRAGANA.test(ch)) return 'hira';
  if (KATAKANA.test(ch)) return 'kata';
  if (HAN.test(ch)) return 'han';
  if (ALNUM.test(ch)) return 'alnum';
  if (OPEN.test(ch)) return 'open';
  if (CLOSE.test(ch)) return 'close';
  return 'other';
}

/**
 * 文節を終える助詞。これに続くひらがなの語は、新しい文節として始まってよい
 * （「最後まで｜お読みください」「変更は｜すぐに反映されます」）。
 */
const PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'や', 'から', 'まで', 'より',
  'には', 'では', 'とは', 'にも', 'でも', 'とも', 'など', 'だけ', 'しか', 'こそ', 'さえ',
]);

/**
 * 文節の頭に立たない、ひらがなの語（助詞・助動詞・活用語尾・補助的な語）。
 * 助詞の後に来ても、これらでは折らない（「規約に｜ついて」ではなく「規約について」）。
 */
const FUNCTION_WORDS = new Set([
  ...PARTICLES,
  'て', 'で', 'た', 'だ', 'ます', 'ません', 'まし', 'ませ', 'です', 'でし', 'ない', 'なかっ', 'なく', 'ず', 'ぬ', 'ん',
  'れ', 'られ', 'れる', 'られる', 'せ', 'させ', 'せる', 'させる', 'さ', 'され', 'し', 'する', 'すれ',
  'う', 'よう', 'まい', 'たい', 'たく', 'たかっ', 'そう', 'らしい', 'ば', 'ね', 'よ', 'か', 'な', 'わ', 'ぞ', 'ぜ', 'っ',
  'つい', 'とっ', 'よっ', 'おい', 'おけ', 'いう', 'いっ', 'ほど', 'ので', 'のに', 'けど', 'けれど', 'ながら', 'たり', 'だり', 'ても',
]);

/**
 * 1 文字で次の内容語の前に立てる助詞。これ以外の 1 文字のひらがなは送り仮名とみなし、
 * 複合語の中で折らない（「置き｜配」「読み｜込み」「取り｜消し」にしない）。
 */
const ONE_CHAR_PARTICLES = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'や', 'で', 'か']);

/** 後ろの語に付く語（接頭辞・連体詞）。「ご｜注文」「この｜内容」で折らない。 */
const PREFIXES = new Set(['お', 'ご', 'この', 'その', 'あの', 'どの', 'こんな', 'そんな', 'あんな', 'どんな']);

const lastChar = (s: string): string => s.slice(-1);

/** 語 a と語 b の間で改行してよいか。before は a の直前の文字（a が先頭なら空）。 */
function canBreak(a: string, b: string, before: string): boolean {
  const left = classOf(lastChar(a));
  const right = classOf(b.charAt(0));
  // 空白はそれ自体が改行位置。隣に <wbr> を足す意味は無い。
  if (left === 'space' || right === 'space') return false;
  // 閉じ括弧・句読点は行頭に置かない（禁則）。開き括弧は行末に置かない。
  if (right === 'close' || left === 'open') return false;
  if (PREFIXES.has(a)) return false;

  const contentStarts = right === 'han' || right === 'kata' || right === 'alnum' || right === 'open';
  if (left === 'close') {
    // 「…」を ／ 120万円。｜4月 ／ はい、｜すぐに
    return contentStarts || (right === 'hira' && !FUNCTION_WORDS.has(b));
  }
  if (left === 'hira') {
    if (contentStarts) {
      // 漢字に挟まれた 1 文字のひらがな（助詞を除く）は送り仮名。「置｜き｜配」で折らない。
      // 直前が漢字でなければ送り仮名ではない（「同意し｜て｜続ける」「選ん｜だ｜場合」は折ってよい）。
      const okurigana =
        a.length === 1 &&
        !ONE_CHAR_PARTICLES.has(a) &&
        classOf(before) === 'han' &&
        (right === 'han' || right === 'kata');
      return !okurigana;
    }
    if (right === 'hira') return PARTICLES.has(a) && !FUNCTION_WORDS.has(b);
  }
  // 漢字・カタカナ・英数字どうし（複合語・数と単位）と、その後ろの送り仮名・助詞では折らない。
  return false;
}

interface SegmenterLike {
  segment: (input: string) => Iterable<{ segment: string }>;
}

let segmenter: SegmenterLike | null | undefined;

function getSegmenter(): SegmenterLike | null {
  if (segmenter !== undefined) return segmenter;
  const Ctor = (Intl as { Segmenter?: new (locale: string, options: { granularity: 'word' }) => SegmenterLike })
    .Segmenter;
  segmenter = typeof Ctor === 'function' ? new Ctor('ja', { granularity: 'word' }) : null;
  return segmenter;
}

/** 語の候補。Intl.Segmenter が無い環境では、同じ文字種の連なりで近似する。 */
function words(text: string): string[] {
  const seg = getSegmenter();
  if (seg) return [...seg.segment(text)].map((s) => s.segment);
  const out: string[] = [];
  for (const ch of text) {
    const prev = out[out.length - 1];
    if (prev !== undefined && classOf(lastChar(prev)) === classOf(ch)) out[out.length - 1] = prev + ch;
    else out.push(ch);
  }
  return out;
}

/** 日本語として文節分割すべき文字列か（かなを含むか）。 */
export function hasKana(text: string): boolean {
  return KANA.test(text);
}

const cache = new Map<string, readonly string[]>();
const CACHE_LIMIT = 1000;

/**
 * 文字列を文節の並びに分ける。連結すると必ず元の文字列に戻る。
 * かなを含まない文字列（英語・中国語・数字だけ）は 1 要素のまま返す。
 *
 *   splitPhrases('プロフィールを編集') → ['プロフィールを', '編集']
 *   splitPhrases('最後までお読みください。') → ['最後まで', 'お読みください。']
 */
export function splitPhrases(text: string): readonly string[] {
  if (!hasKana(text)) return [text];
  const cached = cache.get(text);
  if (cached) return cached;

  const ws = words(text);
  const phrases: string[] = [];
  let current = ws[0] ?? '';
  for (let i = 1; i < ws.length; i += 1) {
    const prev = ws[i - 1] ?? '';
    const next = ws[i] ?? '';
    const before = lastChar(ws[i - 2] ?? '');
    if (canBreak(prev, next, before)) {
      phrases.push(current);
      current = next;
    } else {
      current += next;
    }
  }
  phrases.push(current);

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(text, phrases);
  return phrases;
}
