import { useCallback, useInsertionEffect, useRef } from 'react';

/**
 * 常に最新の実装を呼ぶが、参照は変わらないコールバック。D-07。
 *
 * ゲート登録のように「effect の依存配列に入れる関数」をこれで包まないと、
 * 毎レンダーで参照が変わり、登録 → 解除 → 登録の無限ループに入る。
 */
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: A) => ref.current(...args), []);
}
