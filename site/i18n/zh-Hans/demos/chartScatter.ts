import type ja from '../../ja/demos/chartScatter';

export default {
  label: '各功能的使用率与满意度',
  description: '本季度新增的自动化功能用户还不多，但满意度最高。通知虽然使用广泛，满意度却偏低。',
  adoption: '使用率',
  satisfaction: '满意度（满分 5 分）',
  users: '用户数',
  core: '基础功能',
  added: '本季度新增的功能',
  features: {
    search: '搜索',
    sharing: '共享',
    export: '导出',
    notifications: '通知',
    permissions: '权限设置',
    automation: '自动化',
    summary: 'AI 摘要',
    integrations: '外部集成',
  },
  comments: {
    size: '传入 sizeLabel 后，点的 size 会画成气泡的面积（气泡图）',
  },
} satisfies typeof ja;
