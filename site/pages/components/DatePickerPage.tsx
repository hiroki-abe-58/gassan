import type { ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import DateForm from '../../demos/DateForm';
import dateFormSource from '../../demos/DateForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

/** 端末の時刻での今日から days 日後（YYYY-MM-DD）。 */
function localISO(days = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('sv-SE');
}

export function DatePickerPage({ rest }: PageProps): ReactNode {
  const { nav, datePicker: t } = useT();
  const { items } = t.gallery;
  return (
    <ComponentPage
      path="/components/date-picker"
      rest={rest}
      title={nav.pages.datePicker}
      lead={t.lead}
      ids={['I-13', 'I-15']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                {
                  label: items.datePicker,
                  render: (id) => <Modal.DatePicker aria-labelledby={id} defaultValue={localISO()} />,
                },
                {
                  label: items.limited,
                  render: (id) => <Modal.DatePicker aria-labelledby={id} min={localISO()} max={localISO(30)} />,
                },
                { label: items.date, render: (id) => <Modal.Input aria-labelledby={id} type="date" defaultValue={localISO()} /> },
                { label: items.time, render: (id) => <Modal.Input aria-labelledby={id} type="time" defaultValue="19:00" /> },
                { label: items.color, render: (id) => <Modal.Input aria-labelledby={id} type="color" defaultValue="#3346d3" /> },
              ]}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={dateFormSource} demo="dateForm">
              <DateForm />
            </Example>
          </Section>

          <Section id="keys" title={t.keys.title}>
            <DataTable
              caption={t.keys.tableCaption}
              head={[t.keys.head.key, t.keys.head.action]}
              rows={t.keys.rows.map((row) => [<kbd key="key">{row.key}</kbd>, row.action])}
            />
          </Section>

          <Section id="native" title={t.native.title}>
            <Prose>
              <Paras items={t.native.body} />
            </Prose>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalDatePickerProps" title="Modal.DatePicker" />}
      a11y={() => <SpecTable ids={['I-01', 'I-02', 'I-13', 'I-15']} caption={t.a11yCaption} />}
    />
  );
}
