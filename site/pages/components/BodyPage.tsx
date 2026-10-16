import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import BodyScroll from '../../demos/BodyScroll';
import bodySource from '../../demos/BodyScroll.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function BodyPage({ rest }: PageProps): ReactNode {
  const { nav, body: t } = useT();
  return (
    <ComponentPage
      path="/components/body"
      rest={rest}
      title={nav.pages.body}
      lead={t.lead}
      ids={['B-01', 'B-02', 'B-03', 'B-07', 'G-03']}
      overview={() => (
        <>
          <Section id="scroll" title={t.scroll.title} intro={t.scroll.intro}>
            <Example title={t.scroll.exampleTitle} description={t.scroll.exampleDescription} code={bodySource} demo="bodyScroll">
              <BodyScroll />
            </Example>
          </Section>

          <Section id="focusable" title={t.focusable.title}>
            <Prose>
              <Paras items={t.focusable.body} />
            </Prose>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel title={t.focusable.mockTitle} lines={5} width={60}>
                      <span className="s-mock-focusring" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.focusable.do)}
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel title={t.focusable.mockTitle} lines={5} width={60}>
                      <span className="s-mock-scrollbar" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.focusable.dont)}
              </Guideline>
            </Guidelines>
          </Section>

          <Section id="read-gate" title={t.readGate.title}>
            <Prose>
              <Paras items={t.readGate.body} />
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalBodyProps" title="Modal.Body" />
          <ApiTable name="ModalSectionProps" title="Modal.Section" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'K-09', 'G-03', 'G-04', 'G-05', 'D-12']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
