import type ja from '../../ja/demos/notifyBell';

export default {
  comment: '李明轩发表了评论',
  commentBody: '“价格表调整”有了新回复',
  joined: '张敏加入了工作区',
  invoice: '已开具 10 月份的账单',
  invoiceBody: 'Pro 套餐 6 个席位 ¥9,000',
  release: '全新仪表盘现已可用',
  comments: {
    read: '示例中，点击的项目会标为已读。“全部标为已读”不传 ids，把所有项目都标为已读',
  },
} satisfies typeof ja;
