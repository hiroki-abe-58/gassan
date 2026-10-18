import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react';

import { useEvent } from './use-event';

/** 起点との隙間と、画面端に残す余白（px）。 */
const GAP = 4;
const MARGIN = 8;

/**
 * ポップアップを起点の下（入らなければ上）に置く。I-02。
 *
 * top layer の要素は祖先の transform の影響を受けないので、
 * 画面座標をそのまま position: fixed の座標として使える。
 */
export function placePopup(anchor: HTMLElement, popup: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  const viewportBlock = window.innerHeight;
  const viewportInline = document.documentElement.clientWidth;
  const below = viewportBlock - rect.bottom - GAP - MARGIN;
  const above = rect.top - GAP - MARGIN;
  popup.style.minInlineSize = `${String(rect.width)}px`;
  // 上限（CSS の --g-popup-room）を外した高さで「下に入るか」を決め、入る高さを戻す。
  popup.style.removeProperty('--g-popup-room');
  const natural = popup.offsetHeight;
  const downward = below >= natural || below >= above;
  popup.style.setProperty('--g-popup-room', `${String(Math.max(0, downward ? below : above))}px`);
  const height = popup.offsetHeight;
  const width = popup.offsetWidth;
  const rtl = getComputedStyle(anchor).direction === 'rtl';
  const start = rtl ? rect.right - width : rect.left;
  const left = Math.min(Math.max(MARGIN, start), Math.max(MARGIN, viewportInline - MARGIN - width));
  popup.style.top = `${String(downward ? rect.bottom + GAP : rect.top - GAP - height)}px`;
  popup.style.left = `${String(left)}px`;
  popup.dataset.side = downward ? 'below' : 'above';
}

export interface PopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'popover'> {
  /** 位置の基準。トリガーや入力欄を囲む要素。 */
  anchorRef: RefObject<HTMLElement | null>;
  /** 外を押されたとき。起点の内側を押したときは呼ばない（起点側が開閉を決める）。 */
  onDismiss: () => void;
  children: ReactNode;
}

/**
 * 開いている間だけ描くポップアップ。C-12 / I-02。
 *
 * モーダルのパネルは transform で動くので、中で position: fixed を使うと
 * パネルが包含ブロックになって位置が狂う。popover API で top layer に出せば、
 * パネルの transform からも、本文の overflow による切り抜きからも外れる。
 *
 * popover="manual" にするのは、auto の light dismiss が「起点（入力欄）を押した」ことまで
 * 外側のクリックとして閉じてしまうため。Esc は持ち主がキー操作として扱い、
 * keydown を preventDefault してモーダルの cancel まで届かせない（Chrome 155 で実測）。
 *
 * popover API の無い環境（jsdom・古いブラウザ）では、起点の直下に absolute で置く。
 */
export function Popup({ anchorRef, onDismiss, children, className, ...attributes }: PopupProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const inTopLayer = useRef(false);
  const dismiss = useEvent(onDismiss);

  useLayoutEffect(() => {
    const popup = ref.current;
    const anchor = anchorRef.current;
    if (!popup || !anchor) return undefined;
    // 型の上では常にあるが、jsdom と古いブラウザには無い。
    const top = typeof (popup.showPopover as unknown) === 'function';
    inTopLayer.current = top;
    if (top) {
      popup.showPopover();
      placePopup(anchor, popup);
    } else {
      popup.dataset.inline = '';
    }

    let frame = 0;
    const reposition = (): void => {
      if (!top || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        placePopup(anchor, popup);
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
  }, [anchorRef, dismiss]);

  // 中身が変わるたびに置き直す。上に開いたまま候補が絞られて背が縮むと、起点との間が空くため。
  useLayoutEffect(() => {
    const popup = ref.current;
    const anchor = anchorRef.current;
    if (popup && anchor && inTopLayer.current) placePopup(anchor, popup);
  });

  return (
    // 内部の部品だけが使う（役割やキー操作を足す）。利用者の props は通らないので濾過しない。
    <div {...attributes} ref={ref} popover="manual" className={className ? `g-popup ${className}` : 'g-popup'}>
      {children}
    </div>
  );
}
