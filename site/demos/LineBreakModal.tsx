import { useState, type ReactNode } from 'react';

import { GassanProvider, Modal } from '@genelab/gassan';

export default function LineBreakModal(): ReactNode {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState(true);

  return (
    <>
      <label className="s-toggle">
        <input type="checkbox" checked={phrase} onChange={(event) => setPhrase(event.target.checked)} />
        文節で折り返す
      </label>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        狭いモーダルを開く
      </button>

      {/* lineBreak を切り替えるだけ。既定は 'phrase'（文節）なので、ふだんは何も書かなくてよい */}
      <GassanProvider lineBreak={phrase ? 'phrase' : 'browser'}>
        <Modal.Root kind="confirm" size="sm" open={open} onOpenChange={setOpen}>
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>第3四半期の店舗別売上レポートを共有する</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>共有すると、閲覧権限のあるメンバー全員に通知が届きます。</Modal.Description>
            <Modal.Table label="共有先">
              <table>
                <thead>
                  <tr>
                    <th scope="col">共有先</th>
                    <th scope="col">権限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>東北エリアの店舗責任者</td>
                    <td>閲覧とコメント</td>
                  </tr>
                  <tr>
                    <td>経営企画部のメンバー</td>
                    <td>閲覧のみ</td>
                  </tr>
                </tbody>
              </table>
            </Modal.Table>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="secondary" closeOnClick="close-button">
              下書きとして保存する
            </Modal.Button>
            <Modal.Button variant="primary" closeOnClick="submit">
              メンバーに共有して通知する
            </Modal.Button>
          </Modal.Footer>
        </Modal.Root>
      </GassanProvider>
    </>
  );
}
