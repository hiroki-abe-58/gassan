import type ja from '../ja/select';

export default {
  lead: 'Select 是連清單都由 gassan 繪製的下拉選單，Combobox 是可輸入文字篩選的下拉選單。清單以 popover 顯示在 top layer，所以不會被模態視窗的 transform 或內文的捲動裁切。',
  gallery: {
    title: '範例',
    intro: '箭頭放在外框留白的內側。原生的 select 即使加上 padding，也會把箭頭緊貼在最右端繪製。',
    items: {
      select: '下拉選單',
      placeholder: '未選取',
      combobox: '組合框',
      invalid: '錯誤',
      disabled: '無法使用',
    },
    samples: {
      sizeLabel: '尺寸',
      sizeS: '小（360px）',
      sizeM: '中（520px）',
      sizeL: '大（720px）',
      cityLabel: '城市',
      citySapporo: '札幌',
      cityTokyo: '東京',
      cityNagoya: '名古屋',
      cityOsaka: '大阪',
      cityFukuoka: '福岡',
    },
  },
  modal: {
    title: '在模態視窗中',
    intro: '清單開啟時按 Esc 只會關閉清單，不會關閉模態視窗。',
    exampleTitle: '選擇寄送地點',
    exampleDescription: '國家可以輸入文字篩選。比對時不分大小寫與全形半形。',
  },
  keys: {
    title: '鍵盤操作',
    tableCaption: 'Select 與 Combobox 的鍵盤操作',
    head: { key: '按鍵', select: 'Select', combobox: 'Combobox' },
    rows: [
      { key: '↓ / ↑', select: '開啟。已開啟時移到上一個或下一個', combobox: '開啟。已開啟時移到上一個或下一個' },
      { key: 'Home / End', select: '移到第一個或最後一個選項', combobox: '移到輸入欄位的開頭或結尾（維持原生行為）' },
      { key: '字元鍵', select: '跳到以該字元開頭的選項', combobox: '篩選，並指向第一個候選項' },
      { key: 'Enter', select: '確定並關閉', combobox: '確定目前指向的候選項（輸入法組字中不會確定）' },
      { key: 'Space', select: '確定並關閉（連續輸入字元搜尋的途中則當作字元）', combobox: '輸入空格' },
      { key: 'Tab', select: '確定目前指向的選項，並前往下一個', combobox: '完全符合時確定，否則還原後前往下一個' },
      { key: 'Esc', select: '只關閉清單', combobox: '只關閉清單' },
    ],
  },
  a11yCaption: '下拉選單與組合框滿足的規格',
} satisfies typeof ja;
