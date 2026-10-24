import { useRef } from 'react';

/** 続けて打った文字を 1 つの語として読む間隔（ms）。 */
const TYPEAHEAD_MS = 500;

export interface Typeahead {
  /**
   * 打った文字で始まる項目を探し、その位置を返す（無ければ -1）。from は今の位置。
   * 続けて打った文字は語として先頭から合わせ、同じ文字の連打は「次の候補」へ送る。skip が true の項目は飛ばす。
   */
  find: (key: string, from: number, labels: readonly string[], skip?: (index: number) => boolean) => number;
  /** いま語を打っている途中か（空白を語の一部として読み、選ぶ操作にしないため）。 */
  typing: () => boolean;
}

/** 一覧で文字を打って項目へ移る（セレクトの一覧とツリーが共有する）。 */
export function useTypeahead(): Typeahead {
  const typed = useRef({ text: '', at: 0 });
  return {
    find: (key, from, labels, skip) => {
      const now = Date.now();
      const text = now - typed.current.at > TYPEAHEAD_MS ? key : typed.current.text + key;
      typed.current = { text, at: now };
      const repeated = [...text].every((char) => char === text[0]);
      const query = (repeated ? key : text).toLocaleLowerCase();
      const offset = repeated ? from + 1 : Math.max(from, 0);
      for (let i = 0; i < labels.length; i += 1) {
        const index = (offset + i) % labels.length;
        if (!skip?.(index) && (labels[index] ?? '').toLocaleLowerCase().startsWith(query)) return index;
      }
      return -1;
    },
    typing: () => Date.now() - typed.current.at <= TYPEAHEAD_MS,
  };
}
