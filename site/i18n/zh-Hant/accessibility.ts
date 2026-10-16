import type ja from '../ja/accessibility';

export default {
  lead: '瀏覽器會做的事絕不插手，瀏覽器不做的事全部包辦。gassan 的無障礙就由這兩根支柱構成。',
  native: {
    title: '交給瀏覽器的事',
    intro: '由 showModal() 負責。自己做一定會在某處漏掉，所以不寫才是正解。',
    tableCaption: '委派給原生功能的項目',
    callout:
      '也不加 `aria-modal`。`showModal()` 的 top layer 與 inert 具有同等以上的效果，重複指定反而會讓部分螢幕閱讀器的行為不穩定（A-03）。',
  },
  name: {
    title: '名稱不會缺漏',
    body: [
      '對話框的名稱透過 `aria-labelledby` 指向 `<h2>` 內側的 `<span>`。長標題的省略只用 CSS 的 `line-clamp`，不裁切 DOM 中的字串。因此即使畫面上在第 2 行被截斷，朗讀出來的名稱永遠完整。',
    ],
    mockLong: '變更第 3 季東北區各門市營收報告的分享設定',
    mockToggle: '顯示全文',
    mockCut: '變更第 3 季東北區各門市營…',
    mockTooltip: 'title 屬性的工具提示',
    do: '用 CSS 省略，只在溢出時顯示明確的切換按鈕。切換按鈕的文字放在名稱的 span 之外（T-03 / T-08）。',
    dont: "不要用 JS 寫成 `title.slice(0, 30) + '…'` 來裁切，名稱會跟著缺漏。把後半段丟到 `title` 屬性也不行，觸控時不會顯示，也不符合 WCAG 1.4.13（T-05）。",
  },
  gate: {
    title: '無法按下的理由，按了就能問到',
    body: [
      '在條件滿足之前無法按下的按鈕，不使用 `disabled`。`disabled` 不會接收焦點，鍵盤與螢幕閱讀器的使用者就連確認「為什麼無法繼續」的手段都失去了。gassan 改用 `aria-disabled="true"`，被按下時朗讀理由，並帶使用者前往卡住的地方。',
    ],
    mockTitle: '服務條款更新',
    mockButton: '同意並繼續',
    mockNote: '請勾選同意',
    do: '`aria-disabled` + 隨時可見的理由 + 按下時的朗讀與引導（G-01 / G-07 / G-08）。外觀以專用 token 維持 4.5:1（G-10）。',
    dont: '不要只用 `disabled` 加 `opacity: .4` 了事。既不知道理由，文字也看不清。',
  },
  read: {
    title: '讀完以邏輯或（OR）判定',
    intro:
      '若只靠捲動位置判定「已讀」，用虛擬游標閱讀的使用者不會觸發 scroll 事件，就永遠無法繼續。',
    signals: [
      { who: '滑鼠、觸控、滾輪', signal: '內文末端的哨兵元素進入畫面' },
      { who: '鍵盤、螢幕閱讀器', signal: '焦點抵達末端的標記（「內文結束」）' },
      { who: '大螢幕、短內文', signal: '高度本來就不需要捲動（只在能測量時判定）' },
    ],
    chips: '讀完門控的規格',
  },
  focus: {
    title: '焦點放在哪裡',
    mockTitle: '邀請成員',
    mockButton: '邀請',
    do: '開啟後的焦點放在面板本身（K-03）。螢幕閱讀器可以從標題開始依序朗讀。',
    dont: '在觸控裝置上不要把焦點放到第一個輸入欄位。虛擬鍵盤會彈出，遮住內文（K-04）。放在 × 按鈕上也會讓人跳過內文，同樣要避免。',
  },
  tables: {
    title: '鍵盤與輔助技術的項目',
    keyboardCaption: '鍵盤／焦點的項目',
    assistiveCaption: '輔助技術的項目',
  },
  preferences: {
    title: '遵循使用者的設定',
    tableCaption: '跟隨作業系統與瀏覽器設定的項目',
  },
} satisfies typeof ja;
