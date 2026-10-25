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
  widget: {
    title: 'A chatbot in the bottom-right corner of the site',
    intro: 'ChatWidget places a round launcher button in the bottom-right corner of the screen, and pressing it opens a small window in the bottom-right. The small window is not modal, so you can chat while reading the page. A button in the header bar expands it into a side panel on the right (modal), and at phone widths it becomes a full-screen sheet. Inside, it uses the ChatThread and ChatComposer above as they are.',
    exampleTitle: 'AI assistant chatbot',
    exampleDescription: 'Press the button, and the launcher and a greeting appear in the bottom-right corner of this page. Press the launcher and choose a suggestion, and the answer streams in as it is written. “Expand to the side” and “Make smaller” are on the right of the header bar.',
    tableCaption: 'How the chatbot opens and closes',
    head: { when: 'When', then: 'What happens' },
    rows: [
      { when: 'The launcher is pressed', then: 'The small window opens in the bottom-right, and focus moves to the message input. The launcher’s name becomes “Close chat”' },
      { when: 'There are unread messages', then: 'Shows a count badge on the launcher, and its name becomes “Open chat 3 unread” (the badge is decoration)' },
      { when: 'Esc or “Close chat” is pressed', then: 'Closes, and returns focus to the launcher (it does not close when a list or menu inside has already handled Esc, or on Esc during IME composition)' },
      { when: '“Expand to the side” is pressed', then: 'Moves to a side panel on the right (modal). The page behind can no longer be used, and closing returns to the launcher' },
      { when: 'At phone widths', then: 'Becomes a full-screen sheet (in a small window, the message input and the on-screen keyboard would overlap)' },
      { when: 'With a greeting', then: 'Shown beside the launcher only while the chat is closed. Pressing it opens the chat, and × dismisses it (it does not interrupt the screen reader)' },
    ],
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
