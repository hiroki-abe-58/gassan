import type { GassanLabels } from '@genelab/gassan';

const labels: GassanLabels = {
  close: '關閉',
  back: '返回',
  previous: '上一項',
  next: '下一項',
  body: '內文',
  expandTitle: '顯示完整標題',
  collapseTitle: '收合標題',
  endOfContent: '內文結束。',
  blocked: '此對話框目前還無法關閉。請確認內容並完成操作。',
  unreadReason: '請將內文讀到最後。',
  unconsentedReason: '同意內容後即可繼續。',
  unresolvedReason: '此操作仍有尚未滿足的條件。',
  loading: '處理中',
  cancel: '取消',
  ok: '確定',
  required: '必填',
  optional: '選填',
  step: (current, total) => `第 ${String(current)} 步，共 ${String(total)} 步`,
  galleryPosition: (current, total) => `第 ${String(current)} 項，共 ${String(total)} 項`,
  chartData: '顯示原始資料',
  sheetHandle: '調整面板高度',
  detent: (token) => ({ peek: '最小', half: '中', full: '最大' })[token],
  detentChanged: (name) => `面板高度：${name}`,
};

export default labels;
