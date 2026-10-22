/**
 * ページの上で道筋を示す部品（U-17 タブ・U-18 アコーディオン・U-22 パンくず・U-23 ページ送り・U-24 ステップ）。
 *
 * 印が滑る動き・開閉の高さの動き・器が狭いときの畳み方は CSS なので、ヘッドレス Chrome で確かめる。
 * ここでは役割・名前・状態・キー操作・フォーカスの行き先を見る。
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Accordion, Breadcrumbs, Pagination, Steps, Tabs } from '../src';

const PLAN_TABS = [
  { value: 'overview', label: '概要', content: <p>概要の中身</p> },
  { value: 'members', label: 'メンバー', content: <p>メンバーの中身</p> },
  { value: 'billing', label: '請求', content: <p>請求の中身</p>, disabled: true },
  { value: 'settings', label: '設定', content: <p>設定の中身</p> },
];

describe('タブ / U-17', () => {
  it('tablist に名前があり、選んでいるタブだけが Tab で止まり、その中身だけを見せる', () => {
    render(<Tabs label="プロジェクト" items={PLAN_TABS} />);
    const list = screen.getByRole('tablist', { name: 'プロジェクト' });
    const tabs = within(list).getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-disabled', 'true');
    const panel = screen.getByRole('tabpanel', { name: '概要' });
    expect(panel).toHaveTextContent('概要の中身');
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
    // 選んでいない中身は hidden で残す（入力中の値を失わない）。
    expect(screen.getByText('メンバーの中身').closest('[role="tabpanel"]')).not.toBeVisible();
  });

  it('←→ で隣へ移って選び（使えないタブは飛ばし、端で回る）、Home / End で端へ', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="プロジェクト" items={PLAN_TABS} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: '概要' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'メンバー' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: '設定' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: '設定' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: '概要' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: '設定' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: '概要' })).toHaveFocus();
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(['overview', 'members', 'settings', 'overview', 'settings', 'overview']);
  });

  it("activation='manual' では矢印はフォーカスだけを動かし、Enter / Space で選ぶ", async () => {
    const user = userEvent.setup();
    render(<Tabs label="プロジェクト" items={PLAN_TABS} activation="manual" />);
    await user.click(screen.getByRole('tab', { name: '概要' }));
    await user.keyboard('{ArrowRight}');
    const members = screen.getByRole('tab', { name: 'メンバー' });
    expect(members).toHaveFocus();
    expect(members).toHaveAttribute('aria-selected', 'false');
    // 選んでいなくても、フォーカスのあるタブが Tab で止まる場所になる。
    expect(members).toHaveAttribute('tabindex', '0');
    await user.keyboard('{Enter}');
    expect(members).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'メンバー' })).toHaveTextContent('メンバーの中身');
  });
});

describe('アコーディオン / U-18', () => {
  const FAQ = [
    { value: 'refund', title: '返金できますか', content: '30 日以内なら返金します。' },
    { value: 'invoice', title: '請求書は出せますか', content: '設定から発行できます。' },
    { value: 'legacy', title: '旧プラン', content: '受付を終えました。', disabled: true },
  ];

  it('details / summary で作り、defaultValue の項目を開いておく', () => {
    const { container } = render(<Accordion items={FAQ} defaultValue={['invoice']} />);
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(3);
    expect([...details].map((element) => element.open)).toEqual([false, true, false]);
    expect(details[1]?.querySelector('summary')).toHaveTextContent('請求書は出せますか');
  });

  it("type='single' は同じ name を持ち、1 つ開くと他を閉じて、開いている value を知らせる", async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Accordion items={FAQ} type="single" defaultValue={['refund']} onValueChange={onValueChange} />);
    const details = [...container.querySelectorAll('details')];
    expect(new Set(details.map((element) => element.getAttribute('name'))).size).toBe(1);
    details[1]!.open = true;
    details[1]!.dispatchEvent(new Event('toggle'));
    expect(details[0]!.open).toBe(false);
    expect(onValueChange).toHaveBeenLastCalledWith(['invoice']);
  });

  it('使えない項目は押しても開かない', async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion items={FAQ} />);
    const summary = screen.getByText('旧プラン').closest('summary')!;
    expect(summary).toHaveAttribute('aria-disabled', 'true');
    await user.click(summary);
    expect(container.querySelectorAll('details')[2]!.open).toBe(false);
  });
});

describe('パンくず / U-22', () => {
  it('名前のある nav の中の順序のある一覧で、最後が今のページ（リンクにしない）', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'ホーム', href: '#/' },
          { label: '設定', href: '#/settings' },
          { label: 'メンバー' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'パンくずリスト' });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(within(nav).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '#/');
    expect(within(nav).queryByRole('link', { name: 'メンバー' })).toBeNull();
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('メンバー');
    // 区切りの印は飾り。最後の項目の後ろには置かない。
    expect(nav.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  });
});

describe('ページ送り / U-23', () => {
  /** 数字と「…」の並び（前へ・次へ・狭いときの「3 / 10」は除く）。 */
  const slots = (): string[] =>
    [...document.querySelectorAll('.g-pagination-page, .g-pagination-gap')].map((item) => item.textContent ?? '');

  it('最初・最後・今のページと両脇を出して間を「…」で詰め、項目の数はどのページでも同じ', () => {
    const { rerender } = render(<Pagination count={10} page={1} />);
    expect(slots()).toEqual(['1', '2', '3', '4', '5', '…', '10']);
    rerender(<Pagination count={10} page={5} />);
    expect(slots()).toEqual(['1', '…', '4', '5', '6', '…', '10']);
    rerender(<Pagination count={10} page={10} />);
    expect(slots()).toEqual(['1', '…', '6', '7', '8', '9', '10']);
    rerender(<Pagination count={6} page={3} />);
    expect(slots()).toEqual(['1', '2', '3', '4', '5', '6']);
    // 「…」は飾り（数字の並びの切れ目は読ませない）。
    rerender(<Pagination count={10} page={5} />);
    for (const gap of document.querySelectorAll('.g-pagination-gap')) expect(gap).toHaveAttribute('aria-hidden', 'true');
  });

  it('各ページは「3ページ目」の名前で、今のページは aria-current。端では前へ・次へを押せない', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination count={5} defaultPage={1} onPageChange={onPageChange} />);
    const nav = screen.getByRole('navigation', { name: 'ページ送り' });
    expect(within(nav).getByRole('button', { name: '1ページ目' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: '前のページ' })).toBeDisabled();
    await user.click(within(nav).getByRole('button', { name: '3ページ目' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(within(nav).getByRole('button', { name: '3ページ目' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: '前のページ' })).toBeEnabled();
  });

  it('次へで最後のページへ着き、次へが押せなくなったら、フォーカスを今のページへ移す', async () => {
    const user = userEvent.setup();
    render(<Pagination count={3} defaultPage={2} />);
    await user.click(screen.getByRole('button', { name: '次のページ' }));
    expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '3ページ目' })).toHaveFocus();
  });

  it('getHref を渡すとリンクになり、端の前へ・次へは行き先を持たない', () => {
    render(<Pagination count={3} page={1} getHref={(page) => `?page=${String(page)}`} />);
    expect(screen.getByRole('link', { name: '2ページ目' })).toHaveAttribute('href', '?page=2');
    expect(screen.getByRole('link', { name: '次のページ' })).toHaveAttribute('href', '?page=2');
    const previous = screen.getByText((_, element) => element?.getAttribute('aria-label') === '前のページ');
    expect(previous).not.toHaveAttribute('href');
    expect(previous).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('ステップ / U-24', () => {
  it('順序のある一覧で、今の段は aria-current="step"。状態は文字でも添え、番号の印は読ませない', () => {
    render(
      <Steps
        label="申し込みの手順"
        current={1}
        items={[{ label: 'アカウント' }, { label: 'お支払い', description: '5 分ほど' }, { label: '確認' }]}
      />,
    );
    const list = screen.getByRole('list', { name: '申し込みの手順' });
    const steps = within(list).getAllByRole('listitem');
    expect(steps.map((step) => step.getAttribute('data-state'))).toEqual(['complete', 'current', 'upcoming']);
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).not.toHaveAttribute('aria-current');
    expect(steps[0]).toHaveTextContent('完了');
    expect(steps[1]).toHaveTextContent('進行中');
    expect(steps[2]).toHaveTextContent('未着手');
    for (const marker of list.querySelectorAll('.g-step-marker')) expect(marker).toHaveAttribute('aria-hidden', 'true');
  });
});
