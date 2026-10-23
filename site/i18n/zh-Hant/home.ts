import type ja from '../ja/home';

export default {
  eyebrow: '為 SaaS 打造的 React UI 函式庫',
  heroTitle: ['從登入到帳單，', '只要放一個元件。'],
  lead: 'gassan 是以原生 `<dialog>` 為基礎的 React UI 函式庫。從模態視窗、表單元件、UI 元件、快顯通知、命令面板，到登入、錯誤、價格、設定、成員、帳單的頁面，都包含在內。焦點陷阱、Esc、背景的 inert 化都交給瀏覽器，省下的心力用來把朗讀、鍵盤與日文換行寫進規格，並以測試確認。',
  start: '開始使用',
  templates: '查看範本',
  stats: {
    exports: '公開的 API',
    items: '列舉的行為',
    tests: '自動化測試',
    trap: '自己實作的焦點陷阱',
  },
  showcase: {
    title: '範例應用程式',
    intro: '「Atlas」是一個虛構的 SaaS。透過導覽與按鈕，可以在首頁、成員、方案與帳單、設定、登入、方案與價格之間四處瀏覽。畫面以 gassan 的範本與元件組成，額外加上的只有標誌、範例資料，以及首頁數字的排列方式。切換到「手機」，就會變成窄螢幕的樣子。',
    frameTitle: 'Atlas',
    variants: { dashboard: '首頁', members: '成員', billing: '方案與帳單', settings: '設定', signIn: '登入', pricing: '方案與價格' },
  },
  features: {
    title: '包含的內容',
    intro: 'SaaS 畫面需要的東西，以元件與頁面為單位提供。每一項都以具名 import 引入，沒用到的不會被打包進應用程式。',
    items: {
      modal: {
        title: '模態視窗',
        body: '五種類型、啟用門控、標題截斷、關閉原因、停在檔位的底部面板。焦點、Esc 與背景交給瀏覽器。',
      },
      forms: {
        title: '表單元件',
        body: '輸入欄位、選項、下拉選單、具備日本國定假日與期間選擇的月曆、時間、標籤、密碼強度、檔案。',
      },
      ui: {
        title: 'UI 元件',
        body: '按鈕、徽章、卡片、數值摘要、頁籤、選單、麵包屑、分頁、步驟條、資料表格、命令面板。',
      },
      feedback: {
        title: '通知',
        body: '計時條隨剩餘時間縮短的快顯通知、通知橫幅、進度。可以暫停下來閱讀，滑動或手動都能關閉。',
      },
      templates: {
        title: '頁面範本',
        body: '登入、註冊、兩步驟驗證、重設密碼、錯誤、維護、價格、常見問題、條款、聯絡我們、更新紀錄。',
      },
      app: {
        title: '應用程式畫面',
        body: '應用程式外框，以及設定、成員、方案與帳單、初始設定、接受邀請的頁面。只要傳入資料與處理函式就能運作。',
      },
      motion: {
        title: '動態效果',
        body: '可從 4 個等級的動態效果中選擇。按下時的手感、退場、彈簧的回彈都已齊備，並始終遵從「減少動態效果」的設定。',
      },
      a11y: {
        title: '朗讀與鍵盤',
        body: '名稱、狀態、焦點的去向，依元件逐一寫進規格，並以測試確認。不只靠顏色傳達。',
      },
    },
  },
  languages: {
    title: '為日文、中文、韓文的畫面而做',
    intro:
      '在窄螢幕上斷成「プロフィールを編｜集」「保存更改并关｜闭」的按鈕，不會再出現。即使用右上角的「主題」換了顏色，文字依然清楚可讀。',
    browserNote: '在詞語中間斷行',
    phraseNote: '在詞語與文節的邊界換行',
    details: {
      lineBreak: {
        title: '換行',
        body: '從按鈕、標題、表格儲存格到圖表摘要，日文只在文節邊界、中文只在詞語邊界、韓文只在空白處換行。泰文與英文則不插手。朗讀的名稱與複製出來的字串都不會改變。',
      },
      theme: {
        title: '主題',
        body: (presets: number): string =>
          `淺色與深色、${String(presets)} 組預設集，以及自訂顏色。無論選哪種顏色，都會推導出讓文字與填色符合 WCAG 標準的色彩。`,
      },
      button: {
        title: '按鈕的種類與狀態',
        body: 'primary、secondary、tertiary 與 danger。可按、處理中、門控中、無法使用，不只靠顏色，也能從形狀分辨。',
      },
    },
  },
  promises: {
    title: '模態視窗的核心——其他函式庫沒有解決的 4 件事',
    intro: '第 1 層（top layer、焦點、Esc）瀏覽器早已解決。gassan 把時間花在那之上的設計工作。',
    gate: {
      title: '啟用門控',
      body: '不用 disabled，做出「讀到最後」「勾選之後」才能按的按鈕。按下時，會朗讀還缺什麼，並帶你前往該處。',
      mockTitle: '服務條款更新',
      mockButton: '同意並繼續',
      mockNote: '請將內文讀到最後',
    },
    clamp: {
      title: '標題截斷',
      body: '不裁切 DOM 中的字串，只用 CSS 的 line-clamp 省略。朗讀出來的名稱永遠完整。只有在溢出時才會出現「顯示全文」。',
      mockTitle: '變更 2026 年度第 3 季東北區各門市營收報告的分享設定',
      mockToggle: '顯示全文',
    },
    reasons: {
      title: '關閉原因',
      body: 'Esc、背景、×、送出、滑動、返回、頁面切換、外部呼叫 close()。區分這 8 種，拒絕關閉時也不會默不作聲。',
    },
    scrim: {
      title: '遮罩的 token',
      body: '不再寫死 60% 的黑色，改為依意圖分成 4 個等級。預設為 32%、不加 blur。不抹去模態視窗唯一的優勢——「上下文」。',
    },
  },
  kinds: {
    title: '從 5 種類型中挑選',
    intro:
      '決定一個 kind，遮罩濃度、能否以 Esc 與點擊背景關閉、配置位置的預設值就隨之確定。若同時符合多種，那其實是該拆開的兩個模態視窗。按下按鈕會開啟實際的元件。',
    items: {
      confirm: { label: '確認', use: '確認無法復原的操作' },
      form: { label: '輸入', use: '保持上下文的次要輸入' },
      view: { label: '檢視', use: '詳細資訊、放大檢視媒體' },
      consent: { label: '同意', use: '明確同意條款、權限' },
      flow: { label: '流程', use: '多步驟的手續' },
    },
    scrim: '遮罩',
    esc: 'Esc',
    backdrop: '背景',
    closes: '關閉',
    stays: '不關閉',
    more: '類型的選擇方式與決策矩陣 →',
  },
  verified: {
    title: '不是宣稱，而是檢查結果',
    intro: (items: number): string =>
      `規格書的 ${String(items)} 個項目，每一個都對應到測試名稱、CSS 或路線圖之一。若以不存在的測試名稱作為依據，CI 就會失敗。`,
    count: (count: number): string => `${String(count)} 個項目`,
    bar: (parts: readonly string[]): string => parts.join('、'),
    spec: (items: number): string => `查看 ${String(items)} 個項目的行為規格`,
    verification: '驗證了什麼、沒有驗證什麼 →',
  },
  install: {
    title: '安裝',
    caption: '安裝',
    cssCaption: '載入樣式',
    css: "import '@genelab/gassan/styles.css';\n// 只在使用頁面範本時（在 styles.css 之後載入）\nimport '@genelab/gassan/templates.css';",
    more: '最小範例與瀏覽器需求 →',
  },
} satisfies typeof ja;
