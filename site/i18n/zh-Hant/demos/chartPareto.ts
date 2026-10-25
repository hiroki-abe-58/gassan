import type ja from '../../ja/demos/chartPareto';

export default {
  label: '客服詢問的類型',
  description: '登入、帳單、使用方式這 3 類就超過 8 成。先改善這 3 類的說明文章。',
  count: '件數',
  login: '無法登入',
  billing: '帳單與付款',
  howTo: '使用方式',
  bug: '功能異常',
  cancel: '解約',
  other: '其他',
  comments: {
    other: '標上 other 的項目不依大小排序，一律放在最後',
  },
} satisfies typeof ja;
