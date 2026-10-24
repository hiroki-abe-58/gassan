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

/** 全角の句読点。後ろで必ず折ってよい（半角の「.」「,」は小数や桁区切りにも使うので含めない）。 */
const TERMINAL = /[、。，．！？]/u;

/**
 * 長い文節（LONG 文字を超える）の中でだけ使う、2 番目の切れ目。
 *
 * 文節で折る規則だけだと、カタカナの複合語（「モジュールレベルディレクティブは」）や
 * 補助的な動詞の連なり（「閉じ込められないようにするための」）が 1 つの長い塊になり、
 * 狭い器（スマホのボタン・表のセル）では W-02 の安全弁が文字単位で折る（「…するため｜の」）。
 * そこで、長い塊に限って、語として確かな切れ目でも折れるようにする。短い文節は今までどおり 1 つのまま。
 *
 *   - カタカナの語どうし。ただし両側とも 3 文字以上（ICU は辞書に無いカタカナ語を
 *     「デ｜ィ｜レ｜ク」と 1 文字ずつに割るので、短い断片の間では折らない）
 *   - 助詞の後の補助的な動詞（「…ように｜する」「…ことに｜なる」）
 */
const LONG = 9;
const SMALL_KANA = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ]/u;
const AUXILIARY_VERBS = new Set(['する', 'なる', 'いる', 'ある', 'できる', 'みる', 'おく']);

function canBreakLong(a: string, b: string): boolean {
  const left = classOf(lastChar(a));
  const right = classOf(b.charAt(0));
  if (SMALL_KANA.test(b.charAt(0))) return false;
  if (left === 'kata' && right === 'kata') return [...a].length >= 3 && [...b].length >= 3;
  return PARTICLES.has(a) && AUXILIARY_VERBS.has(b);
}

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
  // 句読点の後は、何が始まっても折ってよい（「…当てない。｜×ボタンに」）。記号で始まる文も行頭に立てる。
  if (TERMINAL.test(lastChar(a))) return true;
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
 * 数の間の「:」（時刻「9:30」・比「16:9」）か。ICU は「9｜:｜30」と切り、「:」は閉じの記号なので、
 * 後ろに英数字が来ると折ってよいことになる（「最後の利用 9:｜30」）。数の間の「,」「.」は ICU が 1 語にまとめる。
 */
function inNumber(a: string, b: string, before: string): boolean {
  const chars = [...a];
  const digitBefore = chars.length > 1 ? (chars.at(-2) ?? '') : before;
  return /[:：]/u.test(chars.at(-1) ?? '') && DIGIT.test(digitBefore) && DIGIT.test(b.charAt(0));
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

/**
 * ICU の辞書が誤って切る並びを直す。て形の後の「はい」は感動詞ではなく、助詞「は」と動詞の頭
 * （「し｜て｜はい｜け｜ない」→「し｜て｜は｜いけ｜ない」。直さないと「しては｜いけない」で折れない）。
 */
function repair(ws: string[]): string[] {
  for (let i = 1; i < ws.length - 1; i += 1) {
    if (ws[i] === 'はい' && /[てで]$/u.test(ws[i - 1] ?? '') && HIRAGANA.test(ws[i + 1]?.charAt(0) ?? '')) {
      ws[i] = 'は';
      ws[i + 1] = `い${ws[i + 1] ?? ''}`;
    }
  }
  return ws;
}

/** 語の候補。Intl.Segmenter が無い環境では、同じ文字種の連なりで近似する。 */
function words(text: string): string[] {
  const seg = getSegmenter();
  if (seg) return repair([...seg.segment(text)].map((s) => s.segment));
  const out: string[] = [];
  for (const ch of text) {
    const prev = out[out.length - 1];
    if (prev !== undefined && classOf(lastChar(prev)) === classOf(ch)) out[out.length - 1] = prev + ch;
    else out.push(ch);
  }
  return out;
}

/**
 * 文節の中で、ブラウザ自身が改行してしまう境目を「糊」で留める。W-01 / W-04。
 *
 * keep-all の器の中でも、Chrome は次の境目で折る（実測）。文節の中なら、付属語や単位が行頭に立つ。
 *   「×｜ボタンに」「空｜＝条件」（記号の後）、「規約」｜が」（閉じ括弧の後のひらがな）、
 *   「Esc｜を押す」「close()｜した」（英数字・記号＋空白の後の付属語）、「30｜日後」「第 2｜层」（数と単位の間の空白）。
 * 英数字とかな・ハングルが空白なしで接する境目（「Rating과」）は、同じ器の中なら折らないが、
 * 要素の境目（器の外の code の直後）では折るので、同じく留める。
 *
 * 文字を足さずにこれを止めるため、境目の前後の数文字を white-space: nowrap の器（.g-nobr）に入れる。
 * 器は数文字なので、器より長くなって溢れることは無い。重なる・隣り合う糊は 1 つにまとめる。
 * CJK の括弧と句読点の前後は留めない（行頭・行末の禁則は UAX #14 がもともと守る）。
 *
 * 返すのは [文字列, 糊か] の並び。連結すると必ず元の文字列に戻る。
 */
const LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}ー]/u;
const JA_LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/u;
const CJK_PUNCT = /[、。，．！？」』）〕】〉》］｝「『（〔【〈《［｛]/u;
const CJK_CLOSE = /[」』）〕】〉》］｝]/u;
const DIGIT = /\p{Nd}/u;
/** 英文の区切り。「A, それ」の空白は折ってよい。 */
const SENTENCE_END = /[,.;:!?]/u;

/**
 * 境目 i（chars[i - 1] と chars[i] の間）を留めるなら、留める範囲の長さ（i から何文字さかのぼるか）。0 は留めない。
 */
function gluesAt(chars: readonly string[], i: number, script: PhraseScript): number {
  const a = chars[i - 1] ?? '';
  const b = chars[i] ?? '';
  if (!a || !b) return 0;
  if (!SPACE.test(a) && !SPACE.test(b)) {
    // 文節の中の「」が」「）は」。閉じ括弧の後でブラウザは折るが、続くひらがなは付属語（文節の切れ目なら <wbr> が先に入る）
    if (CJK_CLOSE.test(a) && HIRAGANA.test(b)) return 1;
    const letterA = LETTER.test(a);
    if (letterA === LETTER.test(b)) return 0;
    return CJK_PUNCT.test(letterA ? b : a) ? 0 : 1;
  }
  // 「英数字・記号 + 空白 + 付属語」と「数 + 空白 + 単位」の空白。日本語は「Esc を」「close() した」「30 日」「1 つ」、
  // 中国語は数と量詞（「第 2 层」「30 天」）だけ。「overlay プロパティ」「DOM 検索」の空白は語の切れ目なので折ってよい。
  // 韓国語は空白が語の切れ目なので留めない。空白を器の端に置くと、名前の計算で空白が落ちる実装がある
  // （「Escを」と読まれる）ので、空白の前の文字から 3 文字を留める。
  if (script === 'ko' || !SPACE.test(a) || SPACE.test(b)) return 0;
  const before = chars[i - 2] ?? '';
  if (!before || SPACE.test(before) || LETTER.test(before) || CJK_PUNCT.test(before) || SENTENCE_END.test(before)) return 0;
  if (DIGIT.test(before)) return (script === 'ja' ? JA_LETTER : HAN).test(b) ? 2 : 0;
  return script === 'ja' && HIRAGANA.test(b) ? 2 : 0;
}

export interface GlueResult {
  /** [文字列, 糊か] の並び。連結すると必ず元の文字列に戻る。 */
  segments: readonly (readonly [string, boolean])[];
  /** 先頭の糊が、直前の要素（before の文字で終わる <a> や <strong>）と留まる。 */
  joinsPrevious: boolean;
}

/**
 * before は、この文字列の直前に並ぶ要素（リンク・強調・コード）の最後の文字。
 * 「[recipes.md](…)에」「**Baseline** なので」のように、要素をまたぐ境目も同じ規則で留めるために使う。
 */
export function glueSegments(text: string, script: PhraseScript, before = ''): GlueResult {
  const chars = before ? [before, ...text] : [...text];
  const glued = new Array<boolean>(chars.length).fill(false);
  for (let i = 1; i < chars.length; i += 1) {
    const span = gluesAt(chars, i, script);
    for (let k = 0; span > 0 && k <= span; k += 1) glued[i - k] = true;
  }
  const offset = before ? 1 : 0;
  const joinsPrevious = before ? Boolean(glued[0] && glued[1]) : false;
  const segments: [string, boolean][] = [];
  chars.slice(offset).forEach((ch, i) => {
    const isGlue = glued[i + offset] ?? false;
    const last = segments[segments.length - 1];
    if (last && last[1] === isGlue) last[0] += ch;
    else segments.push([ch, isGlue]);
  });
  return { segments, joinsPrevious };
}

/**
 * a で終わる要素と b で始まる要素の境目が、文節（中国語は語）の切れ目か。
 * 要素の境目には <wbr> が入らず、両側の文字が keep-all の器にあると、そこでは折れない。
 * 「」と」＋「**読み上げた**」のような境目を放っておくと、前後がつながった長い塊になり、
 * 安全弁（W-02）が文節の途中で折る。「ための」＋「`history.back()`」のような、かなと英数字の境目も同じ。
 * 境目の両側が文字（漢字・かな・英数字）で、英数字どうしではないときだけ見る。
 */
export function breaksBetween(a: string, b: string): boolean {
  const tail = splitPhrases(a).at(-1) ?? '';
  const head = splitPhrases(b)[0] ?? '';
  const x = lastChar(tail);
  const y = head.charAt(0);
  const isWord = (ch: string): boolean => LETTER.test(ch) || ALNUM.test(ch);
  if (!isWord(x) || !isWord(y) || (ALNUM.test(x) && ALNUM.test(y))) return false;
  const script = scriptOf(tail + head);
  if (script !== 'ja' && script !== 'zh') return false;
  let at = 0;
  for (const phrase of splitPhrases(tail + head)) {
    at += phrase.length;
    if (at === tail.length) return true;
    if (at > tail.length) return false;
  }
  return false;
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
  // まず文節（語の並び）にまとめ、長すぎる文節だけを 2 番目の切れ目でさらに分ける。
  const groups: string[][] = [];
  let current: string[] = ws.length > 0 ? [ws[0] ?? ''] : [];
  for (let i = 1; i < ws.length; i += 1) {
    const prev = ws[i - 1] ?? '';
    const next = ws[i] ?? '';
    const before = lastChar(ws[i - 2] ?? '');
    if (!inNumber(prev, next, before) && (script === 'ja' ? canBreak(prev, next, before) : canBreakZh(prev, next, ws[i + 1] ?? ''))) {
      groups.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }
  groups.push(current);

  const phrases: string[] = [];
  for (const group of groups) {
    const whole = group.join('');
    if (script !== 'ja' || [...whole].length <= LONG) {
      phrases.push(whole);
      continue;
    }
    let part = group[0] ?? '';
    for (let i = 1; i < group.length; i += 1) {
      const next = group[i] ?? '';
      if (canBreakLong(group[i - 1] ?? '', next)) {
        phrases.push(part);
        part = next;
      } else {
        part += next;
      }
    }
    phrases.push(part);
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(text, phrases);
  return phrases;
}
