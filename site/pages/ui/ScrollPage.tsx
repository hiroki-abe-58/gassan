import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ScrollActivity from '../../demos/ScrollActivity';
import scrollActivitySource from '../../demos/ScrollActivity.tsx?raw';
import ScrollCustom from '../../demos/ScrollCustom';
import scrollCustomSource from '../../demos/ScrollCustom.tsx?raw';
import ScrollMonthly from '../../demos/ScrollMonthly';
import scrollMonthlySource from '../../demos/ScrollMonthly.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = ['U-35', 'B-05'];

export function UiScrollPage({ rest }: PageProps): ReactNode {
  const { nav, uiScroll: t } = useT();
  return (
    <ComponentPage
      path="/ui/scroll"
      rest={rest}
      title={nav.pages.uiScroll}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="basics" title={t.basics.title} intro={t.basics.intro}>
            <Example title={t.basics.exampleTitle} description={t.basics.exampleDescription} code={scrollActivitySource} demo="scrollActivity">
              <ScrollActivity />
            </Example>
          </Section>

          <Section id="horizontal" title={t.horizontal.title} intro={t.horizontal.intro}>
            <Example title={t.horizontal.exampleTitle} description={t.horizontal.exampleDescription} code={scrollMonthlySource} demo="scrollMonthly">
              <ScrollMonthly />
            </Example>
          </Section>

          <Section id="custom" title={t.custom.title} intro={t.custom.intro}>
            <Example title={t.custom.exampleTitle} description={t.custom.exampleDescription} code={scrollCustomSource} demo="scrollCustom">
              <ScrollCustom />
            </Example>
          </Section>

          <Section id="everywhere" title={t.everywhere.title} intro={t.everywhere.intro}>
            <DataTable caption={t.everywhere.tableCaption} head={[t.everywhere.head.part, t.everywhere.head.area]} rows={t.everywhere.rows.map((row) => [row.part, row.area])} />
          </Section>

          <Section id="modes" title={t.modes.title} intro={t.modes.intro}>
            <DataTable caption={t.modes.tableCaption} head={[t.modes.head.mode, t.modes.head.when]} rows={t.modes.rows.map((row) => [row.mode, row.when])} />
          </Section>

          <Section id="tokens" title={t.tokens.title} intro={t.tokens.intro}>
            <DataTable
              caption={t.tokens.tableCaption}
              head={[t.tokens.head.name, t.tokens.head.value, t.tokens.head.role]}
              rows={t.tokens.rows.map((row) => [row.name, row.value, row.role])}
            />
          </Section>

          <Section id="access" title={t.access.title} intro={t.access.intro}>
            <Prose>
              <Paras items={t.access.rows} />
            </Prose>
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ScrollAreaProps" title="ScrollArea" />
          <ApiTable name="PageScrollbarProps" title="PageScrollbar" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
