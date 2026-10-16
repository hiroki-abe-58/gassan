import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 只负责标签、帮助文字、错误信息的关联，不制作里面的输入控件。Chips、Switch、Table、Alert 只提供那些在模态框里常用、关联却容易出错的部件。',
  field: {
    title: '把关联集中到一处',
    intro: '用 render prop 传入 id 和 aria-*。里面可以是原生 input，也可以是其他库的组件。',
    exampleTitle: '邀请成员',
    exampleDescription: '留空直接按“邀请”，汇总信息会出现在一处，焦点移到第一个错误。',
  },
  delegate: {
    title: '不要自己造控件',
    tableCaption: '输入部件交给谁',
    head: { control: '部件', use: '怎么做' },
    rows: [
      { control: 'range / date / time / file / select', use: '把原生 input 直接用 Modal.Field 包起来' },
      { control: '单选、多选', use: '用 fieldset 和 legend 命名（而不是 label）' },
      { control: '带搜索的下拉选择、组合框、双滑块的滑杆', use: '交给 Base UI 等专门的库' },
    ],
    body: [
      '各自的最小示例在 [docs/control-recipes.md](./docs/control-recipes.md) 中。模态框中的弹出层会因面板的 `transform` 导致 `position: fixed` 失效，所以要使用 popover API，或 portal 到 dialog 内部（C-12）。',
    ],
  },
  errors: {
    title: '错误的呈现方式',
    callout:
      '不给单个错误加 `role="alert"`。每次输入都被播报打断，反而没法输入。只把提交时的汇总放在 `Modal.Alert` 中，并把焦点移到第一个出错的项目（B-09）。',
  },
  apiControl: 'render prop 的参数',
  a11yCaption: '表单部件满足的规范',
} satisfies typeof ja;
