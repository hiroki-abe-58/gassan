import type ja from '../../ja/demos/chatBot';

export default {
  show: '在右下角顯示聊天機器人',
  hide: '收起聊天機器人',
  title: 'Atlas 助理',
  description: '由 AI 回答。也能為你轉接真人客服',
  greeting: '你好。關於價格與方案，有任何問題都可以問我',
  hello: '有什麼可以幫你的？',
  plans: 'Pro 和 Max 有什麼不同？',
  plansDescription: '從使用量與儲存空間來比較',
  invoice: '我想用帳單付款',
  invoiceDescription: '關於年繳與 Enterprise',
  human: '我想找真人客服',
  humanDescription: '平日 10:00–18:00',
  placeholder: '輸入訊息',
  me: '你',
  bot: '助理',
  answer:
    'Max 方案包含 Pro 的所有功能，使用量上限是 Pro 的 5 倍，儲存空間為 1 TB，適合幾乎每天都大量使用的團隊。月費為每位使用者 ¥5,000，年繳可省下 2 個月的費用。可以隨時在 Pro 與 Max 之間切換，差額依天數比例計算。',
  comments: {
    stream: '把回答一點一點以串流方式顯示（實際應用中，把伺服器傳來的內容逐段加上去）',
    place: '浮動按鈕固定在畫面右下角。按下後會在右下角開啟小視窗，用標題列的按鈕可以展開成右側面板',
  },
} satisfies typeof ja;
