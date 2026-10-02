import { useId, useState, type ReactNode } from 'react';

import { CodeBlock } from './Code';

export interface ExampleProps {
  /** デモの名前。図のキャプションになる。 */
  title: string;
  /** 何を見てほしいか。1〜2 文。 */
  description?: ReactNode;
  /** 表示するコード。デモファイルを `?raw` で読んだものを渡す（見本とコードをずらさない）。 */
  code: string;
  children: ReactNode;
}

/**
 * 実際に動くデモと、そのソース。
 * ソースはデモのファイルそのものなので、ここに写っているコードがそのまま動いている。
 */
export function Example({ title, description, code, children }: ExampleProps): ReactNode {
  const [open, setOpen] = useState(false);
  const codeId = useId();
  return (
    <figure className="s-example">
      <div className="s-example-stage">{children}</div>
      <figcaption className="s-example-bar">
        <div className="s-example-text">
          <span className="s-example-title">{title}</span>
          {description ? <span className="s-example-desc">{description}</span> : null}
        </div>
        <button
          type="button"
          className="s-btn s-btn-text"
          aria-expanded={open}
          aria-controls={codeId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'コードを閉じる' : 'コードを見る'}
        </button>
      </figcaption>
      <div id={codeId} hidden={!open} className="s-example-code">
        {open ? <CodeBlock code={code.trimEnd()} lang="tsx" /> : null}
      </div>
    </figure>
  );
}
