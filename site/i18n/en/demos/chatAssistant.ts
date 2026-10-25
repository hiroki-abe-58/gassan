import type ja from '../../ja/demos/chatAssistant';

export default {
  label: 'Conversation with the AI assistant',
  me: 'You',
  bot: 'Assistant',
  greeting: 'What would you like to look into?',
  sales: 'Summarize last month’s revenue',
  salesDescription: 'Compared with the month before, including why it grew',
  churn: 'Why did churn go up?',
  churnDescription: 'Broken down by plan and period',
  mail: 'Write a notice to customers with unpaid invoices',
  mailDescription: 'Polite and short',
  answer:
    'Last month’s revenue was ¥21.4 million, up 8% from the month before. 60% of the increase came from the annual plan launched in October. 14 workspaces also upgraded from Pro to Max, so the number of seats has grown. On the other hand, the rate of moving from Free to Pro fell by 0.4 percentage points, so there is room to revisit the guidance given during the trial.',
  placeholder: 'Ask a question',
  note: 'AI answers can be wrong. Check important figures against the source data.',
  comments: {
    stream: 'The demo streams a fixed answer by adding a little at a time. In an app, extend content with each piece that arrives, and remove streaming once the answer is fully written',
  },
} satisfies typeof ja;
