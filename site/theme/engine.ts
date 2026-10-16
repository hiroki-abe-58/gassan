/**
 * サイトのテーマ（表示とプライマリカラー）を組み立てる。
 *
 * 好きな色を選べても、文字が読めなければ意味がない。ここでは「選ばれた色」を種として、
 * 色相を保ったまま明度だけを動かし、WCAG 2.x のコントラスト比を満たす色を導く。
 *
 *   ライト … アクセントは暗めにして白い文字を載せる。リンクとしても面の上で 4.5:1
 *   ダーク … アクセントは明るめにして暗い文字を載せる。リンクとしても面の上で 4.5:1
 *
 * 明度は OKLCH（知覚的に均一な色空間）で動かすので、色相が転ばず「黄色は黄色の系統のまま暗くなる」。
 * 黄色や黄緑のように明るい色相は、白い面の上で 4.5:1 を取るために、からし色やオリーブまで暗くなる。
 * これは Material Design 3 の配色と同じ結論で、読めることを優先した結果である。
 *
 * 計算は純粋関数だけで、DOM に触らない。テスト（tests/theme.test.ts）が同じ関数で全組み合わせを検査する。
 */
import { contrastRatio } from '../data/color';

export type Scheme = 'light' | 'dark';

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/* -------------------------------------------------------------------------- */
/* 色空間                                                                     */
/* -------------------------------------------------------------------------- */

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  const r = toLinear(((n >> 16) & 255) / 255);
  const g = toLinear(((n >> 8) & 255) / 255);
  const b = toLinear((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

/** OKLCH → 線形 sRGB。範囲外（色域外）もそのまま返す。 */
function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad);
  const B = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb: readonly number[]): boolean => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

/** OKLCH → #rrggbb。色域に入らなければ、明度と色相を保ったまま彩度だけを落とす。 */
export function oklchToHex(color: Oklch): string {
  const l = Math.min(1, Math.max(0, color.l));
  let c = Math.max(0, color.c);
  if (!inGamut(oklchToLinear({ l, c, h: color.h }))) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  const rgb = oklchToLinear({ l, c, h: color.h }).map((v) => Math.round(toGamma(Math.min(1, Math.max(0, v))) * 255));
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* -------------------------------------------------------------------------- */
/* 明度の調整                                                                 */
/* -------------------------------------------------------------------------- */

const passesAll = (hex: string, backgrounds: readonly string[], min: number): boolean =>
  backgrounds.every((bg) => contrastRatio(hex, bg) >= min);

/**
 * 色相と彩度を保ったまま、すべての背景に対して min 以上の比になる明度を探す。
 * ライトは暗い方へ、ダークは明るい方へ動かし、種に最も近い明度を返す。
 */
export function fitLightness(seed: Oklch, scheme: Scheme, backgrounds: readonly string[], min: number): string {
  const at = (l: number): string => oklchToHex({ l, c: seed.c, h: seed.h });
  if (passesAll(at(seed.l), backgrounds, min)) return at(seed.l);
  // ライトでは 0（黒）、ダークでは 1（白）が必ず通る。そこから種の側へ二分探索する。
  let pass = scheme === 'light' ? 0 : 1;
  let fail = seed.l;
  for (let i = 0; i < 30; i += 1) {
    const mid = (pass + fail) / 2;
    if (passesAll(at(mid), backgrounds, min)) pass = mid;
    else fail = mid;
  }
  // 彩度を色域に合わせて落とした影響で、境目がわずかに揺れることがある。通るまで一歩ずつ進める。
  let l = pass;
  const step = scheme === 'light' ? -0.002 : 0.002;
  while (!passesAll(at(l), backgrounds, min) && l > 0 && l < 1) l += step;
  return at(Math.min(1, Math.max(0, l)));
}

/* -------------------------------------------------------------------------- */
/* 面の色（サイト）                                                           */
/* -------------------------------------------------------------------------- */

/** サイトの無彩色の面と文字。アクセントに依らない。 */
export const SITE_NEUTRALS: Record<Scheme, Record<string, string>> = {
  light: {
    '--s-bg': '#fbfbf8',
    '--s-surface': '#ffffff',
    '--s-surface-1': '#f4f4ef',
    '--s-surface-2': '#ecece5',
    '--s-surface-3': '#e2e2d9',
    '--s-ink': '#17181c',
    '--s-ink-2': '#454a54',
    '--s-ink-3': '#636975',
    '--s-line': '#e2e2da',
    '--s-line-strong': '#c8c8bf',
    '--s-do': '#12764a',
    '--s-do-soft': '#dff3e7',
    '--s-dont': '#b42318',
    '--s-dont-soft': '#fde6e2',
    '--s-caution': '#855800',
    '--s-caution-soft': '#fbf0d4',
    '--s-code-bg': '#15171c',
    '--s-code-ink': '#e6e8ee',
    '--s-shadow': '0 1px 2px rgb(0 0 0 / 0.05), 0 10px 30px -14px rgb(0 0 0 / 0.22)',
  },
  dark: {
    '--s-bg': '#0f1013',
    '--s-surface': '#16181d',
    '--s-surface-1': '#1b1d23',
    '--s-surface-2': '#22252c',
    '--s-surface-3': '#2c3038',
    '--s-ink': '#eceef2',
    '--s-ink-2': '#c1c6d0',
    '--s-ink-3': '#9aa1af',
    '--s-line': '#2a2d35',
    '--s-line-strong': '#3b3f4a',
    '--s-do': '#74d6a3',
    '--s-do-soft': '#11301f',
    '--s-dont': '#ff9d92',
    '--s-dont-soft': '#3b1714',
    '--s-caution': '#f0c463',
    '--s-caution-soft': '#33290f',
    '--s-code-bg': '#0b0c0f',
    '--s-code-ink': '#e6e8ee',
    '--s-shadow': '0 1px 2px rgb(0 0 0 / 0.4), 0 12px 30px -12px rgb(0 0 0 / 0.6)',
  },
};

/** アクセントを合わせる目標の比。判定の基準（4.5）より少しだけ上に置く。 */
const ACCENT_TARGET = 4.6;

/** ダークで暗い文字を載せるときの色。どの面より暗いので、面に対して通る色の上では必ず通る。 */
const ON_LIGHT_ACCENT = '#0b0c10';
const ON_DARK_ACCENT = '#ffffff';

/* -------------------------------------------------------------------------- */
/* プリセット                                                                 */
/* -------------------------------------------------------------------------- */

export interface Preset {
  id: string;
  label: string;
  /** 種の色。ここから明度を調整して実際のアクセントを導く。 */
  seed: string;
  /** false なら gassan のモーダルは既定の墨色のまま（サイトだけ色を変える）。 */
  themesGassan: boolean;
}

export const PRESETS: readonly Preset[] = [
  { id: 'default', label: '既定', seed: '#3346d3', themesGassan: false },
  { id: 'magenta', label: '赤紫', seed: '#d6336c', themesGassan: true },
  { id: 'red', label: '赤', seed: '#e03131', themesGassan: true },
  // #f2552c だと、ライトで暗くしたときに「赤」とほぼ同じ色になった（tests/theme.test.ts が検出）。
  { id: 'vermilion', label: '赤寄りのオレンジ', seed: '#f76707', themesGassan: true },
  { id: 'amber', label: '黄色寄りのオレンジ', seed: '#f59f00', themesGassan: true },
  // #fcc419 だと、ライトで暗くしたときに「黄色寄りのオレンジ」と見分けにくかった。色相を約 101° に寄せる。
  { id: 'yellow', label: '黄色', seed: '#e8d000', themesGassan: true },
  // 黄緑〜青は、ライトとダークの両方で「隣り合うプリセットのアクセントが最も離れる」色相を
  // 総当たりで選んだ（OKLCH の色相 130 / 155 / 180 / 240）。勘で選ぶと、暗くした後に隣と見分けられなくなる。
  { id: 'lime', label: '黄緑', seed: '#71ad00', themesGassan: true },
  { id: 'green', label: '緑', seed: '#00a05b', themesGassan: true },
  { id: 'teal', label: 'ティール', seed: '#009c89', themesGassan: true },
  { id: 'blue', label: '青', seed: '#0089c9', themesGassan: true },
  { id: 'indigo', label: '青紫', seed: '#6741d9', themesGassan: true },
];

export const CUSTOM_PRESET_ID = 'custom';

/* -------------------------------------------------------------------------- */
/* テーマ                                                                     */
/* -------------------------------------------------------------------------- */

export interface Accent {
  /** ボタンの塗り・リンク・選択中の文字・フォーカスリング */
  accent: string;
  /** accent の上の文字 */
  onAccent: string;
  /** 淡い面（選択中のナビ、補足の囲み） */
  soft: string;
  /** soft の上の文字 */
  onSoft: string;
}

export interface ContrastCheck {
  what: string;
  fg: string;
  bg: string;
  /** WCAG の基準。文字は 4.5、非テキスト（輪郭・塗りの境界）は 3 */
  min: number;
  ratio: number;
  pass: boolean;
}

export interface Theme {
  scheme: Scheme;
  accent: Accent;
  /** documentElement に書くカスタムプロパティ */
  vars: Record<string, string>;
  checks: ContrastCheck[];
}

/** 種の色からアクセント一式を導く。backgrounds はアクセントを文字として載せる面。 */
export function deriveAccent(seedHex: string, scheme: Scheme, backgrounds: readonly string[]): Accent {
  const seed = hexToOklch(seedHex);
  const soft =
    scheme === 'light'
      ? oklchToHex({ l: 0.95, c: Math.min(seed.c, 0.04), h: seed.h })
      : oklchToHex({ l: 0.3, c: Math.min(seed.c, 0.06), h: seed.h });
  const onSoftSeed =
    scheme === 'light'
      ? { l: 0.4, c: Math.min(seed.c, 0.12), h: seed.h }
      : { l: 0.9, c: Math.min(seed.c, 0.08), h: seed.h };
  // 淡い面の上の文字は、AA（4.5）ではなく AAA（7）を目標にする。長い文を載せる場所なので。
  const onSoft = fitLightness(onSoftSeed, scheme, [soft], 7);
  // 基準は 4.5 だが、ちょうどに張り付かせない。描画（アンチエイリアス）の誤差のぶん余裕を持たせる。
  const accent = fitLightness(seed, scheme, [...backgrounds, soft], ACCENT_TARGET);
  return { accent, onAccent: scheme === 'light' ? ON_DARK_ACCENT : ON_LIGHT_ACCENT, soft, onSoft };
}

const check = (what: string, fg: string, bg: string, min: number): ContrastCheck => {
  const ratio = contrastRatio(fg, bg);
  return { what, fg, bg, min, ratio, pass: ratio >= min };
};

/**
 * テーマを組み立てる。gassanTokens は styles.css のその表示の値（--g-surface など）。
 * themesGassan が false なら、gassan のアクセントは既定のまま（墨色）。
 */
export function buildTheme(
  seedHex: string,
  scheme: Scheme,
  gassanTokens: Record<string, string>,
  themesGassan: boolean,
): Theme {
  const site = SITE_NEUTRALS[scheme];
  const g = (name: string): string => gassanTokens[name] ?? '#000000';
  const backgrounds = [site['--s-bg'], site['--s-surface'], site['--s-surface-1'], site['--s-surface-2'], g('--g-surface')]
    .filter((v): v is string => Boolean(v));
  const accent = deriveAccent(seedHex, scheme, backgrounds);

  const gassan: Record<string, string> = { ...gassanTokens };
  if (themesGassan) {
    gassan['--g-accent'] = accent.accent;
    gassan['--g-on-accent'] = accent.onAccent;
    gassan['--g-focus'] = accent.accent;
  }

  const vars: Record<string, string> = {
    ...site,
    '--s-accent': accent.accent,
    '--s-on-accent': accent.onAccent,
    '--s-accent-soft': accent.soft,
    '--s-on-accent-soft': accent.onSoft,
    ...gassan,
  };

  const s = (name: string): string => vars[name] ?? '#000000';
  const checks: ContrastCheck[] = [
    check('リンク・選択中の文字（ページの背景）', s('--s-accent'), s('--s-bg'), 4.5),
    check('リンク・選択中の文字（面）', s('--s-accent'), s('--s-surface'), 4.5),
    check('リンク・選択中の文字（一段沈んだ面）', s('--s-accent'), s('--s-surface-1'), 4.5),
    check('リンク・選択中の文字（二段沈んだ面）', s('--s-accent'), s('--s-surface-2'), 4.5),
    check('リンク（淡い面の上）', s('--s-accent'), s('--s-accent-soft'), 4.5),
    check('塗りのボタンの文字', s('--s-on-accent'), s('--s-accent'), 4.5),
    check('淡い面の文字（AAA を目標）', s('--s-on-accent-soft'), s('--s-accent-soft'), 7),
    check('モーダルの primary の文字', s('--g-on-accent'), s('--g-accent'), 4.5),
    check('モーダルのゲート中の primary の文字', s('--g-on-accent-muted'), s('--g-accent-muted'), 4.5),
    check('モーダルの本文', s('--g-fg'), s('--g-surface'), 4.5),
    check('モーダルの補足・tertiary', s('--g-fg-muted'), s('--g-surface'), 4.5),
    check('フォーカスリング（非テキスト）', s('--g-focus'), s('--g-surface'), 3),
    check('スイッチ・選択中のチップの塗り（非テキスト）', s('--g-accent'), s('--g-surface'), 3),
  ];

  return { scheme, accent, vars, checks };
}
