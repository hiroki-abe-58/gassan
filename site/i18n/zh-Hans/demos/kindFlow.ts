import type ja from '../../ja/demos/kindFlow';

export default {
  open: '前往下单',
  stepAddress: '收货地址',
  stepPayment: '支付',
  stepConfirm: '确认',
  title: '下单流程 — {0}',
  address: '地址',
  addressValue: '山形县鹤冈市羽黑町',
  card: '卡号',
  cardHelp: '仅限数字',
  confirmNote: '请确认内容后提交。提交后无法更改。',
  next: '下一步',
  submit: '提交',
  comments: {
    slots: '1fr auto 1fr 的三个插槽。有无返回按钮都不会让中间偏移（H-01）',
  },
} satisfies typeof ja;
