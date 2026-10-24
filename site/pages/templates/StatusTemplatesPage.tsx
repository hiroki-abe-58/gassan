import type { ReactNode } from 'react';

import { ERROR_STATUSES } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-01', 'P-05', 'P-06'];

export function StatusTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs, templates } = useT();
  const t = templateDocs.status;
  // エラーのページが持つ状態（登録された 4xx / 5xx とオフライン）。見本の名前・状態の書き方・文言の鍵
  const errors = [
    ...ERROR_STATUSES.map((code) => ({ name: `error-${String(code)}`, code: String(code), key: `${code}` as const })),
    { name: 'error-offline', code: t.error.offline, key: 'offline' as const },
  ];
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
              initial="error-404"
              variants={errors.map((error) => ({ name: error.name, label: `${error.code} ${templates.error.titles[error.key]}` }))}
            />
            <DataTable
              caption={t.error.tableCaption}
              head={[t.error.head.code, t.error.head.title, t.error.head.description]}
              rows={errors.map((error) => [error.code, templates.error.titles[error.key], templates.error.descriptions[error.key]])}
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
