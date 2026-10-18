import type { ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import SliderForm from '../../demos/SliderForm';
import sliderFormSource from '../../demos/SliderForm.tsx?raw';
import { fmt, useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md } from '../../ui/Markdown';
import { Callout, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

export function SliderPage({ rest }: PageProps): ReactNode {
  const { nav, slider: t } = useT();
  const { items, samples } = t.gallery;
  const percent = (value: number): string => fmt(samples.percent, String(value));
  const yen = (value: number): string => fmt(samples.yen, value.toLocaleString());
  return (
    <ComponentPage
      path="/components/slider"
      rest={rest}
      title={nav.pages.slider}
      lead={t.lead}
      ids={['I-10']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                { label: items.slider, render: (id) => <Modal.Slider aria-labelledby={id} defaultValue={40} /> },
                {
                  label: items.value,
                  render: (id) => <Modal.Slider aria-labelledby={id} defaultValue={70} showValue formatValue={percent} />,
                },
                {
                  label: items.range,
                  render: (id) => (
                    <Modal.RangeSlider
                      aria-labelledby={id}
                      defaultValue={[3000, 7000]}
                      min={0}
                      max={10000}
                      step={500}
                      showValue
                      formatValue={yen}
                    />
                  ),
                },
                {
                  label: items.disabled,
                  render: (id) => <Modal.Slider aria-labelledby={id} defaultValue={30} disabled />,
                },
              ]}
            />
          </Section>

          <Section id="theme" title={t.theme.title}>
            <Callout>{md(t.theme.callout)}</Callout>
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={sliderFormSource} demo="sliderForm">
              <SliderForm />
            </Example>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalSliderProps" title="Modal.Slider" />
          <ApiTable name="ModalRangeSliderProps" title="Modal.RangeSlider" />
        </>
      )}
      a11y={() => <SpecTable ids={['I-01', 'I-10', 'I-09']} caption={t.a11yCaption} />}
    />
  );
}
