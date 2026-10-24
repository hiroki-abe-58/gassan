import { to } from '../router';

/** 見本の待ち時間（送信しているように見せる）。 */
export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** ほかの見本（#/preview/<name>）の行き先。 */
export const preview = (name: string): string => to(`/preview/${name}`);

/** ほかの見本へ移る。 */
export const go = (name: string): void => {
  window.location.hash = preview(name).slice(1);
};
