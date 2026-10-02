/**
 * ホスト要素への data-* 受け渡し。D-11。
 *
 * ## なぜ要るか
 *
 * gassan の props はすべて閉じた interface で、宣言していない prop は捨てていた。
 * ところが **TypeScript は、ハイフンを含む JSX 属性名を過剰プロパティ検査から除外する。**
 * つまり
 *
 *     <Modal.Root data-testid="x" aria-label="y">
 *
 * は型エラーにならず、実行時に黙って消える。型が「通る」と言い、実装が「捨てる」。
 * これが最悪の形の穴で、利用者には観測できない。
 * E2E（v0.4.0 の Playwright）は data-testid でしか掴めないので、実害も出る。
 *
 * ## 決めた契約
 *
 * - `data-*` は**ホスト要素へそのまま付ける**。
 * - ただし gassan 自身が書く名前（`RESERVED_DATA`）は上書きさせない。
 *   内部状態が消費者の文字列で壊れると、CSS もテストも静かに嘘をつき始める。
 *   衝突したら DEV で警告し、gassan の値を優先する。
 * - `aria-*` など他のハイフン付き prop は**受け取らない**。DEV で警告して落とす。
 *   黙って落とすのが問題なのであって、落とすこと自体が問題なのではない。
 *   名前は `label` / `Modal.Title`、説明は `aria-describedby` と、
 *   すでに専用の入口がある。二重の入口を作ると A-01 の計算が二通りになる。
 */

import { warnOnce } from './dom';

/**
 * gassan 自身がホスト要素に書く data-*。
 *
 * この集合の網羅性は `tests/passthrough.test.tsx` が
 * `src/` を走査して検証する（新しい data-* を足して登録を忘れると落ちる）。
 */
export const RESERVED_DATA: ReadonlySet<string> = new Set([
  'data-at-end',
  'data-at-start',
  'data-clamped',
  'data-detent',
  'data-exiting',
  'data-gated',
  'data-invalid',
  'data-g-blocked',
  'data-g-control',
  'data-g-covered',
  'data-g-dragging',
  'data-g-locked',
  'data-g-swipe-origin',
  'data-kind',
  'data-loading',
  'data-placement',
  'data-required',
  'data-scrim',
  'data-size',
  'data-slot',
  'data-tone',
  'data-variant',
]);

/**
 * 消費者が置く側の data-*（gassan が読む）。予約ではない。
 * 例: `data-g-no-swipe` を付けた要素の上ではスワイプを始めない。
 */
export const CONSUMER_DATA: readonly string[] = ['data-g-no-swipe'];

/**
 * 各コンポーネントの props に混ぜる、data-* の受け口。
 *
 * テンプレートリテラルの index signature なので、宣言済みの prop
 * （`open` や `aria-describedby`）には影響しない。
 */
export interface DataAttributes {
  [key: `data-${string}`]: unknown;
}

type PassthroughResult = Record<string, unknown>;

/**
 * 残余 props から、ホスト要素へ付けてよい data-* だけを取り出す。
 *
 * @param rest      destructuring で残った prop 群
 * @param component 警告に出す表示名（例: `Modal.Root`）
 */
export function domPassthrough(rest: Record<string, unknown>, component: string): PassthroughResult {
  const out: PassthroughResult = {};
  for (const key in rest) {
    if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
    const value = rest[key];
    if (value === undefined) continue;

    if (key.startsWith('data-')) {
      if (RESERVED_DATA.has(key)) {
        warnOnce(
          `reserved-data:${component}:${key}`,
          `${component}: ${key} は gassan が内部で使う属性なので、渡された値は無視した。別の名前を使うこと。`,
        );
        continue;
      }
      out[key] = value;
      continue;
    }

    if (key.includes('-')) {
      warnOnce(
        `unsupported-prop:${component}:${key}`,
        `${component}: ${key} は受け取らない（TypeScript はハイフン付きの属性を検査しないため、型は通ってしまう）。` +
          `名前は label か Modal.Title、説明は aria-describedby を使うこと。`,
      );
      continue;
    }

    warnOnce(
      `unknown-prop:${component}:${key}`,
      `${component}: ${key} は未対応の prop なので無視した。`,
    );
  }
  return out;
}

/**
 * 予約済みの data-* だけを落とし、他はそのまま返す。D-11。
 *
 * `Modal.Button` 専用。ここだけは `ButtonHTMLAttributes` をそのまま受け取る
 * （`aria-label` や `form` を正当に使うため）ので、`domPassthrough` の
 * 「data-* 以外は捨てる」規則を当てられない。
 *
 * それでも予約名の保護と警告は要る。JSX のスプレッド順に頼って
 * 「後から上書きされるから実害は無い」で済ませると、順序を入れ替えた瞬間に
 * 無言で壊れ、しかも消費者には観測できない。
 */
export function stripReservedData(
  rest: Record<string, unknown>,
  component: string,
): PassthroughResult {
  const out: PassthroughResult = {};
  for (const key in rest) {
    if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
    if (RESERVED_DATA.has(key)) {
      warnOnce(
        `reserved-data:${component}:${key}`,
        `${component}: ${key} は gassan が内部で使う属性なので、渡された値は無視した。別の名前を使うこと。`,
      );
      continue;
    }
    out[key] = rest[key];
  }
  return out;
}
