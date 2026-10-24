import type ja from '../../ja/demos/filterToolbar';

export default {
  refresh: '重新整理',
  refreshHint: '重新載入清單（上次更新是 3 分鐘前）',
  refreshed: '已重新載入清單',
  share: '共用',
  filter: '篩選',
  filterCount: '篩選（{0}）',
  filterTitle: '篩選顯示內容',
  unreadOnly: '只看未讀',
  assignedToMe: '只看我負責的',
  sortLabel: '排序',
  newest: '由新到舊',
  oldest: '由舊到新',
  more: '更多操作',
  exportCsv: '匯出為 CSV',
  print: '列印',
  viewGroup: '顯示密度',
  compact: '緊湊顯示',
  comfortable: '寬鬆顯示',
  archiveAll: '全部封存',
  chose: '已選擇「{0}」',
  comments: {
    glyph: '20×20 的線條圖示。只是裝飾，所以設為 aria-hidden',
    tooltip: '說明與名稱相同時，不會作為描述再讀一次（「共用」）',
    menu: '快捷鍵只用於顯示。按鍵的綁定由使用端負責',
  },
} satisfies typeof ja;
