import type ja from '../ja/workspace';

export default {
  lead: 'API keys, the audit log and notification settings. Three admin screens that teams keep rebuilding, ready to place inside the app shell (P-12).',
  apiKeys: {
    title: 'API keys',
    intro: 'The key itself is shown once, in the same dialog, right after it is created. Focus moves to a read-only field with the whole key selected, and “Copy” and “shown only now” are tied to that field. While the key is on screen, Esc and clicks outside don’t close the dialog, and the reason is announced. The component never holds on to the key (it shows the `secret` that `onCreate` returns and drops it on close). The table only gets a part of each key for telling them apart (`hint`). Shorter expiry periods come first, and the first one is the default.',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: 'Read', description: 'Read projects and members' },
  { value: 'write', label: 'Write', description: 'Create, change and delete projects' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // The server stores only a hash of the key and returns the key itself this one time
        const { secret } = (await response.json()) as { secret: string };
        reload();
        return { secret };
      }}
      onRevoke={async (id) => {
        const response = await fetch(\`/api/keys/\${id}\`, { method: 'DELETE' });
        if (!response.ok) return { error: true };
        reload();
      }}
    />
  );
}`,
  },
  auditLog: {
    title: 'Audit log',
    intro: 'Filtering and paging happen on the server. The component holds no filters of its own: it reads them from `query` and passes every change to `onQueryChange`. The search text applies when it is sent (Enter or “Search”), the action and date range apply as soon as they are picked, and any change returns to page 1. Times include seconds, and the column header names the time zone. Pass `loading` while a page loads (the table shows a skeleton, and the count is announced once it has loaded).',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // Reads one page from the server for the given filters

const ACTIONS = [
  { value: 'member.invite', label: 'Invited a member' },
  { value: 'api_key.create', label: 'Created an API key' },
  { value: 'auth.sign_in', label: 'Signed in' },
];

export function AuditLog() {
  const [query, setQuery] = useState<AuditLogQuery>({ text: '', action: null, range: null, page: 1 });
  const { data, isLoading } = useAuditLog(query);
  return (
    <AuditLogPage
      query={query}
      onQueryChange={setQuery}
      events={data?.events ?? []}
      total={data?.total ?? 0}
      pageCount={data?.pageCount ?? 1}
      loading={isLoading}
      actions={ACTIONS}
      onExport={async (current) => {
        const response = await fetch('/api/audit-log/exports', { method: 'POST', body: JSON.stringify(current) });
        return response.ok ? undefined : { error: true };
      }}
    />
  );
}`,
  },
  notifications: {
    title: 'Notification settings',
    intro: 'A table with a row for each kind of notification and a column for each way to receive it. Each checkbox is named by its row and column headers together (“Comments and mentions Email”). Ways a notification can’t be sent show “—”, and notifications that can’t be turned off (security, billing) say “Always sent” instead of a checkbox. “Pause all notifications” comes before the table, and while it is on the table can’t be changed and says why. When quiet hours end before they start, the end is marked as the next day.',
  },
  samples: {
    keys: { production: 'Production server', ci: 'CI tests', analytics: 'Analytics export', legacy: 'Legacy integration' },
    scopes: {
      read: { label: 'Read', description: 'Read projects and members' },
      write: { label: 'Write', description: 'Create, change and delete projects' },
      billing: { label: 'Billing', description: 'Read invoices and usage' },
    },
    actions: {
      signIn: 'Signed in',
      signInFailed: 'Failed to sign in',
      invite: 'Invited a member',
      role: 'Changed a member’s role',
      remove: 'Removed a member',
      keyCreate: 'Created an API key',
      keyRevoke: 'Revoked an API key',
      plan: 'Changed the plan',
      settings: 'Changed workspace settings',
      export: 'Exported data',
    },
    roleChange: '{0} (Viewer → Editor)',
    planChange: 'Free → Pro',
    settingsTarget: 'Workspace name',
    exportTarget: 'Member list (CSV)',
    system: 'System',
    apiKey: 'API key',
    locations: { tokyo: 'Tokyo, Japan', osaka: 'Osaka, Japan', fukuoka: 'Fukuoka, Japan', singapore: 'Singapore' },
    topics: {
      comments: { label: 'Comments and mentions', description: 'Comments addressed to you and @mentions' },
      invites: { label: 'Invitations and joins', description: 'Invitations to a workspace, and members joining' },
      projects: { label: 'Project updates', description: 'Changes to projects you own' },
      weekly: { label: 'Weekly summary', description: 'A summary of last week, sent on Monday morning' },
      product: { label: 'New features', description: 'New features and tips' },
      security: { label: 'Security', description: 'Sign-ins from new devices and password changes' },
      billing: { label: 'Billing', description: 'Invoices and failed payments' },
    },
  },
  a11yCaption: 'How the API key, audit log and notification settings templates behave',
} satisfies typeof ja;
