import type ja from '../../ja/demos/kindFlow';

export default {
  open: '前往訂購手續',
  stepAddress: '收件地址',
  stepPayment: '付款',
  stepConfirm: '確認',
  title: '訂購手續 — {0}',
  address: '地址',
  addressValue: '山形縣鶴岡市羽黑町',
  card: '卡號',
  cardHelp: '僅限數字',
  confirmNote: '請確認內容後送出訂單。送出後無法變更。',
  next: '下一步',
  submit: '送出訂單',
  comments: {
    slots: '1fr auto 1fr 的三個插槽。中央不會因有無返回按鈕而偏移（H-01）',
  },
} satisfies typeof ja;
