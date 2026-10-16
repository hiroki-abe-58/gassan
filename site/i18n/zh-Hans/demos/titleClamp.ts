import type ja from '../../ja/demos/titleClamp';

export default {
  open: '长标题的模态框',
  title:
    '更改 2026 财年第三季度东北地区各门店销售报告（含速报值、同比、库存周转率、人工成本率）的共享设置',
  description: '只有溢出时才会出现“显示全文”。不依赖 hover、title 属性或长按。',
  submit: '更改',
  comments: {
    clamp: '省略只用 CSS 的 line-clamp。DOM 中的文字始终完整，所以名称不会残缺',
  },
} satisfies typeof ja;
