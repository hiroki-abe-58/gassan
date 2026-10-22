import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react';

import { useEvent } from './use-event';

/** 起点との隙間と、画面端に残す余白（px）。 */
const GAP = 4;
const MARGIN = 8;

/** ポップアップの置き方。 */
export interface PlaceOptions {
  /** 先に試す側。既定 'below'（入らなければ反対の側）。ツールチップは 'above'。 */
  side?: 'below' | 'above';
  /** 横のそろえ方。既定 'start'（起点の始まりにそろえる）。ツールチップは 'center'、行の端の「…」のメニューは 'end'。 */
  align?: 'start' | 'center' | 'end';
  /** 起点の幅を最小の幅にする。既定 true（一覧・カレンダー）。ツールチップとポップオーバーは false。 */
  matchWidth?: boolean;
}

/**
 * ポップアップを起点の先に試す側（既定は下）に置き、入らなければ反対の側に置く。I-02。
 *
 * top layer の要素は祖先の transform の影響を受けないので、
 * 画面座標をそのまま position: fixed の座標として使える。
 * 拡大の原点は起点の中央に合わせる（V-04。起点から広がって見える）。
 */
export function placePopup(anchor: HTMLElement, popup: HTMLElement, { side = 'below', align = 'start', matchWidth = true }: PlaceOptions = {}): void {
  const rect = anchor.getBoundingClientRect();
  const viewportBlock = window.innerHeight;
  const viewportInline = document.documentElement.clientWidth;
  const below = viewportBlock - rect.bottom - GAP - MARGIN;
  const above = rect.top - GAP - MARGIN;
  if (matchWidth) popup.style.minInlineSize = `${String(rect.width)}px`;
  // 上限（CSS の --g-popup-room）を外した高さで「先に試す側に入るか」を決め、入る高さを戻す。
  popup.style.removeProperty('--g-popup-room');
  const natural = popup.offsetHeight;
  const downward = side === 'below' ? below >= natural || below >= above : !(above >= natural || above >= below);
  popup.style.setProperty('--g-popup-room', `${String(Math.max(0, downward ? below : above))}px`);
  const height = popup.offsetHeight;
  const width = popup.offsetWidth;
  // 右から左の言語では、始まりと終わりの側が入れ替わる。
  const toRight = (align === 'end') !== (getComputedStyle(anchor).direction === 'rtl');
  const start = align === 'center' ? rect.left + rect.width / 2 - width / 2 : toRight ? rect.right - width : rect.left;
  const left = Math.min(Math.max(MARGIN, start), Math.max(MARGIN, viewportInline - MARGIN - width));
  popup.style.top = `${String(downward ? rect.bottom + GAP : rect.top - GAP - height)}px`;
  popup.style.left = `${String(left)}px`;
  popup.style.transformOrigin = `${String(rect.left + rect.width / 2 - left)}px ${downward ? '0' : '100%'}`;
  popup.dataset.side = downward ? 'below' : 'above';
}

/** 1 つの時間（'0.12s' / '120ms'）をミリ秒に。 */
function parseTime(value: string): number {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  return value.trim().endsWith('ms') ? number : number * 1000;
}

/**
 * 計算済みの transition の長さ（遅れを足した最長）。遷移が無ければ 0。
 * CSS を読まない環境（jsdom）や、動きを止めた設定（transition: none）では 0 になる。
 */
export function transitionMs(element: Element): number {
  const style = getComputedStyle(element);
  const durations = (style.transitionDuration || '0s').split(',').map(parseTime);
  const delays = (style.transitionDelay || '0s').split(',').map(parseTime);
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] ?? delays[0] ?? 0)));
}

export interface PopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'popover'>, PlaceOptions {
  /** 開いているか。閉じても退出を描き終えるまでは描く（V-04）。 */
  open: boolean;
  /** 位置の基準。トリガーや入力欄を囲む要素。 */
  anchorRef: RefObject<HTMLElement | null>;
  /** 外を押されたとき。起点の内側を押したときは呼ばない（起点側が開閉を決める）。 */
  onDismiss: () => void;
  children: ReactNode;
}

/**
 * 開いている間（と、閉じる動きの間）だけ描くポップアップ。C-12 / I-02 / V-04。
 *
 * モーダルのパネルは transform で動くので、中で position: fixed を使うと
 * パネルが包含ブロックになって位置が狂う。popover API で top layer に出せば、
 * パネルの transform からも、本文の overflow による切り抜きからも外れる。
 *
 * popover="manual" にするのは、auto の light dismiss が「起点（入力欄）を押した」ことまで
 * 外側のクリックとして閉じてしまうため。Esc は持ち主がキー操作として扱い、
 * keydown を preventDefault してモーダルの cancel まで届かせない（Chrome 155 で実測）。
 *
 * 閉じたら data-exiting を付けて退出を描き、その transition の長さだけ待ってから外す。
 * 待つ時間は CSS の計算値から読むので、JS に数を二重に持たない（L-07 と同じ考え方）。
 *
 * popover API の無い環境（jsdom・古いブラウザ）では、起点の直下に absolute で置く。
 */
export function Popup({ open, anchorRef, onDismiss, children, className, side, align, matchWidth, ...attributes }: PopupProps): ReactNode {
  // 置き方の指定は、effect の中から最新の値を読む（依存に入れて置き直しの登録をやり直さない）。
  const placement = useRef<PlaceOptions>({});
  placement.current = { side, align, matchWidth };
  const ref = useRef<HTMLDivElement>(null);
  const inTopLayer = useRef(false);
  const dismiss = useEvent(onDismiss);
  const [present, setPresent] = useState(open);
  // 開いたら、退出の途中でもすぐ描く側へ戻す（描画中の state 更新は React が即座にやり直す）。
  if (open && !present) setPresent(true);

  useLayoutEffect(() => {
    const popup = ref.current;
    const anchor = anchorRef.current;
    if (!present || !popup || !anchor) return undefined;
    // 型の上では常にあるが、jsdom と古いブラウザには無い。
    const top = typeof (popup.showPopover as unknown) === 'function';
    inTopLayer.current = top;
    if (top) {
      popup.showPopover();
      placePopup(anchor, popup, placement.current);
    } else {
      popup.dataset.inline = '';
    }

    let frame = 0;
    const reposition = (): void => {
      if (!top || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        placePopup(anchor, popup, placement.current);
      });
    };
    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (target && (popup.contains(target) || anchor.contains(target))) return;
      dismiss();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      if (top && popup.isConnected) popup.hidePopover();
    };
  }, [present, anchorRef, dismiss]);

  // 閉じたら退出を描き、描き終えてから外す。退出中に開き直されたら、印を外して元へ戻す。
  useLayoutEffect(() => {
    const popup = ref.current;
    if (!popup) return undefined;
    if (open) {
      delete popup.dataset.exiting;
      return undefined;
    }
    popup.dataset.exiting = '';
    const wait = transitionMs(popup);
    if (wait <= 0) {
      setPresent(false);
      return undefined;
    }
    const timer = setTimeout(() => setPresent(false), wait);
    return () => clearTimeout(timer);
  }, [open]);

  // 中身が変わるたびに置き直す。上に開いたまま候補が絞られて背が縮むと、起点との間が空くため。
  useLayoutEffect(() => {
    const popup = ref.current;
    const anchor = anchorRef.current;
    if (open && popup && anchor && inTopLayer.current) placePopup(anchor, popup, placement.current);
  });

  if (!present) return null;
  return (
    // 内部の部品だけが使う（役割やキー操作を足す）。利用者の props は通らないので濾過しない。
    <div {...attributes} ref={ref} popover="manual" className={className ? `g-popup ${className}` : 'g-popup'}>
      {children}
    </div>
  );
}
