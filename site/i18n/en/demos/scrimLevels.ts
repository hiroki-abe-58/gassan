import type ja from '../../ja/demos/scrimLevels';

export default {
  subtle: 'Non-destructive, short-lived confirmations',
  default: 'Default. Confirmation, input, viewing, flow',
  strong: 'Consent, destructive confirmations',
  immersive: 'Lightbox (explicit opt-in)',
} satisfies typeof ja;
