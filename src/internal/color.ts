/*
 * 色の値は '#rrggbb'（小文字。ネイティブの input type="color" と同じ形）で持つ。
 * 選ぶ画面は色相・彩度・明るさ（HSV）で動かす。
 */

export interface Hsv {
  /** 色相 0〜359（度）。 */
  h: number;
  /** 彩度 0〜100（%）。 */
  s: number;
  /** 明るさ 0〜100（%）。 */
  v: number;
}

/** '#abc' / 'abc' / '#AABBCC' を '#aabbcc' にする。読めなければ null。 */
export function normalizeHex(value: string): string | null {
  const digits = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())?.[1];
  if (!digits) return null;
  const full = digits.length === 3 ? [...digits].map((char) => char + char).join('') : digits;
  return `#${full.toLowerCase()}`;
}

/** '#rrggbb' → 色相・彩度・明るさ。灰色・白・黒では色相が決まらないので、そのときは fallbackHue を返す。 */
export function hexToHsv(hex: string, fallbackHue = 0): Hsv {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = fallbackHue;
  if (delta > 0) {
    const sector = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    h = Math.round(sector * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : Math.round((delta / max) * 100), v: Math.round(max * 100) };
}

/** 色相・彩度・明るさ → '#rrggbb'。 */
export function hsvToHex({ h, s, v }: Hsv): string {
  const saturation = s / 100;
  const brightness = v / 100;
  const channel = (n: number): string => {
    const k = (n + h / 60) % 6;
    const value = brightness - brightness * saturation * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}
