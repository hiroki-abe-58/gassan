import type ja from '../../ja/demos/bodyScroll';

export default {
  open: '查看更新记录',
  title: '更新记录',
  bodyLabel: '更新记录正文',
  linkExpiry: '分享链接现在可以设置有效期',
  fasterSearch: '搜索速度提升至 2 倍',
  darkBorders: '重新调整了深色主题的边框',
  notifyOff: '通知默认改为关闭',
  workspaces: '现在可以拆分工作区',
  legacyApi: '废弃了旧版 API',
  csvColumns: '导出 CSV 时可以选择列',
  shortcuts: '新增了快捷键',
  imagePaste: '支持粘贴图片',
  largeTables: '减轻了大型表格的渲染负担',
  close: '关闭',
  comments: {
    scroll: '只有这里会滚动。带有 tabIndex 和名称，用键盘也能阅读（B-01〜B-03）',
  },
} satisfies typeof ja;
