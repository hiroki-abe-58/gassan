/**
 * アプリの部品（U-30 コードの塊・U-31 ツリー・U-32 通知の一覧・U-33 はじめのチェックリスト）。
 *
 * 見た目はヘッドレス Chrome で確かめる。ここでは役割と名前・キー操作・呼び出し・読み上げに添える言葉を見る。
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Checklist, CodeBlock, NotificationCenter, TreeView, type NotificationEntry, type TreeNode } from '../src';
import { resetWarnings } from '../src/internal/dom';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  resetWarnings();
});

describe('コードの塊 / U-30', () => {
  it('U-30 コードの塊は「〜 のコード」を名前にした group で Tab で止まり、見出しと写すボタンを置く。色分けした中身を渡しても写すのは code', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(
      <CodeBlock code="npm install @genelab/gassan" title="install.sh" language="bash" data-testid="code">
        <span className="tok">npm</span> install @genelab/gassan
      </CodeBlock>,
    );
    const code = screen.getByRole('group', { name: 'install.sh のコード' });
    expect(code).toHaveAttribute('tabindex', '0');
    expect(code).toHaveTextContent('npm install @genelab/gassan');
    expect(code.querySelector('.tok')).toHaveTextContent('npm');
    expect(screen.getByTestId('code')).toHaveTextContent('install.sh');
    await user.click(screen.getByRole('button', { name: 'コードをコピー' }));
    expect(writeText).toHaveBeenCalledWith('npm install @genelab/gassan');
  });

  it('U-30 見出しが言語だけなら言語を上の帯に出して名前にも使い、見出しが無ければ名前は「コード」。textLang を中の文の言語にし、copy={false} で写すボタンを出さない', () => {
    const { rerender } = render(<CodeBlock code="const a = 1;" language="ts" textLang="en" />);
    expect(screen.getByRole('group', { name: 'ts のコード' })).toHaveAttribute('lang', 'en');
    expect(document.querySelector('.g-codeblock-title')).toHaveTextContent('ts');
    rerender(<CodeBlock code="const a = 1;" copy={false} />);
    expect(screen.getByRole('group', { name: 'コード' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('.g-codeblock-bar')).toBeNull();
  });
});

const TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'app.tsx' },
      { id: 'components', label: 'components', children: [{ id: 'button', label: 'button.tsx' }] },
    ],
  },
  { id: 'readme', label: 'README.md' },
];

const tree = (): HTMLElement => screen.getByRole('tree', { name: 'ファイル' });
const node = (name: string): HTMLElement => within(tree()).getByRole('treeitem', { name });

describe('ツリー / U-31', () => {
  it('U-31 ツリーは名前のある tree で、項目は名前（名前の部分だけ）・深さ・兄弟の数と位置・開閉の状態を持つ。Tab で止まるのは 1 つ', () => {
    render(<TreeView label="ファイル" items={TREE} defaultExpanded={['src']} data-testid="tree" />);
    expect(screen.getByTestId('tree')).toBe(tree());
    const src = node('src');
    expect(src).toHaveAttribute('aria-level', '1');
    expect(src).toHaveAttribute('aria-setsize', '2');
    expect(src).toHaveAttribute('aria-posinset', '1');
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(within(src).getByRole('group')).toContainElement(node('app.tsx'));
    expect(node('app.tsx')).toHaveAttribute('aria-level', '2');
    expect(node('app.tsx')).not.toHaveAttribute('aria-expanded');
    expect(node('components')).toHaveAttribute('aria-expanded', 'false');
    expect(within(tree()).queryByRole('treeitem', { name: 'button.tsx' })).toBeNull();
    const stops = within(tree())
      .getAllByRole('treeitem')
      .filter((item) => item.tabIndex === 0);
    expect(stops).toEqual([src]);
  });

  it('U-31 ↑↓ で見えている項目を動き、→ で開いて子へ、← で閉じて親へ。Home / End と、打った文字で始まる項目へ移る', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<TreeView label="ファイル" items={TREE} defaultExpanded={['src']} onExpandedChange={onExpandedChange} />);
    await user.tab();
    expect(document.activeElement).toBe(node('src'));
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toBe(node('components'));
    await user.keyboard('{ArrowRight}');
    expect(node('components')).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['src', 'components']);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(node('button.tsx'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(node('components'));
    await user.keyboard('{ArrowLeft}');
    expect(node('components')).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(node('README.md'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(node('src'));
    await user.keyboard('r');
    expect(document.activeElement).toBe(node('README.md'));
    // Tab で止まる項目は、いまフォーカスのある 1 つだけ
    expect(node('README.md').tabIndex).toBe(0);
    expect(node('src').tabIndex).toBe(-1);
  });

  it('U-31 Enter と押下で選んで onSelectedChange を呼び、枝なら開閉も切り替える。閉じた枝の中にフォーカスがあれば、見えている親へ移す', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<TreeView label="ファイル" items={TREE} defaultExpanded={['src', 'components']} onSelectedChange={onSelectedChange} />);
    await user.click(within(node('button.tsx')).getByText('button.tsx'));
    expect(onSelectedChange).toHaveBeenLastCalledWith('button');
    expect(node('button.tsx')).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(node('button.tsx'));

    // 祖先の枝を押して閉じると、隠れた項目の代わりに見えている親が Tab の止まり先になる
    await user.click(within(node('src')).getAllByText('src')[0]!);
    expect(onSelectedChange).toHaveBeenLastCalledWith('src');
    expect(node('src')).toHaveAttribute('aria-expanded', 'false');
    expect(node('src').tabIndex).toBe(0);

    await user.keyboard('{Enter}');
    expect(node('src')).toHaveAttribute('aria-expanded', 'true');
  });

  it('U-31 data-* を tree へ渡し、項目の id が重複すると開発時に警告する（D-13）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <TreeView
        label="ファイル"
        items={[
          { id: 'a', label: 'A' },
          { id: 'a', label: 'B' },
        ]}
        data-section="files"
      />,
    );
    expect(tree()).toHaveAttribute('data-section', 'files');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('items[].id'));
  });
});

const NOTICES: NotificationEntry[] = [
  { id: 'n1', title: '鈴木 蓮さんがコメントしました', body: '「料金表の見直し」に返信がありました', time: new Date(Date.now() - 5 * 60_000) },
  { id: 'n2', title: '請求書を発行しました', time: new Date(Date.now() - 3 * 3600_000), href: '/billing' },
  { id: 'n3', title: 'メンバーが参加しました', time: new Date(Date.now() - 2 * 86_400_000), read: true },
];

describe('通知の一覧 / U-32', () => {
  it('U-32 鈴のボタンの名前は「通知」、未読があれば「通知 未読 2件」。開くと見出しのある窓に、未読を添えた項目と時刻を並べる', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NotificationCenter items={[]} />);
    expect(screen.getByRole('button', { name: '通知' })).toHaveAttribute('aria-haspopup', 'dialog');
    rerender(<NotificationCenter items={NOTICES} />);
    await user.click(screen.getByRole('button', { name: '通知 未読 2件' }));
    const panel = screen.getByRole('dialog', { name: '通知' });
    const first = within(panel).getByRole('button', { name: '未読 鈴木 蓮さんがコメントしました' });
    expect(first).toHaveAccessibleDescription('「料金表の見直し」に返信がありました 5 分前');
    expect(within(panel).getByRole('link', { name: '未読 請求書を発行しました' })).toHaveAttribute('href', '/billing');
    expect(within(panel).getByRole('button', { name: 'メンバーが参加しました' })).toHaveAccessibleDescription('一昨日');
  });

  it('U-32 項目を押すと onOpenItem を、「すべて既読にする」で onMarkAllRead を呼ぶ。項目が無ければ「新しい通知はありません」と示す', async () => {
    const user = userEvent.setup();
    const onOpenItem = vi.fn();
    const onMarkAllRead = vi.fn();
    const { rerender } = render(<NotificationCenter items={NOTICES} onOpenItem={onOpenItem} onMarkAllRead={onMarkAllRead} defaultOpen />);
    await user.click(screen.getByRole('button', { name: '未読 鈴木 蓮さんがコメントしました' }));
    expect(onOpenItem).toHaveBeenCalledWith('n1');
    await user.click(screen.getByRole('button', { name: 'すべて既読にする' }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    rerender(<NotificationCenter items={[]} onMarkAllRead={onMarkAllRead} defaultOpen />);
    const panel = screen.getByRole('dialog', { name: '通知' });
    expect(panel).toHaveTextContent('新しい通知はありません');
    expect(within(panel).queryByRole('button', { name: 'すべて既読にする' })).toBeNull();
  });
});

describe('はじめのチェックリスト / U-33', () => {
  const STEPS = [
    { id: 'profile', title: 'プロフィールを整える', done: true, action: <button type="button">開く</button> },
    { id: 'invite', title: 'メンバーを招待する', description: 'チームで使うと、記録をまとめて残せます', action: <button type="button">招待する</button> },
    { id: 'connect', title: 'カレンダーをつなぐ' },
  ];

  it('U-33 チェックリストは見出しを名前にした region で、「1 / 3 完了」の進み具合と番号つきの手順を持ち、手順の状態を読み上げに添える', () => {
    render(<Checklist title="はじめにやること" items={STEPS} data-testid="list" />);
    const region = screen.getByRole('region', { name: 'はじめにやること' });
    expect(region).toBe(screen.getByTestId('list'));
    expect(within(region).getByRole('heading', { level: 2, name: 'はじめにやること' })).toBeInTheDocument();
    const bar = within(region).getByRole('progressbar', { name: 'はじめにやること' });
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
    expect(bar).toHaveAttribute('aria-valuetext', '1 / 3 完了');
    const steps = within(within(region).getByRole('list')).getAllByRole('listitem');
    expect(steps[0]).toHaveTextContent('完了 プロフィールを整える');
    expect(steps[1]).toHaveTextContent('未完了 メンバーを招待する');
    expect(region.querySelector('ol')).not.toBeNull();
  });

  it('U-33 手順の操作を押して手順が終わり操作が消えたら、次のまだの手順の操作へ、無ければ見出しへフォーカスを移す', async () => {
    const user = userEvent.setup();
    function Steps(): ReactNode {
      const [done, setDone] = useState<string[]>([]);
      const step = (id: string, title: string) => ({
        id,
        title,
        done: done.includes(id),
        action: (
          <button type="button" onClick={() => setDone((list) => [...list, id])}>
            {`${title}を終える`}
          </button>
        ),
      });
      return <Checklist title="はじめにやること" items={[step('a', '招待'), step('b', '連携')]} />;
    }
    render(<Steps />);
    await user.click(screen.getByRole('button', { name: '招待を終える' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '連携を終える' }));
    await user.click(screen.getByRole('button', { name: '連携を終える' }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'はじめにやること' }));
  });

  it('U-33 終えた手順には操作を出さず、閉じるボタンで onDismiss を呼ぶ', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Checklist title="はじめにやること" items={STEPS} onDismiss={onDismiss} headingLevel={3} />);
    expect(screen.queryByRole('button', { name: '開く' })).toBeNull();
    expect(screen.getByRole('button', { name: '招待する' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
