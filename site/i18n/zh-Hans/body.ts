import type ja from '../ja/body';

export default {
  lead: '模态框中唯一的滚动区域。为了用键盘也能阅读，它可以获得焦点，并带有名称。读完门控也加在这里。',
  scroll: {
    title: '只有正文滚动',
    intro: '头部和底部固定。正文还没滚动到边缘时，上下会出现阴影。',
    exampleTitle: '更新记录',
    exampleDescription: '用 Tab 让正文获得焦点，就能用方向键、PageDown、Space 滚动。',
  },
  focusable: {
    title: '可获得焦点的滚动区域',
    body: [
      '除 Firefox 外，浏览器不会自动让可滚动元素获得焦点。不用鼠标的用户到达不了正文，也就无法阅读。gassan 的正文带有 `tabIndex={0}`、`role="group"` 以及可访问名称。不制造没有名称的可聚焦元素（B-02 / B-03）。',
    ],
    mockTitle: '更新记录',
    do: '能用 Tab 进入正文，用按键阅读。名称用 label 加上，例如“更新记录正文”。',
    dont: '不要只写一个 `<div className="overflow-y-auto">` 了事。对键盘用户来说，那是读不了的区域。',
  },
  readGate: {
    title: '读完门控',
    body: [
      '传入 `readGate="read"` 后，“是否已读完正文”会作为一个具名门控被注册。判定是“看到了末尾”“焦点到达了末尾”“本来就不需要滚动”的逻辑或，一旦满足就不再撤销。关闭期间尺寸为 0，所以不做判定（§10-1）。用法见[激活门控](#/components/gate)。',
    ],
  },
  a11yCaption: '正文满足的规范',
} satisfies typeof ja;
