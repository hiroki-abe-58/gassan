/**
 * シートのディテント（止まる高さ）の解決とスナップ判定。M-03 / H-09。
 *
 * レイアウトを持たない jsdom でも検証できるよう、
 * 幾何計算を DOM から切り離した純粋関数として置く。
 *
 * 高さは「ビューポートに対する割合」で持つ。px で持つと
 * 回転・仮想キーボード・ズームのたびに意味が変わるため。
 */

/** 止まる高さ。low → high の意味を名前で持つ。 */
export type DetentToken = 'peek' | 'half' | 'full';

/**
 * ディテントとビューポート比の対応。
 * full は `--k-sheet-max-block: 92dvh` と揃えてある。ここを変えるなら CSS も変える。
 */
export const DETENT_FRACTION: Record<DetentToken, number> = {
  peek: 0.3,
  half: 0.6,
  full: 0.92,
};

const ORDER: readonly DetentToken[] = ['peek', 'half', 'full'];

/** 速い指の動きとみなす速度 (px/ms)。shouldDismissBySwipe と同じ値に揃えてある。 */
export const FLICK_VELOCITY = 0.6;
/** 速度が出ていても、この距離に満たない動きは「震え」として捨てる (px)。 */
export const FLICK_MIN_DISTANCE = 24;

/**
 * 利用側の指定を正規化する。
 *
 * - 未知のトークンは捨てる（落とさない。1 つ打ち間違えてもシートは開く）
 * - 重複は畳む
 * - 低い順に並べ替える。添字 0 が必ず最も低い
 * - 結果が空なら ['full']。ディテント無しのシートと同じ挙動に落ちる
 */
export function resolveDetents(input?: readonly string[] | null): DetentToken[] {
  if (!input || input.length === 0) return ['full'];
  const seen = new Set<DetentToken>();
  for (const raw of input) {
    if ((ORDER as readonly string[]).includes(raw)) seen.add(raw as DetentToken);
  }
  if (seen.size === 0) return ['full'];
  return ORDER.filter((token) => seen.has(token));
}

/** 正規化済みの一覧から、指定トークンの添字を返す。無ければ最も高いもの。 */
export function detentIndexOf(detents: readonly DetentToken[], token?: string | null): number {
  if (detents.length === 0) return 0;
  const found = detents.findIndex((d) => d === token);
  return found === -1 ? detents.length - 1 : found;
}

/** そのディテントでのパネル高さ (px)。viewportHeight が無効なら 0。 */
export function detentHeight(token: DetentToken, viewportHeight: number): number {
  if (!(viewportHeight > 0)) return 0;
  return viewportHeight * DETENT_FRACTION[token];
}

/**
 * 段を CSS の値にする。`--k-sheet-detent` に入る唯一の正。
 *
 * React が style prop として書く値と、ドラッグ終了時に JS が戻す値が
 * 1 文字でも違うと、React は「自分が書いたものと違う」と気づけないまま
 * 差分を出さず、パネルの高さが取り残される。書式はここ 1 箇所に閉じる。
 */
export function detentCssValue(token: DetentToken): string {
  return `${(DETENT_FRACTION[token] * 100).toFixed(2)}dvh`;
}

export interface SnapInput {
  /** resolveDetents を通した昇順の一覧。 */
  detents: readonly DetentToken[];
  /** いまいる位置の添字。範囲外は丸める。 */
  currentIndex: number;
  /** 指の移動量 (px)。下が正。 */
  deltaY: number;
  /** 押してから離すまで (ms)。 */
  elapsedMs: number;
  /** ビューポート高さ (px)。0 以下なら幾何を使わずフリックだけで判定する。 */
  viewportHeight: number;
  /** 最も低い位置からさらに下へ引いたときに閉じてよいか。 */
  dismissible: boolean;
}

export type SnapResult = { type: 'snap'; index: number } | { type: 'dismiss' };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * 指を離したときの行き先を決める。
 *
 * 判定の順序に意味がある。
 *   1. 速いフリックは、距離に関係なく隣へ 1 段だけ動かす（投げた方向を尊重する）
 *   2. 遅いドラッグは、指を離した高さに最も近い段へ吸い付く
 *   3. 最下段よりさらに下へ引き切った場合だけ閉じる
 *
 * 「速い下フリック = 常に閉じる」にしない。段がある以上、
 * 利用者は『1 段下げたい』つもりで投げる。いきなり消えると操作を失う。
 */
export function snapToDetent({
  detents,
  currentIndex,
  deltaY,
  elapsedMs,
  viewportHeight,
  dismissible,
}: SnapInput): SnapResult {
  const last = detents.length - 1;
  if (last < 0) return dismissible ? { type: 'dismiss' } : { type: 'snap', index: 0 };

  const from = clamp(Math.round(currentIndex) || 0, 0, last);
  const distance = Math.abs(deltaY);
  const velocity = distance / Math.max(1, elapsedMs);
  const flick = velocity > FLICK_VELOCITY && distance > FLICK_MIN_DISTANCE;

  // 1. フリック
  if (flick) {
    if (deltaY > 0) {
      if (from === 0) return dismissible ? { type: 'dismiss' } : { type: 'snap', index: 0 };
      return { type: 'snap', index: from - 1 };
    }
    return { type: 'snap', index: Math.min(last, from + 1) };
  }

  // 幾何が無いときは動かさない。NaN を外に出さないための分岐でもある。
  const lowest = detents[0];
  const current = detents[from];
  if (!(viewportHeight > 0) || !lowest || !current) return { type: 'snap', index: from };

  // 2. 指を離した高さ。下へ引いた分だけ低くなる。
  const released = detentHeight(current, viewportHeight) - deltaY;

  // 3. 最下段の半分より下まで引いたら閉じる
  const lowestHeight = detentHeight(lowest, viewportHeight);
  if (dismissible && released < lowestHeight * 0.5) return { type: 'dismiss' };

  // 4. 最も近い段へ
  let best = 0;
  let bestGap = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= last; i += 1) {
    const token = detents[i];
    if (!token) continue;
    const gap = Math.abs(detentHeight(token, viewportHeight) - released);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  return { type: 'snap', index: best };
}
