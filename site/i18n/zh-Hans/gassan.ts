/**
 * gassan 输出的文字（关闭、读屏播报、门控的原因等）。App 把它传给 GassanProvider。
 * 键与 src/labels.ts 的 japaneseLabels / englishLabels 相同。
 */
import type { GassanLabels } from '@genelab/gassan';

const labels: GassanLabels = {
  close: '关闭',
  back: '返回',
  previous: '上一个',
  next: '下一个',
  body: '正文',
  expandTitle: '显示完整标题',
  collapseTitle: '收起标题',
  endOfContent: '正文结束。',
  blocked: '此对话框暂时无法关闭。请确认内容并完成操作。',
  unreadReason: '请将正文读到最后。',
  unconsentedReason: '同意内容后即可继续。',
  unresolvedReason: '此操作还有尚未满足的条件。',
  loading: '处理中',
  cancel: '取消',
  ok: '确定',
  required: '必填',
  optional: '选填',
  step: (current, total) => `第 ${String(current)} 步，共 ${String(total)} 步`,
  galleryPosition: (current, total) => `第 ${String(current)} 项，共 ${String(total)} 项`,
  chartData: '显示原始数据',
  sheetHandle: '调整面板高度',
  detent: (token) => ({ peek: '最小', half: '中', full: '最大' })[token],
  detentChanged: (name) => `面板高度：${name}`,
  locale: 'zh-CN',
  choose: '请选择',
  noResults: '没有匹配的选项',
  clear: '清除输入',
  showPassword: '显示密码',
  increment: '增加',
  decrement: '减少',
  rangeStart: '最小值',
  rangeEnd: '最大值',
  rating: (value, max) => `${String(max)} 分中的 ${String(value)} 分`,
  previousMonth: '上个月',
  nextMonth: '下个月',
  dropFiles: '将文件拖放到此处',
  chooseFiles: '选择文件',
  removeFile: (name) => `移除 ${name}`,
};

export default labels;
