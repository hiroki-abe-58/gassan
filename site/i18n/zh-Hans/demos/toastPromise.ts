import type ja from '../../ja/demos/toastPromise';

export default {
  succeed: '保存（成功）',
  fail: '保存（失败）',
  loading: '正在保存…',
  success: '已保存',
  error: '保存失败：{0}',
  reason: '服务器没有响应',
  comments: {
    promise: '处理期间显示加载中，完成后在同一位置替换（N-07）',
  },
} satisfies typeof ja;
