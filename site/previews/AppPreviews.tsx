import { useState, type ReactNode } from 'react';

import {
  AppShell,
  Badge,
  BillingPage,
  Button,
  CommandPalette,
  DescriptionList,
  IconButton,
  InviteAcceptPage,
  MembersPage,
  ModalField,
  ModalInput,
  ModalTagInput,
  OnboardingPage,
  PageHeader,
  Progress,
  SettingsPage,
  toast,
  type BillingStatus,
  type CommandItem,
  type MemberInvitation,
  type SettingsSession,
  type WorkspaceMember,
} from '@genelab/gassan';

import DashboardSample from '../demos/DashboardSample';
import { fmt, useDemoText, useT } from '../i18n';
import { go, preview, wait } from './shared';

/** ログインしている人のメールアドレス（メンバーの表のデモの 1 人目）。 */
const USER_EMAIL = 'aoi@example.com';

/** アプリの枠の見本の案内の印（飾り）。 */
const ICON_PATHS = {
  home: 'M3.5 9.5 10 4l6.5 5.5M5.5 8v8h9V8',
  members: 'M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c0-2.5 2.2-4 5-4s5 1.5 5 4M13 4.2a2.5 2.5 0 0 1 0 4.6M14.5 12c1.8.4 3 1.6 3 4',
  billing: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h11A1.5 1.5 0 0 1 17 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 13.5v-7ZM3 8.5h14M6 12h3',
  settings: 'M3.5 6.5h6M13.5 6.5h3M11.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.5 13.5h2M9.5 13.5h7M7.5 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
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

/** アプリの枠に入れる見本。 */
const APP_PAGES = {
  'app-dashboard': DashboardContent,
  'app-members': MembersContent,
  'app-billing': BillingContent,
  'app-settings': SettingsContent,
} as const;

export type AppPreviewName = keyof typeof APP_PAGES;

/**
 * アプリの枠（P-12）に入れた見本。案内はほかの見本へつないであるので、ホーム・メンバー・請求・設定を行き来できる。
 */
export function AtlasApp({ page }: { page: AppPreviewName }): ReactNode {
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
      ],
    },
    {
      title: app.workspace,
      items: [
        { target: 'app-billing', label: app.billing, icon: ICON_PATHS.billing },
        { target: 'app-settings', label: app.settings, icon: ICON_PATHS.settings },
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
          { value: 'billing', label: app.billing, href: preview('app-billing') },
          { type: 'separator' },
          { value: 'sign-out', label: app.signOut, href: preview('sign-out-confirm') },
        ],
      }}
      sidebarFooter={<Progress label={app.seats} value={6} max={10} valueText={(value, max) => fmt(app.seatsValue, String(value), String(max))} />}
    >
      <Content />
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
