import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import { SCENES, sceneUri } from './art';

export default function KindView(): ReactNode {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const items = SCENES.map((scene) => ({
    id: scene.id,
    content: <Modal.Media src={sceneUri(scene)} alt={scene.title} ratio="16 / 9" caption={scene.title} />,
  }));

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        作品を見る
      </button>

      <Modal.Root kind="view" size="lg" scrim="immersive" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{`稜線の習作（${String(index + 1)} / ${String(SCENES.length)}）`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 矢印キー・Home / End で移動し、位置は読み上げられる（B-12 / K-10） */}
          <Modal.Gallery label="稜線の習作" items={items} onIndexChange={setIndex} />
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
