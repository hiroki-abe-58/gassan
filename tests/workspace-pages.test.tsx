/**
 * アプリの中のページの続き（P-36 API キー・P-37 監査ログ・P-38 通知の設定）。
 *
 * 形（補足を積む名前・折り返す絞り込み）は templates.css なので、ヘッドレス Chrome で確かめる。ここでは表の並び・
 * キーを 1 度だけ見せる窓・閉じさせない理由の読み上げ・フォーカスの行き先・条件を変えたときに渡す値・名前を確かめる。
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApiKeysPage,
  AuditLogPage,
  NotificationSettingsPage,
  SiteProvider,
  type ApiKey,
  type AuditEvent,
  type AuditLogQuery,
  type NotificationSettingsValue,
  type NotificationTopic,
} from '../src';
import { pressEscape } from './utils';

afterEach(() => {
  vi.restoreAllMocks();
});

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={{ home: '/app' }} timeZone="Asia/Tokyo">
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

const notice = async (text: string): Promise<void> => {
  await vi.waitFor(() => expect(document.querySelector('.g-banner')).toHaveTextContent(text));
};

const SCOPES = [
  { value: 'read', label: '読み取り', description: 'データを読む' },
  { value: 'write', label: '書き込み', description: 'データを作る・変える' },
];

const KEYS: ApiKey[] = [
  { id: 'k1', name: '本番のサーバー', hint: 'sk_live_…4f2a', scopes: ['read', 'write'], createdAt: '2026-09-01T00:00:00Z', expiresAt: '2026-12-01T00:00:00Z', lastUsedAt: '2026-10-25T03:12:00Z' },
  { id: 'k2', name: '古いスクリプト', hint: 'sk_live_…9c01', scopes: ['read'], createdAt: '2026-01-10T00:00:00Z', expiresAt: '2026-04-10T00:00:00Z', expired: true },
];

describe('API キー / P-36', () => {
  it('P-36 キーの表は名前を行の見出しにして、見分けるための一部・権限・作った日・有効期限・最後に使った日時を並べ、期限切れを言葉で示す', () => {
    renderInSite(<ApiKeysPage keys={KEYS} scopes={SCOPES} />);
    const table = screen.getByRole('table', { name: 'API キー' });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1] as HTMLElement).getByRole('rowheader')).toHaveTextContent('本番のサーバーsk_live_…4f2a');
    expect(within(rows[1] as HTMLElement).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      '読み取り、書き込み',
      '2026年9月1日',
      '2026年12月1日',
      '2026/10/25 12:12',
    ]);
    const old = within(rows[2] as HTMLElement).getAllByRole('cell');
    expect(old[2]).toHaveTextContent('2026年4月10日期限切れ');
    expect(old[3]).toHaveTextContent('まだ使っていません');
  });

  it('P-36 作ったキーは同じ窓で 1 度だけ、読み取り専用の欄に出してフォーカスを移し、写すボタンと「今しか表示できない」説明を結ぶ。名前か権限が無ければ作らずに欄へ戻す', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue({ secret: 'atl_live_51HxPaRtOfTheSecret' });
    renderInSite(<ApiKeysPage keys={KEYS} scopes={SCOPES} onCreate={onCreate} />);
    await user.click(screen.getByRole('button', { name: 'API キーを作る' }));
    const dialog = screen.getByRole('dialog', { name: 'API キーを作る' });
    const name = within(dialog).getByRole('textbox', { name: /^名前/ });
    expect(name).toHaveFocus();

    // 名前が無ければ名前の欄へ、権限が無ければ権限の最初の選択肢へ戻す
    await user.click(within(dialog).getByRole('button', { name: '作る' }));
    expect(onCreate).not.toHaveBeenCalled();
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription(/名前を入力してください/);
    await user.type(name, 'CI のデプロイ');
    await user.click(within(dialog).getByRole('button', { name: '作る' }));
    expect(onCreate).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('checkbox', { name: /読み取り/ })).toHaveFocus();
    await user.click(within(dialog).getByRole('checkbox', { name: /書き込み/ }));
    await user.click(within(dialog).getByRole('button', { name: '作る' }));
    expect(onCreate).toHaveBeenCalledWith({ name: 'CI のデプロイ', scopes: ['write'], expiresInDays: 30 });

    // キーは読み取り専用の欄に出し、フォーカスを移す。注意は欄の説明として読まれる
    // 値を見せるだけの欄なので、名前に「必須 / 任意」の印は混ざらない
    const secret = await vi.waitFor(() => within(screen.getByRole('dialog', { name: 'API キーを作りました' })).getByRole('textbox', { name: '新しい API キー' }));
    expect(secret).toHaveValue('atl_live_51HxPaRtOfTheSecret');
    expect(secret).toHaveAttribute('readonly');
    expect(secret).toHaveFocus();
    expect(secret).toHaveAccessibleDescription(/今しか表示できません/);
    expect(screen.getByRole('button', { name: 'API キーをコピー' })).toBeInTheDocument();

    // 見せている間は Esc で閉じず、理由を読み上げる
    const shown = screen.getByRole('dialog', { name: 'API キーを作りました' });
    act(() => {
      pressEscape(shown as HTMLDialogElement);
    });
    expect(screen.getByRole('dialog', { name: 'API キーを作りました' })).toBeInTheDocument();
    await vi.waitFor(() => expect(shown).toHaveTextContent('キーを保存したら「完了」を押してください'));

    // 閉じたら、次に開いたときにはキーを出さない
    await user.click(within(shown).getByRole('button', { name: '完了' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'API キーを作る' }));
    expect(screen.getByRole('dialog', { name: 'API キーを作る' })).not.toHaveTextContent('atl_live_51HxPaRtOfTheSecret');
  });

  it('P-36 「無効にする」はキーの名前を含む名前を持ち、確かめてから呼び、結果を知らせの帯で読み上げてフォーカスを「API キーを作る」へ移す', async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn();
    renderInSite(<ApiKeysPage keys={KEYS} onCreate={vi.fn()} onRevoke={onRevoke} />);
    await user.click(screen.getByRole('button', { name: '本番のサーバー を無効にする' }));
    const dialog = screen.getByRole('dialog', { name: '本番のサーバー を無効にしますか' });
    expect(onRevoke).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: '無効にする' }));
    expect(onRevoke).toHaveBeenCalledWith('k1');
    await notice('本番のサーバー を無効にしました');
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'API キーを作る' })).toHaveFocus());
  });
});

const EVENTS: AuditEvent[] = [
  { id: 'e1', time: '2026-10-26T00:41:05Z', actor: '佐藤 葵', actorDetail: 'aoi@example.com', action: 'メンバーを招待した', target: 'ren@example.com', ip: '203.0.113.4', location: '東京, 日本' },
  { id: 'e2', time: '2026-10-25T23:02:41Z', actor: 'CI のデプロイ', action: 'API キーを使った', ip: '198.51.100.7' },
];
const QUERY: AuditLogQuery = { text: '', action: null, range: null, page: 1 };
const ACTIONS = [
  { value: 'invite', label: 'メンバーを招待した' },
  { value: 'key', label: 'API キーを使った' },
];

describe('監査ログ / P-37', () => {
  it('P-37 記録の表は操作した人・操作・対象・IP アドレスと場所・日時（秒まで、見出しに時間帯）を並べ、件数を role="status" で伝える', () => {
    const { rerender } = renderInSite(<AuditLogPage events={EVENTS} query={QUERY} onQueryChange={vi.fn()} total={1234} pageCount={13} />);
    const table = screen.getByRole('table', { name: '監査ログ' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['操作した人', '操作', '対象', 'IP アドレスと場所', '日時（JST）']);
    const first = within(table).getAllByRole('row')[1] as HTMLElement;
    expect(within(first).getByRole('rowheader')).toHaveTextContent('佐藤 葵aoi@example.com');
    expect(within(first).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['メンバーを招待した', 'ren@example.com', '203.0.113.4東京, 日本', '2026/10/26 9:41:05']);
    const count = document.querySelector('.g-audit-count');
    expect(count).toHaveAttribute('role', 'status');
    expect(count).toHaveTextContent('1,234 件');
    expect(screen.getByRole('search', { name: '記録の絞り込み' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'ページ送り' })).toBeInTheDocument();
    // 読み込み中は件数を空にする（読み込み終えたら、同じ数でも読み直させる）
    rerender(
      <Site>
        <AuditLogPage events={EVENTS} query={QUERY} onQueryChange={vi.fn()} total={1234} pageCount={13} loading />
      </Site>,
    );
    expect(count).toBeEmptyDOMElement();
    // 骨組みの行は、いま渡している記録と同じ数（読み込みで表の高さが跳ねない）
    expect(table.querySelectorAll('tbody tr[data-loading]')).toHaveLength(EVENTS.length);
  });

  it('P-37 探す言葉は送ったときに、操作と期間は選んだときに 1 ページ目へ戻して渡し、条件をクリアしたら探す欄へフォーカスを戻す', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const { rerender } = renderInSite(<AuditLogPage events={EVENTS} query={{ ...QUERY, page: 3 }} onQueryChange={onQueryChange} total={2} pageCount={5} actions={ACTIONS} />);
    const search = screen.getByRole('searchbox', { name: '人・対象・IP アドレスで探す' });
    await user.type(search, '佐藤');
    expect(onQueryChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '佐藤', action: null, range: null, page: 1 });

    await user.click(screen.getByRole('combobox', { name: '操作' }));
    await user.click(screen.getByRole('option', { name: 'API キーを使った' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '', action: 'key', range: null, page: 1 });

    rerender(
      <Site>
        <AuditLogPage events={[]} query={{ text: '佐藤', action: 'key', range: null, page: 1 }} onQueryChange={onQueryChange} total={0} pageCount={0} actions={ACTIONS} />
      </Site>,
    );
    expect(screen.getByRole('table', { name: '監査ログ' })).toHaveTextContent('条件に合う記録はありません');
    await user.click(screen.getByRole('button', { name: '条件をクリア' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({ text: '', action: null, range: null, page: 1 });
    expect(screen.getByRole('searchbox', { name: '人・対象・IP アドレスで探す' })).toHaveFocus();
  });

  it('P-37 CSV の書き出しはいまの条件を渡し、終わるまで二度押しできない', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => undefined;
    const onExport = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const query: AuditLogQuery = { text: '佐藤', action: 'invite', range: { start: '2026-10-01', end: '2026-10-26' }, page: 2 };
    renderInSite(<AuditLogPage events={EVENTS} query={query} onQueryChange={vi.fn()} total={2} pageCount={1} actions={ACTIONS} onExport={onExport} />);
    const button = screen.getByRole('button', { name: 'CSV で書き出す' });
    await user.click(button);
    await user.click(button);
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith(query);
    act(() => finish());
    await notice('CSV の書き出しを始めました');
  });
});

const TOPICS: NotificationTopic[] = [
  { id: 'comments', label: 'コメント', description: '自分の投稿への返信' },
  { id: 'mentions', label: 'メンション', channels: ['email', 'inApp'] },
  { id: 'security', label: 'セキュリティ', required: true },
];
const VALUE: NotificationSettingsValue = {
  channels: { comments: ['email', 'inApp'], mentions: ['inApp'] },
  paused: false,
  quietHours: { enabled: true, start: '22:00', end: '07:00' },
};

describe('通知の設定 / P-38', () => {
  it('P-38 チェックボックスは知らせと受け取る方法の見出しを合わせた名前を持ち、止められない知らせと送れない方法は選ばせない', () => {
    renderInSite(<NotificationSettingsPage topics={TOPICS} defaultValue={VALUE} onSubmit={vi.fn()} />);
    const table = screen.getByRole('table', { name: '知らせの種類と受け取る方法' });
    expect(within(table).getByRole('checkbox', { name: 'コメント メール' })).toBeChecked();
    expect(within(table).getByRole('checkbox', { name: 'コメント プッシュ通知' })).not.toBeChecked();
    expect(within(table).getByRole('checkbox', { name: 'メンション アプリ内' })).toBeChecked();
    // 送れない方法と、止められない知らせにはチェックボックスを置かない
    expect(within(table).queryByRole('checkbox', { name: 'メンション プッシュ通知' })).toBeNull();
    const security = within(table).getByRole('row', { name: /セキュリティ/ });
    expect(within(security).queryByRole('checkbox')).toBeNull();
    expect(security).toHaveTextContent('必ず届きます');
    expect(within(table).getByRole('row', { name: /メンション/ })).toHaveTextContent('この方法では届きません');
  });

  it('P-38 すべての通知を止めると表を選べなくし、保存すると値をまとめて渡して「保存しました」を読み上げ、変えたら消す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<NotificationSettingsPage topics={TOPICS} defaultValue={VALUE} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('checkbox', { name: 'コメント プッシュ通知' }));
    await user.click(screen.getByRole('switch', { name: 'すべての通知を止める' }));
    expect(screen.getByRole('checkbox', { name: 'コメント メール' })).toBeDisabled();
    expect(screen.getByText('通知を止めているあいだは、ここでは選べません。')).toBeInTheDocument();
    const status = document.querySelector('.g-settings-status');
    await user.click(screen.getByRole('button', { name: '保存する' }));
    expect(onSubmit).toHaveBeenCalledWith({ ...VALUE, paused: true, channels: { comments: ['email', 'push', 'inApp'], mentions: ['inApp'] } });
    await vi.waitFor(() => expect(status).toHaveTextContent('保存しました'));
    await user.click(screen.getByRole('switch', { name: 'すべての通知を止める' }));
    expect(status).toBeEmptyDOMElement();
  });

  it('P-38 おやすみ時間は使うかどうかと始まり・終わりを選べ、終わりが始まりより前なら「翌」と書く', async () => {
    const user = userEvent.setup();
    renderInSite(<NotificationSettingsPage topics={TOPICS} defaultValue={VALUE} onSubmit={vi.fn()} />);
    const region = screen.getByRole('region', { name: 'おやすみ時間' });
    expect(region).toHaveTextContent('毎日 22:00〜翌 07:00');
    const start = within(region).getByRole('button', { name: /^始まり/ });
    expect(start).toBeEnabled();
    await user.click(within(region).getByRole('switch', { name: 'おやすみ時間を使う' }));
    expect(within(region).getByRole('button', { name: /^始まり/ })).toBeDisabled();
  });
});

describe('API キー・監査ログ・通知の設定 / P-36〜P-38', () => {
  it('P-36〜P-38 のテンプレートは data-* を外側の要素へ渡す', () => {
    renderInSite(
      <>
        <ApiKeysPage keys={[]} data-probe="keys" />
        <AuditLogPage events={[]} query={QUERY} onQueryChange={vi.fn()} total={0} pageCount={0} data-probe="audit" />
        <NotificationSettingsPage topics={[]} defaultValue={{ channels: {}, paused: false }} onSubmit={vi.fn()} data-probe="notifications" />
      </>,
    );
    expect([...document.querySelectorAll('[data-probe]')].map((node) => [node.getAttribute('data-probe'), node.className.split(' ')[0]])).toEqual([
      ['keys', 'g-api-keys'],
      ['audit', 'g-audit-log'],
      ['notifications', 'g-notification-settings'],
    ]);
  });
});
