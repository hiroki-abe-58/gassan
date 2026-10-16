import type ja from '../../ja/demos/imperativeConfirm';

export default {
  logoutTitle: '要登出嗎？',
  logout: '登出',
  callOne: '呼叫 confirm',
  firstTitle: '第 1 個：要關閉通知嗎？',
  secondTitle: '第 2 個：確認刪除帳號',
  consent: '我已了解內容',
  secondLog: '第 2 個 → {0}',
  callTwo: '同時呼叫兩個',
  comments: {
    host: '在應用程式的根部放一個 <ModalHost />（本網站放在 App.tsx 中）。',
    queue: '即使同時呼叫兩個，也會一個一個依序顯示（L-14）',
  },
} satisfies typeof ja;
