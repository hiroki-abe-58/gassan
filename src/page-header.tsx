import type { ReactNode } from 'react';

import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Breadcrumbs, type BreadcrumbItem } from './navigation';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface PageHeaderProps extends DataAttributes {
  /** ページの見出し。 */
  title: ReactNode;
  /** 見出しの下の補足（このページで何ができるか）。 */
  description?: ReactNode;
  /** 見出しの上の道筋（最後が今のページ）。 */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** 見出しの横に置く操作。主な操作は 1 つにする。器が狭いときは見出しの下へ回る。 */
  actions?: ReactNode;
  /** 見出しの段。既定 1（ページの見出し）。ページの中の区切りに使うなら 2。 */
  headingLevel?: 1 | 2;
  /** 見出しの下に置くもの（タブ・絞り込みなど）。 */
  children?: ReactNode;
  className?: string;
}

/**
 * ページの見出しの帯。U-25。
 *
 * 道筋（パンくず）・見出し・補足・操作を、この順で並べる（読み上げの順も同じ）。見出しの大きさと余白で示し、
 * 枠や地の色で囲まない（§5 の 21）。操作は器が広いときは見出しの右、狭いときは見出しの下へ折り返す（器の幅で決まる）。
 * ランドマークにはしない（main の中に置く部品なので、header 要素にすると置き場所によっては banner になる）。
 */
export function PageHeader({ title, description, breadcrumbs, actions, headingLevel = 1, children, className, ...rest }: PageHeaderProps): ReactNode {
  const phrase = usePhrase();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div {...domPassthrough(rest, 'PageHeader')} className={cx('g-page-header', className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="g-page-header-main">
        <div className="g-page-header-heading">
          <Heading className="g-page-header-title">{phrase(title)}</Heading>
          {description ? <p className="g-page-header-description">{phrase(description)}</p> : null}
        </div>
        {actions ? <div className="g-page-header-actions">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
