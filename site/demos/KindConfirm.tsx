import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function KindConfirm(): ReactNode {
  const t = useDemoText('kindConfirm');
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState('');

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>
      <output className="s-demo-log">
        <Phrase>{log}</Phrase>
      </output>

      <Modal.Root
        kind="confirm"
        size="sm"
        open={open}
        onOpenChange={(next, reason) => {
          setOpen(next);
          if (!next) setLog(fmt(t.closedReason, reason));
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>{t.description}</Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          {/* t:danger */}
          <Modal.Button
            variant="danger"
            closeOnClick="submit"
            onAction={() => new Promise((resolve) => setTimeout(resolve, 700))}
          >
            {t.confirm}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
