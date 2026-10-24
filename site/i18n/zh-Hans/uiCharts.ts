import type ja from '../ja/uiCharts';

export default {
  lead: '能把销售额走势、各套餐的注册数、使用率这类数字直接画出来的图表。不增加依赖库，用 SVG 和 HTML 绘制，可以用按键逐个浏览数据点并播报数值。颜色跟随主题。',
  line: {
    title: '折线图与面积图',
    intro: '用于随时间变化的数字。可以通过图例显示或隐藏系列，将指针移到某个点上或用按键移到该点时，会一并显示该月的各项数值。',
    exampleTitle: '月度销售额与费用',
    exampleDescription: '用 area 填充线条下方。加上 table 后，可以用下方的“显示原始数据”打开表格。',
  },
  bar: {
    title: '柱状图',
    intro: '用于比较各个项目。可以选择把系列并排还是堆叠，负值会从 0 线向反方向延伸。',
    stackedTitle: '各套餐的新注册数',
    stackedDescription: '用 stacked 堆叠。只有离 0 最远的那一段，末端才会做成圆角。',
    horizontalTitle: '各功能的使用次数',
    horizontalDescription: '用 layout="horizontal" 画成横向的柱条。适合名称较长的项目。',
  },
  widgets: {
    title: '放在卡片里的小图表',
    intro: '放在仪表盘卡片里的 4 种：小型走势图（Sparkline）、计量表（Gauge）、环形图（DonutChart）、排名条（BarList）。',
    exampleTitle: '仪表盘的卡片',
    exampleDescription: '将指针移到环形图的某一段或图例上时，中间会显示它的数值和占比。计量表通过 role="meter" 让读屏读出数值。',
  },
  choose: {
    title: '如何选择',
    intro: '根据想展示什么来选择。拿不准时就用柱状图。长度比角度和面积读得更准确。',
    tableCaption: '如何选择图表',
    head: { chart: '组件', when: '适合的数字', avoid: '不适合的数字' },
    rows: [
      { chart: 'LineChart', when: '随时间变化的数字（销售额走势、用户数）', avoid: '顺序没有意义的项目' },
      { chart: 'LineChart（area）', when: '量的走势及其构成（stacked）', avoid: '超过 4 个系列的比较' },
      { chart: 'BarChart', when: '项目之间的比较、构成（stacked）、增减（负值）', avoid: '点很多的走势（如 90 天）' },
      { chart: 'DonutChart', when: '占整体的比例（最多 5 个项目）', avoid: '大小相近的项目之间的比较' },
      { chart: 'Sparkline', when: '附在表格或卡片旁的走势', avoid: '需要让人准确读出数值时' },
      { chart: 'BarList', when: '排名（浏览最多的页面、流量来源）', avoid: '随时间的变化' },
      { chart: 'Gauge', when: '有上限的单个量（使用率、达成率）', avoid: '没有上限的量' },
    ],
  },
  access: {
    title: '读屏与键盘',
    intro: '图表带有名称（label）和描述主要趋势的一句话（description）。Tab 只会停在其中一个数据点上，用方向键移到相邻的点时，会一并播报该项目和各系列的数值。工具提示只是在视觉上显示相同的数值，所以不会播报。',
    tableCaption: '图表的键盘操作',
    head: { key: '按键', action: '动作' },
    rows: [
      { key: 'Tab', action: '进入图表的数据点（上次停留的点，或第一个点）。再按一次移到下一个元素' },
      { key: '→ / ↓', action: '移到下一个点。到末端时停住' },
      { key: '← / ↑', action: '移到上一个点' },
      { key: 'Home / End', action: '移到第一个点、最后一个点' },
      { key: 'Enter / Space（图例）', action: '隐藏或重新显示系列。剩下的最后一个不会被隐藏' },
    ],
  },
  colors: {
    title: '颜色',
    intro: '系列从 --g-chart-1 开始依次着色。1 跟随强调色，2〜8 是色相彼此拉开的固定颜色，对表面都达到 3:1 以上。为了不只靠颜色传达系列，图例、工具提示和播报中都会附上名称。',
    listLabel: '系列的颜色',
  },
  codeCaption: '用法',
  code: "import { LineChart } from '@genelab/gassan';\n\nconst rows = [\n  { month: '1月', revenue: 1180000, cost: 820000 },\n  { month: '2月', revenue: 1240000, cost: 850000 },\n  { month: '3月', revenue: 1520000, cost: 900000 },\n];\n\n<LineChart\n  label=\"月度销售额与费用\"\n  description=\"销售额在 3 月最高\"\n  data={rows}\n  x=\"month\"\n  series={[\n    { key: 'revenue', label: '销售额' },\n    { key: 'cost', label: '费用' },\n  ]}\n  valueFormat={{ style: 'currency', currency: 'JPY' }}\n  area\n/>",
  a11yCaption: '图表的行为',
} satisfies typeof ja;
