import type ja from '../../ja/demos/chartRevenue';

export default {
  locale: 'zh-TW',
  label: '每月營收與費用',
  description: '營收在 12 月最高，為 236 萬日圓。費用每月緩慢增加，兩者的差距在下半年擴大。',
  month: '月份',
  revenue: '營收',
  cost: '費用',
  comments: {
    intl: '月份以 Intl 依檢視者語言的寫法顯示（「3月」「Mar」）',
  },
} satisfies typeof ja;
