import type { ReactNode } from 'react';

import { Phrase, type CloseReason } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import Playground from '../../demos/Playground';
import playgroundSource from '../../demos/Playground.tsx?raw';
import KindForm from '../../demos/KindForm';
import formSource from '../../demos/KindForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const REASONS: readonly CloseReason[] = [
  'esc',
  'backdrop',
  'close-button',
  'back-button',
  'submit',
  'programmatic',
  'swipe',
  'route-change',
];

export function RootPage({ rest }: PageProps): ReactNode {
  const { nav, root: t } = useT();
  return (
    <ComponentPage
      path="/components/root"
      rest={rest}
      title={nav.pages.root}
      lead={t.lead}
      ids={['L-03', 'L-08', 'L-09', 'L-10', 'D-02']}
      overview={() => (
        <>
          <Section id="playground" title={t.playground.title} intro={t.playground.intro}>
            <Example title={t.playground.exampleTitle} code={playgroundSource} demo="playground">
              <Playground />
            </Example>
          </Section>

          <Section id="reasons" title={t.reasons.title} intro={t.reasons.intro}>
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.reasons.tableLabel}>
              <table className="s-table">
                <caption className="s-sr-only">{t.reasons.tableCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">reason</th>
                    <th scope="col">{t.reasons.from}</th>
                    <th scope="col">{t.reasons.refuse}</th>
                  </tr>
                </thead>
                <tbody>
                  <Phrase>
                    {REASONS.map((reason) => (
                      <tr key={reason}>
                        <th scope="row">
                          <code>{reason}</code>
                        </th>
                        <td>{t.reasons.rows[reason].from}</td>
                        <td>{t.reasons.rows[reason].refuse}</td>
                      </tr>
                    ))}
                  </Phrase>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="guard" title={t.guard.title} intro={t.guard.intro}>
            <Example
              title={t.guard.exampleTitle}
              description={t.guard.exampleDescription}
              code={formSource}
              demo="kindForm"
            >
              <KindForm />
            </Example>
          </Section>

          <Section id="mount" title={t.mount.title}>
            <Prose>
              <Paras items={t.mount.body} />
            </Prose>
            <Callout>{md(t.mount.callout)}</Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalRootProps" title="Modal.Root" />
          <ApiTable name="DismissPolicy" />
        </>
      )}
      a11y={() => (
        <>
          <Prose>
            <Paras items={t.a11yBody} />
          </Prose>
          <SpecTable
            ids={['L-01', 'L-02', 'L-08', 'L-09', 'L-10', 'L-12', 'A-01', 'A-03', 'A-05', 'K-03', 'K-04', 'K-06', 'S-08', 'S-10']}
            caption={t.a11yCaption}
          />
        </>
      )}
    />
  );
}
