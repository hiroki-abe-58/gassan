import type ja from '../../ja/demos/chartWidgets';

export default {
  sales: 'Revenue',
  thisMonth: 'Revenue this month',
  vsLastMonth: 'from last month',
  daily: 'Revenue over the last 30 days',
  storage: 'Storage',
  storageUsed: 'Storage used',
  gb: '{0} GB / {1} GB',
  plans: 'Workspaces by plan',
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
  enterprise: 'Enterprise',
  workspaces: 'Workspaces',
  pages: 'Most viewed pages',
  comments: {
    dailyData: 'Sales for the last 30 days (yen)',
    sparkline: 'A sparkline has no axes and no interaction. It is read as a single image: its name, followed by the minimum, maximum and latest values',
    gauge: 'The limit is near, so it uses the warning color. The value is also read out through aria-valuetext',
  },
} satisfies typeof ja;
