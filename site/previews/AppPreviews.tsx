import { useEffect, useRef, useState, type ReactNode } from 'react';

import {
  AppShell,
  AssistantPage,
  Badge,
  BillingPage,
  Button,
  ChatPage,
  CommandPalette,
  DescriptionList,
  IconButton,
  InviteAcceptPage,
  MailboxPage,
  MembersPage,
  ModalField,
  ModalInput,
  ModalTagInput,
  OnboardingPage,
  PageHeader,
  Progress,
  SettingsPage,
  toast,
  type AssistantThread,
  type BillingStatus,
  type ChatConversation,
  type ChatMessage,
  type CommandItem,
  type MailMessage,
  type MemberInvitation,
  type SettingsSession,
  type WorkspaceMember,
} from '@genelab/gassan';

import DashboardSample from '../demos/DashboardSample';
import { fmt, useDemoText, useT } from '../i18n';
import { USER_EMAIL, go, minutesAgo, preview, wait } from './shared';
import { ApiKeysContent, AuditLogContent, NotificationsContent } from './WorkspacePreviews';

/** アプリの枠の見本の案内の印（飾り）。 */
const ICON_PATHS = {
  home: 'M3.5 9.5 10 4l6.5 5.5M5.5 8v8h9V8',
  members: 'M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c0-2.5 2.2-4 5-4s5 1.5 5 4M13 4.2a2.5 2.5 0 0 1 0 4.6M14.5 12c1.8.4 3 1.6 3 4',
  chat: 'M4.5 4.5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-3.5 3v-3h-1a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
  mail: 'M3.5 5.5h13v9h-13v-9ZM3.75 6l6.25 4.75L16.25 6',
  inbox: 'M3.5 11.5h4l1 2h3l1-2h4M5.2 5.4 3.5 11.5V15A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-3.5l-1.7-6.1A1.5 1.5 0 0 0 13.4 4.3H6.6a1.5 1.5 0 0 0-1.4 1.1Z',
  starred: 'm10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L10 2.8Z',
  sent: 'M16.5 3.5 8.75 11.25M16.5 3.5l-4.75 13-3-5.25-5.25-3 13-4.75Z',
  archive: 'M3.5 4.5h13v3h-13v-3ZM4.5 7.5v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-7M8.5 10.5h3',
  trash: 'M4 6h12M8 6V4.5h4V6M5.75 6l.7 9.6a1 1 0 0 0 1 .9h5.1a1 1 0 0 0 1-.9l.7-9.6',
  assistant: 'M10 3.5l1.6 4.9 4.9 1.6-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6L10 3.5Z',
  billing: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h11A1.5 1.5 0 0 1 17 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 13.5v-7ZM3 8.5h14M6 12h3',
  settings: 'M3.5 6.5h6M13.5 6.5h3M11.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.5 13.5h2M9.5 13.5h7M7.5 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  key: 'M13 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM10.5 9.5l-7 7M5.5 14.5l1.75 1.75M7.75 12.25l1.5 1.5',
  audit: 'M7.5 3h5v2.5h-5V3ZM7.5 4.25h-2a1 1 0 0 0-1 1V16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5.25a1 1 0 0 0-1-1h-2M7.5 9.5h5M7.5 12.5h5',
  changelog: 'M6 4.5h8M6 8.5h8M6 12.5h5M3.5 4.5h.01M3.5 8.5h.01M3.5 12.5h.01',
  help: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM8 8a2 2 0 1 1 2.8 1.8c-.5.2-.8.7-.8 1.2v.5M10 14h.01',
  search: 'M8.75 14.5a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5ZM17 17l-4.1-4.1',
  bell: 'M5 13.5V9a5 5 0 0 1 10 0v4.5l1.5 1.5h-13L5 13.5ZM8.5 17h3',
} as const;

function NavIcon({ d }: { d: string }): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardContent(): ReactNode {
  const { app } = useT().templateSamples;
  return (
    <>
      <PageHeader
        title={app.home}
        description={app.dashboardDescription}
        actions={
          <Button variant="primary" onClick={() => toast.success(app.created)}>
            {app.newProject}
          </Button>
        }
      />
      <DashboardSample />
    </>
  );
}

/** メンバー（P-14）。名前はメンバーの表のデモと同じ人たちで、招待中の 1 人は招待の一覧にいる。 */
function MembersContent(): ReactNode {
  const t = useDemoText('memberTable');
  const roles = [
    { value: 'admin', label: t.admin },
    { value: 'editor', label: t.editor },
    { value: 'viewer', label: t.viewer },
  ];
  const [members, setMembers] = useState<WorkspaceMember[]>(() => [
    { id: 'm1', name: t.m1, email: USER_EMAIL, role: 'admin', lastActive: '2026-10-23T09:12:00+09:00' },
    { id: 'm2', name: t.m2, email: 'ren@example.com', role: 'editor', lastActive: '2026-10-21T18:30:00+09:00' },
    { id: 'm4', name: t.m4, email: 'minato@example.com', role: 'viewer', lastActive: '2026-09-30T10:00:00+09:00' },
    { id: 'm5', name: t.m5, email: 'yui@example.com', role: 'editor', status: 'suspended', lastActive: '2026-08-12T14:20:00+09:00' },
    { id: 'm6', name: t.m6, email: 'hiroto@example.com', role: 'viewer', lastActive: '2026-10-18T16:45:00+09:00' },
  ]);
  const [invitations, setInvitations] = useState<MemberInvitation[]>([{ id: 'hina@example.com', email: 'hina@example.com', role: 'editor', sentAt: '2026-10-22T10:00:00+09:00' }]);
  return (
    <MembersPage
      members={members}
      roles={roles}
      currentUserId="m1"
      seats={{ used: members.length + invitations.length, total: 10 }}
      invitations={invitations}
      onInvite={async ({ emails, role }) => {
        await wait(800);
        const sentAt = new Date();
        setInvitations((current) => [
          ...current.filter((invitation) => !emails.includes(invitation.email)),
          ...emails.map((email) => ({ id: email, email, role, sentAt })),
        ]);
      }}
      onRoleChange={async (id, role) => {
        await wait(400);
        setMembers((current) => current.map((member) => (member.id === id ? { ...member, role } : member)));
      }}
      onRemove={async (ids) => {
        await wait(600);
        setMembers((current) => current.filter((member) => !ids.includes(member.id)));
      }}
      onResend={() => wait(500)}
      onRevoke={async (id) => {
        await wait(500);
        setInvitations((current) => current.filter((invitation) => invitation.id !== id));
      }}
    />
  );
}

/** 料金と請求（P-15）。Pro を 6 席（1 席 ￥1,500）で使っている。解約すると、使える最後の日の表示に変わる。 */
function BillingContent(): ReactNode {
  const { templateSamples: s } = useT();
  const [status, setStatus] = useState<BillingStatus>('active');
  return (
    <BillingPage
      plan={{ name: s.pricing.pro.name, price: 9000, interval: 'month', status, periodEnd: '2026-11-01' }}
      usage={[
        { key: 'seats', label: s.app.seats, used: 6, limit: 10 },
        { key: 'storage', label: s.pricing.compare.storage, used: 82, limit: 100, format: (value) => `${String(value)} GB` },
        { key: 'requests', label: s.appPages.requests, used: 38200, limit: 100000 },
      ]}
      paymentMethod={{ brand: 'Visa', last4: '4242', expMonth: 4, expYear: 2028 }}
      onUpdatePayment={() => {
        toast(s.appPages.paymentHint);
      }}
      billingEmail="billing@example.com"
      invoices={[
        { id: '2026-10', number: 'INV-2026-010', date: '2026-10-01', amount: 9000, status: 'open', href: '#' },
        { id: '2026-09', number: 'INV-2026-009', date: '2026-09-01', amount: 9000, status: 'paid', href: '#' },
        { id: '2026-08', number: 'INV-2026-008', date: '2026-08-01', amount: 7500, status: 'paid', href: '#' },
      ]}
      onCancel={async () => {
        await wait(800);
        setStatus('canceled');
      }}
    />
  );
}

/** 設定（P-13）。送ると少し待って成功し、結果は節の下端で読み上げる。 */
function SettingsContent(): ReactNode {
  const { templateSamples: s } = useT();
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessions, setSessions] = useState<SettingsSession[]>(() => [
    { id: 'mac', device: 'MacBook Pro · Chrome', detail: s.appPages.tokyo, lastActive: '2026-10-23T09:12:00+09:00', current: true },
    { id: 'iphone', device: 'iPhone · Safari', detail: s.appPages.tokyo, lastActive: '2026-10-22T21:40:00+09:00' },
    { id: 'windows', device: 'Windows · Edge', detail: s.appPages.osaka, lastActive: '2026-10-15T08:05:00+09:00' },
  ]);
  return (
    <SettingsPage
      profile={{ name: s.app.user, email: USER_EMAIL, onSubmit: () => wait(700) }}
      password={{ onSubmit: () => wait(700) }}
      twoFactor={{
        enabled: twoFactor,
        onEnable: () => {
          toast(s.appPages.enableHint);
          setTwoFactor(true);
        },
        onDisable: async () => {
          await wait(600);
          setTwoFactor(false);
        },
      }}
      sessions={{
        items: sessions,
        onRevoke: async (id) => {
          await wait(500);
          setSessions((current) => current.filter((session) => session.id !== id));
        },
        onRevokeOthers: async () => {
          await wait(700);
          setSessions((current) => current.filter((session) => session.current));
        },
      }}
      deleteAccount={{
        confirmText: USER_EMAIL,
        onDelete: async () => {
          await wait(700);
          toast(s.appPages.deleteHint);
        },
      }}
    />
  );
}

/** 会話の最後のメッセージ（一覧に添える文と日時）。 */
const lastOf = (messages: readonly ChatMessage[]): { preview?: string; lastAt?: string } => {
  const last = messages[messages.length - 1];
  return last ? { preview: typeof last.content === 'string' ? last.content : undefined, lastAt: String(last.sentAt) } : {};
};

/**
 * チャット（P-18）。名前はメンバーの見本と同じ人たちで、ログインしているのは 1 人目。
 * 会話を開くと未読が消え、新着の線から読み始める。送ると「送信中」から「送信済み」に変わり、
 * 相手との会話では入力中の印のあとに返事が届く。
 */
function ChatContent(): ReactNode {
  const { templateSamples: s } = useT();
  const c = s.chat;
  const names = useDemoText('memberTable');
  const me = { id: 'm1', name: names.m1 };
  const ren = { id: 'm2', name: names.m2 };
  const hina = { id: 'm3', name: names.m3 };
  const minato = { id: 'm4', name: names.m4 };
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(() => ({
    general: [
      { id: 'g1', author: minato, content: c.general1, sentAt: minutesAgo(26 * 60) },
      { id: 'g2', author: me, content: c.general2, sentAt: minutesAgo(26 * 60 - 3), status: 'read' },
    ],
    design: [
      { id: 'd1', author: hina, content: c.design1, sentAt: minutesAgo(95) },
      { id: 'd2', author: ren, content: c.design2, sentAt: minutesAgo(40) },
      { id: 'd3', author: minato, content: c.design3, sentAt: minutesAgo(12) },
    ],
    release: [{ id: 'r1', author: ren, content: c.release1, sentAt: minutesAgo(3 * 24 * 60) }],
    ren: [
      { id: 'n1', author: ren, content: c.ren1, sentAt: minutesAgo(30) },
      { id: 'n2', author: ren, content: c.ren2, sentAt: minutesAgo(29) },
    ],
    hina: [{ id: 'h1', author: hina, content: c.hina1, sentAt: minutesAgo(2 * 24 * 60) }],
  }));
  const [unread, setUnread] = useState<Record<string, number>>({ design: 2, ren: 2 });
  const [unreadFrom, setUnreadFrom] = useState<string | undefined>();
  const [current, setCurrent] = useState('general');
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const directory: ChatConversation[] = [
    { id: 'general', name: 'general', description: c.generalDescription },
    { id: 'design', name: 'design', description: c.designDescription },
    { id: 'release', name: 'release', description: c.releaseDescription },
    { id: 'ren', name: ren.name, kind: 'direct', description: c.renRole },
    { id: 'hina', name: hina.name, kind: 'direct', description: c.hinaRole },
  ];
  const conversations = directory.map((conversation) => ({ ...conversation, ...lastOf(threads[conversation.id] ?? []), unread: unread[conversation.id] }));

  const open = (id: string): void => {
    const thread = threads[id] ?? [];
    const count = unread[id] ?? 0;
    setUnreadFrom(count > 0 ? thread[thread.length - count]?.id : undefined);
    setUnread((previous) => ({ ...previous, [id]: 0 }));
    setTyping(false);
    setCurrent(id);
  };

  const append = (id: string, message: ChatMessage): void => setThreads((previous) => ({ ...previous, [id]: [...(previous[id] ?? []), message] }));
  const send = (text: string): void => {
    const id = current;
    const messageId = `me-${String(Date.now())}`;
    append(id, { id: messageId, author: me, content: text, sentAt: new Date().toISOString(), status: 'sending' });
    const partner = id === 'ren' ? ren : id === 'hina' ? hina : null;
    timers.current.push(
      window.setTimeout(() => {
        setThreads((previous) => ({
          ...previous,
          [id]: (previous[id] ?? []).map((message) => (message.id === messageId ? { ...message, status: partner ? 'read' : 'sent' } : message)),
        }));
        if (partner) setTyping(true);
      }, 700),
    );
    if (partner) {
      timers.current.push(
        window.setTimeout(() => {
          setTyping(false);
          append(id, { id: `${partner.id}-${String(Date.now())}`, author: partner, content: c.reply, sentAt: new Date().toISOString() });
        }, 2400),
      );
    }
  };

  const partner = current === 'ren' ? ren : current === 'hina' ? hina : null;
  return (
    <ChatPage
      conversations={conversations}
      current={current}
      onConversationChange={open}
      messages={threads[current] ?? []}
      currentUserId={me.id}
      unreadFrom={unreadFrom}
      typing={typing && partner ? [partner] : []}
      onSend={send}
    />
  );
}

/**
 * AI アシスタント（P-19）。質問すると、決まった回答を少しずつ足して流しながら書く（書いている間は止められる）。
 * 履歴の会話を開くと、その時のやり取りを出す。「新しい会話」で質問の例の画面に戻る。
 */
function AssistantContent(): ReactNode {
  const { templateSamples: s } = useT();
  const a = s.assistant;
  const names = useDemoText('memberTable');
  const me = { id: 'm1', name: names.m1 };
  const bot = { id: 'bot', name: s.app.assistant, role: 'assistant' as const };
  const pair = (id: string, question: string, answer: string, minutes: number): ChatMessage[] => [
    { id: `${id}-q`, author: me, content: question, sentAt: minutesAgo(minutes) },
    { id: `${id}-a`, author: bot, content: answer, sentAt: minutesAgo(minutes - 1) },
  ];
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(() => ({
    h1: pair('h1', a.history1, a.history1Answer, 26 * 60),
    h2: pair('h2', a.history2, a.history2Answer, 4 * 24 * 60),
    h3: pair('h3', a.history3, a.history3Answer, 20 * 24 * 60),
  }));
  const [history, setHistory] = useState<AssistantThread[]>(() => [
    { id: 'h1', title: a.history1, updatedAt: minutesAgo(26 * 60) },
    { id: 'h2', title: a.history2, updatedAt: minutesAgo(4 * 24 * 60) },
    { id: 'h3', title: a.history3, updatedAt: minutesAgo(20 * 24 * 60) },
  ]);
  const [current, setCurrent] = useState<string | undefined>();
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
    setThreads((previous) =>
      Object.fromEntries(Object.entries(previous).map(([id, messages]) => [id, messages.map((message) => (message.streaming ? { ...message, streaming: false } : message))])),
    );
  };

  const ask = (text: string): void => {
    const id = current ?? `t-${String(Date.now())}`;
    const answerId = `${id}-${String(Date.now())}`;
    const sentAt = new Date().toISOString();
    if (!current) {
      setCurrent(id);
      setHistory((previous) => [{ id, title: text, updatedAt: sentAt }, ...previous]);
    }
    setThreads((previous) => ({
      ...previous,
      [id]: [
        ...(previous[id] ?? []),
        { id: `${answerId}-q`, author: me, content: text, sentAt },
        { id: answerId, author: bot, content: '', sentAt, streaming: true },
      ],
    }));
    setGenerating(true);
    let shown = 0;
    const answer = a.answer;
    timer.current = window.setInterval(() => {
      shown += 3;
      setThreads((previous) => ({
        ...previous,
        [id]: (previous[id] ?? []).map((message) => (message.id === answerId ? { ...message, content: answer.slice(0, shown) } : message)),
      }));
      if (shown >= answer.length) stop();
    }, 40);
  };

  return (
    <AssistantPage
      messages={current ? (threads[current] ?? []) : []}
      currentUserId={me.id}
      onSend={ask}
      generating={generating}
      onStop={stop}
      suggestions={[
        { id: 'sales', label: a.sales, description: a.salesDescription },
        { id: 'churn', label: a.churn, description: a.churnDescription },
        { id: 'mail', label: a.mail, description: a.mailDescription },
      ]}
      history={history}
      currentThreadId={current}
      onThreadChange={(id) => {
        stop();
        setCurrent(id);
      }}
      onNewThread={() => {
        stop();
        setCurrent(undefined);
      }}
    />
  );
}

type MailFolderId = 'inbox' | 'sent' | 'archive' | 'trash';

/** 本文の段落（見本の文は、空行で段落を分けてある）。 */
const paragraphs = (text: string): ReactNode => text.split('\n\n').map((part) => <p key={part}>{part}</p>);

/**
 * メール（P-20）。名前はメンバーの見本と同じ人たちで、ログインしているのは 1 人目。
 * 開くと既読になり、アーカイブ・削除はそのフォルダへ移す。スター付きは、ゴミ箱以外のスターの付いたメール。送ると送信済みに入る。
 */
function MailContent(): ReactNode {
  const { templateSamples: s } = useT();
  const t = s.mail;
  const names = useDemoText('memberTable');
  const me = { name: names.m1, email: USER_EMAIL };
  const ren = { name: names.m2, email: 'ren@example.com' };
  const hina = { name: names.m3, email: 'hina@example.com' };
  const minato = { name: names.m4, email: 'minato@example.com' };
  const [store, setStore] = useState<(MailMessage & { folder: MailFolderId })[]>(() => [
    {
      id: 'm1',
      folder: 'inbox',
      from: ren,
      to: [me],
      subject: t.m1Subject,
      snippet: t.m1Snippet,
      body: paragraphs(t.m1Body),
      receivedAt: minutesAgo(35),
      attachments: [{ name: 'invoice-2026-10.pdf', size: 186_000, href: '#' }],
    },
    { id: 'm2', folder: 'inbox', from: hina, to: [me], subject: t.m2Subject, snippet: t.m2Snippet, body: paragraphs(t.m2Body), receivedAt: minutesAgo(140) },
    {
      id: 'm3',
      folder: 'inbox',
      from: { name: t.newsName, email: 'news@atlas.example' },
      to: [me],
      subject: t.m3Subject,
      snippet: t.m3Snippet,
      body: paragraphs(t.m3Body),
      receivedAt: minutesAgo(26 * 60),
      read: true,
      starred: true,
    },
    { id: 'm4', folder: 'inbox', from: minato, to: [me, ren], subject: t.m4Subject, snippet: t.m4Snippet, body: paragraphs(t.m4Body), receivedAt: minutesAgo(3 * 24 * 60), read: true },
    {
      id: 'm5',
      folder: 'inbox',
      from: { name: t.billingName, email: 'billing@atlas.example' },
      to: [me],
      subject: t.m5Subject,
      snippet: t.m5Snippet,
      body: paragraphs(t.m5Body),
      receivedAt: minutesAgo(9 * 24 * 60),
      read: true,
      attachments: [{ name: 'receipt-2026-10.pdf', size: 92_000, href: '#' }],
    },
    { id: 's1', folder: 'sent', from: me, to: [ren], subject: t.s1Subject, snippet: t.s1Snippet, body: paragraphs(t.s1Body), receivedAt: minutesAgo(2 * 24 * 60), read: true },
  ]);
  const [folder, setFolder] = useState('inbox');
  const [current, setCurrent] = useState<string | undefined>();
  const unread = store.filter((message) => message.folder === 'inbox' && !message.read).length;
  const folders = [
    { id: 'inbox', label: t.inbox, icon: <NavIcon d={ICON_PATHS.inbox} />, unread: unread > 0 ? unread : undefined },
    { id: 'starred', label: t.starred, icon: <NavIcon d={ICON_PATHS.starred} /> },
    { id: 'sent', label: t.sent, icon: <NavIcon d={ICON_PATHS.sent} /> },
    { id: 'archive', label: t.archive, icon: <NavIcon d={ICON_PATHS.archive} /> },
    { id: 'trash', label: t.trash, icon: <NavIcon d={ICON_PATHS.trash} /> },
  ];
  const shown = folder === 'starred' ? store.filter((message) => message.starred && message.folder !== 'trash') : store.filter((message) => message.folder === folder);
  const update = (ids: readonly string[], change: Partial<MailMessage & { folder: MailFolderId }>): void =>
    setStore((list) => list.map((message) => (ids.includes(message.id) ? { ...message, ...change } : message)));
  const move = async (ids: string[], to: MailFolderId): Promise<void> => {
    await wait(300);
    update(ids, { folder: to });
    if (current !== undefined && ids.includes(current)) setCurrent(undefined);
  };
  return (
    <MailboxPage
      folders={folders}
      currentFolder={folder}
      onFolderChange={(id) => {
        setFolder(id);
        setCurrent(undefined);
      }}
      messages={shown}
      current={current}
      onOpen={(id) => {
        setCurrent(id);
        update([id], { read: true });
      }}
      onArchive={(ids) => move(ids, 'archive')}
      onDelete={(ids) => move(ids, 'trash')}
      onMarkRead={(ids, read) => update(ids, { read })}
      onStar={(id, starred) => update([id], { starred })}
      onSend={async ({ to, subject, body }) => {
        await wait(600);
        setStore((list) => [
          {
            id: `s-${String(Date.now())}`,
            folder: 'sent',
            from: me,
            to: to.map((email) => ({ email })),
            subject: subject.trim() || t.noSubject,
            snippet: body.slice(0, 80),
            body: paragraphs(body),
            receivedAt: new Date().toISOString(),
            read: true,
          },
          ...list,
        ]);
      }}
    />
  );
}

/** アプリの枠に入れる見本。 */
const APP_PAGES = {
  'app-dashboard': DashboardContent,
  'app-members': MembersContent,
  'app-chat': ChatContent,
  'app-mail': MailContent,
  'app-assistant': AssistantContent,
  'app-billing': BillingContent,
  'app-settings': SettingsContent,
  'app-api-keys': ApiKeysContent,
  'app-audit-log': AuditLogContent,
  'app-notifications': NotificationsContent,
} as const;

export type AppPreviewName = keyof typeof APP_PAGES;

/**
 * アプリの枠（P-12）に入れた見本。案内はほかの見本へつないであるので、ホーム・メンバー・請求・設定を行き来できる。
 * children を渡すと、page の中身の代わりに置く（案内で今いる所は page のまま。ログインし直す窓の見本が使う）。
 */
export function AtlasApp({ page, children }: { page: AppPreviewName; children?: ReactNode }): ReactNode {
  const { templateSamples: s } = useT();
  const app = s.app;
  const Content = APP_PAGES[page];
  const [searchOpen, setSearchOpen] = useState(false);
  // 案内の帯と、検索（コマンドパレット）のページの候補は、同じ一覧から作る
  const sections: { title?: string; items: { target: string; label: string; icon: string; badge?: ReactNode }[] }[] = [
    {
      items: [
        { target: 'app-dashboard', label: app.home, icon: ICON_PATHS.home },
        { target: 'app-members', label: app.members, icon: ICON_PATHS.members, badge: <Badge>6</Badge> },
        { target: 'app-chat', label: app.chat, icon: ICON_PATHS.chat },
        { target: 'app-mail', label: app.mail, icon: ICON_PATHS.mail },
        { target: 'app-assistant', label: app.assistant, icon: ICON_PATHS.assistant },
      ],
    },
    {
      title: app.workspace,
      items: [
        { target: 'app-billing', label: app.billing, icon: ICON_PATHS.billing },
        { target: 'app-settings', label: app.settings, icon: ICON_PATHS.settings },
        { target: 'app-api-keys', label: app.apiKeys, icon: ICON_PATHS.key },
        { target: 'app-audit-log', label: app.auditLog, icon: ICON_PATHS.audit },
      ],
    },
    {
      title: s.footer.support,
      items: [
        { target: 'changelog', label: app.changelog, icon: ICON_PATHS.changelog },
        { target: 'faq', label: app.help, icon: ICON_PATHS.help },
      ],
    },
  ];
  const commands: CommandItem[] = [
    ...sections.flatMap((section) =>
      section.items.map((item) => ({ id: item.target, group: app.pagesGroup, label: item.label, icon: <NavIcon d={item.icon} />, href: preview(item.target) })),
    ),
    { id: 'new-project', group: app.actionsGroup, label: app.newProject, shortcut: ['C'], onSelect: () => toast.success(app.created) },
    { id: 'sign-out', group: app.actionsGroup, label: app.signOut, href: preview('sign-out-confirm') },
  ];
  return (
    <AppShell
      current={preview(page)}
      nav={sections.map((section) => ({
        title: section.title,
        items: section.items.map((item) => ({ label: item.label, href: preview(item.target), icon: <NavIcon d={item.icon} />, badge: item.badge })),
      }))}
      actions={
        <>
          <IconButton label={app.search} aria-haspopup="dialog" onClick={() => setSearchOpen(true)}>
            <NavIcon d={ICON_PATHS.search} />
          </IconButton>
          <IconButton label={app.notifications} onClick={() => toast(app.noNotifications)}>
            <NavIcon d={ICON_PATHS.bell} />
          </IconButton>
        </>
      }
      account={{
        name: app.user,
        menu: [
          { value: 'profile', label: app.profile, href: preview('app-settings') },
          { value: 'notifications', label: app.notificationSettings, href: preview('app-notifications') },
          { value: 'billing', label: app.billing, href: preview('app-billing') },
          { type: 'separator' },
          { value: 'sign-out', label: app.signOut, href: preview('sign-out-confirm') },
        ],
      }}
      sidebarFooter={<Progress label={app.seats} value={6} max={10} valueText={(value, max) => fmt(app.seatsValue, String(value), String(max))} />}
    >
      {children ?? <Content />}
      {/* 上の帯の虫眼鏡か ⌘K / Ctrl+K で開く */}
      <CommandPalette items={commands} open={searchOpen} onOpenChange={setSearchOpen} placeholder={app.searchPlaceholder} />
    </AppShell>
  );
}

/** はじめの設定（P-16）。ワークスペースの名前を入れないと次へ進めない。始めるとアプリのホームへ移る。 */
export function OnboardingSample(): ReactNode {
  const s = useT().templateSamples.appPages.onboarding;
  const [workspace, setWorkspace] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  return (
    <OnboardingPage
      steps={[
        {
          id: 'workspace',
          title: s.workspaceTitle,
          description: s.workspaceDescription,
          content: (
            <ModalField label={s.workspaceName} required requiredBadge={false}>
              {(control) => <ModalInput {...control} value={workspace} onChange={(event) => setWorkspace(event.target.value)} />}
            </ModalField>
          ),
          validate: () => (workspace.trim() ? null : s.workspaceRequired),
        },
        {
          id: 'invite',
          title: s.inviteTitle,
          description: s.inviteDescription,
          optional: true,
          content: (
            <ModalField label={s.inviteEmails} help={s.inviteHelp}>
              {(control) => <ModalTagInput {...control} value={emails} onValueChange={setEmails} validate={(tag) => tag.includes('@')} />}
            </ModalField>
          ),
        },
        {
          id: 'done',
          title: s.doneTitle,
          description: s.doneDescription,
          content: (
            <DescriptionList
              items={[
                { key: 'workspace', term: s.summaryWorkspace, details: workspace.trim() },
                { key: 'invites', term: s.summaryInvites, details: emails.length > 0 ? emails.join(', ') : s.noInvites },
              ]}
            />
          ),
        },
      ]}
      onComplete={async () => {
        await wait(800);
        toast.success(s.started);
        go('app-dashboard');
      }}
    />
  );
}

/** 招待を受ける（P-17）。ログインしていない形と、期限切れの形も見せる。受けるとアプリのホームへ移る。 */
export function InviteSample({ variant }: { variant: 'pending' | 'signed-out' | 'expired' }): ReactNode {
  const { templateSamples: s } = useT();
  const t = useDemoText('memberTable');
  return (
    <InviteAcceptPage
      workspace={s.appPages.workspace}
      inviter={t.m1}
      role={t.editor}
      status={variant === 'expired' ? 'expired' : 'pending'}
      signedIn={variant !== 'signed-out'}
      onAccept={async () => {
        await wait(700);
        toast.success(fmt(s.appPages.joined, s.appPages.workspace));
        go('app-dashboard');
      }}
      onDecline={() => wait(500)}
    />
  );
}
