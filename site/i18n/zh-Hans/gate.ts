import type ja from '../ja/gate';

export default {
  lead: '不使用 disabled，做出“读到最后”“勾选之后”“选满 3 项”才能按下的按钮。一按，就播报还缺什么，并把用户带到那里。',
  consent: {
    title: '读完与同意',
    intro: 'Modal.Body 的 readGate 和 Modal.Consent 各自注册一个具名门控。带 gate 的按钮在全部满足之前都按不下去。',
    exampleTitle: '服务条款更新',
    exampleDescription: '在读完之前试着按“同意并继续”。会播报原因，并把正文向下滚动一屏。',
  },
  custom: {
    title: '任意条件',
    intro: '给 Modal.Gate 传入 satisfied 和 reason，任何条件都能成为门控。传入 focus 后，按下时会把用户带到那里。',
    exampleTitle: '至少选择 3 项',
  },
  selector: {
    title: '按钮看哪些门控',
    tableLabel: 'gate 的写法',
    tableCaption: 'gate 的写法与注册前的状态',
    head: { code: '写法', before: '注册前', meaning: '含义' },
    rows: [
      { code: 'gate / gate={true}', before: '关闭', meaning: '查看所有已注册的门控。注册完成之前为“还不知道”' },
      { code: "gate={['terms']}", before: '关闭', meaning: '按名称指定。未注册的名称按“未满足”处理' },
      { code: 'gate={[]}', before: '打开', meaning: '已确定没有任何条件，无需等待' },
    ],
    body: [
      '门控在子组件的 effect 中注册。服务端不会运行 effect，客户端在首次渲染时也还没有运行。在这段时间里注册表是空的，但这意味着“还不知道”，而不是“没有条件”。所以带 `gate` 的按钮在服务端输出的标记中也是 `aria-disabled="true"`，挂载后再切换为实际的条件。服务端与首次渲染一致，因此也不会出现 hydration 不匹配（G-12）。',
    ],
  },
  rules: {
    title: '不能作为门控的条件',
    callout:
      '不做“等 N 秒后才能按”（WCAG 2.2.1）。不只凭“滚动位置到达末尾”来判定（用虚拟光标的用户将永远无法继续）。可以制造“按不下去”状态的，只有表单的有效性、明确的同意、法律上要求的读完。',
    codeCaption: '按下时会发生什么',
    code: '// 1. 用 role="status" 的实时播报区域播报原因（G-07）\n// 2. 把用户带到卡住的位置（G-08）\n//    未读完时把正文向下滚动一屏。不一口气滚到末尾（否则门控就失去意义）\n//    未勾选时把焦点移到复选框\n// 3. 不调用 onClick',
  },
  a11yCaption: '激活门控的规范',
} satisfies typeof ja;
