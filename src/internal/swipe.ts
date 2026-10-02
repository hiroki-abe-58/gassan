/**
 * スワイプ判定の純粋ロジック。M-02。
 *
 * 判定式を UI から切り離しておくと、
 * jsdom にレイアウトが無くてもしきい値の妥当性を単体で検証できる。
 */
export interface SwipeDecisionInput {
  /** 下方向の移動量 (px)。上方向は負。 */
  deltaY: number;
  /** 押してから離すまでの時間 (ms)。 */
  elapsedMs: number;
  /** パネルの高さ (px)。 */
  panelHeight: number;
}

/** 速い下スワイプ、または高さの 25%（上限 120px）を超えたら閉じる。 */
export function shouldDismissBySwipe({
  deltaY,
  elapsedMs,
  panelHeight,
}: SwipeDecisionInput): boolean {
  if (!(deltaY > 0)) return false;
  const velocity = deltaY / Math.max(1, elapsedMs);
  if (velocity > 0.6 && deltaY > 24) return true;
  const threshold = panelHeight > 0 ? Math.min(120, panelHeight * 0.25) : 120;
  return deltaY > threshold;
}

/**
 * 「掴んだ」とみなす最小の移動量 (px)。
 *
 * 指で叩くと数 px は必ずぶれる。この範囲の揺れは tap として扱い、
 * つまみの click（1 段上げる）を殺さない。超えたら drag と判断し、
 * ブラウザが pointerup のあとに出す合成 click を 1 回だけ捨てる。H-09。
 */
export const DRAG_SLOP = 6;

/** ドラッグ後の合成 click を無視する猶予 (ms)。これを過ぎた click は本人の意思とみなす。 */
export const CLICK_SUPPRESS_WINDOW = 400;

/** ドラッグ開始を許さない要素か。ここを握ると中身の操作ができなくなる。 */
export const SWIPE_BLOCKING_SELECTOR =
  'input, textarea, select, button, a[href], [role="slider"], [role="tablist"], [contenteditable="true"], [data-k-no-swipe]';
