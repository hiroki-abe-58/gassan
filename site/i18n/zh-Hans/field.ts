import type ja from '../ja/field';

export default {
  lead: 'Modal.Field 为单个输入项、Modal.Fieldset 为一组选项，关联名称、帮助文字和错误信息。里面可以是 gassan 的输入部件，也可以是原生 input 或其他库的组件。',
  field: {
    title: '把关联集中到一处',
    intro: '用 render prop 传入 id 和 aria-*。gassan 的输入部件会把它原样展开接收。',
    exampleTitle: '邀请成员',
    exampleDescription: '留空直接按“邀请”，汇总信息会出现在一处，焦点移到第一个错误。',
  },
  floating: {
    title: '浮动标签',
    intro:
      '用 labelPlacement="floating" 把标签放进输入框的边框内。有焦点或有值时，标签缩小并退到左上角，输入的文字则进入下面一行。浮起还是静止，由 CSS 根据输入框的焦点和值来决定，所以无论是受控、非受控、初始值、表单重置、自动填充，还是输入法（IME）组字中，都不会与显示的值不符。',
    signInTitle: '登录的输入框',
    signInDescription:
      '点击或按 Tab 获得焦点后，标签缩小到左上角，光标出现在它下方。保持空白时移开焦点，标签回到中间；输入后再移开，标签保持浮起。什么都不输入就按“继续”，会显示错误，并把焦点移回输入框。',
    statesTitle: '初始值、错误、不可用的输入框',
    statesDescription:
      '有初始值的输入框，从首次渲染起就以浮起的样子显示。改正邮箱地址后，错误就会消失。“恢复初始值”是表单的 reset，被清空的输入框也会和标签一起恢复原样。',
    modalTitle: '在模态框中',
    modalDescription: '同样的指定也可以传给 Modal.Field。',
    notes: [
      '标签仍然是真正的 `<label>`，输入框的名称始终是标签的文字。无论浮起还是静止，名称、说明（help 和 error）、必填（`aria-required`）的关联都与标签在上方时相同，动画过程中也不会插入播报。',
      '能把标签叠放在框内的，是前面没有装饰的 `Input` 和 `PasswordInput`（后面带单位或显示切换都没问题）。传给前面带符号的 `Input`、`Select` 等时，会以标签在上方的形式显示。传入占位符时，它只在标签退开期间（有焦点且为空时）可见。',
      '动的只有标签的位置和大小，时长为 `--g-dur-fast`（遵循动效级别，在“减弱动态效果”设置下不播放动画）。文字冲过头再弹回会难以阅读，所以即使在 expressive 级别下也不用弹簧效果。',
    ],
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
