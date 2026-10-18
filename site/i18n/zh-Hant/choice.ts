import type ja from '../ja/choice';

export default {
  lead: 'Checkbox、RadioGroup、Segmented、Rating，以及既有的 Switch、Chips。每一個的內部都是原生的 input 或 button，群組的名稱由 Modal.Fieldset 的 legend 提供。',
  gallery: {
    title: '範例',
    intro: '勾選記號與選中的區段，以主題的強調色填色。變更右上角的主題，會一起改變。',
    items: {
      checkbox: '核取方塊',
      mixed: '部分選取',
      radio: '單選按鈕',
      segmented: '分段控制項',
      rating: '評分',
      switch: '開關',
      chips: '標籤',
    },
    samples: {
      terms: '同意使用條款',
      termsNote: '同意後即可繼續',
      all: '所有通知',
      allNote: '已選取 3 項中的 1 項',
      planLabel: '方案',
      planFree: '免費',
      planFreeNote: '最多 3 人',
      planTeam: '團隊',
      planTeamNote: '最多 20 人，每月 1,200 日圓',
      viewLabel: '顯示方式',
      viewList: '清單',
      viewGrid: '圖塊',
      viewMap: '地圖',
      ratingLabel: '滿意度',
      switchLabel: '以電子郵件通知',
      chipsLabel: '感興趣的領域',
      chipDesign: '設計',
      chipA11y: '無障礙',
      chipPerf: '效能',
    },
  },
  modal: {
    title: '在模態視窗中',
    intro: '選項群組以 Modal.Fieldset 包住。legend 成為群組的名稱，說明文字與錯誤則成為群組的描述。',
    exampleTitle: '設定通知',
    exampleDescription: '只選取部分項目時，「全部」會顯示中間狀態的記號。單選按鈕與分段控制項可用方向鍵選擇。',
  },
  fieldset: {
    title: '群組使用 Fieldset',
    callout:
      '單一欄位以 `Modal.Field` 的 `<label>` 命名，選項群組則以 `Modal.Fieldset` 的 `<legend>` 命名。若用 `<label>` 包住群組，內部選項的標籤會與名稱混在一起。選項的補充說明放在 `<label>` 之外，以 `aria-describedby` 關聯。放在裡面的話，連補充說明都會被當成名稱朗讀（I-09）。',
  },
  a11yCaption: '選項元件滿足的規格',
} satisfies typeof ja;
