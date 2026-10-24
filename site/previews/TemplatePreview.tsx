import { type ReactNode } from 'react';

import {
  AppShell,
  Badge,
  Button,
  ChangelogPage,
  ContactPage,
  DescriptionList,
  DocumentPage,
  ErrorPage,
  FaqPage,
  ForgotPasswordPage,
  IconButton,
  MaintenancePage,
  PageHeader,
  PricingPage,
  Progress,
  ResetPasswordPage,
  SignInPage,
  SignOutPage,
  SignUpPage,
  SiteProvider,
  TwoFactorPage,
  VerifyEmailPage,
  toast,
  type ChangelogTag,
  type ErrorStatus,
} from '@genelab/gassan';

import DashboardSample from '../demos/DashboardSample';
import MemberTable from '../demos/MemberTable';
import { fmt, useT } from '../i18n';
import { to } from '../router';

/** 見本の待ち時間（送信しているように見せる）。 */
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const preview = (name: string): string => to(`/preview/${name}`);
const go = (name: string): void => {
  window.location.hash = preview(name).slice(1);
};

/** 見本の製品のロゴ。名前は文字で添える（ロゴの読み上げ名が製品の名前になる）。 */
function AtlasLogo({ name }: { name: string }): ReactNode {
  return (
    <>
      <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="currentColor" />
        <path d="M8 19 14 8l6 11M10.5 15h7" fill="none" stroke="var(--g-surface)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="g-brand-name">{name}</span>
    </>
  );
}

/** プレビューの一覧（ドキュメントのページの枠が使う名前）。 */
export const PREVIEWS = [
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'reset-password-expired',
  'two-factor',
  'verify-email',
  'sign-out',
  'sign-out-confirm',
  'error-404',
  'error-500',
  'error-403',
  'error-401',
  'error-429',
  'error-offline',
  'maintenance',
  'pricing',
  'faq',
  'contact',
  'terms',
  'privacy',
  'legal',
  'changelog',
  'app-dashboard',
  'app-members',
] as const;

/** アプリの枠の見本の案内の印（飾り）。 */
const ICON_PATHS = {
  home: 'M3.5 9.5 10 4l6.5 5.5M5.5 8v8h9V8',
  members: 'M7.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c0-2.5 2.2-4 5-4s5 1.5 5 4M13 4.2a2.5 2.5 0 0 1 0 4.6M14.5 12c1.8.4 3 1.6 3 4',
  billing: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h11A1.5 1.5 0 0 1 17 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 13.5v-7ZM3 8.5h14M6 12h3',
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

const ERRORS: Record<string, ErrorStatus> = {
  'error-404': 404,
  'error-500': 500,
  'error-403': 403,
  'error-401': 401,
  'error-429': 429,
  'error-offline': 'offline',
};

/**
 * テンプレートの見本（#/preview/<name>）。ドキュメントのページの iframe の中で描く。
 *
 * 行き先はほかの見本へつないであるので、ログインから 2 段階認証へ、料金から問い合わせへと、中を歩ける。
 * 送信は少し待ってから本物らしく応える（パスワードは「gassan」、確認コードは「123456」で通る）。
 */
export function TemplatePreview({ name }: { name: string }): ReactNode {
  const { templates, templateSamples: s } = useT();
  const links = {
    home: preview('pricing'),
    signIn: preview('sign-in'),
    signUp: preview('sign-up'),
    forgotPassword: preview('forgot-password'),
    terms: preview('terms'),
    privacy: preview('privacy'),
    help: preview('faq'),
    contact: preview('contact'),
    pricing: preview('pricing'),
    faq: preview('faq'),
    changelog: preview('changelog'),
    status: preview('maintenance'),
  };
  const nav = [
    { label: s.nav.pricing, href: links.pricing },
    { label: s.nav.faq, href: links.faq },
    { label: s.nav.changelog, href: links.changelog },
    { label: s.nav.contact, href: links.contact },
  ];
  const footer = [
    {
      title: s.footer.product,
      links: [
        { label: s.nav.pricing, href: links.pricing },
        { label: s.nav.changelog, href: links.changelog },
      ],
    },
    {
      title: s.footer.support,
      links: [
        { label: s.nav.faq, href: links.faq },
        { label: s.nav.contact, href: links.contact },
        { label: s.footer.status, href: links.status },
      ],
    },
    {
      title: s.footer.company,
      links: [
        { label: s.footer.terms, href: links.terms },
        { label: s.footer.privacy, href: links.privacy },
        { label: s.footer.legal, href: preview('legal') },
      ],
    },
  ];
  const aside = (
    <figure className="s-preview-quote">
      <blockquote>{s.quote}</blockquote>
      <figcaption>{s.quoteBy}</figcaption>
    </figure>
  );

  const page = ((): ReactNode => {
    switch (name) {
      case 'sign-in':
        return (
          <SignInPage
            aside={aside}
            notice={s.signInNotice}
            providers={[{ id: 'google', name: 'Google', onClick: () => toast(s.providerNotice) }]}
            onSubmit={async ({ password }) => {
              await wait(800);
              if (password !== 'gassan') return { error: true };
              go('two-factor');
              return undefined;
            }}
          />
        );
      case 'sign-up':
        return (
          <SignUpPage
            aside={aside}
            onSubmit={async () => {
              await wait(900);
              go('verify-email');
            }}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordPage resendAfter={20} onSubmit={() => wait(800)} />;
      case 'reset-password':
        return <ResetPasswordPage onSubmit={() => wait(800)} />;
      case 'reset-password-expired':
        return <ResetPasswordPage expired onSubmit={() => wait(800)} />;
      case 'two-factor':
        return (
          <TwoFactorPage
            method="sms"
            destination={s.phone}
            trustDays={30}
            description={`${templates.twoFactor.sms(s.phone, 6)} ${s.twoFactorHint}`}
            onResend={() => wait(600)}
            resendAfter={20}
            onSubmit={async ({ code }) => {
              await wait(700);
              if (code !== '123456') return { error: true };
              toast.success(s.signedIn);
              return undefined;
            }}
          />
        );
      case 'verify-email':
        return <VerifyEmailPage email={s.email} onResend={() => wait(600)} resendAfter={20} changeHref={links.signUp} />;
      case 'sign-out':
        return <SignOutPage />;
      case 'sign-out-confirm':
        return (
          <SignOutPage
            status="confirm"
            onConfirm={async () => {
              await wait(600);
              go('sign-out');
            }}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage
            start="2026-10-24T02:00:00+09:00"
            end="2026-10-24T04:00:00+09:00"
            timeZone="Asia/Tokyo"
            updates={[
              { time: '2026-10-24T02:40:00+09:00', text: s.maintenanceUpdate2 },
              { time: '2026-10-24T02:05:00+09:00', text: s.maintenanceUpdate1 },
            ]}
          />
        );
      case 'pricing':
        return (
          <PricingPage
            yearlyNote={s.pricing.yearlyNote}
            plans={[
              {
                id: 'free',
                name: s.pricing.free.name,
                description: s.pricing.free.description,
                monthly: 0,
                features: s.pricing.free.features,
                cta: { label: s.pricing.free.cta, href: links.signUp },
              },
              {
                id: 'pro',
                name: s.pricing.pro.name,
                description: s.pricing.pro.description,
                monthly: 1500,
                yearly: 15000,
                note: s.pricing.perUser,
                features: s.pricing.pro.features,
                cta: { label: s.pricing.pro.cta, href: links.signUp },
                recommended: true,
              },
              {
                id: 'enterprise',
                name: s.pricing.enterprise.name,
                description: s.pricing.enterprise.description,
                monthly: null,
                features: s.pricing.enterprise.features,
                cta: { label: s.pricing.enterprise.cta, href: links.contact },
              },
            ]}
            comparison={[
              { feature: s.pricing.compare.members, values: { free: '3', pro: s.pricing.compare.unlimited, enterprise: s.pricing.compare.unlimited } },
              { feature: s.pricing.compare.storage, values: { free: '1 GB', pro: '100 GB', enterprise: s.pricing.compare.unlimited } },
              { feature: s.pricing.compare.sso, values: { free: false, pro: false, enterprise: true } },
              { feature: s.pricing.compare.audit, values: { free: false, pro: true, enterprise: true } },
              { feature: s.pricing.compare.support, values: { free: s.pricing.compare.email, pro: s.pricing.compare.priority, enterprise: s.pricing.compare.dedicated } },
            ]}
            faq={s.pricing.faq.map((item, index) => ({ id: `pricing-${String(index)}`, question: item.q, answer: item.a }))}
          />
        );
      case 'faq':
        return <FaqPage items={s.faq.map((item) => ({ id: item.id, question: item.q, answer: item.a, category: item.category, keywords: item.keywords }))} />;
      case 'contact':
        return (
          <ContactPage
            details={
              <DescriptionList
                layout="stacked"
                items={[
                  { term: s.contactDetails.emailLabel, details: s.contactDetails.email },
                  { term: s.contactDetails.hoursLabel, details: s.contactDetails.hours },
                ]}
              />
            }
            onSubmit={() => wait(900)}
          />
        );
      case 'terms':
      case 'privacy': {
        const doc = name === 'terms' ? s.terms : s.privacy;
        return (
          <DocumentPage
            current={links[name]}
            title={doc.title}
            effective="2026-04-01"
            updated="2026-10-01"
            intro={<p>{doc.intro}</p>}
            numbering={name === 'terms' ? 'article' : 'number'}
            sections={doc.sections.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>),
            }))}
          />
        );
      }
      case 'legal':
        return (
          <DocumentPage
            title={s.legal.title}
            updated="2026-10-01"
            sections={[
              {
                id: 'disclosure',
                title: s.legal.heading,
                content: <DescriptionList items={s.legal.rows.map((row) => ({ term: row.term, details: row.details }))} />,
              },
            ]}
          />
        );
      case 'app-dashboard':
      case 'app-members': {
        const app = s.app;
        return (
          <AppShell
            current={preview(name)}
            nav={[
              {
                items: [
                  { label: app.home, href: preview('app-dashboard'), icon: <NavIcon d={ICON_PATHS.home} /> },
                  { label: app.members, href: preview('app-members'), icon: <NavIcon d={ICON_PATHS.members} />, badge: <Badge>6</Badge> },
                ],
              },
              {
                title: app.workspace,
                items: [
                  { label: app.billing, href: preview('pricing'), icon: <NavIcon d={ICON_PATHS.billing} /> },
                  { label: app.changelog, href: preview('changelog'), icon: <NavIcon d={ICON_PATHS.changelog} /> },
                  { label: app.help, href: preview('faq'), icon: <NavIcon d={ICON_PATHS.help} /> },
                ],
              },
            ]}
            actions={
              <>
                <IconButton label={app.search} onClick={() => toast(app.searchHint)}>
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
                { value: 'profile', label: app.profile, onSelect: () => toast(app.profile) },
                { value: 'settings', label: app.settings, onSelect: () => toast(app.settings) },
                { type: 'separator' },
                { value: 'sign-out', label: app.signOut, href: preview('sign-out-confirm') },
              ],
            }}
            sidebarFooter={<Progress label={app.seats} value={6} max={10} valueText={(value, max) => fmt(app.seatsValue, String(value), String(max))} />}
          >
            {name === 'app-dashboard' ? (
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
            ) : (
              <MemberTable headingLevel={1} />
            )}
          </AppShell>
        );
      }
      case 'changelog':
        return (
          <ChangelogPage
            feedHref="#"
            entries={s.changelog.map((entry) => ({
              version: entry.version,
              date: entry.date,
              title: entry.title,
              tags: entry.tags as ChangelogTag[],
              content: <p>{entry.body}</p>,
            }))}
          />
        );
      default:
        return <ErrorPage status={ERRORS[name] ?? 404} reference={name === 'error-500' ? s.reference : undefined} retryAfter={name === 'error-429' ? 15 : 0} />;
    }
  })();

  return (
    <SiteProvider name={s.brand} logo={<AtlasLogo name={s.brand} />} links={links} nav={nav} footer={footer} labels={templates} copyright={s.copyright}>
      {page}
    </SiteProvider>
  );
}
