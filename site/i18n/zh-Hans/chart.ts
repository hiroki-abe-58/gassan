import type ja from '../ja/chart';

export default {
  lead: '图表的容器，用于你带来的图（任意库，或自己写的 SVG、canvas）。为图关联名称、趋势摘要和原始数据的展开。因为单独一个 canvas，对读屏来说信息量为零。要用 gassan 绘图，请使用 UI 部件中的“图表”（LineChart 等）。',
  report: {
    title: '名称、摘要、原始数据',
    intro: 'label 和 summary 必填。图本身默认为 aria-hidden，摘要和原始数据是唯一的途径。',
    exampleTitle: '月度报告',
    exampleDescription: '展开“显示原始数据”，就能在表格中读到同样的数值。',
  },
  why: {
    title: '与绘图部件的分工',
    body: [
      'gassan 绘制的图表（UI 部件中的“图表”）自带名称、摘要、原始数据表，以及用键盘遍历数据点的朗读。这个容器用于其他所有的图。有些图 gassan 不绘制，例如地图、网络图和 3D；有时你也想用熟悉的绘图库。图用 SVG、canvas 或任意库都可以。这个容器承担的，只是任何图都容易缺少的 3 样东西：“名称”“趋势的文字替代”“通往原始数据的途径”。',
      '如果图本身就是无障碍的（例如可以用键盘遍历），可以用 `visualAccessible` 去掉 `aria-hidden`。',
    ],
    mockTitle: '月度销售额（万元）',
    mockSummary: '3 月最高，为 120 万元。4 月以后基本持平。',
    mockDisclosure: '显示原始数据',
    do: '给图配上名称和趋势摘要，并能以表格展开原始数据。',
    dont: '不要只放一个 canvas 或 SVG。对看不见的人来说，就等于“什么都没有”。',
  },
  a11yCaption: 'Modal.Chart 满足的规范',
} satisfies typeof ja;
