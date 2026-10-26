import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  SearchPage,
  ServiceStatusPage,
  SiteLayout,
  toHiragana,
  type SearchFacet,
  type SearchQuery,
  type SearchResult,
  type ServiceComponent,
  type ServiceDay,
  type ServiceIncident,
  type ServiceStatus,
} from '@genelab/gassan';

import { useT } from '../i18n';
import { minutesAgo, preview, wait } from './shared';

const DAY = 24 * 60;

/** 稼働の帯に並べる日数。 */
const DAYS = 90;

/** ブラウザの時間帯で、days 日前の暦の日（'YYYY-MM-DD'）。 */
const dayISO = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/** 過去 90 日の帯。issues は「何日前」ごとの状態と出来事。since 日前より古い日は記録なし（その部分を足す前）。 */
const history = (issues: Readonly<Record<number, readonly [ServiceStatus, string]>>, since = DAYS - 1): ServiceDay[] =>
  Array.from({ length: DAYS }, (_, index) => {
    const ago = DAYS - 1 - index;
    const issue = issues[ago];
    if (ago > since) return { date: dayISO(ago), status: null };
    return issue ? { date: dayISO(ago), status: issue[0], note: issue[1] } : { date: dayISO(ago), status: 'operational' };
  });

/** 稼働状況（P-39）。API が遅くなっていて対応中。12 日前にログインできない障害、30 日前に定期メンテナンス。 */
function ServiceStatusSample(): ReactNode {
  const t = useT().templateSamples.serviceStatus;
  const c = t.components;
  const components: ServiceComponent[] = [
    {
      id: 'api',
      name: c.api,
      status: 'degraded',
      uptime: 99.91,
      days: history({ 0: ['degraded', t.notes.slow], 12: ['major', t.notes.outage], 30: ['maintenance', t.notes.maintenance] }),
    },
    { id: 'dashboard', name: c.dashboard, status: 'operational', uptime: 99.94, days: history({ 12: ['major', t.notes.outage], 30: ['maintenance', t.notes.maintenance] }) },
    { id: 'mail', name: c.mail, status: 'operational', uptime: 100, days: history({}) },
    // Webhook は 40 日前に足した部分（それより前の日は記録なし）
    { id: 'webhooks', name: c.webhooks, description: t.descriptions.webhooks, status: 'operational', uptime: 100, days: history({}, 40) },
    { id: 'storage', name: c.storage, description: t.descriptions.storage, status: 'operational', uptime: 99.98, days: history({ 47: ['partial', t.notes.storage] }) },
  ];
  const incidents: ServiceIncident[] = [
    {
      id: 'slow',
      title: t.slow.title,
      impact: 'degraded',
      components: ['api'],
      updates: [
        { time: minutesAgo(12), stage: 'identified', text: t.slow.identified },
        { time: minutesAgo(38), stage: 'investigating', text: t.slow.investigating },
      ],
    },
    {
      id: 'outage',
      title: t.outage.title,
      impact: 'major',
      components: ['dashboard', 'api'],
      updates: [
        { time: minutesAgo(12 * DAY + 20), stage: 'resolved', text: t.outage.resolved },
        { time: minutesAgo(12 * DAY + 40), stage: 'monitoring', text: t.outage.monitoring },
        { time: minutesAgo(12 * DAY + 70), stage: 'identified', text: t.outage.identified },
        { time: minutesAgo(12 * DAY + 100), stage: 'investigating', text: t.outage.investigating },
      ],
    },
    {
      id: 'maintenance',
      title: t.maintenance.title,
      impact: 'maintenance',
      components: ['api', 'dashboard'],
      updates: [
        { time: minutesAgo(30 * DAY + 60), stage: 'resolved', text: t.maintenance.resolved },
        { time: minutesAgo(30 * DAY + 180), stage: 'monitoring', text: t.maintenance.monitoring },
      ],
    },
  ];
  return <ServiceStatusPage components={components} incidents={incidents} updatedAt={minutesAgo(2)} onSubscribe={() => wait(800)} feedHref="#" />;
}

/** 1 ページに出す結果の数。 */
const PAGE_SIZE = 4;

/** 比べるための正規化（全角半角・大文字小文字・かなの種類をそろえる。部品の強調と同じ）。 */
const normalize = (text: string): string => toHiragana(text.normalize('NFKC').toLocaleLowerCase());

interface Doc extends SearchResult {
  kind: 'faq' | 'changelog';
  category?: string;
  /** 探す対象（題・本文・別名を正規化してつないだもの）。 */
  haystack: string;
}

/**
 * 検索結果（P-40）。よくある質問と更新履歴の見本を索引にし、サーバーの代わりに見本の中で探して、少し待ってから
 * 1 ページ分を返す（待つ間は前の結果のまま）。絞り込みの件数は、言葉に当たったものの中で数える。
 */
function SearchSample(): ReactNode {
  const { templateSamples: s } = useT();
  const docs = useMemo<Doc[]>(
    () => [
      ...s.faq.map((item) => ({
        id: `faq-${item.id}`,
        kind: 'faq' as const,
        category: item.category,
        title: item.q,
        snippet: item.a,
        meta: `${s.nav.faq} › ${item.category}`,
        href: preview('faq'),
        haystack: normalize([item.q, item.a, ...item.keywords].join(' ')),
      })),
      ...s.changelog.map((entry) => ({
        id: `changelog-${entry.version}`,
        kind: 'changelog' as const,
        title: entry.title,
        snippet: entry.body,
        meta: `${s.nav.changelog} › ${entry.version}`,
        href: preview('changelog'),
        haystack: normalize(`${entry.title} ${entry.body}`),
      })),
    ],
    [s],
  );
  const [query, setQuery] = useState<SearchQuery>(() => ({ text: s.search.initial, facets: {}, page: 1 }));
  // 表に出している結果の条件。条件が変わってから届くまでが読み込み中
  const [shown, setShown] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setShown(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const terms = normalize(shown.text).split(/\s+/).filter(Boolean);
  const hits = terms.length === 0 ? [] : docs.filter((doc) => terms.every((term) => doc.haystack.includes(term)));
  const kinds = shown.facets.kind ?? [];
  const categories = shown.facets.category ?? [];
  const matched = hits.filter(
    (doc) => (kinds.length === 0 || kinds.includes(doc.kind)) && (categories.length === 0 || (doc.category !== undefined && categories.includes(doc.category))),
  );
  const countOf = (pick: (doc: Doc) => boolean): number => hits.filter(pick).length;
  const facets: SearchFacet[] = [
    {
      id: 'kind',
      label: s.search.kind,
      options: [
        { value: 'faq', label: s.nav.faq, count: countOf((doc) => doc.kind === 'faq') },
        { value: 'changelog', label: s.nav.changelog, count: countOf((doc) => doc.kind === 'changelog') },
      ],
    },
    {
      id: 'category',
      label: s.search.category,
      options: [...new Set(s.faq.map((item) => item.category))].map((category) => ({ value: category, label: category, count: countOf((doc) => doc.category === category) })),
    },
  ];
  return (
    <SiteLayout>
      <SearchPage
        query={query}
        onQueryChange={setQuery}
        results={matched.slice((shown.page - 1) * PAGE_SIZE, shown.page * PAGE_SIZE)}
        total={matched.length}
        pageCount={Math.max(1, Math.ceil(matched.length / PAGE_SIZE))}
        facets={facets}
        loading={shown !== query}
      />
    </SiteLayout>
  );
}

/** 稼働状況と検索結果の見本（#/preview/<name>）。名前の一覧は TemplatePreview の PREVIEWS にある。 */
export function StatusSearchPreview({ name }: { name: string }): ReactNode {
  switch (name) {
    case 'service-status':
      return <ServiceStatusSample />;
    case 'search':
      return <SearchSample />;
    default:
      return null;
  }
}
