import type ja from '../../ja/demos/chartScatter';

export default {
  label: 'Adoption and satisfaction by feature',
  description: 'Automation, added this quarter, has few users yet but the highest satisfaction. Notifications are widely used but score low.',
  adoption: 'Adoption',
  satisfaction: 'Satisfaction (out of 5)',
  users: 'Users',
  core: 'Core features',
  added: 'Added this quarter',
  features: {
    search: 'Search',
    sharing: 'Sharing',
    export: 'Export',
    notifications: 'Notifications',
    permissions: 'Permissions',
    automation: 'Automation',
    summary: 'AI summaries',
    integrations: 'Integrations',
  },
  comments: {
    size: 'Pass sizeLabel to draw each point’s size as the area of a bubble (a bubble chart)',
  },
} satisfies typeof ja;
