import type ja from '../ja/imperative';

export default {
  lead: '用声明式写法写确认对话框，open 的 state 和结果的传递会让代码行数膨胀。useModals().confirm() 以 Promise 返回结果。',
  confirm: {
    title: '用 await 接收',
    intro: '即使同时调用两个，也会一个接一个地显示。两个叠在一起，用户就不知道自己在回答哪一个。',
  },
  host: {
    title: '只放一个 ModalHost',
    body: ['没有渲染目标时，`confirm()` 的 Promise 永远不会解决。所以我们保证了 3 个出口（L-15）。'],
    exits: [
      '在没有宿主的情况下一直等待时给出警告。判定延后 1 个 tick（子组件的 effect 先于父组件运行，所以同步判定在正确的结构下也会误报）。',
      '存在 2 个以上宿主时给出警告。它们各自渲染同一个队列的队首，一次回答就会把全部解决掉。',
      '等待期间宿主消失时给出警告。如果默默吞掉，留下的只有“await 不返回”，无从追查原因。',
    ],
    callout:
      '确认内容简单时用命令式 API；需要门控或自定义正文时，用 `Modal.Root` 以声明式来写。传入 `consent`，就成为必须勾选同意的确认框。',
  },
  a11yCaption: '命令式 API 满足的规范',
} satisfies typeof ja;
