import type ja from '../../ja/demos/registrationIdentity';

export default {
  regime: '產業（依據的法令）',
  aml: '銀行、證券等',
  telecom: '手機',
  reuse: '二手收購',
  matching: '交友配對',
  day: '使用日期',
  before: '至 2027 年 3 月 31 日',
  after: '2027 年 4 月 1 日起',
  comments: {
    regime: '可使用的方式由依據的法令決定',
    day: '傳入日期後，該日已無法使用的方式就不會顯示（預設為今天）',
  },
} satisfies typeof ja;
