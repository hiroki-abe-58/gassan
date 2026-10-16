import type { ReactNode } from 'react';

import { data } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { MdTable, md, Paras } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';

export function Purpose(): ReactNode {
  const { nav, purpose: t } = useT();
  const definition = data.code['1-1#0']?.text.trim();
  const reasons = data.tables['1-1'];

  return (
    <>
      <PageHeader eyebrow={nav.sections.foundations} title={nav.pages.purpose} lead={t.lead} />

      {definition ? (
        <blockquote className="s-definition">
          <p lang={SPEC_LANG}>{definition}</p>
          <footer>modal.skill.md §1-1</footer>
        </blockquote>
      ) : null}

      <Section id="reasons" title={t.reasons.title} intro={t.reasons.intro}>
        {reasons ? <MdTable table={reasons} caption={t.reasons.tableCaption} /> : null}
        <Prose>
          <Paras items={t.reasons.body} />
        </Prose>
      </Section>

      <Section id="alternatives" title={t.alternatives.title} intro={t.alternatives.intro}>
        <ul className="s-cards s-cards-3">
          {t.alternatives.items.map((alt) => (
            <li key={alt.name} className="s-card s-card-plain">
              <h3>{alt.name}</h3>
              <p className="s-card-when">{alt.when}</p>
              <p>{alt.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="guidelines" title={t.guidelines.title}>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.guidelines.doTitle}
                  lines={1}
                  width={58}
                  buttons={[
                    { label: t.guidelines.doCancel, variant: 'tertiary' },
                    { label: t.guidelines.doRemove, variant: 'danger' },
                  ]}
                />
              </MockScreen>
            }
          >
            {md(t.guidelines.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen scrim={0.6}>
                <MockPanel
                  title={t.guidelines.dontTitle}
                  lines={7}
                  width={80}
                  buttons={[{ label: t.guidelines.dontSave, variant: 'primary' }]}
                />
              </MockScreen>
            }
          >
            {md(t.guidelines.dont)}
          </Guideline>
        </Guidelines>
      </Section>
    </>
  );
}
