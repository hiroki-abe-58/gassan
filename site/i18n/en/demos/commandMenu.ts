import type ja from '../../ja/demos/commandMenu';

export default {
  open: 'Open command palette',
  placeholder: 'Search pages and actions',
  pages: 'Pages',
  actions: 'Actions',
  home: 'Home',
  homeDescription: 'Dashboard and recent activity',
  members: 'Members',
  billing: 'Plan and billing',
  settings: 'Settings',
  settingsDescription: 'Profile, password and two-factor authentication',
  invite: 'Invite members',
  project: 'Create a project',
  export: 'Export data',
  exportDescription: 'Available on the Pro plan',
  ran: 'Selected “{0}”',
  comments: {
    hotkey: 'This site’s search already uses ⌘K, so the demo opens from a button (hotkey={false}). In an app, leave out hotkey and it opens with ⌘K / Ctrl+K',
  },
} satisfies typeof ja;
