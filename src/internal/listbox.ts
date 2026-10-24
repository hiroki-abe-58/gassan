/**
 * 候補の一覧の中を、上下のキーで動く。セレクト・コンボボックス・コマンドパレットが共有する（I-02 / I-12 / U-27）。
 * 使えない候補は飛ばし、端で止まる（折り返さない）。
 */

interface Choice {
  disabled?: boolean;
}

/** 有効な候補を from から step 方向に探す。無ければ from のまま。 */
export function nextEnabled(options: readonly Choice[], from: number, step: number): number {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i;
  }
  return from;
}

export function firstEnabled(options: readonly Choice[], fromEnd = false): number {
  return nextEnabled(options, fromEnd ? options.length : -1, fromEnd ? -1 : 1);
}

/** 一覧を開いている間の上下キー。動いた先の位置を返す。扱わないキーなら null。 */
export function navigate(key: string, options: readonly Choice[], active: number): number | null {
  switch (key) {
    case 'ArrowDown':
      return nextEnabled(options, active, 1);
    case 'ArrowUp':
      return active < 0 ? firstEnabled(options, true) : nextEnabled(options, active, -1);
    case 'Home':
      return firstEnabled(options);
    case 'End':
      return firstEnabled(options, true);
    case 'PageDown':
      return nextEnabled(options, Math.min(options.length, active + 10) - 1, 1);
    case 'PageUp':
      return nextEnabled(options, Math.max(-1, active - 10) + 1, -1);
    default:
      return null;
  }
}
