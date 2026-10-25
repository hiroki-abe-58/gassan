import type ja from '../../ja/demos/chatAssistant';

export default {
  label: '與 AI 助理的對話',
  me: '你',
  bot: '助理',
  greeting: '想查些什麼？',
  sales: '整理一下上個月的營收',
  salesDescription: '和前一個月比較，也說明增加的原因',
  churn: '為什麼客戶流失變多了？',
  churnDescription: '依方案與時期分開來看',
  mail: '給未付款的客戶寫一封通知',
  mailDescription: '用字禮貌、簡短',
  answer:
    '上個月的營收為 2,140 萬日圓，比前一個月增加了 8%。增加部分的六成來自 10 月推出的年繳方案。另外，從 Pro 升級到 Max 的工作區也有 14 個，席位數隨之增加。另一方面，從 Free 轉為 Pro 的比例下降了 0.4 個百分點，因此試用期的引導還有改善的空間。',
  placeholder: '輸入問題',
  note: 'AI 的回答可能有誤。重要的數字請以原始資料確認。',
  comments: {
    stream: '範例中，把固定的回答一點一點加上去，以串流方式寫出。在應用程式中，收到多少就把 content 延長多少，寫完後拿掉 streaming',
  },
} satisfies typeof ja;
