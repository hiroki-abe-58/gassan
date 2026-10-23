import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-12', 'C-13', 'U-25', 'U-26'];

export function AppTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.app;
  return (
    <ComponentPage
      path="/templates/app"
      rest={rest}
      title={nav.pages.templatesApp}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="setup" title={t.setup.title} intro={t.setup.intro}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          <Section id="shell" title={t.shell.title} intro={t.shell.intro}>
            <TemplateFrame
              title={t.shell.title}
              height={760}
              variants={[
                { name: 'app-dashboard', label: t.shell.variants.dashboard },
                { name: 'app-members', label: t.shell.variants.members },
              ]}
            />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="AppShellProps" title="AppShell" />
          <ApiTable name="AppNavSection" />
          <ApiTable name="AppNavItem" />
          <ApiTable name="AppAccount" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
