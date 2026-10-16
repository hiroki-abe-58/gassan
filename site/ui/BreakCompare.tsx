import type { CSSProperties, ReactNode } from 'react';

import { GassanProvider, Phrase } from '@genelab/gassan';

import { useT } from '../i18n';

/**
 * 文節の折り返しを、同じ幅で左右に並べて比べる。
 * 左右で同じ見本を描き、左だけ GassanProvider の lineBreak="browser" の下に置く。
 * width は見本の器の幅（em）。lang は見本の言語（サイトの言語ではなく、見本の文字列の言語）。
 */
export function BreakCompare({
  width,
  lang,
  browserNote,
  phraseNote,
  children,
}: {
  width: number;
  lang?: string;
  /** 左右の見出しの補足。省略時は日本語の見本の説明。 */
  browserNote?: string;
  phraseNote?: string;
  children: ReactNode;
}): ReactNode {
  const t = useT().common.breakCompare;
  return (
    <div className="s-compare" style={{ '--s-compare-width': `${String(width)}em` } as CSSProperties}>
      <figure className="s-compare-col" data-mode="browser">
        <figcaption>
          <span className="s-compare-badge" data-mode="browser">
            {t.browser}
          </span>
          {browserNote ?? t.browserNote}
        </figcaption>
        <div lang={lang}>
          <GassanProvider lineBreak="browser">{children}</GassanProvider>
        </div>
      </figure>
      <figure className="s-compare-col" data-mode="phrase">
        <figcaption>
          <span className="s-compare-badge" data-mode="phrase">
            gassan
          </span>
          {phraseNote ?? t.phraseNote}
        </figcaption>
        <div lang={lang}>{children}</div>
      </figure>
    </div>
  );
}

export interface SampleButton {
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  /** 見本の言語。言語の違う見本を並べるときに付ける。 */
  lang?: string;
}

/** 器に入れたボタンの見本。見た目は gassan の .g-btn そのもの。 */
export function ButtonSamples({ buttons }: { buttons: readonly SampleButton[] }): ReactNode {
  return (
    <div className="s-sample-box s-sample-buttons">
      {buttons.map((button) => (
        // 見本なので本物のボタンにはしない（押せないのに押せると読ませない）
        <span key={button.label} className="g-btn" data-variant={button.variant} lang={button.lang}>
          <span className="g-btn-label">
            <Phrase>{button.label}</Phrase>
          </span>
        </span>
      ))}
    </div>
  );
}
