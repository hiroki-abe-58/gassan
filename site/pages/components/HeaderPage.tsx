import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import KindFlow from '../../demos/KindFlow';
import flowSource from '../../demos/KindFlow.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function HeaderPage({ rest }: PageProps): ReactNode {
  const { nav, header: t } = useT();
  return (
    <ComponentPage
      path="/components/header"
      rest={rest}
      title={nav.pages.header}
      lead={t.lead}
      ids={['H-01', 'H-02', 'H-05', 'H-06', 'H-10']}
      overview={() => (
        <>
          <Section id="slots" title={t.slots.title} intro={t.slots.intro}>
            <Example title={t.slots.exampleTitle} description={t.slots.exampleDescription} code={flowSource} demo="kindFlow">
              <KindFlow />
            </Example>
          </Section>

          <Section id="title-row" title={t.titleRow.title}>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel width={62} lines={2}>
                      <span className="s-mock-controls">
                        <i data-icon="back" />
                        <b>2 / 3</b>
                        <i data-icon="close" />
                      </span>
                      <span className="s-mock-title">{t.titleRow.mockTitle}</span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.titleRow.do)}
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel width={62} lines={2}>
                      <span className="s-mock-controls" data-crowded="">
                        <i data-icon="back" />
                        <b>{t.titleRow.mockCrowded}</b>
                        <i data-icon="close" />
                      </span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.titleRow.dont)}
              </Guideline>
            </Guidelines>
          </Section>

          <Section id="indicator" title={t.indicator.title}>
            <Prose>
              <Paras items={t.indicator.body} />
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalHeaderProps" title="Modal.Header" />
          <ApiTable name="ModalControlsProps" title="Modal.Controls" />
          <ApiTable name="ModalIconButtonProps" title="Modal.Back / Modal.Close" />
          <ApiTable name="ModalIndicatorProps" title="Modal.Indicator" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['H-01', 'H-02', 'H-03', 'H-04', 'H-05', 'H-06', 'H-07', 'H-08', 'H-10', 'A-06', 'A-07', 'K-08']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
