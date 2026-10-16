import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { data, repoFile, type Priority, type SpecItem } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { to } from '../../router';
import { inline, InlineMd, MdTable, md } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';
import { PriorityBadge, STATUS_ORDER, StatusBadge, useStatusLabel } from '../../ui/Spec';

function EvidenceList({ item }: { item: SpecItem }): ReactNode {
  const t = useT().spec.evidence;
  if (item.evidence.length === 0) return null;
  return (
    <details className="s-evidence">
      <summary>{t.count(item.evidence.length)}</summary>
      <ul>
        {item.evidence.map((e, i) => (
          <li key={i}>
            <span className="s-evidence-kind">{t.kinds[e.kind]}</span>
            {/* 根拠の値は追跡表の原文（テスト名・見出し・注記） */}
            {e.kind === 'S' || e.kind === 'D' ? (
              <a href={repoFile(e.value)} target="_blank" rel="noreferrer" lang={SPEC_LANG}>
                <code>{e.value}</code>
              </a>
            ) : e.kind === 'T' ? (
              <span lang={SPEC_LANG}>
                <Phrase>{e.value}</Phrase>
              </span>
            ) : (
              <code lang={SPEC_LANG}>{e.value}</code>
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
  const { nav, common, spec: t } = useT();
  const statusLabel = useStatusLabel();
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
      <PageHeader eyebrow={nav.sections.reference} title={t.title(nav.pages.spec, data.meta.items)} lead={t.lead} />

      <Prose>
        <p>{md(t.source(data.meta.specVersion, data.meta.specUpdated))}</p>
      </Prose>

      <div className="s-filters" role="search" aria-label={t.filters.label}>
        <label className="s-field s-field-grow">
          <span>{t.filters.keyword}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.filters.keywordPlaceholder}
          />
        </label>
        <label className="s-field">
          <span>{t.filters.category}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t.filters.all}</option>
            {data.categories.map((c) => (
              <option key={c.letter} value={c.letter} lang={SPEC_LANG}>
                {c.letter}. {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="s-field">
          <span>{t.filters.status}</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{t.filters.all}</option>
            {/* 値は追跡表の原文のまま（絞り込みに使う）、表示だけ訳す */}
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="s-field s-priority-filter">
          <legend>{t.filters.priority}</legend>
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
              {t.filters.priorityOption(p, common.priority[p])}
            </label>
          ))}
        </fieldset>
      </div>
      <p className="s-filter-count" role="status">
        {t.filters.count(shown, data.meta.items)}
      </p>

      {filtered.map((c) => (
        <section key={c.letter} className="s-spec-category" aria-labelledby={`cat-${c.letter}`}>
          <h2 id={`cat-${c.letter}`} lang={SPEC_LANG}>
            <span className="s-spec-letter">{c.letter}</span> <Phrase>{c.name}</Phrase>
          </h2>
          <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.categoryItems(c.name)}>
            <table className="s-table s-spec-table">
              <caption className="s-sr-only" lang={SPEC_LANG}>
                {c.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{common.specTable.id}</th>
                  <th scope="col">{common.specTable.behavior}</th>
                  <th scope="col">{common.specTable.priority}</th>
                  <th scope="col">{common.specTable.summary}</th>
                  <th scope="col">{t.statusAndEvidence}</th>
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
                      <a className="s-idref" href={to(`/spec/${item.id}`)}>
                        {item.id}
                      </a>
                    </th>
                    <td lang={SPEC_LANG}>
                      <Phrase>{inline(item.name, item.id)}</Phrase>
                    </td>
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

      {shown === 0 ? <p className="s-empty">{t.empty}</p> : null}

      <Section id="legend" title={t.legend.title} intro={t.legend.intro}>
        <MdTable table={data.statusLegend} caption={t.legend.tableCaption} />
      </Section>
    </>
  );
}
