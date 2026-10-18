import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  type ReactElement,
  type ReactNode,
} from 'react';

import { breaksBetween, glueSegments, scriptOf, splitPhrases, type PhraseScript } from './internal/phrase';

/**
 * 日本語・中国語・韓国語の折り返し方。W-01〜W-05。
 *
 *   'phrase'  … 文節（中国語は語、韓国語は空白）の切れ目でだけ改行する（既定）
 *   'browser' … ブラウザに任せる（文字単位で折れる）
 */
export type LineBreakMode = 'phrase' | 'browser';

export const LineBreakContext = createContext<LineBreakMode>('phrase');

/**
 * 中身の文字列に手を出さない要素。コードや入力欄の値は、見たままの文字列でなければならない。
 * option / optgroup は文字列しか子に持てない（span や wbr を入れると React が警告し、描かれない）。
 */
const SKIP = new Set(['code', 'pre', 'kbd', 'samp', 'textarea', 'script', 'style', 'svg', 'math', 'option', 'optgroup']);

/**
 * 文字列を文節に分け、切れ目に <wbr aria-hidden="true"> を入れる。
 *
 * ゼロ幅スペースではなく <wbr> を使うのは、文字列を変えないため（コピーした文字列が元のまま）。
 * ただし素の <wbr> は、Chrome のアクセシビリティツリーで空白として名前に混ざる
 * （「プロフィールを 編集」と読まれる。実測）。aria-hidden を付けると名前から外れ、
 * 改行の機会としてだけ残る（W-03）。器の .g-phrase が word-break: keep-all を持つので、
 * 改行は <wbr> と空白の位置でだけ起きる。1 文節が器より長いときだけ文字単位で折る（W-02）。
 *
 * 文節ごとの span に white-space: nowrap を付ける方式も実測したが、名前は汚れない代わりに、
 * 器より長い文節がはみ出す。keep-all の span を並べる方式は、文字単位で折れてしまい効かない。
 *
 * 韓国語は語を空白で区切るので <wbr> は要らず、器（keep-all）だけで空白でだけ折れる。
 * 英語・タイ語などは器も付けない。タイ語に keep-all を掛けると、ブラウザが辞書で見つけた
 * 語の切れ目まで消え、語の途中で折れる（W-04）。
 */
function phraseText(text: string): ReactNode {
  const script = scriptOf(text);
  return script ? <span className="g-phrase">{phraseInner(text, script, '').inner}</span> : text;
}

/**
 * 文字列を文節に分けた、器（.g-phrase）の中身。before は直前に並ぶ要素の最後の文字（要素をまたぐ糊のため）。
 * lead は、直前の要素と一緒に留めるべき先頭の文字（「[recipes.md](…)에」の「에」）。呼び手が要素と束ねる。
 * 韓国語は語を空白で区切るので文節には分けないが、「·」で並べた語の後では折ってよい
 * （「SearchInput·Textarea·NumberField」が 1 つの塊になり、語の途中で折れるのを防ぐ）。
 */
function phraseInner(text: string, script: PhraseScript, before: string): { lead: string; inner: ReactNode[] } {
  const parts = script === 'ko' ? text.split(/(?<=·)(?=\S)/u) : splitPhrases(text);
  let lead = '';
  const inner = parts.map((part, i) => {
    const { segments, joinsPrevious } = glueSegments(part, script, i === 0 ? before : '');
    let rest = segments;
    if (i === 0 && joinsPrevious) {
      lead = segments[0]?.[0] ?? '';
      rest = segments.slice(1);
    }
    return (
      <Fragment key={i}>
        {i === 0 ? null : <wbr aria-hidden="true" />}
        {renderSegments(rest)}
      </Fragment>
    );
  });
  return { lead, inner };
}

/** 文節の中の、ブラウザが勝手に折る境目を .g-nobr で留める（glueSegments）。 */
function renderSegments(segments: readonly (readonly [string, boolean])[]): ReactNode {
  return segments.map(([text, isGlue], i) =>
    isGlue ? (
      <span key={i} className="g-nobr">
        {text}
      </span>
    ) : (
      text
    ),
  );
}

/** 要素の中の文字列（素の要素だけ。コンポーネントの中身は描くまで分からないので空）。 */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child: ReactNode) => textOf(child)).join('');
  if (!isValidElement<{ children?: ReactNode }>(node)) return '';
  if (typeof node.type !== 'string' && node.type !== Fragment) return '';
  return textOf(node.props.children);
}

/** 何も描かない子（null・真偽値・空文字列・その配列）。 */
const isEmpty = (node: ReactNode): boolean =>
  node === null ||
  node === undefined ||
  typeof node === 'boolean' ||
  node === '' ||
  (Array.isArray(node) && (node as ReactNode[]).every(isEmpty));

/**
 * 束ねた要素の中では折れるようにする。最後の 1 文字だけを束の側（nowrap）に残し、それより前を
 * white-space: normal の .g-wrap に入れる。要素ごと nowrap にすると、行より長いコードがはみ出す。
 * 束の中の要素を丸ごと normal に戻すと、要素と次の文字の境目でまた折れる（境目の改行は、Chrome では
 * 前の文字の側のスタイルで決まる）。最後の文字の並び（最後の子、その最後の子…）をたどって分ける。
 * 「`overflow-wrap: break-word` は」が「overflow-wrap: ｜break-word は」と中で折れ、「break-word｜は」では折れない。
 */
function holdTail(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    const chars = [...node];
    const last = chars.pop();
    return chars.length === 0 ? node : [<span key="g-wrap" className="g-wrap">{chars.join('')}</span>, last];
  }
  if (Array.isArray(node)) {
    // 末尾の空の子（置かなかった <wbr> の null など）は飛ばす。最後の文字を持つ子を束の側に残す
    const items = node as ReactNode[];
    let end = items.length - 1;
    while (end >= 0 && isEmpty(items[end])) end -= 1;
    if (end < 0) return node;
    const init = items.slice(0, end);
    const tail = holdTail(items[end]);
    return init.length === 0 ? tail : [<span key="g-wrap" className="g-wrap">{init}</span>, tail];
  }
  if (!isValidElement<{ children?: ReactNode; className?: string }>(node)) return node;
  // コンポーネントの中身は分からない。文字の糊（.g-nobr）は数文字なので、そのまま留める
  if ((typeof node.type !== 'string' && node.type !== Fragment) || node.props.className === 'g-nobr') return node;
  const { children } = node.props;
  return children === undefined ? node : cloneElement(node, undefined, holdTail(children));
}

/**
 * 文の中に並ぶ要素（phrasing content）。要素をまたぐ糊と <wbr> は、これらと文字列の境目にだけ置く。
 * 表の行・リスト・flex の項目の間に置くと、構造が壊れる（tr の子の wbr は HTML のパーサが表の外へ出す）。
 */
const INLINE = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var',
]);
const isInlineElement = (node: ReactNode): boolean =>
  isValidElement(node) && typeof node.type === 'string' && INLINE.has(node.type);

/**
 * 子の並びを変換する。要素と文字列の境目は、文字列の中と同じ規則で扱う（Chrome で実測して決めた）。
 *
 *   - 留める境目（「**Baseline** なので」「`close()` した」「`code`を」）では、要素と文字列の先頭を
 *     .g-nobr に束ね、後ろの文節の器（keep-all）の中に入れる。空白の前の改行は要素自身の white-space で
 *     決まるので、要素も nowrap でなければ止まらない。束を器の外に置くと、束の直後（「し｜た」）で折れる。
 *     要素の中は holdTail で折れるようにする。
 *   - 文節の切れ目（「」と」＋「**読み上げた**」「ための」＋「`history.back()`」）には、文字列の器の頭か
 *     末尾に <wbr> を置く。
 */
function phraseChildren(children: readonly ReactNode[]): ReactNode[] {
  const items = Children.toArray(children);
  const out: ReactNode[] = [];
  items.forEach((item, i) => {
    const script = typeof item === 'string' ? scriptOf(item) : null;
    if (typeof item !== 'string' || !script) {
      out.push(phraseNode(item));
      return;
    }
    const prev = items[i - 1];
    const next = items[i + 1];
    const prevText = isInlineElement(prev) ? textOf(prev) : '';
    const { lead, inner } = phraseInner(item, script, [...prevText].pop() ?? '');
    const wbr = (at: string): ReactNode => <wbr key={at} aria-hidden="true" />;
    let head: ReactNode = null;
    if (lead) {
      head = (
        <span key="g-join" className="g-nobr">
          {holdTail(out.pop())}
          {lead}
        </span>
      );
    } else if (prevText && breaksBetween(prevText, item)) {
      head = wbr('g-wbr-head');
    }
    const tail = isInlineElement(next) && breaksBetween(item, textOf(next)) ? wbr('g-wbr-tail') : null;
    out.push(
      <span key={`g-phrase-${String(i)}`} className="g-phrase">
        {head}
        {inner}
        {tail}
      </span>,
    );
  });
  return out;
}

/**
 * ReactNode の中の文字列を文節で折れるようにする。
 *
 * 素の HTML 要素（td や strong など）の中には潜るが、コンポーネントの中には潜らない。
 * コンポーネントは自分の描き方を持っているので、外から書き換えると壊しうる。
 */
export function phraseNode(node: ReactNode): ReactNode {
  if (typeof node === 'string') return phraseText(node);
  if (Array.isArray(node)) return phraseChildren(node);
  if (!isValidElement<{ children?: ReactNode; dangerouslySetInnerHTML?: unknown }>(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode; dangerouslySetInnerHTML?: unknown }>;
  const { children, dangerouslySetInnerHTML } = element.props;
  if (children === undefined || dangerouslySetInnerHTML !== undefined) return element;
  const isFragment = element.type === Fragment;
  const isHost = typeof element.type === 'string' && !SKIP.has(element.type);
  if (!isFragment && !isHost) return element;
  return cloneElement(element, undefined, phraseNode(children));
}

/** 現在の折り返し方に従って ReactNode を変換する関数を返す。gassan の各部品が使う。 */
export function usePhrase(): (node: ReactNode) => ReactNode {
  const mode = useContext(LineBreakContext);
  return useCallback((node: ReactNode) => (mode === 'phrase' ? phraseNode(node) : node), [mode]);
}

export interface PhraseProps {
  children?: ReactNode;
}

/**
 * 自分の UI（gassan の外のボタンや見出し）にも同じ折り返しを効かせる。
 *
 *   <button><Phrase>プロフィールを編集</Phrase></button>
 *
 * `GassanProvider` の `lineBreak="browser"` の下では何もしない。
 * 日本語は文節、中国語は語の切れ目、韓国語は空白でだけ折る。英語・タイ語などはそのまま返す。
 */
export function Phrase({ children }: PhraseProps): ReactNode {
  const phrase = usePhrase();
  return <>{phrase(children)}</>;
}
