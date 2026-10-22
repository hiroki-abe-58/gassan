import type ja from '../../ja/demos/filterToolbar';

export default {
  refresh: '刷新',
  refreshHint: '重新加载列表（上次更新是 3 分钟前）',
  refreshed: '已重新加载列表',
  share: '共享',
  filter: '筛选',
  filterCount: '筛选（{0}）',
  filterTitle: '筛选显示内容',
  unreadOnly: '仅未读',
  assignedToMe: '仅我负责的',
  sortLabel: '排序',
  newest: '从新到旧',
  oldest: '从旧到新',
  more: '更多操作',
  exportCsv: '导出为 CSV',
  print: '打印',
  viewGroup: '显示密度',
  compact: '紧凑显示',
  comfortable: '宽松显示',
  archiveAll: '全部归档',
  chose: '已选择“{0}”',
  comments: {
    glyph: '20×20 的线条图标。只是装饰，所以设为 aria-hidden',
    tooltip: '说明与名称相同时，不会作为描述再读一遍（“共享”）',
    menu: '快捷键只用于显示。按键的绑定由使用方负责',
  },
} satisfies typeof ja;
