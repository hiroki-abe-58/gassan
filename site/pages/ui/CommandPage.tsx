import type { ReactNode } from 'react';

import { Kbd } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import CommandMenu from '../../demos/CommandMenu';
import commandMenuSource from '../../demos/CommandMenu.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = ['U-27'];

export function UiCommandPage({ rest }: PageProps): ReactNode {
  const { nav, uiCommand: t } = useT();
  return (
    <ComponentPage
      path="/ui/command"
      rest={rest}
      title={nav.pages.uiCommand}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="example" title={t.example.title} intro={t.example.intro}>
            <Example title={t.example.exampleTitle} description={t.example.exampleDescription} code={commandMenuSource} demo="commandMenu">
              <CommandMenu />
            </Example>
          </Section>

          <Section id="matching" title={t.matching.title} intro={t.matching.intro}>
            <DataTable
              caption={t.matching.tableCaption}
              head={[t.matching.head.rank, t.matching.head.rule, t.matching.head.typed, t.matching.head.hits]}
              rows={t.matching.rows.map((row) => [row.rank, row.rule, row.typed, row.hits])}
            />
          </Section>

          <Section id="site" title={t.site.title} intro={t.site.intro}>
            <p className="s-keys">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span aria-hidden="true">/</span>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </p>
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="CommandPaletteProps" title="CommandPalette" />
          <ApiTable name="CommandItem" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
