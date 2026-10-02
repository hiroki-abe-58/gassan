import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const TITLE =
  '2026年度 第3四半期 東北エリア 店舗別売上レポート（速報値・前年同期比・在庫回転率・人件費率を含む）の共有設定を変更する';

export default function TitleClamp(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        長いタイトルのモーダル
      </button>

      <Modal.Root kind="form" size="sm" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          {/* 省略は CSS の line-clamp だけ。DOM のテキストは常に完全なので、名前は欠けない */}
          <Modal.Title lines={2}>{TITLE}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>
            溢れたときだけ「全文を表示」が出る。hover・title 属性・長押しには頼らない。
          </Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="submit">
            変更する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
