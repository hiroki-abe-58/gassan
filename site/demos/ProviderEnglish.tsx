import { useState, type ReactNode } from 'react';

import { GassanProvider, Modal, englishLabels } from '@genelab/gassan';

export default function ProviderEnglish(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    // ライブラリが出す文字列（閉じる・読了の理由・ステップの読み上げ…）は、例外なくここを通る
    <GassanProvider labels={{ ...englishLabels, required: 'Required' }}>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        Open in English
      </button>

      <Modal.Root kind="consent" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>Terms of service</Modal.Title>
        </Modal.Header>
        <Modal.Body readGate="read">
          <p>Read to the end, then tick the box. Press the button early to hear why it is not ready yet.</p>
          <Modal.Consent gate="terms">I agree to the updated terms</Modal.Consent>
          <Modal.GateStatus />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" gate closeOnClick="submit">
            Agree and continue
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </GassanProvider>
  );
}
