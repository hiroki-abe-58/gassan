import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-01', 'P-02', 'P-03', 'P-04'];

export function AuthTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.auth;
  const frames = [
    { id: 'sign-in', copy: t.signIn, variants: [{ name: 'sign-in', label: t.signIn.title }] },
    { id: 'sign-up', copy: t.signUp, variants: [{ name: 'sign-up', label: t.signUp.title }] },
    {
      id: 'reset',
      copy: t.reset,
      variants: [
        { name: 'forgot-password', label: t.reset.forgot },
        { name: 'reset-password', label: t.reset.reset },
        { name: 'reset-password-expired', label: t.reset.expired },
      ],
    },
    { id: 'two-factor', copy: t.twoFactor, variants: [{ name: 'two-factor', label: t.twoFactor.title }] },
    { id: 'verify-email', copy: t.verifyEmail, variants: [{ name: 'verify-email', label: t.verifyEmail.title }] },
    {
      id: 'sign-out',
      copy: t.signOut,
      variants: [
        { name: 'sign-out-confirm', label: t.signOut.confirm },
        { name: 'sign-out', label: t.signOut.done },
      ],
    },
  ];
  return (
    <ComponentPage
      path="/templates/auth"
      rest={rest}
      title={nav.pages.templatesAuth}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="setup" title={t.setup.title} intro={t.setup.intro}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          {frames.map((frame) => (
            <Section key={frame.id} id={frame.id} title={frame.copy.title} intro={frame.copy.intro}>
              <TemplateFrame title={frame.copy.title} variants={frame.variants} />
            </Section>
          ))}
        </>
      )}
      api={() => (
        <>
          <ApiTable name="SiteProviderProps" title="SiteProvider" />
          <ApiTable name="SiteLinks" />
          <ApiTable name="SignInPageProps" title="SignInPage" />
          <ApiTable name="AuthProvider" />
          <ApiTable name="SignUpPageProps" title="SignUpPage" />
          <ApiTable name="ForgotPasswordPageProps" title="ForgotPasswordPage" />
          <ApiTable name="ResetPasswordPageProps" title="ResetPasswordPage" />
          <ApiTable name="TwoFactorPageProps" title="TwoFactorPage" />
          <ApiTable name="VerifyEmailPageProps" title="VerifyEmailPage" />
          <ApiTable name="SignOutPageProps" title="SignOutPage" />
          <ApiTable name="AuthLayoutProps" title="AuthLayout" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
