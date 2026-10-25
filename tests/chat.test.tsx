/**
 * 会話（E-01〜E-08）。
 *
 * jsdom はレイアウトを持たないので、下に付いていく振る舞い（E-04）はスクロールの量を要素に与えて確かめる。
 * 日付の区切り（今日・昨日）は今の時刻で変わるので、Date だけを偽にして 2026-10-24 12:00（東京）に固定する。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatComposer, ChatSuggestions, ChatThread, TypingIndicator, type ChatMessage } from '../src';
import { mockMediaQueries } from './utils';

const AOI = { id: 'aoi', name: '佐藤 葵' };
const REN = { id: 'ren', name: '田中 蓮' };
const BOT = { id: 'bot', name: 'アシスタント', role: 'assistant' as const };

const at = (iso: string, id: string, author = AOI, content = `本文 ${id}`): ChatMessage => ({ id, author, content, sentAt: iso });

function thread(messages: readonly ChatMessage[], extra: Partial<Parameters<typeof ChatThread>[0]> = {}) {
  return render(<ChatThread label="佐藤さんとの会話" messages={messages} currentUserId="ren" timeZone="Asia/Tokyo" {...extra} />);
}

const log = (): HTMLElement => screen.getByRole('log', { name: '佐藤さんとの会話' });

// 日付の区切り（「今日」「昨日」）は、いまの日時で決まる。日時を決めた時刻から始め、実際の時間で進める
// （止めると時間で進む処理が動かず、テストの中で本物の時計に戻すと、実行した日によって結果が変わる）
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-10-24T03:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('メッセージの列 / E-01 〜 E-04', () => {
  it('E-01 メッセージの列は名前を持つ log で、日付の区切り（日付・昨日・今日）と新着の線を置く', () => {
    thread(
      [
        at('2026-10-22T01:00:00Z', 'm1'),
        at('2026-10-23T01:00:00Z', 'm2', REN),
        at('2026-10-24T01:00:00Z', 'm3'),
        at('2026-10-24T01:30:00Z', 'm4'),
      ],
      { unreadFrom: 'm4' },
    );
    const days = [...log().querySelectorAll('.g-chat-day time')].map((time) => time.textContent);
    expect(days[0]).toContain('10月22日');
    expect(days.slice(1)).toEqual(['昨日', '今日']);
    // 新着の線は、そのメッセージの直前に言葉で置く
    const unread = within(log()).getByText('ここから新着');
    const fourth = within(log()).getAllByRole('article').at(-1);
    expect(unread.parentElement?.nextElementSibling).toBe(fourth);
  });

  it('E-01 同じ人が 5 分以内に続けたメッセージは顔と名前を省き、読み上げの名前には残す', () => {
    thread([at('2026-10-24T01:00:00Z', 'm1'), at('2026-10-24T01:01:00Z', 'm2'), at('2026-10-24T01:10:00Z', 'm3')]);
    const articles = within(log()).getAllByRole('article');
    expect(articles.map((article) => article.hasAttribute('data-grouped'))).toEqual([false, true, false]);
    expect(articles[1]).toHaveAccessibleName('佐藤 葵 10:01');
    expect(articles[1]?.querySelector('.g-chat-avatar img, .g-chat-avatar [role="img"]')).toBeNull();
  });

  it('E-02 メッセージは「名前 時刻」を名前に持つ article で、自分のメッセージは右に寄せ、AI の回答は吹き出しにしない', () => {
    thread([at('2026-10-24T01:00:00Z', 'm1'), at('2026-10-24T01:02:00Z', 'm2', REN), { ...at('2026-10-24T01:03:00Z', 'm3', BOT), edited: true }]);
    const [theirs, mine, answer] = within(log()).getAllByRole('article');
    expect(theirs).toHaveAccessibleName('佐藤 葵 10:00');
    expect(theirs).not.toHaveAttribute('data-own');
    expect(mine).toHaveAccessibleName('田中 蓮 10:02');
    expect(mine).toHaveAttribute('data-own');
    expect(answer).toHaveAttribute('data-variant', 'assistant');
    expect(within(answer as HTMLElement).getByText('編集済み')).toBeInTheDocument();
    expect(within(answer as HTMLElement).getByText('10:03')).toHaveAttribute('dateTime', '2026-10-24T01:03:00.000Z');
  });

  it('E-03 自分のメッセージの状態を出し、失敗したら再送のボタンで onRetry を呼ぶ', () => {
    const onRetry = vi.fn();
    thread([
      { ...at('2026-10-24T01:00:00Z', 'm1', REN), status: 'read' },
      { ...at('2026-10-24T01:01:00Z', 'm2', REN), status: 'sending' },
      { ...at('2026-10-24T01:02:00Z', 'm3', REN), status: 'failed', onRetry },
      { ...at('2026-10-24T01:03:00Z', 'm4'), status: 'read' },
    ]);
    const [read, sending, failed, theirs] = within(log()).getAllByRole('article');
    expect(read).toHaveTextContent('既読');
    expect(sending).toHaveTextContent('送信中');
    expect(failed).toHaveTextContent('送信できませんでした');
    fireEvent.click(within(failed as HTMLElement).getByRole('button', { name: '再送' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    // 相手のメッセージには状態を出さない
    expect(theirs).not.toHaveTextContent('既読');
  });

  it('E-06 流しながら書いている回答は aria-busy で、書き終えるまで読み上げさせない', () => {
    const { rerender } = thread([{ ...at('2026-10-24T01:00:00Z', 'm1', BOT), streaming: true }]);
    const answer = within(log()).getByRole('article');
    expect(answer).toHaveAttribute('aria-busy', 'true');
    expect(answer.querySelector('.g-chat-caret')).toHaveAttribute('aria-hidden', 'true');
    rerender(<ChatThread label="佐藤さんとの会話" messages={[at('2026-10-24T01:00:00Z', 'm1', BOT)]} currentUserId="ren" timeZone="Asia/Tokyo" />);
    expect(within(log()).getByRole('article')).not.toHaveAttribute('aria-busy');
  });

  it('E-04 前のメッセージを読み込むボタンは onLoadOlder を呼び、読み込み中は押せない', () => {
    const onLoadOlder = vi.fn();
    const { rerender } = thread([at('2026-10-24T01:00:00Z', 'm1')], { hasOlder: true, onLoadOlder });
    fireEvent.click(within(log()).getByRole('button', { name: '前のメッセージを読み込む' }));
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
    rerender(
      <ChatThread label="佐藤さんとの会話" messages={[at('2026-10-24T01:00:00Z', 'm1')]} currentUserId="ren" timeZone="Asia/Tokyo" hasOlder loadingOlder onLoadOlder={onLoadOlder} />,
    );
    const loading = within(log()).getByRole('button', { name: '処理中' });
    expect(loading).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(loading);
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
  });

  it('E-04 上を読んでいる間に届いたメッセージは数え、「新しいメッセージ」のボタンで下へ移ってフォーカスを列へ移す', () => {
    const first = [at('2026-10-24T01:00:00Z', 'm1'), at('2026-10-24T01:01:00Z', 'm2')];
    const { rerender } = thread(first);
    const el = log();
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 300 });
    el.scrollTop = 100;
    fireEvent.scroll(el);
    rerender(<ChatThread label="佐藤さんとの会話" messages={[...first, at('2026-10-24T01:02:00Z', 'm3')]} currentUserId="ren" timeZone="Asia/Tokyo" />);
    // 上を読んでいる間は位置を動かさない
    expect(el.scrollTop).toBe(100);
    const jump = screen.getByRole('button', { name: '新しいメッセージ 1件' });
    fireEvent.click(jump);
    expect(document.activeElement).toBe(el);
    expect(screen.queryByRole('button', { name: /新しいメッセージ/ })).toBeNull();
  });

  it('E-01 data-* を器へ渡し、メッセージの id が重複すると開発時に警告する（D-13）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = thread([at('2026-10-24T01:00:00Z', 'same'), at('2026-10-24T01:01:00Z', 'same')], { 'data-room': 'support' } as never);
    expect(container.querySelector('.g-chat')).toHaveAttribute('data-room', 'support');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ChatThread'));
  });
});

describe('入力欄・入力中の印・質問の例 / E-05 〜 E-08', () => {
  it('E-05 Enter で送り、Shift+Enter では送らない。変換中の Enter と空の文は送らない。送ったら欄を空にする', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const input = screen.getByRole('textbox', { name: 'メッセージ' });
    expect(input).toHaveAccessibleDescription('Enter で送信、Shift+Enter で改行');
    expect(screen.getByRole('button', { name: '送信' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onSend).not.toHaveBeenCalled();

    await user.type(input, 'こんにちは');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('こんにちは\n');
    await user.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledWith('こんにちは');
    expect(input).toHaveValue('');
    expect(document.activeElement).toBe(input);
  });

  it('E-05 sendOn="mod+enter" では Enter で改行し、Ctrl / ⌘ + Enter で送る', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} sendOn="mod+enter" />);
    const input = screen.getByRole('textbox', { name: 'メッセージ' });
    expect(input).toHaveAccessibleDescription('Ctrl+Enter（Mac は ⌘+Enter）で送信、Enter で改行');
    await user.type(input, '1 行目{Enter}2 行目');
    expect(onSend).not.toHaveBeenCalled();
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSend).toHaveBeenCalledWith('1 行目\n2 行目');
  });

  it('E-05 タッチが主の端末では Enter で改行し（送るのはボタン）、キーの案内を出さない', async () => {
    mockMediaQueries('(pointer: coarse)');
    const user = userEvent.setup();
    const onSend = vi.fn();
    const { container } = render(<ChatComposer onSend={onSend} />);
    const input = screen.getByRole('textbox', { name: 'メッセージ' });
    expect(input).not.toHaveAccessibleDescription();
    expect(container.querySelector('.g-composer-hint')).toBeNull();
    await user.type(input, '1 行目{Enter}2 行目');
    expect(onSend).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '送信' }));
    expect(onSend).toHaveBeenCalledWith('1 行目\n2 行目');
  });

  it('E-06 回答を作っている間は、送信のボタンが「止める」になって onStop を呼び、Enter では送らない', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onStop = vi.fn();
    render(<ChatComposer onSend={onSend} generating onStop={onStop} defaultValue="続けて" />);
    expect(screen.queryByRole('button', { name: '送信' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '止める' }));
    expect(onStop).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('textbox', { name: 'メッセージ' }));
    await user.keyboard('{Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('E-07 入力中の印は人数に合わせて言い方を変え、点は飾り。列の下に出す', () => {
    const { container, rerender } = render(<TypingIndicator names={['佐藤']} />);
    expect(container).toHaveTextContent('佐藤さんが入力中');
    expect(container.querySelector('.g-typing-dots')).toHaveAttribute('aria-hidden', 'true');
    rerender(<TypingIndicator names={['佐藤', '田中']} />);
    expect(container).toHaveTextContent('佐藤さんと田中さんが入力中');
    rerender(<TypingIndicator names={['佐藤', '田中', '鈴木']} />);
    expect(container).toHaveTextContent('3人が入力中');
    rerender(<TypingIndicator names={[]} />);
    expect(container).toBeEmptyDOMElement();

    thread([at('2026-10-24T01:00:00Z', 'm1')], { typing: [AOI] });
    // 列（log）の外に置く（出入りのたびに会話の読み上げを妨げない）
    expect(within(log()).queryByText('佐藤 葵さんが入力中')).toBeNull();
    expect(screen.getByText('佐藤 葵さんが入力中')).toBeInTheDocument();
  });

  it('E-08 質問の例は名前のある並びのボタンで、押すと onSelect に項目を渡す', () => {
    const onSelect = vi.fn();
    render(
      <ChatSuggestions
        items={[
          { id: 'sales', label: '先月の売上をまとめて', description: '前の月と比べる' },
          { id: 'churn', label: '解約が増えた理由は？' },
        ]}
        onSelect={onSelect}
      />,
    );
    const group = screen.getByRole('group', { name: '質問の例' });
    const buttons = within(group).getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('先月の売上をまとめて前の月と比べる');
    act(() => {
      buttons[1]?.click();
    });
    expect(onSelect).toHaveBeenCalledWith({ id: 'churn', label: '解約が増えた理由は？' });
  });
});
