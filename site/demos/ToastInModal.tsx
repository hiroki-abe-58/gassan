import { useState, type ReactNode } from 'react';

import { Modal, Phrase, toast } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ToastInModal(): ReactNode {
  const t = useDemoText('toastInModal');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="view" size="sm" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t.body}</p>
          {/* t:modal */}
          <button type="button" className="s-btn s-btn-tonal" onClick={() => toast.success(t.copied)}>
            <Phrase>{t.copy}</Phrase>
          </button>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="close-button">
            {t.done}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
