import type ja from '../../ja/demos/footerButtons';

export default {
  open: '发布设置',
  title: '发布文章',
  description: '连续点击“发布”，在处理完成之前也不会执行第 2 次（F-08）。目前的提交次数：{0}',
  note: '发布后仍可编辑',
  cancel: '取消',
  saveDraft: '保存草稿',
  publish: '发布',
  comments: {
    order: 'DOM 顺序 = 视觉顺序 = Tab 顺序。按由弱到强的顺序写。只有第一个 tertiary 会向左分开（F-02 / F-03）',
  },
} satisfies typeof ja;
