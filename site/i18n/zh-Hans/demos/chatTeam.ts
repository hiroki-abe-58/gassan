import type ja from '../../ja/demos/chatTeam';

export default {
  label: '与王芳的对话',
  me: '赵磊',
  aoi: '王芳',
  m1: '账单模板的新版本已经共享了，从本月起就能用。',
  m2: '谢谢。我从明天的结算开始切换。',
  m3: '还有一件事。从 11 月的账单开始，付款期限改为月底。',
  m4: '给客户的通知，我稍后发送。',
  reply: '好的。等通知到了，我这边也会确认一下。',
  placeholder: '输入消息',
  comments: {
    reply: '示例中，发出的消息稍等片刻后标为已读，并在输入中提示之后添加回复。在应用中，根据服务器的通知来更新',
  },
} satisfies typeof ja;
