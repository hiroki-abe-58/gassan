import type ja from '../ja/layers';

export default {
  lead: '模态框的实现可以分为 4 层。把层混在一起，必然出问题。gassan 的设计全部源于这种划分。',
  model: {
    title: '各层及其正确做法',
  },
  effort: {
    title: '九成的精力，该用在哪里',
    callout:
      '许多模态框实现让人不满意，原因在于把九成精力花在第 1 层和第 2 层，只给第 4 层留了一成。第 1 层早已被解决。',
    body: [
      '只要调用 `showModal()`，提升到 top layer、背景 inert 化、焦点约束、Esc、焦点恢复都由浏览器完成。gassan 对此**一行都没有重新实现**。一旦重新实现，这个库存在的理由就消失了。',
      '腾出手来做第 4 层：名称的关联、滚动区域的名称、门控与原因的播报、关闭原因的分类、底部按钮的顺序。这些是库不会替你解决的、真正的设计工作。',
    ],
  },
  premise: {
    title: '前提已经变了',
    intro: 'AI 的训练数据里有大量 2022 年以前的模态框实现。在下面 3 点上，那些前提已经过时。',
    tableCaption: '旧有前提与当前前提',
  },
  core: {
    title: '实现的核心',
    intro: '能让退出动画成立的最小结构。以 CSS 为主，JS 只负责“等待之后再 close()”。',
    cssCaption: 'modal.skill.md §7（CSS）',
    tsxCaption: 'modal.skill.md §7（开关的同步）',
  },
} satisfies typeof ja;
