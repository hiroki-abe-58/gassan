import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const ARTICLES = [
  '本サービスは、利用者が作成したデータを利用者の許可なく第三者へ提供しない。',
  '利用者は、アカウントをいつでも削除できる。削除したデータは 30 日後に復元できなくなる。',
  '料金の改定は、適用の 30 日前までに通知する。通知は登録されたメールアドレスに送る。',
  '障害で生じた損害は、直近 1 か月の利用料金を上限として補償する。',
  '本規約の改定は、改定後の規約を本サービス上に掲示した時点で効力を持つ。',
  '本規約に定めのない事項は、関連する法令と一般的な慣行に従う。',
];

export default function KindConsent(): ReactNode {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        規約を確認する
      </button>
      <output className="s-demo-log">{agreed ? '同意済み' : ''}</output>

      {/* consent は Esc でも背景でも閉じない。閉じようとすると揺れて理由を読み上げる */}
      <Modal.Root kind="consent" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Title>利用規約の更新</Modal.Title>
        </Modal.Header>

        {/* 読了は「末尾が見えた OR 末尾にフォーカスが届いた OR スクロール不要」（G-03） */}
        <Modal.Body readGate="read">
          <div>
            {ARTICLES.map((text, i) => (
              <p key={i}>
                <strong>第{i + 1}条</strong> {text}
              </p>
            ))}
          </div>
          <Modal.Consent gate="terms">更新後の規約に同意します</Modal.Consent>
          <Modal.GateStatus />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            同意しない
          </Modal.Button>
          {/* disabled にしない。押せば「何が足りないか」を読み上げ、そこへ連れて行く（G-07 / G-08） */}
          <Modal.Button
            variant="primary"
            gate
            onClick={() => {
              setAgreed(true);
              setOpen(false);
            }}
          >
            同意して続ける
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
