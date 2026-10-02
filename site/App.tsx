import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Modal, ModalHost } from '@genelab/gassan';

import { data } from './data';
import { PAGES, SECTIONS, neighbours, resolve } from './routes';
import { to, useSegments } from './router';

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
  return (
    <>
      {SECTIONS.map((section) => {
        const pages = PAGES.filter((page) => page.section === section.id && page.path !== '/');
        return (
          <div key={section.id} className="s-nav-group">
            <p className="s-nav-label" id={`nav-${section.id}`}>
              {section.label}
            </p>
            <ul aria-labelledby={`nav-${section.id}`}>
              {pages.map((page) => (
                <li key={page.path}>
                  <a
                    className="s-nav-item"
                    href={to(page.path)}
                    aria-current={page.path === current ? 'page' : undefined}
                  >
                    {page.nav ?? page.title}
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
  const segments = useSegments();
  const { page, rest } = resolve(segments);
  const [menuOpen, setMenuOpen] = useState(false);
  /** メニューが閉じた後のフォーカス先。ページ遷移で閉じたときだけ新しいページの見出しにする（K-06）。 */
  const menuFinalFocus = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.title = page.path === '/' ? 'gassan — ネイティブ dialog のためのモーダルシェル' : `${page.title} — gassan`;
  }, [page]);

  // ページが変わったら先頭へ戻り、見出しへフォーカスを移す。
  // SPA の遷移は読み上げられないので、移さないと支援技術の利用者は迷子になる。
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [page.path]);

  const { prev, next } = neighbours(page);
  const Page = page.Component;

  return (
    <div className="s-app">
      <a
        className="s-skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        本文へ移動
      </a>

      <header className="s-topbar">
        <button
          type="button"
          className="s-icon-btn s-menu-btn"
          aria-label="メニューを開く"
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
        <a className="s-topbar-link" href={to('/spec')}>
          仕様
        </a>
        <a className="s-topbar-link" href={data.meta.repository} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <div className="s-layout">
        <nav className="s-sidenav" aria-label="サイト内">
          <NavList current={page.path} />
        </nav>

        <main id="main" ref={mainRef} tabIndex={-1} className="s-main" data-page={page.path}>
          <Page rest={rest} />

          {page.path !== '/' ? (
            <nav className="s-pager" aria-label="前後のページ">
              {prev ? (
                <a className="s-pager-link" href={to(prev.path)} data-dir="prev">
                  <span className="s-pager-dir">前へ</span>
                  <span className="s-pager-title">{prev.title}</span>
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a className="s-pager-link" href={to(next.path)} data-dir="next">
                  <span className="s-pager-dir">次へ</span>
                  <span className="s-pager-title">{next.title}</span>
                </a>
              ) : null}
            </nav>
          ) : null}

          <footer className="s-footer">
            <p>
              {data.meta.packageName} v{data.meta.version} · MIT ·{' '}
              <a href={to('/spec')}>
                仕様書 v{data.meta.specVersion}（{data.meta.specUpdated}）
              </a>
              {' '}に準拠
            </p>
            <p>
              表・件数・API はすべて仕様書と型定義からビルド時に生成している。手で書いた数値はない。
            </p>
          </footer>
        </main>
      </div>

      {/* 狭い画面のメニュー。gassan のシートそのもの。ページが変わったら route-change で閉じる（L-13）。 */}
      <Modal.Root
        kind="view"
        placement="sheet"
        open={menuOpen}
        onOpenChange={(next, reason) => {
          // × で閉じたならメニューボタンへ戻す（既定）。項目を選んで閉じたなら、
          // 戻り先のボタンは用済みなので、移った先のページの見出しへ送る。
          menuFinalFocus.current = reason === 'route-change' ? document.getElementById('page-title') : null;
          setMenuOpen(next);
        }}
        finalFocus={menuFinalFocus}
        routeKey={page.path}
        swipeToDismiss
        className="s-menu-sheet"
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>メニュー</Modal.Title>
        </Modal.Header>
        <Modal.Body label="サイト内のページ">
          <nav aria-label="サイト内" className="s-sheet-nav">
            <a className="s-nav-item" href={to('/')} aria-current={page.path === '/' ? 'page' : undefined}>
              ホーム
            </a>
            <NavList current={page.path} />
          </nav>
        </Modal.Body>
      </Modal.Root>

      <ModalHost />
    </div>
  );
}
