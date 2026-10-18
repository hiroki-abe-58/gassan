import { useState, type MutableRefObject, type Ref } from 'react';

/**
 * 制御（value を渡す）と非制御（defaultValue だけ渡す）の両方を受ける値。I-01。
 *
 * 制御かどうかは「value が undefined でないか」で決める。null は「未選択」という制御された値。
 * 途中で制御と非制御を行き来させない（React の input と同じ約束）。
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const set = (next: T): void => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };
  return [current, set];
}

/**
 * 数を範囲に収め、min から step 刻みの格子に乗せて、step の桁で丸める
 * （0.1 + 0.2 の誤差を値に残さない）。min が無限なら 0 を起点にする。
 */
export function clampToStep(value: number, min: number, max: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  const origin = Number.isFinite(min) ? min : 0;
  const stepped = origin + Math.round((value - origin) / step) * step;
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
}

/** ref をまとめる。部品の内側でも要素を掴みつつ、利用側の ref にも渡すため。 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<T | null>).current = node;
    }
  };
}

/** 範囲の中での位置（0〜100）。スライダーの塗りに使う。 */
export function percentOf(value: number, min: number, max: number): number {
  return max > min ? ((value - min) / (max - min)) * 100 : 0;
}
