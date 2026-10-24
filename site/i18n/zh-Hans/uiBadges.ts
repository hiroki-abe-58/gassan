import type ja from '../ja/uiBadges';

export default {
  lead: '用简短的词表示状态或数量的徽标、代表人或组织的头像，以及按键的标记。它们都不只靠颜色传达，一定带有文字或名称。',
  badges: {
    title: '徽标',
    intro: '底色铺一层浅浅的色调颜色，文字用稍深一些的色调颜色，在浅色和深色下都达到 4.5:1 以上。圆点只是装饰，含义写在文字里。',
  },
  avatars: {
    title: '头像',
    intro: '名称就是读屏读出的名称，图片只是装饰。没有图片或图片无法加载时，显示首字母。底色由名称决定，所以同一个人总是同一种颜色。',
  },
  group: {
    title: '叠放排列',
    intro: '超出显示数量（max）的部分合并为“+N”，并播报为“另外 N 人”。',
    label: '负责人',
  },
  kbd: {
    title: '按键标记',
    intro: '用于提示快捷键。使用 kbd 元素，只把底边的线加粗一点，让它看起来像可以按的键。',
  },
  labels: {
    neutral: 'neutral（默认）',
    accent: 'accent',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    dot: '带圆点',
    initials: '首字母',
    japanese: '中文名字',
    square: '方形（组织）',
    sizes: '大小',
    group: 'max={3}',
    shortcut: '快捷键',
  },
  sample: {
    draft: '草稿',
    beta: 'Beta',
    paid: '已付款',
    review: '审核中',
    overdue: '已逾期',
    failed: '失败',
    online: '运行中',
    personEn: 'Mina Carter',
    personJa: '王芳',
    team: 'Acme Studio',
    search: '搜索',
    close: '关闭',
  },
  code: "import { Badge, Avatar, AvatarGroup, Kbd } from '@genelab/gassan';\n\n<Badge tone=\"success\" dot>已付款</Badge>\n\n<AvatarGroup label=\"负责人\" max={3}>\n  {members.map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}\n</AvatarGroup>\n\n<Kbd>⌘</Kbd> <Kbd>K</Kbd>",
  codeCaption: '用法',
  a11yCaption: '徽标与头像满足的规范',
} satisfies typeof ja;
