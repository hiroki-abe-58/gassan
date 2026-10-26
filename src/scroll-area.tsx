import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useScrollbars, type ScrollAxis, type ScrollbarVisibility } from './internal/scrollbars';

export { SCROLLBAR_VISIBILITIES, type ScrollbarVisibility } from './internal/scrollbars';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface ScrollAreaProps extends DataAttributes {
  children?: ReactNode;
  /** 送る向き。既定 'vertical'。'both' は縦と横の両方にバーを描く。 */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** バーの出し方。省略すると外側の `data-g-scrollbars`（`GassanProvider` の `scrollbars`。無ければ 'auto'）。 */
  visibility?: ScrollbarVisibility;
  /**
   * 窓の名前。渡すと窓を名前のあるまとまり（`role="group"`）にして Tab で止める。
   * 中にフォーカスできる物が無い窓は、キーボードでは送れないため（B-02 / B-03 / B-13）。
   * 目印（region）にしないのは、表や一覧ごとに目印が増えると、目印での移動が役に立たなくなるため。
   */
  label?: string;
  /** 器（窓とバーを重ねる升）のクラス。高さの上限は器に付ける。 */
  className?: string;
  /** 窓（スクロールする要素）のクラス。余白や中の並びは窓に付ける。 */
  viewportClassName?: string;
  style?: CSSProperties;
}

const AXES: Record<NonNullable<ScrollAreaProps['orientation']>, readonly ScrollAxis[]> = {
  vertical: ['y'],
  horizontal: ['x'],
  both: ['y', 'x'],
};

/**
 * 自前で描くスクロールバーの器。U-35。
 *
 * ブラウザと OS でバーの太さ・色・出方が違う（Windows は常に太い溝、macOS は重なって消える、Firefox は色が違う）のを、
 * テーマの色と形にそろえる。スクロールはブラウザのまま（ホイール・キー・タッチ・慣性）で、ネイティブのバーを隠し、
 * 窓の端にバーを重ねて描く。`ref` は窓（スクロールする要素）を指す（`scrollTo` などに使う）。
 */
// forwardRef の前の PURE の注釈は、使わないアプリの束から部品ごと外せるようにするため（src/japanese.ts の先頭の注を参照）
export const ScrollArea = /* @__PURE__ */ forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, orientation = 'vertical', visibility, label, className, viewportClassName, style, ...rest },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => viewportRef.current as HTMLDivElement);
  const bars = useScrollbars(viewportRef, { axes: AXES[orientation], visibility });
  const region = label ? { role: 'group', 'aria-label': label, tabIndex: 0 } : {};
  return (
    <div {...domPassthrough(rest, 'ScrollArea')} className={cx('g-scroll', className)} style={style} data-orientation={orientation}>
      <div ref={viewportRef} className={cx('g-scroll-viewport', viewportClassName)} {...region}>
        {children}
      </div>
      {bars}
    </div>
  );
});

export interface PageScrollbarProps {
  /** バーの出し方。省略すると `<html data-g-scrollbars>`（無ければ 'auto'）。 */
  visibility?: ScrollbarVisibility;
}

/**
 * 文書そのもの（ページ全体）のスクロールバー。U-35。
 *
 * アプリに 1 つだけ置く。置いている間は `<html>` のネイティブのバーを隠し、画面の端に自前のバーを重ねる。
 * モーダルが開いて文書のスクロールを止めている間は出さない。外すとネイティブのバーに戻る。
 * サーバーでは何も描かない（バーは描いた後に body の末尾へ置く）。
 */
export function PageScrollbar({ visibility }: PageScrollbarProps): ReactNode {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-g-page-scrollbar', '');
    setHost(document.body);
    return () => root.removeAttribute('data-g-page-scrollbar');
  }, []);
  const bars = useScrollbars('page', { visibility });
  return host ? createPortal(bars, host) : null;
}
