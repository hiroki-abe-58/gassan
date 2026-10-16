import type ja from '../ja/notes';

export default {
  lead: (count: number): string =>
    `設計階段看不見、實際動起來才冒出來的陷阱，共 ${String(count)} 個。這些都屬於紙上正確、寫成程式碼就壞掉的類型，所以固定記錄在這裡。`,
} satisfies typeof ja;
