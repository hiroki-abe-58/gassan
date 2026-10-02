import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

export default function KindConfirm(): ReactNode {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState('');

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        下書きを削除
      </button>
      <output className="s-demo-log">{log}</output>

      <Modal.Root
        kind="confirm"
        size="sm"
        open={open}
        onOpenChange={(next, reason) => {
          setOpen(next);
          if (!next) setLog(`閉じた理由: ${reason}`);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>下書きを削除しますか</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>削除すると元に戻せません。共同編集者の画面からも消えます。</Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            やめる
          </Modal.Button>
          {/* 位置は primary のまま、色だけ danger にする（F-06） */}
          <Modal.Button
            variant="danger"
            closeOnClick="submit"
            onAction={() => new Promise((resolve) => setTimeout(resolve, 700))}
          >
            削除する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
