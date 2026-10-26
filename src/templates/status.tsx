import { Fragment, useId, type ReactNode } from 'react';

import { Button, CopyButton } from '../button';
import { Timeline } from '../display';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { timeZoneName, useCooldown } from './form';
import { commonLabels, ERROR_STATUSES, errorLabels, maintenanceLabels, type ErrorCopyKey, type ErrorStatus } from './labels';
import { StatusLayout } from './layouts';
import { SiteButtonLink, useSiteConfig, useTemplateLabels, useTimeZone } from './site';

const isRegistered = (status: number): status is (typeof ERROR_STATUSES)[number] => (ERROR_STATUSES as readonly number[]).includes(status);

/** 状態から文言の鍵を引く。登録に無い 4xx / 5xx は '4xx' / '5xx'。 */
function copyKey(status: ErrorStatus | number): ErrorCopyKey {
  if (status === 'offline') return 'offline';
  if (isRegistered(status)) return `${status}` as const;
  return status >= 500 ? '5xx' : '4xx';
}

/**
 * 次の一歩。retry は時間をおくか読み込み直せば直るとき、retryWithStatus はそれに稼働状況を添える（サーバー側の問題）。
 * back は送った内容に問題があるとき、home はページや機能にたどり着けないとき、contact は利用者が自分では直せないとき。
 */
type NextStep = 'retry' | 'retryWithStatus' | 'back' | 'home' | 'contact' | 'signIn' | 'billing';

const NEXT: Record<ErrorCopyKey, NextStep> = {
  '400': 'back',
  '401': 'signIn',
  '402': 'billing',
  '403': 'contact',
  '404': 'home',
  '405': 'back',
  '406': 'back',
  '407': 'retry',
  '408': 'retry',
  '409': 'retry',
  '410': 'home',
  '411': 'back',
  '412': 'retry',
  '413': 'back',
  '414': 'home',
  '415': 'back',
  '416': 'retry',
  '417': 'retry',
  '418': 'home',
  '421': 'retry',
  '422': 'back',
  '423': 'retry',
  '424': 'retry',
  '425': 'retry',
  '426': 'retry',
  '428': 'retry',
  '429': 'retry',
  '431': 'retry',
  '451': 'contact',
  '500': 'retryWithStatus',
  '501': 'home',
  '502': 'retryWithStatus',
  '503': 'retryWithStatus',
  '504': 'retryWithStatus',
  '505': 'retry',
  '506': 'retryWithStatus',
  '507': 'retryWithStatus',
  '508': 'retryWithStatus',
  '510': 'back',
  '511': 'retry',
  offline: 'retry',
  '4xx': 'back',
  '5xx': 'retryWithStatus',
};

export interface ErrorPageProps extends DataAttributes {
  /** HTTP の状態コード（404 など）か 'offline'。既定 404。登録に無い 4xx / 5xx も受ける。 */
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

const ERROR_LABELS = { common: commonLabels, error: errorLabels } as const;

/**
 * 4xx / 5xx とオフラインのページ。P-05。
 *
 * 何が起きたか・なぜか・次に何ができるかを、利用者を責めない言葉で書く。IANA に登録された 4xx / 5xx（ERROR_STATUSES）は
 * それぞれの見出しと説明を持ち、登録に無い状態は 4xx / 5xx の文で出す。次の一歩は状態で変える（401 はログイン、402 は請求の設定、
 * 403・451 は問い合わせ、ページや機能にたどり着けないときはホーム、送った内容に問題があるときは前のページ、
 * 時間をおくか読み込み直せば直るときはもう一度試す。サーバー側の問題には稼働状況も添える）。
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
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(ERROR_LABELS);
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

  const link = (href: string | undefined, label: string, variant: 'primary' | 'secondary' | 'tertiary'): ReactNode =>
    href ? (
      <SiteButtonLink href={href} variant={variant}>
        {label}
      </SiteButtonLink>
    ) : null;
  const back = (variant: 'primary' | 'tertiary'): ReactNode => (
    <Button variant={variant} onClick={() => window.history.back()}>
      {common.back}
    </Button>
  );

  // 請求の設定が無ければ、402 は問い合わせへ案内する
  const step =NEXT[key] === 'billing' && !links.billing ? 'contact' : NEXT[key];
  const defaultActions = ((): ReactNode => {
    switch (step) {
      case 'retry':
      case 'retryWithStatus':
        return (
          <>
            {/* 待つ間は aria-disabled（フォーカスは止まり、待ち時間を説明として読む）。待ち時間は毎秒変わるので読み上げの領域にしない */}
            <Button variant="primary" aria-disabled={waiting || undefined} aria-describedby={waiting ? waitId : undefined} onClick={retry}>
              {common.retry}
            </Button>
            {link(links.home, common.home, 'secondary')}
            {step === 'retryWithStatus' ? link(links.status, common.statusPage, 'tertiary') : null}
          </>
        );
      case 'signIn':
        return (
          <>
            {link(links.signIn, common.signIn, 'primary')}
            {link(links.home, common.home, 'secondary')}
          </>
        );
      case 'billing':
        return (
          <>
            {link(links.billing, common.billing, 'primary')}
            {link(links.home, common.home, 'secondary')}
          </>
        );
      case 'back':
        return (
          <>
            {back('primary')}
            {link(links.home, common.home, 'secondary')}
          </>
        );
      case 'home':
        return (
          <>
            {link(links.home, common.home, 'primary')}
            {back('tertiary')}
          </>
        );
      case 'contact':
        return (
          <>
            {link(links.home, common.home, 'primary')}
            {links.contact ? link(links.contact, common.contactSupport, 'tertiary') : back('tertiary')}
          </>
        );
    }
  })();

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
  /**
   * 予定を表す時間帯（'Asia/Tokyo'）。時間帯の名前も添える。既定は SiteProvider の timeZone、それも無ければ見ている人の
   * 時間帯（サーバーで描いてから hydration を終えるまでは UTC）。
   */
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
  const zone = timeZoneName(locale, timeZone, reference);
  const tail = zone ? [`(${zone})`] : [];
  if (start && end && day.format(start) !== day.format(end)) {
    return { parts: [range(`${day.format(start)} ${time.format(start)}`, `${day.format(end)} ${time.format(end)}`), ...tail], keep: false };
  }
  const times = start && end ? range(time.format(start), time.format(end)) : time.format(reference);
  return { parts: [day.format(reference), times, ...tail], keep: true };
}

const MAINTENANCE_LABELS = { common: commonLabels, maintenance: maintenanceLabels } as const;

/**
 * メンテナンス中のページ。P-06。
 *
 * 予定は見ている人の時間帯（か timeZone）で、時間帯の名前を添えて出す（「10月24日(土) 2:00〜4:00 JST」）。
 * 稼働状況のページがあれば先に案内し、経過の知らせは時刻つきの一覧にする。
 */
export function MaintenancePage({
  start,
  end,
  timeZone: zone,
  updates,
  title,
  description,
  actions,
  children,
  className,
  ...rest
}: MaintenancePageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(MAINTENANCE_LABELS);
  const siteZone = useTimeZone();
  const timeZone = zone ?? siteZone;
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
