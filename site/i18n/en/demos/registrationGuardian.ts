import type ja from '../../ja/demos/registrationGuardian';

export default {
  note: 'A contract a minor makes without consent from a parent or guardian can be rescinded (Civil Code, Article 5). These fields appear when the date of birth shows the person is under 18.',
  comments: {
    guardian: 'The parent or guardian’s name and email fields are set up so that the person’s own autofill doesn’t go into them',
    marketing: 'Consent to marketing emails is an optional checkbox, separate from agreeing to the terms. It starts unchecked',
  },
} satisfies typeof ja;
