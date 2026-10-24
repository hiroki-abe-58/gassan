import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** 一覧と中身の、どちらを見せているか。広い器では両方を並べ、狭い器ではこちらだけを見せる。 */
export type SplitView = 'list' | 'detail';

export interface ListDetail {
  view: SplitView;
  /** 中身を見せる（一覧で項目を選んだとき）。 */
  showDetail: () => void;
  /** 一覧へ戻る（中身の「戻る」）。 */
  showList: () => void;
  /** 中身の見出し（tabIndex={-1}）。一覧が隠れたら、ここへフォーカスを移す。 */
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** 一覧のいまの項目。一覧へ戻ったら、ここへフォーカスを移す。 */
  currentRef: RefObject<HTMLButtonElement | null>;
}

/**
 * 一覧と中身を並べるページ（チャット・アシスタント）の、狭い器での切り替え。P-18 / P-19。
 *
 * 広い器では一覧と中身を並べ、狭い器では data-view の片方だけを見せる。どちらの形かは templates.css の
 * @container が決めるので、ここでは幅を測らない。切り替えた後に、押したボタンが描かれていなければ
 * （狭い器で一覧が隠れた）中身の見出しへ、一覧へ戻ったら今の項目へフォーカスを移す（行き場を失わせない）。
 * 広い器では一覧が残るので、フォーカスも押したボタンに残す。
 */
export function useListDetail(initial: SplitView): ListDetail {
  const [state, setState] = useState<{ view: SplitView; moves: number }>({ view: initial, moves: 0 });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const target = useRef<'heading' | 'current' | null>(null);

  useLayoutEffect(() => {
    const want = target.current;
    target.current = null;
    if (want === 'current') {
      currentRef.current?.focus();
    } else if (want === 'heading') {
      const active = document.activeElement;
      const hidden = !(active instanceof HTMLElement) || active === document.body || active.getClientRects().length === 0;
      if (hidden) headingRef.current?.focus();
    }
  }, [state]);

  return {
    view: state.view,
    showDetail: () => {
      target.current = 'heading';
      setState((previous) => ({ view: 'detail', moves: previous.moves + 1 }));
    },
    showList: () => {
      target.current = 'current';
      setState((previous) => ({ view: 'list', moves: previous.moves + 1 }));
    },
    headingRef,
    currentRef,
  };
}
