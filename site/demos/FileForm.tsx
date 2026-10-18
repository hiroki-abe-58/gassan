import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function FileForm(): ReactNode {
  const t = useDemoText('fileForm');
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root
        kind="form"
        open={open}
        onOpenChange={setOpen}
        onExited={() => {
          setFiles([]);
          setRejected([]);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:reject */}
          <Modal.Field
            label={t.documents}
            help={t.documentsHelp}
            error={rejected.length > 0 ? fmt(t.rejected, rejected.join(', ')) : undefined}
            required
          >
            {(control) => (
              <Modal.FileDrop
                {...control}
                accept=".pdf,image/*"
                multiple
                value={files}
                onValueChange={(next) => {
                  setFiles(next);
                  setRejected([]);
                }}
                onReject={(bad) => setRejected(bad.map((file) => file.name))}
              />
            )}
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
