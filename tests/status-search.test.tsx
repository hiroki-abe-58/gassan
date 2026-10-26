/**
 * 稼働状況（P-39）と検索結果（P-40）。
 *
 * 帯の升の幅と色・ポインタで日を選ぶ動き・狭い器で絞り込みを面へ移す並べ方は templates.css とレイアウトなので、
 * ヘッドレス Chrome で確かめる。ここでは状態の文・日の升の読み上げとキー操作・障害の経過・登録・強調・件数・
 * 条件を変えたときに渡す値・フォーカスの行き先を確かめる。
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  SearchPage,
  ServiceStatusPage,
  SiteProvider,
  type SearchFacet,
  type SearchQuery,
  type SearchResult,
  type ServiceComponent,
  type ServiceDay,
  type ServiceIncident,
} from '../src';

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={{ home: '/', status: '/status' }} timeZone="Asia/Tokyo">
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

const DAYS: ServiceDay[] = [
  { date: '2026-10-22', status: 'operational' },
  { date: '2026-10-23', status: 'partial', note: 'API の遅延 2 時間 15 分' },
  { date: '2026-10-24', status: null },
  { date: '2026-10-25', status: 'maintenance' },
  { date: '2026-10-26', status: 'operational' },
];

const COMPONENTS: ServiceComponent[] = [
  { id: 'api', name: 'API', status: 'degraded', uptime: 99.98, days: DAYS },
  { id: 'web', name: 'ダッシュボード', status: 'operational' },
  { id: 'mail', name: 'メールの送信', status: 'maintenance', description: '通知のメールを送る仕組み' },
];

const INCIDENTS: ServiceIncident[] = [
  {
    id: 'slow',
    title: 'API の応答が遅くなっています',
    impact: 'degraded',
    components: ['api'],
    updates: [
      { time: '2026-10-26T01:10:00Z', stage: 'identified', text: 'データベースの負荷が原因でした。' },
      { time: '2026-10-26T00:40:00Z', stage: 'investigating', text: '原因を調べています。' },
    ],
  },
  {
    id: 'login',
    title: 'ログインできない障害',
    impact: 'major',
    components: ['web', 'api'],
    updates: [
      { time: '2026-10-20T03:00:00Z', stage: 'resolved', text: '直りました。' },
      { time: '2026-10-20T02:00:00Z', stage: 'investigating', text: '原因を調べています。' },
    ],
  },
];

describe('稼働状況 / P-39', () => {
  it('P-39 全体の状態はいちばん重い部分の文で書き、部分ごとに状態の言葉の印と稼働率を出す。対応中の障害を先に並べる', () => {
    renderInSite(<ServiceStatusPage components={COMPONENTS} incidents={INCIDENTS} updatedAt="2026-10-26T01:15:00Z" />);
    // 遅延（API）はメンテナンス（メールの送信）より重い
    const overall = document.querySelector('.g-service-overall');
    expect(overall).toHaveAttribute('role', 'status');
    expect(overall).toHaveTextContent('一部のシステムで動作が遅くなっています');
    expect(overall).toHaveTextContent('最終更新 2026/10/26 10:15');
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['対応中の障害', 'システムの状態', '過去の障害']);
    const components = screen.getByRole('region', { name: 'システムの状態' });
    const api = within(components).getByRole('heading', { level: 3, name: 'API' }).closest('li') as HTMLElement;
    expect(api).toHaveTextContent('遅延');
    expect(api).toHaveTextContent('稼働率 99.98%');
    expect(within(components).getByRole('heading', { level: 3, name: 'メールの送信' }).closest('li')).toHaveTextContent('メンテナンス');
    // 対応中の障害は、影響といまの段階を言葉の印で示し、影響を受けた部分を添える
    const incident = within(screen.getByRole('region', { name: '対応中の障害' })).getByRole('article', { name: 'API の応答が遅くなっています' });
    expect(incident).toHaveTextContent('遅延');
    expect(incident).toHaveTextContent('原因を特定');
    expect(incident).toHaveTextContent('影響を受けた部分API');
  });

  it('P-39 稼働の帯は今日の升だけが Tab で止まり、←→ と Home / End で日を移り、日付と状態を読み、稼働率と問題のあった日の数を説明に結ぶ', async () => {
    const user = userEvent.setup();
    renderInSite(<ServiceStatusPage components={COMPONENTS} />);
    const grid = screen.getByRole('grid', { name: 'API の過去 5 日' });
    // メンテナンスと記録の無い日は、問題のあった日に数えない
    expect(grid).toHaveAccessibleDescription('稼働率 99.98% 5 日のうち、問題があった日は 1 日');
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells.map((cell) => cell.tabIndex)).toEqual([-1, -1, -1, -1, 0]);
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '10月22日(木) 正常',
      '10月23日(金) 一部の障害。API の遅延 2 時間 15 分',
      '10月24日(土) 記録なし',
      '10月25日(日) メンテナンス',
      '10月26日(月) 正常',
    ]);
    const today = cells[4] as HTMLElement;
    act(() => today.focus());
    await user.keyboard('{ArrowLeft}');
    expect(cells[3]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(cells[0]).toHaveFocus();
    // 指した日は帯の下にも出す（見た目だけ。読み上げは升の文）
    expect(document.querySelector('.g-uptime-readout')).toHaveTextContent('10月22日(木) 正常');
    await user.keyboard('{End}');
    expect(today).toHaveFocus();
    expect(cells.map((cell) => cell.tabIndex)).toEqual([-1, -1, -1, -1, 0]);
  });

  it('P-39 過去の障害は段階の言葉と time 要素の経過で並べ、メールの登録は確認のメールを送ったことを読み上げる', async () => {
    const user = userEvent.setup();
    const onSubscribe = vi.fn().mockResolvedValue(undefined);
    renderInSite(<ServiceStatusPage components={COMPONENTS} incidents={INCIDENTS} onSubscribe={onSubscribe} feedHref="/status.rss" />);
    const incident = within(screen.getByRole('region', { name: '過去の障害' })).getByRole('article', { name: 'ログインできない障害' });
    expect(incident).toHaveTextContent('大規模な障害');
    expect(incident).toHaveTextContent('解決済み');
    expect(incident).toHaveTextContent('影響を受けた部分ダッシュボード、API');
    const times = [...incident.querySelectorAll('time')];
    expect(times.map((time) => time.getAttribute('datetime'))).toEqual(['2026-10-20T03:00:00.000Z', '2026-10-20T02:00:00.000Z']);
    expect(times.map((time) => time.textContent)).toEqual(['2026/10/20 12:00', '2026/10/20 11:00']);

    // ページの上の「更新を受け取る」は、登録の節の見出しへ移る
    expect(screen.getByRole('link', { name: '更新を受け取る' })).toHaveAttribute('href', expect.stringMatching(/^#/));
    const subscribe = screen.getByRole('region', { name: '更新を受け取る' });
    expect(within(subscribe).getByRole('link', { name: 'RSS で購読する' })).toHaveAttribute('href', '/status.rss');
    await user.type(within(subscribe).getByRole('textbox', { name: /メールアドレス/ }), 'aoi@example.com');
    await user.click(within(subscribe).getByRole('button', { name: '登録する' }));
    expect(onSubscribe).toHaveBeenCalledWith('aoi@example.com');
    await vi.waitFor(() => expect(within(subscribe).getByRole('status')).toHaveTextContent('aoi@example.com に確認のメールを送りました'));
    // 欄とボタンは消えるので、節の見出しへフォーカスを移す
    expect(within(subscribe).queryByRole('button', { name: '登録する' })).toBeNull();
    expect(within(subscribe).getByRole('heading', { level: 2, name: '更新を受け取る' })).toHaveFocus();
  });
});

const RESULTS: SearchResult[] = [
  { id: 'keys', title: 'API キーを作る', href: '/help/api-keys', meta: 'ヘルプ › 開発', snippet: '新しい api キーは、設定の「API キー」から作ります。' },
];

const FACETS: SearchFacet[] = [
  {
    id: 'category',
    label: 'カテゴリ',
    options: [
      { value: 'billing', label: '請求', count: 12 },
      { value: 'account', label: 'アカウント', count: 3 },
    ],
  },
];

describe('検索結果 / P-40', () => {
  it('P-40 探した言葉に当たる所を mark で示し（かなと全角半角を区別しない）、件数を role="status" で伝える', () => {
    renderInSite(<SearchPage query={{ text: 'ＡＰＩ　きー', facets: {}, page: 1 }} onQueryChange={vi.fn()} results={RESULTS} total={12} />);
    expect(screen.getByRole('search', { name: 'サイト内の検索' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '探す言葉' })).toHaveValue('ＡＰＩ　きー');
    // 見出しの名前は文字で確かめる（mark は独立した役割なので、テストの名前の計算が境目に空白を足す）
    const title = screen.getAllByRole('heading', { level: 3 })[0] as HTMLElement;
    expect(title).toHaveTextContent('API キーを作る');
    expect([...title.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual(['API', 'キー']);
    expect(within(title).getByRole('link')).toHaveAttribute('href', '/help/api-keys');
    const snippet = title.closest('li')?.querySelector('.g-result-snippet');
    expect([...(snippet?.querySelectorAll('mark') ?? [])].map((mark) => mark.textContent)).toEqual(['api', 'キー', 'API', 'キー']);
    const count = document.querySelector('.g-results-count');
    expect(count).toHaveAttribute('role', 'status');
    // 探した言葉は打ったまま（全角の空白も）引く
    expect(count).toHaveTextContent('「ＡＰＩ　きー」の検索結果 12 件', { normalizeWhitespace: false });
  });

  it('P-40 絞り込みを変えると 1 ページ目に戻して渡し、ページを送ると結果の見出しへフォーカスを移す', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    function Harness(): ReactNode {
      const [query, setQuery] = useState<SearchQuery>({ text: '請求', facets: {}, page: 3 });
      return (
        <SearchPage
          query={query}
          onQueryChange={(next) => {
            onQueryChange(next);
            setQuery(next);
          }}
          results={RESULTS}
          total={40}
          pageCount={5}
          facets={FACETS}
        />
      );
    }
    renderInSite(<Harness />);
    const facets = screen.getByRole('region', { name: '絞り込み' });
    await user.click(within(facets).getByRole('checkbox', { name: /請求/ }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '請求', facets: { category: ['billing'] }, page: 1 });
    // 絞り込みを変えてもフォーカスは選んだチェックボックスのまま
    expect(within(facets).getByRole('checkbox', { name: /請求/ })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '2ページ目' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '請求', facets: { category: ['billing'] }, page: 2 });
    expect(screen.getByRole('heading', { level: 2, name: '検索結果' })).toHaveFocus();
  });

  it('P-40 まだ探していない画面と当てはまらない画面を分け、当てはまらないときは絞り込みを外す道を出す', async () => {
    const user = userEvent.setup();
    const { rerender } = renderInSite(<SearchPage query={{ text: '', facets: {}, page: 1 }} onQueryChange={vi.fn()} results={[]} total={0} />);
    expect(screen.getByRole('heading', { level: 3, name: '探したい言葉を入れてください' })).toBeInTheDocument();
    expect(document.querySelector('.g-results-count')).toBeEmptyDOMElement();

    const onQueryChange = vi.fn();
    rerender(
      <Site>
        <SearchPage query={{ text: 'zzz', facets: { category: ['billing'] }, page: 1 }} onQueryChange={onQueryChange} results={[]} total={0} facets={FACETS} />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 3, name: '「zzz」に当てはまるものはありません' })).toBeInTheDocument();
    expect(document.querySelector('.g-results-count')).toHaveTextContent('「zzz」の検索結果 0 件');
    await user.click(screen.getByRole('button', { name: '絞り込みを外す' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: 'zzz', facets: {}, page: 1 });
    // 押したボタンは消えるので、結果の見出しへ移す
    expect(screen.getByRole('heading', { level: 2, name: '検索結果' })).toHaveFocus();
  });

  it('P-40 器が狭いときの絞り込みは「絞り込み」のボタンから面で開き、面の中で件数を読み上げ、「N 件の結果を見る」で閉じる', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    renderInSite(<SearchPage query={{ text: '請求', facets: { category: ['billing'] }, page: 1 }} onQueryChange={onQueryChange} results={RESULTS} total={12} facets={FACETS} />);
    const button = screen.getByRole('button', { name: '絞り込み（1）' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(button);
    const dialog = screen.getByRole('dialog', { name: '絞り込み' });
    expect(within(dialog).getByRole('checkbox', { name: /請求/ })).toBeChecked();
    // 面の外は開いている間は読めないので、件数を面の中でも読み上げる
    expect(within(dialog).getAllByRole('status').map((node) => node.textContent)).toContain('「請求」の検索結果 12 件');
    await user.click(within(dialog).getByRole('checkbox', { name: /アカウント/ }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '請求', facets: { category: ['billing', 'account'] }, page: 1 });
    await user.click(within(dialog).getByRole('button', { name: '12 件の結果を見る' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(button).toHaveFocus();
  });
});

describe('稼働状況と検索結果 / P-39・P-40', () => {
  it('P-39・P-40 のテンプレートは data-* を外側の要素へ渡す', () => {
    renderInSite(
      <>
        <ServiceStatusPage components={[]} data-probe="status" />
        <SearchPage query={{ text: '', facets: {}, page: 1 }} onQueryChange={vi.fn()} results={[]} total={0} data-probe="search" />
      </>,
    );
    expect(document.querySelector('[data-probe="status"]')).toHaveClass('g-page');
    expect(document.querySelector('[data-probe="search"]')).toHaveClass('g-results');
  });
});
