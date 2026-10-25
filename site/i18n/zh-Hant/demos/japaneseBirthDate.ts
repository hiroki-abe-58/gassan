import type ja from '../../ja/demos/japaneseBirthDate';

export default {
  label: '出生日期',
  help: '酒類僅限年滿 20 歲者購買',
  underage: '未滿 20 歲者無法申請',
  comments: {
    age: '以足歲判斷條件（生日當天加 1 歲）',
  },
} satisfies typeof ja;
