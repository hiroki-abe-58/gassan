import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ImperativeConfirm from '../../demos/ImperativeConfirm';
import imperativeSource from '../../demos/ImperativeConfirm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ImperativePage({ rest }: PageProps): ReactNode {
  const { nav, imperative: t } = useT();
  return (
    <ComponentPage
      path="/components/imperative"
      rest={rest}
      title={nav.pages.imperative}
      lead={t.lead}
      ids={['D-03', 'L-14', 'L-15']}
      overview={() => (
        <>
          <Section id="confirm" title={t.confirm.title} intro={t.confirm.intro}>
            <Example title="confirm()" code={imperativeSource} demo="imperativeConfirm">
              <ImperativeConfirm />
            </Example>
          </Section>

          <Section id="host" title={t.host.title}>
            <CodeBlock
              lang="tsx"
              caption="app.tsx"
              code={`export function App() {\n  return (\n    <>\n      <Routes />\n      <ModalHost />\n    </>\n  );\n}`}
            />
            <Prose>
              <Paras items={t.host.body} />
              <ul>
                {t.host.exits.map((exit) => (
                  <li key={exit}>{md(exit)}</li>
                ))}
              </ul>
            </Prose>
            <Callout>{md(t.host.callout)}</Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalsApi" title="useModals()" />
          <ApiTable name="ConfirmOptions" />
        </>
      )}
      a11y={() => <SpecTable ids={['D-03', 'L-14', 'L-15', 'K-05', 'F-06']} caption={t.a11yCaption} />}
    />
  );
}
