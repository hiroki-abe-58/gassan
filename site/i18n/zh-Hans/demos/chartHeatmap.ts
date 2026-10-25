import type ja from '../../ja/demos/chartHeatmap';

export default {
  locale: 'zh-CN',
  label: '按星期和时段的使用情况',
  description: '工作日的 10 点和 14 点时段最多，周末只有工作日的三到四成。维护安排在周日晚上。',
  sessions: '会话',
  comments: {
    intl: '星期和时段用 Intl 按查看者语言的写法显示（“周一”“10时”与“Mon”“10 AM”）',
    monday: '行从周一（2026-10-05）到周日，列从 6 点到 23 点',
  },
} satisfies typeof ja;
