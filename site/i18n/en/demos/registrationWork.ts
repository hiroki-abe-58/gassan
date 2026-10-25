import type ja from '../../ja/demos/registrationWork';

export default {
  kind: 'Business type',
  deposit: 'Deposits',
  securities: 'Securities',
  crypto: 'Crypto',
  remittance: 'Remittance',
  card: 'Cards',
  comments: {
    kind: 'The purpose options differ by business type (deposits use the Financial Services Agency’s categories)',
    fields: 'Occupation and purpose are not free text. Values are received as option keys',
  },
} satisfies typeof ja;
