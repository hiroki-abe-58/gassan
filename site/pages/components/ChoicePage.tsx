import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import ChoiceForm from '../../demos/ChoiceForm';
import choiceFormSource from '../../demos/ChoiceForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md } from '../../ui/Markdown';
import { Callout, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

/** Switch と Chips は制御専用なので、見本にも値を持たせる。 */
function SwitchSpecimen({ label }: { label: string }): ReactNode {
  const [on, setOn] = useState(true);
  return (
    <Modal.Switch checked={on} onCheckedChange={setOn}>
      {label}
    </Modal.Switch>
  );
}

function ChipsSpecimen({ label, options }: { label: string; options: { value: string; label: string }[] }): ReactNode {
  const [value, setValue] = useState<string[]>([options[0]?.value ?? '']);
  return <Modal.Chips label={label} options={options} value={value} onChange={setValue} />;
}

export function ChoicePage({ rest }: PageProps): ReactNode {
  const { nav, choice: t } = useT();
  const { items, samples } = t.gallery;
  return (
    <ComponentPage
      path="/components/choice"
      rest={rest}
      title={nav.pages.choice}
      lead={t.lead}
      ids={['I-09', 'B-08']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                {
                  label: items.checkbox,
                  render: () => (
                    <Modal.Checkbox defaultChecked description={samples.termsNote}>
                      {samples.terms}
                    </Modal.Checkbox>
                  ),
                },
                {
                  label: items.mixed,
                  render: () => (
                    <Modal.Checkbox indeterminate description={samples.allNote}>
                      {samples.all}
                    </Modal.Checkbox>
                  ),
                },
                {
                  label: items.radio,
                  render: (id) => (
                    <Modal.RadioGroup
                      aria-labelledby={id}
                      defaultValue="team"
                      options={[
                        { value: 'free', label: samples.planFree, description: samples.planFreeNote },
                        { value: 'team', label: samples.planTeam, description: samples.planTeamNote },
                      ]}
                    />
                  ),
                },
                {
                  label: items.segmented,
                  render: (id) => (
                    <Modal.Segmented
                      aria-labelledby={id}
                      defaultValue="grid"
                      options={[
                        { value: 'list', label: samples.viewList },
                        { value: 'grid', label: samples.viewGrid },
                        { value: 'map', label: samples.viewMap },
                      ]}
                    />
                  ),
                },
                { label: items.rating, render: (id) => <Modal.Rating aria-labelledby={id} defaultValue={4} /> },
                { label: items.switch, render: () => <SwitchSpecimen label={samples.switchLabel} /> },
                {
                  label: items.chips,
                  render: () => (
                    <ChipsSpecimen
                      label={samples.chipsLabel}
                      options={[
                        { value: 'design', label: samples.chipDesign },
                        { value: 'a11y', label: samples.chipA11y },
                        { value: 'perf', label: samples.chipPerf },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={choiceFormSource} demo="choiceForm">
              <ChoiceForm />
            </Example>
          </Section>

          <Section id="fieldset" title={t.fieldset.title}>
            <Callout>{md(t.fieldset.callout)}</Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalCheckboxProps" title="Modal.Checkbox" />
          <ApiTable name="ModalRadioGroupProps" title="Modal.RadioGroup" />
          <ApiTable name="ChoiceOption" />
          <ApiTable name="ModalSegmentedProps" title="Modal.Segmented" />
          <ApiTable name="ModalRatingProps" title="Modal.Rating" />
          <ApiTable name="GroupAria" />
          <ApiTable name="ModalSwitchProps" title="Modal.Switch" />
          <ApiTable name="ModalChipsProps" title="Modal.Chips" />
          <ApiTable name="ChipOption" />
        </>
      )}
      a11y={() => <SpecTable ids={['I-01', 'I-09', 'B-08', 'K-04']} caption={t.a11yCaption} />}
    />
  );
}
