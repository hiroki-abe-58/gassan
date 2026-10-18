import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function FooterButtons(): ReactNode {
  const t = useDemoText('footerButtons');
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen} submitShortcut>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>
            {fmt(t.description, String(count))}
          </Modal.Description>
        </Modal.Body>

        {/* t:order */}
        <Modal.Footer note={t.note}>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="secondary" onAction={() => wait(600)}>
            {t.saveDraft}
          </Modal.Button>
          <Modal.Button
            variant="primary"
            closeOnClick="submit"
            onAction={async () => {
              setCount((c) => c + 1);
              await wait(1200);
            }}
          >
            {t.publish}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
