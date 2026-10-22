import { useLayoutEffect, type RefObject } from 'react';

/**
 * 選択中の項目へ、1 枚の印（セグメントの塗り・タブの下線）を滑らせる。V-05。
 *
 * 位置と大きさは描いた後に測り、器のカスタムプロパティ（--g-ind-x / -y / -w / -h）に書く。
 * 測るのは offsetLeft / offsetTop（レイアウトの値）。getBoundingClientRect は transform を含むので、
 * モーダルが縮んだ状態から開く途中に測ると、印が縮んだ寸法のまま残る。
 *
 * 初めて置くときは滑らせない。値を書いて確定させて（offsetWidth で計算を済ませて）から
 * data-indicator を付ける。同時に付けると、左上（0, 0）から滑ってくる遷移が始まってしまう。
 * 測る前（SSR と初回の描画）は data-indicator が無いので、CSS は選択中の項目そのものを塗る。
 */
export function useIndicator(
  containerRef: RefObject<HTMLElement | null>,
  /** 器の中で印を合わせる要素。無ければ印を隠す。 */
  find: (container: HTMLElement) => HTMLElement | null,
  /** 選択が変わったことを知らせる値（選んでいる値など）。 */
  selected: unknown,
): void {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const place = (): void => {
      const target = find(container);
      if (!target) {
        container.removeAttribute('data-indicator');
        return;
      }
      const { style } = container;
      style.setProperty('--g-ind-x', `${String(target.offsetLeft)}px`);
      style.setProperty('--g-ind-y', `${String(target.offsetTop)}px`);
      style.setProperty('--g-ind-w', `${String(target.offsetWidth)}px`);
      style.setProperty('--g-ind-h', `${String(target.offsetHeight)}px`);
      if (!container.hasAttribute('data-indicator')) {
        void container.offsetWidth;
        container.setAttribute('data-indicator', '');
      }
    };
    place();
    // 文言の切り替え（言語）や幅の変化で区画の大きさが変わる。そのときも合わせ直す。
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
    observer?.observe(container);
    return () => observer?.disconnect();
    // find は呼び出し側で毎回作られる関数なので、依存に入れない（選択と器が変わったときだけ測る）。
  }, [containerRef, selected]);
}
