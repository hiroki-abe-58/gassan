import type ja from '../ja/chart';

export default {
  lead: '图表的容器，本身不负责绘制。为你带来的图关联名称、趋势摘要和原始数据的展开。因为单独一个 canvas，对读屏来说信息量为零。',
  report: {
    title: '名称、摘要、原始数据',
    intro: 'label 和 summary 必填。图本身默认为 aria-hidden，摘要和原始数据是唯一的途径。',
    exampleTitle: '月度报告',
    exampleDescription: '展开“显示原始数据”，就能在表格中读到同样的数值。',
  },
  why: {
    title: '为什么不负责绘制',
    body: [
      '绘图库选择众多，最佳方案因用途而异。如果 gassan 自带一个，选定哪个的那一刻就辜负了其余的用户。所以图用 SVG、canvas 或任意库都可以。gassan 承担的，只是任何图都容易缺少的 3 样东西：“名称”“趋势的文字替代”“通往原始数据的途径”。',
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
