import { useId, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Avatar } from '../display';
import { ModalClose, ModalControls, ModalHeader } from '../header';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { ScrollPane } from '../internal/scrollbars';
import { Menu, type MenuEntry } from '../overlay';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { appLabels, commonLabels } from './labels';
import { useCloseWhenWide } from './page-parts';
import { Brand, SiteLink, useTemplateLabels } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 左の帯を出す器の幅。templates.css の T10 の @container と同じ値にする。 */
const WIDE = 960;

export interface AppNavItem {
  label: ReactNode;
  href: string;
  /** 印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
  /** 名前の後ろの印（件数の Badge など）。 */
  badge?: ReactNode;
}

export interface AppNavSection {
  /** まとまりの名前（「設定」）。無ければ見出しを出さない。 */
  title?: string;
  items: readonly AppNavItem[];
}

export interface AppAccount {
  name: string;
  /** アバターの画像。無ければ名前の頭文字。 */
  avatarSrc?: string;
  /** アカウントのメニュー（プロフィール・設定・ログアウトなど）。 */
  menu: readonly MenuEntry[];
}

export interface AppShellProps extends DataAttributes {
  /** 案内（左の帯と、狭い器で開く面の中身）。 */
  nav: readonly AppNavSection[];
  /** いまのページの行き先。同じ行き先の案内に aria-current="page" を付ける。 */
  current?: string;
  /** 上の帯の右に置く操作（検索・通知など）。 */
  actions?: ReactNode;
  /** アカウントのメニューの起点（上の帯の右端）。 */
  account?: AppAccount;
  /** 左の帯の下端に置くもの（プランの残り・ヘルプへのリンクなど）。 */
  sidebarFooter?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** 案内の一覧。左の帯と、狭い器で開く面の両方が使う。 */
function AppNav({ nav, current, label, onNavigate }: { nav: readonly AppNavSection[]; current?: string; label: string; onNavigate?: () => void }): ReactNode {
  const phrase = usePhrase();
  const base = useId();
  return (
    <nav className="g-app-nav" aria-label={label}>
      {nav.map((section, index) => {
        const titleId = `${base}-${String(index)}`;
        return (
          <div key={section.title ?? `g-section-${String(index)}`} className="g-app-nav-section">
            {section.title ? (
              <p id={titleId} className="g-app-nav-title">
                {phrase(section.title)}
              </p>
            ) : null}
            <ul className="g-app-nav-list" aria-labelledby={section.title ? titleId : undefined}>
              {section.items.map((item) => (
                <li key={item.href}>
                  {/* 押したら、狭い器で開いている面を閉じる（行き先へ移ったのに面が残らないように） */}
                  <SiteLink href={item.href} className="g-app-nav-link" aria-current={item.href === current ? 'page' : undefined} onClick={onNavigate}>
                    {item.icon ? <span className="g-app-nav-icon">{item.icon}</span> : null}
                    <span className="g-app-nav-label">{phrase(item.label)}</span>
                    {item.badge ? <span className="g-app-nav-badge">{item.badge}</span> : null}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

const APP_SHELL_LABELS = { common: commonLabels, app: appLabels } as const;

/**
 * ログインした後のアプリの枠。P-12。
 *
 * 本文へ飛ぶリンク・左の案内の帯（ロゴ・まとまりごとの案内・下端の補足）・上の帯（操作・アカウントのメニュー）・main。
 * 器が狭いときは左の帯を畳み、上の帯の「メニュー」から横の面（Modal の placement="start"。C-13）で案内を開く。
 * 面の中はフォーカスが閉じ込められ、Esc か外を押すと閉じて「メニュー」へ戻る。案内のリンクを押しても閉じる。
 * いまのページは地の色と太字で示し、左の太い線では示さない（§5 の 21）。
 */
export function AppShell({ nav, current, actions, account, sidebarFooter, children, className, ...rest }: AppShellProps): ReactNode {
  const labels = useTemplateLabels(APP_SHELL_LABELS);
  const phrase = usePhrase();
  const base = useId();
  const mainId = `${base}-main`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // 開いたまま器が広くなったら閉じる（左の帯と面に、同じ案内が 2 つ出ないように）
  useCloseWhenWide(rootRef, open, setOpen, WIDE);

  return (
    <div {...domPassthrough(rest, 'AppShell')} ref={rootRef} className={cx('g-page g-app', className)}>
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
      <div className="g-app-frame">
        <ScrollPane className="g-app-sidebar" viewportClassName="g-app-sidebar-scroll">
          <div className="g-app-brand">
            <Brand />
          </div>
          <AppNav nav={nav} current={current} label={labels.app.nav} />
          {sidebarFooter ? <div className="g-app-sidebar-footer">{sidebarFooter}</div> : null}
        </ScrollPane>
        <div className="g-app-body">
          <header className="g-app-topbar">
            <button type="button" className="g-app-menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
              <Icon name="menu" />
              <span className="g-sr-only">{labels.app.menu}</span>
            </button>
            <div className="g-app-topbar-brand">
              <Brand />
            </div>
            {actions ? <div className="g-app-actions">{actions}</div> : null}
            {account ? (
              <Menu
                align="end"
                items={account.menu}
                trigger={
                  <button type="button" className="g-app-account" aria-label={labels.app.account(account.name)}>
                    <span aria-hidden="true" className="g-app-account-avatar">
                      <Avatar name={account.name} src={account.avatarSrc} size="sm" />
                    </span>
                    <span className="g-app-account-name">{account.name}</span>
                    <Icon name="chevronDown" className="g-app-account-chevron" />
                  </button>
                }
              />
            ) : null}
          </header>
          <main id={mainId} className="g-app-main" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <ModalRoot open={open} onOpenChange={setOpen} kind="view" placement="start" size="sm" label={labels.app.nav}>
        <ModalHeader>
          <ModalControls start={<Brand />} end={<ModalClose />} />
        </ModalHeader>
        <ModalBody>
          <AppNav nav={nav} current={current} label={labels.app.nav} onNavigate={() => setOpen(false)} />
          {sidebarFooter ? <div className="g-app-sidebar-footer">{sidebarFooter}</div> : null}
        </ModalBody>
      </ModalRoot>
    </div>
  );
}
