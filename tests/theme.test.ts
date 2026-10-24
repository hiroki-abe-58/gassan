/**
 * ドキュメントサイトのテーマ（表示・背景の色づけ・プライマリカラーの切り替え）。
 *
 * 色を自由に選べても、文字が読めなければ意味がない。プリセットだけでなく任意の色を総当たりし、
 * ライトとダーク、背景の 3 段のすべてで、すべての文字と塗りが WCAG 2.x の基準（文字 4.5:1、非テキスト 3:1）を
 * 満たすことを確かめる。サイトの「テーマ」ページが表示する数値も、同じ関数で計算している。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PRESETS,
  SITE_NEUTRALS,
  TINTS,
  buildTheme,
  hexToOklch,
  oklchToHex,
  type Oklch,
  type Scheme,
  type Tint,
} from '../site/theme/engine';

/** styles.css の gassan のトークン（その表示の値）。ダークで上書きされるものは上書き後の値。 */
function readGassanTokens(scheme: Scheme): Record<string, string> {
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

/*
 * 表示ごとに 1 度だけ読む。総当たりの検査は色 × 表示 × 背景で約 3,000 回トークンを引くので、
 * 毎回 styles.css を読んでコメントを落としていたころは CI（Node 20）で 5 秒の上限を超えていた。
 */
const TOKENS: Readonly<Record<Scheme, Record<string, string>>> = { light: readGassanTokens('light'), dark: readGassanTokens('dark') };
const gassanTokens = (scheme: Scheme): Record<string, string> => TOKENS[scheme];

/** 基準を割った項目を「どの色・どの表示・どの背景・何の組か: 実測」で返す。空なら合格。背景の 3 段すべてを見る。 */
function failures(seed: string): string[] {
  return SCHEMES.flatMap((scheme) =>
    TINTS.flatMap((tint) =>
      buildTheme(seed, scheme, gassanTokens(scheme), tint)
        .checks.filter((c) => !c.pass)
        .map(
          (c) =>
            `${seed} ${scheme} ${tint} ${c.id}: ${c.fg} / ${c.bg} = ${c.ratio.toFixed(2)}:1（${String(c.min)}:1 未満）`,
        ),
    ),
  );
}

/** OKLab（OKLCH を直交座標に戻したもの）での距離。0.02 前後が見分けられるかどうかの境目。 */
function distance(a: string, b: string): number {
  const lab = ({ l, c, h }: Oklch): [number, number, number] => [
    l,
    c * Math.cos((h * Math.PI) / 180),
    c * Math.sin((h * Math.PI) / 180),
  ];
  const [l1, a1, b1] = lab(hexToOklch(a));
  const [l2, a2, b2] = lab(hexToOklch(b));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

describe('theme / コントラスト', () => {
  it('すべてのプリセットが、背景の 3 段とライト・ダークのすべてで全項目の基準を満たす', () => {
    expect(PRESETS.flatMap((p) => failures(p.seed))).toEqual([]);
  });

  it('任意の色（色相 24 方向 × 明度 5 段 × 彩度 4 段）でも、背景の 3 段とライト・ダークのすべてで全項目の基準を満たす', () => {
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
      const light = buildTheme(p.seed, 'light', gassanTokens('light'));
      const dark = buildTheme(p.seed, 'dark', gassanTokens('dark'));
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
        const accent = hexToOklch(buildTheme(p.seed, scheme, gassanTokens(scheme)).accent.accent);
        const delta = Math.abs(((accent.h - seed.h + 540) % 360) - 180);
        return delta > 8 ? [`${p.id} ${scheme}: 色相が ${delta.toFixed(1)}° ずれた`] : [];
      }),
    );
    expect(drift).toEqual([]);
  });

  it('隣り合うプリセットのアクセントは見分けられる（OKLab で一定以上離れている）', () => {
    // 背景を色づけると、淡い面と沈んだ面が暗く（ダークでは明るく）なるぶん、アクセントが 4.5:1 を取れる明度の幅が狭まり、
    // 隣と寄る。色づけたときも、最も近い組（ライトのサーモンピンクと赤寄りのオレンジなど）で 0.045 は離す
    const MIN: Record<Tint, number> = { neutral: 0.05, soft: 0.045, strong: 0.045 };
    for (const scheme of SCHEMES) {
      for (const tint of TINTS) {
        const colors = PRESETS.filter((p) => p.id !== 'default').map((p) => ({
          label: p.id,
          accent: buildTheme(p.seed, scheme, gassanTokens(scheme), tint).accent.accent,
        }));
        for (let i = 1; i < colors.length; i += 1) {
          const a = colors[i - 1];
          const b = colors[i];
          if (!a || !b) continue;
          expect(distance(a.accent, b.accent), `${scheme} ${tint}: ${a.label} と ${b.label}`).toBeGreaterThan(
            MIN[tint],
          );
        }
      }
    }
  });

  it('既定のプリセットが導く色は gassan の既定の色と同じ（サイトで見た色が、入れただけの見た目になる）', () => {
    const seed = PRESETS.find((p) => p.id === 'default')?.seed ?? '';
    for (const scheme of SCHEMES) {
      const tokens = gassanTokens(scheme);
      const { vars } = buildTheme(seed, scheme, tokens);
      const pick = (from: Record<string, string>): string[] =>
        ['--g-accent', '--g-on-accent', '--g-focus'].map((name) => `${scheme} ${name}: ${from[name] ?? ''}`);
      expect(pick(vars)).toEqual(pick(tokens));
    }
  });

  it('sRGB と OKLCH を往復しても色がずれない', () => {
    for (const hex of ['#3346d3', '#fcc419', '#0c9488', '#000000', '#ffffff', '#808080']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
});

describe('theme / 背景の色づけ', () => {
  const CHROMATIC = PRESETS.filter((p) => hexToOklch(p.seed).c > 0.05);
  const SURFACES = ['--s-bg', '--s-surface', '--s-surface-1', '--s-surface-2', '--s-surface-3'] as const;
  const L = (hex: string | undefined): number => hexToOklch(hex ?? '#000000').l;

  it('無彩色では、サイトと gassan の面と文字は元の値のまま（色づけを選ぶまで見た目は変わらない）', () => {
    for (const scheme of SCHEMES) {
      const tokens = gassanTokens(scheme);
      const { vars } = buildTheme(PRESETS[0]?.seed ?? '#000000', scheme, tokens, 'neutral');
      expect(vars).toMatchObject({ ...SITE_NEUTRALS[scheme], ...tokens });
    }
  });

  it('面の色相はプライマリに寄り、無彩色・淡い・濃いの順に彩度が上がる', () => {
    const wrong = CHROMATIC.flatMap((p) =>
      SCHEMES.flatMap((scheme) => {
        const [neutral, soft, strong] = TINTS.map((tint) =>
          hexToOklch(buildTheme(p.seed, scheme, gassanTokens(scheme), tint).vars['--s-bg'] ?? ''),
        );
        if (!neutral || !soft || !strong) return [`${p.id} ${scheme}: 背景がない`];
        const seedHue = hexToOklch(p.seed).h;
        // 淡いは彩度が小さく 8 bit に丸めると色相が揺れるので、濃いの色相で見る
        const drift = Math.abs(((strong.h - seedHue + 540) % 360) - 180);
        const out: string[] = [];
        if (!(neutral.c < soft.c && soft.c < strong.c)) {
          out.push(`${p.id} ${scheme}: 彩度 ${[neutral.c, soft.c, strong.c].map((c) => c.toFixed(3)).join(' → ')}`);
        }
        if (drift > 10) out.push(`${p.id} ${scheme}: 濃いの色相が ${drift.toFixed(1)}° ずれた`);
        return out;
      }),
    );
    expect(wrong).toEqual([]);
  });

  it('面の重なりの順は崩れない（ライトはカードとモーダルの面がいちばん明るく、ダークは背景がいちばん暗い）', () => {
    const wrong = PRESETS.flatMap((p) =>
      SCHEMES.flatMap((scheme) =>
        TINTS.flatMap((tint) => {
          const { vars } = buildTheme(p.seed, scheme, gassanTokens(scheme), tint);
          const [bg, surface, s1, s2, s3] = SURFACES.map((name) => L(vars[name]));
          const modal = L(vars['--g-surface']);
          const order =
            scheme === 'light'
              ? [s3, s2, s1, bg, surface] // 沈んだ面ほど暗く、カードの面が背景より明るい
              : [bg, surface, s1, s2, s3]; // ダークは面を明るくして分離する（S-07）
          const sorted = order.every((v, i) => i === 0 || (v ?? 0) > (order[i - 1] ?? 0));
          const floats = modal > (bg ?? 0);
          if (sorted && floats) return [];
          const levels = order.map((v) => (v ?? 0).toFixed(3)).join(' < ');
          return [`${p.id} ${scheme} ${tint}: 面の明度 ${levels} / モーダル ${modal.toFixed(3)}`];
        }),
      ),
    );
    expect(wrong).toEqual([]);
  });

  it('淡い面（選択中のナビ）は、背景・カード・沈んだ面・ホバーの面（--s-surface-2）のどれとも見分けられる', () => {
    // 0.02 前後が見分けの境目。無彩色の赤系のプリセットで 0.026 なので、それを下回らせない
    const wrong = CHROMATIC.flatMap((p) =>
      SCHEMES.flatMap((scheme) =>
        TINTS.flatMap((tint) => {
          const { vars } = buildTheme(p.seed, scheme, gassanTokens(scheme), tint);
          const soft = vars['--s-accent-soft'] ?? '';
          return SURFACES.slice(0, 4)
            .map((name) => [name, distance(soft, vars[name] ?? '')] as const)
            .filter(([, d]) => d < 0.025)
            .map(([name, d]) => `${p.id} ${scheme} ${tint}: ${soft} と ${name} ${vars[name] ?? ''} = ${d.toFixed(3)}`);
        }),
      ),
    );
    expect(wrong).toEqual([]);
  });
});
