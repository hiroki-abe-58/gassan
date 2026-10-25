import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 為單一欄位、Modal.Fieldset 為選項群組，建立名稱、說明文字與錯誤的關聯。內部可以是 gassan 的輸入元件，也可以是原生的 input 或其他函式庫的元件。',
  field: {
    title: '把關聯集中在一處',
    intro: '透過 render prop 傳遞 id 與 aria-*。gassan 的輸入元件會直接展開接收。',
    exampleTitle: '邀請成員',
    exampleDescription: '保持空白直接按「邀請」，錯誤摘要會集中顯示在一處，焦點則移到第一個錯誤。',
  },
  floating: {
    title: '浮動標籤',
    intro:
      '以 labelPlacement="floating" 把標籤放進輸入欄位的外框內。有焦點或有值時，標籤會縮小並退到左上角，輸入的文字則進入下面一行。浮起還是靜止，由 CSS 根據輸入欄位的焦點與值來決定，所以無論是受控、非受控、初始值、表單重設、自動填入，還是輸入法（IME）組字中，都不會與顯示的值不符。',
    signInTitle: '登入的欄位',
    signInDescription:
      '點擊或按 Tab 取得焦點後，標籤會縮小到左上角，游標出現在它的下方。保持空白就移開焦點，標籤會回到中央；輸入後再移開，標籤則維持浮起。什麼都不輸入就按「繼續」，會顯示錯誤，並把焦點移回欄位。',
    statesTitle: '初始值、錯誤、無法使用的欄位',
    statesDescription:
      '有初始值的欄位，從首次渲染起就以浮起的樣子顯示。修正電子郵件地址後，錯誤就會消失。「還原為初始值」是表單的 reset，清空的欄位也會連同標籤一起恢復原狀。',
    modalTitle: '在模態視窗中',
    modalDescription: '同樣的指定也能傳給 Modal.Field。',
    notes: [
      '標籤仍是真正的 `<label>`，輸入欄位的名稱一律是標籤的文字。無論浮起還是靜止，名稱、說明（help 與 error）、必填（`aria-required`）的關聯都與標籤在上方時相同，動畫進行中也不會插入朗讀。',
      '能把標籤疊放在框內的，是前方沒有裝飾的 `Input` 與 `PasswordInput`（後方的單位或顯示切換都沒問題）。傳給前方有符號的 `Input`、`Select` 等時，會以標籤在上方的形式顯示。傳入佔位文字時，它只在標籤退開期間（有焦點且為空白時）看得到。',
      '移動的只有標籤的位置與大小，時長為 `--g-dur-fast`（依循動態效果的等級，在「減少動態效果」設定下不播放動畫）。文字衝過頭再彈回會難以閱讀，所以即使在 expressive 等級也不使用彈簧效果。',
    ],
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
