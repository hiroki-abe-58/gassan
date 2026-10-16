import type { ReactNode } from 'react';

import { data } from '../../data';
import { scrimLevels, token } from '../../data/tokens';
import ScrimLevels from '../../demos/ScrimLevels';
import scrimSource from '../../demos/ScrimLevels.tsx?raw';
import { SPEC_LANG, useT } from '../../i18n';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { inline, MdTable, md, Paras } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function Scrim(): ReactNode {
  const { nav, scrim: t } = useT();
  const levels = scrimLevels();
  const blur = Number.parseFloat(token('--g-scrim-blur-immersive').light);
  const table = data.tables['3-1'];
  const blurConditions = (data.code['3-1#0']?.text ?? '')
    .split('\n')
    .map((line) => /^□\s*(.+)$/.exec(line.trim())?.[1])
    .filter((line): line is string => Boolean(line));
  const scrimIds = data.categories.find((c) => c.letter === 'S')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader eyebrow={nav.sections.styles} title={nav.pages.scrim} lead={t.lead} ids={['S-01', 'S-02', 'S-04', 'S-07']} />

      <Section id="levels" title={t.levels.title} intro={t.levels.intro}>
        <ul className="s-scrim-grid">
          {levels.map((level) => (
            <li key={level.token}>
              <figure className="s-scrim-sample">
                <div aria-hidden="true">
                  <MockScreen scrim={level.alpha} blur={level.token === 'immersive' ? blur / 3 : 0}>
                    <MockPanel
                      title={t.levels.mockTitle}
                      lines={1}
                      width={70}
                      buttons={[{ label: t.levels.mockDelete, variant: 'danger' }]}
                    />
                  </MockScreen>
                </div>
                <figcaption>
                  <code>{level.token}</code>
                  <span>
                    {Math.round(level.alpha * 100)}%{level.token === 'immersive' ? ` + blur ${String(blur)}px` : ''}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {table ? <MdTable table={table} caption={t.levels.tableCaption} align={[undefined, 'right', 'right']} /> : null}
      </Section>

      <Section id="try" title={t.try.title}>
        <Example title={t.try.exampleTitle} description={t.try.exampleDescription} code={scrimSource} demo="scrimLevels">
          <ScrimLevels />
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
              <MockScreen scrim={0.32}>
                <MockPanel
                  title={t.why.mockTitle}
                  lines={1}
                  width={58}
                  buttons={[{ label: t.why.mockDelete, variant: 'danger' }]}
                />
              </MockScreen>
            }
          >
            {md(t.why.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen scrim={0.78}>
                <MockPanel
                  title={t.why.mockTitle}
                  lines={1}
                  width={58}
                  buttons={[{ label: t.why.mockDelete, variant: 'danger' }]}
                />
              </MockScreen>
            }
          >
            {md(t.why.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="blur" title={t.blur.title} intro={t.blur.intro}>
        {/* 条件は仕様書のコードブロックを分解したもの。原文のまま出す */}
        <ul className="s-checks" lang={SPEC_LANG}>
          {blurConditions.map((line) => (
            <li key={line}>{inline(line)}</li>
          ))}
        </ul>
        <Prose>
          <Paras items={t.blur.body} />
        </Prose>
      </Section>

      <Section id="dark" title={t.dark.title} intro={t.dark.intro}>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <div className="s-dark-sample" data-variant="lift">
                <MockScreen scrim={0.32}>
                  <MockPanel
                    title={t.dark.mockTitle}
                    lines={1}
                    width={60}
                    buttons={[{ label: t.dark.mockSave, variant: 'primary' }]}
                  />
                </MockScreen>
              </div>
            }
          >
            {md(t.dark.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <div className="s-dark-sample" data-variant="darken">
                <MockScreen scrim={0.72}>
                  <MockPanel
                    title={t.dark.mockTitle}
                    lines={1}
                    width={60}
                    buttons={[{ label: t.dark.mockSave, variant: 'primary' }]}
                  />
                </MockScreen>
              </div>
            }
          >
            {md(t.dark.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="spec" title={t.spec.title}>
        <SpecTable ids={scrimIds} caption={t.spec.tableCaption} />
      </Section>
    </>
  );
}
