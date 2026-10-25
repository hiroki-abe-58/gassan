import type ja from '../../ja/demos/japaneseBank';

export default {
  label: '收款帳戶',
  hint: '也能用「みつびし」或「0005」搜尋。選擇日本郵政銀行（「ゆうちょ銀行」）後，會依存摺上的記號與號碼（例如 10180 與 12345671）產生轉帳用的分行名稱與帳號。分行為範例。',
  comments: {
    fields: '金融機構與分行的選項由使用端傳入（來自全國銀行協會的資料或 API）',
    zengin: '戶名以全形片假名保存，傳送時轉成全銀格式（半形片假名）',
  },
} satisfies typeof ja;
