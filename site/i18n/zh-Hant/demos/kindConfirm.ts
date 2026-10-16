import type ja from '../../ja/demos/kindConfirm';

export default {
  open: '刪除草稿',
  closedReason: '關閉原因：{0}',
  title: '要刪除草稿嗎？',
  description: '刪除後無法復原。共同編輯者的畫面上也會一併消失。',
  cancel: '先不要',
  confirm: '刪除',
  comments: {
    danger: '位置維持 primary，只把顏色換成 danger（F-06）',
  },
} satisfies typeof ja;
