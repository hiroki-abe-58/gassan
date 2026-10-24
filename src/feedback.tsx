import { useId, type CSSProperties, type ReactNode } from 'react';

import type { StatusTone } from './display';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export interface ProgressProps extends DataAttributes {
  /** 何の進み具合か。progressbar の名前になる（必須）。 */
  label: string;
  /** いまの値（0〜max）。省略すると「どれだけ進んだか分からない」進捗（indeterminate）。 */
  value?: number;
  /** 既定 100。 */
  max?: number;
  /** 値の読み上げと表示。既定は割合（labels.locale の Intl で「45%」）。 */
  valueText?: (value: number, max: number) => string;
  /** 値を名前の右に出す。既定 true（indeterminate では出さない）。 */
  showValue?: boolean;
  /** 名前を目には出さない（読み上げ名には残す）。 */
  hideLabel?: boolean;
  /** 既定 'accent'。容量の残りなど、段階で色を変えたいときに。 */
  tone?: StatusTone;
  /** 既定 'md'（線の太さ 8px）。sm は 4px。 */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 進み具合の線。U-06。role="progressbar" に aria-valuenow / min / max と、読める値（aria-valuetext）を持たせる。
 * 値が分からないときは aria-valuenow を付けず（indeterminate）、線が流れる。
 */
export function Progress({
  label,
  value,
  max = 100,
  valueText,
  showValue = true,
  hideLabel = false,
  tone = 'accent',
  size = 'md',
  className,
  ...rest
}: ProgressProps): ReactNode {
  const { locale } = useLabels();
  const phrase = usePhrase();
  const labelId = `${useId()}-label`;
  const known = value !== undefined && Number.isFinite(value);
  const clamped = known ? Math.min(Math.max(value, 0), max) : 0;
  const ratio = max > 0 ? clamped / max : 0;
  const text = known
    ? (valueText?.(clamped, max) ?? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio))
    : undefined;
  return (
    <div {...domPassthrough(rest, 'Progress')} className={cx('g-progress', className)} data-tone={tone} data-size={size === 'md' ? undefined : size}>
      <div className={hideLabel ? 'g-sr-only' : 'g-progress-head'}>
        <span id={labelId} className="g-progress-label">
          {phrase(label)}
        </span>
        {known && showValue && !hideLabel ? (
          <span className="g-progress-value" aria-hidden="true">
            {text}
          </span>
        ) : null}
      </div>
      <div
        className="g-progress-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={known ? clamped : undefined}
        aria-valuetext={text}
        data-indeterminate={known ? undefined : ''}
      >
        <span className="g-progress-fill" style={{ '--g-progress': ratio } as CSSProperties} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Spinner / Skeleton                                                         */
/* -------------------------------------------------------------------------- */

export interface SpinnerProps extends DataAttributes {
  /** 読み上げる語。既定 labels.loading（「処理中」）。 */
  label?: string;
  /** 既定 'md'（20px）。 */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** 回る印。U-07。role="status" で「処理中」を一度だけ読み上げる。動きを減らす設定では回転を遅くする。 */
export function Spinner({ label, size = 'md', className, ...rest }: SpinnerProps): ReactNode {
  const labels = useLabels();
  return (
    <span {...domPassthrough(rest, 'Spinner')} className={cx('g-spinner', className)} data-size={size === 'md' ? undefined : size} role="status">
      <span className="g-spinner-ring" aria-hidden="true" />
      <span className="g-sr-only">{label ?? labels.loading}</span>
    </span>
  );
}

export interface SkeletonProps extends DataAttributes {
  /** 既定 'text'（1 行ぶんの高さ）。 */
  shape?: 'text' | 'circle' | 'rect';
  /** 幅と高さ（数は px）。text の既定の幅は 100%、circle は 40px 四方。 */
  width?: number | string;
  height?: number | string;
  /** text の行数。最後の行は短くする。 */
  lines?: number;
  className?: string;
}

const size = (value: number | string | undefined): string | undefined => (typeof value === 'number' ? `${String(value)}px` : value);

/**
 * 読み込む前の骨組み。U-08。飾りなので aria-hidden。読み込み中であることは、置いた器の aria-busy か
 * Spinner で伝える。光が流れる動きは、動きを減らす設定と動きの段 none では止める。
 */
export function Skeleton({ shape = 'text', width, height, lines = 1, className, ...rest }: SkeletonProps): ReactNode {
  const style = { inlineSize: size(width), blockSize: size(height) };
  if (shape === 'text' && lines > 1) {
    return (
      <span {...domPassthrough(rest, 'Skeleton')} className={cx('g-skeleton-lines', className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className="g-skeleton" data-shape="text" style={index === lines - 1 ? { inlineSize: '62%' } : style} />
        ))}
      </span>
    );
  }
  return <span {...domPassthrough(rest, 'Skeleton')} className={cx('g-skeleton', className)} data-shape={shape} style={style} aria-hidden="true" />;
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export interface BannerProps extends DataAttributes {
  children: ReactNode;
  /** 太字で前に置く短い見出し。 */
  title?: ReactNode;
  /** 既定 'info'。 */
  tone?: Exclude<StatusTone, 'accent'>;
  /** 文の右に置く操作（「設定を開く」など）。 */
  action?: ReactNode;
  /** 渡すと × を出す（名前は labels.close）。 */
  onDismiss?: () => void;
  /** 後から出すとき（保存の失敗など）に読み上げる。error は role="alert"、ほかは role="status"。 */
  live?: boolean;
  className?: string;
}

const BANNER_ICON = { info: 'info', success: 'success', warning: 'warning', error: 'error' } as const;

/**
 * ページの上の知らせの帯（メンテナンスの予告・支払いの失敗・試用期間の残り）。U-16。
 * 控えめな地の色だけで本文から分け、枠や左の太い線で囲まない（§5 の 21）。印とトーンの色の文字で種類を示す。
 */
export function Banner({ children, title, tone = 'info', action, onDismiss, live = false, className, ...rest }: BannerProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const icon = tone === 'neutral' ? null : <Icon name={BANNER_ICON[tone]} className="g-banner-icon" />;
  return (
    <div
      {...domPassthrough(rest, 'Banner')}
      className={cx('g-banner', className)}
      data-tone={tone}
      role={live ? (tone === 'error' ? 'alert' : 'status') : undefined}
    >
      {icon}
      <div className="g-banner-body">
        {title ? <p className="g-banner-title">{phrase(title)}</p> : null}
        <div className="g-banner-text">{phrase(children)}</div>
      </div>
      {action ? <div className="g-banner-action">{action}</div> : null}
      {onDismiss ? (
        <button type="button" className="g-iconbtn" data-size="sm" aria-label={labels.close} onClick={onDismiss}>
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  );
}
