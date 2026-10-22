import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import KindConfirm from '../../demos/KindConfirm';
import confirmSource from '../../demos/KindConfirm.tsx?raw';
import KindConsent from '../../demos/KindConsent';
import consentSource from '../../demos/KindConsent.tsx?raw';
import KindFlow from '../../demos/KindFlow';
import flowSource from '../../demos/KindFlow.tsx?raw';
import KindForm from '../../demos/KindForm';
import formSource from '../../demos/KindForm.tsx?raw';
import KindView from '../../demos/KindView';
import viewSource from '../../demos/KindView.tsx?raw';
import { SPEC_LANG, useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { MdTable, md, Paras } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section } from '../../ui/Page';

export function Kinds(): ReactNode {
  const { nav, kinds: t } = useT();
  const kinds = data.tables['2'];
  const placement = data.tables['3-2'];
  const dismiss = data.tables['3-3'];
  const footer = data.code['3-4#0'];
  const gates = data.tables['3-5'];

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.foundations}
        title={nav.pages.kinds}
        lead={t.lead}
        ids={['S-01', 'M-01', 'L-09', 'L-10', 'F-02']}
      />

      {kinds ? (
        <Section id="kinds" title={t.kinds.title} intro={t.kinds.intro}>
          <MdTable table={kinds} caption={t.kinds.tableCaption} />
        </Section>
      ) : null}

      <Section id="live" title={t.live.title} intro={t.live.intro}>
        <div className="s-example-grid">
          <Example
            title={t.live.confirm.title}
            description={t.live.confirm.description}
            code={confirmSource}
            demo="kindConfirm"
          >
            <KindConfirm />
          </Example>
          <Example title={t.live.form.title} description={t.live.form.description} code={formSource} demo="kindForm">
            <KindForm />
          </Example>
          <Example title={t.live.view.title} description={t.live.view.description} code={viewSource} demo="kindView">
            <KindView />
          </Example>
          <Example
            title={t.live.consent.title}
            description={t.live.consent.description}
            code={consentSource}
            demo="kindConsent"
          >
            <KindConsent />
          </Example>
          <Example title={t.live.flow.title} description={t.live.flow.description} code={flowSource} demo="kindFlow">
            <KindFlow />
          </Example>
        </div>
      </Section>

      <Section id="scrim" title={t.scrim.title}>
        <Prose>
          <Paras items={t.scrim.body} />
        </Prose>
      </Section>

      {placement ? (
        <Section id="placement" title={t.placement.title}>
          <MdTable table={placement} caption={t.placement.tableCaption} />
          <KeyPoint>{md(t.placement.callout)}</KeyPoint>
        </Section>
      ) : null}

      {dismiss ? (
        <Section id="dismiss" title={t.dismiss.title} intro={t.dismiss.intro}>
          <MdTable table={dismiss} caption={t.dismiss.tableCaption} align={[undefined, 'center', 'center', 'center']} />
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel title={t.dismiss.mockTitle} lines={2} width={60}>
                    <span className="s-mock-note">{t.dismiss.mockNote}</span>
                  </MockPanel>
                </MockScreen>
              }
            >
              {md(t.dismiss.do)}
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel title={t.dismiss.mockTitle} lines={2} width={60} />
                </MockScreen>
              }
            >
              {md(t.dismiss.dont)}
            </Guideline>
          </Guidelines>
        </Section>
      ) : null}

      {footer ? (
        <Section id="footer" title={t.footer.title} intro={t.footer.intro}>
          <CodeBlock code={footer.text} lang="text" caption="modal.skill.md §3-4" textLang={SPEC_LANG} />
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel
                    title={t.footer.orderTitle}
                    lines={1}
                    width={46}
                    stack
                    buttons={[
                      { label: t.footer.cancel, variant: 'tertiary' },
                      { label: t.footer.draft, variant: 'secondary' },
                      { label: t.footer.publish, variant: 'primary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              {md(t.footer.orderDo)}
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel
                    title={t.footer.orderTitle}
                    lines={1}
                    width={46}
                    stack
                    buttons={[
                      { label: t.footer.publish, variant: 'primary' },
                      { label: t.footer.draft, variant: 'secondary' },
                      { label: t.footer.cancel, variant: 'tertiary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              {md(t.footer.orderDont)}
            </Guideline>
          </Guidelines>
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel
                    title={t.footer.dangerTitle}
                    lines={1}
                    width={70}
                    buttons={[
                      { label: t.footer.dangerCancel, variant: 'tertiary' },
                      { label: t.footer.dangerDelete, variant: 'danger' },
                    ]}
                  />
                </MockScreen>
              }
            >
              {md(t.footer.dangerDo)}
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel
                    title={t.footer.dangerTitle}
                    lines={1}
                    width={70}
                    buttons={[
                      { label: t.footer.dangerDelete, variant: 'danger' },
                      { label: t.footer.dangerCancel, variant: 'primary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              {md(t.footer.dangerDont)}
            </Guideline>
          </Guidelines>
        </Section>
      ) : null}

      {gates ? (
        <Section id="gates" title={t.gates.title} intro={t.gates.intro}>
          <MdTable table={gates} caption={t.gates.tableCaption} />
          <p className="s-more">
            <Phrase>{md(t.gates.more)}</Phrase>
          </p>
        </Section>
      ) : null}
    </>
  );
}
