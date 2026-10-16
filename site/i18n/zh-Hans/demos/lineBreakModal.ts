import type ja from '../../ja/demos/lineBreakModal';

export default {
  toggle: '按词语换行',
  open: '打开窄模态框',
  title: '共享第三季度各门店销售报告',
  description: '共享后，所有拥有查看权限的成员都会收到通知。',
  tableLabel: '共享对象',
  headTarget: '共享对象',
  headRole: '权限',
  row1Target: '东北地区的门店负责人',
  row1Role: '查看和评论',
  row2Target: '经营企划部的成员',
  row2Role: '仅查看',
  draft: '保存为草稿',
  share: '共享给成员并发送通知',
  comments: {
    mode: "只需切换 lineBreak。默认值是 'phrase'（按文节、词语），平时什么都不用写",
  },
} satisfies typeof ja;
