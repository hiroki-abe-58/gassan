import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function TitleClamp(): ReactNode {
  const t = useDemoText('titleClamp');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="form" size="sm" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          {/* t:clamp */}
          <Modal.Title lines={2}>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>{t.description}</Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.submit}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
