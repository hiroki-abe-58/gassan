import { useEffect, useRef, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react';

import { hasResizeObserver, motionStill } from './dom';

/**
 * バーの出し方。U-35。
 * - auto: スクロールしている間と、窓かバーの上にポインタがある間（止まって約 1 秒で消える）
 * - hover: 窓かバーの上にポインタがある間だけ（キーやタッチで送っても出さない）
 * - scroll: スクロールしている間だけ（iOS の出し方に近い）
 * - always: 中身があふれている間はいつも
 */
export const SCROLLBAR_VISIBILITIES = ['auto', 'hover', 'scroll', 'always'] as const;
export type ScrollbarVisibility = (typeof SCROLLBAR_VISIBILITIES)[number];
export type ScrollAxis = 'y' | 'x';

const VISIBILITIES: ReadonlySet<string> = new Set(SCROLLBAR_VISIBILITIES);
/** つまみの最短の長さ（px）。中身が長くても、ポインタで掴める大きさは残す。 */
const MIN_THUMB = 24;
/** スクロールが止まってから「スクロール中」を解くまで（ms）。 */
const LINGER = 900;
/** 溝を押したときに送る量（窓の大きさに対する割合）。少し重ねて、どこまで読んだかを見失わせない。 */
const PAGE = 0.875;

/** 外側の data-g-scrollbars（GassanProvider の scrollbars・`<html>`）を、近いものから読む。 */
function inheritedVisibility(el: Element): ScrollbarVisibility {
  const value = el.closest('[data-g-scrollbars]')?.getAttribute('data-g-scrollbars');
  return value && VISIBILITIES.has(value) ? (value as ScrollbarVisibility) : 'auto';
}

// data-g-scrollbars が後から変わったとき（テーマの切り替え・Provider の props）に、生きているバーの出し方を読み直す。
// バーごとに見張ると数が増えるので、文書に 1 つだけ置く。
const live = new Set<() => void>();
let watcher: MutationObserver | null = null;
function watchVisibility(refresh: () => void): () => void {
  live.add(refresh);
  if (!watcher && typeof MutationObserver === 'function' && typeof document !== 'undefined') {
    watcher = new MutationObserver(() => live.forEach((fn) => fn()));
    watcher.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-g-scrollbars'] });
  }
  return () => {
    live.delete(refresh);
    if (live.size > 0) return;
    watcher?.disconnect();
    watcher = null;
  };
}

const nextFrame = (cb: () => void): number =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : (setTimeout(cb, 16) as unknown as number);
const cancelFrame = (id: number): void => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
};

export interface ScrollbarsOptions {
  /** 描くバー。既定は縦だけ。 */
  axes?: readonly ScrollAxis[];
  /** 出し方。省略すると外側の data-g-scrollbars（無ければ auto）。 */
  visibility?: ScrollbarVisibility;
}

/**
 * 窓（スクロールする要素）に、自前で描くバーを付ける。U-35。
 *
 * スクロールそのものはブラウザのまま（ホイール・キー・タッチ・慣性・位置の復元・スクロールの連鎖）で、
 * 見えるバーだけを描く。返す要素は窓の後ろの兄弟に置き、窓と同じ grid の升に重ねる（升の決め方は置く側の CSS）。
 * 'page' を渡すと文書そのもの（document.scrollingElement）を窓にし、バーは画面の端に固定して置く。
 * バーは飾り（aria-hidden）。キーボードと支援技術は窓そのものを送る（B-02）。
 *
 * つまみの大きさと位置・あふれ・スクロール中・ドラッグ中は、描き直しを起こさないよう DOM に直に書く
 * （スクロールのたびに React の状態を変えると、中身ごと描き直す）。
 */
export function useScrollbars(viewport: RefObject<HTMLElement | null> | 'page', { axes = ['y'], visibility }: ScrollbarsOptions = {}): ReactNode {
  // バーが描かれてから（ポータルの先が決まってからも）見張りを張るので、要素を状態で受ける
  const [yBar, setYBar] = useState<HTMLDivElement | null>(null);
  const [xBar, setXBar] = useState<HTMLDivElement | null>(null);
  const page = viewport === 'page';
  const hasY = axes.includes('y');
  const hasX = axes.includes('x');

  const viewportOf = (): HTMLElement | null =>
    viewport === 'page' ? ((document.scrollingElement as HTMLElement | null) ?? document.documentElement) : viewport.current;

  useEffect(() => {
    const el = viewportOf();
    const bars: [ScrollAxis, HTMLDivElement][] = [];
    if (yBar) bars.push(['y', yBar]);
    if (xBar) bars.push(['x', xBar]);
    if (!el || bars.length === 0) return undefined;

    let pending = 0;
    let idle = 0;
    const measure = (): void => {
      pending = 0;
      for (const [axis, bar] of bars) {
        const vertical = axis === 'y';
        const client = vertical ? el.clientHeight : el.clientWidth;
        const total = vertical ? el.scrollHeight : el.scrollWidth;
        const max = total - client;
        // 閉じている（display: none）間は 0 を返す。あふれていない扱いにして隠す
        if (client === 0 || max <= 1) {
          bar.removeAttribute('data-overflow');
          continue;
        }
        bar.setAttribute('data-overflow', '');
        const track = vertical ? bar.clientHeight : bar.clientWidth;
        const size = Math.min(track, Math.max(MIN_THUMB, Math.round((track * client) / total)));
        // 右から左の言語の横は、scrollLeft が 0 から負へ進む。始まりの端からの距離で測る
        const position = Math.min(max, Math.abs(vertical ? el.scrollTop : el.scrollLeft));
        bar.style.setProperty('--g-scrollbar-thumb-size', `${String(size)}px`);
        bar.style.setProperty('--g-scrollbar-thumb-offset', `${String(Math.round(((track - size) * position) / max))}px`);
      }
    };
    const schedule = (): void => {
      if (!pending) pending = nextFrame(measure);
    };
    const onScroll = (): void => {
      schedule();
      for (const [, bar] of bars) bar.setAttribute('data-scrolling', '');
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        for (const [, bar] of bars) bar.removeAttribute('data-scrolling');
      }, LINGER);
    };
    const refresh = (): void => {
      for (const [, bar] of bars) bar.setAttribute('data-visibility', visibility ?? inheritedVisibility(bar));
      schedule();
    };
    refresh();

    const target: HTMLElement | Window = page ? window : el;
    target.addEventListener('scroll', onScroll, { passive: true });
    // 窓と中身の大きさの変化で測り直す。中身の子は入れ替わるので、入れ替わるたびに見張り直す
    const content = page ? document.body : el;
    const sizes = hasResizeObserver() ? new ResizeObserver(schedule) : null;
    const rewire = (): void => {
      if (!sizes) return;
      sizes.disconnect();
      sizes.observe(el);
      for (const child of Array.from(content.children)) sizes.observe(child);
    };
    rewire();
    const children =
      typeof MutationObserver === 'function'
        ? new MutationObserver(() => {
            rewire();
            schedule();
          })
        : null;
    children?.observe(content, { childList: true });
    if (page) window.addEventListener('resize', schedule);
    // 窓にポインタが入ったときにも測る（ホバーで出す前に、大きさを最新にする）
    el.addEventListener('pointerenter', schedule);
    const unwatch = watchVisibility(refresh);

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (page) window.removeEventListener('resize', schedule);
      el.removeEventListener('pointerenter', schedule);
      sizes?.disconnect();
      children?.disconnect();
      unwatch();
      clearTimeout(idle);
      if (pending) cancelFrame(pending);
    };
    // 窓は viewport（ref か 'page'）から決まる。バーの要素が替わったら張り直す
  }, [viewport, yBar, xBar, visibility, page]);

  /** つまみを掴んで送る。溝の空いた所を押したら、そちらへ 1 画面ぶん送る。 */
  const press = (event: ReactPointerEvent<HTMLDivElement>, axis: ScrollAxis): void => {
    const el = viewportOf();
    const bar = event.currentTarget;
    const thumb = bar.firstElementChild as HTMLElement | null;
    if (!el || !thumb || event.button !== 0) return;
    // 文字の選択とフォーカスの移動を起こさない
    event.preventDefault();
    const vertical = axis === 'y';
    if (event.target === thumb) {
      const start = vertical ? event.clientY : event.clientX;
      const from = vertical ? el.scrollTop : el.scrollLeft;
      const track = vertical ? bar.clientHeight : bar.clientWidth;
      const size = vertical ? thumb.offsetHeight : thumb.offsetWidth;
      const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
      const ratio = track > size ? max / (track - size) : 0;
      bar.setPointerCapture?.(event.pointerId);
      bar.setAttribute('data-dragging', '');
      const move = (next: PointerEvent): void => {
        const delta = ((vertical ? next.clientY : next.clientX) - start) * ratio;
        if (vertical) el.scrollTop = from + delta;
        else el.scrollLeft = from + delta;
      };
      const end = (): void => {
        bar.removeAttribute('data-dragging');
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', end);
        bar.removeEventListener('pointercancel', end);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', end);
      bar.addEventListener('pointercancel', end);
      return;
    }
    const rect = thumb.getBoundingClientRect();
    const before = vertical ? event.clientY < rect.top : event.clientX < rect.left;
    const amount = (vertical ? el.clientHeight : el.clientWidth) * PAGE * (before ? -1 : 1);
    const behavior = motionStill(el) ? 'auto' : 'smooth';
    if (typeof el.scrollBy === 'function') el.scrollBy(vertical ? { top: amount, behavior } : { left: amount, behavior });
    else if (vertical) el.scrollTop += amount;
    else el.scrollLeft += amount;
  };

  const bar = (axis: ScrollAxis): ReactNode => (
    <div
      key={axis}
      ref={axis === 'y' ? setYBar : setXBar}
      className={page ? 'g-scrollbar g-page-scrollbar' : 'g-scrollbar'}
      data-axis={axis}
      aria-hidden="true"
      onPointerDown={(event) => press(event, axis)}
    >
      <div className="g-scrollbar-thumb" />
    </div>
  );
  return (
    <>
      {hasY ? bar('y') : null}
      {hasX ? bar('x') : null}
    </>
  );
}

export interface ScrollPaneProps extends HTMLAttributes<HTMLElement> {
  /** 器のクラス（大きさ・並び・出し入れ）。器は 1 升の grid で、窓とバーを重ねる。 */
  className: string;
  /** 窓のクラス（余白・中の並び）。 */
  viewportClassName: string;
  /** 窓の要素。名前のある案内（フォルダ）なら 'nav'。 */
  as?: 'div' | 'nav';
  /** 描くバー。既定は縦だけ。 */
  axes?: readonly ScrollAxis[];
  children: ReactNode;
}

/**
 * テンプレートの中のスクロールする面（一覧・フォルダ・本文・案内の帯）。U-35。
 * 器と窓に分け、窓の後ろに自前のバーを置く。窓に付けたい属性（名前・役割）は残りの props で渡す。
 */
export function ScrollPane({ className, viewportClassName, as: Viewport = 'div', axes, children, ...viewport }: ScrollPaneProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const bars = useScrollbars(ref, { axes });
  return (
    <div className={`g-scroll ${className}`}>
      <Viewport {...viewport} ref={ref as RefObject<HTMLDivElement>} className={`${viewportClassName} g-scroll-viewport`}>
        {children}
      </Viewport>
      {bars}
    </div>
  );
}
