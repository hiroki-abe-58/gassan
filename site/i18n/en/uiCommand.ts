import type ja from '../ja/uiCommand';

export default {
  lead: 'A window where you type a name to find a page or an action, then run it. ⌘K (Ctrl+K on Windows and other systems) opens it on top of the page, and you can choose with the keyboard alone. “Search” at the top right of this site is built from this component too.',
  example: {
    title: 'Example',
    intro: 'Pages and actions are listed in separate groups. Typing “MEM”, or even full-width “ｍｅｍ”, finds “Members”, and aliases such as “invoice” work too. Unavailable actions are shown dimmed and skipped when you move with the arrow keys.',
    exampleTitle: 'Command palette',
    exampleDescription: 'Move with ↑↓ and choose with Enter. The part that matches turns bold, and the number of matches is announced.',
  },
  matching: {
    title: 'Matching and ranking',
    intro: 'What you type is compared with the name, the description and the aliases. Matching ignores full-width/half-width differences and letter case, and treats Japanese hiragana and katakana as the same. Results are ranked as follows; items with the same rank keep the order they were passed in.',
    tableCaption: 'Ranking order',
    head: { rank: 'Rank', rule: 'Where it matches', typed: 'You type', hits: 'Example matches' },
    rows: [
      { rank: '1', rule: 'Start of the name', typed: 'MEM', hits: 'Members' },
      { rank: '2', rule: 'Elsewhere in the name', typed: 'data', hits: 'Export data' },
      { rank: '3', rule: 'Description and aliases', typed: 'invoice', hits: 'Plan and billing (alias: invoice)' },
    ],
  },
  site: {
    title: 'Search on this site',
    intro: 'The window that “Search” at the top right (⌘K / Ctrl+K) opens is this very component. It finds any page by name, grouped by section. Words from the page address, such as “datepicker” and “toast”, find pages too.',
  },
  codeCaption: 'Usage',
  code: "import { CommandPalette } from '@genelab/gassan';\n\n// Opens with ⌘K / Ctrl+K. To control opening and closing yourself, pass open and onOpenChange\n<CommandPalette\n  items={[\n    { id: 'members', group: 'Pages', label: 'Members', href: '/members', keywords: ['members'] },\n    { id: 'invite', group: 'Actions', label: 'Invite members', shortcut: ['G', 'I'], onSelect: openInvite },\n  ]}\n/>",
  a11yCaption: 'How the command palette behaves',
} satisfies typeof ja;
