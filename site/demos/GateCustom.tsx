import { useRef, useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const TOPICS = [
  { value: 'design', label: 'デザイン' },
  { value: 'a11y', label: 'アクセシビリティ' },
  { value: 'perf', label: 'パフォーマンス' },
  { value: 'css', label: 'CSS' },
  { value: 'react', label: 'React' },
  { value: 'testing', label: 'テスト' },
];

export default function GateCustom(): ReactNode {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const chipsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        興味のある分野を選ぶ
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen} onExited={() => setTopics([])}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>おすすめを調整する</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* 任意の条件をゲートにする。満たすまでボタンは aria-disabled（押せば理由を読み上げ、ここへ戻す） */}
          <Modal.Gate
            name="min-3"
            satisfied={topics.length >= 3}
            reason={`あと ${String(Math.max(0, 3 - topics.length))} つ選んでください`}
            focus={() => chipsRef.current?.querySelector('button')?.focus()}
          />
          <div ref={chipsRef}>
            <Modal.Chips label="分野（3つ以上）" options={TOPICS} value={topics} onChange={setTopics} />
          </div>
          {/* 押す前から理由が見えている（G-10） */}
          <Modal.GateStatus />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="primary" gate closeOnClick="submit">
            この内容で保存
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
