import type ja from '../../ja/demos/kindConfirm';

export default {
  open: '删除草稿',
  closedReason: '关闭原因：{0}',
  title: '要删除草稿吗',
  description: '删除后无法恢复，也会从协作者的界面中消失。',
  cancel: '算了',
  confirm: '删除',
  comments: {
    danger: '位置保持在 primary，只把颜色换成 danger（F-06）',
  },
} satisfies typeof ja;
