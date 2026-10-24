import type ja from '../../ja/demos/contextFiles';

export default {
  label: 'Files',
  quote: 'quote.pdf',
  contract: 'contract.docx',
  minutes: 'minutes.md',
  open: 'Open',
  rename: 'Rename',
  duplicate: 'Duplicate',
  delete: 'Delete',
  menuLabel: 'Actions for {0}',
  moreLabel: 'More actions for {0}',
  chosen: 'Chosen action: {0} ({1})',
  comments: {
    visible: 'Right-clicking is hard to discover with keys and touch, so the same actions go in the “…” menu too',
  },
} satisfies typeof ja;
