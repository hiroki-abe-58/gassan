import type ja from '../../ja/demos/chatTeam';

export default {
  label: 'Conversation with Olivia',
  me: 'James Miller',
  aoi: 'Olivia Chen',
  m1: 'I’ve shared the new version of the invoice template. You can use it starting this month.',
  m2: 'Thank you. I’ll switch over starting with tomorrow’s close.',
  m3: 'One more thing. Starting with November’s invoices, the payment due date moves to the end of the month.',
  m4: 'I’ll send the notice for customers shortly.',
  reply: 'Got it. Once the notice comes in, I’ll check it on my end too.',
  placeholder: 'Type a message',
  comments: {
    reply: 'The demo marks the sent message as read after a short wait, then adds the reply after the typing indicator. In an app, update them from the server’s notifications',
  },
} satisfies typeof ja;
