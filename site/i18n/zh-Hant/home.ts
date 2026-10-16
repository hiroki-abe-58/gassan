import type ja from '../ja/home';

export default {
  eyebrow: 'React 的模態視窗外殼',
  heroTitle: ['第 1 層，', '交給瀏覽器。'],
  lead: 'gassan 是以原生 `<dialog>` 為基礎的 React 模態視窗外殼。焦點陷阱、Esc、背景的 inert 化，一行都沒有自己實作。取而代之，它把全部心力投注在現有函式庫幾乎沒碰過的那一層——資訊架構、啟用門控、關閉原因。',
  start: '開始使用',
  philosophy: '閱讀設計理念',
  stats: {
    items: '列舉的行為',
    tests: '自動化測試',
    proven: '已由測試證明的行為',
    trap: '自己實作的焦點陷阱',
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
    title: '其他函式庫沒有解決的 4 件事',
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
    more: '最小範例與瀏覽器需求 →',
  },
} satisfies typeof ja;
