import type ja from '../../ja/demos/chatBot';

export default {
  show: '在右下角显示聊天机器人',
  hide: '收起聊天机器人',
  title: 'Atlas 助手',
  description: '由 AI 回答。也可以为你转接人工客服',
  greeting: '你好。关于价格和套餐，有什么都可以问我',
  hello: '有什么可以帮你的？',
  plans: 'Pro 和 Max 有什么区别？',
  plansDescription: '从使用量和存储空间来比较',
  invoice: '我想按账单付款',
  invoiceDescription: '关于按年付费和 Enterprise',
  human: '我想联系人工客服',
  humanDescription: '工作日 10:00–18:00',
  placeholder: '输入消息',
  me: '你',
  bot: '助手',
  answer:
    'Max 套餐包含 Pro 的全部功能，并且使用量上限是 Pro 的 5 倍，存储空间为 1 TB，适合几乎每天都大量使用的团队。月费为每位用户 ¥5,000，按年付费可省 2 个月的费用。可以随时在 Pro 和 Max 之间切换，差额按天折算结算。',
  comments: {
    stream: '把回答一点一点地流式显示（实际应用中，把服务器传来的内容逐段追加上去）',
    place: '悬浮按钮固定在屏幕右下角。按下后在右下角打开小窗口，用标题栏的按钮可以展开为右侧面板',
  },
} satisfies typeof ja;
