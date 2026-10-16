import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ChartReport from '../../demos/ChartReport';
import chartSource from '../../demos/ChartReport.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ChartPage({ rest }: PageProps): ReactNode {
  const { nav, chart: t } = useT();
  return (
    <ComponentPage
      path="/components/chart"
      rest={rest}
      title={nav.pages.chart}
      lead={t.lead}
      ids={['B-14']}
      overview={() => (
        <>
          <Section id="report" title={t.report.title} intro={t.report.intro}>
            <Example
              title={t.report.exampleTitle}
              description={t.report.exampleDescription}
              code={chartSource}
              demo="chartReport"
            >
              <ChartReport />
            </Example>
          </Section>

          <Section id="why" title={t.why.title}>
            <Prose>
              <Paras items={t.why.body} />
            </Prose>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel title={t.why.mockTitle} lines={0} width={70}>
                      <span className="s-mock-bars">
                        <i style={{ height: '40%' }} />
                        <i style={{ height: '62%' }} />
                        <i style={{ height: '92%' }} />
                        <i style={{ height: '80%' }} />
                        <i style={{ height: '78%' }} />
                      </span>
                      <span className="s-mock-note">{t.why.mockSummary}</span>
                      <span className="s-mock-disclosure">{t.why.mockDisclosure}</span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.why.do)}
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel lines={0} width={70}>
                      <span className="s-mock-bars">
                        <i style={{ height: '40%' }} />
                        <i style={{ height: '62%' }} />
                        <i style={{ height: '92%' }} />
                        <i style={{ height: '80%' }} />
                        <i style={{ height: '78%' }} />
                      </span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                {md(t.why.dont)}
              </Guideline>
            </Guidelines>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalChartProps" title="Modal.Chart" />}
      a11y={() => <SpecTable ids={['B-14', 'B-13', 'A-06']} caption={t.a11yCaption} />}
    />
  );
}
