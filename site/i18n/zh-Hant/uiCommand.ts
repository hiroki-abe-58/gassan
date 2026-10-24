import type ja from '../ja/uiCommand';

export default {
  lead: '輸入名稱來搜尋頁面與操作，並直接開啟或執行的視窗。按 ⌘K（在 Windows 等系統上為 Ctrl+K）會在畫面最上層開啟，只用鍵盤就能選取。本網站右上角的「搜尋」也是以這個元件製作的。',
  example: {
    title: '範例',
    intro: '頁面與操作分組排列。除了名稱，也能用「invoice」這類別名搜尋，輸入大寫的「INVOICE」或全形的「ｉｎｖｏｉｃｅ」同樣找得到。無法使用的操作以淡色顯示，用按鍵移動時會跳過。',
    exampleTitle: '命令面板',
    exampleDescription: '以 ↑↓ 移動，按 Enter 選取。符合的部分會以粗體顯示，並朗讀符合的數量。',
  },
  matching: {
    title: '比對與排序',
    intro: '輸入的文字會與名稱、說明和別名比對，比對時不分全形與半形、大小寫，日文的平假名與片假名也視為相同。排列順序如下，同一級的項目維持傳入時的順序。',
    tableCaption: '排列順序',
    head: { rank: '順序', rule: '比對位置', typed: '輸入的文字', hits: '符合的例子' },
    rows: [
      { rank: '1', rule: '名稱的開頭', typed: '成員', hits: '成員' },
      { rank: '2', rule: '名稱的其他位置', typed: '資料', hits: '匯出資料' },
      { rank: '3', rule: '說明與別名', typed: 'ｉｎｖｏｉｃｅ', hits: '方案與帳單（別名 invoice）' },
    ],
  },
  site: {
    title: '本網站的搜尋',
    intro: '右上角「搜尋」（⌘K / Ctrl+K）開啟的視窗，就是這個元件本身。可以依名稱搜尋所有頁面，並依分類分組。頁面網址中的英文（如「datepicker」「toast」）也能比對到。',
  },
  codeCaption: '用法',
  code: "import { CommandPalette } from '@genelab/gassan';\n\n// 按 ⌘K / Ctrl+K 開啟。要自行控制開啟與關閉時，傳入 open 與 onOpenChange\n<CommandPalette\n  items={[\n    { id: 'members', group: '頁面', label: '成員', href: '/members', keywords: ['members'] },\n    { id: 'invite', group: '操作', label: '邀請成員', shortcut: ['G', 'I'], onSelect: openInvite },\n  ]}\n/>",
  a11yCaption: '命令面板的行為',
} satisfies typeof ja;
