import { useState, type ReactNode } from 'react';

import { GassanProvider, Modal } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function LineBreakModal(): ReactNode {
  const t = useDemoText('lineBreakModal');
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState(true);

  return (
    <>
      <label className="s-toggle">
        <input type="checkbox" checked={phrase} onChange={(event) => setPhrase(event.target.checked)} />
        {t.toggle}
      </label>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      {/* t:mode */}
      <GassanProvider lineBreak={phrase ? 'phrase' : 'browser'}>
        <Modal.Root kind="confirm" size="sm" open={open} onOpenChange={setOpen}>
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>{t.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>{t.description}</Modal.Description>
            <Modal.Table label={t.tableLabel}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t.headTarget}</th>
                    <th scope="col">{t.headRole}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t.row1Target}</td>
                    <td>{t.row1Role}</td>
                  </tr>
                  <tr>
                    <td>{t.row2Target}</td>
                    <td>{t.row2Role}</td>
                  </tr>
                </tbody>
              </table>
            </Modal.Table>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="secondary" closeOnClick="close-button">
              {t.draft}
            </Modal.Button>
            <Modal.Button variant="primary" closeOnClick="submit">
              {t.share}
            </Modal.Button>
          </Modal.Footer>
        </Modal.Root>
      </GassanProvider>
    </>
  );
}
