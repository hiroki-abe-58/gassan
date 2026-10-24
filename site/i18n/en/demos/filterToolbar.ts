import type ja from '../../ja/demos/filterToolbar';

export default {
  refresh: 'Refresh',
  refreshHint: 'Reload the list (last updated 3 minutes ago)',
  refreshed: 'Reloaded the list',
  share: 'Share',
  filter: 'Filter',
  filterCount: 'Filter ({0})',
  filterTitle: 'Filter view',
  unreadOnly: 'Unread only',
  assignedToMe: 'Assigned to me',
  sortLabel: 'Sort order',
  newest: 'Newest first',
  oldest: 'Oldest first',
  more: 'More actions',
  exportCsv: 'Export as CSV',
  print: 'Print',
  viewGroup: 'Density',
  compact: 'Compact',
  comfortable: 'Comfortable',
  archiveAll: 'Archive all',
  chose: 'Selected “{0}”',
  comments: {
    glyph: 'A 20×20 line-drawn icon. It is decoration, so aria-hidden',
    tooltip: 'When the hint matches the name, it is not read a second time as the description (“Share”)',
    menu: 'Shortcuts are only displayed. Binding the keys is up to your app',
  },
} satisfies typeof ja;
