import type ja from '../../ja/demos/chartFeatures';

export default {
  label: '各功能的使用次數（10 月）',
  dashboard: '儀表板',
  api: 'API 呼叫',
  reports: '匯出報表',
  invites: '邀請成員',
  invoices: '下載帳單',
  uses: '次數',
  comments: {
    layout: '項目名稱較長時改用橫向長條。名稱在欄中放不下時以 … 截斷，完整名稱會出現在資料點的朗讀與工具提示中',
  },
} satisfies typeof ja;
