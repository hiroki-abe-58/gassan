import type ja from '../../ja/demos/registrationWork';

export default {
  kind: '业态',
  deposit: '存款',
  securities: '证券',
  crypto: '加密资产',
  remittance: '汇款',
  card: '信用卡',
  comments: {
    kind: '交易目的的选项因业态而异（存款采用金融厅的分类）',
    fields: '职业和交易目的不用自由填写。值以选项的键接收',
  },
} satisfies typeof ja;
