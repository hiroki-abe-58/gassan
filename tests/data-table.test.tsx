/**
 * ページの見出しの帯（U-25）とデータの表（U-26）。
 *
 * 線・地の色・器が狭いときの折り返しは CSS なので、ヘッドレス Chrome で確かめる。
 * ここでは表の構造（caption・列と行の見出し）・並べ替え（aria-sort と読み上げ）・行の選択（名前・mixed・選んだ数）・
 * 空と読み込み中・横に送る領域・識別子の重複の警告を見る。
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button, DataTable, EmptyState, PageHeader, type DataTableColumn } from '../src';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

interface Member {
  id: string;
  name: string;
  email: string;
  seats: number | null;
  joined: Date;
}

const MEMBERS: Member[] = [
  { id: 'm1', name: '佐藤 花', email: 'hana@example.com', seats: 12, joined: new Date('2026-03-01') },
  { id: 'm2', name: 'Abe Ken', email: 'ken@example.com', seats: null, joined: new Date('2025-11-20') },
  { id: 'm3', name: '伊藤 蓮', email: 'ren@example.com', seats: 3, joined: new Date('2026-07-15') },
];

const COLUMNS: DataTableColumn<Member>[] = [
  { key: 'name', header: '名前', cell: (member) => member.name, sortValue: (member) => member.name },
  { key: 'email', header: 'メールアドレス', cell: (member) => member.email },
  { key: 'seats', header: '席', cell: (member) => member.seats ?? '—', sortValue: (member) => member.seats, align: 'end' },
  { key: 'joined', header: '参加日', cell: (member) => member.joined.toISOString().slice(0, 10), sortValue: (member) => member.joined },
];

const rowNames = (): string[] =>
  within(screen.getByRole('table'))
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent ?? '');

describe('ページの見出しの帯 / U-25', () => {
  it('道筋・見出し（h1）・補足・操作をこの順に並べ、ランドマークを作らない', () => {
    const { container } = render(
      <PageHeader
        title="メンバー"
        description="ワークスペースに参加している人"
        breadcrumbs={[{ label: '設定', href: '/settings' }, { label: 'メンバー' }]}
        actions={<Button variant="primary">招待する</Button>}
        data-testid="header"
      />,
    );
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('g-page-header');
    expect(screen.getByRole('heading', { level: 1, name: 'メンバー' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'パンくずリスト' })).toBeInTheDocument();
    const order = [...header.querySelectorAll('nav, h1, p, button')].map((element) => element.tagName);
    expect(order).toEqual(['NAV', 'H1', 'P', 'BUTTON']);
    expect(container.querySelector('header')).toBeNull();
    render(<PageHeader title="区切り" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: '区切り' })).toBeInTheDocument();
  });
});

describe('データの表 / U-26', () => {
  it('caption を名前にした table で、列の見出し（scope="col"）と行の見出し（scope="row"）を持ち、data-* を外側へ渡す', () => {
    render(<DataTable label="メンバー" columns={COLUMNS} rows={MEMBERS} getRowId={(member) => member.id} data-testid="table" />);
    const table = screen.getByRole('table', { name: 'メンバー' });
    expect(screen.getByTestId('table')).toHaveClass('g-data-table');
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.getAttribute('scope'))).toEqual(['col', 'col', 'col', 'col']);
    expect(rowNames()).toEqual(['佐藤 花', 'Abe Ken', '伊藤 蓮']);
    // 数の列は終わりにそろえる
    expect(within(table).getByRole('columnheader', { name: '席' })).toHaveAttribute('data-align', 'end');
  });

  it('並べ替えは見出しの中のボタンで、並べている列だけに aria-sort を付け、昇順と降順を切り替えて読み上げる（空は最後）', async () => {
    const user = userEvent.setup();
    render(<DataTable label="メンバー" columns={COLUMNS} rows={MEMBERS} getRowId={(member) => member.id} />);
    const seats = screen.getByRole('button', { name: '席' });
    await user.click(seats);
    expect(seats.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: '名前' })).not.toHaveAttribute('aria-sort');
    expect(rowNames()).toEqual(['伊藤 蓮', '佐藤 花', 'Abe Ken']);
    expect(screen.getByRole('status')).toHaveTextContent('席で昇順に並べ替えました');
    await user.click(seats);
    expect(seats.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames()).toEqual(['佐藤 花', '伊藤 蓮', 'Abe Ken']);
    expect(screen.getByRole('status')).toHaveTextContent('席で降順に並べ替えました');
    // 日付は時刻の値で、文字は言語の照合順（数を含む）で並べる
    await user.click(screen.getByRole('button', { name: '参加日' }));
    expect(rowNames()).toEqual(['Abe Ken', '佐藤 花', '伊藤 蓮']);
    // 並べ替えない列はボタンにしない
    expect(screen.queryByRole('button', { name: 'メールアドレス' })).toBeNull();
  });

  it('サーバーで並べ替える列（sortable）は onSortChange を呼ぶだけで、行の順は変えない', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const columns: DataTableColumn<Member>[] = [{ key: 'name', header: '名前', cell: (member) => member.name, sortable: true }];
    render(<DataTable label="メンバー" columns={columns} rows={MEMBERS} getRowId={(member) => member.id} onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: '名前' }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' });
    expect(rowNames()).toEqual(['佐藤 花', 'Abe Ken', '伊藤 蓮']);
  });

  it('行を選ぶチェックボックスは行の見出しを名前にし、見出しのチェックボックスは全部と一部（mixed）を示し、選んだ数と操作を出す', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <DataTable
        label="メンバー"
        columns={COLUMNS}
        rows={MEMBERS}
        getRowId={(member) => member.id}
        selectable
        onSelectedChange={onSelectedChange}
        bulkActions={(ids) => <Button size="sm">{`${String(ids.length)} 人を外す`}</Button>}
      />,
    );
    const all = screen.getByRole('checkbox', { name: 'すべて選択' });
    expect(screen.getByRole('columnheader', { name: /選択/ })).toContainElement(all);
    await user.click(screen.getByRole('checkbox', { name: 'Abe Ken' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['m2']);
    expect(all).toBePartiallyChecked();
    expect(screen.getByText('1 件を選択中')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 人を外す' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Abe Ken' }).closest('tr')).toHaveAttribute('data-selected');
    // 全部を選ぶと、見えている行の順で並ぶ
    await user.click(all);
    expect(all).toBeChecked();
    expect(onSelectedChange).toHaveBeenLastCalledWith(['m1', 'm2', 'm3']);
    expect(screen.getByRole('status')).toHaveTextContent('3 件を選択中');
    await user.click(screen.getByRole('button', { name: '選択を解除' }));
    expect(all).not.toBeChecked();
    expect(screen.queryByText(/件を選択中/)).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('選択を解除しました');
  });

  it('行の端の操作の列は読み上げだけの見出しを持つ', () => {
    render(
      <DataTable
        label="メンバー"
        columns={COLUMNS}
        rows={MEMBERS}
        getRowId={(member) => member.id}
        rowActions={(member) => <Button size="sm">{`${member.name} を編集`}</Button>}
      />,
    );
    expect(screen.getByRole('columnheader', { name: '操作' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '佐藤 花 を編集' }).closest('td')).toHaveClass('g-data-table-actions');
  });

  it('行が無いときは既定の文か empty を、読み込み中は骨組みを出して表を aria-busy にする', () => {
    const { rerender } = render(<DataTable label="メンバー" columns={COLUMNS} rows={[]} getRowId={(member: Member) => member.id} />);
    expect(screen.getByRole('cell', { name: '表示するものがありません' })).toHaveAttribute('colspan', '4');
    rerender(<DataTable label="メンバー" columns={COLUMNS} rows={[]} getRowId={(member: Member) => member.id} empty={<EmptyState title="まだメンバーがいません" />} />);
    expect(screen.getByRole('heading', { name: 'まだメンバーがいません' })).toBeInTheDocument();
    rerender(<DataTable label="メンバー" columns={COLUMNS} rows={[]} getRowId={(member: Member) => member.id} loading loadingRows={3} />);
    const table = screen.getByRole('table', { name: 'メンバー' });
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(table.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(3);
  });

  it('器より広いときだけ、横に送る領域に表の名前とフォーカスを与える（B-13）', () => {
    let notify: () => void = () => undefined;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe(): void {}
        disconnect(): void {}
      },
    );
    const width = { scroll: 900, client: 600 };
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => width.scroll);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width.client);
    render(<DataTable label="メンバー" columns={COLUMNS} rows={MEMBERS} getRowId={(member) => member.id} />);
    const region = screen.getByRole('region', { name: 'メンバー' });
    expect(region).toHaveAttribute('tabindex', '0');
    width.client = 1200;
    act(() => notify());
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('getRowId が重複すると、開発時にどの値かを名指しして警告する（D-13）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const rows = [MEMBERS[0], { ...MEMBERS[1], id: 'm1' }].filter((row): row is Member => row !== undefined);
    render(<DataTable label="重複" columns={COLUMNS} rows={rows} getRowId={(member) => member.id} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('DataTable: getRowId が重複している（m1）'));
  });
});
