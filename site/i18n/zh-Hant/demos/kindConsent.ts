import type ja from '../../ja/demos/kindConsent';

export default {
  open: '查看條款',
  agreed: '已同意',
  title: '服務條款更新',
  articleNumber: '第 {0} 條',
  article1: '本服務未經使用者許可，不會將使用者建立的資料提供給第三方。',
  article2: '使用者可以隨時刪除帳號。刪除的資料在 30 天後將無法復原。',
  article3: '費用調整將於適用前 30 天通知。通知會寄送至註冊的電子郵件地址。',
  article4: '因故障造成的損害，以最近 1 個月的使用費用為上限進行賠償。',
  article5: '本條款的修訂，自修訂後的條款公告於本服務上時起生效。',
  article6: '本條款未規定的事項，依相關法令與一般慣例處理。',
  consent: '我同意更新後的條款',
  decline: '不同意',
  accept: '同意並繼續',
  comments: {
    noDismiss: 'consent 按 Esc 或點擊背景都不會關閉。試圖關閉時會晃動並朗讀理由',
    readGate: '讀完的判定為「看到末端 OR 焦點抵達末端 OR 不需捲動」（G-03）',
    gate: '不設為 disabled。按下會朗讀「缺少什麼」，並帶使用者前往該處（G-07 / G-08）',
  },
} satisfies typeof ja;
