import type { CSSProperties, ReactNode } from 'react';

/* -------------------------------------------------------------------------- */
/* Do / Don't                                                                 */
/* -------------------------------------------------------------------------- */

export type GuidelineTone = 'do' | 'dont' | 'caution';

const LABEL: Record<GuidelineTone, string> = { do: 'Do', dont: "Don't", caution: 'Caution' };

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
          {LABEL[tone]}
        </p>
        <div className="s-guideline-text">{children}</div>
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
  align?: 'center' | 'top' | 'bottom';
  children?: ReactNode;
}): ReactNode {
  const style = { '--s-mock-scrim': scrim, '--s-mock-blur': `${String(blur)}px` } as CSSProperties;
  return (
    <div className="s-mock-screen" style={style} data-align={align}>
      <div className="s-mock-app">
        <span className="s-mock-appbar" />
        <span className="s-mock-heading">今月の売上</span>
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
}

/** 見本のパネル。 */
export function MockPanel({
  title,
  lines = 2,
  buttons = [],
  stack = false,
  width = 64,
  sheet = false,
  children,
}: {
  title?: ReactNode;
  lines?: number;
  buttons?: readonly MockButtonSpec[];
  /** ボタンを縦に積む（狭幅の見本） */
  stack?: boolean;
  width?: number;
  sheet?: boolean;
  children?: ReactNode;
}): ReactNode {
  const style = { '--s-mock-w': `${String(width)}%` } as CSSProperties;
  return (
    <div className="s-mock-panel" style={style} data-sheet={sheet ? '' : undefined}>
      {sheet ? <span className="s-mock-grip" /> : null}
      {title ? <span className="s-mock-title">{title}</span> : null}
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="s-mock-line" />
      ))}
      {children}
      {buttons.length > 0 ? (
        <span className="s-mock-footer" data-stack={stack ? '' : undefined}>
          {buttons.map((button, i) => (
            <span key={i} className="s-mock-btn" data-variant={button.variant ?? 'secondary'}>
              {button.label}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}
