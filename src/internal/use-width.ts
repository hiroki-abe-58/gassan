import { useEffect, useState, type RefObject } from 'react';

import { hasResizeObserver } from './dom';

/**
 * 要素の幅（px）。測れない間（サーバー・初回の描画・jsdom）は fallback を返す。
 * 幅から決めるのは、描き方の細部（目盛りの文字を間引く本数・1 度に見せるスライドの枚数）だけにする。
 * 形そのものは幅に依らず決め、サーバーで描いた見た目を崩さない。
 */
export function useWidth(ref: RefObject<HTMLElement | null>, fallback: number): number {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasResizeObserver()) return undefined;
    const measure = (): void => {
      const next = el.getBoundingClientRect().width;
      if (next > 0) setWidth(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
