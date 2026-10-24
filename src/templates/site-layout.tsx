import { useId, useState, type ReactNode } from 'react';

import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { Brand, PageFooter, SiteButtonLink, SiteLink, useSite } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface SiteLayoutProps extends DataAttributes {
  children: ReactNode;
  /** いまのページの行き先。ヘッダの案内の同じ行き先に aria-current="page" を付ける。 */
  current?: string;
  /** ヘッダの右の操作。既定は links の signIn と signUp があれば「ログイン」「アカウントを作る」。 */
  actions?: ReactNode;
  className?: string;
}

/**
 * 公開ページ（料金・よくある質問・お問い合わせ・規約など）の外枠。P-01。
 *
 * 本文へ飛ぶリンク・ヘッダ（ロゴ・案内・ログイン）・main・フッタ（リンクの列・規約・著作権）。
 * 案内と列は SiteProvider の nav / footer から引く。器が狭いときは、案内を「メニュー」のボタンで開け閉めする
 * （サイトの案内は操作のメニューではないので、role="menu" にせず、開け閉めのボタンとリンクの一覧にする）。
 */
export function SiteLayout({ children, current, actions, className, ...rest }: SiteLayoutProps): ReactNode {
  const { labels, links, nav, footer } = useSite();
  const phrase = usePhrase();
  const base = useId();
  const mainId = `${base}-main`;
  const navId = `${base}-nav`;
  const actionsId = `${base}-actions`;
  const [open, setOpen] = useState(false);

  const defaultActions =
    links.signIn || links.signUp ? (
      <>
        {links.signIn ? (
          <SiteButtonLink href={links.signIn} variant="tertiary">
            {labels.common.signIn}
          </SiteButtonLink>
        ) : null}
        {links.signUp ? (
          <SiteButtonLink href={links.signUp} variant="primary">
            {labels.common.signUp}
          </SiteButtonLink>
        ) : null}
      </>
    ) : null;
  const headerActions = actions ?? defaultActions;

  return (
    <div {...domPassthrough(rest, 'SiteLayout')} className={cx('g-page g-site', className)}>
      <a
        className="g-skip"
        href={`#${mainId}`}
        onClick={(event) => {
          // 飛び先の main にフォーカスを渡す（ページ内リンクの既定では、スクロールだけのブラウザがある）。
          const main = document.getElementById(mainId);
          if (!main) return;
          event.preventDefault();
          main.focus();
        }}
      >
        {phrase(labels.common.skipToContent)}
      </a>
      <header className="g-site-header">
        {/* 器が狭いときは、案内と操作を「メニュー」のボタンの下に畳む（開いているかは data-open） */}
        <div className="g-site-bar" data-open={open ? '' : undefined}>
          <Brand />
          {nav && nav.length > 0 ? (
            <nav id={navId} className="g-site-nav" aria-label={labels.site.nav}>
              <ul className="g-site-nav-list">
                {nav.map((item) => (
                  <li key={item.href}>
                    <SiteLink href={item.href} className="g-site-nav-link" aria-current={item.href === current ? 'page' : undefined}>
                      {phrase(item.label)}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          {headerActions ? (
            <div id={actionsId} className="g-site-actions">
              {headerActions}
            </div>
          ) : null}
          {nav && nav.length > 0 ? (
            <button
              type="button"
              className="g-site-menu"
              aria-expanded={open}
              aria-controls={headerActions ? `${navId} ${actionsId}` : navId}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'close' : 'menu'} />
              <span>{phrase(labels.site.menu)}</span>
            </button>
          ) : null}
        </div>
      </header>
      <main id={mainId} className="g-site-main" tabIndex={-1}>
        {children}
      </main>
      <PageFooter className="g-site-footer">
        {footer && footer.length > 0 ? (
          <nav className="g-site-columns" aria-label={labels.site.footerNav}>
            {footer.map((column) => (
              <div key={column.title} className="g-site-column">
                <p className="g-site-column-title">{phrase(column.title)}</p>
                <ul>
                  {column.links.map((item) => (
                    <li key={item.href}>
                      <SiteLink href={item.href}>{phrase(item.label)}</SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
      </PageFooter>
    </div>
  );
}

/**
 * 公開ページの中身を、layout が true なら SiteLayout で包む。false なら中身だけ（自分の外枠の中に置く）。
 */
export function WithSiteLayout({
  layout,
  current,
  className,
  data,
  children,
}: {
  layout: boolean;
  current?: string;
  className?: string;
  data: DataAttributes;
  children: ReactNode;
}): ReactNode {
  if (layout) {
    return (
      <SiteLayout {...data} current={current} className={className}>
        {children}
      </SiteLayout>
    );
  }
  return (
    <div {...data} className={cx('g-site-content', className)}>
      {children}
    </div>
  );
}
