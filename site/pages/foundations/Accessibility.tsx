import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import { useT } from '../../i18n';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md, Paras } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecChips, SpecTable } from '../../ui/Spec';

export function Accessibility(): ReactNode {
  const { nav, accessibility: t } = useT();
  const keyboard = data.categories.find((c) => c.letter === 'K')?.items.map((i) => i.id) ?? [];
  const assistive = data.categories.find((c) => c.letter === 'A')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader eyebrow={nav.sections.foundations} title={nav.pages.accessibility} lead={t.lead} />

      <Section id="native" title={t.native.title} intro={t.native.intro}>
        <SpecTable ids={['L-01', 'L-02', 'K-01', 'K-02', 'K-06', 'A-03', 'A-04']} caption={t.native.tableCaption} />
        <Callout>{md(t.native.callout)}</Callout>
      </Section>

      <Section id="name" title={t.name.title}>
        <Prose>
          <Paras items={t.name.body} />
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  width={64}
                  title={
                    <>
                      <span className="s-mock-clamp">{t.name.mockLong}</span>
                      <span className="s-mock-toggle">{t.name.mockToggle}</span>
                    </>
                  }
                  lines={2}
                />
              </MockScreen>
            }
          >
            {md(t.name.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel width={64} title={t.name.mockCut} lines={2}>
                  <span className="s-mock-tooltip">{t.name.mockTooltip}</span>
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.name.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="gate" title={t.gate.title}>
        <Prose>
          <Paras items={t.gate.body} />
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.gate.mockTitle}
                  lines={2}
                  width={60}
                  buttons={[{ label: t.gate.mockButton, variant: 'gated' }]}
                >
                  <span className="s-mock-note">{t.gate.mockNote}</span>
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.gate.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.gate.mockTitle}
                  lines={2}
                  width={60}
                  buttons={[{ label: t.gate.mockButton, variant: 'disabled' }]}
                />
              </MockScreen>
            }
          >
            {md(t.gate.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="read" title={t.read.title} intro={t.read.intro}>
        <ol className="s-or-list">
          {t.read.signals.map((row, i) => (
            <li key={row.who}>
              {i > 0 ? (
                <span className="s-or" aria-hidden="true">
                  OR
                </span>
              ) : null}
              <Phrase>
                <p className="s-or-who">{row.who}</p>
                <p className="s-or-signal">{row.signal}</p>
              </Phrase>
            </li>
          ))}
        </ol>
        <SpecChips ids={['G-03', 'G-04', 'G-05', 'G-06', 'G-09']} label={t.read.chips} />
      </Section>

      <Section id="focus" title={t.focus.title}>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.focus.mockTitle}
                  lines={3}
                  width={62}
                  buttons={[{ label: t.focus.mockButton, variant: 'primary' }]}
                >
                  <span className="s-mock-focusring" />
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.focus.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen align="top">
                <MockPanel title={t.focus.mockTitle} lines={1} width={62}>
                  <span className="s-mock-input" />
                  <span className="s-mock-keyboard" />
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.focus.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="tables" title={t.tables.title}>
        <SpecTable ids={keyboard} caption={t.tables.keyboardCaption} />
        <SpecTable ids={assistive} caption={t.tables.assistiveCaption} />
      </Section>

      <Section id="preferences" title={t.preferences.title}>
        <SpecTable ids={['S-04', 'S-05', 'S-06', 'M-08', 'G-06']} caption={t.preferences.tableCaption} />
      </Section>
    </>
  );
}
