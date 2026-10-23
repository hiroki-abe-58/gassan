import { Fragment, useId, type ReactNode } from 'react';

import { Button, CopyButton } from '../button';
import { Timeline } from '../display';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { useCooldown } from './form';
import type { ErrorCopyKey, ErrorStatus } from './labels';
import { StatusLayout } from './layouts';
import { SiteButtonLink, useSite } from './site';

const KNOWN: readonly string[] = ['400', '401', '403', '404', '408', '410', '429', '500', '502', '503', '504'];

/** 状態から文言の鍵を引く。知らない 4xx / 5xx は '4xx' / '5xx'。 */
function copyKey(status: ErrorStatus | number): ErrorCopyKey {
  if (status === 'offline') return 'offline';
  const text = String(status);
  if (KNOWN.includes(text)) return text as ErrorCopyKey;
  return status >= 500 ? '5xx' : '4xx';
}

/** 時間をおけば直る見込みがある状態（もう一度試すを先に出す）。 */
const retryable = (status: ErrorStatus | number): boolean => status === 'offline' || status === 408 || status === 429 || (typeof status === 'number' && status >= 500);

export interface ErrorPageProps extends DataAttributes {
  /** HTTP の状態コード（404 など）か 'offline'。既定 404。知らない 4xx / 5xx も受ける。 */
  status?: ErrorStatus | number;
  title?: ReactNode;
  description?: ReactNode;
  /** 問い合わせ番号（サーバーのログを引く ID）。写すボタンを添える。 */
  reference?: string;
  /** もう一度試す。既定はページの再読み込み。 */
  onRetry?: () => void;
  /** 何秒後に試せるか（429 / 503 の Retry-After）。それまで「もう一度試す」を押せない。 */
  retryAfter?: number;
  /** 既定の操作の代わりに置くもの。 */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * 4xx / 5xx とオフラインのページ。P-05。
 *
 * 何が起きたか・なぜか・次に何ができるかを、利用者を責めない言葉で書く。次の一歩は状態で変える
 * （401 はログイン、403 は権限の依頼、404 はホームと前のページ、408・429・5xx・オフラインはもう一度試す）。
 * 状態コードは大きく見せ、読み上げでは「エラー 404」と読ませる。問い合わせ番号は写せる。
 */
export function ErrorPage({
  status = 404,
  title,
  description,
  reference,
  onRetry,
  retryAfter = 0,
  actions,
  children,
  className,
  ...rest
}: ErrorPageProps): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const { common, error } = labels;
  const key = copyKey(status);
  const waitId = `${useId()}-wait`;
  const { remaining } = useCooldown(retryAfter, retryAfter > 0);
  const waiting = remaining > 0;
  const retry = onRetry ?? (() => window.location.reload());

  const visual =
    status === 'offline' ? (
      <Icon name="wifiOff" className="g-status-icon" />
    ) : (
      <span className="g-status-code">
        <span className="g-sr-only">{error.code} </span>
        {status}
      </span>
    );

  const home = links.home ? (
    <SiteButtonLink href={links.home} variant={retryable(status) || status === 401 ? 'secondary' : 'primary'}>
      {common.home}
    </SiteButtonLink>
  ) : null;

  const defaultActions = retryable(status) ? (
    <>
      {/* 待つ間は aria-disabled（フォーカスは止まり、待ち時間を説明として読む）。待ち時間は毎秒変わるので読み上げの領域にしない */}
      <Button variant="primary" aria-disabled={waiting || undefined} aria-describedby={waiting ? waitId : undefined} onClick={retry}>
        {common.retry}
      </Button>
      {home}
      {links.status && key !== 'offline' && key !== '408' && key !== '429' ? (
        <SiteButtonLink href={links.status} variant="tertiary">
          {common.statusPage}
        </SiteButtonLink>
      ) : null}
    </>
  ) : status === 401 ? (
    <>
      {links.signIn ? (
        <SiteButtonLink href={links.signIn} variant="primary">
          {common.signIn}
        </SiteButtonLink>
      ) : null}
      {home}
    </>
  ) : (
    <>
      {home}
      {status === 403 && links.contact ? (
        <SiteButtonLink href={links.contact} variant="tertiary">
          {common.contactSupport}
        </SiteButtonLink>
      ) : (
        <Button variant="tertiary" onClick={() => window.history.back()}>
          {common.back}
        </Button>
      )}
    </>
  );

  return (
    <StatusLayout
      {...domPassthrough(rest, 'ErrorPage')}
      className={className}
      visual={visual}
      title={title ?? error.titles[key]}
      description={description ?? error.descriptions[key]}
      actions={actions ?? defaultActions}
    >
      {waiting ? (
        <p id={waitId} className="g-status-hint">
          {phrase(error.retryIn(remaining))}
        </p>
      ) : null}
      {reference ? (
        <p className="g-status-reference">
          <span>{phrase(common.reference)}</span>
          <code>{reference}</code>
          <CopyButton value={reference} label={common.copyReference} size="sm" />
        </p>
      ) : null}
      {children}
    </StatusLayout>
  );
}

export interface MaintenanceUpdate {
  /** 機械が読む日時（Date か ISO 8601 の文字列）。 */
  time: Date | string;
  text: ReactNode;
  key?: string;
}

export interface MaintenancePageProps extends DataAttributes {
  /** 始まりの予定（Date か ISO 8601 の文字列）。 */
  start?: Date | string;
  /** 終わりの予定。 */
  end?: Date | string;
  /** 予定を表す時間帯（'Asia/Tokyo'）。既定は見ている人の時間帯。時間帯の名前も添える。 */
  timeZone?: string;
  /** 経過の知らせ（新しい順）。 */
  updates?: readonly MaintenanceUpdate[];
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

/**
 * 予定の文（「10月24日(土) 2:00〜4:00 (JST)」）を、折ってはいけないまとまり（日付・時刻の範囲・時間帯）に分けて返す。
 * 同じ日なら日付は 1 度だけ書き、時間帯の名前を末尾に添える。日をまたぐ範囲は 1 つの長い文なので、まとまりにしない。
 * Intl の formatRange は日本語で「2時00分」の形になり、ほかの日時の書き方とそろわないので使わない。
 */
function scheduleParts(
  locale: string,
  timeZone: string | undefined,
  range: (start: string, end: string) => string,
  start: Date | undefined,
  end: Date | undefined,
): { parts: string[]; keep: boolean } | null {
  const day = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', weekday: 'short', timeZone });
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone });
  const reference = start ?? end;
  if (!reference) return null;
  const zone = new Intl.DateTimeFormat(locale, { timeZoneName: 'short', timeZone }).formatToParts(reference).find((part) => part.type === 'timeZoneName')?.value;
  const tail = zone ? [`(${zone})`] : [];
  if (start && end && day.format(start) !== day.format(end)) {
    return { parts: [range(`${day.format(start)} ${time.format(start)}`, `${day.format(end)} ${time.format(end)}`), ...tail], keep: false };
  }
  const times = start && end ? range(time.format(start), time.format(end)) : time.format(reference);
  return { parts: [day.format(reference), times, ...tail], keep: true };
}

/**
 * メンテナンス中のページ。P-06。
 *
 * 予定は見ている人の時間帯（か timeZone）で、時間帯の名前を添えて出す（「10月24日(土) 2:00〜4:00 JST」）。
 * 稼働状況のページがあれば先に案内し、経過の知らせは時刻つきの一覧にする。
 */
export function MaintenancePage({
  start,
  end,
  timeZone,
  updates,
  title,
  description,
  actions,
  children,
  className,
  ...rest
}: MaintenancePageProps): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const updatesId = `${useId()}-updates`;
  const { common, maintenance } = labels;
  const short = new Intl.DateTimeFormat(labels.locale, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone });
  const plan = scheduleParts(labels.locale, timeZone, maintenance.range, start ? toDate(start) : undefined, end ? toDate(end) : undefined);
  // 終わりだけなら文にする（「… に終わる予定です」）。それ以外は、まとまりの中で折らない（「上午｜4:00」と折れないように）。
  const schedule = !plan
    ? null
    : end && !start
      ? phrase(maintenance.until(plan.parts.join(' ')))
      : plan.parts.map((part, index) => (
          <Fragment key={part}>
            {index > 0 ? ' ' : null}
            {plan.keep ? <span className="g-status-keep">{part}</span> : phrase(part)}
          </Fragment>
        ));

  const defaultActions = (
    <>
      {links.status ? (
        <SiteButtonLink href={links.status} variant="primary">
          {common.statusPage}
        </SiteButtonLink>
      ) : null}
      <Button variant={links.status ? 'secondary' : 'primary'} onClick={() => window.location.reload()}>
        {maintenance.reload}
      </Button>
    </>
  );

  return (
    <StatusLayout
      {...domPassthrough(rest, 'MaintenancePage')}
      className={className}
      visual={<Icon name="wrench" className="g-status-icon" />}
      title={title ?? maintenance.title}
      description={description ?? maintenance.description}
      actions={actions ?? defaultActions}
    >
      {schedule ? (
        <dl className="g-status-schedule">
          <dt>{phrase(maintenance.schedule)}</dt>
          <dd>{schedule}</dd>
        </dl>
      ) : null}
      {updates && updates.length > 0 ? (
        <section className="g-status-updates" aria-labelledby={updatesId}>
          <h2 id={updatesId} className="g-status-updates-title">
            {phrase(maintenance.updates)}
          </h2>
          <Timeline
            items={updates.map((update, index) => {
              const at = toDate(update.time);
              return { key: update.key ?? String(index), title: update.text, time: at.toISOString(), timeLabel: short.format(at) };
            })}
          />
        </section>
      ) : null}
      {children}
    </StatusLayout>
  );
}
