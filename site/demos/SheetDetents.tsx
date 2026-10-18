import { useState, type ReactNode } from 'react';

import { Modal, Phrase, type DetentToken } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function SheetDetents(): ReactNode {
  const t = useDemoText('sheetDetents');
  const [open, setOpen] = useState(false);
  const [detent, setDetent] = useState<DetentToken>('half');

  const STOPS = [
    { name: t.tsuruoka, time: '07:40' },
    { name: t.haguro, time: '08:30' },
    { name: t.eighthStation, time: '09:10' },
    { name: t.midagahara, time: '09:25' },
    { name: t.summitHut, time: '11:40' },
  ];

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>
      <output className="s-demo-log">
        <Phrase>{fmt(t.detent, detent)}</Phrase>
      </output>

      <Modal.Root
        kind="view"
        placement="sheet"
        open={open}
        onOpenChange={setOpen}
        swipeToDismiss
        detents={['peek', 'half', 'full']}
        defaultDetent="half"
        onDetentChange={setDetent}
      >
        {/* t:handle */}
        <Modal.Handle />
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>{t.description}</Modal.Description>
          <Modal.Section title={t.stops}>
            <ol className="s-demo-stops">
              {STOPS.map((stop) => (
                <li key={stop.name}>
                  <span>{stop.name}</span>
                  <span>{stop.time}</span>
                </li>
              ))}
            </ol>
          </Modal.Section>
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
