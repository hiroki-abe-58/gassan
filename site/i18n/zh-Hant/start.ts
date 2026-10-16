import type ja from '../ja/start';

export default {
  lead: '安裝、選一個 kind、保持常駐掛載。要記的就這些，其餘的規則都由 kind 承擔。',
  install: {
    title: '安裝',
    body: ['已發布到 npm（`@genelab/gassan`）。peer 依賴為 React 18.2 以上（19 也能運作）。'],
    nextjs:
      '在 Next.js App Router 中，發布的檔案開頭已加上 `"use client"`，可以直接 import。若想在頁面切換時關閉，請傳入 `routeKey={usePathname()}`（L-13）。',
  },
  minimal: {
    title: '最小範例',
    intro: '頁首、內文、頁尾三列。名稱由 Modal.Title 負責，標籤與說明的關聯由 Modal.Field 負責。',
    exampleTitle: '編輯個人資料',
  },
  alwaysMounted: {
    title: '模態視窗要保持常駐掛載',
    body: [
      '關閉動畫的前提是「關閉之後元素仍然存在」。若採條件式掛載，`open` 變成 false 的瞬間元素就整個消失，因此從原理上就不存在可以繪製退場的對象。',
    ],
    do: '永遠保持掛載，用 `open` 控制開關。退場動畫、焦點復原、內容重設由函式庫依序處理。',
    dont: '不要寫成 `{open && <Modal.Root />}`。關閉的瞬間就消失，無法繪製退場動畫（§5 第 3 項）。',
  },
  choose: {
    title: '選一個 kind',
    body: [
      '`kind` 有 `confirm` / `form` / `view` / `consent` / `flow` 五種。決定之後，遮罩、能否以 Esc 與點擊背景關閉、配置位置的預設值就隨之確定。若同時符合多種，那其實是該拆開的兩個模態視窗。',
    ],
    doTitle: '要刪除草稿嗎？',
    doCancel: '先不要',
    doDelete: '刪除',
    do: '一個模態視窗只有一個目的。確認就只做確認。',
    dontTitle: '要刪除嗎？還有設定',
    dontSave: '儲存並刪除',
    dont: '不要把確認和表單混在同一個視窗裡。正確的關閉方式會變成兩種，其中一種必然會背叛使用者。',
    more: '五種類型與決策矩陣 →',
  },
  imperative: {
    title: '只是確認的話，可以用 await 寫',
    body: [
      '以宣告式寫確認對話框，state 會變多。`useModals().confirm()` 會以 Promise 回傳結果。在應用程式的根部只放一個 `<ModalHost />`。',
    ],
    code: "const modals = useModals();\nconst ok = await modals.confirm({ title: '要刪除嗎？', tone: 'danger' });",
  },
  browsers: {
    title: '瀏覽器需求',
    intro:
      '既然把第 1 層交給瀏覽器，瀏覽器的現況就直接成為前提。在較舊的環境中，只會退化成「沒有動畫的模態視窗」，開關與無障礙都能維持。',
    tableCaption: '使用的平台功能與支援狀況',
  },
  ai: {
    title: '讓 AI 撰寫程式碼時',
    intro:
      '給 Cursor / Claude Code / Copilot 的，只需要規格書 §9 的這一段。它能事先擋下 2022 年以前實作的習慣（自製焦點陷阱、z-index: 9999、條件式掛載）。',
  },
} satisfies typeof ja;
