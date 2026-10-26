import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { md } from '../../ui/Markdown';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-36', 'P-37', 'P-38'];

export function WorkspaceTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, workspace: t } = useT();
  return (
    <ComponentPage
      path="/templates/workspace"
      rest={rest}
      title={nav.pages.templatesWorkspace}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="api-keys" title={t.apiKeys.title} intro={md(t.apiKeys.intro)}>
            <TemplateFrame title={t.apiKeys.title} height={640} variants={[{ name: 'app-api-keys', label: t.apiKeys.title }]} />
            <CodeBlock lang="tsx" code={t.apiKeys.code} />
          </Section>
          <Section id="audit-log" title={t.auditLog.title} intro={md(t.auditLog.intro)}>
            <TemplateFrame title={t.auditLog.title} height={820} variants={[{ name: 'app-audit-log', label: t.auditLog.title }]} />
            <CodeBlock lang="tsx" code={t.auditLog.code} />
          </Section>
          <Section id="notifications" title={t.notifications.title} intro={md(t.notifications.intro)}>
            <TemplateFrame title={t.notifications.title} height={820} variants={[{ name: 'app-notifications', label: t.notifications.title }]} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ApiKeysPageProps" title="ApiKeysPage" />
          <ApiTable name="ApiKey" />
          <ApiTable name="ApiKeyScope" />
          <ApiTable name="ApiKeyCreateValues" />
          <ApiTable name="AuditLogPageProps" title="AuditLogPage" />
          <ApiTable name="AuditEvent" />
          <ApiTable name="AuditLogQuery" />
          <ApiTable name="NotificationSettingsPageProps" title="NotificationSettingsPage" />
          <ApiTable name="NotificationTopic" />
          <ApiTable name="NotificationChannel" />
          <ApiTable name="NotificationSettingsValue" />
          <ApiTable name="QuietHours" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'P-03', 'U-26']} caption={t.a11yCaption} />}
    />
  );
}
