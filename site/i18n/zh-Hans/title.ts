import type ja from '../ja/title';

export default {
  lead: '对话框的名称与说明。名称自动关联到 h2 内部的 span，说明自动关联到 aria-describedby。省略只用 CSS 完成，名称不会残缺。',
  clamp: {
    title: '长标题',
    intro: '默认在 2 行处省略。只有溢出时才会出现“显示全文”的切换按钮。',
    exampleTitle: '长标题的省略',
    exampleDescription: '即使被省略，读屏软件读出的也是全文。',
  },
  why: {
    title: '为什么只用 CSS 省略',
    body: [
      '用 JS 截断字符串，DOM 中的文字本身就会残缺。`aria-labelledby` 指向的名称也一起残缺，读屏软件的用户会进入一个名叫“更改第三季度东北地区各门店销…”的对话框。`line-clamp` 只截断外观，名称始终完整保留。',
    ],
    mockLong: '更改第三季度东北地区各门店销售报告的共享设置',
    mockToggle: '显示全文',
    mockCut: '更改第三季度东北地区各门店销…',
    mockTooltip: '长按显示全文',
    do: '用一个点击即可展开的明确按钮显示全文。它带有 `aria-expanded` 和 `aria-controls`（T-08）。',
    dont: '不要依赖 hover、`title` 属性、长按。触摸时不会出现，还会和操作系统的上下文菜单冲突（T-05 / T-06）。',
  },
  a11yCaption: '标题与说明满足的规范',
} satisfies typeof ja;
