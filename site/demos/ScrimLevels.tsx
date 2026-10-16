import { useState, type ReactNode } from 'react';

import { Modal, type ScrimToken } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ScrimLevels(): ReactNode {
  const t = useDemoText('scrimLevels');
  const [token, setToken] = useState<ScrimToken | null>(null);
  const LEVELS: readonly { token: ScrimToken; use: string }[] = [
    { token: 'subtle', use: t.subtle },
    { token: 'default', use: t.default },
    { token: 'strong', use: t.strong },
    { token: 'immersive', use: t.immersive },
  ];

  return (
    <>
      <div className="s-demo-row">
        {LEVELS.map((level) => (
          <button key={level.token} type="button" className="s-btn s-btn-tonal" onClick={() => setToken(level.token)}>
            {level.token}
          </button>
        ))}
      </div>

      <Modal.Root
        kind="view"
        size="sm"
        scrim={token ?? 'default'}
        open={token !== null}
        onOpenChange={(open) => {
          if (!open) setToken(null);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{`scrim="${token ?? ''}"`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>{LEVELS.find((level) => level.token === token)?.use}</Modal.Description>
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
