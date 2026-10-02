import { useState, type ReactNode } from 'react';

import { Modal, type ScrimToken } from '@genelab/gassan';

const LEVELS: readonly { token: ScrimToken; use: string }[] = [
  { token: 'subtle', use: '非破壊・短命の確認' },
  { token: 'default', use: '既定。確認・入力・閲覧・フロー' },
  { token: 'strong', use: '同意・破壊的な確認' },
  { token: 'immersive', use: 'ライトボックス（明示 opt-in）' },
];

export default function ScrimLevels(): ReactNode {
  const [token, setToken] = useState<ScrimToken | null>(null);

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
