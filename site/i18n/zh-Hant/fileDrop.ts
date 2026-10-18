import type ja from '../ja/fileDrop';

export default {
  lead: 'FileDrop 是檔案的放置區。內部是把原生的 file input 撐滿整個放置區，無論點按、按 Enter / Space，或拖放都能選擇。',
  gallery: {
    title: '範例',
    intro: '選取的檔案會以名稱與大小的清單列出，並可逐一移除。',
    items: {
      single: '只選一個',
      multiple: '多個（僅限圖片）',
      disabled: '無法使用',
    },
  },
  modal: {
    title: '在模態視窗中',
    intro: '內部是原生的 input，所以 Modal.Field 的 label 會直接成為它的名稱。',
    exampleTitle: '提交文件',
    exampleDescription: '只接受 PDF 與圖片。拖放其他格式時，會以錯誤告知。',
  },
  reject: {
    title: '不符合的檔案',
    callout:
      '拖放進來的檔案不會經過原生的 `accept`。gassan 套用相同的規則（副檔名、`image/*` 這類萬用字元、類型），把不符合的檔案傳給 `onReject`。告知的方式交給 `Modal.Field` 的 `error`（I-14）。',
  },
  a11yCaption: '檔案放置區滿足的規格',
} satisfies typeof ja;
