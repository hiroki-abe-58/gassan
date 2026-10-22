/**
 * 起点の脇に出る部品（U-19 ツールチップ・U-20 ポップオーバー・U-21 メニュー）。
 *
 * top layer への描画・位置・出入りの動きは jsdom では確かめられない（ヘッドレス Chrome で見る）。
 * ここでは起点の属性・名前と説明・開閉のきっかけ・フォーカスの行き先・Esc の止め方を見る。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { IconButton, Menu, Popover, Tooltip } from '../src';

afterEach(() => {
  vi.useRealTimers();
});

/** 吹き出し（読み上げからは隠した、目に見える側）。 */
const bubble = (): Element | null => document.querySelector('.g-tooltip');

describe('ツールチップ / U-19', () => {
  it('文は起点の説明になり、出ていない間も DOM にある。名前と同じ文なら説明にしない', () => {
    render(
      <>
        <Tooltip content="下書きは 30 日後に消えます">
          <button type="button">下書き</button>
        </Tooltip>
        <Tooltip content="設定">
          <IconButton label="設定">
            <svg />
          </IconButton>
        </Tooltip>
      </>,
    );
    expect(screen.getByRole('button', { name: '下書き' })).toHaveAccessibleDescription('下書きは 30 日後に消えます');
    expect(screen.getByRole('button', { name: '設定' })).not.toHaveAttribute('aria-describedby');
    expect(bubble()).toBeNull();
  });

  it('ポインタを乗せて待つと出て、離れると少し待って消える。触れたときは出さない', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="共有のリンクをコピー" delay={400}>
        <button type="button">共有</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: '共有' });
    fireEvent.pointerEnter(button, { pointerType: 'touch' });
    act(() => vi.advanceTimersByTime(1000));
    expect(bubble()).toBeNull();

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(399));
    expect(bubble()).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(bubble()).toHaveTextContent('共有のリンクをコピー');
    expect(bubble()).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerLeave(button);
    // 起点から吹き出しへ移る間は消さない（WCAG 1.4.13）。
    fireEvent.pointerEnter(bubble()!);
    act(() => vi.advanceTimersByTime(500));
    expect(bubble()).not.toBeNull();
    fireEvent.pointerLeave(bubble()!);
    act(() => vi.advanceTimersByTime(200));
    expect(bubble()).toBeNull();
  });

  it('Esc は吹き出しだけを消し、keydown を止めて外（モーダル）に届かせない', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="共有のリンクをコピー">
        <button type="button">共有</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button', { name: '共有' }), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(400));
    expect(bubble()).not.toBeNull();
    const notPrevented = fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(bubble()).toBeNull();
    // 出ていないときの Esc は止めない。
    expect(fireEvent.keyDown(document.body, { key: 'Escape' })).toBe(true);
  });

  it('キーボードでフォーカスするとすぐ出て、離れると消える。押すと消える', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="共有のリンクをコピー">
        <button type="button">共有</button>
      </Tooltip>,
    );
    await user.tab();
    expect(bubble()).not.toBeNull();
    fireEvent.pointerDown(screen.getByRole('button', { name: '共有' }));
    expect(bubble()).toBeNull();
    await user.tab();
    expect(bubble()).toBeNull();
  });
});

describe('ポップオーバー / U-20', () => {
  it('起点は aria-haspopup="dialog" と aria-expanded を持ち、開くと見出しが名前の窓の最初の操作へフォーカスが入る', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button type="button">絞り込み</button>} title="表示の絞り込み">
        <label>
          <input type="checkbox" /> 未読だけ
        </label>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: '絞り込み' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '表示の絞り込み' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(within(dialog).getByRole('checkbox', { name: '未読だけ' })).toHaveFocus();
  });

  it('Esc で閉じて起点へ戻り、keydown を止める。外を押しても閉じる', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p>外</p>
        <Popover trigger={<button type="button">絞り込み</button>} title="表示の絞り込み">
          <button type="button">適用</button>
        </Popover>
      </>,
    );
    const trigger = screen.getByRole('button', { name: '絞り込み' });
    await user.click(trigger);
    const notPrevented = fireEvent.keyDown(screen.getByRole('button', { name: '適用' }), { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    fireEvent.pointerDown(screen.getByText('外'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('最初から開いているときはフォーカスを奪わない', () => {
    render(
      <Popover trigger={<button type="button">絞り込み</button>} title="表示の絞り込み" defaultOpen>
        <button type="button">適用</button>
      </Popover>,
    );
    expect(screen.getByRole('dialog', { name: '表示の絞り込み' })).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });
});

describe('メニュー / U-21', () => {
  const ITEMS = [
    { value: 'rename', label: '名前を変更' },
    { value: 'duplicate', label: '複製', shortcut: '⌘D' },
    { value: 'archive', label: 'アーカイブ', disabled: true },
    { type: 'separator' as const },
    { value: 'delete', label: '削除', tone: 'danger' as const },
  ];

  const setup = (onSelect = vi.fn()) => {
    const user = userEvent.setup();
    render(<Menu trigger={<button type="button">操作</button>} items={ITEMS} onSelect={onSelect} />);
    return { user, onSelect, trigger: screen.getByRole('button', { name: '操作' }) };
  };

  it('起点は aria-haspopup="menu"。↓で開くと最初の項目、↑で開くと最後の項目へ', async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const menu = screen.getByRole('menu', { name: '操作' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: '名前を変更' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: '削除' })).toHaveFocus();
  });

  it('↑↓ は端で回り、Home / End で端へ、頭文字で次の項目へ。使えない項目にも止まる', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitem', { name: '名前を変更' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'アーカイブ' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'アーカイブ' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: '名前を変更' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: '削除' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: '名前を変更' })).toHaveFocus();
    await user.keyboard('複');
    expect(screen.getByRole('menuitem', { name: '複製' })).toHaveFocus();
  });

  it('Enter で選ぶと閉じて起点へ戻り、onSelect に value が届く。使えない項目は選べない', async () => {
    const { user, trigger, onSelect } = setup();
    trigger.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('duplicate');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('ポインタで開くとメニューそのものへフォーカスを移し（項目を先回りして光らせない）、押した項目を選ぶ', async () => {
    const { user, trigger, onSelect } = setup();
    await user.click(trigger);
    const menu = screen.getByRole('menu');
    expect(menu).toHaveFocus();
    await user.click(within(menu).getByRole('menuitem', { name: '削除' }));
    expect(onSelect).toHaveBeenCalledWith('delete');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('Esc は keydown を止める。区切りは separator、まとまりは名前のある group', async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<button type="button">表示</button>}
        items={[
          { type: 'group', label: '並び順', items: [{ value: 'new', label: '新しい順' }, { value: 'old', label: '古い順' }] },
          { type: 'separator' },
          { value: 'reset', label: '元に戻す' },
        ]}
      />,
    );
    screen.getByRole('button', { name: '表示' }).focus();
    await user.keyboard('{Enter}');
    const menu = screen.getByRole('menu', { name: '表示' });
    expect(within(menu).getByRole('group', { name: '並び順' })).toBeInTheDocument();
    expect(within(menu).getByRole('separator')).toBeInTheDocument();
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    expect(fireEvent.keyDown(within(menu).getByRole('menuitem', { name: '新しい順' }), { key: 'Escape' })).toBe(false);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
