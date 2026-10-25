import type ja from '../../ja/demos/japaneseEmail';

export default {
  label: 'Email address',
  hint: 'Type “taro@gmial.com” and leave the field, and a suggestion appears. Mobile carrier addresses such as “@docomo.ne.jp” get a notice about their receiving settings.',
  comments: {
    sender: 'The sender of the confirmation email (included in the notice for mobile carrier addresses)',
  },
} satisfies typeof ja;
