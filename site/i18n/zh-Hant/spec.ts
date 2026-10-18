import type ja from '../ja/spec';

export default {
  title: (page: string, count: number): string => `${page}（${String(count)} 項）`,
  lead: (categories: number): string =>
    `把理想的模態視窗應滿足的行為，分成 ${String(categories)} 個類別逐行列舉。每一行都對應到以哪個測試、哪段 CSS 來滿足它。`,
  source: (version: string, updated: string): string =>
    `原文是 [modal.skill.md](modal.skill.md) §4（v${version}，${updated}），狀態與依據是 [docs/traceability.md](docs/traceability.md)。兩者都由 \`npm run check:trace\` 機器驗證，若以不存在的測試名稱作為依據，CI 就會失敗。本頁在建置時由這兩份檔案產生。`,
  filters: {
    label: '篩選規格',
    keyword: '關鍵字',
    keywordPlaceholder: '例如：「フォーカス」、G-03、line-clamp',
    category: '類別',
    status: '狀態',
    all: '全部',
    priority: '必要程度',
    priorityOption: (letter: string, label: string): string => `${letter}（${label}）`,
    count: (shown: number, total: number): string => `顯示 ${String(shown)} / ${String(total)} 項`,
  },
  categoryItems: (name: string): string => `${name}的項目`,
  statusAndEvidence: '狀態與依據',
  evidence: {
    count: (n: number): string => `依據 ${String(n)} 項`,
    kinds: {
      T: '測試',
      C: 'CSS',
      S: '檔案',
      D: '文件',
      B: '實機檢查',
      R: '路線圖',
      N: '委派對象',
    },
  },
  empty: '沒有符合條件的項目。請放寬篩選條件。',
  legend: {
    title: '狀態的讀法',
    intro: '依保證強度由強到弱排列。不把「實作」與「描述」混為一談，是這張表的重點。',
    tableCaption: '狀態的用語',
  },
} satisfies typeof ja;
