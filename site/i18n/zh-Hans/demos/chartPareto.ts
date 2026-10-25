import type ja from '../../ja/demos/chartPareto';

export default {
  label: '咨询类型',
  description: '登录、账单和使用方法这 3 类合计超过 80%。先改进这 3 类的帮助文档。',
  count: '件数',
  login: '无法登录',
  billing: '账单与付款',
  howTo: '使用方法',
  bug: '故障',
  cancel: '退订',
  other: '其他',
  comments: {
    other: '带 other 的项目不按大小排序，始终放在最后',
  },
} satisfies typeof ja;
