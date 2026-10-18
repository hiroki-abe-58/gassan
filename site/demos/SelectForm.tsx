import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function SelectForm(): ReactNode {
  const t = useDemoText('selectForm');
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [method, setMethod] = useState('standard');
  const [slot, setSlot] = useState<string | null>(null);

  const COUNTRIES = [
    { value: 'us', label: t.usa },
    { value: 'gb', label: t.uk },
    { value: 'it', label: t.italy },
    { value: 'in', label: t.india },
    { value: 'au', label: t.australia },
    { value: 'ca', label: t.canada },
    { value: 'kr', label: t.korea },
    { value: 'es', label: t.spain },
    { value: 'th', label: t.thailand },
    { value: 'tw', label: t.taiwan },
    { value: 'de', label: t.germany },
    { value: 'fr', label: t.france },
    { value: 'br', label: t.brazil },
    { value: 'vn', label: t.vietnam },
    { value: 'mx', label: t.mexico },
  ];

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
          {/* t:combobox */}
          <Modal.Field label={t.country} help={t.countryHelp} required>
            {(control) => <Modal.Combobox {...control} options={COUNTRIES} value={country} onValueChange={setCountry} />}
          </Modal.Field>

          {/* t:select */}
          <Modal.Field label={t.method} required>
            {(control) => (
              <Modal.Select
                {...control}
                value={method}
                onValueChange={setMethod}
                options={[
                  { value: 'standard', label: t.standard },
                  { value: 'express', label: t.express },
                  { value: 'pickup', label: t.pickup },
                ]}
              />
            )}
          </Modal.Field>

          <Modal.Field label={t.slot}>
            {(control) => (
              <Modal.Select
                {...control}
                value={slot}
                onValueChange={setSlot}
                options={[
                  { value: 'am', label: t.morning },
                  { value: '14', label: t.afternoon },
                  { value: '18', label: t.evening },
                  { value: '19', label: t.night, disabled: method !== 'express' },
                ]}
              />
            )}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.submit}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
