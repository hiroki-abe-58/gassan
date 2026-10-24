import type ja from '../ja/color';

export default {
  lead: '所有顏色都是 CSS 自訂屬性，並備有淺色與深色兩組。我們決定了哪一組承載哪種文字，並以測試計算其對比度。',
  tokens: {
    title: '顏色的 token',
    intro: '讀取自 src/styles.css 的 @layer gassan.tokens。深色欄位空白的項目，直接沿用淺色的值。',
    tableCaption: '顏色的 token',
    token: 'Token',
    light: '淺色',
    dark: '深色',
  },
  contrast: {
    title: '對比度',
    intro: '下表是根據開啟本頁當下的 token 計算的。tests/tokens.test.ts 使用相同的組合與相同的算法，一旦低於標準，CI 就會失敗。',
    tableCaption: { light: '淺色的對比度', dark: '深色的對比度' },
    sample: '樣本',
    pair: '組合',
    use: '用途',
    ratio: '比值',
    min: '標準',
    uses: {
      fg: '內文',
      'fg-muted': '補充文字、tertiary、門控中的 secondary',
      'on-accent': 'primary',
      'on-accent-muted': '門控中的 primary（G-10）',
      'on-danger': 'danger 按鈕（F-06）',
      danger: '錯誤訊息、必填標記',
      sunday: '日曆的週日與國定假日（I-16）',
      saturday: '日曆的週六（I-16）',
      focus: '焦點環（K-07。非文字為 3:1）',
    },
    pass: (min: number): string => `合格（${String(min)}:1 以上）`,
    fail: (min: number): string => `不足（未達 ${String(min)}:1）`,
    callout:
      '門控中的 primary（`--g-accent-muted`）過去搭配白字只有 3.16:1。註解寫著「維持 4.5:1」，追蹤表也宣稱「數值已檢查」，但實際上沒有任何人計算過比值。這是在本頁試著顯示比值時才發現的。',
  },
  gated: {
    title: '正因為無法按下，更必須讀得清楚',
    body: [
      '`disabled` 的元素不受 WCAG 對比度要求的約束。但 gassan 門控中的按鈕是 `aria-disabled`，可以取得焦點，按下會回報理由，是「可用」的按鈕，不能依賴這條豁免規定。因此我們以專用 token 維持 4.5:1，而不是用 `opacity` 調淡了事（G-10）。',
      '我們也決定不把背景用的 token 挪作文字顏色。在深色模式下，不存在一種顏色既能在承載淺色文字的背景上、又能作為深色表面上的文字，同時達到 4.5:1。',
    ],
  },
  theme: {
    title: '換成自己的顏色',
    intro: 'token 位於 @layer gassan.tokens 之內，只要從圖層外寫入，就能不顧權重直接覆寫。',
    code: ':root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* 先確認搭配白字達 4.5:1 以上 */\n  --g-radius: 20px;\n}',
  },
} satisfies typeof ja;
