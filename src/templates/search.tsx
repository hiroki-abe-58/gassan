import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button } from '../button';
import { ModalCheckboxGroup } from '../choices';
import { EmptyState } from '../display';
import { ModalButton, ModalFooter } from '../footer';
import { ModalClose, ModalControls, ModalHeader, ModalTitle } from '../header';
import { allRanges, fold, highlight } from '../internal/match';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { Pagination } from '../navigation';
import { PageHeader } from '../page-header';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { normalizeForMatch } from '../select';
import { commonLabels, searchResultsLabels } from './labels';
import { SearchForm, useCloseWhenWide } from './page-parts';
import { SiteLink, useTemplateLabels } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 絞り込みをページの中（左の列）に出す器の幅。templates.css の T23 の @container と同じ値にする。 */
const WIDE = 760;

export interface SearchResult {
  id: string;
  title: string;
  href: string;
  /** 抜き出し。文字列なら探した言葉に当たる所を mark で示す（強調した要素を渡せば、そのまま出す）。 */
  snippet?: ReactNode;
  /** 場所（「ヘルプ › 請求」）。 */
  meta?: ReactNode;
}

export interface SearchFacetOption {
  value: string;
  label: string;
  /** 当てはまる数。渡すと選択肢に添える。 */
  count?: number;
}

export interface SearchFacet {
  id: string;
  label: string;
  options: readonly SearchFacetOption[];
}

export interface SearchQuery {
  /** 探す言葉。送ったとき（Enter か「検索」）に変わる。 */
  text: string;
  /** 絞り込み（facet の id ごとの、選んだ value）。 */
  facets: Readonly<Record<string, readonly string[]>>;
  /** ページ（1 から）。言葉か絞り込みを変えると 1 に戻す。 */
  page: number;
}

export interface SearchPageProps extends DataAttributes {
  query: SearchQuery;
  onQueryChange: (query: SearchQuery) => void;
  /** いまのページの結果。探すのとページ分けは利用側（サーバー）で行う。 */
  results: readonly SearchResult[];
  /** 当てはまった数（全ページの合計）。 */
  total: number;
  pageCount?: number;
  /** 渡すとページをリンクで送る（URL でページを持つとき）。渡さなければボタンで送り、結果の見出しへフォーカスを移す。 */
  getPageHref?: (page: number) => string;
  facets?: readonly SearchFacet[];
  /** 読み込み中。件数を空にし、結果を aria-busy にする（読み込み終えたら件数を読み上げ直す）。 */
  loading?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const SEARCH_LABELS = { common: commonLabels, searchResults: searchResultsLabels } as const;

type FacetValue = SearchQuery['facets'];

/** 絞り込みの束。送らずにすぐ効くので、必須・任意の印は付けない（名前は legend）。 */
function Facets({ facets, value, onChange }: { facets: readonly SearchFacet[]; value: FacetValue; onChange: (next: FacetValue) => void }): ReactNode {
  const phrase = usePhrase();
  return (
    <div className="g-results-facet-list">
      {facets.map((facet) => (
        <fieldset key={facet.id} className="g-results-facet">
          <legend className="g-results-facet-title">{phrase(facet.label)}</legend>
          <ModalCheckboxGroup
            options={facet.options.map((option) => ({
              value: option.value,
              label:
                option.count === undefined ? (
                  option.label
                ) : (
                  <>
                    {option.label} <span className="g-results-facet-count">{option.count.toLocaleString()}</span>
                  </>
                ),
            }))}
            value={value[facet.id] ?? []}
            onValueChange={(selected) => onChange({ ...value, [facet.id]: selected })}
          />
        </fieldset>
      ))}
    </div>
  );
}

/**
 * 検索結果。P-40。中身だけを描く（公開のヘルプでもアプリの中でも使うので、外枠は利用側が包む）。
 *
 * 探す欄（role="search"。Enter か「検索」で送る）・絞り込み（束ごとの fieldset。件数を添える。器が狭いときは
 * 「絞り込み」のボタンから開く面に移し、面の中に件数と「N 件の結果を見る」を置く）・件数（role="status"）・結果
 * （見出しのリンク・場所・抜き出し。探した言葉に当たる所を mark で示す）・ページ送り（U-23）。
 * まだ探していない画面と当てはまらない画面を分け、当てはまらなければ絞り込みを外す道を出す。
 */
export function SearchPage({
  query,
  onQueryChange,
  results,
  total,
  pageCount = 1,
  getPageHref,
  facets,
  loading = false,
  title,
  description,
  className,
  ...rest
}: SearchPageProps): ReactNode {
  const { searchResults: r } = useTemplateLabels(SEARCH_LABELS);
  const phrase = usePhrase();
  const base = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  useCloseWhenWide(rootRef, sheetOpen, setSheetOpen, WIDE);
  // ボタンでページを送ったら、新しいページの頭（結果の見出し）から読む。ページが変わって描き終えてから移す
  // （ページ送りは端に着くと今のページへフォーカスを移すので、その後に移す。子の effect が先に走る）
  const focusResults = useRef(false);
  useEffect(() => {
    if (!focusResults.current) return;
    focusResults.current = false;
    headingRef.current?.focus();
  }, [query.page]);
  const selected = Object.values(query.facets).reduce((sum, values) => sum + values.length, 0);
  const searched = query.text !== '' || selected > 0;
  const terms = normalizeForMatch(query.text).split(/\s+/).filter(Boolean);
  const marked = (text: string): ReactNode => {
    const folded = fold(text);
    return phrase(highlight(folded, allRanges(folded, terms), 'g-result-mark'));
  };
  const change = (patch: Partial<Omit<SearchQuery, 'page'>>): void => onQueryChange({ ...query, ...patch, page: 1 });
  const clearFacets = (): void => change({ facets: {} });
  const hasFacets = facets !== undefined && facets.length > 0;
  const count = r.count(total, query.text);

  let body: ReactNode;
  if (!searched && !loading) {
    body = <EmptyState headingLevel={3} title={r.emptyTitle} description={r.emptyDescription} />;
  } else if (total === 0 && !loading) {
    body = (
      <EmptyState
        headingLevel={3}
        title={r.noResultsTitle(query.text)}
        description={r.noResultsDescription}
        actions={
          selected > 0 ? (
            <Button
              onClick={() => {
                clearFacets();
                // 押したボタンは消えるので、結果の見出しへ移す
                headingRef.current?.focus();
              }}
            >
              {r.clearFilters}
            </Button>
          ) : undefined
        }
      />
    );
  } else {
    body = (
      <ol className="g-results-list" aria-busy={loading || undefined}>
        {results.map((result) => (
          <li key={result.id} className="g-result">
            <h3 className="g-result-title">
              <SiteLink href={result.href}>{marked(result.title)}</SiteLink>
            </h3>
            {result.meta ? <p className="g-result-meta">{phrase(result.meta)}</p> : null}
            {result.snippet ? <p className="g-result-snippet">{typeof result.snippet === 'string' ? marked(result.snippet) : phrase(result.snippet)}</p> : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div {...domPassthrough(rest, 'SearchPage')} ref={rootRef} className={cx('g-results', className)}>
      <PageHeader title={title ?? r.title} description={description} />
      <div className="g-results-bar">
        <SearchForm value={query.text} onSubmit={(text) => change({ text })} label={r.input} landmark={r.label} />
        {hasFacets ? (
          <Button className="g-results-filter-button" aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)}>
            {r.filtersCount(selected)}
          </Button>
        ) : null}
      </div>
      <div className="g-results-layout">
        {hasFacets ? (
          <section className="g-results-facets" aria-labelledby={`${base}-facets`}>
            <h2 id={`${base}-facets`} className="g-results-heading">
              {phrase(r.filters)}
            </h2>
            <Facets facets={facets} value={query.facets} onChange={(next) => change({ facets: next })} />
          </section>
        ) : null}
        <section className="g-results-main" aria-labelledby={`${base}-results`}>
          <h2 id={`${base}-results`} ref={headingRef} tabIndex={-1} className="g-results-heading">
            {phrase(r.results)}
          </h2>
          <p className="g-results-count" role="status">
            {searched && !loading ? phrase(count) : null}
          </p>
          {body}
          {pageCount > 1 && total > 0 ? (
            <Pagination
              count={pageCount}
              page={query.page}
              getHref={getPageHref}
              onPageChange={(page) => {
                // リンクで送るなら、フォーカスはアプリ（ルーター）に任せる
                focusResults.current = !getPageHref;
                onQueryChange({ ...query, page });
              }}
            />
          ) : null}
        </section>
      </div>
      {hasFacets ? (
        <ModalRoot open={sheetOpen} onOpenChange={setSheetOpen} kind="view" placement="sheet" label={r.filters}>
          <ModalHeader>
            <ModalControls end={<ModalClose />} />
            <ModalTitle>{r.filters}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Facets facets={facets} value={query.facets} onChange={(next) => change({ facets: next })} />
            {/* 面の外は開いている間は読めないので、件数を面の中でも読み上げる */}
            <p className="g-sr-only" role="status">
              {loading ? null : count}
            </p>
          </ModalBody>
          <ModalFooter>
            {selected > 0 ? (
              <ModalButton variant="tertiary" onClick={clearFacets}>
                {r.clearFilters}
              </ModalButton>
            ) : null}
            <ModalButton variant="primary" onClick={() => setSheetOpen(false)}>
              {r.showResults(total)}
            </ModalButton>
          </ModalFooter>
        </ModalRoot>
      ) : null}
    </div>
  );
}
