import { useId, useState, type ReactNode } from 'react';

import { data } from '../../data';
import { CodeBlock } from '../../ui/Code';
import { inline, MdTable } from '../../ui/Markdown';
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
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const base = useId();
  return (
    <div className="s-checklist">
      <p className="s-checklist-progress" aria-live="polite">
        {checked.size} / {total} 項目
      </p>
      {groups.map((group, g) => (
        <fieldset key={group.title} className="s-checklist-group">
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
                <label htmlFor={id}>{inline(item, id)}</label>
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

export function Rules(): ReactNode {
  const prohibitions = data.tables['5'];
  const rubric = data.tables['6'];
  const structure = data.code['採点の構造#0'];
  const formula = data.code['検算の型#0'];
  const checklist = data.code['8#0'];
  const antipatterns = data.tables['付録A'];

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="禁止事項と品質基準"
        lead="AI もベテランも、同じ順序で同じ穴を踏む。踏む前に機械的に照合できるよう、禁止事項・採点表・公開前チェックリストを置いておく。"
      />

      {prohibitions ? (
        <Section id="prohibitions" title="禁止事項" intro="AI が書きがちな順に並べてある。1 つでも踏んだら書き直す。">
          <MdTable table={prohibitions} caption="禁止事項" />
        </Section>
      ) : null}

      {rubric ? (
        <Section id="rubric" title="品質ルーブリック" intro="15 点満点。12 点未満は類型の選び直し（意思決定マトリクス）に戻る。">
          <MdTable table={rubric} caption="品質ルーブリック" align={[undefined, 'right']} />
          {structure ? <CodeBlock code={structure.text} lang="text" caption="採点の構造" /> : null}
          {formula ? (
            <Prose>
              <p>各実装について、次の形式で 1 文書く。「ただし」の後ろを埋められたら、それが減点理由である。埋まらなくなるまで直す。</p>
              <p className="s-formula">{formula.text}</p>
            </Prose>
          ) : null}
        </Section>
      ) : null}

      {checklist ? (
        <Section id="checklist" title="公開前チェックリスト" intro="自分のモーダルで確かめながら使う。チェックはこの画面の中だけで、保存はしない。">
          <Checklist groups={parseChecklist(checklist.text)} />
        </Section>
      ) : null}

      {antipatterns ? (
        <Section id="antipatterns" title="アンチパターン変換表" intro="よく見る書き方と、その置き換え先。">
          <MdTable table={antipatterns} caption="アンチパターン変換表" />
        </Section>
      ) : null}
    </>
  );
}
