import type ja from '../ja/footer';

export default {
  lead: '底部按钮最多 3 个层级。按 DOM 顺序 = 视觉顺序 = Tab 顺序来写，从原理上杜绝重复提交。',
  hierarchy: {
    title: '按钮的层级',
    intro: 'primary、secondary、tertiary 各一个。按由弱到强的顺序写，只有第一个 tertiary 会向左分开。',
    exampleTitle: '发布文章',
    exampleDescription: '连续点击“发布”也只会执行一次。按 ⌘ / Ctrl + Enter 也能按下 primary。',
  },
  loading: {
    title: '处理中',
    body: [
      '`onAction` 返回 Promise 时，按钮在其解决之前处于处理中状态。期间的点击会被吞掉，因此从原理上不会发生重复提交。即使从外部传入 `loading`，也会与内部的处理中状态做**逻辑或**合并。因为 `loading={false}` 的意思是“就我这边而言不在处理中”，而不是“onAction 执行期间也可以让人按”（F-08）。',
      '处理中时，标签用 `opacity: 0` 隐藏，再叠上加载指示器。如果用 `visibility: hidden`，名称会一起消失，变成“没有名称的按钮”（F-07 / §10-4）。宽度也不会变化。',
    ],
    callout: '即使 `onAction` reject，处理中状态也一定会解除。不制造卡死在无法点击状态的按钮。',
  },
  danger: {
    title: '破坏性操作',
    mockTitle: '删除项目',
    mockCancel: '算了',
    mockDelete: '删除',
    do: '`variant="danger"` 保持在 primary 的位置，只改变颜色。',
    dont: '不要把初始焦点放在破坏性按钮上。按一次 Enter 就无法挽回（K-05）。',
  },
  a11yCaption: '底部与按钮满足的规范',
} satisfies typeof ja;
