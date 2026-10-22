import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import FooterButtons from '../../demos/FooterButtons';
import footerSource from '../../demos/FooterButtons.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function FooterPage({ rest }: PageProps): ReactNode {
  const { nav, footer: t } = useT();
  const dangerButtons = [
    { label: t.danger.mockCancel, variant: 'tertiary' },
    { label: t.danger.mockDelete, variant: 'danger' },
  ] as const;
  return (
    <ComponentPage
      path="/components/footer"
      rest={rest}
      title={nav.pages.footer}
      lead={t.lead}
      ids={['F-01', 'F-02', 'F-06', 'F-07', 'F-08']}
      overview={() => (
        <>
          <Section id="hierarchy" title={t.hierarchy.title} intro={t.hierarchy.intro}>
            <Example
              title={t.hierarchy.exampleTitle}
              description={t.hierarchy.exampleDescription}
              code={footerSource}
              demo="footerButtons"
            >
              <FooterButtons />
            </Example>
          </Section>

          <Section id="loading" title={t.loading.title}>
            <Prose>
              <Paras items={t.loading.body} />
            </Prose>
            <KeyPoint>{md(t.loading.callout)}</KeyPoint>
          </Section>

          <Section id="danger" title={t.danger.title}>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel title={t.danger.mockTitle} lines={1} width={70} buttons={dangerButtons} />
                  </MockScreen>
                }
              >
                {md(t.danger.do)}
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel title={t.danger.mockTitle} lines={1} width={70} buttons={dangerButtons}>
                      <span className="s-mock-focusring" data-on="danger" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.danger.dont)}
              </Guideline>
            </Guidelines>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalFooterProps" title="Modal.Footer" />
          <ApiTable name="ModalButtonProps" title="Modal.Button" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'F-09', 'F-10', 'F-11', 'F-12', 'K-05']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
