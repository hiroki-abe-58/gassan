import type ja from '../../ja/demos/textForm';

export default {
  open: '建立帳號',
  title: '建立帳號',
  name: '顯示名稱',
  password: '密碼',
  passwordHelp: '8 個字元以上',
  bio: '自我介紹',
  bioPlaceholder: '工作或感興趣的事',
  seats: '席位數',
  seatsHelp: '之後可以再增加',
  seatsUnit: '席',
  code: '驗證碼',
  codeHelp: '透過電子郵件收到的 6 位數字',
  cancel: '取消',
  submit: '註冊',
  comments: {
    password: '切換顯示是 aria-pressed 的切換按鈕。文案只要一個就夠（I-04）',
    counter: '傳入 maxLength 就會顯示「n / 140」，並作為說明加以關聯（I-06）',
    code: '輸入欄位只有一個。方格只是外觀，所以簡訊自動填入與貼上都有效（I-08）',
  },
} satisfies typeof ja;
