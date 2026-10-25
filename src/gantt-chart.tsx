import { useRef, type CSSProperties, type ReactNode } from 'react';

import type { HolidayResolver } from './holidays';
import { Description, colorStyle, cx, usePercent, useShell } from './internal/chart-parts';
import { estimateTextWidth } from './internal/chart-scale';
import { addDays, dateFormatter, daysBetween, orderRange, parseISO, startOfMonth, todayISO, weekdayOf } from './internal/dates';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useWidth } from './internal/use-width';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

export interface GanttTask {
  /** 行を見分けるキー。既定は label。 */
  key?: string;
  label: string;
  /** 始まりの日（YYYY-MM-DD）。 */
  start: string;
  /** 終わりの日（その日を含む。YYYY-MM-DD）。省略すると start と同じ日。 */
  end?: string;
  /** 進み具合（0〜1）。 */
  progress?: number;
  /** 区切りの見出し。同じ group が続く行を、見出しの下にまとめる。 */
  group?: string;
  /** 期間ではなく、その日の節目（ひし形で描く）。 */
  milestone?: boolean;
  /** 棒の色（CSS の色）。既定は --g-chart-1（アクセント）。 */
  color?: string;
}

export interface GanttChartProps extends DataAttributes {
  /** 図の名前（読み上げ）。 */
  label: string;
  tasks: readonly GanttTask[];
  /** 図から読み取れること（「設計が 3 日遅れている」）。図の下に出し、説明として読ませる。 */
  description?: ReactNode;
  /** 描く期間の始まり（YYYY-MM-DD）。既定は最初のタスクを含む週の始まり。 */
  from?: string;
  /** 描く期間の終わり（その日を含む）。既定は最後のタスクを含む週の終わり。 */
  to?: string;
  /** 今日の線を引く日（YYYY-MM-DD）。既定は端末の今日。null で引かない。サーバーで描くなら渡す（端末と時差がずれない）。 */
  today?: string | null;
  /** 週の始まり（0 = 日曜）。既定 1（月曜）。 */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** 休みの地を敷く祝日（日付 → 名前）。省略すると labels.holidays（日本語の既定は日本の祝日）、null で敷かない。土日はいつも敷く。 */
  holidays?: HolidayResolver | null;
  /** タスクの列の見出し。既定 labels.ganttTask。 */
  taskLabel?: string;
  className?: string;
}

/** その日を含む週の始まり。 */
const weekStart = (iso: string, first: number): string => addDays(iso, -((weekdayOf(iso) - first + 7) % 7));

interface Row {
  task: GanttTask;
  start: string;
  end: string;
}

/** 同じ group が続く行を 1 つの区切りにまとめる（group の無い行は区切りの外に置く）。 */
function groupRows(rows: readonly Row[]): { group: string | undefined; rows: Row[] }[] {
  const out: { group: string | undefined; rows: Row[] }[] = [];
  for (const row of rows) {
    const last = out.at(-1);
    if (last && last.group === row.task.group) last.rows.push(row);
    else out.push({ group: row.task.group, rows: [row] });
  }
  return out;
}

/**
 * ガントチャート（タスクの期間と進み具合）。Q-20。
 * 中身はタスクの一覧（ol。区切りがあれば入れ子）で、行ごとに名前と、期間・日数・進み具合の文を持つ。
 * 棒・時間の軸・休みの地・今日の線は飾り。棒は描く期間に対する % で置くので、器の幅が変わっても描き直さない。
 * 器の幅を測るのは、目盛り（日・週）の文字を出すかを決めるためだけ。
 */
export function GanttChart({
  label,
  tasks,
  description,
  from,
  to,
  today,
  firstDayOfWeek = 1,
  holidays,
  taskLabel,
  className,
  ...rest
}: GanttChartProps): ReactNode {
  const labels = useLabels();
  const { descriptionId, groupProps } = useShell(label, description, labels.gantt);
  const phrase = usePhrase();
  const percent = usePercent();
  const scaleRef = useRef<HTMLDivElement>(null);
  const width = useWidth(scaleRef, 600);
  const holidayOf = holidays === undefined ? labels.holidays : holidays;
  const fullDate = dateFormatter(labels.locale, { year: 'numeric', month: 'short', day: 'numeric' });
  const dateText = (iso: string): string => fullDate.format(parseISO(iso));

  const rows: Row[] = tasks.map((task) => ({ task, ...orderRange(task.start, task.end ?? task.start) }));
  const earliest = rows.reduce<string | undefined>((min, row) => (min === undefined || row.start < min ? row.start : min), undefined);
  const latest = rows.reduce<string | undefined>((max, row) => (max === undefined || row.end > max ? row.end : max), undefined);
  const first = from ?? weekStart(earliest ?? today ?? todayISO(), firstDayOfWeek);
  const last = to ?? addDays(weekStart(latest ?? first, firstDayOfWeek), 6);
  const days = Math.max(1, daysBetween(first, last) + 1);
  const dayWidth = 100 / days;
  /** その日の左端（描く期間に対する %）。期間の外は端に寄せる。 */
  const leftOf = (iso: string): number => Math.min(100, Math.max(0, daysBetween(first, iso) * dayWidth));
  const pxPerDay = width / days;
  const dates = Array.from({ length: days }, (_, index) => addDays(first, index));

  // 月の帯。最初の帯と 1 月は年を添える。帯に入らなければ月だけにし、それも入らなければ書かない（文字を途中で切らない）
  const monthFormat = dateFormatter(labels.locale, { month: 'short' });
  const yearMonthFormat = dateFormatter(labels.locale, { year: 'numeric', month: 'short' });
  const months: { key: string; left: number; width: number; text: string }[] = [];
  for (let month = startOfMonth(first); month <= last; month = startOfMonth(addDays(month, 32))) {
    const start = month < first ? first : month;
    const next = startOfMonth(addDays(month, 32));
    const end = addDays(next, -1) > last ? last : addDays(next, -1);
    const left = leftOf(start);
    const span = leftOf(addDays(end, 1)) - left;
    const candidates = [
      ...(months.length === 0 || month.endsWith('-01-01') ? [yearMonthFormat.format(parseISO(month))] : []),
      monthFormat.format(parseISO(month)),
    ];
    months.push({
      key: month,
      left,
      width: span,
      text: candidates.find((text) => estimateTextWidth(text, 12) + 8 <= (span / 100) * width) ?? '',
    });
  }
  // 日か週の目盛り。1 日が 18px 以上なら毎日、1 週が 28px 以上なら週の始まりだけ、それより狭ければ月だけ
  const ticks = pxPerDay >= 18 ? dates : pxPerDay * 7 >= 28 ? dates.filter((iso) => weekdayOf(iso) === firstDayOfWeek) : [];
  // 休み（土日と祝日）の地。1 日が 4px より狭いと細い縞になるだけなので敷かない
  const offDays = pxPerDay >= 4 ? dates.filter((iso) => weekdayOf(iso) === 0 || weekdayOf(iso) === 6 || Boolean(holidayOf?.(iso))) : [];
  const now = today === null ? null : (today ?? todayISO());
  const nowAt = now !== null && now >= first && now <= last ? leftOf(now) + dayWidth / 2 : null;

  const taskItem = ({ task, start, end }: Row): ReactNode => {
    const left = leftOf(start);
    const span = leftOf(addDays(end, 1)) - left;
    const progress = task.progress === undefined || task.milestone ? undefined : Math.min(1, Math.max(0, task.progress));
    const period = task.milestone ? labels.ganttMilestone(dateText(start)) : labels.ganttPeriod(dateText(start), dateText(end), daysBetween(start, end) + 1);
    return (
      <li key={task.key ?? task.label} className="g-gantt-row" data-milestone={task.milestone ? '' : undefined}>
        {/* 読み上げは名前・期間・進み具合を 1 つの文で（見えている名前と割合は飾りにする） */}
        <span className="g-sr-only">{labels.ganttRow(task.label, progress === undefined ? [period] : [period, labels.ganttProgress(percent(progress))])}</span>
        <span className="g-gantt-name" aria-hidden="true">
          <span className="g-gantt-name-text">{phrase(task.label)}</span>
          {progress === undefined ? null : <span className="g-gantt-percent">{percent(progress)}</span>}
        </span>
        <span className="g-gantt-track" aria-hidden="true">
          {task.milestone ? (
            <span className="g-gantt-milestone" style={{ ...(task.color ? colorStyle(task.color) : null), left: `${String(left + dayWidth / 2)}%` }} />
          ) : (
            <span
              className="g-gantt-bar"
              style={{ ...(task.color ? colorStyle(task.color) : null), left: `${String(left)}%`, width: `${String(span)}%`, '--g-gantt-progress': progress ?? 0 } as CSSProperties}
            />
          )}
        </span>
      </li>
    );
  };

  return (
    <div {...domPassthrough(rest, 'GanttChart')} {...groupProps} className={cx('g-viz g-gantt', className)}>
      <div className="g-gantt-grid">
        <div className="g-gantt-head" aria-hidden="true">
          <span className="g-gantt-corner">{taskLabel ?? labels.ganttTask}</span>
          <div ref={scaleRef} className="g-gantt-scale">
            <div className="g-gantt-months">
              {months.map((month) => (
                <span key={month.key} style={{ left: `${String(month.left)}%`, width: `${String(month.width)}%` }}>
                  {month.text}
                </span>
              ))}
            </div>
            {ticks.length > 0 ? (
              <div className="g-gantt-ticks" data-unit={pxPerDay >= 18 ? 'day' : 'week'}>
                {ticks.map((iso) => (
                  <span key={iso} style={{ left: `${String(leftOf(iso) + (pxPerDay >= 18 ? dayWidth / 2 : 0))}%` }}>
                    {parseISO(iso).getUTCDate()}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="g-gantt-off" aria-hidden="true">
          {offDays.map((iso) => (
            <span key={iso} style={{ left: `${String(leftOf(iso))}%`, width: `${String(dayWidth)}%` }} />
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="g-viz-empty">{labels.noData}</p>
        ) : (
          <ol className="g-gantt-rows">
            {groupRows(rows).map((section, index) =>
              section.group === undefined ? (
                section.rows.map(taskItem)
              ) : (
                <li key={`g-${String(index)}-${section.group}`} className="g-gantt-group">
                  <span className="g-gantt-group-name">{phrase(section.group)}</span>
                  <ol className="g-gantt-rows">{section.rows.map(taskItem)}</ol>
                </li>
              ),
            )}
          </ol>
        )}
        {nowAt !== null ? (
          <div className="g-gantt-now" aria-hidden="true">
            <span style={{ left: `${String(nowAt)}%` }} data-edge={nowAt > 85 ? 'end' : undefined}>
              <span className="g-gantt-now-label">{labels.ganttToday}</span>
            </span>
          </div>
        ) : null}
      </div>
      <Description id={descriptionId}>{description}</Description>
    </div>
  );
}
