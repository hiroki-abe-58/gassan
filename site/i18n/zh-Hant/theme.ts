import type ja from '../ja/theme';

export default {
  lead: '顯示模式（淺色、深色）、背景的著色與主色都能自由切換。無論選哪種顏色，都會推導出讓文字與填色不低於 WCAG 標準的色彩。',
  checksTable: {
    sample: '樣本',
    pair: '組合',
    ratio: '比值',
    min: '標準',
    pass: (min: number): string => `合格（${String(min)}:1 以上）`,
    fail: (min: number): string => `不足（未達 ${String(min)}:1）`,
  },
  controls: {
    title: '切換',
    intro: '這裡的設定與頁面上方的「主題」相同，會套用到整個網站與模態視窗的示範。',
  },
  now: {
    title: '目前的主題',
    intro: '由所選顏色推導出的 4 種強調色與 4 種背景色，以及使用它們的組合的對比度。此表依目前的設定計算。網站的文字在它可能所在的表面中，以比值最小的表面來量測。',
    tones: {
      accent: '強調色（填色、連結、焦點）',
      onAccent: '強調色上的文字',
      soft: '淡色表面',
      onSoft: '淡色表面上的文字',
      bg: '頁面背景',
      surface: '卡片的表面',
      surface1: '下沉一階的表面',
      modal: '模態視窗的表面',
    },
    tableCaption: '目前主題的對比度',
  },
  presets: {
    title: '所有預設集',
    intro: '種子色，以及淺色、深色各自實際使用的顏色。右側的數字是該主題中餘裕最小的組合的比值。背景的著色依目前的設定計算。',
    tableLabel: '預設集的驗證',
    tableCaption: '各預設集的顏色，以及最嚴格組合的比值',
    preset: '預設集',
    seed: '種子色',
    light: '淺色',
    dark: '深色',
    current: '使用中',
    pass: '全部合格',
    fail: '有不足',
    withTightest: (verdict: string, ratio: string, min: number): string =>
      `${verdict}・最低 ${ratio}:1（標準 ${String(min)}:1）`,
    body: [
      '測試中也以窮舉方式檢查相同的組合（`tests/theme.test.ts`）。除了預設集之外，對色相 24 個方向 × 明度 5 級 × 彩度 4 級的所有自訂顏色，確認背景的 3 個等級在淺色與深色的所有項目都符合標準、色相不會偏移，以及相鄰的預設集彼此可以區分。',
    ],
  },
  how: {
    title: '顏色的決定方式',
    rules: [
      {
        title: '保持色相，只調整明度',
        body: '把選定的顏色轉換到 OKLCH（接近人眼感知的色彩空間），在保持色相與彩度的前提下調整明度。若直接在 RGB 中調暗，色相會偏移，黃色看起來會像綠色或褐色。',
      },
      {
        title: '對所有表面都取得 4.5:1',
        body: '強調色也用於連結與選取中的文字，因此要持續調整，直到它對頁面背景、表面、下沉的表面、淡色表面全都達到 4.5:1。淺色往暗的方向、深色往亮的方向調整，並停在最接近種子色的明度。',
      },
      {
        title: '文字在淺色時為白色，深色時為暗色',
        body: '對表面取得 4.5:1 的顏色，在淺色模式下對白色文字、在深色模式下對比任何表面都暗的文字，必定也有 4.5:1 以上。填色按鈕的文字由計算保證。',
      },
      {
        title: '淡色表面的文字以 7:1 為目標',
        body: '像是選取中的導覽項目或選取文字的底色，這些地方承載較長的文字，因此目標不是 AA 而是 AAA。',
      },
      {
        title: '在背景中混入主色的色相',
        body: '「淡」不改變表面與線條的明度，只淡淡地混入色相。「濃」再增加彩度，在淺色時調暗、深色時調亮，讓頁面成為有顏色的表面。卡片與模態視窗的表面顏色較輕，浮在背景之上。文字會調整明度，直到在著色後的表面上也達到 4.5:1。表面越暗，強調色能達標的明度範圍就越窄，因此在「濃」時相鄰預設集的顏色會稍微靠近。',
      },
    ],
    callout: (yellowHue: number, limeHue: number): string =>
      `黃色、黃綠這類明亮的色相，為了在白色表面上取得 4.5:1，在淺色模式下會被調暗到芥末色或橄欖色。這是把可讀性放在選色自由之前的結果。在深色模式下則能維持原本的鮮豔度。由於「黃色」與「黃綠」之間還有「萊姆黃」，為了在淺色模式調暗後仍能與相鄰色區分，「黃綠」被拉開到色相 ${String(limeHue)}°。請用色相 ${String(yellowHue)}° 的「黃色」對照預設集的表格看看。`,
  },
  own: {
    title: '在自己的應用程式中換色',
    intro: 'gassan 模態視窗的顏色，只要覆寫 CSS 自訂屬性就能改變。從 @layer 之外寫入，就不必在意權重。',
    code: (accent: string, onAccent: string, tinted: string): string =>
      `:root {\n  --g-accent: ${accent};     /* primary 的填色、開關、選取中的 chip */\n  --g-on-accent: ${onAccent};  /* 其上的文字 */\n  --g-focus: ${accent};      /* 焦點環 */${tinted}\n}`,
    tintedComment: '背景的著色（表面、邊框、文字）',
    body: [
      '上面的值是由目前所選的主題推導出來的。自行決定顏色時，請用與本頁表格相同的組合（accent 與 on-accent，以及 accent 與 focus 對表面）確認比值。',
    ],
  },
} satisfies typeof ja;
