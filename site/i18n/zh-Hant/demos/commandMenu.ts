import type ja from '../../ja/demos/commandMenu';

export default {
  open: '開啟命令面板',
  placeholder: '搜尋頁面或操作',
  pages: '頁面',
  actions: '操作',
  home: '首頁',
  homeDescription: '儀表板與最近動態',
  members: '成員',
  billing: '方案與帳單',
  settings: '設定',
  settingsDescription: '個人資料、密碼、兩步驟驗證',
  invite: '邀請成員',
  project: '建立專案',
  export: '匯出資料',
  exportDescription: '可在 Pro 方案中使用',
  ran: '已選擇「{0}」',
  comments: {
    hotkey: '本網站的搜尋已經使用 ⌘K，所以範例以按鈕開啟（hotkey={false}）。在應用程式中省略 hotkey，就能以 ⌘K / Ctrl+K 開啟',
  },
} satisfies typeof ja;
