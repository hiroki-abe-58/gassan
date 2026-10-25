import type ja from '../../ja/demos/registrationIdentity';

export default {
  regime: 'Industry (legal basis)',
  aml: 'Banks and brokers',
  telecom: 'Mobile',
  reuse: 'Buyback',
  matching: 'Matching',
  day: 'Date of verification',
  before: 'Until March 31, 2027',
  after: 'From April 1, 2027',
  comments: {
    regime: 'The applicable law decides which methods can be used',
    day: 'Given a date, methods no longer allowed on that day are left out (defaults to today)',
  },
} satisfies typeof ja;
