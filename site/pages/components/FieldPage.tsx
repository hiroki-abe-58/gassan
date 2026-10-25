import type { ReactNode } from 'react';

import type { PageKey, PageProps } from '../../routes';
import FieldForm from '../../demos/FieldForm';
import fieldSource from '../../demos/FieldForm.tsx?raw';
import FloatingModal from '../../demos/FloatingModal';
import floatingModalSource from '../../demos/FloatingModal.tsx?raw';
import FloatingSignIn from '../../demos/FloatingSignIn';
import floatingSignInSource from '../../demos/FloatingSignIn.tsx?raw';
import FloatingStates from '../../demos/FloatingStates';
import floatingStatesSource from '../../demos/FloatingStates.tsx?raw';
import { useLang, useT } from '../../i18n';
import { to } from '../../router';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

/** gassan の入力部品と、それを載せたページ。部品の名前はコードなので訳さない。 */
const PARTS: readonly { key: PageKey; path: string; parts: string }[] = [
  {
    key: 'textInput',
    path: '/components/text-input',
    parts: 'Input · PasswordInput · SearchInput · Textarea · NumberField · CodeInput',
  },
  { key: 'choice', path: '/components/choice', parts: 'Checkbox · RadioGroup · Segmented · Rating · Switch · Chips' },
  { key: 'select', path: '/components/select', parts: 'Select · Combobox' },
  { key: 'slider', path: '/components/slider', parts: 'Slider · RangeSlider' },
  { key: 'datePicker', path: '/components/date-picker', parts: 'DatePicker · Input type="date" / "time" / "color"' },
  { key: 'fileDrop', path: '/components/file-drop', parts: 'FileDrop' },
];

export function FieldPage({ rest }: PageProps): ReactNode {
  const { nav, field: t } = useT();
  const lang = useLang();
  return (
    <ComponentPage
      path="/components/field"
      rest={rest}
      title={nav.pages.field}
      lead={t.lead}
      ids={['B-08', 'B-09', 'B-13', 'I-01', 'I-24']}
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

          <Section id="floating" title={t.floating.title} intro={t.floating.intro}>
            <Example title={t.floating.signInTitle} description={t.floating.signInDescription} code={floatingSignInSource} demo="floatingSignIn">
              <FloatingSignIn />
            </Example>
            <Example title={t.floating.statesTitle} description={t.floating.statesDescription} code={floatingStatesSource} demo="floatingStates">
              <FloatingStates />
            </Example>
            <Example title={t.floating.modalTitle} description={t.floating.modalDescription} code={floatingModalSource} demo="floatingModal">
              <FloatingModal />
            </Example>
            <Prose>
              <Paras items={t.floating.notes} />
            </Prose>
          </Section>

          <Section id="parts" title={t.parts.title}>
            <DataTable
              caption={t.parts.tableCaption}
              head={[t.parts.head.page, t.parts.head.parts]}
              rows={PARTS.map((part) => [
                <a key="page" href={to(part.path, lang)}>
                  {nav.pages[part.key]}
                </a>,
                <code key="parts">{part.parts}</code>,
              ])}
            />
            <Prose>
              <Paras items={t.parts.body} />
            </Prose>
          </Section>

          <Section id="errors" title={t.errors.title}>
            <KeyPoint>{md(t.errors.callout)}</KeyPoint>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalFieldProps" title="Modal.Field" />
          <ApiTable name="FieldControlProps" title={t.apiControl} />
          <ApiTable name="ModalFieldsetProps" title="Modal.Fieldset" />
          <ApiTable name="ControlAria" title={t.apiAria} />
          <ApiTable name="ModalTableProps" title="Modal.Table" />
          <ApiTable name="ModalAlertProps" title="Modal.Alert" />
        </>
      )}
      a11y={() => <SpecTable ids={['B-08', 'B-09', 'B-13', 'I-01', 'I-09', 'I-24', 'C-12', 'K-04', 'D-13']} caption={t.a11yCaption} />}
    />
  );
}
