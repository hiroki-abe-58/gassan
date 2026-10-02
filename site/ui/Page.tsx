import type { ReactNode } from 'react';

import { SpecChips } from './Spec';

export interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** このページが扱う仕様の ID。見出しの下にチップで並べる。 */
  ids?: readonly string[];
}

/**
 * ページの見出し。h1 は 1 ページに 1 つで、ここだけが出す。
 * ページ遷移のたびにフォーカスをここへ移すので tabIndex={-1} を持つ。
 */
export function PageHeader({ eyebrow, title, lead, ids }: PageHeaderProps): ReactNode {
  return (
    <header className="s-page-header">
      <p className="s-eyebrow">{eyebrow}</p>
      <h1 id="page-title" tabIndex={-1}>
        {title}
      </h1>
      {lead ? <p className="s-lead">{lead}</p> : null}
      {ids && ids.length > 0 ? <SpecChips ids={ids} label="このページが扱う仕様" /> : null}
    </header>
  );
}

export interface SectionProps {
  title: ReactNode;
  children: ReactNode;
  /** 見出しの下に添える 1〜2 文。 */
  intro?: ReactNode;
  id?: string;
}

export function Section({ title, children, intro, id }: SectionProps): ReactNode {
  return (
    <section className="s-section" aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
      {intro ? <p className="s-section-intro">{intro}</p> : null}
      {children}
    </section>
  );
}

/** 本文の段落群。長文の行長と行間をそろえる。 */
export function Prose({ children }: { children: ReactNode }): ReactNode {
  return <div className="s-prose">{children}</div>;
}

/** 強調したい 1 文を大きく置く。 */
export function Callout({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }): ReactNode {
  return (
    <div className="s-callout" data-tone={tone}>
      {children}
    </div>
  );
}

/** 数値の帯。 */
export function Stats({ items }: { items: readonly { value: ReactNode; label: ReactNode }[] }): ReactNode {
  return (
    <dl className="s-stats">
      {items.map((item, i) => (
        <div key={i} className="s-stat">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
