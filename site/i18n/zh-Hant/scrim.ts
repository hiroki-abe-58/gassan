import type ja from '../ja/scrim';

export default {
  lead: '遮罩的任務是傳達「後方現在無法操作」，而不是把後方抹去。預設為黑色 32%、不加 blur，並依意圖從 4 個等級中選擇。',
  levels: {
    title: '4 個等級',
    intro: '數值讀取自 src/styles.css 的 token。',
    mockTitle: '要刪除草稿嗎？',
    mockDelete: '刪除',
    tableCaption: '遮罩的 token 與使用情境',
  },
  try: {
    title: '開啟比較',
    exampleTitle: 'scrim 的 4 個等級',
    exampleDescription: '以各等級的遮罩開啟同一個面板。',
  },
  why: {
    title: '為什麼不是 60%',
    body: [
      '32% 與 Material Design 3 的 scrim 規範一致。60〜80% 的黑色會親手抹去後方的上下文——也就是模態視窗勝過其他手段的唯一一點。你會搞不清楚自己要刪除的是誰、正在看的是哪一列的詳細資訊。',
    ],
    mockTitle: '要刪除這一列嗎？',
    mockDelete: '刪除',
    do: '預設的 32%。後方的清單仍然可讀，所以不會忘記這是針對什麼的操作。',
    dont: '不要把黑色 60〜80% 設為預設。這等於丟掉模態視窗保留上下文這個唯一的優勢（§5 第 9 項）。',
  },
  blur: {
    title: '何時可以使用 blur',
    intro: 'blur 只限明確選用（immersive），而且必須同時滿足以下所有條件。',
    body: [
      '拿掉 blur 時的替代方案是「提高不透明度」。在 `prefers-reduced-transparency: reduce` 下，gassan 會自動移除 blur，並補上相應的濃度。如果只拿掉模糊卻維持 32%，對降低透明度的人來說什麼都傳達不到。',
    ],
  },
  dark: {
    title: '深色主題',
    intro: '黑色遮罩在深色 UI 上沒有作用。在深色背景上再疊一層深色的膜，也分不出層次。',
    mockTitle: '要儲存設定嗎？',
    mockSave: '儲存',
    do: '把表面調亮，並畫一條 1px 的邊框來區隔（S-07）。',
    dont: '不要試圖靠加深遮罩來區隔。只會更暗，面板的輪廓不會因此浮現。',
  },
  spec: {
    title: '遮罩的項目',
    tableCaption: '遮罩的規格',
  },
} satisfies typeof ja;
