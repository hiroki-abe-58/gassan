import type ja from '../ja/media';

export default {
  lead: '圖片、影片、音訊，以及橫向切換它們的圖庫。先預留比例空間以消除跳動，並且不自動播放。圖庫的本體是 scroll-snap，按鈕與按鍵只負責指定位置。',
  gallery: {
    title: '圖庫',
    intro: '前後按鈕、方向鍵、Home / End、手指捲動，不論用哪一種移動，都指向同一個位置。位置會被朗讀。',
    exampleTitle: '稜線習作',
    exampleDescription: '開啟後用 ← → 切換。標題中的「n / 5」由 onIndexChange 更新。',
  },
  media: {
    title: '媒體的預設',
    body: [
      '傳入 `ratio="16 / 9"`，在載入之前就先預留空間。因為載入後高度一變，模態視窗就會跳動（B-10）。比例要套用在內部的 `img` / `video` 上，而不是包含說明文字的 `figure`（§10-7）。',
      '影片與音訊不加 `autoplay`、加上 `controls`、設定 `preload="metadata"`。模態視窗一打開就發出聲音，會背離「希望你現在專注於此」的意圖（B-11）。',
    ],
    callout: '忘了替圖片傳入 `alt` 時，開發階段會發出警告。若是裝飾用途，請明確寫上 `alt=""`。',
  },
  notify: {
    title: '位置的通知',
    body: [
      '`onIndexChange` 只在使用者看到的位置改變時才觸發。光是掛載不會觸發。`items` 縮減導致位置被截短時，屬於「改變了」，所以會觸發（D-14）。若 `items[].id` 重複，會點名是哪個值並發出警告（D-13）。',
    ],
  },
  a11yCaption: '媒體與圖庫滿足的規格',
} satisfies typeof ja;
