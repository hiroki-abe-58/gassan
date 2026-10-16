import type ja from '../ja/provider';

export default {
  lead: '函式庫輸出的字串，無一例外都經過這裡。預設為日文，並隨附 englishLabels。可以只指定一部分。',
  english: {
    title: '改成英文',
    intro: '從「關閉」「內文結束。」「第 2 步，共 5 步」到「需要同意」，連朗讀專用的文字也全部替換。',
    exampleDescription: '在閱讀之前按下按鈕，就會以英文朗讀理由。',
  },
  why: {
    title: '越少出現的文字，越容易被寫死',
    body: [
      '「註冊齊備之前的門控」的理由，過去是寫死的日文。即使加入了 `englishLabels`，只有那裡仍然顯示日文。越少出現的文字越容易被寫死，因此會一直殘留到最後（§10-21）。現在函式庫輸出的字串全都集中在這裡。',
    ],
    callout:
      '像步驟朗讀或檔位名稱這類要嵌入數字或名稱的文字，以函式傳入。語序因語言而異，所以不用字串串接來組合。',
  },
  a11yCaption: '與文字相關的規格',
} satisfies typeof ja;
