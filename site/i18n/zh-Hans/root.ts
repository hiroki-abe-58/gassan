import type ja from '../ja/root';

export default {
  lead: '负责第 1〜3 层的容器。把 top layer、焦点、Esc 交给 <dialog> 和 showModal()，放置遮罩层、面板、实时播报区域，并把关闭请求连同原因汇集到同一条路径上。',
  playground: {
    title: '由 kind 决定的事',
    intro: '修改 kind、size、placement、scrim 后打开。设置为不可关闭时，按 Esc 或点击背景，面板会抖动并播报原因。',
    exampleTitle: 'Modal.Root 演练场',
  },
  reasons: {
    title: '关闭原因',
    intro: 'onOpenChange(false, reason) 必定带有原因。可以写出“只有按 Esc 关闭时才保存草稿”这样的分支。',
    tableLabel: '关闭原因一览',
    tableCaption: 'CloseReason 的 8 种',
    from: '来源',
    refuse: '可以拒绝的途径',
    rows: {
      esc: { from: 'Esc 键。必定拦下原生的 cancel，汇入这里', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: '按下遮罩层。仅当按下点和松开点都在遮罩层上时', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close，或 closeOnClick="close-button" 的按钮', refuse: 'onRequestClose' },
      'back-button': { from: 'closeOnBack 时的浏览器后退（只有最上层的一个响应）', refuse: 'onRequestClose' },
      submit: { from: 'closeOnClick="submit" 的按钮，或 <form method="dialog">', refuse: 'onRequestClose（经由按钮时）' },
      programmatic: { from: '外部调用了 dialog.close()', refuse: '—（已经关闭，只做收尾）' },
      swipe: { from: '底部面板的向下轻扫（swipeToDismiss）', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey 发生变化（Next.js 中传入 usePathname()）', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: '挽留',
    intro: 'onRequestClose 返回 false（或解析为 false 的 Promise）时不关闭。拒绝时不保持沉默，而是抖动并播报原因。',
    exampleTitle: '挽留填写到一半的表单',
    exampleDescription: '输入点内容后按 Esc 或 ×。会再叠一层确认框。',
  },
  mount: {
    title: '始终挂载与收尾',
    body: [
      '模态框始终渲染，用 `open` 控制开关。收到关闭请求后添加 `data-exiting` 绘制退出效果，等待 `--g-dur-out` 后再 `close()`。内容重置（`resetOnClose`）、焦点恢复、解除滚动锁定、`onExited`，全部在 `close()` 之后进行。',
    ],
    callout:
      '也可以嵌套（L-11）。为了不让内层的 Esc 或 Cmd/Ctrl + Enter 传到外层，事件只在“最近的 dialog 是自己时”才放行。叠两层时遮罩层的浓度仍是一层的量（L-12）。',
  },
  a11yBody: [
    '焦点约束、背景 inert 化、Esc、焦点恢复由 `showModal()` 完成。Root 自己负责的是：名称的关联、一个实时播报区域、初始焦点的位置、关闭路径的统一。',
  ],
  a11yCaption: 'Modal.Root 满足的规范',
} satisfies typeof ja;
