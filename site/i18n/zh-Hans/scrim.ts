import type ja from '../ja/scrim';

export default {
  lead: '遮罩层的任务是传达“背后暂时不能操作”，而不是把背后抹掉。默认为黑色 32%、不加 blur，并按意图从 4 级中选择。',
  levels: {
    title: '4 个级别',
    intro: '数值读取自 src/styles.css 中的令牌。',
    mockTitle: '要删除草稿吗',
    mockDelete: '删除',
    tableCaption: '遮罩层的令牌与使用场景',
  },
  try: {
    title: '打开比较',
    exampleTitle: 'scrim 的 4 个级别',
    exampleDescription: '用各级遮罩层打开同一个面板。',
  },
  why: {
    title: '为什么不是 60%',
    body: [
      '32% 与 Material Design 3 的 scrim 规定一致。60〜80% 的黑色会亲手抹掉背后的上下文——这正是模态框胜过其他手段的唯一之处。用户会搞不清正要删除的是谁、正在查看哪一行的详情。',
    ],
    mockTitle: '要删除这一行吗',
    mockDelete: '删除',
    do: '默认的 32%。背后的列表仍可阅读，所以不会忘记操作针对的是什么。',
    dont: '不要把黑色 60〜80% 设为默认。这等于丢掉了模态框唯一的长处——保持上下文（§5 第 9 条）。',
  },
  blur: {
    title: '什么时候可以用 blur',
    intro: 'blur 只能显式 opt-in（immersive），而且仅限于同时满足以下所有条件时。',
    body: [
      '去掉 blur 时的替代方案是“提高不透明度”。在 `prefers-reduced-transparency: reduce` 下，gassan 会自动去掉 blur，并相应加深浓度。如果只去掉模糊而保持 32%，对降低了透明度的人来说就什么也传达不了。',
    ],
  },
  dark: {
    title: '深色主题',
    intro: '黑色遮罩层在深色 UI 上不起作用。在深色背景上再叠一层深色的膜，也产生不了分隔。',
    mockTitle: '要保存设置吗',
    mockSave: '保存',
    do: '提亮表面，并画一条 1px 的边框来分隔（S-07）。',
    dont: '不要靠加深遮罩层来分隔。只会更暗，面板的轮廓并不会显现。',
  },
  spec: {
    title: '遮罩层的条目',
    tableCaption: '遮罩层的规范',
  },
} satisfies typeof ja;
