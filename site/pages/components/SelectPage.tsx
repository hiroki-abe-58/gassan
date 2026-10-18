import type { ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import SelectForm from '../../demos/SelectForm';
import selectFormSource from '../../demos/SelectForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

export function SelectPage({ rest }: PageProps): ReactNode {
  const { nav, select: t } = useT();
  const { items, samples } = t.gallery;
  const sizes = [
    { value: 'sm', label: samples.sizeS },
    { value: 'md', label: samples.sizeM },
    { value: 'lg', label: samples.sizeL },
  ];
  const cities = [
    { value: 'sapporo', label: samples.citySapporo },
    { value: 'tokyo', label: samples.cityTokyo },
    { value: 'nagoya', label: samples.cityNagoya },
    { value: 'osaka', label: samples.cityOsaka },
    { value: 'fukuoka', label: samples.cityFukuoka },
  ];
  return (
    <ComponentPage
      path="/components/select"
      rest={rest}
      title={nav.pages.select}
      lead={t.lead}
      ids={['I-11', 'I-12', 'I-02', 'C-12']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                { label: items.select, render: (id) => <Modal.Select aria-labelledby={id} options={sizes} defaultValue="md" /> },
                { label: items.placeholder, render: (id) => <Modal.Select aria-labelledby={id} options={sizes} /> },
                { label: items.combobox, render: (id) => <Modal.Combobox aria-labelledby={id} options={cities} /> },
                {
                  label: items.invalid,
                  render: (id) => <Modal.Select aria-labelledby={id} aria-invalid options={sizes} />,
                },
                {
                  label: items.disabled,
                  render: (id) => <Modal.Select aria-labelledby={id} disabled options={sizes} defaultValue="sm" />,
                },
              ]}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={selectFormSource} demo="selectForm">
              <SelectForm />
            </Example>
          </Section>

          <Section id="keys" title={t.keys.title}>
            <DataTable
              caption={t.keys.tableCaption}
              head={[t.keys.head.key, t.keys.head.select, t.keys.head.combobox]}
              rows={t.keys.rows.map((row) => [<kbd key="key">{row.key}</kbd>, row.select, row.combobox])}
            />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalSelectProps" title="Modal.Select" />
          <ApiTable name="SelectOption" />
          <ApiTable name="ModalComboboxProps" title="Modal.Combobox" />
          <ApiTable name="ControlAria" />
        </>
      )}
      a11y={() => <SpecTable ids={['I-01', 'I-02', 'I-11', 'I-12', 'C-12', 'K-04']} caption={t.a11yCaption} />}
    />
  );
}
