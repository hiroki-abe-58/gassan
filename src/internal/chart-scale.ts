/**
 * グラフの目盛り・位置・線の形（Q-03〜Q-05・Q-10）。
 *
 * DOM に触らない純粋関数だけを置く。座標はどれも 0〜100 の割合で返し、描く側が % の位置か
 * viewBox="0 0 100 100" の SVG に載せる。要素の大きさを測らずに形が決まるので、サーバーで描いても同じ形になる。
 */

/** 刻みの候補（× 10^n）。 */
const STEP_FACTORS = [1, 2, 2.5, 5] as const;

/**
 * 目盛り。min〜max を含み、端も刻みに乗る（範囲は ticks[0]〜ticks.at(-1)）。
 * 刻みは 1・2・2.5・5 × 10^n のうち、目盛りの間が count 個以下になる最も細かいもの（0〜123 なら 25 刻みで 0〜125）。
 * 値がどれも整数なら、端数の刻み（0.5 や 2.5）は使わない（人数や件数に「2.5 人」の目盛りを出さない）。
 * 値が 1 つしかない（min === max）ときは、その値の上下に 1 割の余白を取る。
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
  if (lo === hi) {
    if (lo === 0) return [0, 1];
    const pad = Math.abs(lo) * 0.1;
    lo -= pad;
    hi += pad;
  }
  const integers = Number.isInteger(min) && Number.isInteger(max);
  const intervals = Math.max(1, count);
  let base = 10 ** Math.floor(Math.log10((hi - lo) / intervals));
  for (let round = 0; round < 8; round += 1, base *= 10) {
    for (const factor of STEP_FACTORS) {
      const step = factor * base;
      if (integers && !Number.isInteger(step)) continue;
      const start = Math.floor(lo / step) * step;
      const end = Math.ceil(hi / step) * step;
      const gaps = Math.round((end - start) / step);
      if (gaps > intervals) continue;
      // 浮動小数の端数（0.1 + 0.2）を目盛りに出さない。2.5 刻みは 1 桁多く要る
      const digits = Math.max(0, -Math.floor(Math.log10(step)) + 1);
      return Array.from({ length: gaps + 1 }, (_, i) => Number((start + i * step).toFixed(digits)));
    }
  }
  return [lo, hi];
}

/** 値の範囲。zero なら 0 を必ず含める（棒と面は 0 から描くので、0 を外すと大きさを偽る）。 */
export function valueExtent(values: readonly number[], zero: boolean): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    lo = Math.min(lo, value);
    hi = Math.max(hi, value);
  }
  if (lo === Infinity) return [0, 0];
  return zero ? [Math.min(lo, 0), Math.max(hi, 0)] : [lo, hi];
}

/** 値を 0〜100 の高さの位置（上が 0）に移す。domain は目盛りの両端。 */
export function toTop(value: number, domain: readonly [number, number]): number {
  const [lo, hi] = domain;
  if (hi === lo) return 50;
  return ((hi - value) / (hi - lo)) * 100;
}

/** 値を 0〜100 の横の位置（左が 0）に移す。 */
export function toLeft(value: number, domain: readonly [number, number]): number {
  return 100 - toTop(value, domain);
}

/**
 * 項目の横の位置（0〜100）。線は端から端まで使い（最初の点が左端、最後の点が右端）、
 * 棒は帯の真ん中に置く。点が 1 つなら真ん中。
 */
export function pointAt(index: number, count: number, band: boolean): number {
  if (band) return ((index + 0.5) / count) * 100;
  if (count <= 1) return 50;
  return (index / (count - 1)) * 100;
}

/* -------------------------------------------------------------------------- */
/* 文字の幅                                                                    */
/* -------------------------------------------------------------------------- */

/** 全角の幅で描かれる文字（漢字・かな・ハングル・全角の記号）。 */
const WIDE = /[ᄀ-ᇿ⺀-〿぀-ヿ㄀-ㇿ㐀-䶿一-鿿가-힯豈-﫿＀-｠￠-￦]/u;

/**
 * 文字の幅の見積もり（px）。全角は 1em、そのほかは 0.62em（ラテン文字は Linux の字幅の広いフォントに合わせて多めに見る）。
 * 測らずに決めるので、サーバーと jsdom とブラウザで同じ結果になる。目盛りの文字を間引く本数にだけ使う。
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const char of text) em += WIDE.test(char) ? 1 : 0.62;
  return em * fontSize;
}

/**
 * 目盛りの文字を何本おきに出すか。いちばん長い文字が、隣と gap 以上離れる本数にする。
 * band は 1 項目あたりの幅（px）。
 */
export function labelStride(widths: readonly number[], band: number, gap = 12): number {
  const widest = widths.reduce((max, width) => Math.max(max, width), 0);
  if (band <= 0) return Math.max(1, widths.length);
  return Math.max(1, Math.ceil((widest + gap) / band));
}

export interface AxisLabel {
  index: number;
  /** 中心に置くと器からはみ出す文字。'start' は器の左端に、'end' は右端に寄せる。 */
  edge?: 'start' | 'end';
}

/**
 * 横の目盛りの文字の置き方（Q-10）。文字の中心を点に合わせ、器からはみ出す文字は端へ寄せる
 * （はみ出した文字は、器の外まで文書を広げる）。間は stride 本おきにし、寄せた後に隣と gap 以上離れない文字は落とす。
 * 最初と最後の文字はできるだけ残す（最後の文字に近すぎる間の文字のほうを落とす）。
 * widths は文字の幅（px）、positions は点の位置（0〜100）、width は器の幅（px）。
 */
export function placeAxisLabels(widths: readonly number[], positions: readonly number[], width: number, gap = 12): AxisLabel[] {
  const count = widths.length;
  if (count === 0) return [];
  const place = (index: number): { label: AxisLabel; left: number; right: number } => {
    const w = widths[index] ?? 0;
    const x = ((positions[index] ?? 0) / 100) * width;
    if (x - w / 2 < 0) return { label: { index, edge: 'start' }, left: 0, right: w };
    if (x + w / 2 > width) return { label: { index, edge: 'end' }, left: width - w, right: width };
    return { label: { index }, left: x - w / 2, right: x + w / 2 };
  };
  const spacing = count > 1 ? (((positions[1] ?? 0) - (positions[0] ?? 0)) / 100) * width : width;
  const stride = labelStride(widths, spacing, gap);
  const first = place(0);
  const last = count > 1 ? place(count - 1) : null;
  const out: AxisLabel[] = [first.label];
  let right = first.right;
  for (let index = stride; index < count - 1; index += stride) {
    const next = place(index);
    if (last && next.right + gap > last.left) break;
    if (next.left < right + gap) continue;
    out.push(next.label);
    right = next.right;
  }
  if (last && last.left >= right + gap) out.push(last.label);
  return out;
}

/* -------------------------------------------------------------------------- */
/* 線の形                                                                      */
/* -------------------------------------------------------------------------- */

export type Point = readonly [number, number];

const round = (value: number): number => Math.round(value * 1000) / 1000;
const pair = ([x, y]: Point): string => `${String(round(x))} ${String(round(y))}`;

/** 折れ線。 */
export function linearPath(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${pair(point)}`).join('');
}

/**
 * 滑らかな線（単調な 3 次補間。Fritsch–Carlson）。点と点の間で行き過ぎないので、
 * 実際には無い山や谷（0 を割る線・最大を超える線）を描かない。x は増えていく順であること。
 */
export function monotonePath(points: readonly Point[]): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const dx = (xs[i + 1] ?? 0) - (xs[i] ?? 0);
    slopes.push(dx === 0 ? 0 : ((ys[i + 1] ?? 0) - (ys[i] ?? 0)) / dx);
  }
  const tangents: number[] = new Array<number>(n).fill(0);
  tangents[0] = slopes[0] ?? 0;
  tangents[n - 1] = slopes[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i += 1) {
    const before = slopes[i - 1] ?? 0;
    const after = slopes[i] ?? 0;
    tangents[i] = before * after <= 0 ? 0 : (before + after) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    const slope = slopes[i] ?? 0;
    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = (tangents[i] ?? 0) / slope;
    const b = (tangents[i + 1] ?? 0) / slope;
    const h = a * a + b * b;
    if (h > 9) {
      const tau = 3 / Math.sqrt(h);
      tangents[i] = tau * a * slope;
      tangents[i + 1] = tau * b * slope;
    }
  }
  let path = `M${pair([xs[0] ?? 0, ys[0] ?? 0])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const x0 = xs[i] ?? 0;
    const x1 = xs[i + 1] ?? 0;
    const y0 = ys[i] ?? 0;
    const y1 = ys[i + 1] ?? 0;
    const third = (x1 - x0) / 3;
    path += `C${pair([x0 + third, y0 + (tangents[i] ?? 0) * third])} ${pair([x1 - third, y1 - (tangents[i + 1] ?? 0) * third])} ${pair([x1, y1])}`;
  }
  return path;
}

/** 線の下の面。上の線を引き、base（下の線。積み上げなら下の系列の線）を逆向きに戻って閉じる。 */
export function areaPath(top: readonly Point[], base: readonly Point[], smooth: boolean): string {
  if (top.length === 0) return '';
  const line = smooth ? monotonePath(top) : linearPath(top);
  const back = [...base].reverse();
  const closing = smooth ? monotonePath(back).replace(/^M/, 'L') : back.map((point) => `L${pair(point)}`).join('');
  return `${line}${closing}Z`;
}

/** 区切りが隙間を除いても見える最小の長さ（円周を 100 とした値。直径 160px のドーナツで約 6px）。 */
const MIN_ARC = 1.5;

/**
 * ドーナツの区切りの長さ（円周を 100 とした値）。Q-05。
 *
 * 割合のままだと、隙間（gap）より小さい区切りが円から消える（凡例にはあるのに円に無い）。
 * 0 より大きい値は隙間を除いても MIN_ARC だけは見えるように底上げし、その分を残りの区切りから比で引く。
 * 引いた結果、底を割った区切りも底上げに回す。底上げしきれないほど区切りが多いときは割合のまま描く。
 * 凡例と読み上げの割合は、いつも元の値のまま。
 */
export function arcLengths(values: readonly number[], gap: number): number[] {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  const shares = values.map((value) => (total > 0 ? (Math.max(0, value) / total) * 100 : 0));
  const floor = gap + MIN_ARC;
  const lifted = new Set<number>();
  let lengths = shares;
  for (;;) {
    const low = lengths.flatMap((length, index) => (length > 0 && length < floor && !lifted.has(index) ? [index] : []));
    if (low.length === 0) return lengths;
    low.forEach((index) => lifted.add(index));
    const free = 100 - lifted.size * floor;
    const rest = shares.reduce((sum, share, index) => (lifted.has(index) ? sum : sum + share), 0);
    if (free <= 0 || rest <= 0) return shares;
    lengths = shares.map((share, index) => (lifted.has(index) ? floor : (share * free) / rest));
  }
}

/** 欠けた値（null）で線を切り分ける。値が続いている区間ごとに、元の位置を添えて返す。 */
export function segmentsOf<T>(values: readonly (T | null)[]): { start: number; values: T[] }[] {
  const segments: { start: number; values: T[] }[] = [];
  let current: { start: number; values: T[] } | null = null;
  values.forEach((value, index) => {
    if (value === null) {
      current = null;
      return;
    }
    if (!current) {
      current = { start: index, values: [] };
      segments.push(current);
    }
    current.values.push(value);
  });
  return segments;
}
