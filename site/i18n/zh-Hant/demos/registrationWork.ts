import type ja from '../../ja/demos/registrationWork';

export default {
  kind: '業態',
  deposit: '存款',
  securities: '證券',
  crypto: '加密資產',
  remittance: '匯款',
  card: '信用卡',
  comments: {
    kind: '交易目的的選項依業態而不同（存款採用金融廳的分類）',
    fields: '職業與交易目的不採自由填寫。值以選項的鍵接收',
  },
} satisfies typeof ja;
