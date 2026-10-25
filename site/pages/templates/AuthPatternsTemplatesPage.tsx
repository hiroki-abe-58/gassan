import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { md } from '../../ui/Markdown';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-21', 'P-22', 'P-23', 'P-24', 'P-25', 'P-26', 'P-27', 'P-28', 'P-29', 'P-30'];

export function AuthPatternsTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, authPatterns: t } = useT();
  const frames = [
    { id: 'dialog', copy: t.dialog, variants: [{ name: 'auth-dialog', label: t.dialog.title }] },
    { id: 'email-first', copy: t.emailFirst, variants: [{ name: 'email-first', label: t.emailFirst.title }] },
    { id: 'magic-link', copy: t.magicLink, variants: [{ name: 'magic-link', label: t.magicLink.title }] },
    {
      id: 'quick-sign-up',
      copy: t.quickSignUp,
      variants: [
        { name: 'quick-sign-up', label: t.quickSignUp.quick },
        { name: 'registration-wizard', label: t.quickSignUp.wizard },
      ],
    },
    { id: 'phone', copy: t.phone, variants: [{ name: 'phone-sign-in', label: t.phone.title }] },
    {
      id: 'passkey',
      copy: t.passkey,
      variants: [
        { name: 'passkey-prompt', label: t.passkey.prompt },
        { name: 'sign-in', label: t.passkey.signIn },
      ],
    },
    { id: 'account-chooser', copy: t.accountChooser, variants: [{ name: 'account-chooser', label: t.accountChooser.title }] },
    {
      id: 'reauth',
      copy: t.reauth,
      variants: [
        { name: 'reauth', label: t.reauth.confirm },
        { name: 'session-expired', label: t.reauth.expired },
      ],
    },
    { id: 'guest-account', copy: t.guestAccount, variants: [{ name: 'guest-account', label: t.guestAccount.title }] },
  ];
  return (
    <ComponentPage
      path="/templates/auth-patterns"
      rest={rest}
      title={nav.pages.templatesAuthPatterns}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="choose" title={t.choose.title} intro={md(t.choose.intro)}>
            <DataTable
              caption={t.choose.tableCaption}
              head={[t.choose.head.service, t.choose.head.pattern, t.choose.head.why]}
              rows={t.choose.rows.map((row, index) => [row.service, md(row.pattern, `pattern${String(index)}`), row.why])}
            />
          </Section>
          <Section id="setup" title={t.setup.title} intro={md(t.setup.intro)}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          {frames.map((frame) => (
            <Section key={frame.id} id={frame.id} title={frame.copy.title} intro={md(frame.copy.intro)}>
              <TemplateFrame title={frame.copy.title} variants={frame.variants} />
            </Section>
          ))}
        </>
      )}
      api={() => (
        <>
          <ApiTable name="AuthDialogProps" title="AuthDialog" />
          <ApiTable name="EmailFirstPageProps" title="EmailFirstPage" />
          <ApiTable name="MagicLinkPageProps" title="MagicLinkPage" />
          <ApiTable name="QuickSignUpPageProps" title="QuickSignUpPage" />
          <ApiTable name="RegistrationWizardPageProps" title="RegistrationWizardPage" />
          <ApiTable name="RegistrationStep" />
          <ApiTable name="PhoneSignInPageProps" title="PhoneSignInPage" />
          <ApiTable name="PasskeyPromptPageProps" title="PasskeyPromptPage" />
          <ApiTable name="AccountChooserPageProps" title="AccountChooserPage" />
          <ApiTable name="RememberedAccount" />
          <ApiTable name="ReauthDialogProps" title="ReauthDialog" />
          <ApiTable name="GuestAccountCardProps" title="GuestAccountCard" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'P-02', 'P-03', 'P-04']} caption={t.a11yCaption} />}
    />
  );
}
