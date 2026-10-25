/**
 * チャットのウィジェット（E-09）。
 *
 * 起点のボタンの名前と状態、右下の小窓（モーダルではない）、右側の面と狭い画面のシート（Modal）、
 * 開いたときと閉じたときのフォーカス、あいさつを確かめる。jsdom には popover API が無いので、小窓は起点の側に置いた形で描かれる。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChatComposer, ChatThread, ChatWidget, type ChatWidgetProps } from '../src';
import { mockMediaQueries } from './utils';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function Widget(props: Partial<ChatWidgetProps>) {
  return (
    <ChatWidget title="Atlas のアシスタント" description="AI が答えます" {...props}>
      <ChatThread label="アシスタントとの会話" messages={[]} currentUserId="me" />
      <ChatComposer onSend={() => undefined} />
    </ChatWidget>
  );
}

describe('ChatWidget / E-09', () => {
  it('E-09 起点は「チャットを開く」。未読があれば名前に数を足し、数の印は飾り。開くと「チャットを閉じる」になり窓を指す', async () => {
    const user = userEvent.setup();
    render(<Widget unread={3} />);
    const launcher = screen.getByRole('button', { name: 'チャットを開く 未読 3件' });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    expect(launcher.querySelector('.g-chatbot-badge')).toHaveAttribute('aria-hidden', 'true');
    await user.click(launcher);
    expect(launcher).toHaveAccessibleName('チャットを閉じる');
    expect(launcher).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('dialog', { name: 'Atlas のアシスタント' });
    expect(launcher).toHaveAttribute('aria-controls', panel.id);
    expect(launcher.querySelector('.g-chatbot-badge')).toBeNull();
  });

  it('E-09 右下の小窓はモーダルではない（ページを読みながら話せる）。開くと入力欄へ、Esc と閉じるボタンで起点へフォーカスを戻す', async () => {
    const user = userEvent.setup();
    render(<Widget />);
    await user.click(screen.getByRole('button', { name: 'チャットを開く' }));
    const panel = screen.getByRole('dialog', { name: 'Atlas のアシスタント' });
    expect(panel.tagName).toBe('DIV');
    expect(panel).not.toHaveAttribute('aria-modal');
    expect(document.activeElement).toBe(within(panel).getByRole('textbox'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'チャットを開く' }));

    await user.click(screen.getByRole('button', { name: 'チャットを開く' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'チャットを閉じる' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'チャットを開く' }));
  });

  it('E-09 変換中の Esc と、中の部品が使った Esc では閉じない', async () => {
    const user = userEvent.setup();
    render(<Widget defaultOpen />);
    const textbox = within(screen.getByRole('dialog')).getByRole('textbox');
    fireEvent.keyDown(textbox, { key: 'Escape', isComposing: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const used = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    used.preventDefault();
    act(() => {
      textbox.dispatchEvent(used);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('E-09 見出しの帯のボタンで、小窓と右側の面（モーダル）を切り替える。閉じると起点へ戻る', async () => {
    const user = userEvent.setup();
    const onPlacementChange = vi.fn();
    render(<Widget defaultOpen onPlacementChange={onPlacementChange} />);
    await user.click(screen.getByRole('button', { name: '右側に広げる' }));
    expect(onPlacementChange).toHaveBeenLastCalledWith('side');
    const dialog = document.querySelector('dialog.g-chatbot-modal') as HTMLDialogElement;
    expect(dialog).toHaveAttribute('data-placement', 'end');
    expect(dialog.open).toBe(true);
    expect(within(dialog).getByRole('heading', { name: 'Atlas のアシスタント' })).toBeInTheDocument();
    expect(within(dialog).getByRole('log', { name: 'アシスタントとの会話' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: '小さくする' }));
    expect(onPlacementChange).toHaveBeenLastCalledWith('corner');
    expect(screen.getByRole('dialog', { name: 'Atlas のアシスタント' }).tagName).toBe('DIV');
  });

  it('E-09 狭い画面では、どちらの置き方でも画面いっぱいのシート（モーダル）にし、切り替えのボタンを出さない', async () => {
    mockMediaQueries('(max-width: 639px)');
    const user = userEvent.setup();
    render(<Widget />);
    await user.click(screen.getByRole('button', { name: 'チャットを開く' }));
    const dialog = document.querySelector('dialog.g-chatbot-modal') as HTMLDialogElement;
    expect(dialog).toHaveAttribute('data-placement', 'sheet');
    expect(dialog.open).toBe(true);
    expect(within(dialog).queryByRole('button', { name: '右側に広げる' })).toBeNull();
  });

  it('E-09 あいさつは閉じている間だけ起点の横に出し、押すと開き、× で消す', async () => {
    const user = userEvent.setup();
    const onGreetingDismiss = vi.fn();
    const view = render(<Widget greeting="何かお困りですか？" onGreetingDismiss={onGreetingDismiss} />);
    await user.click(screen.getByRole('button', { name: '何かお困りですか？' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '何かお困りですか？' })).toBeNull();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'あいさつを閉じる' }));
    expect(onGreetingDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: '何かお困りですか？' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'チャットを開く' }));
    view.unmount();
  });

  it('E-09 開閉は制御もできる。外から閉じても起点は「チャットを開く」に戻る', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            外から閉じる
          </button>
          <Widget open={open} onOpenChange={setOpen} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '外から閉じる' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'チャットを開く' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('E-09 起点は body の末尾へ置く（祖先の transform や container-type に閉じ込められない）。サーバーでは何も描かない', () => {
    expect(renderToString(<Widget />)).toBe('');
    const view = render(
      <div style={{ transform: 'translateX(0)', containerType: 'inline-size' }} data-testid="card">
        <Widget />
      </div>,
    );
    const launcher = screen.getByRole('button', { name: 'チャットを開く' });
    expect(screen.getByTestId('card')).not.toContainElement(launcher);
    expect(launcher.closest('.g-chatbot')?.parentElement).toBe(document.body);
    view.unmount();
    expect(document.body.querySelector('.g-chatbot')).toBeNull();
  });

  it('E-09 CSS: 起点と小窓は端から --g-chatbot-offset だけ離して固定し、小窓は開いている間だけ grid。動きを減らす設定と印刷', () => {
    expect(css).toMatch(/--g-chatbot-offset:\s*24px;/);
    expect(css).toMatch(/\.g-chatbot-launcher \{[^}]*position: fixed;[^}]*inset-inline-end: max\(var\(--g-chatbot-offset\), env\(safe-area-inset-right\)\);/);
    expect(css).toContain('.g-chatbot-panel:is(:popover-open, [data-inline]) { display: grid;');
    expect(css).toMatch(/\.g-chatbot-panel \{[^}]*position: fixed;[^}]*transform-origin: 100% 100%;/);
    expect(css).toMatch(/\.g-panel > \.g-chatbot-body \{ grid-row: 2; grid-column: 1; \}/);
    expect(css).toMatch(/@media print \{\s*\.g-chatbot \{ display: none; \}/);
  });
});
