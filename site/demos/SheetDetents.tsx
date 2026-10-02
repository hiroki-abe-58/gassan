import { useState, type ReactNode } from 'react';

import { Modal, type DetentToken } from '@genelab/gassan';

const STOPS = [
  { name: '鶴岡駅前', time: '07:40' },
  { name: '羽黒山頂', time: '08:30' },
  { name: '月山八合目', time: '09:10' },
  { name: '弥陀ヶ原', time: '09:25' },
  { name: '月山頂上小屋', time: '11:40' },
];

export default function SheetDetents(): ReactNode {
  const [open, setOpen] = useState(false);
  const [detent, setDetent] = useState<DetentToken>('half');

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        経路を見る
      </button>
      <output className="s-demo-log">いまの段: {detent}</output>

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
        {/* 段があるとき、つまみは role="slider" の操作子。矢印キー・Home / End・クリックでも動く */}
        <Modal.Handle />
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>鶴岡駅前 → 月山頂上小屋</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>バスと徒歩で 4 時間。八合目から先は徒歩。</Modal.Description>
          <Modal.Section title="経由地">
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
