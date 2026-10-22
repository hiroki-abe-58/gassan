import type ja from '../../ja/demos/toastPromise';

export default {
  succeed: '儲存（成功）',
  fail: '儲存（失敗）',
  loading: '正在儲存…',
  success: '已儲存',
  error: '無法儲存：{0}',
  reason: '伺服器沒有回應',
  comments: {
    promise: '處理期間顯示載入中，完成後在同一位置替換（N-07）',
  },
} satisfies typeof ja;
