import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-13', 'P-14', 'P-15', 'P-16', 'P-17'];

export function AppPagesTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.appPages;
  return (
    <ComponentPage
      path="/templates/app-pages"
      rest={rest}
      title={nav.pages.templatesAppPages}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="setup" title={t.setup.title} intro={t.setup.intro}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          <Section id="settings" title={t.settings.title} intro={t.settings.intro}>
            <TemplateFrame title={t.settings.title} height={760} variants={[{ name: 'app-settings', label: t.settings.title }]} />
          </Section>
          <Section id="members" title={t.members.title} intro={t.members.intro}>
            <TemplateFrame title={t.members.title} height={760} variants={[{ name: 'app-members', label: t.members.title }]} />
          </Section>
          <Section id="billing" title={t.billing.title} intro={t.billing.intro}>
            <TemplateFrame title={t.billing.title} height={760} variants={[{ name: 'app-billing', label: t.billing.title }]} />
          </Section>
          <Section id="onboarding" title={t.onboarding.title} intro={t.onboarding.intro}>
            <TemplateFrame title={t.onboarding.title} height={680} variants={[{ name: 'onboarding', label: t.onboarding.title }]} />
          </Section>
          <Section id="invite" title={t.invite.title} intro={t.invite.intro}>
            <TemplateFrame
              title={t.invite.title}
              height={620}
              variants={[
                { name: 'invite', label: t.invite.variants.pending },
                { name: 'invite-signed-out', label: t.invite.variants.signedOut },
                { name: 'invite-expired', label: t.invite.variants.expired },
              ]}
            />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="SettingsPageProps" title="SettingsPage" />
          <ApiTable name="SettingsProfile" />
          <ApiTable name="SettingsPassword" />
          <ApiTable name="SettingsTwoFactor" />
          <ApiTable name="SettingsSessions" />
          <ApiTable name="SettingsSession" />
          <ApiTable name="SettingsDeleteAccount" />
          <ApiTable name="SettingsSectionProps" title="SettingsSection" />
          <ApiTable name="MembersPageProps" title="MembersPage" />
          <ApiTable name="WorkspaceMember" />
          <ApiTable name="MemberRole" />
          <ApiTable name="MemberInvitation" />
          <ApiTable name="MemberInviteValues" />
          <ApiTable name="BillingPageProps" title="BillingPage" />
          <ApiTable name="BillingPlan" />
          <ApiTable name="BillingUsage" />
          <ApiTable name="BillingPaymentMethod" />
          <ApiTable name="BillingInvoice" />
          <ApiTable name="OnboardingPageProps" title="OnboardingPage" />
          <ApiTable name="OnboardingStep" />
          <ApiTable name="InviteAcceptPageProps" title="InviteAcceptPage" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
