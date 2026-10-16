import type ja from '../ja/purpose';

export default {
  lead: '模态框不是“显示信息的盒子”。偏离了这一点，做出来的东西看似像样，却每次都有哪里不对劲。',
  reasons: {
    title: '可以让操作分岔的理由只有 4 个',
    intro: '模态框会让用户停下手头的事。值得让人停下来的，只有下面 4 种场景。',
    tableCaption: '可以使用模态框的 4 个理由',
    body: [
      'NN/g 强烈批评滥用 overlay，却唯独为 lightbox 辩护，理由是它“不会让人失去上下文”。模态框胜过其他手段的，只有这一点：能让用户在**保持当前位置**的同时完成某件事。',
    ],
  },
  alternatives: {
    title: '不符合的话，就换别的容器',
    intro: '模态框不是“无处安放的 UI 的避难所”。',
    items: [
      {
        name: '页面',
        when: '内容是主角，且不打算再回来时',
        why: '有 URL，可以分享，也可以刷新。塞进模态框，就会失去深层链接和返回操作。',
      },
      {
        name: '就地展开（disclosure）',
        when: '想在当前位置稍微展示一点补充内容时',
        why: '不会让操作流程分岔。读完之后甚至不需要关闭。',
      },
      {
        name: '弹出框（popover）',
        when: '临时的选项或菜单',
        why: '不会让背景变为不可交互。即使点错了，点击外部就能若无其事地回去。',
      },
    ],
  },
  guidelines: {
    title: '适用场景示例',
    doTitle: '要移除这位成员吗',
    doCancel: '算了',
    doRemove: '移除',
    do: '确认不可撤销的操作。背后的列表仍然可见，所以不会忘记正要移除的是谁。',
    dontTitle: '设置',
    dontSave: '保存',
    dont: '不要把无处安放的设置界面塞进模态框。需要长时间停留的工作应做成页面：有 URL，返回按钮也有效。',
  },
} satisfies typeof ja;
