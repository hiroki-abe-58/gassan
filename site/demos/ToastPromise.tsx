import type { ReactNode } from 'react';

import { Phrase, toast } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

/** 1.5 秒かかる保存。ok が false なら失敗する。 */
function save(ok: boolean, reason: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (ok ? resolve() : reject(new Error(reason))), 1500);
  });
}

export default function ToastPromise(): ReactNode {
  const t = useDemoText('toastPromise');

  const run = (ok: boolean): void => {
    // t:promise
    toast
      .promise(save(ok, t.reason), {
        loading: t.loading,
        success: t.success,
        error: (error) => fmt(t.error, error instanceof Error ? error.message : String(error)),
      })
      .catch(() => undefined);
  };

  return (
    <div className="s-demo-row">
      <button type="button" className="s-btn" onClick={() => run(true)}>
        <Phrase>{t.succeed}</Phrase>
      </button>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => run(false)}>
        <Phrase>{t.fail}</Phrase>
      </button>
    </div>
  );
}
