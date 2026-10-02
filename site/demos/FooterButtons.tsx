import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function FooterButtons(): ReactNode {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        公開設定
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen} submitShortcut>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>記事を公開する</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>
            「公開する」を連打しても、処理が終わるまで 2 回目は走らない（F-08）。いままでの送信回数: {count}
          </Modal.Description>
        </Modal.Body>

        {/* DOM 順 = 視覚順 = Tab 順。弱い順に書く。最初の tertiary だけが左に離れる（F-02 / F-03） */}
        <Modal.Footer note="公開後も編集できます">
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            キャンセル
          </Modal.Button>
          <Modal.Button variant="secondary" onAction={() => wait(600)}>
            下書き保存
          </Modal.Button>
          <Modal.Button
            variant="primary"
            closeOnClick="submit"
            onAction={async () => {
              setCount((c) => c + 1);
              await wait(1200);
            }}
          >
            公開する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
