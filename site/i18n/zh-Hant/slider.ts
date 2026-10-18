import type ja from '../ja/slider';

export default {
  lead: 'Slider 與 RangeSlider。內部是原生的 range，把手與填色以主題的強調色繪製。變更右上角的主題，本頁滑桿的顏色也會跟著改變。',
  gallery: {
    title: '範例',
    intro: '填色只到數值的位置為止。軌道往內縮一個把手半徑的距離，讓填色的末端與把手的中心對齊。',
    items: {
      slider: '滑桿',
      value: '在旁邊顯示數值',
      range: '雙把手',
      disabled: '無法使用',
    },
    samples: {
      volume: '音量',
      opacity: '不透明度',
      price: '價格區間',
      percent: '{0}%',
      yen: '¥{0}',
    },
  },
  modal: {
    title: '在模態視窗中',
    intro: '數值的表達方式（formatValue）同時用於旁邊的顯示與朗讀（aria-valuetext）。',
    exampleTitle: '搜尋條件',
    exampleDescription: '價格區間以兩個把手選擇，距離以一個把手選擇。使用鍵盤時，←→ 與 Home / End 皆有效。',
  },
  theme: {
    title: '跟隨主題',
    callout:
      '原生 range 的顏色屬於瀏覽器，在模態視窗中一直維持預設的藍色。即使加上 `accent-color`，淺色時額外加上的描邊與把手的形狀也因瀏覽器而異。gassan 重新繪製了把手與軌道，並把到數值為止的填色改為 `--g-accent` 的漸層。主題變更 `--g-accent` 時，把手與填色會一起改變（I-10）。',
  },
  a11yCaption: '滑桿滿足的規格',
} satisfies typeof ja;
