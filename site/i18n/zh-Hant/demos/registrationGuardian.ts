import type ja from '../../ja/demos/registrationGuardian';

export default {
  note: '未成年人簽訂的契約，若未經法定代理人同意即可撤銷（《民法》第 5 條）。從出生日期得知未滿 18 歲時才顯示。',
  comments: {
    guardian: '法定代理人的姓名與電子郵件地址欄位，不會被自動填入本人的資料',
    marketing: '廣告郵件的同意是與同意服務條款分開的選填核取方塊。預設不勾選',
  },
} satisfies typeof ja;
