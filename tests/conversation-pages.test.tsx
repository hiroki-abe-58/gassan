/**
 * 会話のページ（P-18 チャット・P-19 AI アシスタント）。
 *
 * 一覧と中身を並べるか切り替えるかは templates.css の container query なので、形はヘッドレス Chrome で確かめる。
 * ここでは一覧と項目の名前・選んだときの呼び出しとフォーカス・会話ごとの書きかけ・絞り込み・空の画面・履歴のまとまりを見る。
 * jsdom は描かないので、要素はいつも「描かれていない」（getClientRects が空）。狭い器で一覧が隠れたときと同じ振る舞いになる。
 * 履歴の日付のまとまりは今の時刻で変わるので、Date だけを偽にして 2026-10-24 12:00（東京）に固定する。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantPage, ChatPage, SiteProvider, type AssistantThread, type ChatConversation, type ChatMessage } from '../src';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-24T03:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" timeZone="Asia/Tokyo">
      {children}
    </SiteProvider>
  );
}

const AOI = { id: 'aoi', name: '佐藤 葵' };
const ME = { id: 'me', name: '田中 蓮' };

const CONVERSATIONS: ChatConversation[] = [
  { id: 'general', name: 'general', description: '全体へのお知らせ', preview: '明日の定例は 10 時からです', lastAt: '2026-10-24T01:30:00Z' },
  { id: 'design', name: 'design', unread: 3, preview: 'ロゴの案を 3 つ置きました', lastAt: '2026-10-23T08:00:00Z' },
  { id: 'aoi', name: '佐藤 葵', kind: 'direct', unread: 1, preview: '資料ありがとうございます', lastAt: '2026-10-20T08:00:00Z' },
];

const MESSAGES: Record<string, ChatMessage[]> = {
  general: [{ id: 'g1', author: AOI, content: '明日の定例は 10 時からです', sentAt: '2026-10-24T01:30:00Z' }],
  design: [{ id: 'd1', author: AOI, content: 'ロゴの案を 3 つ置きました', sentAt: '2026-10-23T08:00:00Z' }],
  aoi: [{ id: 'a1', author: AOI, content: '資料ありがとうございます', sentAt: '2026-10-20T08:00:00Z' }],
};

/** 開いている会話を持つ利用側。 */
function Chat({ onSend = vi.fn(), onChange = vi.fn() }: { onSend?: (text: string) => void; onChange?: (id: string) => void }): ReactNode {
  const [current, setCurrent] = useState('general');
  return (
    <Site>
      <ChatPage
        conversations={CONVERSATIONS}
        current={current}
        onConversationChange={(id) => {
          onChange(id);
          setCurrent(id);
        }}
        messages={MESSAGES[current] ?? []}
        currentUserId={ME.id}
        onSend={onSend}
        data-testid="chat"
      />
    </Site>
  );
}

const nav = (): HTMLElement => screen.getByRole('navigation', { name: '会話' });
const item = (name: RegExp | string): HTMLElement => within(nav()).getByRole('button', { name });

describe('チャットのページ / P-18', () => {
  it('P-18 会話の一覧は名前のある navigation で、チャンネルと相手との会話に分け、いまの会話に aria-current を付ける。項目の名前は名前と未読の数で、最後のメッセージと日時は説明として読む', () => {
    render(<Chat />);
    expect(screen.getByRole('heading', { level: 1, name: 'メッセージ' })).toBeInTheDocument();
    const lists = within(nav()).getAllByRole('list');
    expect(lists.map((list) => list.getAttribute('aria-labelledby') && document.getElementById(list.getAttribute('aria-labelledby') ?? '')?.textContent)).toEqual([
      'チャンネル',
      'ダイレクトメッセージ',
    ]);
    expect(within(lists[0]!).getAllByRole('button').map((button) => button.textContent)).toEqual([
      expect.stringContaining('general'),
      expect.stringContaining('design'),
    ]);

    expect(item('general')).toHaveAttribute('aria-current', 'true');
    expect(item('general')).toHaveAccessibleDescription('明日の定例は 10 時からです 10:30');
    expect(item('design 未読 3件')).not.toHaveAttribute('aria-current');
    expect(item('design 未読 3件')).toHaveAccessibleDescription('ロゴの案を 3 つ置きました 昨日');
    expect(item('佐藤 葵 未読 1件')).toHaveAccessibleDescription('資料ありがとうございます 10月20日');
    // 会話の見出しは h2。メッセージの列は「名前 のメッセージ」の log で、入力欄の案内も会話に合わせる
    expect(screen.getByRole('region', { name: 'general' })).toContainElement(screen.getByRole('heading', { level: 2, name: 'general' }));
    expect(screen.getByRole('log', { name: 'general のメッセージ' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'メッセージ' })).toHaveAttribute('placeholder', '#general にメッセージを送信');
    expect(screen.getByTestId('chat')).toHaveClass('g-split', 'g-chat-page');
  });

  it('P-18 会話を選ぶと onConversationChange を呼び、一覧が隠れたら会話の見出しへ、戻るで一覧のいまの会話へフォーカスを移す', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Chat onChange={onChange} />);
    const page = screen.getByTestId('chat');
    expect(page).toHaveAttribute('data-view', 'list');

    await user.click(item('design 未読 3件'));
    expect(onChange).toHaveBeenCalledWith('design');
    expect(page).toHaveAttribute('data-view', 'detail');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'design' }));
    expect(screen.getByRole('textbox', { name: 'メッセージ' })).toHaveAttribute('placeholder', '#design にメッセージを送信');

    await user.click(screen.getByRole('button', { name: '会話の一覧へ戻る' }));
    expect(page).toHaveAttribute('data-view', 'list');
    expect(document.activeElement).toBe(item('design 未読 3件'));

    // いまの会話を選び直しても、呼び出しは増やさない
    await user.click(item('design 未読 3件'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('P-18 広い器（一覧が描かれたまま）では、選んでもフォーカスを一覧に残す', async () => {
    vi.useRealTimers();
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([new DOMRect(0, 0, 100, 40)] as unknown as DOMRectList);
    const user = userEvent.setup();
    render(<Chat />);
    await user.click(item('佐藤 葵 未読 1件'));
    expect(document.activeElement).toBe(item('佐藤 葵 未読 1件'));
    expect(screen.getByRole('textbox', { name: 'メッセージ' })).toHaveAttribute('placeholder', '佐藤 葵さんにメッセージを送信');
  });

  it('P-18 会話を移るとメッセージの列を置き直し、書きかけは会話ごとに残す', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Chat onSend={onSend} />);
    const firstLog = screen.getByRole('log');
    await user.type(screen.getByRole('textbox', { name: 'メッセージ' }), '議事録は午後に');

    await user.click(item('design 未読 3件'));
    expect(screen.getByRole('log', { name: 'design のメッセージ' })).not.toBe(firstLog);
    expect(screen.getByRole('textbox', { name: 'メッセージ' })).toHaveValue('');

    await user.click(screen.getByRole('button', { name: '会話の一覧へ戻る' }));
    await user.click(item('general'));
    const input = screen.getByRole('textbox', { name: 'メッセージ' });
    expect(input).toHaveValue('議事録は午後に');
    await user.type(input, '{Enter}');
    expect(onSend).toHaveBeenCalledWith('議事録は午後に');
    expect(input).toHaveValue('');
  });

  it('P-18 絞り込みは名前と最後のメッセージで、かなと全角半角を区別しない。当てはまらなければそう言う', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<Chat />);
    const search = screen.getByRole('searchbox', { name: '会話を探す' });
    await user.type(search, 'ﾛｺﾞ');
    expect(within(nav()).getAllByRole('button')).toEqual([item('design 未読 3件')]);
    await user.clear(search);
    await user.type(search, 'さとう');
    expect(within(nav()).queryAllByRole('button')).toHaveLength(0);
    expect(nav()).toHaveTextContent('「さとう」に当てはまる会話はありません');
  });
});

const THREADS: AssistantThread[] = [
  { id: 't1', title: '先月の売上のまとめ', updatedAt: '2026-10-24T01:00:00Z' },
  { id: 't2', title: '解約の理由', updatedAt: '2026-10-23T05:00:00Z' },
  { id: 't3', title: '未払いの案内', updatedAt: '2026-10-19T05:00:00Z' },
  { id: 't4', title: '料金表の見直し', updatedAt: '2026-09-01T05:00:00Z' },
];

const BOT = { id: 'bot', name: 'アシスタント', role: 'assistant' as const };

describe('AI アシスタントのページ / P-19', () => {
  it('P-19 何も話していなければ問いかけと質問の例を出し、押すとその文を送る（onSuggestion を渡せばそちらを呼ぶ）。注意書きを添え、null で消す', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onSend = vi.fn();
    const { rerender } = render(
      <Site>
        <AssistantPage messages={[]} currentUserId="me" onSend={onSend} suggestions={[{ id: 's1', label: '先月の売上をまとめて' }]} data-testid="assistant" />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'アシスタント' })).toBeInTheDocument();
    expect(screen.getByText('何をお手伝いしましょうか？', { selector: '.g-assistant-greeting, .g-assistant-greeting *' })).toBeInTheDocument();
    expect(screen.queryByRole('log')).toBeNull();
    await user.click(screen.getByRole('button', { name: '先月の売上をまとめて' }));
    expect(onSend).toHaveBeenCalledWith('先月の売上をまとめて');
    expect(screen.getByTestId('assistant').querySelector('.g-assistant-note')).toHaveTextContent('AI の回答は間違うことがあります。大事なことは確かめてください。');
    expect(screen.getByRole('textbox', { name: 'メッセージ' })).toHaveAttribute('placeholder', 'アシスタントに質問する');

    const onSuggestion = vi.fn();
    rerender(
      <Site>
        <AssistantPage
          messages={[]}
          currentUserId="me"
          onSend={onSend}
          suggestions={[{ id: 's1', label: '先月の売上をまとめて' }]}
          onSuggestion={onSuggestion}
          note={null}
          data-testid="assistant"
        />
      </Site>,
    );
    await user.click(screen.getByRole('button', { name: '先月の売上をまとめて' }));
    expect(onSuggestion).toHaveBeenCalledWith({ id: 's1', label: '先月の売上をまとめて' });
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('assistant').querySelector('.g-assistant-note')).toBeNull();
  });

  it('P-19 話し始めたら会話の列を出し、回答を作っている間は送信のボタンが「止める」になって onStop を呼ぶ', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(
      <Site>
        <AssistantPage
          messages={[
            { id: 'q', author: ME, content: '先月の売上をまとめて', sentAt: '2026-10-24T01:00:00Z' },
            { id: 'r', author: BOT, content: '先月の売上は', sentAt: '2026-10-24T01:00:05Z', streaming: true },
          ]}
          currentUserId="me"
          onSend={vi.fn()}
          generating
          onStop={onStop}
        />
      </Site>,
    );
    expect(screen.getByRole('log', { name: 'アシスタントとの会話' })).toBeInTheDocument();
    expect(screen.queryByText('何をお手伝いしましょうか？')).toBeNull();
    await user.click(screen.getByRole('button', { name: '止める' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('P-19 履歴は今日・昨日・過去 7 日間・それより前に分け、いまの会話に aria-current を付ける。選ぶと onThreadChange を、新しい会話で onNewThread を呼ぶ', async () => {
    const onThreadChange = vi.fn();
    const onNewThread = vi.fn();
    render(
      <Site>
        <AssistantPage messages={[]} currentUserId="me" onSend={vi.fn()} history={THREADS} currentThreadId="t1" onThreadChange={onThreadChange} onNewThread={onNewThread} />
      </Site>,
    );
    const history = screen.getByRole('navigation', { name: '履歴' });
    const groups = within(history)
      .getAllByRole('list')
      .map((list) => [document.getElementById(list.getAttribute('aria-labelledby') ?? '')?.textContent, within(list).getAllByRole('button').map((button) => button.textContent)]);
    expect(groups).toEqual([
      ['今日', ['先月の売上のまとめ']],
      ['昨日', ['解約の理由']],
      ['過去 7 日間', ['未払いの案内']],
      ['それより前', ['料金表の見直し']],
    ]);
    expect(within(history).getByRole('button', { name: '先月の売上のまとめ' })).toHaveAttribute('aria-current', 'true');

    vi.useRealTimers();
    const user = userEvent.setup();
    await user.click(within(history).getByRole('button', { name: '解約の理由' }));
    expect(onThreadChange).toHaveBeenCalledWith('t2');
    await user.click(screen.getByRole('button', { name: '新しい会話' }));
    expect(onNewThread).toHaveBeenCalledTimes(1);
  });

  it('P-19 狭い器では「履歴を見る」で一覧へ移っていまの会話へ、閉じると見出しへフォーカスを移す。履歴が無ければ一覧も切り替えのボタンも出さない', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { rerender } = render(
      <Site>
        <AssistantPage messages={[]} currentUserId="me" onSend={vi.fn()} history={THREADS} currentThreadId="t2" data-testid="assistant" />
      </Site>,
    );
    const page = screen.getByTestId('assistant');
    expect(page).toHaveAttribute('data-view', 'detail');
    await user.click(screen.getByRole('button', { name: '履歴を見る' }));
    expect(page).toHaveAttribute('data-view', 'list');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '解約の理由' }));
    await user.click(screen.getByRole('button', { name: '会話へ戻る' }));
    expect(page).toHaveAttribute('data-view', 'detail');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'アシスタント' }));

    rerender(
      <Site>
        <AssistantPage messages={[]} currentUserId="me" onSend={vi.fn()} data-testid="assistant" />
      </Site>,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('button', { name: '履歴を見る' })).toBeNull();
  });

  it('P-18 / P-19 器が狭いときは data-view の片方だけを出し、広いときは一覧を並べて切り替えのボタンを隠す（templates.css）', () => {
    const sheet = readFileSync(resolve(process.cwd(), 'src/templates.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const blocks = (query: string): string =>
      [...sheet.matchAll(new RegExp(`@container \\(${query}\\)\\s*\\{([\\s\\S]*?)\\n  \\}`, 'g'))].map((match) => match[1] ?? '').join('\n');
    expect(sheet).toMatch(/\.g-split\s*\{[^}]*container-type:\s*inline-size/);
    expect(blocks('max-width: 639px')).toMatch(/\.g-split\[data-view="detail"\] \.g-split-list,\s*\.g-split\[data-view="list"\] \.g-split-detail\s*\{\s*display:\s*none;/);
    const wide = blocks('min-width: 640px');
    expect(wide).toMatch(/\.g-split-list\s*\{[^}]*inline-size:\s*20rem/);
    expect(wide).toMatch(/\.g-split-back\s*\{\s*display:\s*none;/);
    // @container は詳細度を足さないので、部品の規則より後に書く（前に書くと後の display に負け、広い器でも戻るが出る）
    const shown = sheet.search(/\.g-split-back\s*\{\s*display:\s*inline-grid/);
    const hidden = sheet.search(/@container \(min-width: 640px\)\s*\{[^@]*\.g-split-back\s*\{\s*display:\s*none/);
    expect(shown).toBeGreaterThan(-1);
    expect(hidden).toBeGreaterThan(shown);
  });

  it('P-18 / P-19 会話のページは data-* を外側の要素へ渡す', () => {
    render(
      <Site>
        <ChatPage conversations={[]} onConversationChange={vi.fn()} messages={[]} currentUserId="me" onSend={vi.fn()} data-testid="chat" data-section="inbox" />
        <AssistantPage messages={[]} currentUserId="me" onSend={vi.fn()} data-testid="assistant" data-section="ai" />
      </Site>,
    );
    expect(screen.getByTestId('chat')).toHaveAttribute('data-section', 'inbox');
    expect(screen.getByTestId('assistant')).toHaveAttribute('data-section', 'ai');
    // 会話を選んでいなければ、見出しで選ぶように促し、列と入力欄は出さない
    expect(screen.getByRole('heading', { level: 2, name: '会話を選んでください' })).toBeInTheDocument();
    expect(within(screen.getByTestId('chat')).queryByRole('textbox')).toBeNull();
  });
});
