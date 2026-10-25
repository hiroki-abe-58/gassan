import type ja from '../../ja/demos/chatBot';

export default {
  show: 'Show the chatbot in the bottom-right corner',
  hide: 'Put the chatbot away',
  title: 'Atlas Assistant',
  description: 'AI answers your questions. We can also connect you with our team',
  greeting: 'Hi there. Ask me anything about pricing and plans',
  hello: 'How can I help you?',
  plans: 'What’s the difference between Pro and Max?',
  plansDescription: 'Compare usage and storage',
  invoice: 'I’d like to pay by invoice',
  invoiceDescription: 'About yearly billing and Enterprise',
  human: 'I’d like to talk to a person',
  humanDescription: 'Weekdays 10:00–18:00',
  placeholder: 'Type a message',
  me: 'You',
  bot: 'Assistant',
  answer:
    'Max is a plan with everything in Pro, plus 5× Pro’s usage limit and 1 TB of storage. It suits teams that use Atlas heavily almost every day. It costs ¥5,000 per user per month, and yearly billing gets you 2 months free. You can switch between Pro and Max at any time, and the difference is prorated by the day.',
  comments: {
    stream: 'Streams the answer a little at a time (in a real app, append each piece as it arrives from the server)',
    place: 'The launcher is fixed to the bottom-right corner of the screen. Pressing it opens a small window in the bottom-right, and the button in the header bar expands it into a panel on the right',
  },
} satisfies typeof ja;
