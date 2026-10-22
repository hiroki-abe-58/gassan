import { useState, type ReactNode } from 'react';

import { Phrase, toast } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function ToastUndo(): ReactNode {
  const t = useDemoText('toastUndo');
  const drafts = [t.draftA, t.draftB, t.draftC];
  const [kept, setKept] = useState(drafts);

  const remove = (name: string): void => {
    setKept((list) => list.filter((entry) => entry !== name));
    // t:undo
    toast(fmt(t.removed, name), {
      action: {
        label: t.undo,
        onClick: () => setKept((list) => drafts.filter((entry) => entry === name || list.includes(entry))),
      },
    });
  };

  return (
    <div className="s-demo-wide">
      {kept.length > 0 ? (
        <ul className="s-draft-list">
          {kept.map((name) => (
            <li key={name} className="s-draft">
              <span className="s-draft-name">
                <Phrase>{name}</Phrase>
              </span>
              <button type="button" className="s-btn s-btn-tonal" aria-label={fmt(t.removeLabel, name)} onClick={() => remove(name)}>
                <Phrase>{t.remove}</Phrase>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="s-demo-note">
          <Phrase>{t.empty}</Phrase>{' '}
          <button type="button" className="s-link-btn" onClick={() => setKept(drafts)}>
            <Phrase>{t.reset}</Phrase>
          </button>
        </p>
      )}
    </div>
  );
}
