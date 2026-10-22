import type ja from '../../ja/demos/toastTones';

export default {
  success: '成功',
  saved: '已儲存',
  savedDetail: '團隊中的所有人都看得到這些變更。',
  info: '資訊',
  update: '有新版本可用',
  warning: '警告',
  storage: '儲存空間即將用盡',
  storageDetail: '只剩 2%。請整理舊檔案。',
  error: '失敗',
  failed: '無法傳送',
  failedDetail: '連線已中斷。請再試一次。',
  neutral: '無圖示',
  copied: '已複製連結',
  comments: {
    tones: '色調決定圖示與顏色。顏色只出現在圖示與計時條上（N-02）',
  },
} satisfies typeof ja;
