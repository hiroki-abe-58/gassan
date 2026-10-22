import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import SheetDetents from '../../demos/SheetDetents';
import sheetSource from '../../demos/SheetDetents.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function SheetPage({ rest }: PageProps): ReactNode {
  const { nav, sheet: t } = useT();
  return (
    <ComponentPage
      path="/components/sheet"
      rest={rest}
      title={nav.pages.sheet}
      lead={t.lead}
      ids={['M-01', 'M-02', 'M-03', 'H-09', 'C-08']}
      overview={() => (
        <>
          <Section id="detents" title={t.detents.title} intro={t.detents.intro}>
            <Example
              title={t.detents.exampleTitle}
              description={t.detents.exampleDescription}
              code={sheetSource}
              demo="sheetDetents"
            >
              <SheetDetents />
            </Example>
          </Section>

          <Section id="rules" title={t.rules.title}>
            <ol className="s-rules">
              {t.rules.items.map((rule) => (
                <li key={rule.title}>
                  <Phrase>
                    <h3>{rule.title}</h3>
                    <p>{rule.body}</p>
                  </Phrase>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="release" title={t.release.title}>
            <Prose>
              <Paras items={t.release.body} />
            </Prose>
            <KeyPoint>{md(t.release.callout)}</KeyPoint>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalHandleProps" title="Modal.Handle" />
          <Prose>
            <Paras items={t.api.body} />
          </Prose>
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-09', 'H-09', 'C-08', 'F-12']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
