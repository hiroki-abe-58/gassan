import { useRef, useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function GateCustom(): ReactNode {
  const t = useDemoText('gateCustom');
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const chipsRef = useRef<HTMLDivElement>(null);

  const TOPICS = [
    { value: 'design', label: t.topicDesign },
    { value: 'a11y', label: t.topicA11y },
    { value: 'perf', label: t.topicPerf },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React' },
    { value: 'testing', label: t.topicTesting },
  ];

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen} onExited={() => setTopics([])}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:gate */}
          <Modal.Gate
            name="min-3"
            satisfied={topics.length >= 3}
            reason={fmt(t.remaining, String(Math.max(0, 3 - topics.length)))}
            focus={() => chipsRef.current?.querySelector('button')?.focus()}
          />
          <div ref={chipsRef}>
            <Modal.Chips label={t.topics} options={TOPICS} value={topics} onChange={setTopics} />
          </div>
          {/* t:status */}
          <Modal.GateStatus />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="primary" gate closeOnClick="submit">
            {t.submit}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
