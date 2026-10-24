import type { ReactNode } from 'react';

import { CopyButton } from './button';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface CodeBlockProps extends DataAttributes {
  /** コード。写すボタンはこの文字列を写す。 */
  code: string;
  /** 見せる中身。色分けした要素（Shiki・Prism などの出力）を渡す。無ければ code をそのまま出す。 */
  children?: ReactNode;
  /** 言語の名前（'tsx'・'bash' など）。title が無ければ上の帯の見出しにする。 */
  language?: string;
  /** 上の帯の見出し（ファイル名など）。言語より先に出す。見出しはコードの名前にもなる（「〜 のコード」）。 */
  title?: string;
  /** 写すボタンを出す。既定 true。 */
  copy?: boolean;
  /** コードの中の文（コメントなど）の言語。ページの言語と違うときに渡すと、読み上げの発音が合う。 */
  textLang?: string;
  className?: string;
}

/**
 * コードの塊。U-30。
 *
 * 上の帯に見出し（ファイル名か言語）と写すボタン（U-03）を置く。コードは折り返さずに横へ送り、送れる器は Tab で止まる
 * （矢印キーで送れる。名前は「〜 のコード」）。色分けはしない（children に色分けした要素を渡す）。
 * コードには文節の折り返しを掛けない（見出しにだけ掛ける）。
 */
export function CodeBlock({ code, children, language, title, copy = true, textLang, className, ...rest }: CodeBlockProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const heading = title ?? language;
  return (
    <div {...domPassthrough(rest, 'CodeBlock')} className={cx('g-codeblock', className)}>
      {heading || copy ? (
        <div className="g-codeblock-bar">
          {heading ? <span className="g-codeblock-title">{phrase(heading)}</span> : null}
          {copy ? <CopyButton value={code} size="sm" label={labels.copyCode} className="g-codeblock-copy" /> : null}
        </div>
      ) : null}
      <pre className="g-codeblock-body" tabIndex={0} role="group" aria-label={heading ? labels.codeOf(heading) : labels.code} lang={textLang}>
        <code>{children ?? code}</code>
      </pre>
    </div>
  );
}
