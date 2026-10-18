import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
import { useDemoText } from '../i18n';

export default function QuickStart(): ReactNode {
  const t = useDemoText('quickStart');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      {/* t:alwaysMounted */}
      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label={t.name} required>
            {(control) => <Modal.Input {...control} />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.save}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
