import { useEffect, type ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { data } from '../../data';
import { BlockMd, inline } from '../../ui/Markdown';
import { PageHeader } from '../../ui/Page';

export function Notes({ rest }: PageProps): ReactNode {
  const target = rest[0];

  // /foundations/notes/10-5 のように直接開かれたら、その項目を開いてそこまで送る。
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(`note-${target}`);
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      el.scrollIntoView({ block: 'start' });
      el.querySelector('summary')?.focus({ preventScroll: true });
    }
  }, [target]);

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="実装ノート"
        lead={`設計の段階では見えず、実際に動かして初めて出た落とし穴 ${String(data.notes.length)} 件。紙の上では正しく、コードにすると壊れる類のものなので、ここに固定してある。`}
      />
      <ol className="s-notes">
        {data.notes.map((note) => (
          <li key={note.number}>
            <details id={`note-${note.number}`} className="s-note" open={note.number === target}>
              <summary>
                <span className="s-note-num">§{note.number}</span>
                <span className="s-note-title">{inline(note.title, note.number)}</span>
              </summary>
              <div className="s-note-body">
                <BlockMd text={note.body} />
              </div>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
