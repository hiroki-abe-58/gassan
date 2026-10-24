import { useState, type ReactNode } from 'react';

import { NotificationCenter, type NotificationEntry } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

export default function NotifyBell(): ReactNode {
  const t = useDemoText('notifyBell');
  const [items, setItems] = useState<NotificationEntry[]>(() => [
    { id: 'comment', title: t.comment, body: t.commentBody, time: minutesAgo(4) },
    { id: 'joined', title: t.joined, time: minutesAgo(95) },
    { id: 'invoice', title: t.invoice, body: t.invoiceBody, time: minutesAgo(26 * 60), read: true },
    { id: 'release', title: t.release, time: minutesAgo(4 * 24 * 60), read: true },
  ]);
  // t:read
  const markRead = (ids?: readonly string[]): void => setItems((list) => list.map((item) => (!ids || ids.includes(item.id) ? { ...item, read: true } : item)));
  return (
    <div className="s-notify-demo">
      <span className="s-notify-demo-brand">Atlas</span>
      <NotificationCenter items={items} onOpenItem={(id) => markRead([id])} onMarkAllRead={() => markRead()} />
    </div>
  );
}
