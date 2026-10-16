import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../data';
import QuickStart from '../demos/QuickStart';
import quickStartSource from '../demos/QuickStart.tsx?raw';
import { SPEC_LANG, useT } from '../i18n';
import { to } from '../router';
import { CodeBlock } from '../ui/Code';
import { Example } from '../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../ui/Guidelines';
import { MdTable, md, Paras } from '../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../ui/Page';

export function GetStarted(): ReactNode {
  const { nav, start: t } = useT();
  const support = data.tables['1-4'];
  const rules = data.code['9#0'];

  return (
    <>
      <PageHeader eyebrow={nav.sections.start} title={nav.pages.start} lead={t.lead} ids={['D-01', 'D-02', 'D-03']} />

      <Section id="install" title={t.install.title}>
        <Prose>
          <Paras items={t.install.body} />
        </Prose>
        <CodeBlock code="npm install @genelab/gassan" lang="bash" caption="shell" />
        <CodeBlock
          code={`import { Modal } from '@genelab/gassan';\nimport '@genelab/gassan/styles.css';`}
          lang="tsx"
          caption="app.tsx"
        />
        <Callout>{md(t.install.nextjs)}</Callout>
      </Section>

      <Section id="minimal" title={t.minimal.title} intro={t.minimal.intro}>
        <Example title={t.minimal.exampleTitle} code={quickStartSource} demo="quickStart">
          <QuickStart />
        </Example>
      </Section>

      <Section id="always-mounted" title={t.alwaysMounted.title}>
        <Prose>
          <Paras items={t.alwaysMounted.body} />
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={<CodeVisual code={'<Modal.Root open={open} onOpenChange={setOpen}>\n  …\n</Modal.Root>'} />}
          >
            {md(t.alwaysMounted.do)}
          </Guideline>
          <Guideline tone="dont" visual={<CodeVisual code={'{open && (\n  <Modal.Root open onOpenChange={setOpen}>…'} />}>
            {md(t.alwaysMounted.dont)}
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="choose" title={t.choose.title}>
        <Prose>
          <Paras items={t.choose.body} />
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.choose.doTitle}
                  lines={1}
                  width={56}
                  buttons={[
                    { label: t.choose.doCancel, variant: 'tertiary' },
                    { label: t.choose.doDelete, variant: 'danger' },
                  ]}
                />
              </MockScreen>
            }
          >
            {md(t.choose.do)}
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel
                  title={t.choose.dontTitle}
                  lines={4}
                  width={56}
                  buttons={[{ label: t.choose.dontSave, variant: 'primary' }]}
                />
              </MockScreen>
            }
          >
            {md(t.choose.dont)}
          </Guideline>
        </Guidelines>
        <p className="s-more">
          <a href={to('/foundations/kinds')}>
            <Phrase>{t.choose.more}</Phrase>
          </a>
        </p>
      </Section>

      <Section id="imperative" title={t.imperative.title}>
        <Prose>
          <Paras items={t.imperative.body} />
        </Prose>
        <CodeBlock code={t.imperative.code} lang="tsx" />
      </Section>

      {support ? (
        <Section id="browsers" title={t.browsers.title} intro={t.browsers.intro}>
          <MdTable table={support} caption={t.browsers.tableCaption} />
        </Section>
      ) : null}

      {rules ? (
        <Section id="ai" title={t.ai.title} intro={t.ai.intro}>
          <CodeBlock code={rules.text} lang="text" caption="modal.skill.md §9" textLang={SPEC_LANG} />
        </Section>
      ) : null}
    </>
  );
}

function CodeVisual({ code }: { code: string }): ReactNode {
  return <pre className="s-mock-code">{code}</pre>;
}
