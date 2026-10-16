import type ja from '../ja/kinds';

export default {
  lead: '动手之前，先从中选出你要做的是哪一种。类型一旦确定，遮罩层、位置、关闭方式、底部按钮的顺序就由决策矩阵自动决定。',
  kinds: {
    title: '五种类型',
    intro: '如果同时符合多种，那其实是应该拆开的两个模态框。',
    tableCaption: '模态框的五种类型',
  },
  live: {
    title: '动手试试',
    intro: '每一个都是真实的 gassan。在设置为不可关闭的类型中按 Esc 或点击背景，面板会抖动并播报原因。',
    confirm: {
      title: 'confirm — 确认',
      description: '小巧，居中。按 Esc 或点击背景都能关闭。',
    },
    form: {
      title: 'form — 输入',
      description: '点击背景不会关闭。填写到一半时会挽留。',
    },
    view: {
      title: 'view — 浏览',
      description: '使用 immersive 遮罩层的灯箱。可以用方向键翻页。',
    },
    consent: {
      title: 'consent — 同意',
      description: '读完与同意都满足之前，primary 按不下去。一按就会返回原因。',
    },
    flow: {
      title: 'flow — 流程',
      description: '返回、当前位置、关闭三个插槽。',
    },
  },
  scrim: {
    title: '遮罩层',
    body: [
      '默认为黑色 32%、不加 blur。60〜80% 的黑色会扼杀背后的上下文，等于自己丢掉模态框唯一的优势。按意图划分的 4 级以及允许使用 blur 的条件，整理在[遮罩层](#/styles/scrim)页面。',
    ],
  },
  placement: {
    title: '位置',
    tableCaption: '位置的条件',
    callout:
      '`placement="auto"` 先用 JS（matchMedia）解析为 `center` 或 `sheet`，再交给 DOM。如果用 CSS 媒体查询来分支，每种位置的 `@starting-style` 就得维护两份，总有一份会烂掉。',
  },
  dismiss: {
    title: '能否关闭',
    intro: '○ 表示关闭，✕ 表示不关闭，△ 表示有条件（例如先确认未保存的内容）。',
    tableCaption: '各类型的关闭方式',
    mockTitle: '服务条款更新',
    mockNote: '此对话框暂时无法关闭',
    do: '即使设置为不可关闭，也要把 Esc 和点击背景当作“想关闭”的明确意思表示来接收。让面板抖动，并用 `role="status"` 播报原因（L-10）。',
    dont: '不要默默忽略。如果什么都没发生，用户会以为坏了。',
  },
  footer: {
    title: '底部按钮的顺序',
    intro: 'DOM 顺序 = 视觉顺序 = Tab 顺序 = 播报顺序。窄屏上也不反转。',
    orderTitle: '发布文章',
    cancel: '取消',
    draft: '保存草稿',
    publish: '发布',
    orderDo: '窄屏时按 DOM 顺序纵向堆叠。想把 primary 放在上面，就改 DOM 本身的顺序，而不是用 CSS。',
    orderDont:
      '不要用 `column-reverse` 或 `order` 只调换外观。Tab 与播报的顺序会和视觉相反（WCAG 1.3.2 / 2.4.3）。',
    dangerTitle: '删除项目',
    dangerCancel: '算了',
    dangerDelete: '删除',
    dangerDo: '破坏性操作的位置保持在平常 primary 的位置，只把颜色换成 danger（F-06）。',
    dangerDont: '不要同时改变颜色和位置。肌肉记忆会失灵，反而引发误操作。',
  },
  gates: {
    title: '激活门控的选择',
    intro: '可以制造“按不下去”状态的条件是有限的。禁止让用户按时间等待，也禁止只凭滚动位置来判定。',
    tableCaption: '可用于门控的条件',
    more: '[激活门控的用法 →](#/components/gate)',
  },
} satisfies typeof ja;
