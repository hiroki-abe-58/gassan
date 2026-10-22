import type ja from '../ja/uiBadges';

export default {
  lead: 'Badges that show a status or a count in a word or two, avatars that put a face to a person or an organization, and keyboard keys. None of them relies on color alone; each always carries a word or a name.',
  badges: {
    title: 'Badges',
    intro: 'The background is a light wash of the tone’s color and the text a slightly deeper shade of it, reaching 4.5:1 or more in both light and dark. The dot is decoration; the meaning goes in the words.',
  },
  avatars: {
    title: 'Avatars',
    intro: 'The name becomes the accessible name, and the image is decoration. When there is no image, or it cannot be loaded, the initials are shown. The background color is derived from the name, so the same person always gets the same color.',
  },
  group: {
    title: 'Stacking',
    intro: 'Anything beyond the number shown (max) is gathered into “+N” and announced as “N more”.',
    label: 'Assignees',
  },
  kbd: {
    title: 'Keyboard keys',
    intro: 'For pointing out shortcuts. A kbd element with a slightly thicker line along the bottom only, so it looks like a key you can press.',
  },
  labels: {
    neutral: 'neutral (default)',
    accent: 'accent',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    dot: 'With a dot',
    initials: 'Initials',
    japanese: 'Japanese name',
    square: 'Square (organization)',
    sizes: 'Sizes',
    group: 'max={3}',
    shortcut: 'Shortcut',
  },
  sample: {
    draft: 'Draft',
    beta: 'Beta',
    paid: 'Paid',
    review: 'In review',
    overdue: 'Overdue',
    failed: 'Failed',
    online: 'Online',
    personEn: 'Mina Carter',
    // Kept in Japanese on purpose: a name that is not written in Latin letters shows its first character only.
    personJa: '佐藤 葵',
    team: 'Acme Studio',
    search: 'Search',
    close: 'Close',
  },
  code: "import { Badge, Avatar, AvatarGroup, Kbd } from '@genelab/gassan';\n\n<Badge tone=\"success\" dot>Paid</Badge>\n\n<AvatarGroup label=\"Assignees\" max={3}>\n  {members.map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}\n</AvatarGroup>\n\n<Kbd>⌘</Kbd> <Kbd>K</Kbd>",
  codeCaption: 'Usage',
  a11yCaption: 'Specification items badges and avatars satisfy',
} satisfies typeof ja;
