import type ja from '../ja/layout';

export default {
  lead: '寬度由 token 決定，高度由 CSS Grid 與 dvh 決定。不用 JS 計算高度。會捲動的只有內文。',
  size: {
    title: '寬度的 token',
    intro: '面板寬度為 min(100%, token)。在窄螢幕上不會溢出，在寬螢幕上則維持易讀的行長。',
  },
  placement: {
    title: '配置',
    intro: 'placement="auto" 會先由 JS 解析為 center 或 sheet，再交給 DOM。',
    mockTitle: '路線',
    when: {
      center: '桌面版的預設',
      top: '內容高度變化很大時。置中的話，高度一變就會上下亂跳',
      sheet: '寬度未滿 600px 時的預設。能把 primary 放在單手搆得到的位置',
    },
  },
  grid: {
    title: '面板的格線',
    intro: '頁首、內文、頁尾三列。內文那一列若不是 minmax(0, 1fr)，內文就不會縮小，也不會捲動。',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* 不使用 100vh */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: '概念示意（實際規則在 src/styles.css）',
    mockTitle: '更新紀錄',
    mockClose: '關閉',
    do: '會捲動的只有內文。頁首與頁尾永遠可見（B-01 / H-10）。',
    mockCut: '標題被切到畫面上方之外',
    dont: '不要只用 `max-h-[90vh]` 或單獨的 `1fr` 了事。行動裝置的網址列會讓高度崩壞，置中時上緣還會被切掉。',
  },
  touch: {
    title: '可觸碰的大小',
    body: (tap: string): string =>
      `按鈕與圖示按鈕的觸控目標為 \`${tap}\`。WCAG 2.5.8 的最低要求是 24px，但我們採用 Apple HIG 的 44px。「返回」與「×」之間至少留 8px，因為這兩者按錯是代價最高的事故（H-03 / H-04）。`,
    callout: '安全區域一定要用 `max()` 包起來，避免在 `env(safe-area-inset-bottom)` 為 0 的裝置上留白消失（C-04 / F-12）。',
  },
  spec: {
    title: '容器的項目',
    tableCaption: '容器的規格',
  },
} satisfies typeof ja;
