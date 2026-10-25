import type ja from '../../ja/demos/japaneseEmail';

export default {
  label: '電子郵件地址',
  hint: '輸入「taro@gmial.com」後離開欄位，就會出現建議。對「@docomo.ne.jp」等電信業者的信箱，會顯示有關收信設定的提醒。',
  comments: {
    sender: '確認信的寄件者（寫進給電信業者信箱的提醒中）',
  },
} satisfies typeof ja;
