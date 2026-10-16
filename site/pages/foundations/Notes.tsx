import { useEffect, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { data } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { BlockMd, inline } from '../../ui/Markdown';
import { PageHeader } from '../../ui/Page';

export function Notes({ rest }: PageProps): ReactNode {
  const { nav, notes: t } = useT();
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
      <PageHeader eyebrow={nav.sections.foundations} title={nav.pages.notes} lead={t.lead(data.notes.length)} />
      <ol className="s-notes">
        {data.notes.map((note) => (
          <li key={note.number}>
            <details id={`note-${note.number}`} className="s-note" open={note.number === target}>
              <summary>
                <span className="s-note-num">§{note.number}</span>
                <span className="s-note-title" lang={SPEC_LANG}>
                  <Phrase>{inline(note.title, note.number)}</Phrase>
                </span>
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
