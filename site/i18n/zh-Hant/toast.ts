import type ja from '../ja/toast';

export default {
  lead: '在不打斷工作的前提下，告知處理已完成的通知。呼叫 `toast()` 後，它會出現在畫面邊緣，底部的計時條隨剩餘時間縮短，時間一到就會關閉。也可以用 ×、Esc 或橫向滑動關閉。即使模態視窗開著，它也會顯示在模態視窗上方，而且可以操作。',
  tones: {
    title: '範例',
    intro: '圖示與顏色分為成功、資訊、警告、失敗 4 種，另有不帶圖示的預設樣式。顏色只放在圖示與計時條上，表面與其他元件相同（不以加框的方式強調）。',
    exampleTitle: '色調的差異',
    exampleDescription: '按下按鈕，快顯通知會出現在右下角。指標停在上方時，計時條會暫停。',
  },
  meter: {
    title: '剩餘時間的計時條',
    intro: '底部的線會依剩餘時間的比例縮短。淡色的底條顯示全長，因此一眼就能看出還有多久會消失。',
    body: [
      '指標停在上方時、焦點位於其中時、分頁被隱藏時、正在用手指拖曳時，時間與計時條都會暫停。不會在使用者閱讀途中消失（WCAG 2.2.1 / 2.2.2）。恢復後從暫停前的剩餘時間繼續計算。',
      '計時條是傳達剩餘時間的資訊，所以即使把動態效果的等級設為 `none` 也不會停止。在系統的「減少動態效果」設定下，不會平滑縮短，而是每秒跳一格。',
      '時間可用 `duration`（ms）變更。傳入 `Infinity` 時不會依時間關閉，也不會顯示計時條。',
    ],
    tableCaption: '預設時長',
    head: { kind: '種類', duration: '時長' },
    rows: [
      { kind: '無圖示、成功、資訊', duration: '5 秒' },
      { kind: '警告、失敗', duration: '8 秒（預留重讀的時間）' },
      { kind: '附按鈕的', duration: '10 秒以上（預留移去按按鈕的時間）' },
      { kind: '載入中（toast.promise）', duration: '不依時間關閉' },
    ],
  },
  action: {
    title: '復原',
    intro: '對於可以復原的操作，與其用確認的模態視窗擋下，不如立即執行，並在快顯通知上附上「復原」，這樣比較快。按鈕只能放一個。',
    exampleTitle: '刪除草稿',
    exampleDescription: '刪除會立即生效。在 10 秒內按下「復原」就能還原。',
  },
  promise: {
    title: '處理期間',
    intro: '`toast.promise` 在處理期間顯示載入中的快顯通知（不依時間關閉），完成後在同一位置換成成功或失敗。',
    exampleTitle: '儲存',
    exampleDescription: '可以分別試試耗時 1.5 秒的儲存成功與失敗兩種情況。',
  },
  position: {
    title: '顯示位置',
    intro: '上下兩排各有左、中、右，共 6 個位置。預設為右下（在由右至左書寫的語言中為左下）。顯示在上方時，新的放在最上面，讓視覺順序與朗讀順序一致。',
    choose: '顯示位置',
    labels: {
      'top-start': '左上',
      'top-center': '上方',
      'top-end': '右上',
      'bottom-start': '左下',
      'bottom-center': '下方',
      'bottom-end': '右下',
    },
    try: '顯示看看',
    message: (place: string): string => `已在${place}顯示`,
    body: [
      '同時顯示的數量上限為 `max`（預設 3）。超過時從最舊的開始關閉。關閉後，其餘的會滑動補上空隙。',
      '進出的動畫依循動態效果等級的 token。在 `expressive` 下會從邊緣以彈簧效果進場，在 `none` 下則不移動，直接出現與消失。',
    ],
  },
  modal: {
    title: '模態視窗之上',
    intro: '模態視窗開啟期間，模態視窗之外的元素無法按下，也不會被朗讀（即使顯示在 top layer 也一樣）。因此模態視窗開啟時，快顯通知會移進最上層的對話框中，在其上方重新顯示。',
    exampleTitle: '在模態視窗中複製',
    exampleDescription: '快顯通知會顯示在模態視窗上方，可以用 × 關閉。在快顯通知上按 Esc，也不會關閉模態視窗。',
    body: ['移進之後，剩餘時間與計時條仍會接續進行。關閉模態視窗後，快顯通知會回到原本的位置。'],
  },
  keys: {
    title: '操作',
    tableCaption: '快顯通知的操作',
    head: { key: '操作', action: '動作' },
    rows: [
      { key: 'Tab', action: '移到快顯通知的按鈕。焦點位於其中時，時間會暫停' },
      { key: 'Esc', action: '關閉有焦點的快顯通知（不會關閉模態視窗）' },
      { key: 'Enter / Space', action: '按下按鈕（復原、×）。關閉後焦點移到相鄰的快顯通知；若是最後一個，則回到原本的位置' },
      { key: '橫向滑動', action: '朝滑動的方向滑出並關閉（超過寬度的 35%，或快速滑動）' },
    ],
  },
  host: {
    title: '放置方式',
    body: [
      '在應用程式的根部只放一個 `<ToastHost />`。無論從哪裡呼叫 `toast()`，都會繪製在那裡。沒有宿主時呼叫，開發階段會發出警告。',
      '通知區域是名為「通知」的地標，帶有 `aria-live="polite"`。沒有快顯通知時也保留該區域（即時區域要比內容先存在，才能確實被朗讀）。',
    ],
  },
  apiCaption: {
    functions: 'toast 的函式',
    head: { call: '呼叫方式', returns: '回傳值', description: '說明' },
    rows: [
      { call: 'toast(message, options?)', returns: 'id', description: '顯示不帶圖示的快顯通知。可用 options.tone 選擇色調' },
      { call: 'toast.success / info / warning / error(message, options?)', returns: 'id', description: '以指定的色調顯示' },
      { call: 'toast.promise(promise, messages, options?)', returns: 'Promise', description: '處理期間顯示載入中，完成後替換。原樣回傳傳入的 Promise' },
      { call: 'toast.dismiss(id?)', returns: '—', description: '關閉。省略 id 則全部關閉' },
    ],
  },
  a11yCaption: '快顯通知滿足的規格',
} satisfies typeof ja;
