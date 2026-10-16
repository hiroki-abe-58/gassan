import { useId, useState, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { inline, MdTable, Paras } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';

interface ChecklistGroup {
  title: string;
  items: string[];
}

/** §8 のコードブロック（[見出し] と □ 項目）を群に分ける。 */
function parseChecklist(text: string): ChecklistGroup[] {
  const groups: ChecklistGroup[] = [];
  for (const line of text.split('\n')) {
    const heading = /^\[(.+)\]$/.exec(line.trim());
    if (heading?.[1]) {
      groups.push({ title: heading[1], items: [] });
      continue;
    }
    const item = /^□\s*(.+)$/.exec(line.trim());
    if (item?.[1]) groups[groups.length - 1]?.items.push(item[1]);
  }
  return groups;
}

/** 公開前チェックリスト。チェック状態はこの画面の中だけに持つ（保存しない）。 */
function Checklist({ groups }: { groups: readonly ChecklistGroup[] }): ReactNode {
  const t = useT().rules.checklist;
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const base = useId();
  return (
    <div className="s-checklist">
      <p className="s-checklist-progress" aria-live="polite">
        {t.progress(checked.size, total)}
      </p>
      {/* 群の見出しと項目は仕様書 §8 の原文なので、原文の言語のまま出す */}
      {groups.map((group, g) => (
        <fieldset key={group.title} className="s-checklist-group" lang={SPEC_LANG}>
          <legend>{group.title}</legend>
          {group.items.map((item, i) => {
            const key = `${String(g)}-${String(i)}`;
            const id = `${base}-${key}`;
            return (
              <div key={key} className="s-check">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked.has(key)}
                  onChange={(event) => {
                    const next = new Set(checked);
                    if (event.target.checked) next.add(key);
                    else next.delete(key);
                    setChecked(next);
                  }}
                />
                <label htmlFor={id}>
                  <Phrase>{inline(item, id)}</Phrase>
                </label>
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

export function Rules(): ReactNode {
  const { nav, rules: t } = useT();
  const prohibitions = data.tables['5'];
  const rubric = data.tables['6'];
  const structure = data.code['採点の構造#0'];
  const formula = data.code['検算の型#0'];
  const checklist = data.code['8#0'];
  const antipatterns = data.tables['付録A'];

  return (
    <>
      <PageHeader eyebrow={nav.sections.foundations} title={nav.pages.rules} lead={t.lead} />

      {prohibitions ? (
        <Section id="prohibitions" title={t.prohibitions.title} intro={t.prohibitions.intro}>
          <MdTable table={prohibitions} caption={t.prohibitions.tableCaption} />
        </Section>
      ) : null}

      {rubric ? (
        <Section id="rubric" title={t.rubric.title} intro={t.rubric.intro}>
          <MdTable table={rubric} caption={t.rubric.tableCaption} align={[undefined, 'right']} />
          {structure ? (
            <CodeBlock code={structure.text} lang="text" caption={t.rubric.structureCaption} textLang={SPEC_LANG} />
          ) : null}
          {formula ? (
            <Prose>
              <Paras items={t.rubric.formulaIntro} />
              <p className="s-formula" lang={SPEC_LANG}>
                {formula.text}
              </p>
            </Prose>
          ) : null}
        </Section>
      ) : null}

      {checklist ? (
        <Section id="checklist" title={t.checklist.title} intro={t.checklist.intro}>
          <Checklist groups={parseChecklist(checklist.text)} />
        </Section>
      ) : null}

      {antipatterns ? (
        <Section id="antipatterns" title={t.antipatterns.title} intro={t.antipatterns.intro}>
          <MdTable table={antipatterns} caption={t.antipatterns.tableCaption} />
        </Section>
      ) : null}
    </>
  );
}
