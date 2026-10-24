import type ja from '../../ja/demos/chartFeatures';

export default {
  label: '各功能的使用次数（10 月）',
  dashboard: '仪表盘',
  api: 'API 调用',
  reports: '导出报告',
  invites: '邀请成员',
  invoices: '下载账单',
  uses: '次数',
  comments: {
    layout: '项目名称较长时用横向的柱条。名称在列中放不下时用 … 截断，完整的名称会出现在数据点的播报和工具提示中',
  },
} satisfies typeof ja;
