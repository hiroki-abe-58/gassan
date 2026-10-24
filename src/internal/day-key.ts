/**
 * 時間帯の中の暦の日。日付の区切り・「今日」「昨日」・「過去 7 日間」を、見ている人の暦で決めるのに使う。
 * 時刻の差（24 時間）で比べると、日付をまたぐ前後で「昨日」を取り違えるので、年月日の文字で比べる。
 */

/** 日時を、時間帯の中の年月日（YYYY-MM-DD）にする関数を作る（en-CA の短い日付は YYYY-MM-DD）。 */
export function dayKeyFormat(timeZone?: string): (date: Date) => string {
  const format = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone });
  return (date) => format.format(date);
}

/** 2 つの年月日（YYYY-MM-DD）の間の日数（later − earlier）。 */
export function daysBetween(later: string, earlier: string): number {
  return Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000);
}
