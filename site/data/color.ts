/**
 * WCAG 2.x のコントラスト比。#rrggbb だけを扱う。
 * tests/tokens.test.ts（トークンの組の検査）と、サイトの色のページの両方がこれを使う。
 */

function channel(hex: string, at: number): number {
  const c = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

export const isHex6 = (value: string): boolean => /^#[0-9a-fA-F]{6}$/.test(value);

/** [前景, 背景, 最低比, 何の組か]。トークン名は --g- を除いた部分。 */
export const CONTRAST_PAIRS: readonly (readonly [fg: string, bg: string, min: number, what: string])[] = [
  ['fg', 'surface', 4.5, '本文'],
  ['fg-muted', 'surface', 4.5, '補足・tertiary・ゲート中の secondary'],
  ['on-accent', 'accent', 4.5, 'primary'],
  ['on-accent-muted', 'accent-muted', 4.5, 'ゲート中の primary（G-10）'],
  ['on-danger', 'danger', 4.5, 'danger ボタン（F-06）'],
  ['danger', 'surface', 4.5, 'エラー文・必須の印'],
  ['focus', 'surface', 3, 'フォーカスリング（K-07。非テキストは 3:1）'],
];
