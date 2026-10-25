import type ja from '../../ja/demos/chartHeatmap';

export default {
  locale: 'zh-TW',
  label: '依星期與時段的使用量',
  description: '平日上午 10 點與下午 2 點的時段最多，週末約為平日的 3〜4 成。維護排在週日晚上。',
  sessions: '工作階段',
  comments: {
    intl: '星期與時間以 Intl 依檢視者語言的寫法顯示（「週一」「上午10時」與「Mon」「10 AM」）',
    monday: '列是週一（2026-10-05）到週日，欄是上午 6 時到下午 11 時',
  },
} satisfies typeof ja;
