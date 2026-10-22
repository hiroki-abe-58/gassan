import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import type { HolidayResolver } from '../holidays';
import { useLabels } from '../labels';
import {
  addDays,
  addMonths,
  clampISO,
  dateFormatter,
  monthGrid,
  orderRange,
  parseISO,
  startOfMonth,
  todayISO,
  weekdayOf,
  type DateRange,
} from './dates';
import { Icon } from './icons';

type View = 'days' | 'months' | 'years';

/** 年の一覧の 1 ページ（4 列 × 3 行）。 */
const YEARS_PER_PAGE = 12;

export interface CalendarViewProps {
  /** single は 1 日を選ぶ。range は開始日と終了日の 2 回で期間を選ぶ。 */
  mode: 'single' | 'range';
  /** single: 選んでいる日。 */
  selected?: string | null;
  onPick?: (iso: string) => void;
  /** range: 決まっている期間。 */
  range?: DateRange | null;
  onRangeChange?: (range: DateRange) => void;
  /** 並べる月の数。2 なら左右に 2 か月（月の外の日は描かない。同じ日が 2 つ並ぶのを防ぐ）。 */
  months?: 1 | 2;
  min?: string;
  max?: string;
  /** 選べない日（定休日・満席など）。移動はできるが選べない。I-19。 */
  isDateDisabled?: (iso: string) => boolean;
  holidays: HolidayResolver | null;
  /** 印（点）を付ける日。予定のある日など。I-19。 */
  marks?: (iso: string) => boolean;
  firstDayOfWeek: number;
  /** lg は大きな枠で、祝日の名前を日の下に書く。md は小さな枠で、指している日の祝日を下の 1 行に出す。 */
  size?: 'md' | 'lg';
  /** 「今日」のボタン。 */
  showToday?: boolean;
  /** 描いた直後に、指している日へフォーカスを移す（ポップアップを開いたとき）。 */
  autoFocus?: boolean;
  /** 期間を選んでいる途中で Esc を押したら、開始日を取り消す（インラインのカレンダー）。 */
  escapeCancelsRange?: boolean;
  /**
   * 見出し（いまの月・年・年の範囲）に付ける id。ポップアップの dialog がこれで名前を取る（APG の date picker dialog）。
   * 2 か月並べるときは左の月の見出し。
   */
  titleId?: string;
}

/** その言語での読み上げ名の区切り。 */
function separator(locale: string): string {
  if (locale.startsWith('ja')) return '、';
  if (locale.startsWith('zh')) return '，';
  return ', ';
}

/**
 * 月の表（と、月の一覧・年の一覧）。I-13 / I-16〜I-19。
 *
 * DatePicker・DateRangePicker・Calendar・RangeCalendar がこれを共有する。
 * 指している日（ロービング tabindex で 0 を持つ日）と、表示している月・一覧の段・期間の開始日は、ここが持つ。
 * 選んだ値は持たない（親が制御・非制御を決める）。
 *
 * 日は位置で key を振る。月送りで日付が入れ替わっても、フォーカス中のボタンが消えない。
 * 月が変わったら、表を向きのある動きで入れ替える（V のトークン。data-turn と、動きをやり直すための data-phase）。
 */
export function CalendarView({
  mode,
  selected = null,
  onPick,
  range = null,
  onRangeChange,
  months = 1,
  min,
  max,
  isDateDisabled,
  holidays,
  marks,
  firstDayOfWeek,
  size = 'md',
  showToday = true,
  autoFocus = false,
  escapeCancelsRange = false,
  titleId: headingId,
}: CalendarViewProps): ReactNode {
  const labels = useLabels();
  const { locale } = labels;
  const today = todayISO();
  const base = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(() => clampISO(selected ?? range?.start ?? today, min, max));
  const [first, setFirst] = useState(() => startOfMonth(focused));
  const [view, setView] = useState<View>('days');
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [turn, setTurn] = useState<{ dir: 'next' | 'prev'; phase: 0 | 1 } | null>(null);
  /** キー操作・一覧の切り替えのあと、描き終えたらフォーカスを移す。月送りのボタンでは移さない。 */
  const moveFocus = useRef(autoFocus);
  const shownMonth = useRef(first);

  // 指している日が表示の外へ出たら、表示を追いかける（2 か月のときは 1 か月ずつ送る）。
  const last = addMonths(first, months - 1);
  if (focused < first || focused.slice(0, 7) > last.slice(0, 7)) {
    setFirst(startOfMonth(focused < first ? focused : addMonths(focused, -(months - 1))));
  }

  // 月が変わったら、向きのある動きをやり直す。描く前に切り替えるので、一瞬古い位置に描かれることはない。
  useLayoutEffect(() => {
    if (shownMonth.current === first) return;
    const dir = first > shownMonth.current ? 'next' : 'prev';
    shownMonth.current = first;
    setTurn((previous) => ({ dir, phase: previous?.phase === 0 ? 1 : 0 }));
  }, [first]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    rootRef.current?.querySelector<HTMLElement>('[data-roving="0"]')?.focus();
  }, [focused, view]);

  const outOfRange = (iso: string): boolean => Boolean((min && iso < min) || (max && iso > max));
  const unavailable = (iso: string): boolean => outOfRange(iso) || Boolean(isDateDisabled?.(iso));
  const go = (iso: string, focus = true): void => {
    moveFocus.current = focus;
    setFocused(clampISO(iso, min, max));
  };

  const pick = (iso: string): void => {
    if (unavailable(iso)) return;
    go(iso);
    if (mode === 'single') {
      onPick?.(iso);
      return;
    }
    if (anchor === null) {
      setAnchor(iso);
      return;
    }
    setAnchor(null);
    onRangeChange?.(orderRange(anchor, iso));
  };

  const step = (delta: number): void => {
    // 月送り・年送りのボタン。フォーカスはボタンに残し、指している日だけを動かす。
    if (view === 'days') go(addMonths(focused, delta), false);
    else go(addMonths(focused, delta * (view === 'months' ? 12 : 12 * YEARS_PER_PAGE)), false);
  };

  const handleDaysKey = (event: ReactKeyboardEvent): void => {
    const weekday = (weekdayOf(focused) - firstDayOfWeek + 7) % 7;
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
    if (move) {
      event.preventDefault();
      // キーで動かしたら、仮の期間はキーの側に従わせる（押した後のポインタが開始日の上に残っていても）。
      setHovered(null);
      go(move());
      return;
    }
    if (event.key === 'Escape' && anchor !== null && escapeCancelsRange) {
      event.preventDefault();
      event.stopPropagation();
      setAnchor(null);
    }
  };

  /** 月・年の一覧のキー操作。cols は列の数、unit は 1 マスで動く月数。 */
  const handleGridKey = (event: ReactKeyboardEvent, cols: number, unit: number): void => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      go(addMonths(focused, delta * unit));
      return;
    }
    if (event.key === 'Escape') {
      // 一覧から 1 段降りる。ポップアップを閉じるのは日の表に戻ってから。
      event.preventDefault();
      event.stopPropagation();
      moveFocus.current = true;
      setView(view === 'years' ? 'months' : 'days');
    }
  };

  const open = (next: View): void => {
    moveFocus.current = true;
    setView(next);
  };

  const monthTitle = dateFormatter(locale, { year: 'numeric', month: 'long' });
  const yearTitle = dateFormatter(locale, { year: 'numeric' });
  const full = dateFormatter(locale, { dateStyle: 'full' });
  const sep = separator(locale);
  const preview = mode === 'range' && anchor !== null ? orderRange(anchor, hovered ?? focused) : null;
  const shown = preview ?? range;
  const info = hovered ?? focused;
  const infoHoliday = size === 'md' ? holidays?.(info) : null;

  const navButton = (direction: -1 | 1): ReactNode => (
    <button
      type="button"
      className="g-iconbtn"
      aria-label={
        view === 'days'
          ? direction < 0
            ? labels.previousMonth
            : labels.nextMonth
          : view === 'months'
            ? direction < 0
              ? labels.previousYear
              : labels.nextYear
            : direction < 0
              ? labels.previousYears
              : labels.nextYears
      }
      onClick={() => step(direction)}
    >
      <Icon name={direction < 0 ? 'chevronLeft' : 'chevronRight'} />
    </button>
  );

  const renderMonth = (monthStart: string, index: number): ReactNode => {
    const titleId = index === 0 && headingId ? headingId : `${base}-title-${String(index)}`;
    const title = monthTitle.format(parseISO(monthStart));
    const days = monthGrid(monthStart, firstDayOfWeek);
    const weekdays = days.slice(0, 7).map(parseISO);
    const narrow = dateFormatter(locale, { weekday: 'narrow' });
    const long = dateFormatter(locale, { weekday: 'long' });
    const month = monthStart.slice(0, 7);
    return (
      <div key={index} className="g-cal-month">
        <div className="g-cal-head">
          {index === 0 ? navButton(-1) : <span className="g-cal-spacer" />}
          <button type="button" className="g-cal-title" aria-label={labels.chooseMonth(title)} onClick={() => open('months')}>
            <span id={titleId}>{title}</span>
          </button>
          {index === months - 1 ? navButton(1) : <span className="g-cal-spacer" />}
        </div>
        <table
          className="g-calendar-grid"
          role="grid"
          aria-labelledby={titleId}
          data-turn={turn?.dir}
          data-phase={turn?.phase}
          onKeyDown={handleDaysKey}
          onPointerLeave={() => setHovered(null)}
        >
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={day.getUTCDay()} scope="col" abbr={long.format(day)} data-weekday={day.getUTCDay()}>
                  {narrow.format(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map((iso, column) => {
                  const outside = iso.slice(0, 7) !== month;
                  // 2 か月並べるときは月の外の日を描かない（隣の月の表と同じ日が 2 つになる）。
                  if (outside && months > 1) return <td key={column} />;
                  const holiday = holidays?.(iso) ?? null;
                  const marked = Boolean(marks?.(iso));
                  const isStart = shown !== null && iso === shown.start;
                  const isEnd = shown !== null && iso === shown.end;
                  const inside = shown !== null && iso >= shown.start && iso <= shown.end;
                  const chosen = mode === 'single' ? iso === selected : inside && preview === null;
                  const name = [
                    full.format(parseISO(iso)),
                    holiday,
                    mode === 'range' && isStart ? labels.startDate : null,
                    mode === 'range' && isEnd ? labels.endDate : null,
                    marked ? labels.marked : null,
                  ]
                    .filter(Boolean)
                    .join(sep);
                  return (
                    <td
                      key={column}
                      aria-selected={chosen}
                      data-range={
                        mode === 'range' && inside ? (isStart && isEnd ? 'single' : isStart ? 'start' : isEnd ? 'end' : 'middle') : undefined
                      }
                      data-preview={preview !== null && inside ? '' : undefined}
                    >
                      <button
                        type="button"
                        className="g-day"
                        tabIndex={iso === focused ? 0 : -1}
                        data-roving={iso === focused ? '0' : undefined}
                        aria-label={name}
                        aria-current={iso === today ? 'date' : undefined}
                        aria-disabled={unavailable(iso) ? true : undefined}
                        data-blocked={isDateDisabled?.(iso) ? '' : undefined}
                        data-outside={outside ? '' : undefined}
                        data-weekday={weekdayOf(iso)}
                        data-holiday={holiday ? '' : undefined}
                        onPointerEnter={() => setHovered(iso)}
                        onClick={() => pick(iso)}
                      >
                        <span className="g-day-num">{parseISO(iso).getUTCDate()}</span>
                        {size === 'lg' && holiday ? (
                          <span className="g-day-note" aria-hidden="true">
                            {holiday}
                          </span>
                        ) : null}
                        {marked ? <span className="g-day-mark" aria-hidden="true" /> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonths = (): ReactNode => {
    const titleId = headingId ?? `${base}-year`;
    const year = Number(focused.slice(0, 4));
    const title = yearTitle.format(parseISO(`${focused.slice(0, 4)}-01-01`));
    const names = dateFormatter(locale, { month: 'short' });
    const longNames = dateFormatter(locale, { year: 'numeric', month: 'long' });
    return (
      <div className="g-cal-month">
        <div className="g-cal-head">
          {navButton(-1)}
          <button type="button" className="g-cal-title" aria-label={labels.chooseYear(title)} onClick={() => open('years')}>
            <span id={titleId}>{title}</span>
          </button>
          {navButton(1)}
        </div>
        <div className="g-cal-picks" role="group" aria-labelledby={titleId} data-cols="3" onKeyDown={(event) => handleGridKey(event, 3, 1)}>
          {Array.from({ length: 12 }, (_, index) => {
            const iso = `${String(year).padStart(4, '0')}-${String(index + 1).padStart(2, '0')}-01`;
            const target = clampISO(addMonths(focused, index - (Number(focused.slice(5, 7)) - 1)), min, max);
            const disabled = Boolean((max && iso > max) || (min && addMonths(iso, 1) <= min));
            const current = focused.slice(0, 7) === iso.slice(0, 7);
            return (
              <button
                key={index}
                type="button"
                className="g-cal-pick"
                tabIndex={current ? 0 : -1}
                data-roving={current ? '0' : undefined}
                aria-label={longNames.format(parseISO(iso))}
                aria-current={today.slice(0, 7) === iso.slice(0, 7) ? 'date' : undefined}
                aria-disabled={disabled ? true : undefined}
                onClick={() => {
                  if (disabled) return;
                  go(target);
                  setView('days');
                }}
              >
                {names.format(parseISO(iso))}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYears = (): ReactNode => {
    const titleId = headingId ?? `${base}-years`;
    const year = Number(focused.slice(0, 4));
    const start = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
    const iso = (y: number): string => `${String(y).padStart(4, '0')}-01-01`;
    return (
      <div className="g-cal-month">
        <div className="g-cal-head">
          {navButton(-1)}
          <span className="g-cal-title" id={titleId}>
            {yearTitle.format(parseISO(iso(start)))} – {yearTitle.format(parseISO(iso(start + YEARS_PER_PAGE - 1)))}
          </span>
          {navButton(1)}
        </div>
        <div className="g-cal-picks" role="group" aria-labelledby={titleId} data-cols="4" onKeyDown={(event) => handleGridKey(event, 4, 12)}>
          {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
            const y = start + index;
            const disabled = Boolean((max && iso(y) > max) || (min && iso(y + 1) <= min));
            const current = y === year;
            return (
              <button
                key={index}
                type="button"
                className="g-cal-pick"
                tabIndex={current ? 0 : -1}
                data-roving={current ? '0' : undefined}
                aria-current={today.slice(0, 4) === String(y) ? 'date' : undefined}
                aria-disabled={disabled ? true : undefined}
                onClick={() => {
                  if (disabled) return;
                  go(addMonths(focused, (y - year) * 12));
                  setView('months');
                }}
              >
                {yearTitle.format(parseISO(iso(y)))}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={rootRef} className="g-cal" data-size={size} data-view={view} data-months={months}>
      <div className="g-cal-body" key={view}>
        {view === 'days'
          ? Array.from({ length: months }, (_, index) => renderMonth(addMonths(first, index), index))
          : view === 'months'
            ? renderMonths()
            : renderYears()}
      </div>
      {mode === 'range' ? (
        <p className="g-cal-hint" role="status">
          {anchor === null ? labels.pickStart : labels.pickEnd}
        </p>
      ) : null}
      {size === 'md' || showToday ? (
        <div className="g-cal-foot">
          {/* 指している日の祝日。読み上げ名には日ごとに入っているので、ここは目で見る人のためだけに出す */}
          <span className="g-cal-note" aria-hidden="true">
            {view === 'days' && infoHoliday
              ? `${dateFormatter(locale, { month: 'short', day: 'numeric', weekday: 'short' }).format(parseISO(info))} ${infoHoliday}`
              : ''}
          </span>
          {showToday ? (
            <button
              type="button"
              className="g-cal-today"
              aria-disabled={outOfRange(today) ? true : undefined}
              onClick={() => {
                if (outOfRange(today)) return;
                setView('days');
                go(today);
              }}
            >
              {labels.today}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
