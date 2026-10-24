import { useState, type ReactNode } from 'react';

import { ContextMenu, IconButton, Menu, Phrase, type MenuEntry } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

const FILE = 'M11.5 3.5h-5A1.5 1.5 0 0 0 5 5v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 15 15V7l-3.5-3.5ZM11.5 3.5V7H15';
const MORE = 'M5 10h.01M10 10h.01M15 10h.01';

function Mark({ d }: { d: string }): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContextFiles(): ReactNode {
  const t = useDemoText('contextFiles');
  const [chosen, setChosen] = useState('');
  const actions: MenuEntry[] = [
    { value: 'open', label: t.open },
    { value: 'rename', label: t.rename },
    { value: 'duplicate', label: t.duplicate },
    { type: 'separator' },
    { value: 'delete', label: t.delete, tone: 'danger' },
  ];
  const names: Record<string, string> = { open: t.open, rename: t.rename, duplicate: t.duplicate, delete: t.delete };
  const report = (file: string) => (value: string) => setChosen(fmt(t.chosen, names[value] ?? value, file));

  return (
    <div className="s-context-demo">
      <ul className="s-context-files" aria-label={t.label}>
        {[t.quote, t.contract, t.minutes].map((file) => (
          <ContextMenu key={file} label={fmt(t.menuLabel, file)} items={actions} onSelect={report(file)}>
            <li className="s-context-file">
              <Mark d={FILE} />
              <span className="s-context-name">{file}</span>
              {/* t:visible */}
              <Menu
                trigger={
                  <IconButton label={fmt(t.moreLabel, file)}>
                    <Mark d={MORE} />
                  </IconButton>
                }
                items={actions}
                align="end"
                onSelect={report(file)}
              />
            </li>
          </ContextMenu>
        ))}
      </ul>
      <p className="s-demo-note" role="status">
        <Phrase>{chosen}</Phrase>
      </p>
    </div>
  );
}
