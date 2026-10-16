import type ja from '../../ja/demos/kindConsent';

export default {
  open: 'Review the terms',
  agreed: 'Agreed',
  title: 'Updated terms of service',
  articleNumber: 'Article {0}',
  article1: 'The service does not provide data created by users to third parties without the user’s permission.',
  article2: 'Users can delete their account at any time. Deleted data can no longer be restored after 30 days.',
  article3: 'Price changes are announced at least 30 days before they take effect. Notices are sent to the registered email address.',
  article4: 'Damages caused by outages are compensated up to the fees for the most recent month.',
  article5: 'Changes to these terms take effect when the revised terms are posted on the service.',
  article6: 'Matters not covered by these terms are governed by the relevant laws and common practice.',
  consent: 'I agree to the updated terms',
  decline: 'Decline',
  accept: 'Agree and continue',
  comments: {
    noDismiss: 'consent closes with neither Esc nor the backdrop. Trying to close it shakes the panel and announces the reason',
    readGate: 'Read = “the end came into view” OR “focus reached the end” OR “no scrolling needed” (G-03)',
    gate: 'Never disabled. Pressing it announces what is missing and takes the user there (G-07 / G-08)',
  },
} satisfies typeof ja;
