import type ja from '../ja/textInput';

export default {
  lead: 'Input、PasswordInput、SearchInput、Textarea、NumberField、CodeInput。內部維持原生的 input 與 textarea，gassan 只加上外框，以及原生沒有的幾項小約定（切換顯示、清除、字數、增減、位數方格）。',
  gallery: {
    title: '範例',
    intro: '依狀態排列的真實元件。在模態視窗外也能使用相同的元件。變更右上角的主題，焦點環的顏色就會跟著改變。',
    items: {
      plain: '文字',
      adorned: '前後加上單位',
      password: '密碼',
      search: '搜尋',
      textarea: '附字數',
      number: '數值步進器',
      code: '驗證碼',
      invalid: '錯誤',
      disabled: '無法使用',
    },
    samples: {
      name: '王小明',
      price: '1200',
      yen: '¥',
      perMonth: '日圓 / 月',
      search: '尋找元件',
      bio: '在模態視窗中撰寫的自我介紹。',
      seats: '席',
      invalidValue: 'xiaoming@',
    },
  },
  modal: {
    title: '在模態視窗中',
    intro: '把 Modal.Field 的 render prop 傳入的關聯屬性，直接展開傳下去。',
    exampleTitle: '建立帳號',
    exampleDescription: '可以試試密碼的顯示切換、字數、席位數的增減與驗證碼。輸入 6 位數的驗證碼後，就能直接註冊。',
  },
  adds: {
    title: 'gassan 補上的部分',
    tableCaption: '各文字輸入元件的約定',
    head: { part: '元件', adds: '補上的部分' },
    rows: [
      { part: 'Modal.Input', adds: '外框與前後的裝飾（start / end）。ref 與 input 的屬性會原封不動傳到 input' },
      { part: 'Modal.PasswordInput', adds: '切換顯示。狀態以 aria-pressed 傳達，所以文案只要一個就夠' },
      { part: 'Modal.SearchInput', adds: '只在有值時出現的「清除」按鈕。清除後把焦點移回輸入欄位' },
      { part: 'Modal.Textarea', adds: '傳入 maxLength 時顯示「n / max」。作為說明讓人讀取，不會在每次輸入時插入朗讀。高度隨內容伸長' },
      { part: 'Modal.NumberField', adds: '− 與 +。到達範圍兩端時無法按下，並依 step 的位數取整。離開時若超出範圍，就拉回端點' },
      { part: 'Modal.CodeInput', adds: '位數方格。輸入欄位仍只有一個，所以簡訊自動填入與貼上都有效。也接受全形數字' },
    ],
  },
  apiNote: 'PasswordInput 與 SearchInput 接受從 ModalInputProps 去掉 type、start、end 後的屬性，Textarea 則直接接受 textarea 的屬性。每一個的 ref 都會傳到內部的元素。',
  a11yCaption: '文字輸入滿足的規格',
} satisfies typeof ja;
