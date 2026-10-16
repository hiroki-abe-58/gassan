import type ja from '../ja/motion';

export default {
  lead: '进入和退出都只用 CSS 绘制，不使用 JS 动画库。JS 只负责“等退出效果显示完再 close()”。',
  durations: {
    title: '时长',
    intro: '退出要比进入快。人能等待“打开”，却等不了“关闭”。',
    in: '进入',
    out: '退出',
    replayClose: '关闭（120ms）',
    replayOpen: '打开（180ms）',
  },
  easing: {
    title: '缓动',
    in: '进入（减速后停下）',
    out: '退出（加速离开）',
  },
  exit: {
    title: '退出动画与 overlay',
    body: [
      '用 CSS 绘制退出效果的关键是 `transition-behavior: allow-discrete` 和 `overlay` 两者。但 `overlay` 还不是 Baseline。在不支持它的浏览器中，`close()` 的那一刻元素就会离开 top layer 并消失。',
      '因此 gassan 收到关闭请求后不调用 `close()`，而是添加 `data-exiting`，在 dialog 保持打开的状态下过渡到退出状态，等待 `--g-dur-out` 之后再 `close()`。等待时间读取自 CSS 令牌，JS 中不重复保存同一个数值（L-07）。',
    ],
  },
  reduced: {
    title: '减少动态效果的设置',
    callout:
      '在 `prefers-reduced-motion: reduce` 下，淡入淡出设为 1ms，而不是 0。设为 0 会破坏离散过渡（`display` 和 `overlay`）（S-05）。退出的等待时间也变为 0，但仍走同一套代码路径。',
    tableCaption: '动效的规范',
  },
} satisfies typeof ja;
