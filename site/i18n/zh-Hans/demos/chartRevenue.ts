import type ja from '../../ja/demos/chartRevenue';

export default {
  locale: 'zh-CN',
  label: '月度销售额与费用',
  description: '销售额在 12 月最高，为 236 万日元。费用每月缓慢增加，两者的差距在下半年拉大。',
  month: '月份',
  revenue: '销售额',
  cost: '费用',
  comments: {
    intl: '月份用 Intl 按查看者语言的写法显示（“3月”“Mar”）',
  },
} satisfies typeof ja;
