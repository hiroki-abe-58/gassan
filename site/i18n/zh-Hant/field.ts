import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 只負責標籤、說明文字與錯誤的關聯，不製作內部的輸入元件。Chips、Switch、Table、Alert 只涵蓋那些在模態視窗中常用、關聯卻容易出錯的元件。',
  field: {
    title: '把關聯集中在一處',
    intro: '透過 render prop 傳遞 id 與 aria-*。內部可以是原生的 input，也可以是其他函式庫的元件。',
    exampleTitle: '邀請成員',
    exampleDescription: '保持空白直接按「邀請」，錯誤摘要會集中顯示在一處，焦點則移到第一個錯誤。',
  },
  delegate: {
    title: '不要自製控制項',
    tableCaption: '輸入元件交給誰處理',
    head: { control: '元件', use: '處理方式' },
    rows: [
      { control: 'range / date / time / file / select', use: '直接用 Modal.Field 包住原生的 input' },
      { control: '單選按鈕、多選核取方塊', use: '用 fieldset 與 legend 命名（而不是 label）' },
      { control: '可搜尋的下拉選單、組合方塊、雙把手滑桿', use: '交給 Base UI 等專門的函式庫' },
    ],
    body: [
      '各自的最小範例在 [docs/control-recipes.md](./docs/control-recipes.md)。模態視窗中的彈出元件，會因面板的 `transform` 而讓 `position: fixed` 失效，所以請使用 popover API 或傳送到 dialog 內的 portal（C-12）。',
    ],
  },
  errors: {
    title: '錯誤的呈現方式',
    callout:
      '個別錯誤不加 `role="alert"`。每次輸入都插入朗讀，反而會讓人無法輸入。只把送出時的摘要放在 `Modal.Alert`，焦點移到第一個錯誤欄位（B-09）。',
  },
  apiControl: 'render prop 的參數',
  a11yCaption: '表單元件滿足的規格',
} satisfies typeof ja;
