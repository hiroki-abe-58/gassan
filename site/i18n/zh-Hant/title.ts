import type ja from '../ja/title';

export default {
  lead: '對話框的名稱與說明。名稱自動關聯到 h2 內側的 span，說明自動關聯到 aria-describedby。省略只靠 CSS，名稱不會缺漏。',
  clamp: {
    title: '長標題',
    intro: '預設在 2 行處省略。只有在溢出時才會出現「顯示全文」的切換按鈕。',
    exampleTitle: '長標題的省略',
    exampleDescription: '即使被省略，螢幕閱讀器仍會朗讀全文。',
  },
  why: {
    title: '為什麼只用 CSS 省略',
    body: [
      '用 JS 裁切字串，DOM 中的文字本身就會缺漏。`aria-labelledby` 指向的名稱也一併缺漏，螢幕閱讀器的使用者就會進入一個名為「變更第 3 季東北區各門市營…」的對話框。`line-clamp` 只裁切外觀，所以名稱永遠保持完整。',
    ],
    mockLong: '變更第 3 季東北區各門市營收報告的分享設定',
    mockToggle: '顯示全文',
    mockCut: '變更第 3 季東北區各門市營…',
    mockTooltip: '長按顯示全文',
    do: '用按下才展開的明確按鈕顯示全文。該按鈕具備 `aria-expanded` 與 `aria-controls`（T-08）。',
    dont: '不要依賴 hover、`title` 屬性或長按。觸控時不會出現，也會與作業系統的內容選單衝突（T-05 / T-06）。',
  },
  a11yCaption: '標題與說明滿足的規格',
} satisfies typeof ja;
