import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import FieldForm from '../../demos/FieldForm';
import fieldSource from '../../demos/FieldForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function FieldPage({ rest }: PageProps): ReactNode {
  const { nav, field: t } = useT();
  return (
    <ComponentPage
      path="/components/field"
      rest={rest}
      title={nav.pages.field}
      lead={t.lead}
      ids={['B-08', 'B-09', 'B-13']}
      overview={() => (
        <>
          <Section id="field" title={t.field.title} intro={t.field.intro}>
            <Example
              title={t.field.exampleTitle}
              description={t.field.exampleDescription}
              code={fieldSource}
              demo="fieldForm"
            >
              <FieldForm />
            </Example>
          </Section>

          <Section id="delegate" title={t.delegate.title}>
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.delegate.tableCaption}>
              <table className="s-table">
                <caption className="s-sr-only">{t.delegate.tableCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.delegate.head.control}</th>
                    <th scope="col">{t.delegate.head.use}</th>
                  </tr>
                </thead>
                <tbody>
                  <Phrase>
                    {t.delegate.rows.map((row) => (
                      <tr key={row.control}>
                        <th scope="row">{row.control}</th>
                        <td>{row.use}</td>
                      </tr>
                    ))}
                  </Phrase>
                </tbody>
              </table>
            </div>
            <Prose>
              <Paras items={t.delegate.body} />
            </Prose>
          </Section>

          <Section id="errors" title={t.errors.title}>
            <Callout>{md(t.errors.callout)}</Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalFieldProps" title="Modal.Field" />
          <ApiTable name="FieldControlProps" title={t.apiControl} />
          <ApiTable name="ModalChipsProps" title="Modal.Chips" />
          <ApiTable name="ChipOption" />
          <ApiTable name="ModalSwitchProps" title="Modal.Switch" />
          <ApiTable name="ModalTableProps" title="Modal.Table" />
          <ApiTable name="ModalAlertProps" title="Modal.Alert" />
        </>
      )}
      a11y={() => <SpecTable ids={['B-08', 'B-09', 'B-13', 'C-12', 'K-04', 'D-13']} caption={t.a11yCaption} />}
    />
  );
}
