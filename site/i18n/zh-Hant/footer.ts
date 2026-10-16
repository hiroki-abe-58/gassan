import type ja from '../ja/footer';

export default {
  lead: '頁尾的按鈕最多三個層級。依 DOM 順序 = 視覺順序 = Tab 順序撰寫，從原理上杜絕重複送出。',
  hierarchy: {
    title: '按鈕的層級',
    intro: 'primary、secondary、tertiary 各一個。依由弱到強的順序撰寫，只有最前面的 tertiary 會向左分開。',
    exampleTitle: '發布文章',
    exampleDescription: '連按「發布」也只會執行一次。按 ⌘ / Ctrl + Enter 也能按下 primary。',
  },
  loading: {
    title: '處理中',
    body: [
      '`onAction` 回傳 Promise 時，按鈕在解析完成之前都處於處理中。這段期間的點擊會被吞掉，所以從原理上不會重複送出。即使從外部傳入 `loading`，也會與內部的處理中狀態以**邏輯或**合併。因為 `loading={false}` 的意思是「就我這邊而言不在處理中」，而不是「onAction 執行期間也可以讓人按」（F-08）。',
      '處理中的標籤以 `opacity: 0` 隱藏，再疊上載入圖示。若改用 `visibility: hidden`，名稱會一起消失，變成「沒有名稱的按鈕」（F-07 / §10-4）。寬度也不會改變。',
    ],
    callout: '即使 `onAction` 被 reject，處理中狀態也一定會解除。不做出按不了又卡住的按鈕。',
  },
  danger: {
    title: '破壞性的操作',
    mockTitle: '刪除專案',
    mockCancel: '先不要',
    mockDelete: '刪除',
    do: '`variant="danger"` 維持 primary 的位置，只改變顏色。',
    dont: '不要把初始焦點放在破壞性的按鈕上。按一次 Enter 就無法挽回（K-05）。',
  },
  a11yCaption: '頁尾與按鈕滿足的規格',
} satisfies typeof ja;
