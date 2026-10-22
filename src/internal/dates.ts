/*
 * 日付の計算。I-13。
 *
 * 日付は 'YYYY-MM-DD' の文字列で持ち、計算は UTC の 0 時で行う。
 * 端末の時差と夏時間で「1 日ずれる」を構造的に起こさないため。文字列のまま大小を比べられる（辞書順 = 日付順）。
 */
const DAY = 86_400_000;

/** 期間。両端を含み、start ≦ end。 */
export interface DateRange {
  start: string;
  end: string;
}

/** よく使う期間の名前。I-17。並びは期間を選ぶ一覧の並び。 */
export const DATE_RANGE_PRESETS = ['today', 'yesterday', 'last7', 'last30', 'thisMonth', 'lastMonth'] as const;

export type DateRangePresetKey = (typeof DATE_RANGE_PRESETS)[number];

export function parseISO(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 端末の時刻での今日。 */
export function todayISO(): string {
  const now = new Date();
  return formatISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(iso: string, days: number): string {
  return formatISO(new Date(parseISO(iso).getTime() + days * DAY));
}

/** 月を足す。月末を越える日は、その月の末日に寄せる（1/31 の翌月は 2/28）。 */
export function addMonths(iso: string, months: number): string {
  const date = parseISO(iso);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(date.getUTCDate(), last));
  return formatISO(first);
}

/** その月の 1 日。 */
export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** 曜日（0 = 日曜）。 */
export function weekdayOf(iso: string): number {
  return parseISO(iso).getUTCDay();
}

/** b − a の日数。 */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY);
}

export function clampISO(iso: string, min: string | undefined, max: string | undefined): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** 2 つの日を、早い順の期間にする。 */
export function orderRange(a: string, b: string): DateRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** その月を含む 6 週ぶん（42 日）。週の始まりは firstDayOfWeek。 */
export function monthGrid(iso: string, firstDayOfWeek: number): string[] {
  const first = startOfMonth(iso);
  const offset = (weekdayOf(first) - firstDayOfWeek + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => addDays(first, index - offset));
}

/** UTC で書式を当てる Intl（日付は UTC の 0 時で持っているので、端末の時差で日がずれない）。 */
export function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
}
