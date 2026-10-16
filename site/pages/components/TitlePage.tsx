import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import TitleClamp from '../../demos/TitleClamp';
import titleSource from '../../demos/TitleClamp.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function TitlePage({ rest }: PageProps): ReactNode {
  const { nav, title: t } = useT();
  return (
    <ComponentPage
      path="/components/title"
      rest={rest}
      title={nav.pages.title}
      lead={t.lead}
      ids={['T-01', 'T-03', 'T-04', 'T-08', 'A-02']}
      overview={() => (
        <>
          <Section id="clamp" title={t.clamp.title} intro={t.clamp.intro}>
            <Example title={t.clamp.exampleTitle} description={t.clamp.exampleDescription} code={titleSource} demo="titleClamp">
              <TitleClamp />
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
                    <MockPanel
                      width={64}
                      lines={2}
                      title={
                        <>
                          <span className="s-mock-clamp">{t.why.mockLong}</span>
                          <span className="s-mock-toggle">{t.why.mockToggle}</span>
                        </>
                      }
                    />
                  </MockScreen>
                }
              >
                {md(t.why.do)}
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel width={64} lines={2} title={t.why.mockCut}>
                      <span className="s-mock-tooltip">{t.why.mockTooltip}</span>
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
      api={() => (
        <>
          <ApiTable name="ModalTitleProps" title="Modal.Title" />
          <ApiTable name="ModalDescriptionProps" title="Modal.Description" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08', 'T-09', 'A-01', 'A-02', 'A-08']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
