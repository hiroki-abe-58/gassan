import type ja from '../ja/uiCarousel';

export default {
  lead: '横向切换展示公告和客户案例的组件。用手指或触控板可以直接滑动切换，也可以用“上一个”“下一个”、圆点和自动播放来切换。自动播放时，停止按钮放在最前面，指针悬停在上面或焦点位于其中时会暂停。',
  news: {
    title: '公告（自动播放）',
    intro: '一次大幅显示一张。用 autoplay 每 6 秒切换一次，到最后一张后回到第一张。当前圆点上逐渐伸长的线条，表示切换到下一张之前的剩余时间。',
    exampleTitle: '公告轮播',
    exampleDescription: '用左上角的按钮可以停止自动播放。指针悬停在上面时和焦点位于其中时也会暂停，离开后从停下的地方继续计时。',
  },
  cases: {
    title: '客户案例（并排显示多张）',
    intro: '传入 minSlideWidth 后，会并排显示容器宽度所能容纳的张数。圆点的数量与可以排在最前面的位置数相同。',
    exampleTitle: '客户案例',
    exampleDescription: '缩窄画面宽度后，会变成一次一张。全部都能看到时，既不显示“上一个”“下一个”，也不显示圆点。',
  },
  rules: {
    title: '自动播放停止的情况',
    intro: '一直在动的内容，还没读完就会消失。按照 WCAG 2.2.2，提供了停止的方法，也规定了停止的场合。',
    tableCaption: '自动播放停止的情况',
    head: { when: '情况', then: '之后' },
    rows: [
      { when: '按下了停止按钮', then: '在按下开始按钮之前不再切换' },
      { when: '指针悬停在上面', then: '移开后，从停下的地方继续计时' },
      { when: '焦点位于其中', then: '焦点移出后，从停下的地方继续计时' },
      { when: '标签页被隐藏', then: '回来后，从停下的地方继续计时' },
      { when: '“减弱动态效果”设置', then: '以停止的状态开始（可以用开始按钮让它播放）' },
      { when: '最后一张幻灯片（loop={false}）', then: '在那里停止' },
    ],
  },
  access: {
    title: '读屏与键盘',
    intro: '轮播是带有名称和“轮播”这一角色说明的区域，幻灯片带有“第 1 项，共 5 项”（或 label）这样的名称。位置变化时会播报。自动切换期间不播报。',
    tableCaption: '轮播的键盘操作',
    head: { key: '按键', action: '动作' },
    rows: [
      { key: 'Tab', action: '依次停在停止按钮 → 幻灯片中的链接和按钮 → 上一个 → 当前圆点 → 下一个' },
      { key: 'Enter / Space（上一个、下一个）', action: '移到相邻的幻灯片。在两端时无法按下（使用 loop 时会转到另一端）' },
      { key: '← / →（圆点）', action: '移到相邻的圆点，并把对应的幻灯片放到最前面' },
      { key: 'Home / End（圆点）', action: '移到第一个圆点、最后一个圆点' },
    ],
  },
  codeCaption: '用法',
  code: "import { Carousel } from '@genelab/gassan';\n\n<Carousel\n  label=\"公告\"\n  autoplay\n  items={[\n    { id: 'dashboard', label: '全新仪表盘', content: <NewsSlide /> },\n    { id: 'invoices', label: '批量下载账单', content: <NewsSlide /> },\n  ]}\n/>",
  a11yCaption: '轮播的行为',
} satisfies typeof ja;
