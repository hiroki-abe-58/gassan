import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function TextForm(): ReactNode {
  const t = useDemoText('textForm');
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState<number | null>(3);
  const [code, setCode] = useState('');

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen} onExited={() => setCode('')}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label={t.name} required>
            {(control) => <Modal.Input {...control} autoComplete="nickname" />}
          </Modal.Field>

          {/* t:password */}
          <Modal.Field label={t.password} help={t.passwordHelp} required>
            {(control) => <Modal.PasswordInput {...control} autoComplete="new-password" minLength={8} />}
          </Modal.Field>

          {/* t:counter */}
          <Modal.Field label={t.bio}>
            {(control) => <Modal.Textarea {...control} maxLength={140} placeholder={t.bioPlaceholder} />}
          </Modal.Field>

          <Modal.Field label={t.seats} help={t.seatsHelp}>
            {(control) => (
              <Modal.NumberField {...control} value={seats} onValueChange={setSeats} min={1} max={20} unit={t.seatsUnit} />
            )}
          </Modal.Field>

          {/* t:code */}
          <Modal.Field label={t.code} help={t.codeHelp}>
            {(control) => <Modal.CodeInput {...control} value={code} onValueChange={setCode} />}
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
