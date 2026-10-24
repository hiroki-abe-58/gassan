import { useId, useRef, useState, type ReactNode } from 'react';

import type { CalendarOptions } from './date-picker';
import type { ControlAria } from './fields';
import type { GroupAria } from './choices';
import { CalendarView } from './internal/calendar-view';
import { useControllable } from './internal/controllable';
import {
  addDays,
  addMonths,
  dateFormatter,
  parseISO,
  startOfMonth,
  todayISO,
  DATE_RANGE_PRESETS,
  type DateRange,
} from './internal/dates';
import { matchMediaSafe } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels, type GassanLabels } from './labels';
import { usePhrase } from './phrase';

/* -------------------------------------------------------------------------- */
/* Calendar（ページの上に置くカレンダー）                                        */
/* -------------------------------------------------------------------------- */

export interface ModalCalendarProps extends GroupAria, DataAttributes, CalendarOptions {
  /** 'YYYY-MM-DD'。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** md は小さな枠（ポップアップと同じ）。lg は器いっぱいに広がり、日の下に祝日の名前を書く。 */
  size?: 'md' | 'lg';
  /** 並べる月の数。 */
  months?: 1 | 2;
  /** フォームで送るときの名前（hidden input）。 */
  name?: string;
  className?: string;
}

/**
 * ページの上に置くカレンダー。I-13 / I-16〜I-19。
 *
 * ポップアップの DatePicker と同じ表で、キー操作も同じ。予約の空き・営業日・予定の一覧のように、
 * 日付を見せながら選ばせたいときに使う。名前は aria-label か aria-labelledby で付ける（role="group"）。
 */
export function ModalCalendar({
  value,
  defaultValue = null,
  onValueChange,
  size = 'md',
  months = 1,
  min,
  max,
  firstDayOfWeek = 0,
  isDateDisabled,
  holidays,
  marks,
  showToday = true,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalCalendarProps): ReactNode {
  const labels = useLabels();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  return (
    <div
      {...domPassthrough(rest, 'Modal.Calendar')}
      className={className ? `g-calendar-inline ${className}` : 'g-calendar-inline'}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <CalendarView
        mode="single"
        selected={selected}
        onPick={(iso) => {
          if (iso !== selected) setSelected(iso);
        }}
        size={size}
        months={months}
        min={min}
        max={max}
        isDateDisabled={isDateDisabled}
        holidays={holidays === undefined ? labels.holidays : holidays}
        marks={marks}
        firstDayOfWeek={firstDayOfWeek}
        showToday={showToday}
      />
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RangeCalendar                                                              */
/* -------------------------------------------------------------------------- */

export interface ModalRangeCalendarProps extends GroupAria, DataAttributes, CalendarOptions {
  /** 期間。null は未選択。渡すと制御になる。 */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange) => void;
  size?: 'md' | 'lg';
  months?: 1 | 2;
  /** フォームで送るときの名前。開始日と終了日の hidden input に付く。 */
  startName?: string;
  endName?: string;
  className?: string;
}

/**
 * ページの上で期間を選ぶ。I-17。
 *
 * 開始日 → 終了日の 2 回で決める（逆順に押しても入れ替える）。終了日を決める前は、指している日・
 * ポインタの下の日までを仮の帯で見せる。いまどちらの端を選ぶ番かは role="status" で伝える。
 * 選んでいる途中の Esc は開始日を取り消す。
 */
export function ModalRangeCalendar({
  value,
  defaultValue = null,
  onValueChange,
  size = 'md',
  months = 1,
  min,
  max,
  firstDayOfWeek = 0,
  isDateDisabled,
  holidays,
  marks,
  showToday = true,
  startName,
  endName,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalRangeCalendarProps): ReactNode {
  const labels = useLabels();
  const [range, setRange] = useControllable<DateRange | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  return (
    <div
      {...domPassthrough(rest, 'Modal.RangeCalendar')}
      className={className ? `g-calendar-inline ${className}` : 'g-calendar-inline'}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <CalendarView
        mode="range"
        range={range}
        onRangeChange={setRange}
        size={size}
        months={months}
        min={min}
        max={max}
        isDateDisabled={isDateDisabled}
        holidays={holidays === undefined ? labels.holidays : holidays}
        marks={marks}
        firstDayOfWeek={firstDayOfWeek}
        showToday={showToday}
        escapeCancelsRange
      />
      {startName ? <input type="hidden" name={startName} value={range?.start ?? ''} /> : null}
      {endName ? <input type="hidden" name={endName} value={range?.end ?? ''} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DateRangePicker                                                            */
/* -------------------------------------------------------------------------- */

/** 期間を選ぶ一覧の 1 行。 */
export interface DateRangePreset {
  label: ReactNode;
  value: DateRange;
}

/**
 * よく使う期間（今日・昨日・過去 7 日間・過去 30 日間・今月・先月）。I-17。
 * 名前は labels.rangePreset から引く（`useLabels()` を渡す）。today を渡すと、その日を基準にする。
 */
export function commonDateRanges(labels: Pick<GassanLabels, 'rangePreset'>, today: string = todayISO()): DateRangePreset[] {
  const firstOfMonth = startOfMonth(today);
  const lastMonthStart = addMonths(firstOfMonth, -1);
  const values = {
    today: { start: today, end: today },
    yesterday: { start: addDays(today, -1), end: addDays(today, -1) },
    last7: { start: addDays(today, -6), end: today },
    last30: { start: addDays(today, -29), end: today },
    thisMonth: { start: firstOfMonth, end: addDays(addMonths(firstOfMonth, 1), -1) },
    lastMonth: { start: lastMonthStart, end: addDays(firstOfMonth, -1) },
  } satisfies Record<(typeof DATE_RANGE_PRESETS)[number], DateRange>;
  return DATE_RANGE_PRESETS.map((key) => ({ label: labels.rangePreset(key), value: values[key] }));
}

/** 期間を「10月22日〜29日」のように書く。formatRange の無い環境では「〜」でつなぐ。 */
function formatRange(locale: string, range: DateRange): string {
  const format = dateFormatter(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  const start = parseISO(range.start);
  const end = parseISO(range.end);
  return typeof format.formatRange === 'function'
    ? format.formatRange(start, end)
    : `${format.format(start)} – ${format.format(end)}`;
}

export interface ModalDateRangePickerProps extends ControlAria, DataAttributes, CalendarOptions {
  /** 期間。null は未選択。渡すと制御になる。 */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange) => void;
  /** 並べる月の数。'auto'（既定）は、画面が 640px 以上なら 2 か月、狭ければ 1 か月。 */
  months?: 1 | 2 | 'auto';
  /** 横に並べる、よく使う期間。`commonDateRanges(useLabels())` で既定の 6 つを作れる。 */
  presets?: readonly DateRangePreset[];
  placeholder?: string;
  disabled?: boolean;
  /** フォームで送るときの名前。開始日と終了日の hidden input に付く。 */
  startName?: string;
  endName?: string;
  className?: string;
}

/**
 * 期間を選ぶポップアップ。I-17。
 *
 * 開始日 → 終了日の 2 回で決め、終了日を選んだら閉じる。よく使う期間（presets）は 1 回で決まる。
 * キー操作・祝日・選べない日・月と年の一覧は DatePicker と同じ。Esc は決めずに閉じてボタンへ戻る。
 */
export function ModalDateRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  months = 'auto',
  presets,
  min,
  max,
  firstDayOfWeek = 0,
  isDateDisabled,
  holidays,
  marks,
  showToday = true,
  placeholder,
  disabled = false,
  startName,
  endName,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...rest
}: ModalDateRangePickerProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const [range, setRange] = useControllable<DateRange | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<1 | 2>(1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const base = useId();
  const titleId = `${base}-title`;
  const valueId = `${base}-value`;

  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const commit = (next: DateRange): void => {
    if (next.start !== range?.start || next.end !== range.end) setRange(next);
    close(true);
  };
  const show = (): void => {
    // 開くときに幅を見て決める。開いたまま幅が変わっても、選んでいる途中の表を組み替えない。
    setCount(months === 'auto' ? ((matchMediaSafe('(min-width: 640px)')?.matches ?? true) ? 2 : 1) : months);
    setOpen(true);
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.DateRangePicker')}
      ref={anchorRef}
      className={className ? `g-select g-date ${className}` : 'g-select g-date'}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="g-select-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={[valueId, ariaDescribedBy].filter(Boolean).join(' ')}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        disabled={disabled}
        onClick={() => (open ? close(false) : show())}
      >
        {/* ラベルで名前を付けるとボタンの中の文字は名前にならないので、値は説明として読ませる */}
        <span id={valueId} className="g-select-value" data-placeholder={range ? undefined : ''}>
          {range ? formatRange(labels.locale, range) : (placeholder ?? labels.chooseRange)}
        </span>
        <Icon name="calendar" className="g-select-icon" />
      </button>
      <Popup
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => close(false)}
        className="g-calendar g-range-picker"
        role="dialog"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          close(true);
        }}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next) && next !== triggerRef.current) close(false);
        }}
      >
        {presets && presets.length > 0 ? (
          <ul className="g-range-presets">
            {presets.map((preset, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="g-range-preset"
                  aria-pressed={preset.value.start === range?.start && preset.value.end === range.end}
                  onClick={() => commit(preset.value)}
                >
                  {phrase(preset.label)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <CalendarView
          mode="range"
          titleId={titleId}
          range={range}
          onRangeChange={commit}
          months={count}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          holidays={holidays === undefined ? labels.holidays : holidays}
          marks={marks}
          firstDayOfWeek={firstDayOfWeek}
          showToday={showToday}
          autoFocus
        />
      </Popup>
      {startName ? <input type="hidden" name={startName} value={range?.start ?? ''} /> : null}
      {endName ? <input type="hidden" name={endName} value={range?.end ?? ''} /> : null}
    </div>
  );
}
