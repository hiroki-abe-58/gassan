import type { ReactNode } from 'react';

import { Phrase, toast } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ToastTones(): ReactNode {
  const t = useDemoText('toastTones');

  // t:tones
  return (
    <div className="s-demo-row">
      <button type="button" className="s-btn" onClick={() => toast.success(t.saved, { description: t.savedDetail })}>
        <Phrase>{t.success}</Phrase>
      </button>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => toast.info(t.update)}>
        <Phrase>{t.info}</Phrase>
      </button>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => toast.warning(t.storage, { description: t.storageDetail })}>
        <Phrase>{t.warning}</Phrase>
      </button>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => toast.error(t.failed, { description: t.failedDetail })}>
        <Phrase>{t.error}</Phrase>
      </button>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => toast(t.copied)}>
        <Phrase>{t.neutral}</Phrase>
      </button>
    </div>
  );
}
