import type ja from '../../ja/demos/scrollCustom';

export default {
  looks: { thin: 'Thin', standard: 'Default', thick: 'Thick, square corners', accent: 'Accent color' },
  items: ['Inbox', 'Drafts', 'Sent', 'Starred', 'Scheduled', 'Archive', 'Spam', 'Trash', 'Invoices', 'Hiring', 'External', 'Read later'],
  comments: {
    looks: 'Change the look with custom properties (set them on the container or anywhere outside it, and the bars inside follow)',
    always: 'Always shown here so the differences are visible',
  },
} satisfies typeof ja;
