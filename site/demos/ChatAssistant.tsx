import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ChatComposer, ChatSuggestions, ChatThread, Phrase, type ChatMessage } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChatAssistant(): ReactNode {
  const t = useDemoText('chatAssistant');
  const me = { id: 'me', name: t.me };
  const bot = { id: 'bot', name: t.bot, role: 'assistant' as const };
  const answer = t.answer;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generating, setGenerating] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  const stop = (): void => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setGenerating(false);
    setMessages((list) => list.map((message) => (message.streaming ? { ...message, streaming: false } : message)));
  };

  const ask = (text: string): void => {
    const sentAt = new Date().toISOString();
    const answerId = `bot-${String(Date.now())}`;
    setMessages((list) => [
      ...list,
      { id: `me-${String(Date.now())}`, author: me, content: text, sentAt },
      { id: answerId, author: bot, content: '', sentAt, streaming: true },
    ]);
    setGenerating(true);
    let shown = 0;
    // t:stream
    timer.current = window.setInterval(() => {
      shown += 3;
      setMessages((list) => list.map((message) => (message.id === answerId ? { ...message, content: answer.slice(0, shown) } : message)));
      if (shown >= answer.length) stop();
    }, 40);
  };

  return (
    <div className="s-chat-demo">
      {messages.length === 0 ? (
        <div className="s-chat-empty">
          <p className="s-chat-greeting">
            <Phrase>{t.greeting}</Phrase>
          </p>
          <ChatSuggestions
            items={[
              { id: 'sales', label: t.sales, description: t.salesDescription },
              { id: 'churn', label: t.churn, description: t.churnDescription },
              { id: 'mail', label: t.mail, description: t.mailDescription },
            ]}
            onSelect={(item) => ask(item.label)}
          />
        </div>
      ) : (
        <ChatThread label={t.label} messages={messages} currentUserId="me" />
      )}
      <div className="s-chat-demo-foot">
        <ChatComposer onSend={ask} generating={generating} onStop={stop} placeholder={t.placeholder} />
        <p className="s-chat-note">
          <Phrase>{t.note}</Phrase>
        </p>
      </div>
    </div>
  );
}
