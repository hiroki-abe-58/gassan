import type ja from '../ja/uiCommand';

export default {
  lead: '输入名称来查找页面和操作，并直接打开或执行的窗口。按 ⌘K（Windows 等系统上为 Ctrl+K）会在画面最上层打开，只用键盘就能选择。本站右上角的“搜索”也是用这个组件做的。',
  example: {
    title: '示例',
    intro: '页面和操作分组排列。除了名称，还能用“invoice”这样的别名查找，输入大写的“INVOICE”或全角的“ｉｎｖｏｉｃｅ”也一样能找到。不可用的操作显示为浅色，用按键移动时会跳过。',
    exampleTitle: '命令面板',
    exampleDescription: '用 ↑↓ 移动，按 Enter 选择。匹配的部分会加粗显示，并播报匹配的数量。',
  },
  matching: {
    title: '匹配与排序',
    intro: '输入的文字会与名称、说明和别名比对，比对时不区分全角与半角、大小写，日语的平假名与片假名也视为相同。排列顺序如下，同一级别的项目保持传入时的顺序。',
    tableCaption: '排列顺序',
    head: { rank: '顺序', rule: '匹配位置', typed: '输入的文字', hits: '匹配示例' },
    rows: [
      { rank: '1', rule: '名称的开头', typed: '成员', hits: '成员' },
      { rank: '2', rule: '名称的其他位置', typed: '数据', hits: '导出数据' },
      { rank: '3', rule: '说明与别名', typed: 'ｉｎｖｏｉｃｅ', hits: '套餐与账单（别名 invoice）' },
    ],
  },
  site: {
    title: '本站的搜索',
    intro: '右上角的“搜索”（⌘K / Ctrl+K）打开的窗口，就是这个组件本身。可以按名称查找所有页面，结果按栏目分组。页面地址中的英文（如“datepicker”“toast”）也能匹配。',
  },
  codeCaption: '用法',
  code: "import { CommandPalette } from '@genelab/gassan';\n\n// 按 ⌘K / Ctrl+K 打开。要自己控制打开和关闭时，传入 open 和 onOpenChange\n<CommandPalette\n  items={[\n    { id: 'members', group: '页面', label: '成员', href: '/members', keywords: ['members'] },\n    { id: 'invite', group: '操作', label: '邀请成员', shortcut: ['G', 'I'], onSelect: openInvite },\n  ]}\n/>",
  a11yCaption: '命令面板的行为',
} satisfies typeof ja;
