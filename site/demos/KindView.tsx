import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

import { SCENES, sceneUri, type SceneId } from './art';

export default function KindView(): ReactNode {
  const t = useDemoText('kindView');
  const TITLES: Record<SceneId, string> = {
    dawn: t.dawn,
    noon: t.noon,
    dusk: t.dusk,
    night: t.night,
    snow: t.snow,
  };
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const items = SCENES.map((scene) => ({
    id: scene.id,
    content: <Modal.Media src={sceneUri(scene)} alt={TITLES[scene.id]} ratio="16 / 9" caption={TITLES[scene.id]} />,
  }));

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="view" size="lg" scrim="immersive" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{fmt(t.title, String(index + 1), String(SCENES.length))}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* t:keys */}
          <Modal.Gallery label={t.gallery} items={items} onIndexChange={setIndex} />
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
