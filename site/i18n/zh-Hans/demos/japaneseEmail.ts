import type ja from '../../ja/demos/japaneseEmail';

export default {
  label: '邮箱地址',
  hint: '输入“taro@gmial.com”后离开输入框，会显示候选。对“@docomo.ne.jp”等手机运营商的邮箱，会显示有关接收设置的提示。',
  comments: {
    sender: '确认邮件的发件人（写进对手机运营商邮箱的提示中）',
  },
} satisfies typeof ja;
