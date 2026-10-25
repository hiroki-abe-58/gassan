import type ja from '../../ja/demos/japaneseAddress';

export default {
  label: '收件地址',
  tryLead: '可以試試的郵遞區號（範例資料）',
  tryCodes: ['100-0001（東京）', '530-0001（大阪）', '810-0001（福岡）', '000-0000（多個候選）', '000-0001（找不到）'],
  comments: {
    lookup: '依郵遞區號（7 位數字）回傳地址候選。範例從手邊的表格查詢（實際上會呼叫自己的伺服器或外部 API）',
    fields: '只填入空白的欄位，以及先前自動填入後未更動的欄位（不覆寫使用者輸入的值與瀏覽器自動填入的值）',
  },
} satisfies typeof ja;
