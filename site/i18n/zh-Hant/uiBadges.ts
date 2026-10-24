import type ja from '../ja/uiBadges';

export default {
  lead: '以簡短字詞表示狀態或數量的徽章、代表人或組織的頭像，以及按鍵的標示。它們都不只靠顏色傳達，一定帶有文字或名稱。',
  badges: {
    title: '徽章',
    intro: '底色鋪上淡淡的色調顏色，文字用稍深一些的色調顏色，在淺色與深色下都達到 4.5:1 以上。圓點只是裝飾，含義寫在文字裡。',
  },
  avatars: {
    title: '頭像',
    intro: '名稱就是朗讀的名稱，圖片只是裝飾。沒有圖片或圖片無法載入時，會顯示首字母。底色由名稱決定，所以同一個人永遠是同一種顏色。',
  },
  group: {
    title: '疊放排列',
    intro: '超出顯示數量（max）的部分會合併為「+N」，並朗讀為「另外 N 人」。',
    label: '負責人',
  },
  kbd: {
    title: '按鍵標示',
    intro: '用於提示快捷鍵。使用 kbd 元素，只把底邊的線加粗一點，讓它看起來像能按的鍵。',
  },
  labels: {
    neutral: 'neutral（預設）',
    accent: 'accent',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    dot: '附圓點',
    initials: '首字母',
    japanese: '中文名字',
    square: '方形（組織）',
    sizes: '大小',
    group: 'max={3}',
    shortcut: '快捷鍵',
  },
  sample: {
    draft: '草稿',
    beta: 'Beta',
    paid: '已付款',
    review: '審核中',
    overdue: '已逾期',
    failed: '失敗',
    online: '運作中',
    personEn: 'Mina Carter',
    personJa: '陳怡君',
    team: 'Acme Studio',
    search: '搜尋',
    close: '關閉',
  },
  code: "import { Badge, Avatar, AvatarGroup, Kbd } from '@genelab/gassan';\n\n<Badge tone=\"success\" dot>已付款</Badge>\n\n<AvatarGroup label=\"負責人\" max={3}>\n  {members.map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}\n</AvatarGroup>\n\n<Kbd>⌘</Kbd> <Kbd>K</Kbd>",
  codeCaption: '用法',
  a11yCaption: '徽章與頭像滿足的規格',
} satisfies typeof ja;
