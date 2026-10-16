import type ja from '../ja/header';

export default {
  lead: '頁首固定在 grid 的第 1 列。控制項是「返回、目前位置、關閉」三個插槽，與標題分屬不同的列。',
  slots: {
    title: '三個插槽',
    intro: 'start 放返回，center 放目前位置，end 放關閉。為了不讓中央因有無返回按鈕而偏移，格線採用 1fr auto 1fr。',
    exampleTitle: '訂購手續（3 個步驟）',
    exampleDescription: '按「下一步」前進後，左側會出現返回按鈕。中央的「1 / 3」位置不變。',
  },
  titleRow: {
    title: '標題不放在控制項那一列',
    mockTitle: '訂購手續 — 選擇付款方式',
    do: '控制項與標題分屬不同列。即使標題變長，也不會撞上返回與關閉（H-05）。',
    mockCrowded: '訂購手續 — 選擇付款方…',
    dont: '不要把標題夾在返回與關閉之間。長標題必然會互相干擾，按錯的距離也會縮短。',
  },
  indicator: {
    title: '朗讀目前位置',
    body: [
      '`Modal.Indicator` 的「2 / 3」是給眼睛看的，直接朗讀會變成「2 斜線 3」。視覺用的部分設為 `aria-hidden`，另外準備給朗讀用的「第 2 步，共 3 步」。步驟改變時發出通知（H-06）。',
      '只有圖示的按鈕會被賦予「返回」「關閉」的名稱（A-07）。文字可以透過 `GassanProvider` 替換。',
    ],
  },
  a11yCaption: '頁首與控制項滿足的規格',
} satisfies typeof ja;
