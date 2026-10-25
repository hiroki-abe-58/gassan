import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function FloatingModal(): ReactNode {
  const t = useDemoText('floatingModal');
  const [open, setOpen] = useState(false);

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
          {/* t:modal */}
          <Modal.Field label={t.account} labelPlacement="floating" required requiredBadge={false}>
            {(control) => <Modal.Input {...control} type="text" name="account" autoComplete="username" />}
          </Modal.Field>
          <Modal.Field label={t.password} labelPlacement="floating" required requiredBadge={false}>
            {(control) => <Modal.PasswordInput {...control} name="password" autoComplete="current-password" />}
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
