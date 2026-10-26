import { to } from '../router';

/** ログインしている人のメールアドレス（メンバーの表のデモの 1 人目）。 */
export const USER_EMAIL = 'aoi@example.com';

/** 今から minutes 分前の日時（ISO 8601）。負の数で先の日時。 */
export const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

/** 見本の待ち時間（送信しているように見せる）。 */
export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** ほかの見本（#/preview/<name>）の行き先。 */
export const preview = (name: string): string => to(`/preview/${name}`);

/** ほかの見本へ移る。 */
export const go = (name: string): void => {
  window.location.hash = preview(name).slice(1);
};
