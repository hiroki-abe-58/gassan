import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button, ChatComposer, ChatSuggestions, ChatThread, ChatWidget, ScrollArea, type ChatMessage } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChatBot(): ReactNode {
  const t = useDemoText('chatBot');
  const me = { id: 'me', name: t.me };
  const bot = { id: 'bot', name: t.bot, role: 'assistant' as const };
  const answer = t.answer;
  const [shown, setShown] = useState(false);
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
    let length = 0;
    // t:stream
    timer.current = window.setInterval(() => {
      length += 3;
      setMessages((list) => list.map((message) => (message.id === answerId ? { ...message, content: answer.slice(0, length) } : message)));
      if (length >= answer.length) stop();
    }, 40);
  };

  return (
    <div className="s-chatbot-demo">
      <Button variant="primary" onClick={() => setShown(!shown)}>
        {shown ? t.hide : t.show}
      </Button>
      {shown ? (
        // t:place
        <ChatWidget title={t.title} description={t.description} greeting={t.greeting}>
          {messages.length === 0 ? (
            <ScrollArea viewportClassName="s-chatbot-empty">
              <p className="s-chatbot-hello">{t.hello}</p>
              <ChatSuggestions
                items={[
                  { id: 'plans', label: t.plans, description: t.plansDescription },
                  { id: 'invoice', label: t.invoice, description: t.invoiceDescription },
                  { id: 'human', label: t.human, description: t.humanDescription },
                ]}
                onSelect={(item) => ask(item.label)}
              />
            </ScrollArea>
          ) : (
            <ChatThread label={t.title} messages={messages} currentUserId="me" />
          )}
          <ChatComposer onSend={ask} generating={generating} onStop={stop} placeholder={t.placeholder} />
        </ChatWidget>
      ) : null}
    </div>
  );
}
