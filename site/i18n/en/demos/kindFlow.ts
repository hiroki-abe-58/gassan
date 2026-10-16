import type ja from '../../ja/demos/kindFlow';

export default {
  open: 'Go to checkout',
  stepAddress: 'Shipping',
  stepPayment: 'Payment',
  stepConfirm: 'Review',
  title: 'Checkout — {0}',
  address: 'Address',
  addressValue: 'Haguro-machi, Tsuruoka, Yamagata',
  card: 'Card number',
  cardHelp: 'Digits only',
  confirmNote: 'Review the details, then place your order. It cannot be changed afterwards.',
  next: 'Next',
  submit: 'Place order',
  comments: {
    slots: 'Three slots, 1fr auto 1fr. The center does not shift whether or not back is present (H-01)',
  },
} satisfies typeof ja;
