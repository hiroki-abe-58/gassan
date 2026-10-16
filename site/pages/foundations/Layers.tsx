import type { ReactNode } from 'react';

import { data } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { LayerStack } from '../../ui/LayerStack';
import { MdTable, md, Paras } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';

export function Layers(): ReactNode {
  const { nav, layers: t } = useT();
  const premise = data.tables['1-3'];
  const coreCss = data.code['7#0'];
  const coreTsx = data.code['7#1'];

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.foundations}
        title={nav.pages.layers}
        lead={t.lead}
        ids={['L-01', 'L-02', 'K-01', 'D-01']}
      />

      <Section id="model" title={t.model.title}>
        <LayerStack detailed />
      </Section>

      <Section id="effort" title={t.effort.title}>
        <Callout>{md(t.effort.callout)}</Callout>
        <Prose>
          <Paras items={t.effort.body} />
        </Prose>
      </Section>

      {premise ? (
        <Section id="premise" title={t.premise.title} intro={t.premise.intro}>
          <MdTable table={premise} caption={t.premise.tableCaption} />
        </Section>
      ) : null}

      {coreCss && coreTsx ? (
        <Section id="core" title={t.core.title} intro={t.core.intro}>
          <CodeBlock code={coreCss.text} lang="css" caption={t.core.cssCaption} textLang={SPEC_LANG} />
          <CodeBlock code={coreTsx.text} lang="tsx" caption={t.core.tsxCaption} textLang={SPEC_LANG} />
        </Section>
      ) : null}
    </>
  );
}
