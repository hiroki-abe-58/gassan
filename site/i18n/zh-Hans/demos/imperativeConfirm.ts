import type ja from '../../ja/demos/imperativeConfirm';

export default {
  logoutTitle: '要退出登录吗',
  logout: '退出登录',
  callOne: '调用 confirm',
  firstTitle: '第 1 个：要关闭通知吗',
  secondTitle: '第 2 个：确认注销账号',
  consent: '我已了解上述内容',
  secondLog: '第 2 个 → {0}',
  callTwo: '同时调用两个',
  comments: {
    host: '在应用根部放置一个 <ModalHost />（本站放在 App.tsx 中）。',
    queue: '即使同时调用两个，也会一个接一个地显示（L-14）',
  },
} satisfies typeof ja;
