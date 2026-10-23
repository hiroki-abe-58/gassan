import type ja from '../../ja/demos/commandMenu';

export default {
  open: '打开命令面板',
  placeholder: '搜索页面或操作',
  pages: '页面',
  actions: '操作',
  home: '首页',
  homeDescription: '仪表盘和最近动态',
  members: '成员',
  billing: '套餐与账单',
  settings: '设置',
  settingsDescription: '个人资料、密码、两步验证',
  invite: '邀请成员',
  project: '创建项目',
  export: '导出数据',
  exportDescription: '可在 Pro 套餐中使用',
  ran: '已选择“{0}”',
  comments: {
    hotkey: '本站的搜索已经占用了 ⌘K，所以示例用按钮打开（hotkey={false}）。在应用中省略 hotkey，就能用 ⌘K / Ctrl+K 打开',
  },
} satisfies typeof ja;
