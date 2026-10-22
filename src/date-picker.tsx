import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import type { ControlAria } from './fields';
import { useControllable } from './internal/controllable';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels } from './labels';

/* -------------------------------------------------------------------------- */
/* 日付の計算                                                                  */
/* -------------------------------------------------------------------------- */

/*
 * 日付は 'YYYY-MM-DD' の文字列で持ち、計算は UTC の 0 時で行う。
 * 端末の時差と夏時間で「1 日ずれる」を構造的に起こさないため。
 */
const DAY = 86_400_000;

function parse(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  const now = new Date();
  return format(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(iso: string, days: number): string {
  return format(new Date(parse(iso).getTime() + days * DAY));
}

/** 月を足す。月末を越える日は、その月の末日に寄せる（1/31 の翌月は 2/28）。 */
export function addMonths(iso: string, months: number): string {
  const date = parse(iso);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(date.getUTCDate(), last));
  return format(first);
}

function clampISO(iso: string, min: string | undefined, max: string | undefined): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** その月を含む 6 週ぶん（42 日）。週の始まりは firstDayOfWeek。 */
export function monthGrid(iso: string, firstDayOfWeek: number): string[] {
  const date = parse(iso);
  const first = format(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
  const offset = (parse(first).getUTCDay() - firstDayOfWeek + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => addDays(first, index - offset));
}

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
}

/* -------------------------------------------------------------------------- */
/* DatePicker                                                                 */
/* -------------------------------------------------------------------------- */

export interface ModalDatePickerProps extends ControlAria, DataAttributes {
  /** 'YYYY-MM-DD'。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** 選べる最初の日（'YYYY-MM-DD'）。 */
  min?: string;
  /** 選べる最後の日。 */
  max?: string;
  /** 週の始まり。0 = 日曜（既定）、1 = 月曜。 */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * カレンダーで日付を選ぶ。I-13。
 *
 * WAI-ARIA APG の date picker dialog。ボタンで開くと、選んでいる日（無ければ今日）に
 * フォーカスが入る。←→ で 1 日、↑↓ で 1 週、Home / End で週の端、PageUp / PageDown で 1 か月、
 * Shift を足すと 1 年。Enter / Space で決めて閉じ、Esc で決めずに閉じる。どちらもボタンへ戻る。
 * 月名・曜日・読み上げる日付は labels.locale の Intl で出す（多言語と暦はブラウザに任せる）。
 * min / max の外の日には移れず、選べない。
 */
export function ModalDatePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  firstDayOfWeek = 0,
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
  const [focused, setFocused] = useState(() => clampISO(selected ?? todayISO(), min, max));
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  /** キー操作で日を動かしたときだけ、フォーカスを日へ移す（月送りボタンを押したときは移さない）。 */
  const moveFocus = useRef(false);
  const titleId = `${useId()}-title`;
  const today = todayISO();
  const { locale } = labels;

  useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [open, focused]);

  const show = (): void => {
    moveFocus.current = true;
    setFocused(clampISO(selected ?? today, min, max));
    setOpen(true);
  };
  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const pick = (iso: string): void => {
    if (iso !== selected) setSelected(iso);
    close(true);
  };
  const go = (iso: string, focusDay: boolean): void => {
    moveFocus.current = focusDay;
    setFocused(clampISO(iso, min, max));
  };

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>): void => {
    const weekday = (parse(focused).getUTCDay() - firstDayOfWeek + 7) % 7;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    go(move(), true);
  };

  const days = monthGrid(focused, firstDayOfWeek);
  const month = focused.slice(0, 7);
  const weekdays = days.slice(0, 7).map(parse);
  const narrow = formatter(locale, { weekday: 'narrow' });
  const long = formatter(locale, { weekday: 'long' });
  const full = formatter(locale, { dateStyle: 'full' });
  const outOfRange = (iso: string): boolean => Boolean((min && iso < min) || (max && iso > max));

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
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        disabled={disabled}
        onClick={() => (open ? close(false) : show())}
      >
        <span className="g-select-value" data-placeholder={selected ? undefined : ''}>
          {selected
            ? formatter(locale, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }).format(parse(selected))
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
        <div className="g-calendar-head">
          <button
            type="button"
            className="g-iconbtn"
            aria-label={labels.previousMonth}
            onClick={() => go(addMonths(focused, -1), false)}
          >
            <Icon name="chevronLeft" />
          </button>
          <span className="g-calendar-title" id={titleId} aria-live="polite">
            {formatter(locale, { year: 'numeric', month: 'long' }).format(parse(focused))}
          </span>
          <button
            type="button"
            className="g-iconbtn"
            aria-label={labels.nextMonth}
            onClick={() => go(addMonths(focused, 1), false)}
          >
            <Icon name="chevronRight" />
          </button>
        </div>
        <table ref={gridRef} className="g-calendar-grid" role="grid" aria-labelledby={titleId} onKeyDown={handleGridKeyDown}>
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={day.getUTCDay()} scope="col" abbr={long.format(day)}>
                  {narrow.format(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map((iso, index) => (
                  // 位置で key を振る。月送りで日付が入れ替わっても、フォーカス中のボタンが消えない。
                  <td key={index} aria-selected={iso === selected}>
                    <button
                      type="button"
                      className="g-day"
                      tabIndex={iso === focused ? 0 : -1}
                      aria-label={full.format(parse(iso))}
                      aria-current={iso === today ? 'date' : undefined}
                      aria-disabled={outOfRange(iso) ? true : undefined}
                      data-outside={iso.slice(0, 7) !== month ? '' : undefined}
                      onClick={() => {
                        if (!outOfRange(iso)) pick(iso);
                      }}
                    >
                      {parse(iso).getUTCDate()}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Popup>
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}
