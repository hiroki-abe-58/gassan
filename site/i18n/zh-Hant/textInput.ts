import type ja from '../ja/textInput';

export default {
  lead: 'Input、PasswordInput、SearchInput、Textarea、NumberField、CodeInput、TagInput、PasswordStrength。內部維持原生的 input 與 textarea，gassan 只加上外框，以及原生沒有的幾項小約定（切換顯示、清除、字數、增減、位數方格、標籤、強度）。',
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
  tags: {
    title: '標籤',
    intro: '以 Enter、逗號或頓號新增，以 × 或在空白的輸入欄位按 Backspace 移除（Backspace 會把最後一個標籤放回輸入欄位，所以不必刪除就能修改）。貼上的「業務, 開發, 招募」會分成 3 個，輸入法組字中的 Enter 不會新增標籤。',
    items: {
      plain: '新增與移除',
      suggestions: '附建議',
      limit: '最多 3 個',
    },
    samples: {
      design: '設計',
      billing: '帳單',
      placeholder: '輸入標籤後按 Enter',
      sales: '業務',
      engineering: '開發',
      support: '客服',
      hiring: '招募',
    },
  },
  strength: {
    title: '密碼強度',
    intro: '顯示分成 4 段的量表、表示強度的文字，以及各條件的標記與狀態。不會在每次輸入時朗讀，而是由輸入欄位的 aria-describedby 指向它，在焦點進入輸入欄位時讀出條件。',
    items: {
      live: '輸入看看',
      custom: '替換條件',
    },
    samples: {
      password: 'Gassan2026',
      passphrase: 'correct horse battery',
      longRule: '至少 15 個字元',
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
      { part: 'Modal.TagInput', adds: '標籤的新增與移除，以及相應的朗讀。負責處理分隔符號、貼上、輸入法組字中的 Enter 與 Backspace。傳入 name 時，會為每個標籤放一個 hidden 的 input' },
      { part: 'Modal.PasswordStrength', adds: '強度量表與條件清單。顏色與標記都附上文字，不會在每次輸入時朗讀' },
    ],
  },
  apiNote: 'PasswordInput 與 SearchInput 接受從 ModalInputProps 去掉 type、start、end 後的屬性，Textarea 則直接接受 textarea 的屬性。每一個的 ref 都會傳到內部的元素。',
  a11yCaption: '文字輸入滿足的規格',
} satisfies typeof ja;
