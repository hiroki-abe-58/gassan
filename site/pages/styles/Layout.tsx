import type { CSSProperties, ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import { token } from '../../data/tokens';
import { useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { md } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

const PLACEMENTS: readonly { name: 'center' | 'top' | 'sheet'; align: 'center' | 'top' | 'bottom' }[] = [
  { name: 'center', align: 'center' },
  { name: 'top', align: 'top' },
  { name: 'sheet', align: 'bottom' },
];

export function Layout(): ReactNode {
  const { nav, layout: t } = useT();
  const max = Number.parseFloat(token('--g-size-xl').light);
  const containerIds = data.categories.find((c) => c.letter === 'C')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.styles}
        title={nav.pages.layout}
        lead={t.lead}
        ids={['C-01', 'C-02', 'C-03', 'C-05', 'M-09']}
      />

      <Section id="size" title={t.size.title} intro={t.size.intro}>
        <ul className="s-size-bars">
          {SIZES.map((size) => {
            const value = token(`--g-size-${size}`).light;
            return (
              <li key={size}>
                <code>{size}</code>
                <span className="s-size-track" aria-hidden="true">
                  <span className="s-size-fill" style={{ '--s-size': Number.parseFloat(value) / max } as CSSProperties} />
                </span>
                <span className="s-num">{value}</span>
              </li>
            );
          })}
          <li>
            <code>full</code>
            <span className="s-size-track" aria-hidden="true">
              <span className="s-size-fill" data-full="" />
            </span>
            <span className="s-num">100%</span>
          </li>
        </ul>
      </Section>

      <Section id="placement" title={t.placement.title} intro={t.placement.intro}>
        <ul className="s-placements">
          {PLACEMENTS.map((p) => (
            <li key={p.name}>
              <div className="s-placement-visual" aria-hidden="true">
                <MockScreen align={p.align}>
                  <MockPanel
                    title={t.placement.mockTitle}
                    lines={2}
                    width={p.name === 'sheet' ? 100 : 58}
                    sheet={p.name === 'sheet'}
                  />
                </MockScreen>
              </div>
              <p>
                <code>{p.name}</code>
              </p>
              <p className="s-placement-when">
                <Phrase>{t.placement.when[p.name]}</Phrase>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="grid" title={t.grid.title} intro={t.grid.intro}>
        <CodeBlock lang="css" code={t.grid.code} caption={t.grid.codeCaption} />
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.grid.mockTitle}
                  lines={6}
                  width={60}
                  buttons={[{ label: t.grid.mockClose, variant: 'primary' }]}
                >
                  <span className="s-mock-scrollbar" />
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.grid.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen align="top">
                <MockPanel lines={9} width={60}>
                  <span className="s-mock-cut">{t.grid.mockCut}</span>
                </MockPanel>
              </MockScreen>
            }
          >
            {md(t.grid.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="touch" title={t.touch.title}>
        <Prose>
          <p>{md(t.touch.body(token('--g-tap').light))}</p>
        </Prose>
        <Callout>{md(t.touch.callout)}</Callout>
      </Section>

      <Section id="spec" title={t.spec.title}>
        <SpecTable ids={containerIds} caption={t.spec.tableCaption} />
      </Section>
    </>
  );
}
