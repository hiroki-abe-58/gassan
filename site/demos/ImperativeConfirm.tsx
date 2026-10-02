import { useState, type ReactNode } from 'react';

import { useModals } from '@genelab/gassan';

// アプリのルートに <ModalHost /> を 1 つ置いておくこと（このサイトでは App.tsx に置いてある）。
export default function ImperativeConfirm(): ReactNode {
  const modals = useModals();
  const [log, setLog] = useState('');

  return (
    <>
      <button
        type="button"
        className="s-btn"
        onClick={async () => {
          const ok = await modals.confirm({ title: 'ログアウトしますか', tone: 'danger', confirmLabel: 'ログアウト' });
          setLog(`confirm → ${String(ok)}`);
        }}
      >
        confirm を呼ぶ
      </button>
      <button
        type="button"
        className="s-btn s-btn-tonal"
        onClick={async () => {
          // 同時に 2 つ呼んでも、1 枚ずつ順に出る（L-14）
          void modals.confirm({ title: '1 枚目: 通知をオフにしますか' });
          const ok = await modals.confirm({ title: '2 枚目: 退会の確認', consent: '内容を理解しました' });
          setLog(`2 枚目 → ${String(ok)}`);
        }}
      >
        2 つ同時に呼ぶ
      </button>
      <output className="s-demo-log">{log}</output>
    </>
  );
}
