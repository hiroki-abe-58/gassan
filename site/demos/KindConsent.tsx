import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function KindConsent(): ReactNode {
  const t = useDemoText('kindConsent');
  const ARTICLES = [
    t.article1,
    t.article2,
    t.article3,
    t.article4,
    t.article5,
    t.article6,
  ];
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>
      <output className="s-demo-log">{agreed ? t.agreed : ''}</output>

      {/* t:noDismiss */}
      <Modal.Root kind="consent" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        {/* t:readGate */}
        <Modal.Body readGate="read">
          <div>
            {ARTICLES.map((text, i) => (
              <p key={i}>
                <strong>{fmt(t.articleNumber, String(i + 1))}</strong> {text}
              </p>
            ))}
          </div>
          <Modal.Consent gate="terms">{t.consent}</Modal.Consent>
          <Modal.GateStatus />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.decline}
          </Modal.Button>
          {/* t:gate */}
          <Modal.Button
            variant="primary"
            gate
            onClick={() => {
              setAgreed(true);
              setOpen(false);
            }}
          >
            {t.accept}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
