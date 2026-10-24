import { useId, useRef, useState, type ReactNode } from 'react';

import type { ControlAria } from './fields';
import type { HolidayResolver } from './holidays';
import { CalendarView } from './internal/calendar-view';
import { useControllable } from './internal/controllable';
import { dateFormatter, parseISO } from './internal/dates';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels } from './labels';

// 日付の計算はカレンダーの部品が共有する（internal/dates.ts）。テストと既存の import のために、ここからも出す。
export { addDays, addMonths, monthGrid, todayISO } from './internal/dates';

/** カレンダーの部品（DatePicker・DateRangePicker・Calendar・RangeCalendar）が共通に受ける設定。 */
export interface CalendarOptions {
  /** 選べる最初の日（'YYYY-MM-DD'）。 */
  min?: string;
  /** 選べる最後の日。 */
  max?: string;
  /** 週の始まり。0 = 日曜（既定）、1 = 月曜。 */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** 個別に選べない日（定休日・満席など）。移動はできるが選べない。I-19。 */
  isDateDisabled?: (date: string) => boolean;
  /**
   * 日付の脇に出す祝日の名前（日付 → 名前）。省略すると labels.holidays（日本語の既定は日本の祝日）、
   * null なら出さない。I-16。
   */
  holidays?: HolidayResolver | null;
  /** 印（点）を付ける日。予定のある日など。読み上げ名に labels.marked を添える。I-19。 */
  marks?: (date: string) => boolean;
  /** 「今日」のボタン。既定 true。I-18。 */
  showToday?: boolean;
}

export interface ModalDatePickerProps extends ControlAria, DataAttributes, CalendarOptions {
  /** 'YYYY-MM-DD'。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * カレンダーで日付を選ぶ。I-13 / I-16〜I-19。
 *
 * WAI-ARIA APG の date picker dialog。ボタンで開くと、選んでいる日（無ければ今日）に
 * フォーカスが入る。←→ で 1 日、↑↓ で 1 週、Home / End で週の端、PageUp / PageDown で 1 か月、
 * Shift を足すと 1 年。Enter / Space で決めて閉じ、Esc で決めずに閉じる。どちらもボタンへ戻る。
 * 見出しを押すと月の一覧、もう一度押すと年の一覧へ移り、Esc で 1 段ずつ戻る（I-18）。
 * 月名・曜日・読み上げる日付は labels.locale の Intl で出す（多言語と暦はブラウザに任せる）。
 * min / max の外の日と isDateDisabled の日には移れても、選べない。
 */
export function ModalDatePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  firstDayOfWeek = 0,
  isDateDisabled,
  holidays,
  marks,
  showToday = true,
  placeholder,
  disabled = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...rest
}: ModalDatePickerProps): ReactNode {
  const labels = useLabels();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const base = useId();
  const titleId = `${base}-title`;
  const valueId = `${base}-value`;
  const { locale } = labels;

  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.DatePicker')}
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
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        {/* ラベルで名前を付けるとボタンの中の文字は名前にならないので、値は説明として読ませる */}
        <span id={valueId} className="g-select-value" data-placeholder={selected ? undefined : ''}>
          {selected
            ? dateFormatter(locale, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }).format(parseISO(selected))
            : (placeholder ?? labels.choose)}
        </span>
        <Icon name="calendar" className="g-select-icon" />
      </button>
      <Popup
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => close(false)}
        className="g-calendar"
        role="dialog"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // モーダルの cancel まで届かせない。閉じるのはカレンダーだけ。
          event.preventDefault();
          close(true);
        }}
        onBlur={(event) => {
          // Tab で外へ出たときだけ閉じる。行き先が null（押した要素が消えた・何もない所を押した）は
          // 外側の押下で閉じるか、カレンダーの中に留まっているので、ここでは閉じない。
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next) && next !== triggerRef.current) close(false);
        }}
      >
        <CalendarView
          mode="single"
          titleId={titleId}
          selected={selected}
          onPick={(iso) => {
            if (iso !== selected) setSelected(iso);
            close(true);
          }}
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
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}
