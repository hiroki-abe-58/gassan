import { useRef, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalDateRangePicker, commonDateRanges } from '../calendar';
import { DataTable, type DataTableColumn } from '../data-table';
import type { DateRange } from '../internal/dates';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { useLabels } from '../labels';
import { Pagination } from '../navigation';
import { PageHeader } from '../page-header';
import { ModalSelect, type SelectOption } from '../select';
import { formatDateTime, runAction, timeZoneName, type SubmitResult } from './form';
import { auditLogLabels, commonLabels } from './labels';
import { SearchForm, useNotice } from './page-parts';
import { useTemplateLabels, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface AuditEvent {
  id: string;
  /** 日時（Date か ISO 8601）。 */
  time: Date | string;
  /** 操作した人（名前・API キーの名前・「システム」）。 */
  actor: string;
  /** 補足（メールアドレスなど）。 */
  actorDetail?: string;
  /** 何をしたか（「メンバーを招待した」）。 */
  action: string;
  /** 操作の対象。 */
  target?: string;
  ip?: string;
  /** 場所（「東京, 日本」）。 */
  location?: string;
}

export interface AuditLogQuery {
  /** 探す言葉。送ったとき（Enter か「検索」）に変わる。 */
  text: string;
  /** 操作の種類（actions の value）。null はすべて。 */
  action: string | null;
  /** 期間（両端を含む）。null はすべて。 */
  range: DateRange | null;
  /** ページ（1 から）。条件を変えると 1 に戻す。 */
  page: number;
}

export interface AuditLogPageProps extends DataAttributes {
  /** いまのページの記録（新しい順）。絞り込みとページ分けは利用側（サーバー）で行う。 */
  events: readonly AuditEvent[];
  query: AuditLogQuery;
  onQueryChange: (query: AuditLogQuery) => void;
  /** 条件に合う記録の数（全ページの合計）。 */
  total: number;
  pageCount: number;
  /** 操作の種類。渡すと「操作」で絞り込める。 */
  actions?: readonly SelectOption[];
  /** 渡すと「CSV で書き出す」を出す。いまの条件を渡す。 */
  onExport?: (query: AuditLogQuery) => SubmitResult | Promise<SubmitResult>;
  /** 読み込み中。表を骨組みにし（行の数はいま渡している記録の数にそろえ、高さを保つ）、件数を空にする（読み込み終えたら、同じ数でも読み上げ直す）。 */
  loading?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const AUDIT_LOG_LABELS = { common: commonLabels, auditLog: auditLogLabels } as const;

/** 「すべての操作」の値（ModalSelect の選択肢として置き、渡すときは null にする）。 */
const ALL = '';

/**
 * 監査ログ。P-37。AppShell の中に置く中身。
 *
 * 記録の表（U-26。操作した人・操作・対象・IP アドレスと場所・日時（秒まで。見出しに時間帯の名前を添える））を新しい順に並べる。
 * 探す言葉は送ったとき（Enter か「検索」）に、操作の種類と期間は選んだときに絞り込み、条件を変えたら 1 ページ目に戻す。
 * 条件をクリアしたら探す欄へフォーカスを戻す。条件に合う数は role="status" で読み上げる。CSV の書き出しはいまの条件を渡す。
 */
export function AuditLogPage({
  events,
  query,
  onQueryChange,
  total,
  pageCount,
  actions,
  onExport,
  loading = false,
  title,
  description,
  className,
  ...rest
}: AuditLogPageProps): ReactNode {
  const labels = useTemplateLabels(AUDIT_LOG_LABELS);
  const gassan = useLabels();
  const timeZone = useTimeZone();
  const { common, auditLog: l } = labels;
  const { notice, report } = useNotice();
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = query.text !== '' || query.action !== null || query.range !== null;
  const change = (patch: Partial<Omit<AuditLogQuery, 'page'>>): void => onQueryChange({ ...query, ...patch, page: 1 });
  // 日時の列の見出しに添える時間帯の名前。夏時間で変わるので、表の最初の記録の時点の名前にする
  const first = events[0];
  const zone = first ? timeZoneName(labels.locale, timeZone, first.time) : '';

  const columns: DataTableColumn<AuditEvent>[] = [
    {
      key: 'actor',
      header: l.actor,
      cell: (event) => (
        <span className="g-audit-actor">
          {event.actor}
          {event.actorDetail ? <span className="g-audit-detail">{event.actorDetail}</span> : null}
        </span>
      ),
    },
    { key: 'action', header: l.action, cell: (event) => event.action },
    { key: 'target', header: l.target, wrap: true, cell: (event) => event.target ?? '—' },
    {
      key: 'source',
      header: l.source,
      cell: (event) =>
        event.ip ? (
          <span className="g-audit-source">
            <code>{event.ip}</code>
            {event.location ? <span className="g-audit-detail">{event.location}</span> : null}
          </span>
        ) : (
          (event.location ?? '—')
        ),
    },
    {
      key: 'time',
      header: l.time(zone),
      align: 'end',
      cell: (event) => {
        const { text, iso } = formatDateTime(event.time, labels.locale, timeZone, true);
        return <time dateTime={iso}>{text}</time>;
      },
    },
  ];

  return (
    <div {...domPassthrough(rest, 'AuditLogPage')} className={cx('g-audit-log', className)}>
      <PageHeader
        title={title ?? l.title}
        description={description ?? l.description}
        actions={
          onExport ? (
            <Button onAction={async () => report(await runAction(() => onExport(query), common.submitFailed), l.exported)}>{l.export}</Button>
          ) : undefined
        }
      />
      {notice}
      <div className="g-audit-filters" role="search" aria-label={l.filters}>
        <SearchForm value={query.text} onSubmit={(text) => change({ text })} label={l.search} inputRef={searchRef} />
        {actions ? (
          <ModalSelect
            aria-label={l.action}
            className="g-audit-filter"
            options={[{ value: ALL, label: l.allActions }, ...actions]}
            value={query.action ?? ALL}
            onValueChange={(value) => change({ action: value === ALL ? null : value })}
          />
        ) : null}
        <ModalDateRangePicker
          aria-label={l.range}
          className="g-audit-filter"
          placeholder={l.range}
          value={query.range}
          presets={commonDateRanges(gassan)}
          onValueChange={(range) => change({ range })}
        />
        {filtered ? (
          <Button
            variant="tertiary"
            onClick={() => {
              onQueryChange({ text: '', action: null, range: null, page: 1 });
              // 「条件をクリア」は消えるので、探す欄へフォーカスを移す
              searchRef.current?.focus();
            }}
          >
            {l.clear}
          </Button>
        ) : null}
      </div>
      <p className="g-audit-count" role="status">
        {loading ? null : l.count(total)}
      </p>
      <DataTable
        label={l.title}
        density="compact"
        loading={loading}
        loadingRows={events.length > 0 ? events.length : undefined}
        columns={columns}
        rows={events}
        getRowId={(event) => event.id}
        empty={filtered ? l.noMatch : l.empty}
      />
      {pageCount > 1 ? <Pagination count={pageCount} page={query.page} onPageChange={(page) => onQueryChange({ ...query, page })} /> : null}
    </div>
  );
}
