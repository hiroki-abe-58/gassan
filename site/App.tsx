import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { CommandPalette, GassanProvider, Modal, ModalHost, Phrase, ToastHost, type CommandItem } from '@genelab/gassan';

import { data } from './data';
import { DEFAULT_LANG, loadLang, useI18n } from './i18n';
import { TemplatePreview } from './previews/TemplatePreview';
import { PAGES, SECTIONS, neighbours, resolve } from './routes';
import { to, useRoute } from './router';
import { LangPicker } from './ui/LangPicker';
import { md } from './ui/Markdown';
import { ThemePicker } from './ui/ThemePicker';
import { useToastPosition } from './ui/toaster';

export function Logo(): ReactNode {
  // 4 枚の層。いちばん上（層4: Flow）だけが gassan の仕事、という構図。
  return (
    <svg className="s-logo" viewBox="0 0 32 32" aria-hidden="true">
      {[18, 13, 8, 3].map((y, i) => (
        <path
          key={y}
          d={`M16 ${String(y)} L28 ${String(y + 6)} L16 ${String(y + 12)} L4 ${String(y + 6)} Z`}
          className={i === 3 ? 's-logo-top' : 's-logo-layer'}
          style={{ opacity: i === 3 ? 1 : 0.22 + i * 0.16 }}
        />
      ))}
    </svg>
  );
}

function NavList({ current }: { current: string }): ReactNode {
  const { t } = useI18n();
  return (
    <>
      {SECTIONS.map((section) => {
        const pages = PAGES.filter((page) => page.section === section && page.path !== '/');
        return (
          <div key={section} className="s-nav-group">
            <p className="s-nav-label" id={`nav-${section}`}>
              {t.nav.sections[section]}
            </p>
            <ul aria-labelledby={`nav-${section}`}>
              {pages.map((page) => (
                <li key={page.path}>
                  <a
                    className="s-nav-item"
                    href={to(page.path)}
                    aria-current={page.path === current ? 'page' : undefined}
                  >
                    <Phrase>{t.nav.pages[page.key]}</Phrase>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export function App(): ReactNode {
  const route = useRoute();
  const { lang, t } = useI18n();
  const { page, rest } = resolve(route.segments);
  const [menuOpen, setMenuOpen] = useState(false);
  /** メニューが閉じた後のフォーカス先。ページ遷移で閉じたときだけ新しいページの見出しにする（K-06）。 */
  const menuFinalFocus = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const title = t.nav.pages[page.key];
  /** トーストの出す場所。トーストのページの「出す場所」で変わる。 */
  const toastPosition = useToastPosition();
  /** テンプレートの見本（#/preview/<name>）なら、その名前。 */
  const previewName = route.segments[0] === 'preview' ? (route.segments[1] ?? '') : null;
  const [searchOpen, setSearchOpen] = useState(false);
  /** 検索で選んでページが変わったら、閉じた後のフォーカスを新しいページの見出しへ送る（K-06）。 */
  const searchMoved = useRef(false);
  const searchFinalFocus = useMemo(
    () => ({
      get current(): HTMLElement | null {
        return searchMoved.current ? document.getElementById('page-title') : null;
      },
    }),
    [],
  );
  /** サイトの検索の候補。節ごとのまとまりで、ページのアドレス（英語）でも当たる。 */
  const searchItems = useMemo<CommandItem[]>(
    () =>
      PAGES.map((item) => ({
        id: item.path,
        label: t.nav.pages[item.key],
        group: t.nav.sections[item.section],
        keywords: [item.path, item.key],
        href: to(item.path),
        onSelect: () => {
          searchMoved.current = true;
        },
      })),
    [t],
  );
  const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

  // URL の言語が変わったら、その言語の文言を読む。読み終えるまでは前の言語で描く。
  useEffect(() => {
    void loadLang(route.lang);
  }, [route.lang]);

  useEffect(() => {
    if (previewName !== null) {
      document.title = `${previewName} — gassan`;
      return;
    }
    document.title = page.path === '/' ? t.common.siteTitle : `${title} — gassan`;
  }, [page, title, t, previewName]);

  // ページが変わったら先頭へ戻り、見出しへフォーカスを移す。
  // SPA の遷移は読み上げられないので、移さないと支援技術の利用者は迷子になる。
  // 言語だけを変えたときは同じページに留まるので、動かさない。
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    // 見本の中の行き来は、テンプレートが自分でフォーカスを扱う（h1 はテンプレートの中にある）。
    if (previewName === null) document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [page.path, previewName]);

  const { prev, next } = neighbours(page);
  const Page = page.Component;

  // テンプレートの見本（#/preview/<name>）。ドキュメントのページの iframe の中で、サイトの枠を持たずに描く。
  if (previewName !== null) {
    return (
      <GassanProvider labels={t.gassan}>
        <TemplatePreview name={previewName} />
        <ModalHost />
        <ToastHost position={toastPosition} />
      </GassanProvider>
    );
  }

  return (
    // gassan が出す文字列（閉じる・読み上げ・ゲートの理由）も、サイトの言語にそろえる
    <GassanProvider labels={t.gassan}>
      <div className="s-app">
        <a
          className="s-skip"
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
        >
          {t.common.skipToMain}
        </a>

        <header className="s-topbar">
          <button
            type="button"
            className="s-icon-btn s-menu-btn"
            aria-label={t.common.openMenu}
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <a className="s-brand" href={to('/')}>
            <Logo />
            <span>gassan</span>
          </a>
          <span className="s-version">v{data.meta.version}</span>
          <span className="s-topbar-spacer" />
          <button
            type="button"
            className="s-theme-btn s-search-btn"
            // 狭い画面では文字を外して虫眼鏡だけにするので、名前は aria-label で持つ
            aria-label={t.common.search}
            aria-haspopup="dialog"
            aria-keyshortcuts={apple ? 'Meta+K' : 'Control+K'}
            onClick={() => setSearchOpen(true)}
          >
            <svg className="s-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <span className="s-search-label">{t.common.search}</span>
            <kbd className="s-search-kbd" aria-hidden="true">
              {apple ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
          <LangPicker />
          <ThemePicker />
          <a className="s-topbar-link s-topbar-spec" href={to('/spec')}>
            {t.common.spec}
          </a>
          <a className="s-topbar-link s-topbar-github" href={data.meta.repository} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </header>

        <div className="s-layout">
          <nav className="s-sidenav" aria-label={t.common.siteNav}>
            <NavList current={page.path} />
          </nav>

          <main id="main" ref={mainRef} tabIndex={-1} className="s-main" data-page={page.path}>
            {lang !== DEFAULT_LANG ? (
              <p className="s-original-note">
                <Phrase>{md(t.common.originalNote)}</Phrase>
              </p>
            ) : null}

            <Page rest={rest} />

            {page.path !== '/' ? (
              <nav className="s-pager" aria-label={t.common.pager}>
                {prev ? (
                  <a className="s-pager-link" href={to(prev.path)} data-dir="prev">
                    <span className="s-pager-dir">{t.common.prev}</span>
                    <span className="s-pager-title">
                      <Phrase>{t.nav.pages[prev.key]}</Phrase>
                    </span>
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a className="s-pager-link" href={to(next.path)} data-dir="next">
                    <span className="s-pager-dir">{t.common.next}</span>
                    <span className="s-pager-title">
                      <Phrase>{t.nav.pages[next.key]}</Phrase>
                    </span>
                  </a>
                ) : null}
              </nav>
            ) : null}

            <footer className="s-footer">
              <p>
                {data.meta.packageName} v{data.meta.version} · MIT ·{' '}
                <Phrase>{md(t.common.footerCompliance(data.meta.specVersion, data.meta.specUpdated))}</Phrase>
              </p>
              <p>
                <Phrase>{t.common.footerGenerated}</Phrase>
              </p>
            </footer>
          </main>
        </div>

        {/* 狭い画面のメニュー。gassan のシートそのもの。ページが変わったら route-change で閉じる（L-13）。 */}
        <Modal.Root
          kind="view"
          placement="sheet"
          open={menuOpen}
          onOpenChange={(nextOpen, reason) => {
            // × で閉じたならメニューボタンへ戻す（既定）。項目を選んで閉じたなら、
            // 戻り先のボタンは用済みなので、移った先のページの見出しへ送る。
            menuFinalFocus.current = reason === 'route-change' ? document.getElementById('page-title') : null;
            setMenuOpen(nextOpen);
          }}
          finalFocus={menuFinalFocus}
          routeKey={page.path}
          swipeToDismiss
          className="s-menu-sheet"
        >
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>{t.common.menu}</Modal.Title>
          </Modal.Header>
          <Modal.Body label={t.common.menuBody}>
            <nav aria-label={t.common.siteNav} className="s-sheet-nav">
              <a className="s-nav-item" href={to('/')} aria-current={page.path === '/' ? 'page' : undefined}>
                {t.common.home}
              </a>
              <NavList current={page.path} />
            </nav>
          </Modal.Body>
        </Modal.Root>

        {/* サイトの検索は gassan の CommandPalette そのもの（⌘K / Ctrl+K）。 */}
        <CommandPalette
          items={searchItems}
          open={searchOpen}
          onOpenChange={(next) => {
            if (next) searchMoved.current = false;
            setSearchOpen(next);
          }}
          label={t.common.searchPalette}
          placeholder={t.common.searchPlaceholder}
          finalFocus={searchFinalFocus}
        />

        <ModalHost />
        <ToastHost position={toastPosition} />
      </div>
    </GassanProvider>
  );
}
