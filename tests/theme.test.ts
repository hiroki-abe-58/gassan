/**
 * ドキュメントサイトのテーマ（表示とプライマリカラーの切り替え）。
 *
 * 色を自由に選べても、文字が読めなければ意味がない。プリセットだけでなく任意の色を総当たりし、
 * ライトとダークの両方で、すべての文字と塗りが WCAG 2.x の基準（文字 4.5:1、非テキスト 3:1）を
 * 満たすことを確かめる。サイトの「テーマ」ページが表示する数値も、同じ関数で計算している。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { PRESETS, buildTheme, hexToOklch, oklchToHex, type Scheme } from '../site/theme/engine';

/** styles.css の gassan のトークン（その表示の値）。ダークで上書きされるものは上書き後の値。 */
function gassanTokens(scheme: Scheme): Record<string, string> {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const start = css.indexOf('@layer gassan.tokens {');
  const dark = css.indexOf('@media (prefers-color-scheme: dark)', start);
  const end = css.indexOf('@layer gassan.reset {', dark);
  const read = (text: string): Record<string, string> =>
    Object.fromEntries([...text.matchAll(/(--g-[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
  const light = read(css.slice(start, dark));
  return scheme === 'light' ? light : { ...light, ...read(css.slice(dark, end)) };
}

const SCHEMES: readonly Scheme[] = ['light', 'dark'];

/** 基準を割った項目を「どの色・どの表示・何の組か: 実測」で返す。空なら合格。 */
function failures(seed: string, themesGassan = true): string[] {
  return SCHEMES.flatMap((scheme) =>
    buildTheme(seed, scheme, gassanTokens(scheme), themesGassan)
      .checks.filter((c) => !c.pass)
      .map((c) => `${seed} ${scheme} ${c.id}: ${c.fg} / ${c.bg} = ${c.ratio.toFixed(2)}:1（${String(c.min)}:1 未満）`),
  );
}

describe('theme / コントラスト', () => {
  it('すべてのプリセットが、ライトとダークの両方で全項目の基準を満たす', () => {
    expect(PRESETS.flatMap((p) => failures(p.seed, p.themesGassan))).toEqual([]);
  });

  it('任意の色（色相 24 方向 × 明度 5 段 × 彩度 4 段）でも、ライトとダークの全項目の基準を満たす', () => {
    const seeds: string[] = [];
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.2, 0.4, 0.6, 0.8, 0.97]) {
        for (const c of [0, 0.06, 0.15, 0.32]) seeds.push(oklchToHex({ l, c, h }));
      }
    }
    seeds.push('#000000', '#ffffff', '#808080', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff');
    expect(seeds.flatMap((seed) => failures(seed))).toEqual([]);
  });

  it('ライトでは白い文字を、ダークでは暗い文字をアクセントに載せる', () => {
    for (const p of PRESETS) {
      const light = buildTheme(p.seed, 'light', gassanTokens('light'), true);
      const dark = buildTheme(p.seed, 'dark', gassanTokens('dark'), true);
      expect(light.accent.onAccent).toBe('#ffffff');
      expect(hexToOklch(dark.accent.onAccent).l).toBeLessThan(0.2);
    }
  });
});

describe('theme / 色の見え方', () => {
  it('プリセットの色相は保たれる（明度を動かすだけで、別の色に転ばない）', () => {
    const drift = PRESETS.flatMap((p) =>
      SCHEMES.flatMap((scheme) => {
        const seed = hexToOklch(p.seed);
        const accent = hexToOklch(buildTheme(p.seed, scheme, gassanTokens(scheme), true).accent.accent);
        const delta = Math.abs(((accent.h - seed.h + 540) % 360) - 180);
        return delta > 8 ? [`${p.id} ${scheme}: 色相が ${delta.toFixed(1)}° ずれた`] : [];
      }),
    );
    expect(drift).toEqual([]);
  });

  it('隣り合うプリセットのアクセントは見分けられる（OKLab で一定以上離れている）', () => {
    for (const scheme of SCHEMES) {
      const colors = PRESETS.filter((p) => p.id !== 'default').map((p) => ({
        label: p.id,
        lab: hexToOklch(buildTheme(p.seed, scheme, gassanTokens(scheme), true).accent.accent),
      }));
      for (let i = 1; i < colors.length; i += 1) {
        const a = colors[i - 1];
        const b = colors[i];
        if (!a || !b) continue;
        const toLab = (c: { l: number; c: number; h: number }): [number, number, number] => [
          c.l,
          c.c * Math.cos((c.h * Math.PI) / 180),
          c.c * Math.sin((c.h * Math.PI) / 180),
        ];
        const [l1, a1, b1] = toLab(a.lab);
        const [l2, a2, b2] = toLab(b.lab);
        const distance = Math.hypot(l1 - l2, a1 - a2, b1 - b2);
        expect(distance, `${scheme}: ${a.label} と ${b.label}`).toBeGreaterThan(0.05);
      }
    }
  });

  it('既定のプリセットはモーダルの色を変えない（gassan の墨色のまま）', () => {
    for (const scheme of SCHEMES) {
      const tokens = gassanTokens(scheme);
      const theme = buildTheme(PRESETS[0]?.seed ?? '#000000', scheme, tokens, false);
      expect(theme.vars['--g-accent']).toBe(tokens['--g-accent']);
      expect(theme.vars['--g-focus']).toBe(tokens['--g-focus']);
    }
  });

  it('sRGB と OKLCH を往復しても色がずれない', () => {
    for (const hex of ['#3346d3', '#fcc419', '#0c9488', '#000000', '#ffffff', '#808080']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
});
