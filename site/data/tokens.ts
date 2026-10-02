import { data } from './index';
import type { DesignToken } from './schema';

const byName = new Map<string, DesignToken>();
for (const group of data.tokens) {
  for (const token of group.tokens) byName.set(token.name, token);
}

/** トークンを名前（--g- 付き）で引く。無ければ開発時に落とす。 */
export function token(name: string): DesignToken {
  const found = byName.get(name);
  if (!found) {
    if (import.meta.env.DEV) throw new Error(`トークン ${name} が無い`);
    return { name, light: '' };
  }
  return found;
}

/** スクリムの段（--g-scrim-a-*）を、CSS に書かれた順で。 */
export function scrimLevels(): { token: string; alpha: number }[] {
  return [...byName.values()]
    .filter((t) => t.name.startsWith('--g-scrim-a-'))
    .map((t) => ({ token: t.name.replace('--g-scrim-a-', ''), alpha: Number(t.light) }));
}

/** "180ms" / "0.2s" → ミリ秒 */
export function durationMs(value: string): number {
  const m = /^([\d.]+)(ms|s)$/.exec(value.trim());
  if (!m?.[1]) return Number.NaN;
  return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}

/** "cubic-bezier(0.2, 0, 0, 1)" → [0.2, 0, 0, 1] */
export function bezier(value: string): [number, number, number, number] | undefined {
  const m = /cubic-bezier\(([^)]+)\)/.exec(value);
  const parts = m?.[1]?.split(',').map((n) => Number(n.trim()));
  if (!parts || parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return undefined;
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 0];
}
