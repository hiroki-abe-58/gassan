import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function SliderForm(): ReactNode {
  const t = useDemoText('sliderForm');
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<[number, number]>([2000, 8000]);
  const [distance, setDistance] = useState(5);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:range */}
          <Modal.Fieldset label={t.price}>
            <Modal.RangeSlider
              value={price}
              onValueChange={setPrice}
              min={0}
              max={10000}
              step={500}
              showValue
              formatValue={(value) => fmt(t.yen, value.toLocaleString())}
            />
          </Modal.Fieldset>

          {/* t:format */}
          <Modal.Field label={t.distance}>
            {(control) => (
              <Modal.Slider
                {...control}
                value={distance}
                onValueChange={setDistance}
                min={1}
                max={20}
                showValue
                formatValue={(value) => fmt(t.km, String(value))}
              />
            )}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.apply}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
