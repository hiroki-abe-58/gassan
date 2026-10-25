import { type ReactNode } from 'react';

import {
  ChangelogPage,
  ContactPage,
  DescriptionList,
  DocumentPage,
  ErrorPage,
  FaqPage,
  ForgotPasswordPage,
  MaintenancePage,
  PricingPage,
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
  type RegistrationPresetId,
} from '@genelab/gassan';

import { useT } from '../i18n';
import { AtlasApp, InviteSample, OnboardingSample } from './AppPreviews';
import { AuthPatternPreview } from './AuthPreviews';
import { RegistrationPresetPreview } from './RegistrationPreviews';
import { go, preview, wait } from './shared';

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
  'auth-dialog',
  'email-first',
  'magic-link',
  'quick-sign-up',
  'registration-wizard',
  'phone-sign-in',
  'passkey-prompt',
  'account-chooser',
  'reauth',
  'session-expired',
  'guest-account',
  'industry-bank',
  'industry-securities',
  'industry-crypto',
  'industry-wallet',
  'industry-card',
  'industry-ec',
  'industry-liquor',
  'industry-b2b',
  'industry-reuse',
  'industry-healthcare',
  'industry-matching',
  'industry-recruiting',
  'industry-rental',
  'industry-ticket',
  'industry-telecom',
  'error-400',
  'error-401',
  'error-402',
  'error-403',
  'error-404',
  'error-405',
  'error-406',
  'error-407',
  'error-408',
  'error-409',
  'error-410',
  'error-411',
  'error-412',
  'error-413',
  'error-414',
  'error-415',
  'error-416',
  'error-417',
  'error-418',
  'error-421',
  'error-422',
  'error-423',
  'error-424',
  'error-425',
  'error-426',
  'error-428',
  'error-429',
  'error-431',
  'error-451',
  'error-500',
  'error-501',
  'error-502',
  'error-503',
  'error-504',
  'error-505',
  'error-506',
  'error-507',
  'error-508',
  'error-510',
  'error-511',
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
  'app-chat',
  'app-mail',
  'app-assistant',
  'app-billing',
  'app-settings',
  'onboarding',
  'invite',
  'invite-signed-out',
  'invite-expired',
] as const;

/** 見本の名前から状態を引く（'error-404' → 404、'error-offline' → 'offline'）。知らない名前は 404 のページ。 */
function errorStatus(name: string): ErrorStatus | number {
  if (name === 'error-offline') return 'offline';
  const code = /^error-(\d{3})$/.exec(name)?.[1];
  return code ? Number(code) : 404;
}

/**
 * テンプレートの見本（#/preview/<name>）。ドキュメントのページの iframe の中で描く。
 *
 * 行き先はほかの見本へつないであるので、ログインから 2 段階認証へ、料金から問い合わせへと、中を歩ける。
 * 送信は少し待ってから本物らしく応える（パスワードは「gassan」、確認コードは「123456」で通る）。
 */
export function TemplatePreview({ name }: { name: string }): ReactNode {
  const { templates, registration, templateSamples: s, authPatterns } = useT();
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
    billing: preview('app-billing'),
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
            onPasskey={async () => {
              await wait(600);
              toast(authPatterns.samples.passkeyNotice);
            }}
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
                id: 'max',
                name: s.pricing.max.name,
                description: s.pricing.max.description,
                monthly: 5000,
                yearly: 50000,
                note: s.pricing.perUser,
                features: s.pricing.max.features,
                cta: { label: s.pricing.max.cta, href: links.signUp },
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
              { feature: s.pricing.compare.members, values: { free: '3', pro: s.pricing.compare.unlimited, max: s.pricing.compare.unlimited, enterprise: s.pricing.compare.unlimited } },
              { feature: s.pricing.compare.storage, values: { free: '1 GB', pro: '100 GB', max: '1 TB', enterprise: s.pricing.compare.unlimited } },
              {
                feature: s.pricing.compare.usage,
                values: { free: s.pricing.compare.standard, pro: s.pricing.compare.usage5, max: s.pricing.compare.usage25, enterprise: s.pricing.compare.custom },
              },
              { feature: s.pricing.compare.sso, values: { free: false, pro: false, max: false, enterprise: true } },
              { feature: s.pricing.compare.audit, values: { free: false, pro: true, max: true, enterprise: true } },
              {
                feature: s.pricing.compare.support,
                values: { free: s.pricing.compare.email, pro: s.pricing.compare.priority, max: s.pricing.compare.highest, enterprise: s.pricing.compare.dedicated },
              },
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
      case 'app-members':
      case 'app-chat':
      case 'app-mail':
      case 'app-assistant':
      case 'app-billing':
      case 'app-settings':
        return <AtlasApp page={name} />;
      case 'onboarding':
        return <OnboardingSample />;
      case 'auth-dialog':
      case 'email-first':
      case 'magic-link':
      case 'quick-sign-up':
      case 'registration-wizard':
      case 'phone-sign-in':
      case 'passkey-prompt':
      case 'account-chooser':
      case 'reauth':
      case 'session-expired':
      case 'guest-account':
        return <AuthPatternPreview name={name} />;
      case 'industry-bank':
      case 'industry-securities':
      case 'industry-crypto':
      case 'industry-wallet':
      case 'industry-card':
      case 'industry-ec':
      case 'industry-liquor':
      case 'industry-b2b':
      case 'industry-reuse':
      case 'industry-healthcare':
      case 'industry-matching':
      case 'industry-recruiting':
      case 'industry-rental':
      case 'industry-ticket':
      case 'industry-telecom':
        return <RegistrationPresetPreview preset={name.slice('industry-'.length) as RegistrationPresetId} />;
      case 'invite':
        return <InviteSample variant="pending" />;
      case 'invite-signed-out':
        return <InviteSample variant="signed-out" />;
      case 'invite-expired':
        return <InviteSample variant="expired" />;
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
      default: {
        const status = errorStatus(name);
        // サーバー側の問題には、ログを引く問い合わせ番号を添える
        return <ErrorPage status={status} reference={typeof status === 'number' && status >= 500 ? s.reference : undefined} retryAfter={status === 429 ? 15 : 0} />;
      }
    }
  })();

  return (
    <SiteProvider
      name={s.brand}
      logo={<AtlasLogo name={s.brand} />}
      links={links}
      nav={nav}
      footer={footer}
      labels={templates}
      registrationLabels={registration}
      copyright={s.copyright}
    >
      {page}
    </SiteProvider>
  );
}
