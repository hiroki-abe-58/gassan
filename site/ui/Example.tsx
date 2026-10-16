import { useId, useState, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { useT, type Messages } from '../i18n';
import { fillDemoText, type DemoText } from '../i18n/demo-text';
import { CodeBlock } from './Code';

export interface ExampleProps {
  /** デモの名前。図のキャプションになる。 */
  title: string;
  /** 何を見てほしいか。1〜2 文。 */
  description?: ReactNode;
  /** 表示するコード。デモファイルを `?raw` で読んだものを渡す（見本とコードをずらさない）。 */
  code: string;
  /** デモの文言のキー（useDemoText に渡したもの）。渡すと、表示するコードの `t.xxx` がいまの言語の文字列に戻る。 */
  demo?: keyof Messages['demos'];
  children: ReactNode;
}

/**
 * 実際に動くデモと、そのソース。
 * ソースはデモのファイルそのものなので、ここに写っているコードがそのまま動いている。
 */
export function Example({ title, description, code, demo, children }: ExampleProps): ReactNode {
  const t = useT();
  const [open, setOpen] = useState(false);
  const codeId = useId();
  const source = demo ? fillDemoText(code, t.demos[demo] as DemoText) : code;
  return (
    <figure className="s-example">
      <div className="s-example-stage">{children}</div>
      <figcaption className="s-example-bar">
        <div className="s-example-text">
          <span className="s-example-title">
            <Phrase>{title}</Phrase>
          </span>
          {description ? (
            <span className="s-example-desc">
              <Phrase>{description}</Phrase>
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="s-btn s-btn-text"
          aria-expanded={open}
          aria-controls={codeId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? t.common.example.hide : t.common.example.show}
        </button>
      </figcaption>
      <div id={codeId} hidden={!open} className="s-example-code">
        {open ? <CodeBlock code={source.trimEnd()} lang="tsx" /> : null}
      </div>
    </figure>
  );
}
