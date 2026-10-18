import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 為單一欄位、Modal.Fieldset 為選項群組，建立名稱、說明文字與錯誤的關聯。內部可以是 gassan 的輸入元件，也可以是原生的 input 或其他函式庫的元件。',
  field: {
    title: '把關聯集中在一處',
    intro: '透過 render prop 傳遞 id 與 aria-*。gassan 的輸入元件會直接展開接收。',
    exampleTitle: '邀請成員',
    exampleDescription: '保持空白直接按「邀請」，錯誤摘要會集中顯示在一處，焦點則移到第一個錯誤。',
  },
  parts: {
    title: 'gassan 的輸入元件',
    tableCaption: '輸入元件與所在的頁面',
    head: { page: '頁面', parts: '元件' },
    body: [
      '每個元件的內部都是原生元素，只重新繪製外框與記號。鍵盤操作、朗讀、表單送出、手機專用的 UI，都直接沿用瀏覽器的行為。只有原生不足的下拉選單、組合框與月曆，依照 WAI-ARIA APG 的模式製作（I-01〜I-15）。',
      '目前還沒有可多選的組合框，也沒有日期範圍選擇。需要時，請同樣用 Modal.Field 包住其他函式庫的元件。模態視窗中的彈出元件，會因面板的 `transform` 而讓 `position: fixed` 失效，所以請使用 popover API 或傳送到 dialog 內的 portal（C-12）。最小範例在 [docs/control-recipes.md](./docs/control-recipes.md)。',
    ],
  },
  errors: {
    title: '錯誤的呈現方式',
    callout:
      '個別錯誤不加 `role="alert"`。每次輸入都插入朗讀，反而會讓人無法輸入。只把送出時的摘要放在 `Modal.Alert`，焦點移到第一個錯誤欄位（B-09）。',
  },
  apiControl: 'render prop 的參數',
  apiAria: '輸入元件接收的關聯屬性（在 Field 之外命名時）',
  a11yCaption: '表單元件滿足的規格',
} satisfies typeof ja;
