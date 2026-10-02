/**
 * 小さな DOM ヘルパ群。
 * ブラウザ専用 API に触るものは必ず存在チェックを通す（SSR と jsdom の両方で落ちないため）。
 */

interface MaybeProcess {
  process?: { env?: Record<string, string | undefined> };
}

/** バンドラの define にも Node にも依存しない DEV 判定。 */
export const isDev: boolean = (() => {
  try {
    const env = (globalThis as MaybeProcess).process?.env;
    return env?.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();

const warned = new Set<string>();

/** 同じ警告を何度も出さない。開発時のみ。 */
export function warnOnce(key: string, message: string): void {
  if (!isDev || warned.has(key)) return;
  warned.add(key);
  console.warn(`[kasane] ${message}`);
}

/**
 * 重複している値だけを、最初に現れた順で返す。
 *
 * リスト props（Gallery の id、Chips の value）の識別子は一意でなければならない。
 * React も key の衝突を警告するが、「どの prop の、どの値が」までは言わない。
 * 判定を純粋関数に切り出して、警告文の組み立てと分けておく。
 */
export function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const value of values) {
    if (seen.has(value)) {
      if (!duplicates.includes(value)) duplicates.push(value);
      continue;
    }
    seen.add(value);
  }
  return duplicates;
}

/**
 * リスト props の識別子重複を開発時に知らせる。D-13。
 *
 * 黙って重複を落とさない。渡した件数と表示件数がずれるほうが、
 * 「2 件渡したのに 1 件しか出ない」という形でしか現れず、原因に辿り着けない。
 * 直すのは利用側のデータなので、どの値が重複したかを名指しする。
 */
export function warnDuplicateKeys(
  component: string,
  prop: string,
  values: readonly string[],
): string[] {
  if (!isDev) return [];
  const duplicates = duplicateValues(values);
  if (duplicates.length === 0) return duplicates;
  const list = duplicates.join(', ');
  warnOnce(
    `duplicate-key:${component}:${prop}:${list}`,
    `${component}: ${prop} が重複している（${list}）。` +
      '一意にすること。重複したままだと React が描画の対応付けを保証せず、' +
      '選択状態や再生位置が別の項目に移ることがある。',
  );
  return duplicates;
}

/** テスト用。warnOnce の記憶を消す。 */
export function resetWarnings(): void {
  warned.clear();
}

/**
 * CSS カスタムプロパティから時間を読む。D-06 の帰結。
 *
 * アニメーション時間を JS 側にも定数で持つと二重管理になり、
 * CSS を直したのに JS のタイマーが古いまま、という事故が起きる。
 * 真実は CSS 側の 1 箇所だけに置く。
 */
export function readCssDurationMs(
  el: Element | null | undefined,
  property: string,
  fallback: number,
): number {
  if (!el || typeof getComputedStyle !== 'function') return fallback;
  let raw = '';
  try {
    raw = getComputedStyle(el).getPropertyValue(property).trim();
  } catch {
    return fallback;
  }
  if (!raw) return fallback;
  const match = /^(-?[\d.]+)(ms|s)?$/.exec(raw);
  if (!match || match[1] === undefined) return fallback;
  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return fallback;
  return match[2] === 's' ? value * 1000 : value;
}

/** matchMedia が無い環境（SSR / 素の jsdom）でも落ちない問い合わせ。 */
export function matchMediaSafe(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

/** 粗いポインタ（＝おおむねタッチ）か。K-04 の判定に使う。 */
export function isCoarsePointer(): boolean {
  return matchMediaSafe('(pointer: coarse)')?.matches ?? false;
}

export function prefersReducedMotion(): boolean {
  return matchMediaSafe('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

/**
 * 仮想キーボードを跳ね上げる要素か。K-04。
 * タッチ端末でここに初期フォーカスを当てると、本文がキーボードで隠れる。
 */
export function isTextEntry(el: Element | null | undefined): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type?.toLowerCase() ?? 'text';
    return TEXT_INPUT_TYPES.has(type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

/** 実際に focus() を受け取れる見込みがあるか。ざっくりで良い。 */
export function isFocusable(el: Element | null | undefined): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (!el.isConnected) return false;
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  return typeof el.focus === 'function';
}

/**
 * イベントの発生元が「この dialog 自身のもの」か。L-12。
 *
 * モーダルを入れ子にすると、内側の dialog は外側の dialog の DOM 子孫になる。
 * すると次の2経路で、内側のイベントが外側のハンドラへ届いてしまう。
 *
 *   1. keydown のようにネイティブでバブルするもの（DOM を遡る）
 *   2. cancel / close のようにバブルしないもの
 *      → React は scroll 以外の非バブルイベントでも fiber ツリーを遡って
 *        祖先の onCancel / onClose を呼ぶ。ネイティブは最前面にしか飛ばさないのに、
 *        React 経由で外側まで伝わる。
 *
 * どちらも「Esc 一回で2枚とも閉じる」になる。最も近い dialog.k-dialog が
 * 自分自身のときだけ通す、で両方塞げる。
 */
export function isOwnDialogEvent(
  dialog: HTMLDialogElement | null | undefined,
  target: EventTarget | null,
): boolean {
  if (!dialog || !target) return false;
  if (target === dialog) return true;
  const el = target as Element;
  if (typeof el.closest !== 'function') return false;
  return el.closest('dialog.k-dialog') === dialog;
}

/**
 * pointer 系イベントのうち「主ボタンによる主ポインタの操作」だけを通す。S-08。
 *
 * jsdom は PointerEvent を持たないことがあり、その場合 isPrimary は undefined になる。
 * そこを true 扱いで素通しにしないとテストで背景クリックが一切成立しない。
 * 逆に明示的に false のときだけ弾く、という緩い判定にしてある。
 */
export function isPrimaryPointer(event: {
  isPrimary?: boolean;
  button?: number;
}): boolean {
  if (event.isPrimary === false) return false;
  if (typeof event.button === 'number' && event.button !== 0) return false;
  return true;
}

/** 要素が縦にスクロールできる状態か。G-04 の「スクロール不要」判定に使う。 */
export function isScrollable(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  return el.scrollHeight - el.clientHeight > 1;
}

/** ResizeObserver / IntersectionObserver が無い環境でも動くようにする。 */
export function hasResizeObserver(): boolean {
  return typeof globalThis.ResizeObserver === 'function';
}

export function hasIntersectionObserver(): boolean {
  return typeof globalThis.IntersectionObserver === 'function';
}

/**
 * いま実際に見えている高さ (px)。M-03 / M-04。
 *
 * innerHeight ではなく visualViewport を優先する。
 * 仮想キーボードが出ているとき、innerHeight は鍵盤の裏まで含んだ値を返すので、
 * これを基準に段を決めると「指定した高さなのに下半分が隠れている」状態になる。
 */
export function viewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  const visual = window.visualViewport?.height;
  if (typeof visual === 'number' && visual > 0) return visual;
  return typeof window.innerHeight === 'number' ? window.innerHeight : 0;
}
