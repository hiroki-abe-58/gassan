import { useId, useState, type ReactNode } from 'react';

import { Modal, Phrase, type PasswordRule } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import TextForm from '../../demos/TextForm';
import textFormSource from '../../demos/TextForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Prose, Section } from '../../ui/Page';
import { DataTable } from '../../ui/DataTable';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

/** 打つたびに強さが変わる見本。強さの表示は入力欄の説明（aria-describedby）として結ぶ。 */
function StrengthSample({ labelId, initial, rules }: { labelId: string; initial: string; rules?: readonly PasswordRule[] }): ReactNode {
  const [value, setValue] = useState(initial);
  const strengthId = useId();
  return (
    <div className="s-strength-sample">
      <Modal.PasswordInput aria-labelledby={labelId} aria-describedby={strengthId} value={value} onChange={(event) => setValue(event.target.value)} />
      <Modal.PasswordStrength id={strengthId} value={value} rules={rules} />
    </div>
  );
}

export function TextInputPage({ rest }: PageProps): ReactNode {
  const { nav, textInput: t } = useT();
  const { items, samples } = t.gallery;
  const { samples: tag } = t.tags;
  return (
    <ComponentPage
      path="/components/text-input"
      rest={rest}
      title={nav.pages.textInput}
      lead={t.lead}
      ids={['I-03', 'I-04', 'I-05', 'I-06', 'I-07', 'I-08', 'I-21', 'I-22']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                { label: items.plain, render: (id) => <Modal.Input aria-labelledby={id} defaultValue={samples.name} /> },
                {
                  label: items.adorned,
                  render: (id) => (
                    <Modal.Input aria-labelledby={id} inputMode="numeric" defaultValue={samples.price} start={samples.yen} end={samples.perMonth} />
                  ),
                },
                { label: items.password, render: (id) => <Modal.PasswordInput aria-labelledby={id} defaultValue="correct-horse" /> },
                { label: items.search, render: (id) => <Modal.SearchInput aria-labelledby={id} placeholder={samples.search} /> },
                {
                  label: items.textarea,
                  render: (id) => <Modal.Textarea aria-labelledby={id} maxLength={140} defaultValue={samples.bio} rows={2} />,
                },
                {
                  label: items.number,
                  render: (id) => <Modal.NumberField aria-labelledby={id} defaultValue={3} min={1} max={20} unit={samples.seats} />,
                },
                { label: items.code, render: (id) => <Modal.CodeInput aria-labelledby={id} defaultValue="48" /> },
                {
                  label: items.invalid,
                  render: (id) => <Modal.Input aria-labelledby={id} aria-invalid type="email" defaultValue={samples.invalidValue} />,
                },
                { label: items.disabled, render: (id) => <Modal.Input aria-labelledby={id} disabled defaultValue={samples.name} /> },
              ]}
            />
          </Section>

          <Section id="tags" title={t.tags.title} intro={t.tags.intro}>
            <Specimens
              caption={t.tags.title}
              items={[
                {
                  label: t.tags.items.plain,
                  render: (id) => <Modal.TagInput aria-labelledby={id} defaultValue={[tag.design, tag.billing]} placeholder={tag.placeholder} />,
                },
                {
                  label: t.tags.items.suggestions,
                  render: (id) => (
                    <Modal.TagInput
                      aria-labelledby={id}
                      suggestions={[tag.sales, tag.engineering, tag.support, tag.hiring]}
                      placeholder={tag.placeholder}
                    />
                  ),
                },
                { label: t.tags.items.limit, render: (id) => <Modal.TagInput aria-labelledby={id} max={3} defaultValue={[tag.sales, tag.engineering]} /> },
              ]}
            />
          </Section>

          <Section id="strength" title={t.strength.title} intro={t.strength.intro}>
            <Specimens
              caption={t.strength.title}
              items={[
                { label: t.strength.items.live, render: (id) => <StrengthSample labelId={id} initial={t.strength.samples.password} /> },
                {
                  label: t.strength.items.custom,
                  render: (id) => (
                    <StrengthSample
                      labelId={id}
                      initial={t.strength.samples.passphrase}
                      rules={[{ id: 'long', label: t.strength.samples.longRule, test: (password) => [...password].length >= 15 }]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={textFormSource} demo="textForm">
              <TextForm />
            </Example>
          </Section>

          <Section id="adds" title={t.adds.title}>
            <DataTable caption={t.adds.tableCaption} head={[t.adds.head.part, t.adds.head.adds]} rows={t.adds.rows.map((row) => [row.part, row.adds])} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalInputProps" title="Modal.Input" />
          <Prose>
            <p>
              <Phrase>{t.apiNote}</Phrase>
            </p>
          </Prose>
          <ApiTable name="ModalNumberFieldProps" title="Modal.NumberField" />
          <ApiTable name="ModalCodeInputProps" title="Modal.CodeInput" />
          <ApiTable name="ModalTagInputProps" title="Modal.TagInput" />
          <ApiTable name="ModalPasswordStrengthProps" title="Modal.PasswordStrength" />
          <ApiTable name="PasswordRule" />
        </>
      )}
      a11y={() => (
        <SpecTable ids={['I-01', 'I-03', 'I-04', 'I-05', 'I-06', 'I-07', 'I-08', 'I-15', 'I-21', 'I-22', 'B-08']} caption={t.a11yCaption} />
      )}
    />
  );
}
