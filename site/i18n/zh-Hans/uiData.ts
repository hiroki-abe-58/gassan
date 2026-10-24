import type ja from '../ja/uiData';

export default {
  lead: '页面标题栏与数据表格。列表界面由“标题、操作、筛选、表格、分页”组成，表格本身就具备排序和行选择的功能。',
  example: {
    title: '组合示例',
    intro: '成员列表。在标题栏放一个主要操作，按姓名搜索，在表格中排序和选择。从行末的“…”打开详情后，会显示在从侧边滑出的面板（placement="end"）中，可以一边看列表一边确认。',
    exampleTitle: '成员',
    exampleDescription: '点击列标题即可排序，并会播报排序结果。选择行后，表格上方会出现已选数量和批量操作。',
  },
  pageHeader: {
    title: '页面标题栏',
    intro: '按路径、标题、说明、操作的顺序排列。不靠边框或底色，而是用标题的大小和留白来区分。容器变窄时，操作会移到标题下方。',
  },
  table: {
    title: '数据表格',
    intro: '直接用 table 元素绘制，以 caption 作为名称，带有列标题和行标题。数字和金额靠末端对齐，并让位数对齐。没有行时显示一句说明或空状态，加载中显示骨架屏。只有当表格比容器宽时，横向滚动表格的区域才能获得焦点。',
  },
  codeblock: {
    title: '代码块',
    intro: '用于展示 API 调用和配置的示例。顶部栏放置标题和复制按钮，代码不换行，而是横向滚动（代码的容器是 Tab 键的停留点，也能用方向键滚动）。组件本身不做语法高亮，可以把用 Shiki、Prism 等高亮后的元素通过 children 传入。复制的始终是原始字符串。本站的代码也是把高亮后的元素传给这个组件来绘制的。',
    exampleTitle: 'API 示例',
    exampleDescription: '用右上角的按钮复制后，图标会换成对勾，并播报“已复制”。',
  },
  labels: {
    full: '路径与操作',
    narrow: '窄容器',
    compact: '紧凑的行（compact）',
    loading: '加载中',
    empty: '没有行时',
  },
  sample: {
    settings: '设置',
    billing: '账单',
    billingDescription: '套餐、付款方式和账单。账单可以保存为 PDF。',
    download: '批量下载账单',
    changePlan: '更改套餐',
    invoices: '账单',
    number: '编号',
    date: '日期',
    amount: '金额',
    status: '状态',
    paid: '已付款',
    due: '未付款',
  },
  codeCaption: '用法',
  code: "import { DataTable, PageHeader, Button } from '@genelab/gassan';\n\n<PageHeader title=\"成员\" actions={<Button variant=\"primary\">邀请</Button>} />\n<DataTable\n  label=\"成员\"\n  rows={members}\n  getRowId={(m) => m.id}\n  columns={[\n    { key: 'name', header: '姓名', cell: (m) => m.name, sortValue: (m) => m.name },\n    { key: 'seats', header: '席位', cell: (m) => m.seats, sortValue: (m) => m.seats, align: 'end' },\n  ]}\n  selectable\n  bulkActions={(ids) => <Button onClick={() => remove(ids)}>移除</Button>}\n/>",
  a11yCaption: '页面标题栏与数据表格的行为',
} satisfies typeof ja;
