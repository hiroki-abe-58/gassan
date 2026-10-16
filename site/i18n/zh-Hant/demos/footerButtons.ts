import type ja from '../../ja/demos/footerButtons';

export default {
  open: '發布設定',
  title: '發布文章',
  description: '連按「發布」，在處理完成之前也不會執行第 2 次（F-08）。目前為止的送出次數：{0}',
  note: '發布後仍可編輯',
  cancel: '取消',
  saveDraft: '儲存草稿',
  publish: '發布',
  comments: {
    order: 'DOM 順序 = 視覺順序 = Tab 順序。由弱到強撰寫。只有最前面的 tertiary 會向左分開（F-02 / F-03）',
  },
} satisfies typeof ja;
