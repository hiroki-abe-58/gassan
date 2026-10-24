import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function DateForm(): ReactNode {
  const t = useDemoText('dateForm');
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  // t:today
  const today = new Date().toLocaleDateString('sv-SE');

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
          {/* t:calendar */}
          <Modal.Field label={t.date} help={t.dateHelp} required>
            {(control) => <Modal.DatePicker {...control} value={date} onValueChange={setDate} min={today} />}
          </Modal.Field>

          {/* t:time */}
          <Modal.Field label={t.time} help={t.timeHelp}>
            {(control) => <Modal.TimePicker {...control} defaultValue="19:00" step={15} min="11:00" max="21:00" />}
          </Modal.Field>

          <Modal.Field label={t.people}>
            {(control) => <Modal.NumberField {...control} defaultValue={2} min={1} max={8} unit={t.peopleUnit} />}
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
