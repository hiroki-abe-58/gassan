import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const RELEASES = [
  { version: 'v3.2', notes: ['共有リンクに有効期限を付けられるようになった', '検索が 2 倍速くなった'] },
  { version: 'v3.1', notes: ['ダークテーマの境界線を見直した', '通知の既定をオフにした'] },
  { version: 'v3.0', notes: ['ワークスペースを分けられるようになった', '古い API を廃止した'] },
  { version: 'v2.9', notes: ['CSV の書き出しで列を選べるようになった', 'ショートカットを追加した'] },
  { version: 'v2.8', notes: ['画像の貼り付けに対応した', '大きな表の描画を軽くした'] },
];

export default function BodyScroll(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        更新履歴を見る
      </button>

      <Modal.Root kind="view" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>更新履歴</Modal.Title>
        </Modal.Header>

        {/* スクロールするのはここだけ。tabIndex と名前を持つので、キーボードでも読める（B-01〜B-03） */}
        <Modal.Body label="更新履歴の本文">
          {RELEASES.map((release) => (
            <Modal.Section key={release.version} title={release.version}>
              <ul>
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Modal.Section>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="close-button">
            閉じる
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
