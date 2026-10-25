/**
 * メールのページ（P-20）。
 *
 * 3 列と 2 列と切り替えの形は templates.css の container query なので、形はヘッドレス Chrome で確かめる。
 * ここではフォルダと行の名前・選んでまとめての操作と読み上げ・開いたときの呼び出しとフォーカス・読む面・作成と返信を見る。
 * jsdom は描かないので、一覧はいつも「隠れた」扱いになる（狭い器で一覧が畳まれたときと同じ振る舞い）。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MailboxPage, SiteProvider, type MailComposeValues, type MailMessage } from '../src';

// 「今日は時刻、昨日は『昨日』」は、いまの日時で決まる。日時を決めた時刻から始め、実際の時間で進める
// （止めると時間で進む処理が動かず、テストの中で本物の時計に戻すと、実行した日によって結果が変わる）
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-10-24T03:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const FOLDERS = [
  { id: 'inbox', label: '受信トレイ', unread: 2 },
  { id: 'sent', label: '送信済み' },
];

const INBOX: MailMessage[] = [
  {
    id: 'm1',
    from: { name: '鈴木 蓮', email: 'ren@example.com' },
    to: [{ name: '佐藤 葵', email: 'aoi@example.com' }],
    subject: '請求書の PDF を直しました',
    snippet: 'テスト用のワークスペースで試せます',
    body: 'テスト用のワークスペースで試せます。',
    receivedAt: '2026-10-24T01:30:00Z',
    attachments: [{ name: 'invoice.pdf', size: 123_000, href: '/files/invoice.pdf' }],
  },
  {
    id: 'm2',
    from: { name: '高橋 陽菜', email: 'hina@example.com' },
    subject: '明日のレビュー',
    snippet: '15 時からで大丈夫ですか',
    receivedAt: '2026-10-23T05:00:00Z',
  },
  {
    id: 'm3',
    from: { email: 'news@example.com' },
    subject: '10 月のお知らせ',
    snippet: '新しい機能のご案内',
    receivedAt: '2026-10-01T05:00:00Z',
    read: true,
    starred: true,
  },
];

interface Handlers {
  onArchive?: (ids: string[]) => void;
  onMarkRead?: (ids: string[], read: boolean) => void;
  onStar?: (id: string, starred: boolean) => void;
  onSend?: (values: MailComposeValues) => void | Promise<void | { error: string }>;
  onOpen?: (id: string) => void;
  onFolderChange?: (id: string) => void;
}

/** フォルダと開いているメールを持つ利用側。アーカイブしたメールは一覧から消す。 */
function Mailbox({ onArchive, onMarkRead, onStar, onSend, onOpen, onFolderChange }: Handlers): ReactNode {
  const [folder, setFolder] = useState('inbox');
  const [messages, setMessages] = useState(INBOX);
  const [current, setCurrent] = useState<string | undefined>();
  return (
    <SiteProvider name="Atlas" timeZone="Asia/Tokyo">
      <MailboxPage
        data-testid="mail"
        folders={FOLDERS}
        currentFolder={folder}
        onFolderChange={(id) => {
          onFolderChange?.(id);
          setFolder(id);
        }}
        messages={folder === 'inbox' ? messages : []}
        current={current}
        onOpen={(id) => {
          onOpen?.(id);
          setCurrent(id);
          setMessages((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
        }}
        onArchive={(ids) => {
          onArchive?.(ids);
          setMessages((list) => list.filter((item) => !ids.includes(item.id)));
        }}
        onMarkRead={(ids, read) => {
          onMarkRead?.(ids, read);
          setMessages((list) => list.map((item) => (ids.includes(item.id) ? { ...item, read } : item)));
        }}
        onStar={(id, starred) => {
          onStar?.(id, starred);
          setMessages((list) => list.map((item) => (item.id === id ? { ...item, starred } : item)));
        }}
        onSend={onSend ?? (() => undefined)}
      />
    </SiteProvider>
  );
}

const rows = (): HTMLElement => screen.getByRole('list', { name: '受信トレイ' });
const open = (name: string): HTMLElement => within(rows()).getByRole('button', { name });
const status = (): HTMLElement => screen.getByRole('status');
/** 文は文節の span に分かれるので、器の文字で見る。 */
const textOf = (selector: string): string => document.querySelector(selector)?.textContent ?? '';

describe('メールのページ / P-20', () => {
  it('P-20 フォルダは名前のある navigation で、いまのフォルダに aria-current を付け、未読の数を名前に含める。狭い器のためのセレクトも同じフォルダを持つ', async () => {
    const user = userEvent.setup();
    const onFolderChange = vi.fn();
    render(<Mailbox onFolderChange={onFolderChange} />);
    const folders = screen.getByRole('navigation', { name: 'フォルダ' });
    expect(within(folders).getByRole('button', { name: '受信トレイ 未読 2件' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('heading', { level: 1, name: 'メール' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'フォルダ' })).toBeInTheDocument();
    await user.click(within(folders).getByRole('button', { name: '送信済み' }));
    expect(onFolderChange).toHaveBeenCalledWith('sent');
    expect(textOf('.g-split-empty')).toBe('このフォルダにメールはありません');
  });

  it('P-20 行の名前は「未読 差出人 件名」で、冒頭の文・日時・添付は説明として読む。スターは押した状態を持つボタン', async () => {
    const user = userEvent.setup();
    const onStar = vi.fn();
    render(<Mailbox onStar={onStar} />);
    expect(open('未読 鈴木 蓮 請求書の PDF を直しました')).toHaveAccessibleDescription('テスト用のワークスペースで試せます 10:30 添付あり');
    expect(open('未読 高橋 陽菜 明日のレビュー')).toHaveAccessibleDescription('15 時からで大丈夫ですか 昨日');
    // 名前の無い差出人はメールアドレスで出し、既読のメールには「未読」を付けない
    expect(open('news@example.com 10 月のお知らせ')).toHaveAccessibleDescription('新しい機能のご案内 10月1日');
    const star = within(rows()).getByRole('button', { name: '「10 月のお知らせ」にスター' });
    expect(star).toHaveAttribute('aria-pressed', 'true');
    await user.click(star);
    expect(onStar).toHaveBeenCalledWith('m3', false);
    expect(star).toHaveAttribute('aria-pressed', 'false');
  });

  it('P-20 行を選ぶと「n件を選択中」とまとめての操作を出し、アーカイブすると選択を解いて結果を読み上げ、フォーカスを「すべて選ぶ」へ戻す', async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    render(<Mailbox onArchive={onArchive} />);
    const all = screen.getByRole('checkbox', { name: 'すべて選ぶ' });
    await user.click(screen.getByRole('checkbox', { name: '「明日のレビュー」を選ぶ' }));
    expect(all).toHaveProperty('indeterminate', true);
    expect(textOf('.g-mail-selected')).toBe('1件を選択中');
    await user.click(all);
    expect(all).toBeChecked();
    expect(textOf('.g-mail-selected')).toBe('3件を選択中');
    await user.click(screen.getByRole('checkbox', { name: '「請求書の PDF を直しました」を選ぶ' }));
    await user.click(screen.getByRole('button', { name: 'アーカイブ' }));
    await vi.waitFor(() => expect(status()).toHaveTextContent('2件をアーカイブしました'));
    expect(onArchive).toHaveBeenCalledWith(['m2', 'm3']);
    expect(within(rows()).getAllByRole('checkbox')).toHaveLength(1);
    expect(all).not.toBeChecked();
    expect(document.activeElement).toBe(all);
  });

  it('P-20 選んだメールが未読を含めば「既読にする」、すべて既読なら「未読にする」を出す', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    render(<Mailbox onMarkRead={onMarkRead} />);
    await user.click(screen.getByRole('checkbox', { name: '「請求書の PDF を直しました」を選ぶ' }));
    await user.click(screen.getByRole('button', { name: '既読にする' }));
    await vi.waitFor(() => expect(status()).toHaveTextContent('1件を既読にしました'));
    expect(onMarkRead).toHaveBeenCalledWith(['m1'], true);
    await user.click(screen.getByRole('checkbox', { name: '「10 月のお知らせ」を選ぶ' }));
    await user.click(screen.getByRole('button', { name: '未読にする' }));
    expect(onMarkRead).toHaveBeenLastCalledWith(['m3'], false);
  });

  it('P-20 メールを開くと onOpen を呼び、一覧が隠れたら件名の見出しへ、戻るで一覧のそのメールへフォーカスを移す。読む面は差出人・宛先・日時・本文・添付を出す', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<Mailbox onOpen={onOpen} />);
    const page = screen.getByTestId('mail');
    expect(screen.getByRole('heading', { level: 2, name: 'メールを選んでください' })).toBeInTheDocument();
    await user.click(open('未読 鈴木 蓮 請求書の PDF を直しました'));
    expect(onOpen).toHaveBeenCalledWith('m1');
    expect(page).toHaveAttribute('data-view', 'detail');
    const heading = screen.getByRole('heading', { level: 2, name: '請求書の PDF を直しました' });
    expect(document.activeElement).toBe(heading);
    const reader = screen.getByRole('region', { name: '請求書の PDF を直しました' });
    expect(reader).toHaveTextContent('鈴木 蓮<ren@example.com>');
    expect(reader).toHaveTextContent('宛先: 佐藤 葵');
    expect(reader.querySelector('time.g-mail-date')).toHaveAttribute('datetime', '2026-10-24T01:30:00.000Z');
    expect(reader).toHaveTextContent('テスト用のワークスペースで試せます。');
    const files = within(reader).getByRole('list', { name: '添付ファイル' });
    expect(within(files).getByRole('link', { name: 'invoice.pdf をダウンロード' })).toHaveAttribute('href', '/files/invoice.pdf');
    expect(files).toHaveTextContent('120 KB');

    await user.click(screen.getByRole('button', { name: 'メールの一覧へ戻る' }));
    expect(page).toHaveAttribute('data-view', 'list');
    // 開いたので既読になり、名前から「未読」が外れる
    expect(document.activeElement).toBe(open('鈴木 蓮 請求書の PDF を直しました'));
  });

  it('P-20 読む面からアーカイブすると、件名の見出しへフォーカスを移して「メールを選んでください」に戻す', async () => {
    const user = userEvent.setup();
    render(<Mailbox />);
    await user.click(open('未読 高橋 陽菜 明日のレビュー'));
    const reader = screen.getByRole('region', { name: '明日のレビュー' });
    await user.click(within(reader).getByRole('button', { name: 'アーカイブ' }));
    await vi.waitFor(() => expect(status()).toHaveTextContent('1件をアーカイブしました'));
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'メールを選んでください' }));
  });

  it('P-20 返信は宛先と「Re: 件名」を入れた書く画面を開き、宛先が無ければ欄へ戻す。送ると onSend に返信の元を添えて渡し、結果を読み上げる', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Mailbox onSend={onSend} />);
    await user.click(open('未読 鈴木 蓮 請求書の PDF を直しました'));
    await user.click(within(screen.getByRole('region', { name: '請求書の PDF を直しました' })).getByRole('button', { name: '返信' }));
    const dialog = screen.getByRole('dialog', { name: '返信' });
    // 件名と本文は空でも送れるので、名前に「任意」が付く
    expect(within(dialog).getByRole('textbox', { name: /^件名/ })).toHaveValue('Re: 請求書の PDF を直しました');
    expect(within(dialog).getByText('ren@example.com')).toBeInTheDocument();
    await user.type(within(dialog).getByRole('textbox', { name: /^本文/ }), '確認しました。');
    await user.click(within(dialog).getByRole('button', { name: '送信' }));
    await vi.waitFor(() => expect(status()).toHaveTextContent('メールを送りました'));
    expect(onSend).toHaveBeenCalledWith({ mode: 'reply', source: 'm1', to: ['ren@example.com'], subject: 'Re: 請求書の PDF を直しました', body: '確認しました。' });

    // 新しく書くときは宛先が空で、空のまま送ると欄へ戻して理由を出す
    await user.click(screen.getByRole('button', { name: '作成' }));
    const blank = screen.getByRole('dialog', { name: '新しいメール' });
    await user.click(within(blank).getByRole('button', { name: '送信' }));
    expect(within(blank).getByText('宛先を入れてください。')).toBeInTheDocument();
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('P-20 絞り込みは差出人・件名・冒頭の文で、当てはまらなければそう言う。選んだ行は見えている行の中だけで数える', async () => {
    const user = userEvent.setup();
    render(<Mailbox />);
    await user.click(screen.getByRole('checkbox', { name: 'すべて選ぶ' }));
    const search = screen.getByRole('searchbox', { name: 'メールを探す' });
    await user.type(search, 'レビュー');
    expect(within(rows()).getAllByRole('checkbox')).toHaveLength(1);
    expect(textOf('.g-mail-selected')).toBe('1件を選択中');
    await user.clear(search);
    await user.type(search, '見積');
    expect(textOf('.g-split-empty')).toBe('「見積」に当てはまるメールはありません');
  });

  it('P-20 器が広いときだけフォルダの並びを出し、それより狭いときはセレクトにする（templates.css）。data-* は外側の要素へ渡す', () => {
    const sheet = readFileSync(resolve(process.cwd(), 'src/templates.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(sheet).toMatch(/\.g-mail-folders\s*\{[^}]*display:\s*none/);
    const shown = sheet.search(/\.g-mail-folders\s*\{[^}]*display:\s*none/);
    // フォルダの並びは器（自前のバーを重ねる grid。U-35）ごと出し入れする
    const wide = sheet.search(/@container \(min-width: 900px\)\s*\{\s*\.g-mail-folders\s*\{\s*display:\s*grid;\s*\}\s*\.g-mail-folder-select\s*\{\s*display:\s*none;/);
    expect(wide).toBeGreaterThan(shown);
    render(<Mailbox />);
    expect(screen.getByTestId('mail')).toHaveClass('g-split', 'g-mail-page');
  });
});
