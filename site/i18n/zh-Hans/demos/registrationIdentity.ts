import type ja from '../../ja/demos/registrationIdentity';

export default {
  regime: '行业（依据的法律法规）',
  aml: '银行、证券等',
  telecom: '手机',
  reuse: '收购',
  matching: '交友配对',
  day: '使用日期',
  before: '至 2027 年 3 月 31 日',
  after: '2027 年 4 月 1 日起',
  comments: {
    regime: '可用的方式由依据的法律法规决定',
    day: '传入日期后，不显示在该日期已不能使用的方式（默认为今天）',
  },
} satisfies typeof ja;
