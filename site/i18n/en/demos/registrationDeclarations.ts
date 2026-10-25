import type ja from '../../ja/demos/registrationDeclarations';

export default {
  note: 'The notifications and declarations asked before identity verification in industries that open accounts (banks, securities, crypto assets, money transfer and so on).',
  comments: {
    labels: 'Wording based on the law (the declaration and the description of its scope) also comes from the registration labels',
    tax: '“Japan only” takes a single press. Only people with other countries get fields for the country and taxpayer identification number',
    usPerson: 'Only people who answer “Yes” are asked for a U.S. taxpayer identification number and consent to the reporting',
    declaration: 'The long description of the scope goes in a details element that can be opened and closed',
  },
} satisfies typeof ja;
