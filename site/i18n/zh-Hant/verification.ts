import type ja from '../ja/verification';

export default {
  lead: '「測試是綠的」與「有保證」是兩回事。我們把在哪一層驗證了什麼、還有什麼尚未驗證，分開寫清楚。',
  stats: {
    tests: (files: number): string => `測試（${String(files)} 個檔案）`,
    items: '行為項目',
    proven: '已由測試證明的項目',
    device: '只能在實機確認的項目',
  },
  pipeline: {
    intro: '由上而下依序執行，只要有一項失敗就停止。越下方的階段，越能抓到上方階段從原理上無法發現的事故。',
    steps: [
      { command: 'tsc --noEmit', catches: '型別不一致' },
      { command: 'eslint .', catches: '靜態可察覺的筆誤' },
      { command: 'vitest run', catches: '無障礙名稱、門控的邏輯或、關閉原因的分類、顏色的對比度' },
      { command: 'check:trace', catches: '規格項目與依據的缺漏或多餘、引用不存在的測試名稱、文件中所寫數量的偏差' },
      { command: 'check:docs', catches: 'README 與 docs 中的程式碼範例無法用公開 API 編譯' },
      { command: 'tsup', catches: 'ESM / CJS / 型別產生失敗' },
      { command: 'check:dist', catches: '"use client" 遺失、公開 API 缺漏、超出大小預算' },
      {
        command: 'check:ssr',
        catches: '渲染期間參照 window（在 Next.js App Router 中會失敗）、SSR 當下門控的 fail-open',
      },
      {
        command: 'check:pack',
        catches: '發布到 npm 時形態上的事故（缺少 LICENSE、types 條件搞錯、隨附文件的連結失效）',
      },
    ],
  },
  status: {
    title: '項目的狀態',
    intro: (count: number): string => `${String(count)} 個項目各自以何種強度獲得保證。`,
    count: (n: number): string => `${String(n)} 項`,
    weakMust: (n: number): string =>
      `有 ${String(n)} 個項目屬於必須（M），狀態卻是「描述」。數值有經過機器驗證，但繪製結果只能在實際瀏覽器中確認。這是本函式庫目前的弱點，我們不加隱瞞。`,
  },
  device: {
    title: '無法在 jsdom 中驗證的事',
    intro:
      '像 top layer、退場動畫、遮罩濃度這類，不實際繪製就無法判定真偽的項目。在實機上開啟 examples/css-check.html，相同的項目會以核取方塊呈現。',
    tableCaption: '實機檢查表',
    columns: { id: 'ID', item: '項目', how: '確認方式', diagnosis: '若未通過' },
    pending: (n: number): string =>
      `這 ${String(n)} 個項目尚未在實機上逐一完成（ROADMAP v0.2.0）。在實際瀏覽器中的自動檢查（Playwright + axe）將於 v0.4.0 導入。詳情請見 [VERIFICATION.md](VERIFICATION.md) 與 [ROADMAP.md](ROADMAP.md)。`,
  },
} satisfies typeof ja;
