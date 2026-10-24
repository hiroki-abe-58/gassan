import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ChatComposer, ChatThread, type ChatMessage } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const ago = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

export default function ChatTeam(): ReactNode {
  const t = useDemoText('chatTeam');
  const me = { id: 'me', name: t.me };
  const aoi = { id: 'aoi', name: t.aoi };
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'm1', author: aoi, content: t.m1, sentAt: ago(26 * 60) },
    { id: 'm2', author: me, content: t.m2, sentAt: ago(26 * 60 - 4), status: 'read' },
    { id: 'm3', author: aoi, content: t.m3, sentAt: ago(12) },
    { id: 'm4', author: aoi, content: t.m4, sentAt: ago(11) },
  ]);
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const send = (text: string): void => {
    const id = `me-${String(Date.now())}`;
    setMessages((list) => [...list, { id, author: me, content: text, sentAt: new Date().toISOString(), status: 'sending' }]);
    // t:reply
    timers.current.push(
      window.setTimeout(() => {
        setMessages((list) => list.map((message) => (message.id === id ? { ...message, status: 'read' } : message)));
        setTyping(true);
      }, 800),
      window.setTimeout(() => {
        setTyping(false);
        setMessages((list) => [...list, { id: `aoi-${String(Date.now())}`, author: aoi, content: t.reply, sentAt: new Date().toISOString() }]);
      }, 2600),
    );
  };

  return (
    <div className="s-chat-demo">
      <ChatThread label={t.label} messages={messages} currentUserId="me" unreadFrom="m3" typing={typing ? [aoi] : []} />
      <div className="s-chat-demo-foot">
        <ChatComposer onSend={send} placeholder={t.placeholder} />
      </div>
    </div>
  );
}
