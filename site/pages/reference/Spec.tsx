import { useEffect, useMemo, useState, type ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { data, repoFile, type Evidence, type Priority, type SpecItem } from '../../data';
import { inline, InlineMd, MdTable } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';
import { PriorityBadge, STATUS_ORDER, StatusBadge, priorityLabel } from '../../ui/Spec';

const EVIDENCE_LABEL: Record<Evidence['kind'], string> = {
  T: 'テスト',
  C: 'CSS',
  S: 'ファイル',
  D: '文書',
  B: '実機検品',
  R: 'ロードマップ',
  N: '委譲先',
};

function EvidenceList({ item }: { item: SpecItem }): ReactNode {
  if (item.evidence.length === 0) return null;
  return (
    <details className="s-evidence">
      <summary>根拠 {item.evidence.length} 件</summary>
      <ul>
        {item.evidence.map((e, i) => (
          <li key={i}>
            <span className="s-evidence-kind">{EVIDENCE_LABEL[e.kind]}</span>
            {e.kind === 'S' || e.kind === 'D' ? (
              <a href={repoFile(e.value)} target="_blank" rel="noreferrer">
                <code>{e.value}</code>
              </a>
            ) : e.kind === 'T' ? (
              <span>{e.value}</span>
            ) : (
              <code>{e.value}</code>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

const PRIORITIES: readonly Priority[] = ['M', 'S', 'O'];

export function Spec({ rest }: PageProps): ReactNode {
  const target = rest[0];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [priorities, setPriorities] = useState<ReadonlySet<Priority>>(new Set(PRIORITIES));
  const [status, setStatus] = useState('');

  // 直リンクで開かれたら、絞り込みを外してその行まで送る。
  useEffect(() => {
    if (!target) return;
    setQuery('');
    setCategory('');
    setPriorities(new Set(PRIORITIES));
    setStatus('');
    const id = window.setTimeout(() => {
      const row = document.getElementById(`spec-${target}`);
      row?.scrollIntoView({ block: 'center' });
      row?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [target]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.categories
      .filter((c) => !category || c.letter === category)
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (item) =>
            priorities.has(item.priority) &&
            (!status || item.status === status) &&
            (!q || `${item.id} ${item.name} ${item.summary}`.toLowerCase().includes(q)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, category, priorities, status]);

  const shown = filtered.reduce((n, c) => n + c.items.length, 0);
  const statuses = STATUS_ORDER.filter((s) => data.categories.some((c) => c.items.some((i) => i.status === s)));

  return (
    <>
      <PageHeader
        eyebrow="仕様と検証"
        title={`振る舞い仕様（${String(data.meta.items)} 項目）`}
        lead="理想のモーダルが満たすべき振る舞いを、12 のカテゴリに分けて 1 行ずつ列挙したもの。各行には、それをどのテスト・どの CSS で満たしているかが結び付いている。"
      />

      <Prose>
        <p>
          原本は{' '}
          <a href={repoFile('modal.skill.md')} target="_blank" rel="noreferrer">
            modal.skill.md
          </a>{' '}
          §4（v{data.meta.specVersion}、{data.meta.specUpdated}）、状態と根拠は{' '}
          <a href={repoFile('docs/traceability.md')} target="_blank" rel="noreferrer">
            docs/traceability.md
          </a>
          。どちらも <code>npm run check:trace</code> が機械検証していて、存在しないテスト名を根拠に書くと CI が落ちる。このページはその 2 つからビルド時に作っている。
        </p>
      </Prose>

      <div className="s-filters" role="search" aria-label="仕様の絞り込み">
        <label className="s-field s-field-grow">
          <span>キーワード</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例: フォーカス、G-03、line-clamp" />
        </label>
        <label className="s-field">
          <span>カテゴリ</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">すべて</option>
            {data.categories.map((c) => (
              <option key={c.letter} value={c.letter}>
                {c.letter}. {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="s-field">
          <span>状態</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">すべて</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="s-field s-priority-filter">
          <legend>必須度</legend>
          {PRIORITIES.map((p) => (
            <label key={p} className="s-toggle">
              <input
                type="checkbox"
                checked={priorities.has(p)}
                onChange={(event) => {
                  const next = new Set(priorities);
                  if (event.target.checked) next.add(p);
                  else next.delete(p);
                  setPriorities(next);
                }}
              />
              {p}（{priorityLabel(p)}）
            </label>
          ))}
        </fieldset>
      </div>
      <p className="s-filter-count" role="status">
        {shown} / {data.meta.items} 項目を表示
      </p>

      {filtered.map((c) => (
        <section key={c.letter} className="s-spec-category" aria-labelledby={`cat-${c.letter}`}>
          <h2 id={`cat-${c.letter}`}>
            <span className="s-spec-letter">{c.letter}</span> {c.name}
          </h2>
          <div className="s-table-wrap" role="group" tabIndex={0} aria-label={`${c.name}の項目`}>
            <table className="s-table s-spec-table">
              <caption className="s-sr-only">{c.name}</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">振る舞い</th>
                  <th scope="col">度</th>
                  <th scope="col">実装の要点</th>
                  <th scope="col">状態と根拠</th>
                </tr>
              </thead>
              <tbody>
                {c.items.map((item) => (
                  <tr
                    key={item.id}
                    id={`spec-${item.id}`}
                    tabIndex={-1}
                    data-target={item.id === target ? '' : undefined}
                  >
                    <th scope="row">
                      <a className="s-idref" href={`#/spec/${item.id}`}>
                        {item.id}
                      </a>
                    </th>
                    <td>{inline(item.name, item.id)}</td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <InlineMd text={item.summary} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                      <EvidenceList item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {shown === 0 ? <p className="s-empty">条件に合う項目は無い。絞り込みを緩めてほしい。</p> : null}

      <Section id="legend" title="状態の読み方" intro="保証の強い順。「実装」と「記述」を混ぜないことが、この表の要点である。">
        <MdTable table={data.statusLegend} caption="状態の語彙" />
      </Section>
    </>
  );
}
