import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  ApiKeysPage,
  AuditLogPage,
  NotificationSettingsPage,
  type ApiKey,
  type AuditEvent,
  type AuditLogQuery,
} from '@genelab/gassan';

import { fmt, useDemoText, useT, type Messages } from '../i18n';
import { USER_EMAIL, minutesAgo, wait } from './shared';

const DAY = 24 * 60;

const daysFromNow = (days: number): string => minutesAgo(-days * DAY);

/** 見本のキー（16 進数）。作るたびに変わり、どこにも保存しない。 */
const randomHex = (length: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(length / 2)), (byte) => byte.toString(16).padStart(2, '0')).join('');

/** API キー（P-36）。作ると新しいキーを 1 度だけ見せ、表には見分けるための末尾だけを足す。 */
export function ApiKeysContent(): ReactNode {
  const a = useT().workspace.samples;
  const scopes = (['read', 'write', 'billing'] as const).map((value) => ({ value, ...a.scopes[value] }));
  const [keys, setKeys] = useState<ApiKey[]>(() => [
    { id: 'k1', name: a.keys.production, hint: 'atl_live_…4f2a', scopes: ['read', 'write'], createdAt: minutesAgo(146 * DAY), expiresAt: daysFromNow(219), lastUsedAt: minutesAgo(3) },
    { id: 'k2', name: a.keys.ci, hint: 'atl_test_…9c1e', scopes: ['read'], createdAt: minutesAgo(40 * DAY), expiresAt: daysFromNow(50), lastUsedAt: minutesAgo(2 * DAY + 95) },
    {
      id: 'k3',
      name: a.keys.analytics,
      hint: 'atl_live_…07bd',
      scopes: ['read', 'billing'],
      createdAt: minutesAgo(400 * DAY),
      expiresAt: minutesAgo(35 * DAY),
      lastUsedAt: minutesAgo(36 * DAY),
      expired: true,
    },
    { id: 'k4', name: a.keys.legacy, hint: 'atl_live_…c3e8', scopes: ['read'], createdAt: minutesAgo(700 * DAY), expiresAt: null, lastUsedAt: null },
  ]);
  return (
    <ApiKeysPage
      keys={keys}
      scopes={scopes}
      onCreate={async ({ name, scopes: chosen, expiresInDays }) => {
        await wait(700);
        const secret = `atl_live_${randomHex(32)}`;
        setKeys((current) => [
          {
            id: `k-${String(Date.now())}`,
            name,
            hint: `atl_live_…${secret.slice(-4)}`,
            scopes: chosen,
            createdAt: new Date().toISOString(),
            expiresAt: expiresInDays === null ? null : daysFromNow(expiresInDays),
            lastUsedAt: null,
          },
          ...current,
        ]);
        return { secret };
      }}
      onRevoke={async (id) => {
        await wait(600);
        setKeys((current) => current.filter((key) => key.id !== id));
      }}
    />
  );
}

const KINDS = ['signIn', 'signInFailed', 'invite', 'role', 'remove', 'keyCreate', 'keyRevoke', 'plan', 'settings', 'export'] as const;

type Kind = (typeof KINDS)[number];

type SampleEvent = AuditEvent & { kind: Kind };

const PAGE_SIZE = 10;

/** 監査ログの見本の記録（新しい順）。12 の型を回し、はじめの 10 件は 1 日のうちに、その先は半日ほどあけて 4 週間ほど前まで。 */
function auditEvents(a: Messages['workspace']['samples'], names: Messages['demos']['memberTable']): SampleEvent[] {
  const people = {
    aoi: { actor: names.m1, actorDetail: USER_EMAIL, ip: '203.0.113.24', location: a.locations.tokyo },
    ren: { actor: names.m2, actorDetail: 'ren@example.com', ip: '198.51.100.7', location: a.locations.osaka },
    minato: { actor: names.m4, actorDetail: 'minato@example.com', ip: '192.0.2.145', location: a.locations.fukuoka },
    hiroto: { actor: names.m6, actorDetail: 'hiroto@example.com', ip: '2001:db8::5f', location: a.locations.tokyo },
    key: { actor: a.keys.production, actorDetail: a.apiKey, ip: '198.51.100.200', location: a.locations.singapore },
    system: { actor: a.system },
  };
  const steps: [keyof typeof people, Kind, string?][] = [
    ['aoi', 'signIn'],
    ['key', 'export', a.exportTarget],
    ['aoi', 'keyCreate', a.keys.ci],
    ['ren', 'role', fmt(a.roleChange, names.m4)],
    ['minato', 'signInFailed'],
    ['aoi', 'invite', 'hina@example.com'],
    ['system', 'keyRevoke', 'atl_live_…a91f'],
    ['ren', 'signIn'],
    ['hiroto', 'settings', a.settingsTarget],
    ['aoi', 'plan', a.planChange],
    ['minato', 'signIn'],
    ['aoi', 'remove', 'kaito@example.com'],
  ];
  const events: SampleEvent[] = [];
  let minutes = 3;
  for (const [index, [person, kind, target]] of Array.from({ length: 6 }, () => steps).flat().entries()) {
    events.push({ id: `e${String(index + 1)}`, kind, time: minutesAgo(minutes), action: a.actions[kind], target, ...people[person] });
    minutes += index < 10 ? 20 + ((index * 37) % 90) : 300 + ((index * 137) % 600);
  }
  return events;
}

/** ブラウザの時間帯での日付（期間の絞り込みは、表と同じ時間帯の暦の日で比べる）。 */
const localDay = (time: AuditEvent['time']): string => {
  const date = new Date(time);
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const matches = (event: SampleEvent, query: AuditLogQuery): boolean => {
  const text = query.text.toLowerCase();
  if (text && ![event.actor, event.actorDetail, event.target, event.ip].some((field) => field?.toLowerCase().includes(text))) return false;
  if (query.action !== null && event.kind !== query.action) return false;
  if (query.range && (localDay(event.time) < query.range.start || localDay(event.time) > query.range.end)) return false;
  return true;
};

/** 監査ログ（P-37）。サーバーの代わりに見本の中で絞り込み、少し待ってから 1 ページ分を返す（待つ間は前のページのまま骨組みにする）。 */
export function AuditLogContent(): ReactNode {
  const a = useT().workspace.samples;
  const names = useDemoText('memberTable');
  const all = useMemo(() => auditEvents(a, names), [a, names]);
  const [query, setQuery] = useState<AuditLogQuery>({ text: '', action: null, range: null, page: 1 });
  // 表に出している結果の条件。条件が変わってから届くまでが読み込み中
  const [shown, setShown] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setShown(query), 400);
    return () => clearTimeout(timer);
  }, [query]);
  const matched = all.filter((event) => matches(event, shown));
  return (
    <AuditLogPage
      query={query}
      onQueryChange={setQuery}
      events={matched.slice((shown.page - 1) * PAGE_SIZE, shown.page * PAGE_SIZE)}
      total={matched.length}
      pageCount={Math.max(1, Math.ceil(matched.length / PAGE_SIZE))}
      loading={shown !== query}
      actions={KINDS.map((kind) => ({ value: kind, label: a.actions[kind] }))}
      onExport={() => wait(800)}
    />
  );
}

/** 通知の設定（P-38）。セキュリティと請求は止められない知らせで、週のまとめはメールだけ。 */
export function NotificationsContent(): ReactNode {
  const t = useT().workspace.samples.topics;
  return (
    <NotificationSettingsPage
      topics={[
        { id: 'comments', ...t.comments },
        { id: 'invites', ...t.invites },
        { id: 'projects', ...t.projects },
        { id: 'weekly', ...t.weekly, channels: ['email'] },
        { id: 'product', ...t.product, channels: ['email', 'inApp'] },
        { id: 'security', ...t.security, channels: ['email', 'push'], required: true },
        { id: 'billing', ...t.billing, channels: ['email'], required: true },
      ]}
      defaultValue={{
        channels: { comments: ['email', 'push', 'inApp'], invites: ['email', 'inApp'], projects: ['inApp'], weekly: ['email'], product: [] },
        paused: false,
        quietHours: { enabled: true, start: '22:00', end: '07:00' },
      }}
      onSubmit={() => wait(700)}
    />
  );
}
