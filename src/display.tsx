import { Children, useId, useState, type ReactNode } from 'react';

import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

/** 状態の色。印・地の色・メーターに載せる（どれも面と 4.5:1 以上）。error は --g-danger。 */
export type StatusTone = 'neutral' | 'accent' | 'success' | 'info' | 'warning' | 'error';
type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

export interface BadgeProps extends DataAttributes {
  children: ReactNode;
  /** 既定 'neutral'。 */
  tone?: StatusTone;
  /** 文字の前に小さな点を置く（状態の一覧で揃えて見せるとき）。 */
  dot?: boolean;
  className?: string;
}

/**
 * 状態や件数を短い語で示す印。U-04。
 * 薄い地の色とトーンの色の文字（4.5:1 以上）で描き、色だけで伝えない（必ず語を入れる）。
 */
export function Badge({ children, tone = 'neutral', dot = false, className, ...rest }: BadgeProps): ReactNode {
  const phrase = usePhrase();
  return (
    <span {...domPassthrough(rest, 'Badge')} className={cx('g-badge', className)} data-tone={tone}>
      {dot ? <span className="g-badge-dot" aria-hidden="true" /> : null}
      {phrase(children)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarProps extends DataAttributes {
  /** 人や組織の名前。読み上げ名になり、画像が無いときは頭文字を出す。 */
  name: string;
  /** 画像。読めなければ頭文字に戻す。 */
  src?: string;
  /** 既定 'md'（40px）。 */
  size?: AvatarSize;
  /** 既定 'circle'。組織やプロジェクトには 'square'。 */
  shape?: 'circle' | 'square';
  className?: string;
}

/** 頭文字。空白で区切る名前（英字）は最初の 2 語の頭、それ以外（日本語など）は最初の 1 文字。 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2 && /^[\p{Script=Latin}\d]/u.test(words[0] ?? '')) {
    return words
      .slice(0, 2)
      .map((word) => [...word][0] ?? '')
      .join('')
      .toUpperCase();
  }
  return ([...name.trim()][0] ?? '').toUpperCase();
}

/** 名前から決まる色相（同じ名前はいつも同じ色）。 */
function hueOf(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 360;
  return hash;
}

/**
 * 人や組織の顔。U-05。画像は飾り（alt=""）で、名前は器の読み上げ名（role="img"）に持たせる。
 * 画像が無い・読めないときは、名前の頭文字を名前から決まる色の地に出す（地は面と混ぜるので、明暗どちらでも文字が読める）。
 */
export function Avatar({ name, src, size = 'md', shape = 'circle', className, ...rest }: AvatarProps): ReactNode {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(src) && failed !== src;
  return (
    <span
      {...domPassthrough(rest, 'Avatar')}
      className={cx('g-avatar', className)}
      data-size={size}
      data-shape={shape === 'circle' ? undefined : shape}
      role="img"
      aria-label={name}
      style={{ ['--g-avatar-hue' as string]: hueOf(name) }}
    >
      {showImage ? (
        <img src={src} alt="" onError={() => setFailed(src ?? null)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}

export interface AvatarGroupProps extends DataAttributes {
  /** Avatar を並べる。 */
  children: ReactNode;
  /** 見せる数。超えた分は「+3」にまとめ、読み上げは labels.moreCount（「ほか3人」）。既定 4。 */
  max?: number;
  /** まとまりの名前（「担当者」など）。 */
  label?: string;
  size?: AvatarSize;
  className?: string;
}

/** 重ねて並べたアバター。U-05。 */
export function AvatarGroup({ children, max = 4, label, size = 'md', className, ...rest }: AvatarGroupProps): ReactNode {
  const labels = useLabels();
  const all = Children.toArray(children);
  const shown = all.slice(0, Math.max(1, max));
  const hidden = all.length - shown.length;
  return (
    <span {...domPassthrough(rest, 'AvatarGroup')} className={cx('g-avatar-group', className)} data-size={size} role="group" aria-label={label}>
      {shown}
      {hidden > 0 ? (
        <span className="g-avatar" data-size={size} data-more="" role="img" aria-label={labels.moreCount(hidden)}>
          <span aria-hidden="true">+{hidden}</span>
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Kbd / Divider                                                              */
/* -------------------------------------------------------------------------- */

export interface KbdProps extends DataAttributes {
  children: ReactNode;
  className?: string;
}

/** キーの表記（⌘K・Esc など）。U-09。 */
export function Kbd({ children, className, ...rest }: KbdProps): ReactNode {
  return (
    <kbd {...domPassthrough(rest, 'Kbd')} className={cx('g-kbd', className)}>
      {children}
    </kbd>
  );
}

export interface DividerProps extends DataAttributes {
  /** 既定 'horizontal'。 */
  orientation?: 'horizontal' | 'vertical';
  /** 線の中央に置く語（「または」など）。語は読み上げ、線は飾りにする。 */
  label?: ReactNode;
  className?: string;
}

/**
 * 区切りの線。U-10。横は hr（separator）、縦は role="separator" と aria-orientation。
 * 語を添えるときは separator にしない（separator の中身は読まれないため）。線は飾りで、語だけを読む。
 */
export function Divider({ orientation = 'horizontal', label, className, ...rest }: DividerProps): ReactNode {
  const phrase = usePhrase();
  const props = domPassthrough(rest, 'Divider');
  if (label) {
    return (
      <div {...props} className={cx('g-divider', className)} data-label="">
        <span className="g-divider-label">{phrase(label)}</span>
      </div>
    );
  }
  if (orientation === 'vertical') {
    return <span {...props} className={cx('g-divider', className)} data-orientation="vertical" role="separator" aria-orientation="vertical" />;
  }
  return <hr {...props} className={cx('g-divider', className)} />;
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

export interface CardProps extends DataAttributes {
  /** 見出し。渡すと、カードはその名前の region になる。 */
  title?: ReactNode;
  /** 見出しの下の補足。 */
  description?: ReactNode;
  /** 見出しの右に置く操作（ボタン・メニュー）。 */
  actions?: ReactNode;
  children?: ReactNode;
  /** 下端に置く操作や補足。 */
  footer?: ReactNode;
  /** 見出しの段。既定 3。 */
  headingLevel?: HeadingLevel;
  /** カード全体を押せるリンクにする（見出しがリンクになり、当たりをカードいっぱいに広げる）。 */
  href?: string;
  className?: string;
}

/**
 * まとまりの面。U-11。枠は 1px の線と面の色だけで、左の太い線や色の囲みでは強調しない（§5 の 21）。
 * href を渡すと、見出しのリンクの当たりをカードいっぱいに広げる（カード全体を a や button で包まない。
 * 中の操作が入れ子の対話要素になり、読み上げ名が中身全部になるため）。中の操作はリンクより上で押せる。
 */
export function Card({ title, description, actions, children, footer, headingLevel = 3, href, className, ...rest }: CardProps): ReactNode {
  const phrase = usePhrase();
  const titleId = `${useId()}-title`;
  const Heading = `h${String(headingLevel)}` as 'h3';
  const hasHeader = Boolean(title || description || actions);
  return (
    <section
      {...domPassthrough(rest, 'Card')}
      className={cx('g-card', className)}
      data-link={href ? '' : undefined}
      aria-labelledby={title ? titleId : undefined}
    >
      {hasHeader ? (
        <div className="g-card-header">
          <div className="g-card-heading">
            {title ? (
              <Heading id={titleId} className="g-card-title">
                {href ? (
                  <a className="g-card-link" href={href}>
                    {phrase(title)}
                  </a>
                ) : (
                  phrase(title)
                )}
              </Heading>
            ) : null}
            {description ? <p className="g-card-description">{phrase(description)}</p> : null}
          </div>
          {actions ? <div className="g-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children ? <div className="g-card-body">{phrase(children)}</div> : null}
      {footer ? <div className="g-card-footer">{footer}</div> : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                       */
/* -------------------------------------------------------------------------- */

export interface StatProps extends DataAttributes {
  /** 何の数か（「今月の売上」）。 */
  label: ReactNode;
  /** 数（書式を整えた文字列で渡す）。 */
  value: ReactNode;
  /** 前との差（「+12%」）。向きは符号でも書く（色と矢印だけに頼らない）。 */
  delta?: ReactNode;
  /** 差の向き。既定 'flat'。 */
  trend?: 'up' | 'down' | 'flat';
  /** 上がるのが良いか、下がるのが良いか（解約率なら 'down'）。良い向きを成功の色、悪い向きを危険の色で描く。既定 'up'。 */
  goodWhen?: 'up' | 'down';
  /** 差の基準などの補足（「前月比」）。 */
  description?: ReactNode;
  className?: string;
}

/**
 * 数の要約（ダッシュボードの KPI）。U-12。名前と値の組なので dl で書く。
 * 差の色は「良いか悪いか」で決め（上がる＝良いとは限らない）、向きは矢印と符号でも伝える。
 */
export function Stat({ label, value, delta, trend = 'flat', goodWhen = 'up', description, className, ...rest }: StatProps): ReactNode {
  const phrase = usePhrase();
  const quality = trend === 'flat' ? 'flat' : trend === goodWhen ? 'good' : 'bad';
  return (
    <dl {...domPassthrough(rest, 'Stat')} className={cx('g-stat', className)}>
      <dt className="g-stat-label">{phrase(label)}</dt>
      <dd className="g-stat-value">{value}</dd>
      {delta ? (
        <dd className="g-stat-delta" data-trend={trend} data-quality={quality}>
          {trend === 'flat' ? null : <Icon name={trend === 'up' ? 'arrowUp' : 'arrowDown'} className="g-stat-arrow" />}
          {delta}
          {description ? <span className="g-stat-description">{phrase(description)}</span> : null}
        </dd>
      ) : description ? (
        <dd className="g-stat-description">{phrase(description)}</dd>
      ) : null}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps extends DataAttributes {
  /** 何が無いか（「まだプロジェクトがありません」）。 */
  title: ReactNode;
  /** 次に何をすればよいか。 */
  description?: ReactNode;
  /** 印。既定は空の箱。飾りなので aria-hidden にして渡す。 */
  icon?: ReactNode;
  /** 最初の一歩のボタン。 */
  actions?: ReactNode;
  /** 見出しの段。既定 2。 */
  headingLevel?: HeadingLevel;
  className?: string;
}

/** 空の一覧・検索結果なし・最初の一歩。U-13。何が無いかと、次にすることを書く。 */
export function EmptyState({ title, description, icon, actions, headingLevel = 2, className, ...rest }: EmptyStateProps): ReactNode {
  const phrase = usePhrase();
  const Heading = `h${String(headingLevel)}` as 'h2';
  return (
    <div {...domPassthrough(rest, 'EmptyState')} className={cx('g-empty', className)}>
      <div className="g-empty-icon">{icon ?? <Icon name="inbox" />}</div>
      <Heading className="g-empty-title">{phrase(title)}</Heading>
      {description ? <p className="g-empty-description">{phrase(description)}</p> : null}
      {actions ? <div className="g-empty-actions">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DescriptionList                                                            */
/* -------------------------------------------------------------------------- */

export interface DescriptionItem {
  term: ReactNode;
  details: ReactNode;
  /** 並びの識別子。term が文字列なら省略できる。 */
  key?: string;
}

export interface DescriptionListProps extends DataAttributes {
  items: readonly DescriptionItem[];
  /** 既定 'inline'（広いときは名前を左、値を右。狭いときは縦に積む）。'stacked' はいつも縦。 */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/** 名前と値の一覧（設定・請求先・詳細）。U-14。dl / dt / dd で書く。 */
export function DescriptionList({ items, layout = 'inline', className, ...rest }: DescriptionListProps): ReactNode {
  const phrase = usePhrase();
  return (
    <dl {...domPassthrough(rest, 'DescriptionList')} className={cx('g-dl', className)} data-layout={layout}>
      {items.map((item, index) => (
        <div key={item.key ?? (typeof item.term === 'string' ? item.term : String(index))} className="g-dl-row">
          <dt>{phrase(item.term)}</dt>
          <dd>{phrase(item.details)}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

export interface TimelineItem {
  title: ReactNode;
  /** 機械が読む日時（'2026-10-23' / '2026-10-23T14:05'）。time 要素の dateTime になる。 */
  time?: string;
  /** 見せる日時（「10月23日 14:05」）。省略すると time をそのまま出す。 */
  timeLabel?: ReactNode;
  description?: ReactNode;
  /** 点の色。既定 'neutral'。 */
  tone?: StatusTone;
  key?: string;
}

export interface TimelineProps extends DataAttributes {
  items: readonly TimelineItem[];
  className?: string;
}

/** 出来事の並び（活動の記録・配送の状況）。U-15。順序のある一覧（ol）で、日時は time 要素。 */
export function Timeline({ items, className, ...rest }: TimelineProps): ReactNode {
  const phrase = usePhrase();
  return (
    <ol {...domPassthrough(rest, 'Timeline')} className={cx('g-timeline', className)}>
      {items.map((item, index) => (
        <li key={item.key ?? `${item.time ?? ''}-${String(index)}`} className="g-timeline-item" data-tone={item.tone ?? 'neutral'}>
          <span className="g-timeline-dot" aria-hidden="true" />
          <div className="g-timeline-body">
            <p className="g-timeline-title">{phrase(item.title)}</p>
            {item.time ? (
              <time className="g-timeline-time" dateTime={item.time}>
                {item.timeLabel ?? item.time}
              </time>
            ) : null}
            {item.description ? <div className="g-timeline-description">{phrase(item.description)}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
