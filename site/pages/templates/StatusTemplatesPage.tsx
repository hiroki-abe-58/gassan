import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-01', 'P-05', 'P-06'];

export function StatusTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.status;
  return (
    <ComponentPage
      path="/templates/status"
      rest={rest}
      title={nav.pages.templatesStatus}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="error" title={t.error.title} intro={t.error.intro}>
            <TemplateFrame
              title={t.error.title}
              height={680}
              variants={[
                { name: 'error-404', label: t.error.variants.notFound },
                { name: 'error-500', label: t.error.variants.server },
                { name: 'error-403', label: t.error.variants.forbidden },
                { name: 'error-401', label: t.error.variants.unauthorized },
                { name: 'error-429', label: t.error.variants.tooMany },
                { name: 'error-offline', label: t.error.variants.offline },
              ]}
            />
          </Section>
          <Section id="maintenance" title={t.maintenance.title} intro={t.maintenance.intro}>
            <TemplateFrame title={t.maintenance.title} height={760} variants={[{ name: 'maintenance', label: t.maintenance.title }]} />
          </Section>
          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ErrorPageProps" title="ErrorPage" />
          <ApiTable name="MaintenancePageProps" title="MaintenancePage" />
          <ApiTable name="MaintenanceUpdate" />
          <ApiTable name="StatusLayoutProps" title="StatusLayout" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
