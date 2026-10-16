import type ja from '../ja/imperative';

export default {
  lead: '以宣告式撰寫確認對話框，open 的 state 與結果的傳遞會讓行數膨脹。useModals().confirm() 會以 Promise 回傳結果。',
  confirm: {
    title: '用 await 接收',
    intro: '即使同時呼叫兩個，也會一個一個依序顯示。兩個疊在一起的話，使用者會搞不清楚自己在回答哪一個。',
  },
  host: {
    title: '只放一個 ModalHost',
    body: ['`confirm()` 的 Promise 若沒有繪製目標，就永遠不會解析。因此我們保證了三個出口（L-15）。'],
    exits: [
      '沒有宿主卻仍在等待時發出警告。判定延後一個 tick（子元件的 effect 比父元件先執行，所以即使構成正確，同步判定也會誤報）。',
      '有兩個以上的宿主時發出警告。它們會各自繪製同一佇列的開頭，一個回答就會把全部解析掉。',
      '等待中宿主消失時發出警告。若默默吞掉，只會留下「await 沒有回傳」這個現象，無從追查原因。',
    ],
    callout:
      '確認的內容還很單純時用命令式 API；需要門控或自訂內文時，就用 `Modal.Root` 以宣告式撰寫。傳入 `consent`，就會變成必須勾選同意的確認。',
  },
  a11yCaption: '命令式 API 滿足的規格',
} satisfies typeof ja;
