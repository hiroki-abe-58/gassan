import type { CSSProperties, ReactNode } from 'react';

import { GassanProvider, Phrase } from '@genelab/gassan';

/**
 * 文節の折り返しを、同じ幅で左右に並べて比べる。
 * 左右で同じ見本を描き、左だけ GassanProvider の lineBreak="browser" の下に置く。
 * width は見本の器の幅（em）。
 */
export function BreakCompare({ width, children }: { width: number; children: ReactNode }): ReactNode {
  return (
    <div className="s-compare" style={{ '--s-compare-width': `${String(width)}em` } as CSSProperties}>
      <figure className="s-compare-col" data-mode="browser">
        <figcaption>
          <span className="s-compare-badge" data-mode="browser">
            ブラウザ任せ
          </span>
          文字単位で折れる
        </figcaption>
        <GassanProvider lineBreak="browser">{children}</GassanProvider>
      </figure>
      <figure className="s-compare-col" data-mode="phrase">
        <figcaption>
          <span className="s-compare-badge" data-mode="phrase">
            gassan
          </span>
          文節の切れ目で折れる
        </figcaption>
        {children}
      </figure>
    </div>
  );
}

export interface SampleButton {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
}

/** 器に入れたボタンの見本。見た目は gassan の .g-btn そのもの。 */
export function ButtonSamples({ buttons }: { buttons: readonly SampleButton[] }): ReactNode {
  return (
    <div className="s-sample-box s-sample-buttons">
      {buttons.map((button) => (
        // 見本なので本物のボタンにはしない（押せないのに押せると読ませない）
        <span key={button.label} className="g-btn" data-variant={button.variant}>
          <span className="g-btn-label">
            <Phrase>{button.label}</Phrase>
          </span>
        </span>
      ))}
    </div>
  );
}
