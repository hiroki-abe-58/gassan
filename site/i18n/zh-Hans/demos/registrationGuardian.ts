import type ja from '../../ja/demos/registrationGuardian';

export default {
  note: '未成年人签订的合同，如果没有监护人的同意，可以撤销（《民法》第 5 条）。根据出生日期判断为未满 18 岁时显示。',
  comments: {
    guardian: '监护人的姓名和邮箱地址，不会被自动填入本人的信息',
    marketing: '广告邮件的同意，是与同意条款分开的选填复选框。初始不勾选',
  },
} satisfies typeof ja;
