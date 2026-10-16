import type ja from '../../ja/demos/kindConsent';

export default {
  open: '查看条款',
  agreed: '已同意',
  title: '服务条款更新',
  articleNumber: '第 {0} 条',
  article1: '未经用户许可，本服务不会向第三方提供用户创建的数据。',
  article2: '用户可以随时删除账号。删除的数据在 30 天后将无法恢复。',
  article3: '费用调整将在生效前至少 30 天通知。通知发送至注册的邮箱地址。',
  article4: '因故障造成的损失，以最近 1 个月的使用费为上限进行赔偿。',
  article5: '本条款的修改，自修改后的条款在本服务上公布之时起生效。',
  article6: '本条款未规定的事项，依照相关法律法规和一般惯例处理。',
  consent: '我同意更新后的条款',
  decline: '不同意',
  accept: '同意并继续',
  comments: {
    noDismiss: 'consent 按 Esc 或点击背景都不会关闭。试图关闭时会抖动并播报原因',
    readGate: '读完的判定是“看到末尾 OR 焦点到达末尾 OR 不需要滚动”（G-03）',
    gate: '不设为 disabled。按下时播报“还缺什么”，并把用户带到那里（G-07 / G-08）',
  },
} satisfies typeof ja;
