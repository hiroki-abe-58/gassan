import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 为单个输入项、Modal.Fieldset 为一组选项，关联名称、帮助文字和错误信息。里面可以是 gassan 的输入部件，也可以是原生 input 或其他库的组件。',
  field: {
    title: '把关联集中到一处',
    intro: '用 render prop 传入 id 和 aria-*。gassan 的输入部件会把它原样展开接收。',
    exampleTitle: '邀请成员',
    exampleDescription: '留空直接按“邀请”，汇总信息会出现在一处，焦点移到第一个错误。',
  },
  parts: {
    title: 'gassan 的输入部件',
    tableCaption: '输入部件及其所在页面',
    head: { page: '页面', parts: '部件' },
    body: [
      '每个部件里面都是原生元素，只重绘了边框和标记。键盘操作、读屏播报、表单提交、手机上的专用 UI，都直接沿用浏览器自带的。只有原生不够用的下拉选择、组合框和日历，是按照 WAI-ARIA APG 的模式自己做的（I-01〜I-15）。',
      '目前还没有可多选的组合框和日期范围选择。需要时，同样用 Modal.Field 把其他库的组件包起来。模态框中的弹出层会因面板的 `transform` 导致 `position: fixed` 失效，所以要使用 popover API，或 portal 到 dialog 内部（C-12）。最小示例见 [docs/control-recipes.md](./docs/control-recipes.md)。',
    ],
  },
  errors: {
    title: '错误的呈现方式',
    callout:
      '不给单个错误加 `role="alert"`。每次输入都被播报打断，反而没法输入。只把提交时的汇总放在 `Modal.Alert` 中，并把焦点移到第一个出错的项目（B-09）。',
  },
  apiControl: 'render prop 的参数',
  apiAria: '输入部件接受的关联属性（在 Field 之外命名时）',
  a11yCaption: '表单部件满足的规范',
} satisfies typeof ja;
