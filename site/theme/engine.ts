/**
 * サイトのテーマ（表示・背景の色づけ・プライマリカラー）を組み立てる。
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
/** 淡い面の上の文字の目標の比。基準（7）にちょうど張り付かせない（背景を色づけて淡い面を濃くしたとき 7.01:1 になった）。 */
const ON_SOFT_TARGET = 7.1;

/** ダークで暗い文字を載せるときの色。どの面より暗いので、面に対して通る色の上では必ず通る。 */
const ON_LIGHT_ACCENT = '#0b0c10';
const ON_DARK_ACCENT = '#ffffff';

/* -------------------------------------------------------------------------- */
/* 背景の色づけ                                                               */
/* -------------------------------------------------------------------------- */

/**
 * 背景の色づけ。表示名は i18n の common.theme.tints にある。
 *
 *   neutral … 無彩色の面（SITE_NEUTRALS と styles.css の値のまま）
 *   soft    … 面と線に、プライマリの色相をうっすら混ぜる。明るさは変えない
 *   strong  … ページがはっきり色の面に見えるまで彩度を足し、ライトは暗く、ダークは明るくずらす
 */
export type Tint = 'neutral' | 'soft' | 'strong';
export const TINTS: readonly Tint[] = ['neutral', 'soft', 'strong'];

interface TintSpec {
  /** 面に足す彩度（OKLCH の C）。種の彩度は超えない（灰色を選べば灰色のまま） */
  chroma: number;
  /** 面の明度をずらす量 */
  shift: Record<Scheme, number>;
  /** 淡い面（選択中のナビ・補足の囲み）。背景と同じ明るさのままだと、色づけた背景に溶けて見分けられない */
  soft: Record<Scheme, { l: number; c: number }>;
}

const TINT_SPECS: Record<Tint, TintSpec> = {
  neutral: {
    chroma: 0,
    shift: { light: 0, dark: 0 },
    soft: { light: { l: 0.95, c: 0.04 }, dark: { l: 0.3, c: 0.06 } },
  },
  soft: {
    chroma: 0.018,
    shift: { light: 0, dark: 0 },
    // 無彩色では、淡い面とホバーの面（--s-surface-2）を彩度の差で見分けていた。面にも色相が乗るとその差が消えるので、
    // ライトでは淡い面を一段暗くする。ダークは面が暗いぶん、明度の差がもともと十分ある
    soft: { light: { l: 0.915, c: 0.06 }, dark: { l: 0.3, c: 0.06 } },
  },
  // 明度をずらす量と淡い面の明るさは、隣り合うプリセットの見分けやすさとの綱引きで決めた。
  // 面を暗く（ダークでは明るく）するほど、アクセントが 4.5:1 を取れる明度の幅が狭まり、隣の色と寄っていく。
  strong: {
    chroma: 0.045,
    shift: { light: -0.03, dark: 0.01 },
    // 淡い面は、ホバーの面（--s-surface-2）より一段濃くする。背景より明るくすると、カードの面と区別がつかない
    soft: { light: { l: 0.88, c: 0.06 }, dark: { l: 0.34, c: 0.07 } },
  },
};

/**
 * 色づける面と線。値は重み（1 で TintSpec のとおりに彩度と明度を動かす）。
 * カードの面（--s-surface）とモーダルの面（--g-surface）は軽くして、色づけた背景より上に浮かせる。
 * ダークで面を明るくして分離する約束（S-07）も、明度を同じ向きにずらすので保たれる。
 */
const SURFACE_WEIGHTS: Readonly<Record<string, number>> = {
  '--s-bg': 1,
  '--s-surface': 0.35,
  '--s-surface-1': 1,
  '--s-surface-2': 1,
  '--s-surface-3': 1,
  '--s-line': 1,
  '--s-line-strong': 1,
  '--g-surface': 0.35,
  '--g-border': 1,
  '--g-border-strong': 1,
};

/** サイトの文字が載る面。リンク（アクセント）と同じ 4 つ。 */
const SITE_TEXT_BACKGROUNDS = ['--s-bg', '--s-surface', '--s-surface-1', '--s-surface-2'] as const;

/**
 * 面に載る文字。色づけた面の上でも基準を満たすまで明度を動かす（通るなら元の明度のまま）。
 * tinted は灰色の文字の色相をプライマリに寄せる。良い例・悪い例・注意・エラーの色は、意味の色なので色相を保つ。
 */
const TEXT_TOKENS: readonly { name: string; on: readonly string[]; tinted: boolean }[] = [
  { name: '--s-ink', on: SITE_TEXT_BACKGROUNDS, tinted: true },
  { name: '--s-ink-2', on: SITE_TEXT_BACKGROUNDS, tinted: true },
  { name: '--s-ink-3', on: SITE_TEXT_BACKGROUNDS, tinted: true },
  { name: '--s-do', on: SITE_TEXT_BACKGROUNDS, tinted: false },
  { name: '--s-dont', on: SITE_TEXT_BACKGROUNDS, tinted: false },
  { name: '--s-caution', on: SITE_TEXT_BACKGROUNDS, tinted: false },
  { name: '--g-fg', on: ['--g-surface'], tinted: true },
  { name: '--g-fg-muted', on: ['--g-surface'], tinted: true },
  { name: '--g-danger', on: ['--g-surface'], tinted: false },
  // トーストの成功・注意・お知らせ。意味の色なので色相を保つ。
  { name: '--g-success', on: ['--g-surface'], tinted: false },
  { name: '--g-warning', on: ['--g-surface'], tinted: false },
  { name: '--g-info', on: ['--g-surface'], tinted: false },
  // カレンダーの日曜・祝日と土曜。曜日の意味の色なので色相を保つ。
  { name: '--g-sunday', on: ['--g-surface'], tinted: false },
  { name: '--g-saturday', on: ['--g-surface'], tinted: false },
];

/** 背景の色づけで値が変わる gassan のトークン。テーマのページが、自分のアプリで同じ色にするコードに出す。 */
export const TINTED_GASSAN_TOKENS: readonly string[] = [
  ...Object.keys(SURFACE_WEIGHTS),
  ...TEXT_TOKENS.map((text) => text.name),
].filter((name) => name.startsWith('--g-'));

/** 無彩色の面と文字（サイトと gassan の両方）を、種の色相で色づける。 */
function tintNeutrals(tokens: Record<string, string>, seed: Oklch, scheme: Scheme, tint: Tint): Record<string, string> {
  if (tint === 'neutral') return tokens;
  const spec = TINT_SPECS[tint];
  const out = { ...tokens };
  for (const [name, weight] of Object.entries(SURFACE_WEIGHTS)) {
    const value = tokens[name];
    if (!value) continue;
    out[name] = oklchToHex({
      l: hexToOklch(value).l + spec.shift[scheme] * weight,
      c: Math.min(seed.c, spec.chroma * weight),
      h: seed.h,
    });
  }
  for (const text of TEXT_TOKENS) {
    const value = tokens[text.name];
    if (!value) continue;
    const own = hexToOklch(value);
    const color = text.tinted ? { l: own.l, c: Math.min(own.c, seed.c), h: seed.h } : own;
    out[text.name] = fitLightness(color, scheme, text.on.map((bg) => out[bg] ?? '#000000'), ACCENT_TARGET);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* プリセット                                                                 */
/* -------------------------------------------------------------------------- */

export type PresetId =
  | 'default'
  | 'magenta'
  | 'red'
  | 'salmon'
  | 'vermilion'
  | 'amber'
  | 'yellow'
  | 'lime-yellow'
  | 'lime'
  | 'green'
  | 'teal'
  | 'blue'
  | 'indigo';

/** 表示名は i18n の common.theme.presets にある（キーは id）。 */
export interface Preset {
  id: PresetId;
  /** 種の色。ここから明度を調整して実際のアクセントを導く。 */
  seed: string;
}

export const PRESETS: readonly Preset[] = [
  // 「既定」が導く色は、gassan の既定のアクセント（styles.css）と同じ。サイトで見た色が、入れただけの見た目になる
  { id: 'default', seed: '#3346d3' },
  { id: 'magenta', seed: '#d6336c' },
  { id: 'red', seed: '#e03131' },
  // サーモンピンク。色相は「赤」とほぼ同じ（28°）だが、彩度が低い（0.11）ので、ライトで暗くしても赤とは離れる（くすんだ赤茶になる）。
  { id: 'salmon', seed: '#f69c90' },
  // 赤寄りのオレンジ。#f2552c だと、ライトで暗くしたときに「赤」とほぼ同じ色になった（tests/theme.test.ts が検出）。
  { id: 'vermilion', seed: '#f76707' },
  { id: 'amber', seed: '#f59f00' },
  // 黄色〜青は、ライトとダークの両方で「隣り合うプリセットのアクセントが最も離れる」色相を
  // 総当たりで選んだ（OKLCH の色相 98 / 123 / 140 / 155 / 180 / 240）。黄色〜黄緑は、ライトで白い面に 4.5:1 を取ると
  // どれもオリーブの狭い帯に寄るので、勘で選ぶと隣と見分けられなくなる。
  // #fcc419 だと「黄色寄りのオレンジ」と見分けにくかった。ライムイエローを足すときは、黄色を 101° から 98° へ、
  // 黄緑を 130° から 140° へ動かして間を空けた（黄緑が 130° のままだと、ライトで隣との距離が 0.035 しか取れない）。
  { id: 'yellow', seed: '#f0d100' },
  { id: 'lime-yellow', seed: '#bfec36' },
  { id: 'lime', seed: '#53b93a' },
  { id: 'green', seed: '#00a05b' },
  { id: 'teal', seed: '#009c89' },
  { id: 'blue', seed: '#0089c9' },
  { id: 'indigo', seed: '#6741d9' },
];

export const CUSTOM_PRESET_ID = 'custom' as const;

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

/** コントラストを確かめる組。表示名は i18n の common.theme.checks にある（エンジンは文言を持たない）。 */
export type CheckId =
  | 'linkBg'
  | 'linkSurface'
  | 'linkSurface1'
  | 'linkSurface2'
  | 'linkSoft'
  | 'onAccent'
  | 'onSoft'
  | 'ink'
  | 'ink2'
  | 'ink3'
  | 'do'
  | 'dont'
  | 'caution'
  | 'gassanPrimary'
  | 'gassanGated'
  | 'gassanBody'
  | 'gassanMuted'
  | 'gassanDanger'
  | 'gassanSuccess'
  | 'gassanWarning'
  | 'gassanInfo'
  | 'gassanSunday'
  | 'gassanSaturday'
  | 'focusRing'
  | 'fill';

export interface ContrastCheck {
  id: CheckId;
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
export function deriveAccent(
  seedHex: string,
  scheme: Scheme,
  backgrounds: readonly string[],
  tint: Tint = 'neutral',
): Accent {
  const seed = hexToOklch(seedHex);
  const softTone = TINT_SPECS[tint].soft[scheme];
  const soft = oklchToHex({ l: softTone.l, c: Math.min(seed.c, softTone.c), h: seed.h });
  const onSoftSeed =
    scheme === 'light'
      ? { l: 0.4, c: Math.min(seed.c, 0.12), h: seed.h }
      : { l: 0.9, c: Math.min(seed.c, 0.08), h: seed.h };
  // 淡い面の上の文字は、AA（4.5）ではなく AAA（7）を目標にする。長い文を載せる場所なので。
  const onSoft = fitLightness(onSoftSeed, scheme, [soft], ON_SOFT_TARGET);
  // 基準は 4.5 だが、ちょうどに張り付かせない。描画（アンチエイリアス）の誤差のぶん余裕を持たせる。
  const accent = fitLightness(seed, scheme, [...backgrounds, soft], ACCENT_TARGET);
  return { accent, onAccent: scheme === 'light' ? ON_DARK_ACCENT : ON_LIGHT_ACCENT, soft, onSoft };
}

const check = (id: CheckId, fg: string, bg: string, min: number): ContrastCheck => {
  const ratio = contrastRatio(fg, bg);
  return { id, fg, bg, min, ratio, pass: ratio >= min };
};

/** テーマを組み立てる。gassanTokens は styles.css のその表示の値（--g-surface など）。 */
export function buildTheme(
  seedHex: string,
  scheme: Scheme,
  gassanTokens: Record<string, string>,
  tint: Tint = 'neutral',
): Theme {
  const neutrals = tintNeutrals({ ...SITE_NEUTRALS[scheme], ...gassanTokens }, hexToOklch(seedHex), scheme, tint);
  const n = (name: string): string => neutrals[name] ?? '#000000';
  const accent = deriveAccent(seedHex, scheme, [...SITE_TEXT_BACKGROUNDS, '--g-surface'].map(n), tint);

  const vars: Record<string, string> = {
    ...neutrals,
    '--s-accent': accent.accent,
    '--s-on-accent': accent.onAccent,
    '--s-accent-soft': accent.soft,
    '--s-on-accent-soft': accent.onSoft,
    '--g-accent': accent.accent,
    '--g-on-accent': accent.onAccent,
    '--g-focus': accent.accent,
  };

  const s = (name: string): string => vars[name] ?? '#000000';
  /** サイトの文字は、載りうる面のうち比がいちばん小さい面で測る。 */
  const onSiteSurfaces = (id: CheckId, name: string): ContrastCheck =>
    SITE_TEXT_BACKGROUNDS.map((bg) => check(id, s(name), s(bg), 4.5)).reduce((a, b) => (b.ratio < a.ratio ? b : a));
  const checks: ContrastCheck[] = [
    check('linkBg', s('--s-accent'), s('--s-bg'), 4.5),
    check('linkSurface', s('--s-accent'), s('--s-surface'), 4.5),
    check('linkSurface1', s('--s-accent'), s('--s-surface-1'), 4.5),
    check('linkSurface2', s('--s-accent'), s('--s-surface-2'), 4.5),
    check('linkSoft', s('--s-accent'), s('--s-accent-soft'), 4.5),
    check('onAccent', s('--s-on-accent'), s('--s-accent'), 4.5),
    // 淡い面の上の文字は AAA（7）を目標にする
    check('onSoft', s('--s-on-accent-soft'), s('--s-accent-soft'), 7),
    onSiteSurfaces('ink', '--s-ink'),
    onSiteSurfaces('ink2', '--s-ink-2'),
    onSiteSurfaces('ink3', '--s-ink-3'),
    onSiteSurfaces('do', '--s-do'),
    onSiteSurfaces('dont', '--s-dont'),
    onSiteSurfaces('caution', '--s-caution'),
    check('gassanPrimary', s('--g-on-accent'), s('--g-accent'), 4.5),
    check('gassanGated', s('--g-on-accent-muted'), s('--g-accent-muted'), 4.5),
    check('gassanBody', s('--g-fg'), s('--g-surface'), 4.5),
    check('gassanMuted', s('--g-fg-muted'), s('--g-surface'), 4.5),
    check('gassanDanger', s('--g-danger'), s('--g-surface'), 4.5),
    check('gassanSuccess', s('--g-success'), s('--g-surface'), 4.5),
    check('gassanWarning', s('--g-warning'), s('--g-surface'), 4.5),
    check('gassanInfo', s('--g-info'), s('--g-surface'), 4.5),
    check('gassanSunday', s('--g-sunday'), s('--g-surface'), 4.5),
    check('gassanSaturday', s('--g-saturday'), s('--g-surface'), 4.5),
    check('focusRing', s('--g-focus'), s('--g-surface'), 3),
    check('fill', s('--g-accent'), s('--g-surface'), 3),
  ];

  return { scheme, accent, vars, checks };
}
