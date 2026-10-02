import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';

export default function QuickStart(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        開く
      </button>

      {/* 常時マウントし、open で開閉する。{open && <Modal.Root />} と書くと退出アニメが描けない */}
      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>プロフィールを編集</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="表示名" required>
            {(control) => <input {...control} type="text" />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            やめる
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            保存する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
