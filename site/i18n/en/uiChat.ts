import type ja from '../ja/uiChat';

export default {
  lead: 'Components for chat between people as well as conversations with AI: a message list, a message input, a typing indicator and suggestions. While you read further up, they keep your place, and they do not mistake Enter during Japanese IME composition for sending.',
  team: {
    title: 'Team chat',
    intro: 'Your own messages go on the right in the accent color, and the other person’s messages go on the left. When the same person sends several messages in a row, the avatar and name are not repeated.',
    exampleTitle: 'Conversation with Olivia',
    exampleDescription: 'When you send a message, it changes from “Sending” to “Read”, and the reply arrives after the typing indicator. If it arrives while you are scrolled up, a “new messages” button lets you know.',
  },
  assistant: {
    title: 'Conversations with AI',
    intro: 'The AI’s answers are not put in speech bubbles; they are shown as body text across the full width. You can start from the suggestions, and you can stop an answer while it is being written.',
    exampleTitle: 'AI assistant',
    exampleDescription: 'Press a suggestion, and the answer streams in as it is written. While it is being written, the send button becomes “Stop”. The answer is read out once it has been fully written.',
  },
  behavior: {
    title: 'Rules that let you keep reading',
    intro: 'A chat keeps growing while you are in the middle of reading it. To protect the reader’s place and what gets read out, it behaves as follows.',
    tableCaption: 'Rules of the chat components',
    head: { when: 'When', then: 'What it does' },
    rows: [
      { when: 'A new message arrives', then: 'If you are at the bottom, it follows along. If you are reading further up, it does not move your place, and a “3 new messages” button lets you know' },
      { when: 'Earlier messages are loaded', then: 'Keeps the place you were reading (adding messages above does not move the line you are looking at)' },
      { when: 'Japanese text is being composed with an IME', then: 'Enter during composition commits the conversion and does not send' },
      { when: 'Typing on a touch device', then: 'Enter inserts a line break (on-screen keyboards have no Shift key). The send button sends, and the key hint is not shown' },
      { when: 'The AI is writing an answer', then: 'Sets aria-busy, and reads the answer out once it has been fully written. The send button becomes “Stop”' },
      { when: 'The other person is typing', then: 'Says so in words, as “Olivia is typing”, and places it outside the list (so it is not read out every time it appears or disappears)' },
    ],
  },
  access: {
    title: 'Screen readers and keyboard',
    intro: 'The list has role="log", and messages added to it are read out. Each message is an article named “name time”, and the time is a time element.',
    tableCaption: 'Chat components keyboard interaction',
    head: { key: 'Key', action: 'Action' },
    rows: [
      { key: 'Tab', action: 'Stops at the list → the message input → the send button, in that order. In the list, ↑↓ scroll it' },
      { key: 'Enter', action: 'Sends (empty text is not sent)' },
      { key: 'Shift+Enter', action: 'Starts a new line' },
      { key: 'Ctrl+Enter / ⌘+Enter', action: 'Sends when sendOn="mod+enter" (Enter starts a new line)' },
    ],
  },
  codeCaption: 'Usage',
  code: "import { ChatComposer, ChatThread } from '@genelab/gassan';\n\n<ChatThread\n  label=\"Conversation with Olivia\"\n  messages={messages}\n  currentUserId={me.id}\n  unreadFrom={firstUnreadId}\n  typing={typingUsers}\n/>\n<ChatComposer onSend={(text) => send(text)} placeholder=\"Type a message\" />",
  a11yCaption: 'How the chat components behave',
} satisfies typeof ja;
