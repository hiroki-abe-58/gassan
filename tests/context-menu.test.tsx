/**
 * 右クリックのメニュー（U-34）。
 *
 * 項目の間の動き方は U-21 のメニューと共有する（tests/overlay.test.tsx）。ここでは開き方・閉じ方・フォーカスの戻り先を見る。
 * 押した位置に置くことはヘッドレス Chrome で確かめる。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ContextMenu, type MenuEntry } from '../src';

const items = (onRename?: () => void): MenuEntry[] => [
  { value: 'open', label: '開く' },
  { value: 'rename', label: '名前を変更', onSelect: onRename },
  { type: 'separator' },
  { value: 'delete', label: '削除', tone: 'danger' },
];

describe('右クリックのメニュー / U-34', () => {
  it('U-34 右クリックでメニューを開き、ブラウザのメニューを出さない。フォーカスはメニューそのものへ移り、選ぶと閉じて開く前の場所へ戻る', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onRename = vi.fn();
    render(
      <>
        <button type="button">前</button>
        <ContextMenu label="ファイルの操作" items={items(onRename)} onSelect={onSelect} data-testid="menu">
          <div data-testid="file">見積書.pdf</div>
        </ContextMenu>
      </>,
    );
    screen.getByRole('button', { name: '前' }).focus();
    expect(fireEvent.contextMenu(screen.getByTestId('file'), { clientX: 120, clientY: 80 })).toBe(false);
    const menu = screen.getByRole('menu', { name: 'ファイルの操作' });
    expect(menu).toHaveFocus();
    expect(menu).toHaveAttribute('data-testid', 'menu');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onRename).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('rename');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: '前' })).toHaveFocus();
  });

  it('U-34 中にフォーカスがあるときの Shift+F10 と ContextMenu キーで開き、最初の項目へフォーカスを移す。Esc は選ばずに閉じて戻す', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ContextMenu label="ファイルの操作" items={items()} onSelect={onSelect}>
        <ul>
          <li>
            <button type="button">見積書.pdf</button>
          </li>
        </ul>
      </ContextMenu>,
    );
    const file = screen.getByRole('button', { name: '見積書.pdf' });
    file.focus();
    await user.keyboard('{Shift>}{F10}{/Shift}');
    expect(screen.getByRole('menuitem', { name: '開く' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    expect(file).toHaveFocus();
    fireEvent.keyDown(file, { key: 'ContextMenu' });
    expect(screen.getByRole('menuitem', { name: '開く' })).toHaveFocus();
  });

  it('U-34 文字を打つ欄の上ではブラウザのメニューに任せ、入れ子にしたときは内側のメニューだけが開く', () => {
    render(
      <ContextMenu label="外の操作" items={[{ value: 'outer', label: '外' }]}>
        <div>
          <input aria-label="名前" />
          <ContextMenu label="内の操作" items={[{ value: 'inner', label: '内' }]}>
            <div data-testid="inner">内側</div>
          </ContextMenu>
        </div>
      </ContextMenu>,
    );
    expect(fireEvent.contextMenu(screen.getByRole('textbox', { name: '名前' }))).toBe(true);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.contextMenu(screen.getByTestId('inner'));
    expect(screen.getByRole('menu', { name: '内の操作' })).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: '外の操作' })).toBeNull();
  });

  it('U-34 メニューの外を押すと閉じる。右クリックした範囲の中を押しても閉じる', () => {
    render(
      <ContextMenu label="ファイルの操作" items={items()}>
        <div data-testid="file">見積書.pdf</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('file'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByTestId('file'));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
