import type ja from '../../ja/demos/playground';

export default {
  kindDefault: 'kind 的默认值（{0}）',
  esc: '按 Esc 关闭',
  backdrop: '点击背景',
  closes: '关闭',
  refuses: '拒绝并播报原因',
  open: '用此设置打开',
  closedBy: '关闭原因：{0}',
  logEmpty: '记录是用 Esc、背景还是 × 关闭的',
  description: '试试 Esc、点击背景、× 按钮。设置为不可关闭时，面板会抖动并播报原因。',
  done: '完成',
  comments: {
    choice: '一行 select。用空字符串表示“kind 的默认值”。',
  },
} satisfies typeof ja;
