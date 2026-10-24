/**
 * コマンドパレット（U-27）。
 *
 * 画面の上の位置・候補の行の形・当てはまった所の太さは CSS なので、ヘッドレス Chrome で確かめる。
 * ここでは開くキー・絞り込み（全角半角・かなの種類）・並べる順・キーでの移動・選んだときの順序・まとまりの名前・
 * 読み上げ・IME の変換中の Enter を見る。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CommandPalette, type CommandItem } from '../src';

afterEach(() => {
  vi.restoreAllMocks();
  window.location.hash = '';
});

const ITEMS: CommandItem[] = [
  { id: 'members', label: 'メンバー', group: 'ページ', keywords: ['members'] },
  { id: 'billing', label: '料金と請求', group: 'ページ', keywords: ['billing', 'invoice'] },
  { id: 'settings', label: '設定', group: 'ページ', description: 'プロフィールとパスワード' },
  { id: 'invite', label: 'メンバーを招待', group: '操作', shortcut: ['G', 'I'] },
  { id: 'export', label: 'データを書き出す', group: '操作', disabled: true },
  { id: 'theme', label: 'テーマを切り替える', group: '操作' },
];

const input = (): HTMLInputElement => screen.getByRole('combobox', { name: 'コマンドパレット' });
const active = (): string => document.getElementById(input().getAttribute('aria-activedescendant') ?? '')?.textContent ?? '';
const names = (): string[] => within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.textContent ?? '');
/** 当てはまった数の読み上げ（ダイアログ自身の読み上げの領域とは別に、いつも置いてある）。 */
const status = (): Element => document.querySelector('.g-command-status[role="status"]') as Element;

describe('コマンドパレット / U-27', () => {
  it('Ctrl+K（Apple の端末では ⌘K）で開いて検索欄にフォーカスし、もう一度押すと閉じる。hotkey={false} なら開かない', async () => {
    const { unmount } = render(<CommandPalette items={ITEMS} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(screen.getByRole('dialog', { name: 'コマンドパレット' })).toBeInTheDocument();
    await vi.waitFor(() => expect(input()).toHaveFocus());
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input()).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    unmount();

    render(<CommandPalette items={ITEMS} hotkey={false} />);
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('打った文字を名前・補足・別名と突き合わせ（全角半角・かなの種類を区別しない）、名前の頭に当てはまるものから並べて当てはまった所を太字にし、数を読み上げる', async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={ITEMS} defaultOpen />);
    // 何も打っていなければ全部を、まとまりごとに渡した順で出す
    expect(names()).toEqual(['メンバー', '料金と請求', '設定プロフィールとパスワード', 'メンバーを招待GI', 'データを書き出す', 'テーマを切り替える']);
    expect(status()).toHaveTextContent('');

    // ひらがなでカタカナの名前に当たる。名前の頭に当たる 2 つが先、名前の中に当たる「テーマを…」は無い
    await user.type(input(), 'めんばー');
    expect(names()).toEqual(['メンバー', 'メンバーを招待GI']);
    expect(document.querySelectorAll('mark')).toHaveLength(2);
    expect(document.querySelector('mark')).toHaveTextContent('メンバー');
    expect(status()).toHaveTextContent('2 件の候補');

    // 名前の中に当たるものは、名前の頭に当たるものの後。全角の英字と大文字も区別しない
    await user.clear(input());
    await user.type(input(), 'を');
    expect(names()).toEqual(['メンバーを招待GI', 'データを書き出す', 'テーマを切り替える']);
    await user.clear(input());
    await user.type(input(), 'ＩＮＶＯＩＣＥ');
    expect(names()).toEqual(['料金と請求']);
    // 別名と補足に当たったものは、名前に印を付けない
    expect(document.querySelector('mark')).toBeNull();

    await user.clear(input());
    await user.type(input(), 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    // 文は文節の span に分かれるので、要素の文字で見る
    expect(document.querySelector('.g-command-empty')).toHaveTextContent('一致する候補がありません');
    expect(status()).toHaveTextContent('一致する候補がありません');
  });

  it('↑↓ で候補を指し（使えない候補は飛ばし、端で止まる）、Enter で選ぶと閉じてから onSelect を呼ぶ。IME の変換中の Enter では選ばない', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const onOpenChange = vi.fn((open: boolean) => order.push(open ? 'open' : 'close'));
    const items = ITEMS.map((item) => ({ ...item, onSelect: () => order.push(item.id) }));
    render(<CommandPalette items={items} defaultOpen onOpenChange={onOpenChange} />);
    await vi.waitFor(() => expect(input()).toHaveFocus());
    expect(active()).toBe('メンバー');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('メンバー');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active()).toBe('メンバーを招待GI');
    // 「データを書き出す」は使えないので飛ばす
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('テーマを切り替える');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('テーマを切り替える');

    // 変換を確定する Enter（keyCode 229）では選ばない
    fireEvent.keyDown(input(), { key: 'Enter', keyCode: 229 });
    expect(order).toEqual([]);
    await user.keyboard('{Enter}');
    expect(order).toEqual(['close', 'theme']);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('まとまりは見出しを名前にした group にし、指している候補だけを aria-selected にする。補足は説明として読み、ポインタで指して押しても選べる', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CommandPalette items={ITEMS.map((item) => (item.id === 'settings' ? { ...item, onSelect } : item))} defaultOpen />);
    const listbox = screen.getByRole('listbox', { name: 'コマンドパレット' });
    expect(within(listbox).getAllByRole('group').map((group) => group.getAttribute('aria-labelledby') && document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.textContent)).toEqual(['ページ', '操作']);
    expect(within(listbox).getByRole('group', { name: '操作' })).toContainElement(screen.getByRole('option', { name: /テーマを切り替える/ }));
    expect(screen.getAllByRole('option').filter((option) => option.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    const settings = screen.getByRole('option', { name: '設定' });
    expect(settings).toHaveAccessibleDescription('プロフィールとパスワード');
    // 使えない候補は押しても選べない
    await user.click(screen.getByRole('option', { name: 'データを書き出す' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerMove(settings);
    expect(settings).toHaveAttribute('aria-selected', 'true');
    await user.click(settings);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('href の項目は、選ぶとその行き先へ移る。finalFocus を渡すと、閉じた後のフォーカスをそこへ送る（新しいページの見出しなど）', async () => {
    const user = userEvent.setup();
    const heading = document.createElement('h1');
    heading.tabIndex = -1;
    document.body.append(heading);
    render(<CommandPalette items={[{ id: 'billing', label: '料金と請求', href: '#/billing' }]} defaultOpen finalFocus={{ current: heading }} />);
    await vi.waitFor(() => expect(input()).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(window.location.hash).toBe('#/billing');
    await vi.waitFor(() => expect(heading).toHaveFocus());
    heading.remove();
  });

  it('data-* をダイアログへ渡す（閉じている間もダイアログは置いたまま）', () => {
    render(<CommandPalette items={ITEMS} data-testid="palette" />);
    const dialog = screen.getByTestId('palette');
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveClass('g-command');
    expect(dialog).not.toHaveAttribute('open');
  });

  it('項目の id が重複すると、開発時にどの値かを名指しして警告する（D-13）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<CommandPalette items={[ITEMS[0] as CommandItem, { ...(ITEMS[1] as CommandItem), id: 'members' }]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('members'));
  });
});
