import type ja from '../ja/common';

export default {
  siteTitle: 'gassan — 為原生 dialog 打造的模態視窗外殼',
  skipToMain: '跳至主要內容',
  openMenu: '開啟選單',
  menu: '選單',
  menuBody: '網站內的頁面',
  siteNav: '網站導覽',
  home: '首頁',
  spec: '規格',
  pager: '上一頁與下一頁',
  prev: '上一頁',
  next: '下一頁',
  footerCompliance: (version: string, updated: string): string => `符合[規格書 v${version}（${updated}）](#/spec)`,
  footerGenerated: '所有表格、數量與 API 皆在建置時從規格書與型別定義產生，沒有任何手寫的數字。',
  originalNote:
    '本網站的說明譯自日文。引自規格書（`modal.skill.md`）的文字——行為項目的名稱與要點、實作筆記、API 說明、驗證記錄——保留日文原文。',

  lang: {
    button: '語言',
    title: '顯示語言',
  },

  theme: {
    button: '主題',
    close: '關閉',
    scheme: '顯示',
    schemes: { light: '淺色', dark: '深色', system: '跟隨系統' },
    primary: '主色',
    presets: {
      default: '預設',
      magenta: '洋紅',
      red: '紅色',
      salmon: '鮭魚粉',
      vermilion: '橘紅',
      amber: '琥珀',
      yellow: '黃色',
      'lime-yellow': '萊姆黃',
      lime: '黃綠',
      green: '綠色',
      teal: '藍綠',
      blue: '藍色',
      indigo: '靛藍',
      custom: '自訂顏色',
    },
    pickCustom: '選擇自訂顏色',
    summaryPass: (count: number, worst: string): string =>
      `文字與填色的 ${String(count)} 個項目全部符合 WCAG 標準（最嚴格的組合也達到標準的 ${worst} 倍）`,
    summaryFail: '有未達標準的組合',
    more: '所選顏色是如何調整的 →',
    checks: {
      linkBg: '連結與選取中的文字（頁面背景）',
      linkSurface: '連結與選取中的文字（表面）',
      linkSurface1: '連結與選取中的文字（下沉一階的表面）',
      linkSurface2: '連結與選取中的文字（下沉兩階的表面）',
      linkSoft: '連結（淡色表面上）',
      onAccent: '填色按鈕的文字',
      onSoft: '淡色表面的文字（以 AAA 為目標）',
      gassanPrimary: '模態視窗 primary 的文字',
      gassanGated: '模態視窗門控中 primary 的文字',
      gassanBody: '模態視窗的內文',
      gassanMuted: '模態視窗的補充文字與 tertiary',
      focusRing: '焦點環（非文字）',
      fill: '開關與選取中 chip 的填色（非文字）',
    },
  },

  code: {
    copy: '複製',
    copied: '已複製',
    copiedStatus: '已複製程式碼',
    label: '程式碼',
    labelOf: (caption: string): string => `${caption} 的程式碼`,
  },

  example: {
    show: '查看程式碼',
    hide: '收合程式碼',
  },

  component: {
    eyebrow: '元件',
    tabs: '本頁內容',
    overview: '概覽',
    api: 'API',
    a11y: '無障礙',
  },

  specChips: '本頁涵蓋的規格',

  guideline: { do: '建議', dont: '避免', caution: '注意' },

  mock: { heading: '本月營收' },

  specTable: {
    id: 'ID',
    behavior: '行為',
    priority: '等級',
    summary: '實作要點',
    status: '狀態',
  },
  priority: { M: '必須', S: '建議', O: '選用' },
  status: {
    実装: '實作',
    実機: '實機',
    記述: '描述',
    未検証: '未驗證',
    委譲: '委派',
    合成: '組合',
    ロードマップ: '路線圖',
  },

  api: {
    name: '名稱',
    type: '型別',
    default: '預設值',
    description: '說明',
    required: '必填',
    none: '無',
    propsOf: (name: string): string => `${name} 的屬性`,
    passthrough: '`data-*` 會原樣傳給宿主元素（D-11）。`aria-*` 等其他帶連字號的 prop 會發出警告並捨棄。',
    inherits: (name: string): string => `繼承 \`${name}\`。`,
  },

  table: '表格',

  contrastSample: 'Aa 字',

  breakCompare: {
    browser: '交給瀏覽器',
    browserNote: '逐字換行',
    phraseNote: '在文節邊界換行',
  },

  layers: {
    layer: (n: number): string => `第 ${String(n)} 層`,
    tokens: 'CSS token',
  },

  notFound: {
    title: '找不到頁面',
    lead: '連結可能已經過期，或網址有誤。',
    back: '回到首頁',
  },
} satisfies typeof ja;
