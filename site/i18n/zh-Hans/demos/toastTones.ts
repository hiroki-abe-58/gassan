import type ja from '../../ja/demos/toastTones';

export default {
  success: '成功',
  saved: '已保存',
  savedDetail: '团队中的所有人都能看到这些更改。',
  info: '信息',
  update: '有新版本可用',
  warning: '警告',
  storage: '存储空间即将用完',
  storageDetail: '仅剩 2%。请清理旧文件。',
  error: '失败',
  failed: '发送失败',
  failedDetail: '网络连接已断开。请重试。',
  neutral: '无图标',
  copied: '链接已复制',
  comments: {
    tones: '色调决定图标和颜色。颜色只出现在图标和计时条上（N-02）',
  },
} satisfies typeof ja;
