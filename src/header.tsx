import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { useModalContext } from './context';
import { hasResizeObserver } from './internal/dom';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

/* -------------------------------------------------------------------------- */
/* icons — 依存を増やさないためのインライン SVG。装飾なので aria-hidden。A-06     */
/* -------------------------------------------------------------------------- */

function IconChevronLeft(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalHeaderProps extends DataAttributes {
  children?: ReactNode;
  className?: string;
}

/** grid の 1 行目。position: sticky は使わない。スクロールするのは本文だけ。H-10。 */
export function ModalHeader({ children, className, ...rest }: ModalHeaderProps): ReactNode {
  return (
    <header
      {...domPassthrough(rest, 'Modal.Header')}
      className={className ? `g-header ${className}` : 'g-header'}
    >
      {children}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

export interface ModalControlsProps extends DataAttributes {
  /** 左スロット。戻る。 */
  start?: ReactNode;
  /** 中央スロット。ページインジケータなど。 */
  center?: ReactNode;
  /** 右スロット。閉じる、追加メニュー。 */
  end?: ReactNode;
  className?: string;
}

/**
 * 1fr auto 1fr の3カラム。H-01 / H-02。
 *
 * DOM 順を start → center → end に固定することで、
 * 視覚順と読み上げ順が常に一致する。
 * スロットは空でも描画する。中身の有無で中央がずれないため。
 */
export function ModalControls({
  start,
  center,
  end,
  className,
  ...rest
}: ModalControlsProps): ReactNode {
  return (
    <div
      {...domPassthrough(rest, 'Modal.Controls')}
      className={className ? `g-controls ${className}` : 'g-controls'}
    >
      <div className="g-controls-slot" data-slot="start">
        {start}
      </div>
      <div className="g-controls-slot" data-slot="center">
        {center}
      </div>
      <div className="g-controls-slot" data-slot="end">
        {end}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Back / Close                                                               */
/* -------------------------------------------------------------------------- */

export interface ModalIconButtonProps extends DataAttributes {
  onClick?: () => void;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function ModalBack({
  onClick,
  label,
  className,
  children,
  ...rest
}: ModalIconButtonProps): ReactNode {
  const labels = useLabels();
  return (
    <button
      {...domPassthrough(rest, 'Modal.Back')}
      type="button"
      className={className ? `g-iconbtn ${className}` : 'g-iconbtn'}
      data-g-control="back"
      aria-label={label ?? labels.back}
      onClick={onClick}
    >
      {children ?? <IconChevronLeft />}
    </button>
  );
}

export function ModalClose({
  onClick,
  label,
  className,
  children,
  ...rest
}: ModalIconButtonProps): ReactNode {
  const labels = useLabels();
  const { requestClose } = useModalContext('Modal.Close');
  return (
    <button
      {...domPassthrough(rest, 'Modal.Close')}
      type="button"
      className={className ? `g-iconbtn ${className}` : 'g-iconbtn'}
      data-g-control="close"
      aria-label={label ?? labels.close}
      onClick={() => {
        onClick?.();
        requestClose('close-button');
      }}
    >
      {children ?? <IconClose />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Indicator                                                                  */
/* -------------------------------------------------------------------------- */

export interface ModalIndicatorProps extends DataAttributes {
  current: number;
  total: number;
  className?: string;
  /** ステップが変わったときに読み上げる。既定 true。 */
  announceChange?: boolean;
}

/**
 * 「2 / 5」。H-06。
 *
 * 視覚表現はスラッシュ区切りで十分だが、読み上げると「2スラッシュ5」になる。
 * 視覚用を aria-hidden にし、読み上げ用の文を別に持つ。
 */
export function ModalIndicator({
  current,
  total,
  className,
  announceChange = true,
  ...rest
}: ModalIndicatorProps): ReactNode {
  const labels = useLabels();
  const { announce } = useModalContext('Modal.Indicator');
  const previous = useRef(current);

  useEffect(() => {
    if (previous.current === current) return;
    previous.current = current;
    if (announceChange) announce(labels.step(current, total));
  }, [current, total, announceChange, announce, labels]);

  return (
    <p
      {...domPassthrough(rest, 'Modal.Indicator')}
      className={className ? `g-indicator ${className}` : 'g-indicator'}
    >
      <span aria-hidden="true">
        {current} / {total}
      </span>
      <span className="g-sr-only">{labels.step(current, total)}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Title                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalTitleProps extends DataAttributes {
  children: ReactNode;
  /** 省略する行数。0 で省略しない。既定 2。T-03。 */
  lines?: number;
  className?: string;
}

/**
 * ダイアログの名前。T-01〜T-09。
 *
 * ここが本仕様でいちばん間違えられている箇所なので、守っていることを明記する。
 *  - 省略は CSS の line-clamp だけで行い、DOM のテキストは常に完全。
 *    したがって aria-labelledby が指す名前も常に完全になる。
 *  - title 属性は使わない（タッチで出ず WCAG 1.4.13 を満たさない）。
 *  - 長押しも使わない（OS のコンテキストメニューと衝突する）。
 *  - 溢れているときだけ展開トグルを出す。トグルの文字列は
 *    aria-labelledby の対象である span の外側に置き、名前に混入させない。
 */
export function ModalTitle({ children, lines = 2, className, ...rest }: ModalTitleProps): ReactNode {
  const labels = useLabels();
  const { ids, setHasTitle } = useModalContext('Modal.Title');
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  useEffect(() => {
    if (lines <= 0) {
      setOverflowing(false);
      return;
    }
    // 展開中は測らない。clamp が外れて溢れ判定が false に反転し、
    // 「折りたたむ」ボタンが消えて戻れなくなる。T-07。
    if (expanded) return;
    const el = textRef.current;
    if (!el) return;

    const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 1);
    measure();

    if (!hasResizeObserver()) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [lines, expanded, children]);

  const clamped = lines > 0 && !expanded;
  const style = { '--g-title-lines': String(lines) } as CSSProperties;

  return (
    <h2
      {...domPassthrough(rest, 'Modal.Title')}
      className={className ? `g-title ${className}` : 'g-title'}
    >
      <span
        id={ids.title}
        ref={textRef}
        className="g-title-text"
        data-clamped={clamped ? '' : undefined}
        style={style}
      >
        {children}
      </span>
      {overflowing ? (
        <button
          type="button"
          className="g-title-toggle"
          aria-expanded={expanded}
          aria-controls={ids.title}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? labels.collapseTitle : labels.expandTitle}
        </button>
      ) : null}
    </h2>
  );
}

/* -------------------------------------------------------------------------- */
/* Description                                                                */
/* -------------------------------------------------------------------------- */

export interface ModalDescriptionProps extends DataAttributes {
  children: ReactNode;
  className?: string;
}

/** aria-describedby として Root に自動で配線される。A-02。 */
export function ModalDescription({ children, className, ...rest }: ModalDescriptionProps): ReactNode {
  const { ids, setHasDescription } = useModalContext('Modal.Description');

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p
      {...domPassthrough(rest, 'Modal.Description')}
      id={ids.description}
      className={className ? `g-desc ${className}` : 'g-desc'}
    >
      {children}
    </p>
  );
}
