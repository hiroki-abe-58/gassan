import type { CSSProperties, ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { useT } from '../i18n';

/* -------------------------------------------------------------------------- */
/* Do / Don't                                                                 */
/* -------------------------------------------------------------------------- */

export type GuidelineTone = 'do' | 'dont' | 'caution';

export function Guidelines({ children }: { children: ReactNode }): ReactNode {
  return <div className="s-guidelines">{children}</div>;
}

/**
 * 推奨と非推奨の見本。図は飾り（aria-hidden）で、意味はキャプションが運ぶ。
 * 色だけで良し悪しを伝えないよう、ラベルとアイコンを必ず添える。
 */
export function Guideline({
  tone,
  visual,
  children,
}: {
  tone: GuidelineTone;
  visual: ReactNode;
  children: ReactNode;
}): ReactNode {
  const t = useT();
  return (
    <figure className="s-guideline" data-tone={tone}>
      <div className="s-guideline-visual" aria-hidden="true">
        {visual}
      </div>
      <figcaption>
        <p className="s-guideline-label">
          <span className="s-guideline-icon" aria-hidden="true">
            {tone === 'do' ? '✓' : tone === 'dont' ? '✕' : '!'}
          </span>
          <Phrase>{t.common.guideline[tone]}</Phrase>
        </p>
        <div className="s-guideline-text">
          <Phrase>{children}</Phrase>
        </div>
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* 見本図                                                                     */
/* -------------------------------------------------------------------------- */

/** 背景の「アプリ」とスクリム。中にパネルを置く。 */
export function MockScreen({
  scrim = 0.32,
  blur = 0,
  align = 'center',
  children,
}: {
  scrim?: number;
  blur?: number;
  /** パネルの置き場所。start / end は横の端から出る面（C-13）。 */
  align?: 'center' | 'top' | 'bottom' | 'start' | 'end';
  children?: ReactNode;
}): ReactNode {
  const t = useT();
  const style = { '--s-mock-scrim': scrim, '--s-mock-blur': `${String(blur)}px` } as CSSProperties;
  return (
    <div className="s-mock-screen" style={style} data-align={align}>
      <div className="s-mock-app">
        <span className="s-mock-appbar" />
        <span className="s-mock-heading">
          <Phrase>{t.common.mock.heading}</Phrase>
        </span>
        <span className="s-mock-grid">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="s-mock-scrim" />
      <div className="s-mock-stage">{children}</div>
    </div>
  );
}

export interface MockButtonSpec {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'gated' | 'disabled';
  /** フォーカスの輪を描く。輪はボタン自身に付けるので、ラベルの長さ（言語）が変わってもずれない。 */
  focused?: boolean;
}

/** 見本のパネル。 */
export function MockPanel({
  title,
  lines = 2,
  buttons = [],
  stack = false,
  width = 64,
  sheet = false,
  side,
  children,
}: {
  title?: ReactNode;
  lines?: number;
  buttons?: readonly MockButtonSpec[];
  /** ボタンを縦に積む（狭幅の見本） */
  stack?: boolean;
  width?: number;
  sheet?: boolean;
  /** 横の端から出る面（全高で、内側の角だけ丸い）。 */
  side?: 'start' | 'end';
  children?: ReactNode;
}): ReactNode {
  const style = { '--s-mock-w': `${String(width)}%` } as CSSProperties;
  // 見本のパネルの中の文字（題・補足・ボタン）も、本物と同じく文節で折る。
  return (
    <Phrase>
      <div className="s-mock-panel" style={style} data-sheet={sheet ? '' : undefined} data-side={side}>
        {sheet ? <span className="s-mock-grip" /> : null}
        {title ? <span className="s-mock-title">{title}</span> : null}
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="s-mock-line" />
        ))}
        {children}
        {buttons.length > 0 ? (
          <span className="s-mock-footer" data-stack={stack ? '' : undefined}>
            {buttons.map((button, i) => (
              <span key={i} className="s-mock-btn" data-variant={button.variant ?? 'secondary'} data-focused={button.focused ? '' : undefined}>
                {button.label}
              </span>
            ))}
          </span>
        ) : null}
      </div>
    </Phrase>
  );
}
