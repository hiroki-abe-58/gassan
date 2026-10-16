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
 *
 * 日本語以外は、文字の種類で扱いを分ける（W-04）。
 *
 *   中国語（かなを含まず漢字を含む） … 語の切れ目で折る。ブラウザは「编辑个人资｜料」と語の途中で折る
 *   韓国語（ハングルを含む）         … 空白でだけ折る。ブラウザは「프로필 편｜집」と語の途中で折る
 *   タイ語・ラオ語・クメール語・ビルマ語 … 手を出さない。ブラウザが辞書で語の切れ目を見つけて折る。
 *                                      keep-all を掛けると、その辞書の切れ目まで消える（実測）
 *   英語など空白で区切る言語          … 手を出さない。空白で折れる
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
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL = /\p{Script=Hangul}/u;

/**
 * 折り返しを整える対象の言語。null は手を出さない文字列（英語・タイ語・数字だけ など）。
 * かなを含めば日本語、ハングルを含めば韓国語、どちらも無く漢字を含めば中国語とみなす。
 * 漢字だけの日本語（「利用規約」）は中国語の規則で語の切れ目に折れるが、日本語としても自然な位置になる。
 */
export type PhraseScript = 'ja' | 'zh' | 'ko';

export function scriptOf(text: string): PhraseScript | null {
  if (KANA.test(text)) return 'ja';
  if (HANGUL.test(text)) return 'ko';
  if (HAN.test(text)) return 'zh';
  return null;
}

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

/**
 * 前の語に付く 1 文字の語（助詞・語気詞・後置の「後・時・中」）。行頭に立たせない
 * （「我的｜文件」にして「我｜的文件」にしない。「删除此文件后｜将无法恢复」）。
 */
const ZH_SUFFIXES = new Set([...'的地得了着著过過们們吗嗎呢吧啊么麼后後时時中里裡内內']);

const isSingleHan = (w: string): boolean => w.length === 1 && classOf(w) === 'han';

/**
 * 中国語の語 a と語 b の間で改行してよいか。after は b の次の語（b が末尾なら空）。
 *
 * 語の切れ目は ICU の辞書による。辞書に無い語は 1 文字ずつに割れる（「上传」→「上｜传」）ので、
 * 1 文字の語は後ろの語に付けて、その中では折らない。前置詞・指示詞（「并｜关闭」「此｜文件」）も
 * 後ろに付くので、同じ規則で自然な位置になる。ただし次の場合は前の語に付ける。
 *
 *   - ZH_SUFFIXES の語（「我的」「文件后」）
 *   - 後ろに漢字が続かない 1 文字（「验证码」→「验证｜码」の「码」が行頭に落ちない）
 *   - 後ろに ZH_SUFFIXES が続く 1 文字（「销售额的」→「销售｜额的」にしない）
 */
function canBreakZh(a: string, b: string, after: string): boolean {
  const left = classOf(lastChar(a));
  const right = classOf(b.charAt(0));
  if (left === 'space' || right === 'space') return false;
  if (right === 'close' || left === 'open') return false;
  if (isSingleHan(b) && (ZH_SUFFIXES.has(b) || classOf(after.charAt(0)) !== 'han' || ZH_SUFFIXES.has(after))) {
    return false;
  }
  if (left === 'close') return right === 'han' || right === 'alnum' || right === 'open';
  if (right === 'open') return left === 'han' || left === 'alnum';
  if (left !== 'han' || right !== 'han') return false; // 数と量詞（3个）、漢字と英数字（版本2）では折らない
  return !(isSingleHan(a) && !ZH_SUFFIXES.has(a));
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

const cache = new Map<string, readonly string[]>();
const CACHE_LIMIT = 1000;

/**
 * 文字列を、改行してよい位置で分ける。連結すると必ず元の文字列に戻る。
 * 日本語は文節、中国語は語の切れ目で分ける。韓国語は空白で折れるので 1 要素のまま返し、
 * それ以外の文字列（英語・タイ語・数字だけ）にも手を出さない。
 *
 *   splitPhrases('プロフィールを編集') → ['プロフィールを', '編集']
 *   splitPhrases('最後までお読みください。') → ['最後まで', 'お読みください。']
 *   splitPhrases('编辑个人资料') → ['编辑', '个人', '资料']
 */
export function splitPhrases(text: string): readonly string[] {
  const script = scriptOf(text);
  if (script !== 'ja' && script !== 'zh') return [text];
  const cached = cache.get(text);
  if (cached) return cached;

  const ws = words(text);
  const phrases: string[] = [];
  let current = ws[0] ?? '';
  for (let i = 1; i < ws.length; i += 1) {
    const prev = ws[i - 1] ?? '';
    const next = ws[i] ?? '';
    const before = lastChar(ws[i - 2] ?? '');
    if (script === 'ja' ? canBreak(prev, next, before) : canBreakZh(prev, next, ws[i + 1] ?? '')) {
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
