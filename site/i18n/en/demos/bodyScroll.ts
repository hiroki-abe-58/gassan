import type ja from '../../ja/demos/bodyScroll';

export default {
  open: 'View changelog',
  title: 'Changelog',
  bodyLabel: 'Changelog content',
  linkExpiry: 'Shared links can now have an expiry date',
  fasterSearch: 'Search is now twice as fast',
  darkBorders: 'Reworked the borders in the dark theme',
  notifyOff: 'Notifications are now off by default',
  workspaces: 'Workspaces can now be separated',
  legacyApi: 'Removed the old API',
  csvColumns: 'CSV export now lets you choose columns',
  shortcuts: 'Added keyboard shortcuts',
  imagePaste: 'Added support for pasting images',
  largeTables: 'Large tables now render faster',
  close: 'Close',
  comments: {
    scroll: 'Only this part scrolls. It has tabIndex and a name, so it can be read with a keyboard too (B-01 to B-03)',
  },
} satisfies typeof ja;
