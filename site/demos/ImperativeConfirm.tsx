import { useState, type ReactNode } from 'react';

import { Phrase, useModals } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

// t:host
export default function ImperativeConfirm(): ReactNode {
  const t = useDemoText('imperativeConfirm');
  const modals = useModals();
  const [log, setLog] = useState('');

  return (
    <>
      <button
        type="button"
        className="s-btn"
        onClick={async () => {
          const ok = await modals.confirm({ title: t.logoutTitle, tone: 'danger', confirmLabel: t.logout });
          setLog(`confirm → ${String(ok)}`);
        }}
      >
        <Phrase>{t.callOne}</Phrase>
      </button>
      <button
        type="button"
        className="s-btn s-btn-tonal"
        onClick={async () => {
          // t:queue
          void modals.confirm({ title: t.firstTitle });
          const ok = await modals.confirm({ title: t.secondTitle, consent: t.consent });
          setLog(fmt(t.secondLog, String(ok)));
        }}
      >
        <Phrase>{t.callTwo}</Phrase>
      </button>
      <output className="s-demo-log">
        <Phrase>{log}</Phrase>
      </output>
    </>
  );
}
