import type ja from '../ja/uiChat';

export default {
  lead: '既可用于人与人之间的聊天，也可用于与 AI 对话的组件，包括消息列表、输入框、输入中提示和示例问题。向上翻看时不会移动阅读位置，也不会把日文输入法组字中的 Enter 误当成发送。',
  team: {
    title: '团队聊天',
    intro: '自己的消息以强调色显示在右侧，对方的消息显示在左侧。同一个人连续发送的消息，不会重复显示头像和名字。',
    exampleTitle: '与王芳的对话',
    exampleDescription: '发送后会从“发送中”变为“已读”，并在输入中提示之后收到回复。如果在向上滚动时收到消息，会用“新消息”按钮提示。',
  },
  assistant: {
    title: '与 AI 对话',
    intro: 'AI 的回答不放进气泡，而是作为正文以全宽显示。可以从示例问题开始，正在写回答时可以停止。',
    exampleTitle: 'AI 助手',
    exampleDescription: '按下示例问题后，回答会以流式方式边写边显示。写的过程中，发送按钮会变成“停止”。回答写完之后才会播报。',
  },
  behavior: {
    title: '让人能继续读下去的规则',
    intro: '聊天的内容会在阅读途中不断增加。为了守住读者的阅读位置和播报，组件的行为如下。',
    tableCaption: '聊天组件的规则',
    head: { when: '情况', then: '如何处理' },
    rows: [
      { when: '收到新消息', then: '如果正在看最底部，就跟着滚动。如果正在阅读上方的内容，就不移动位置，并用“3 条新消息”按钮提示' },
      { when: '加载了更早的消息', then: '保持原来的阅读位置（即使在上方添加消息，正在看的那一行也不会移动）' },
      { when: '正在用输入法输入日文', then: '组字中的 Enter 用于确认输入，不会发送' },
      { when: '在触屏设备上输入', then: 'Enter 用于换行（屏幕键盘没有 Shift 键）。用发送按钮发送，也不显示按键提示' },
      { when: 'AI 正在写回答', then: '设为 aria-busy，写完之后再播报。发送按钮会变成“停止”' },
      { when: '对方正在输入', then: '用文字传达“王芳 正在输入”，并放在消息列表之外（不会在每次出现或消失时播报）' },
    ],
  },
  access: {
    title: '读屏与键盘',
    intro: '消息列表是 role="log"，会播报新增的消息。每条消息是以“名字 时间”为名称的 article，时间使用 time 元素。',
    tableCaption: '聊天组件的键盘操作',
    head: { key: '按键', action: '动作' },
    rows: [
      { key: 'Tab', action: '依次停在消息列表 → 输入框 → 发送按钮。在消息列表中可以用 ↑↓ 滚动' },
      { key: 'Enter', action: '发送（空内容不发送）' },
      { key: 'Shift+Enter', action: '换行' },
      { key: 'Ctrl+Enter / ⌘+Enter', action: '在 sendOn="mod+enter" 时发送（Enter 换行）' },
    ],
  },
  codeCaption: '用法',
  code: "import { ChatComposer, ChatThread } from '@genelab/gassan';\n\n<ChatThread\n  label=\"与王芳的对话\"\n  messages={messages}\n  currentUserId={me.id}\n  unreadFrom={firstUnreadId}\n  typing={typingUsers}\n/>\n<ChatComposer onSend={(text) => send(text)} placeholder=\"输入消息\" />",
  a11yCaption: '聊天组件的行为',
} satisfies typeof ja;
