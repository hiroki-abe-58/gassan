import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { motionStill } from './dom';

/** 位置を変えたのは誰か。指で送った位置（scroll）へは scrollTo を返さない。 */
export type IndexSource = 'init' | 'command' | 'scroll';

export function clampIndex(value: number, last: number): number {
  if (last <= 0 || value < 0) return 0;
  return value > last ? last : value;
}

const isRtl = (el: HTMLElement): boolean => typeof getComputedStyle === 'function' && getComputedStyle(el).direction === 'rtl';

/**
 * 器の始めの端から、項目の始めの端までの距離（px）。右から左の文書では右端から測る。
 * 項目の間の gap も含むので、1 度に何枚見せていても同じ式で動く。
 */
function startOffset(item: HTMLElement, first: HTMLElement, rtl: boolean): number {
  return rtl ? first.offsetLeft + first.offsetWidth - (item.offsetLeft + item.offsetWidth) : item.offsetLeft - first.offsetLeft;
}

/**
 * scroll-snap で横に送る器の、いまの位置と、位置への移動（B-12・U-28）。
 *
 * scroll-snap で実体を作り、ボタン・キー・自動再生は「位置を指示するだけ」にする（JS でトランスフォームを積むと、
 * 慣性スクロールと二重に管理することになって必ずずれる）。指示による移動だけを animate し、指で送った位置は読み取るだけにする。
 * 読み取った位置へこちらから scrollTo を返すと、スクロールが自分と綱引きして震えるため。
 * last は先頭に置ける最後の位置（1 度に複数枚見せるなら、項目の数より少ない）。
 */
export function useSnapTrack(
  last: number,
  initial: number,
): {
  trackRef: RefObject<HTMLDivElement | null>;
  index: number;
  source: IndexSource;
  go: (index: number) => void;
  onScroll: () => void;
} {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [state, setState] = useState<{ index: number; source: IndexSource }>(() => ({
    index: clampIndex(initial, last),
    source: 'init',
  }));
  const index = clampIndex(state.index, last);

  useEffect(() => {
    if (state.source === 'scroll') return;
    const track = trackRef.current;
    const first = track?.children.item(0) as HTMLElement | null | undefined;
    const item = track?.children.item(index) as HTMLElement | null | undefined;
    if (!track || !first || !item) return;
    const rtl = isRtl(track);
    const offset = startOffset(item, first, rtl);
    const left = rtl ? -offset : offset;
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: state.source === 'init' || motionStill(track) ? 'auto' : 'smooth' });
    } else {
      track.scrollLeft = left;
    }
  }, [index, state.source]);

  const onScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number;
    frameRef.current = raf(() => {
      frameRef.current = null;
      const track = trackRef.current;
      // 幅 0 は「0 だった」ではなく「測れない」（閉じた dialog の中など）。
      // ここで測ると位置が 0 に化け、ボタンやキーで進めた位置を巻き戻す。§10-1 と同じ穴。
      if (!track?.clientWidth) return;
      const items = [...track.children] as HTMLElement[];
      const first = items[0];
      if (!first) return;
      const rtl = isRtl(track);
      const position = Math.abs(track.scrollLeft);
      let nearest = 0;
      let best = Infinity;
      items.forEach((item, i) => {
        const distance = Math.abs(startOffset(item, first, rtl) - position);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });
      const next = clampIndex(nearest, last);
      setState((previous) => (previous.index === next ? previous : { index: next, source: 'scroll' }));
    });
  }, [last]);

  useEffect(
    () => () => {
      if (frameRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const go = useCallback((next: number) => setState({ index: clampIndex(next, last), source: 'command' }), [last]);

  return { trackRef, index, source: state.source, go, onScroll };
}
