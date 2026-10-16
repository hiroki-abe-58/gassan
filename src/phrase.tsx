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

import { scriptOf, splitPhrases } from './internal/phrase';

/**
 * 日本語・中国語・韓国語の折り返し方。W-01〜W-05。
 *
 *   'phrase'  … 文節（中国語は語、韓国語は空白）の切れ目でだけ改行する（既定）
 *   'browser' … ブラウザに任せる（文字単位で折れる）
 */
export type LineBreakMode = 'phrase' | 'browser';

export const LineBreakContext = createContext<LineBreakMode>('phrase');

/** 中身の文字列に手を出さない要素。コードや入力欄の値は、見たままの文字列でなければならない。 */
const SKIP = new Set(['code', 'pre', 'kbd', 'samp', 'textarea', 'script', 'style', 'svg', 'math']);

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
function phraseText(text: string, key?: string): ReactNode {
  if (!scriptOf(text)) return text;
  const parts = splitPhrases(text);
  return (
    <span key={key} className="g-phrase">
      {parts.map((part, i) =>
        i === 0 ? (
          part
        ) : (
          <Fragment key={i}>
            <wbr aria-hidden="true" />
            {part}
          </Fragment>
        ),
      )}
    </span>
  );
}

/**
 * ReactNode の中の文字列を文節で折れるようにする。
 *
 * 素の HTML 要素（td や strong など）の中には潜るが、コンポーネントの中には潜らない。
 * コンポーネントは自分の描き方を持っているので、外から書き換えると壊しうる。
 */
export function phraseNode(node: ReactNode): ReactNode {
  if (typeof node === 'string') return phraseText(node);
  if (Array.isArray(node)) return Children.map(node, (child) => phraseNode(child as ReactNode));
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
