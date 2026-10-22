import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { useT } from '../i18n';
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
  const t = useT();
  return (
    <header className="s-page-header">
      <p className="s-eyebrow">{eyebrow}</p>
      {/* サイト自身の見出しにも gassan の文節折り返し（W-05）を使う */}
      <h1 id="page-title" tabIndex={-1}>
        <Phrase>{title}</Phrase>
      </h1>
      {lead ? (
        <p className="s-lead">
          <Phrase>{lead}</Phrase>
        </p>
      ) : null}
      {ids && ids.length > 0 ? <SpecChips ids={ids} label={t.common.specChips} /> : null}
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
      <h2 id={id ? `${id}-title` : undefined}>
        <Phrase>{title}</Phrase>
      </h2>
      {intro ? (
        <p className="s-section-intro">
          <Phrase>{intro}</Phrase>
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** 本文の段落群。長文の行長と行間をそろえる。段落の中の日本語も文節で折る（W-05）。 */
export function Prose({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="s-prose">
      <Phrase>{children}</Phrase>
    </div>
  );
}

/**
 * 強調したい 1 文を大きく置く。
 *
 * 箱で囲まない（コールアウト・Admonition・左の太い線は使わない）。文字を一段大きく太くし、
 * 上の区切り線と前後の余白で本文から切り離す。注意は色の付いた見出し語で伝える（線や塗りに頼らない）。
 */
export function KeyPoint({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'caution' }): ReactNode {
  const t = useT().common.keyPoint;
  return (
    <div className="s-keypoint" data-tone={tone}>
      {tone === 'caution' ? <p className="s-keypoint-label">{t.caution}</p> : null}
      <Phrase>{children}</Phrase>
    </div>
  );
}

/** 数値の帯。 */
export function Stats({ items }: { items: readonly { value: ReactNode; label: ReactNode }[] }): ReactNode {
  return (
    <dl className="s-stats">
      {items.map((item, i) => (
        <div key={i} className="s-stat">
          <dt>
            <Phrase>{item.label}</Phrase>
          </dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
