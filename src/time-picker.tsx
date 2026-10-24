import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import type { ControlAria } from './fields';
import { useControllable } from './internal/controllable';
import { motionStill } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels } from './labels';

/*
 * 時刻は 'HH:mm'（24 時間）の文字列で持ち、計算は 0 時からの分で行う。ネイティブの input type="time" の値と同じ形。
 */
const DAY_MINUTES = 24 * 60;
const HALF_DAY = 12 * 60;

/** 'HH:mm' → 0 時からの分。読めなければ null。 */
function parseTime(value: string | null | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

/** 0 時からの分 → 'HH:mm'。 */
function formatTime(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

type HourCycle = NonNullable<ModalTimePickerProps['hourCycle']>;
type Column = 'hour' | 'minute' | 'period';

/** その言語の慣習の時計（ja-JP は 24 時間、en-US は 12 時間）。 */
function hourCycleOf(locale: string): HourCycle {
  const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return resolved === 'h11' || resolved === 'h12' ? 'h12' : 'h23';
}

/** 時刻の書き方は Intl に任せる（「09:05」「午前9:05」「9:05 AM」）。日付は要らないので UTC の 1970-01-01 に載せる。 */
function timeFormatter(locale: string, cycle: HourCycle): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, {
    hour: cycle === 'h23' ? '2-digit' : 'numeric',
    minute: '2-digit',
    hourCycle: cycle,
    timeZone: 'UTC',
  });
}

const asDate = (total: number): Date => new Date(Date.UTC(1970, 0, 1, Math.floor(total / 60), total % 60));

/** 午前・午後の名前（その言語の Intl から）。 */
function dayPeriods(locale: string): [string, string] {
  const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12', timeZone: 'UTC' });
  const name = (hour: number, fallback: string): string =>
    format.formatToParts(asDate(hour * 60)).find((part) => part.type === 'dayPeriod')?.value ?? fallback;
  return [name(9, 'AM'), name(21, 'PM')];
}

export interface ModalTimePickerProps extends ControlAria, DataAttributes {
  /** 'HH:mm'（24 時間）。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** 選べる最初の時刻（'HH:mm'）。 */
  min?: string;
  /** 選べる最後の時刻。min より後にする（日をまたぐ範囲は持たない）。 */
  max?: string;
  /** 分の刻み（1〜60 分）。0 分から数える。既定 5。 */
  step?: number;
  /** 12 時間制か 24 時間制か。省略すると labels.locale の慣習（Intl の hourCycle）。値はどちらでも 24 時間の 'HH:mm'。 */
  hourCycle?: 'h12' | 'h23';
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

interface ColumnOption {
  /** 選んだときに入る値。時の列は 0〜23、分の列は 0〜59、午前・午後の列は 0 / 1。 */
  key: number;
  label: string;
  disabled: boolean;
  selected: boolean;
}

/**
 * 時刻を選ぶ。I-20。
 *
 * ボタンで開くと、時・分（12 時間制なら午前・午後も）の列が並び、時の列にフォーカスが入る。
 * 列はそれぞれ listbox で、選んでいる項目に aria-activedescendant を向ける（選択はフォーカスに付いて動く）。
 * ↑↓ で 1 つ、PageUp / PageDown で列の 4 分の 1、Home / End で端。列の端を越えると反対の端へ回る。
 * ←→ で列を移り、数字を打つとその時刻へ飛ぶ（続けて打つと桁がつながる）。午前・午後の列は A / P でも選べる。
 * Enter / Space で決めて閉じ、Esc で決めずに閉じる。どちらもボタンへ戻る。
 * ポインタでは、時を押すと分の列へ進み、最後の列（分か、午前・午後）を押すと決めて閉じる。
 * min / max の外と、刻みに乗らない時刻は選べない。
 */
export function ModalTimePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 5,
  hourCycle,
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
}: ModalTimePickerProps): ReactNode {
  const labels = useLabels();
  const { locale } = labels;
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  /** 開いている間に動かしている時刻（0 時からの分）。決めるまで value は変えない。 */
  const [pending, setPending] = useState(0);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  /** 開いてから列を合わせたか。開いた直後の 1 回だけは、滑らせずに合わせてフォーカスを入れる。 */
  const placed = useRef(false);
  /** 打った数字（800ms 以内に同じ列で続けて打つと桁がつながる）。 */
  const typed = useRef({ text: '', at: 0, column: 'hour' as Column });
  const base = useId();
  const valueId = `${base}-value`;

  const cycle = hourCycle ?? hourCycleOf(locale);
  const minuteStep = Math.min(60, Math.max(1, Math.round(step)));
  const minuteKeys = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  const lower = parseTime(min) ?? 0;
  const upper = parseTime(max) ?? DAY_MINUTES - 1;
  const allowed = (total: number): boolean => total >= lower && total <= upper && minuteKeys.includes(total % 60);
  /** 選べる時刻の全部（早い順）。 */
  const candidates = Array.from({ length: 24 }, (_, h) => minuteKeys.map((m) => h * 60 + m))
    .flat()
    .filter(allowed);

  /** total にいちばん近い選べる時刻（among に絞れる）。同じ近さなら遅い方。1 つも無ければ null。 */
  const nearest = (total: number, among: number[] = candidates): number | null =>
    among.reduce<number | null>(
      (best, candidate) => (best === null || Math.abs(candidate - total) <= Math.abs(best - total) ? candidate : best),
      null,
    );
  const now = (): number => {
    const date = new Date();
    return date.getHours() * 60 + date.getMinutes();
  };

  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const show = (): void => {
    setPending(nearest(parseTime(selected) ?? now()) ?? lower);
    setOpen(true);
  };
  const commit = (total: number = pending): void => {
    if (!allowed(total)) return;
    const next = formatTime(total);
    if (next !== selected) setSelected(next);
    close(true);
  };

  const hour = Math.floor(pending / 60);
  const minute = pending % 60;
  const half = Math.floor(pending / HALF_DAY);
  const columns: Column[] = cycle === 'h12' ? ['hour', 'minute', 'period'] : ['hour', 'minute'];
  const format = timeFormatter(locale, cycle);
  const twoDigits = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  const oneDigit = new Intl.NumberFormat(locale, { useGrouping: false });

  const optionsOf = (column: Column): ColumnOption[] => {
    if (column === 'hour') {
      const hours = Array.from({ length: cycle === 'h23' ? 24 : 12 }, (_, i) => (cycle === 'h23' ? i : i + half * 12));
      return hours.map((h) => ({
        key: h,
        label: cycle === 'h23' ? twoDigits.format(h) : oneDigit.format(h % 12 || 12),
        disabled: !candidates.some((t) => Math.floor(t / 60) === h),
        selected: h === hour,
      }));
    }
    if (column === 'minute') {
      return minuteKeys.map((m) => ({
        key: m,
        label: twoDigits.format(m),
        disabled: !allowed(hour * 60 + m),
        selected: m === minute,
      }));
    }
    const periods = dayPeriods(locale);
    return [0, 1].map((h) => ({
      key: h,
      label: periods[h] ?? '',
      disabled: !candidates.some((t) => Math.floor(t / HALF_DAY) === h),
      selected: h === half,
    }));
  };

  /** 列の値を変えた後の時刻。そのままでは選べないなら、同じ時（同じ午前・午後）の中でいちばん近い時刻へ寄せる。 */
  const withPart = (column: Column, key: number): number => {
    if (column === 'minute') return allowed(hour * 60 + key) ? hour * 60 + key : pending;
    if (column === 'hour') {
      return nearest(key * 60 + minute, candidates.filter((t) => Math.floor(t / 60) === key)) ?? pending;
    }
    return nearest((pending % HALF_DAY) + key * HALF_DAY, candidates.filter((t) => Math.floor(t / HALF_DAY) === key)) ?? pending;
  };

  const focusColumn = (column: Column): void => {
    columnsRef.current?.querySelector<HTMLElement>(`[data-column="${column}"]`)?.focus();
  };

  const pick = (column: Column, option: ColumnOption): void => {
    if (option.disabled) return;
    const next = withPart(column, option.key);
    setPending(next);
    const following = columns[columns.indexOf(column) + 1];
    if (following) focusColumn(following);
    else commit(next);
  };

  /** 打った数字に当たる項目。時はその時ちょうど、分は刻みの中でいちばん近いもの。 */
  const typedOption = (column: Column, options: ColumnOption[], digit: string): ColumnOption | undefined => {
    const at = Date.now();
    const joined = at - typed.current.at <= 800 && typed.current.column === column ? typed.current.text + digit : digit;
    const limit = column === 'minute' ? 59 : cycle === 'h23' ? 23 : 12;
    // 上限を越えたら、いま打った 1 桁からやり直す（2 → 5 は 25 時でなく 5 時）。
    const text = Number(joined) <= limit ? joined : digit;
    typed.current = { text, at, column };
    const number = Number(text);
    const enabled = options.filter((option) => !option.disabled);
    if (column === 'hour') {
      const key = cycle === 'h23' ? number : (number % 12) + half * 12;
      return enabled.find((option) => option.key === key);
    }
    return enabled.reduce<ColumnOption | undefined>(
      (best, option) => (!best || Math.abs(option.key - number) < Math.abs(best.key - number) ? option : best),
      undefined,
    );
  };

  const handleColumnKey = (event: ReactKeyboardEvent<HTMLDivElement>, column: Column): void => {
    const options = optionsOf(column);
    const count = options.length;
    const current = Math.max(0, options.findIndex((option) => option.selected));
    /** start から dir の向きへ、最初の選べる項目。端を越えると反対の端へ回る。 */
    const from = (start: number, dir: 1 | -1): ColumnOption | undefined => {
      for (let i = 0; i < count; i += 1) {
        const option = options[(((start + dir * i) % count) + count) % count];
        if (option && !option.disabled) return option;
      }
      return undefined;
    };
    const page = Math.max(1, Math.round(count / 4));
    const moves: Partial<Record<string, () => ColumnOption | undefined>> = {
      ArrowDown: () => from(current + 1, 1),
      ArrowUp: () => from(current - 1, -1),
      PageDown: () => from(current + page, 1),
      PageUp: () => from(current - page, -1),
      Home: () => from(0, 1),
      End: () => from(count - 1, -1),
    };
    const { key } = event;
    let target: ColumnOption | undefined;
    const move = moves[key];
    if (move) target = move();
    else if (key === 'ArrowRight' || key === 'ArrowLeft') {
      const next = columns[columns.indexOf(column) + (key === 'ArrowRight' ? 1 : -1)];
      if (next) focusColumn(next);
    } else if (key === 'Enter' || key === ' ') commit();
    else if (/^\d$/.test(key) && column !== 'period') target = typedOption(column, options, key);
    else if (/^[ap]$/i.test(key) && column === 'period') target = options[key.toLowerCase() === 'a' ? 0 : 1];
    else return;
    event.preventDefault();
    if (target && !target.disabled) setPending(withPart(column, target.key));
  };

  // 選んでいる項目を、どの列でも真ん中に出す。開いた直後はその場で合わせて時の列へフォーカスを入れ、
  // その後（値を動かしたとき）は滑らせる。動きを止める設定では滑らせない（V-02）。
  // 列の中だけを動かす（scrollIntoView はページまで動かすので使わない）。
  useLayoutEffect(() => {
    if (!open) {
      placed.current = false;
      return;
    }
    const root = columnsRef.current;
    if (!root) return;
    const first = !placed.current;
    placed.current = true;
    const behavior: ScrollBehavior = first || motionStill(root) ? 'auto' : 'smooth';
    for (const column of root.querySelectorAll<HTMLElement>('[role="listbox"]')) {
      const option = column.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!option) continue;
      const top = option.offsetTop - (column.clientHeight - option.offsetHeight) / 2;
      if (typeof column.scrollTo === 'function') column.scrollTo({ top, behavior });
      else column.scrollTop = top;
    }
    if (first) root.querySelector<HTMLElement>('[data-column="hour"]')?.focus();
  }, [open, pending, cycle]);

  const columnName = { hour: labels.hour, minute: labels.minute, period: labels.dayPeriod };
  const current = parseTime(selected);

  return (
    <div
      {...domPassthrough(rest, 'Modal.TimePicker')}
      ref={anchorRef}
      className={className ? `g-select g-time-picker ${className}` : 'g-select g-time-picker'}
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
        <span id={valueId} className="g-select-value" data-placeholder={current === null ? '' : undefined}>
          {current === null ? (placeholder ?? labels.choose) : format.format(asDate(current))}
        </span>
        <Icon name="clock" className="g-select-icon" />
      </button>
      <Popup
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => close(false)}
        className="g-time"
        role="dialog"
        aria-label={labels.chooseTime}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // モーダルの cancel まで届かせない。閉じるのは時刻の選択だけ。
          event.preventDefault();
          close(true);
        }}
        onBlur={(event) => {
          // Tab で外へ出たときだけ閉じる（DatePicker と同じ）。
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next) && next !== triggerRef.current) close(false);
        }}
      >
        {/* 目で見る要約。値が変わるたびに付け直して、短く刻む動きを出す。読み上げは各列の listbox が受け持つ */}
        <p className="g-time-display" aria-hidden="true">
          <span key={pending}>{format.format(asDate(pending))}</span>
        </p>
        <div className="g-time-cols" ref={columnsRef}>
          {columns.map((column) => {
            const options = optionsOf(column);
            const active = options.find((option) => option.selected);
            return (
              <div key={column} className="g-time-group">
                {column === 'minute' ? (
                  <span className="g-time-sep" aria-hidden="true">
                    :
                  </span>
                ) : null}
                <div
                  role="listbox"
                  className="g-time-col"
                  data-column={column}
                  tabIndex={0}
                  aria-label={columnName[column]}
                  aria-activedescendant={active ? `${base}-${column}-${String(active.key)}` : undefined}
                  onKeyDown={(event) => handleColumnKey(event, column)}
                >
                  {options.map((option) => (
                    <div
                      key={option.key}
                      id={`${base}-${column}-${String(option.key)}`}
                      role="option"
                      className="g-time-option"
                      aria-selected={option.selected}
                      aria-disabled={option.disabled ? true : undefined}
                      onClick={() => pick(column, option)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="g-time-foot">
          <button type="button" className="g-time-now" onClick={() => setPending(nearest(now()) ?? pending)}>
            {labels.now}
          </button>
          <button type="button" className="g-time-ok" onClick={() => commit()}>
            {labels.ok}
          </button>
        </div>
      </Popup>
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}
