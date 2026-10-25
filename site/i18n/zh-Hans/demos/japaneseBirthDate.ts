import type ja from '../../ja/demos/japaneseBirthDate';

export default {
  label: '出生日期',
  help: '仅限年满 20 周岁者购买酒类',
  underage: '未满 20 周岁者无法申请',
  comments: {
    age: '按周岁判断条件（生日当天加 1 岁）',
  },
} satisfies typeof ja;
