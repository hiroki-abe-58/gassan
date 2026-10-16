import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function BodyScroll(): ReactNode {
  const t = useDemoText('bodyScroll');
  const [open, setOpen] = useState(false);

  const RELEASES = [
    { version: 'v3.2', notes: [t.linkExpiry, t.fasterSearch] },
    { version: 'v3.1', notes: [t.darkBorders, t.notifyOff] },
    { version: 'v3.0', notes: [t.workspaces, t.legacyApi] },
    { version: 'v2.9', notes: [t.csvColumns, t.shortcuts] },
    { version: 'v2.8', notes: [t.imagePaste, t.largeTables] },
  ];

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root kind="view" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        {/* t:scroll */}
        <Modal.Body label={t.bodyLabel}>
          {RELEASES.map((release) => (
            <Modal.Section key={release.version} title={release.version}>
              <ul>
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Modal.Section>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="close-button">
            {t.close}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
