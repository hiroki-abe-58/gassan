import type ja from '../../ja/demos/chartFeatures';

export default {
  label: 'Uses by feature (October)',
  dashboard: 'Dashboard',
  api: 'API calls',
  reports: 'Report exports',
  invites: 'Member invitations',
  invoices: 'Invoice downloads',
  uses: 'Uses',
  comments: {
    layout: 'Use horizontal bars when item names are long. A name that does not fit in its column is cut off with …, and the full text appears in the point’s announcement and the tooltip',
  },
} satisfies typeof ja;
