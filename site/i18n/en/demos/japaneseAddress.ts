import type ja from '../../ja/demos/japaneseAddress';

export default {
  label: 'Shipping address',
  tryLead: 'Postal codes to try (sample data)',
  tryCodes: ['100-0001 (東京)', '530-0001 (大阪)', '810-0001 (福岡)', '000-0000 (several candidates)', '000-0001 (not found)'],
  comments: {
    lookup: 'Returns address candidates for a postal code (7 digits). The sample looks them up in a local table (in practice, call your own server or an external API)',
    fields: 'Fills in only fields that are empty or still hold what it filled in earlier (values the user typed or the browser autofilled are never overwritten)',
  },
} satisfies typeof ja;
