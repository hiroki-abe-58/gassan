import { useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import { Badge, DescriptionList, Timeline, type StatusTone } from '../display';
import { Banner } from '../feedback';
import { useRoving } from '../internal/chart-parts';
import { parseISO } from '../internal/dates';
import { domPassthrough } from '../internal/passthrough';
import { useLabels } from '../labels';
import { usePhrase } from '../phrase';
import { EmailForm } from './auth-parts';
import { formatDateTime, type SubmitResult } from './form';
import { changelogLabels, serviceStatusLabels } from './labels';
import { WithSiteLayout, jumpTo, type PublicPage } from './site-layout';
import { SiteLink, useSiteConfig, useTemplateLabels, useTimeZone } from './site';

/** 部分と日ごとの状態。軽い順に operational・maintenance・degraded・partial・major。 */
export type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance';

export interface ServiceDay {
  /** その日（'YYYY-MM-DD'。サービスが記録している時間帯の暦の日のまま出す）。 */
  date: string;
  /** その日のいちばん重い状態。null は記録なし。 */
  status: ServiceStatus | null;
  /** その日の出来事（「API の遅延 2 時間 15 分」）。日の升の読み上げに添える。 */
  note?: string;
}

export interface ServiceComponent {
  id: string;
  name: string;
  description?: ReactNode;
  status: ServiceStatus;
  /** 古い順の日ごとの状態（最後が今日）。渡すと稼働の帯を出す。 */
  days?: readonly ServiceDay[];
  /** days の期間の稼働率（％。99.98 なら 99.98）。小数第 2 位で切り捨てて出す（99.995 を 100.00% と見せない）。 */
  uptime?: number;
}

export type IncidentStage = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  /** 日時（Date か ISO 8601）。 */
  time: Date | string;
  stage: IncidentStage;
  text: ReactNode;
  key?: string;
}

export interface ServiceIncident {
  id: string;
  title: string;
  impact: Exclude<ServiceStatus, 'operational'>;
  /** 新しい順の経過。最初の段階がいまの段階で、resolved でなければ対応中として先に並べる。 */
  updates: readonly IncidentUpdate[];
  /** 影響を受けた部分（components の id）。 */
  components?: readonly string[];
  /** 障害の詳しいページ。渡すと見出しをリンクにする。 */
  href?: string;
}

export interface ServiceStatusPageProps extends PublicPage {
  components: readonly ServiceComponent[];
  /** 新しい順。 */
  incidents?: readonly ServiceIncident[];
  /** 状態を最後に確かめた日時。 */
  updatedAt?: Date | string;
  /** 渡すと「更新を受け取る」の節にメールの登録を出す。確認のメールを送り、送れたら送った先を読み上げる。 */
  onSubscribe?: (email: string) => SubmitResult | Promise<SubmitResult>;
  /** RSS / Atom のフィードの行き先。 */
  feedHref?: string;
}

const SERVICE_STATUS_LABELS = { serviceStatus: serviceStatusLabels, changelog: changelogLabels } as const;

const SEVERITY: readonly ServiceStatus[] = ['operational', 'maintenance', 'degraded', 'partial', 'major'];
const TONES: Record<ServiceStatus, 'success' | 'info' | 'warning' | 'error'> = {
  operational: 'success',
  maintenance: 'info',
  degraded: 'warning',
  partial: 'warning',
  major: 'error',
};
const STAGE_TONES: Record<IncidentStage, StatusTone> = { investigating: 'error', identified: 'warning', monitoring: 'info', resolved: 'success' };
/** 問題のあった日に数える状態（メンテナンスは数えない）。 */
const PROBLEMS: ReadonlySet<ServiceStatus | null> = new Set<ServiceStatus | null>(['degraded', 'partial', 'major']);

/** いちばん重い状態。 */
const worst = (statuses: readonly ServiceStatus[]): ServiceStatus =>
  statuses.reduce<ServiceStatus>((current, status) => (SEVERITY.indexOf(status) > SEVERITY.indexOf(current) ? status : current), 'operational');

/** 稼働率を小数第 2 位で切り捨てて書く（浮動小数の誤差で 99.98 を 99.97 にしないよう、わずかに足してから切る）。 */
const percent = (uptime: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.floor(uptime * 100 + 1e-9) / 10000);

/**
 * 過去の日ごとの稼働の帯。名前のある 1 行の表（role="grid"）で、日の升は 1 つだけが Tab で止まる（既定は今日）。
 * ←→ で日を、Home / End で端へ移る。ポインタは帯全体で日を選ぶ（細い升に当てさせない）。指した日は下に出す。
 */
function UptimeBar({ name, days, uptime }: { name: string; days: readonly ServiceDay[]; uptime?: number }): ReactNode {
  const labels = useTemplateLabels(SERVICE_STATUS_LABELS);
  const { serviceStatus: s } = labels;
  const gassan = useLabels();
  const summaryId = useId();
  const roving = useRoving(days.length, days.length - 1);
  const format = new Intl.DateTimeFormat(labels.locale, { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' });
  const texts = days.map((day) => s.day(format.format(parseISO(day.date)), s.statuses[day.status ?? 'none'], day.note));
  const issues = days.filter((day) => PROBLEMS.has(day.status)).length;
  const pick = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    roving.setHovered(Math.min(Math.max(Math.floor(((event.clientX - rect.left) / rect.width) * days.length), 0), days.length - 1));
  };
  const active = roving.active;
  return (
    <div className="g-uptime">
      <div role="grid" aria-label={s.uptimeOf(name, days.length)} aria-describedby={summaryId}>
        <div role="row" className="g-uptime-days" onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => roving.setHovered(null)}>
          {days.map((day, index) => (
            <span
              key={day.date}
              role="gridcell"
              className="g-uptime-day"
              data-status={day.status ?? 'none'}
              data-active={active === index ? '' : undefined}
              {...roving.hitProps(index)}
            >
              <span className="g-sr-only">{texts[index]}</span>
            </span>
          ))}
        </div>
      </div>
      {/* 目盛りと指した日は見た目だけ（読み上げは日の升と、帯の説明で伝える） */}
      <div className="g-uptime-axis" aria-hidden="true">
        <span>{s.daysAgo(days.length - 1)}</span>
        <span className="g-uptime-readout">{active === null ? null : texts[active]}</span>
        <span>{gassan.today}</span>
      </div>
      {/* 2 つの文の間の空白は、並べ方（flex）では見えないが、帯の説明として読むときの区切りになる */}
      <p id={summaryId} className="g-uptime-summary">
        {uptime === undefined ? null : (
          <>
            <span>{s.uptime(percent(uptime, labels.locale))}</span>{' '}
          </>
        )}
        <span>{s.issueDays(issues, days.length)}</span>
      </p>
    </div>
  );
}

/** 障害の一覧。見出し・影響と段階の言葉の印・影響を受けた部分・経過（U-15）。 */
function IncidentList({ incidents, nameOf }: { incidents: readonly ServiceIncident[]; nameOf: (id: string) => string }): ReactNode {
  const labels = useTemplateLabels(SERVICE_STATUS_LABELS);
  const { serviceStatus: s } = labels;
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const base = useId();
  const list = new Intl.ListFormat(labels.locale, { type: 'conjunction' });
  return (
    <ol className="g-incidents">
      {incidents.map((incident) => {
        const headingId = `${base}-${incident.id}`;
        const stage = incident.updates[0]?.stage;
        return (
          <li key={incident.id}>
            <article className="g-incident" aria-labelledby={headingId}>
              <div className="g-incident-head">
                <h3 id={headingId} className="g-incident-title">
                  {incident.href ? <SiteLink href={incident.href}>{phrase(incident.title)}</SiteLink> : phrase(incident.title)}
                </h3>
                <Badge tone={TONES[incident.impact]}>{s.statuses[incident.impact]}</Badge>
                {stage ? <Badge tone={STAGE_TONES[stage]}>{s.stages[stage]}</Badge> : null}
              </div>
              {incident.components && incident.components.length > 0 ? (
                <DescriptionList items={[{ term: s.affected, details: list.format(incident.components.map(nameOf)) }]} />
              ) : null}
              <Timeline
                items={incident.updates.map((update, index) => {
                  const { text, iso } = formatDateTime(update.time, labels.locale, timeZone);
                  return { key: update.key ?? String(index), title: s.stages[update.stage], time: iso, timeLabel: text, description: update.text, tone: STAGE_TONES[update.stage] };
                })}
              />
            </article>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * 稼働状況。P-39。公開ページ（既定で SiteLayout に包む。いまのページは links.status）。
 *
 * 全体の状態（いちばん重い部分の状態の文。変わったら role="status" で読む）・対応中の障害・部分ごとの状態（言葉の印）と
 * 稼働の帯と稼働率・過去の障害（段階の言葉と time 要素の経過）・更新を受け取る（メールの登録とフィード）を並べる。
 */
export function ServiceStatusPage({
  components,
  incidents = [],
  updatedAt,
  onSubscribe,
  feedHref,
  title,
  description,
  layout = true,
  className,
  ...rest
}: ServiceStatusPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(SERVICE_STATUS_LABELS);
  const { serviceStatus: s, changelog } = labels;
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const base = useId();
  const subscribeId = `${base}-subscribe`;
  const subscribeRef = useRef<HTMLHeadingElement>(null);
  const [subscribed, setSubscribed] = useState<string | null>(null);
  const overall = worst(components.map((component) => component.status));
  const ongoing = incidents.filter((incident) => incident.updates[0]?.stage !== 'resolved');
  const past = incidents.filter((incident) => incident.updates[0]?.stage === 'resolved');
  const nameOf = (id: string): string => components.find((component) => component.id === id)?.name ?? id;
  const updated = updatedAt === undefined ? null : formatDateTime(updatedAt, labels.locale, timeZone);
  const subscribable = onSubscribe !== undefined || feedHref !== undefined;

  return (
    <WithSiteLayout layout={layout} current={links.status} className={className} data={domPassthrough(rest, 'ServiceStatusPage')}>
      <div className="g-service-status">
        <header className="g-public-header">
          <h1 className="g-public-title">{phrase(title ?? s.title)}</h1>
          <p className="g-public-description">{phrase(description ?? s.description)}</p>
          {subscribable ? (
            <p className="g-service-jump">
              <a href={`#${subscribeId}`} className="g-auth-link" onClick={(event) => jumpTo(event, subscribeId)}>
                {phrase(s.subscribe)}
              </a>
            </p>
          ) : null}
        </header>
        <div role="status" className="g-service-overall">
          <Banner tone={TONES[overall]} title={s.overall[overall]}>
            {updated ? <time dateTime={updated.iso}>{s.updated(updated.text)}</time> : null}
          </Banner>
        </div>
        {ongoing.length > 0 ? (
          <section className="g-service-section" aria-labelledby={`${base}-active`}>
            <h2 id={`${base}-active`} className="g-service-heading">
              {phrase(s.active)}
            </h2>
            <IncidentList incidents={ongoing} nameOf={nameOf} />
          </section>
        ) : null}
        <section className="g-service-section" aria-labelledby={`${base}-components`}>
          <h2 id={`${base}-components`} className="g-service-heading">
            {phrase(s.components)}
          </h2>
          <ul className="g-service-components">
            {components.map((component) => (
              <li key={component.id} className="g-service-component">
                <div className="g-service-component-head">
                  <h3 className="g-service-component-name">{phrase(component.name)}</h3>
                  <Badge tone={TONES[component.status]} dot>
                    {s.statuses[component.status]}
                  </Badge>
                </div>
                {component.description ? <p className="g-service-component-description">{phrase(component.description)}</p> : null}
                {component.days && component.days.length > 0 ? <UptimeBar name={component.name} days={component.days} uptime={component.uptime} /> : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="g-service-section" aria-labelledby={`${base}-history`}>
          <h2 id={`${base}-history`} className="g-service-heading">
            {phrase(s.history)}
          </h2>
          {past.length > 0 ? <IncidentList incidents={past} nameOf={nameOf} /> : <p className="g-service-empty">{phrase(s.noIncidents)}</p>}
        </section>
        {subscribable ? (
          <section className="g-service-section g-service-subscribe" aria-labelledby={subscribeId}>
            <h2 id={subscribeId} ref={subscribeRef} tabIndex={-1} className="g-service-heading">
              {phrase(s.subscribe)}
            </h2>
            {onSubscribe ? (
              <>
                <p className="g-service-subscribe-description">{phrase(s.subscribeDescription)}</p>
                {subscribed === null ? (
                  <EmailForm
                    onSubmit={({ email }) => onSubscribe(email)}
                    onSent={(email) => {
                      setSubscribed(email);
                      // 送ると欄とボタンが消えるので、節の見出しへフォーカスを移す（結果は下の status で読む）
                      subscribeRef.current?.focus();
                    }}
                    submit={s.subscribeSubmit}
                  />
                ) : null}
                <p role="status" className="g-live">
                  {subscribed === null ? null : phrase(s.subscribed(subscribed))}
                </p>
              </>
            ) : null}
            {feedHref ? (
              <SiteLink href={feedHref} className="g-auth-link">
                {phrase(changelog.subscribe)}
              </SiteLink>
            ) : null}
          </section>
        ) : null}
      </div>
    </WithSiteLayout>
  );
}
