import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import GateCustom from '../../demos/GateCustom';
import gateSource from '../../demos/GateCustom.tsx?raw';
import KindConsent from '../../demos/KindConsent';
import consentSource from '../../demos/KindConsent.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function GatePage({ rest }: PageProps): ReactNode {
  const { nav, gate: t } = useT();
  return (
    <ComponentPage
      path="/components/gate"
      rest={rest}
      title={nav.pages.gate}
      lead={t.lead}
      ids={['G-01', 'G-02', 'G-03', 'G-07', 'G-08', 'G-12']}
      overview={() => (
        <>
          <Section id="consent" title={t.consent.title} intro={t.consent.intro}>
            <Example
              title={t.consent.exampleTitle}
              description={t.consent.exampleDescription}
              code={consentSource}
              demo="kindConsent"
            >
              <KindConsent />
            </Example>
          </Section>

          <Section id="custom" title={t.custom.title} intro={t.custom.intro}>
            <Example title={t.custom.exampleTitle} code={gateSource} demo="gateCustom">
              <GateCustom />
            </Example>
          </Section>

          <Section id="selector" title={t.selector.title}>
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.selector.tableLabel}>
              <table className="s-table">
                <caption className="s-sr-only">{t.selector.tableCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.selector.head.code}</th>
                    <th scope="col">{t.selector.head.before}</th>
                    <th scope="col">{t.selector.head.meaning}</th>
                  </tr>
                </thead>
                <tbody>
                  <Phrase>
                    {t.selector.rows.map((row) => (
                      <tr key={row.code}>
                        <th scope="row">
                          <code>{row.code}</code>
                        </th>
                        <td>{row.before}</td>
                        <td>{row.meaning}</td>
                      </tr>
                    ))}
                  </Phrase>
                </tbody>
              </table>
            </div>
            <Prose>
              <Paras items={t.selector.body} />
            </Prose>
          </Section>

          <Section id="rules" title={t.rules.title}>
            <KeyPoint tone="caution">{md(t.rules.callout)}</KeyPoint>
            <CodeBlock lang="tsx" caption={t.rules.codeCaption} code={t.rules.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalGateProps" title="Modal.Gate" />
          <ApiTable name="ModalConsentProps" title="Modal.Consent" />
          <ApiTable name="ModalGateStatusProps" title="Modal.GateStatus" />
          <ApiTable name="GateEntry" />
        </>
      )}
      a11y={() => {
        const ids = ['G-01', 'G-02', 'G-03', 'G-04', 'G-05', 'G-06', 'G-07', 'G-08', 'G-09', 'G-10', 'G-11', 'G-12'];
        return <SpecTable ids={ids} caption={t.a11yCaption} />;
      }}
    />
  );
}
