/**
 * アプリの中のページ（P-13 設定・P-14 メンバー・P-15 料金と請求・P-16 はじめの設定・P-17 招待を受ける）。
 *
 * 形（節の 2 段組み・カードの並び・器の幅）は templates.css の container query なので、ヘッドレス Chrome で確かめる。
 * ここでは節と領域の名前・送信と結果の読み上げ・確かめるモーダルとゲート・自分の行の扱い・読み上げの名前・
 * 手順の移り方とフォーカス・招待の状態ごとの案内を見る。
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BillingPage,
  InviteAcceptPage,
  MembersPage,
  OnboardingPage,
  SettingsPage,
  SettingsSection,
  SiteProvider,
  type WorkspaceMember,
} from '../src';
import { pressEscape } from './utils';

afterEach(() => {
  vi.restoreAllMocks();
});

const LINKS = { home: '/app', signIn: '/login', signUp: '/signup', pricing: '/pricing' };

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={LINKS}>
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

/** ページの上の知らせの帯（文は文節の span に分かれるので、帯の文字で見る）。 */
const notice = async (text: string): Promise<void> => {
  await vi.waitFor(() => expect(document.querySelector('.g-banner')).toHaveTextContent(text));
};

describe('アプリの中のページ / P-13〜P-17', () => {
  it('アプリの中のページは 1 つ残らず data-* を外側の要素へ渡す', () => {
    const cases: Record<string, () => ReactNode> = {
      SettingsPage: () => <SettingsPage data-testid="probe" />,
      SettingsSection: () => (
        <SettingsSection title="t" data-testid="probe">
          x
        </SettingsSection>
      ),
      MembersPage: () => <MembersPage members={[]} roles={[]} data-testid="probe" />,
      BillingPage: () => <BillingPage plan={{ name: 'Pro' }} data-testid="probe" />,
      OnboardingPage: () => <OnboardingPage steps={[{ id: 'a', title: 'A', content: 'x' }]} onComplete={vi.fn()} data-testid="probe" />,
      InviteAcceptPage: () => <InviteAcceptPage workspace="W" inviter="I" data-testid="probe" />,
    };
    for (const [name, renderCase] of Object.entries(cases)) {
      const { unmount } = renderInSite(renderCase());
      expect(screen.getByTestId('probe'), name).toBeInTheDocument();
      unmount();
    }
  });

  it('日時は SiteProvider の timeZone で描く。無ければサーバーと hydration の間は UTC で描いて食い違わず、描き終えたら見ている人の時間帯にする', async () => {
    const page = (timeZone?: string): ReactNode => (
      <SiteProvider name="Atlas" timeZone={timeZone}>
        <SettingsPage sessions={{ items: [{ id: 's1', device: 'MacBook', lastActive: '2026-10-23T00:30:00Z', current: true }], onRevoke: vi.fn() }} />
      </SiteProvider>
    );
    expect(renderToString(page('Asia/Tokyo'))).toContain('2026/10/23 9:30');
    const html = renderToString(page());
    expect(html).toContain('2026/10/23 0:30');
    // 見ている人の時間帯がサーバー（UTC）と違っても、hydration で食い違わない
    const zone = process.env.TZ;
    process.env.TZ = 'Asia/Tokyo';
    const container = document.createElement('div');
    let root: Root | undefined;
    try {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const recoverable: unknown[] = [];
      container.innerHTML = html;
      document.body.append(container);
      await act(async () => {
        root = hydrateRoot(container, page(), { onRecoverableError: (cause) => recoverable.push(cause) });
      });
      expect(recoverable).toEqual([]);
      expect(error).not.toHaveBeenCalled();
      expect(container.querySelector('time')).toHaveTextContent('2026/10/23 9:30');
    } finally {
      act(() => root?.unmount());
      container.remove();
      if (zone === undefined) delete process.env.TZ;
      else process.env.TZ = zone;
    }
  });
});

describe('設定 / P-13', () => {
  it('渡した節だけを、見出しを名前にした region として並べ、プロフィールは送信の流れで保存して「保存しました」を読み上げる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<SettingsPage profile={{ name: '佐藤 葵', email: 'aoi@example.com', onSubmit }} />);
    expect(screen.getByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument();
    const profile = screen.getByRole('region', { name: 'プロフィール' });
    expect(screen.queryByRole('region', { name: 'パスワード' })).toBeNull();
    const name = within(profile).getByLabelText('お名前');
    expect(name).toHaveAttribute('autocomplete', 'name');
    await user.clear(name);
    await user.click(within(profile).getByRole('button', { name: '保存する' }));
    // 空で送ると直す所のまとめへ（P-03）
    expect(within(profile).getByRole('alert')).toHaveTextContent('お名前を入力してください');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(name, '佐藤 葵子');
    await user.click(within(profile).getByRole('button', { name: '保存する' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: '佐藤 葵子', email: 'aoi@example.com' });
    expect(await within(profile).findByRole('status')).toHaveTextContent('保存しました');
    // 打ち直したら「保存しました」を消す
    await user.type(name, 'x');
    expect(within(profile).getByRole('status')).toHaveTextContent('');
  });

  it('パスワードは今と新しい（強さの説明つき）と確認を求め、変えたら欄を空にして知らせる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<SettingsPage password={{ onSubmit }} />);
    const section = screen.getByRole('region', { name: 'パスワード' });
    const current = within(section).getByLabelText('今のパスワード');
    const next = within(section).getByLabelText('新しいパスワード');
    expect(current).toHaveAttribute('autocomplete', 'current-password');
    expect(next).toHaveAttribute('autocomplete', 'new-password');
    expect(next.getAttribute('aria-describedby')).toMatch(/-strength/);
    await user.type(current, 'old-secret');
    await user.type(next, 'Correct-horse-9');
    await user.type(within(section).getByLabelText('新しいパスワード（確認）'), 'Correct-horse-9');
    await user.click(within(section).getByRole('button', { name: 'パスワードを変える' }));
    expect(onSubmit).toHaveBeenCalledWith({ current: 'old-secret', next: 'Correct-horse-9' });
    expect(await within(section).findByRole('status')).toHaveTextContent('パスワードを変えました');
    expect(current).toHaveValue('');
    expect(next).toHaveValue('');
  });

  it('2 段階認証を無効にするときは確かめ、端末は 1 台ずつ（名前つき）か、ほかをまとめてログアウトさせる。この端末は外せない', async () => {
    const user = userEvent.setup();
    const onDisable = vi.fn();
    const onRevoke = vi.fn();
    const onRevokeOthers = vi.fn();
    renderInSite(
      <SettingsPage
        twoFactor={{ enabled: true, onEnable: vi.fn(), onDisable }}
        sessions={{
          items: [
            { id: 's1', device: 'MacBook Pro · Chrome', detail: '東京', lastActive: '2026-10-23T09:00:00+09:00', current: true },
            { id: 's2', device: 'iPhone · Safari', lastActive: '2026-10-20T21:30:00+09:00' },
          ],
          onRevoke,
          onRevokeOthers,
        }}
      />,
    );
    const twoFactor = screen.getByRole('region', { name: '2 段階認証' });
    expect(twoFactor).toHaveTextContent('有効');
    await user.click(within(twoFactor).getByRole('button', { name: '無効にする' }));
    const dialog = screen.getByRole('dialog', { name: '2 段階認証を無効にしますか' });
    await user.click(within(dialog).getByRole('button', { name: '無効にする' }));
    expect(onDisable).toHaveBeenCalledTimes(1);
    expect(await within(twoFactor).findByRole('status')).toHaveTextContent('2 段階認証を無効にしました');

    const sessions = screen.getByRole('region', { name: 'ログインしている端末' });
    expect(within(sessions).queryByRole('button', { name: 'MacBook Pro · Chrome をログアウトさせる' })).toBeNull();
    expect(within(sessions).getByText('この端末')).toBeInTheDocument();
    await user.click(within(sessions).getByRole('button', { name: 'iPhone · Safari をログアウトさせる' }));
    expect(onRevoke).toHaveBeenCalledWith('s2');
    expect(await within(sessions).findByRole('status')).toHaveTextContent('ログアウトさせました');
    await user.click(within(sessions).getByRole('button', { name: 'ほかの端末をすべてログアウトさせる' }));
    expect(onRevokeOthers).toHaveBeenCalledTimes(1);
    expect(sessions.querySelector('time')).toHaveAttribute('dateTime', '2026-10-23T00:00:00.000Z');
  });

  it('アカウントの削除は、決めた文字を打つまで「削除する」を押せない（ゲート。押すと理由を読み、欄へ連れて行く）', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderInSite(<SettingsPage deleteAccount={{ confirmText: 'aoi@example.com', onDelete }} />);
    const section = screen.getByRole('region', { name: 'アカウントの削除' });
    await user.click(within(section).getByRole('button', { name: 'アカウントを削除する' }));
    const dialog = screen.getByRole('dialog', { name: 'アカウントを削除しますか' });
    const input = within(dialog).getByLabelText('確認のため「aoi@example.com」と入力してください');
    expect(input).toHaveFocus();
    const remove = within(dialog).getByRole('button', { name: '削除する' });
    expect(remove).toHaveAttribute('aria-disabled', 'true');
    expect(remove).toHaveAccessibleDescription('「aoi@example.com」と入力すると削除できます');
    await user.click(remove);
    expect(onDelete).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
    await user.type(input, 'aoi@example.com');
    expect(remove).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(remove);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

const MEMBERS: WorkspaceMember[] = [
  { id: 'u1', name: '佐藤 葵', email: 'aoi@example.com', role: 'admin', lastActive: '2026-10-23T09:00:00+09:00' },
  { id: 'u2', name: '鈴木 蓮', email: 'ren@example.com', role: 'editor', lastActive: '2026-10-21T18:00:00+09:00' },
  { id: 'u3', name: '高橋 陽菜', email: 'hina@example.com', role: 'viewer', status: 'invited' },
];
const ROLES = [
  { value: 'admin', label: '管理者' },
  { value: 'editor', label: '編集者' },
  { value: 'viewer', label: '閲覧者' },
];

describe('メンバー / P-14', () => {
  it('自分の行は選べず外せず役割も変えられない。役割は名前つきのセレクトで変え、外すときは確かめて結果を読み上げる', async () => {
    const user = userEvent.setup();
    const onRoleChange = vi.fn();
    const onRemove = vi.fn();
    renderInSite(<MembersPage members={MEMBERS} roles={ROLES} currentUserId="u1" onRoleChange={onRoleChange} onRemove={onRemove} seats={{ used: 3, total: 5 }} />);
    expect(screen.getByRole('progressbar', { name: '使っている席' })).toHaveAttribute('aria-valuetext', '3 / 5 席');
    const table = screen.getByRole('table', { name: 'メンバー' });
    // 自分の行（佐藤 葵）にはチェックボックスも行の操作も無い
    expect(within(table).queryByRole('checkbox', { name: /佐藤 葵/ })).toBeNull();
    expect(within(table).queryByRole('button', { name: '佐藤 葵 の操作' })).toBeNull();
    expect(within(table).queryByRole('combobox', { name: '佐藤 葵 の役割' })).toBeNull();
    expect(within(table).getByText('あなた')).toBeInTheDocument();

    await user.click(within(table).getByRole('combobox', { name: '鈴木 蓮 の役割' }));
    await user.click(screen.getByRole('option', { name: '閲覧者' }));
    expect(onRoleChange).toHaveBeenCalledWith('u2', 'viewer');
    await notice('鈴木 蓮 の役割を「閲覧者」にしました');

    // すべて選択は、選べる行（自分以外）だけを選ぶ
    await user.click(within(table).getByRole('checkbox', { name: 'すべて選択' }));
    await user.click(screen.getByRole('button', { name: 'ワークスペースから外す' }));
    const dialog = screen.getByRole('dialog', { name: '2 人を外しますか' });
    await user.click(within(dialog).getByRole('button', { name: 'ワークスペースから外す' }));
    expect(onRemove).toHaveBeenCalledWith(['u2', 'u3']);
    await notice('2 人を外しました');
  });

  it('外すのに失敗した文は確かめるモーダルの中で読み、Esc で閉じても次に開いたときには残さない', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockResolvedValueOnce({ error: '請求の担当者は外せません' });
    renderInSite(<MembersPage members={MEMBERS} roles={ROLES} currentUserId="u1" onRemove={onRemove} />);
    const table = screen.getByRole('table', { name: 'メンバー' });
    await user.click(within(table).getByRole('button', { name: '鈴木 蓮 の操作' }));
    await user.click(screen.getByRole('menuitem', { name: 'ワークスペースから外す' }));
    const dialog = screen.getByRole('dialog', { name: '鈴木 蓮 を外しますか' });
    await user.click(within(dialog).getByRole('button', { name: 'ワークスペースから外す' }));
    await vi.waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('請求の担当者は外せません'));
    act(() => {
      pressEscape(dialog as HTMLDialogElement);
    });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(within(table).getByRole('button', { name: '高橋 陽菜 の操作' }));
    await user.click(screen.getByRole('menuitem', { name: 'ワークスペースから外す' }));
    expect(within(screen.getByRole('dialog', { name: '高橋 陽菜 を外しますか' })).queryByRole('alert')).toBeNull();
  });

  it('招待はメールアドレスをタグでまとめて入れ（形の合わないものは付けない）、無ければ欄へ戻し、送ったら人数を知らせる', async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();
    renderInSite(<MembersPage members={MEMBERS} roles={ROLES} onInvite={onInvite} />);
    await user.click(screen.getByRole('button', { name: 'メンバーを招待' }));
    const dialog = screen.getByRole('dialog', { name: 'メンバーを招待' });
    await user.click(within(dialog).getByRole('button', { name: '招待を送る' }));
    expect(within(dialog).getByText('招待する人のメールアドレスを入れてください')).toBeInTheDocument();
    const emails = within(dialog).getByLabelText(/メールアドレス/);
    expect(emails).toHaveFocus();
    // 形の合わないものは付けずに欄に残る（直して付け直せる）
    await user.type(emails, 'kai@example.com{Enter}not-an-email{Enter}');
    expect(emails).toHaveValue('not-an-email');
    await user.clear(emails);
    await user.type(emails, 'mio@example.com,');
    expect(within(dialog).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['kai@example.com', 'mio@example.com']);
    await user.click(within(dialog).getByRole('button', { name: '招待を送る' }));
    expect(onInvite).toHaveBeenCalledWith({ emails: ['kai@example.com', 'mio@example.com'], role: 'admin', message: '' });
    await notice('2 人に招待を送りました');
  });

  it('招待中の一覧の「送り直す」「取り消す」は宛先を含む名前を持ち、名前で絞り込めて、当てはまらなければそう伝える', async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    renderInSite(
      <MembersPage
        members={MEMBERS}
        roles={ROLES}
        invitations={[{ id: 'i1', email: 'kai@example.com', role: 'editor', sentAt: '2026-10-22T10:00:00+09:00' }]}
        onResend={onResend}
        onRevoke={vi.fn()}
      />,
    );
    const invitations = screen.getByRole('region', { name: '招待中' });
    await user.click(within(invitations).getByRole('button', { name: 'kai@example.com に招待を送り直す' }));
    expect(onResend).toHaveBeenCalledWith('i1');
    expect(within(invitations).getByRole('button', { name: 'kai@example.com への招待を取り消す' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: '名前かメールアドレスで探す' }), 'すずき');
    expect(screen.getByRole('table', { name: 'メンバー' })).toHaveTextContent('「すずき」に当てはまるメンバーはいません');
  });
});

describe('料金と請求 / P-15', () => {
  it('今のプランは状態の言葉・「月額」の値段・次の更新日を示し、支払いに失敗していれば知らせの帯で伝える', () => {
    const { unmount } = renderInSite(<BillingPage plan={{ name: 'Pro', price: 1500, status: 'active', periodEnd: '2026-11-01' }} />);
    const plan = screen.getByRole('region', { name: '今のプラン' });
    expect(plan).toHaveTextContent('有効');
    expect(plan).toHaveTextContent('月額 ￥1,500');
    const period = plan.querySelector('.g-billing-period time');
    expect(period).toHaveTextContent('2026年11月1日 に自動で更新します');
    expect(period).toHaveAttribute('dateTime', '2026-11-01');
    expect(within(plan).getByRole('link', { name: 'プランを変える' })).toHaveAttribute('href', '/pricing');
    unmount();
    renderInSite(<BillingPage plan={{ name: 'Pro', price: 15000, interval: 'year', status: 'past_due' }} onUpdatePayment={vi.fn()} />);
    expect(screen.getByText('支払いに失敗しました。支払い方法を確かめてください。')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '今のプラン' })).toHaveTextContent('年額 ￥15,000');
  });

  it('カードは下 4 桁だけで「末尾」と読ませ、使っている量は 8 割で注意・上限で失敗の色にして数でも示す', () => {
    renderInSite(
      <BillingPage
        plan={{ name: 'Pro' }}
        paymentMethod={{ brand: 'Visa', last4: '4242', expMonth: 4, expYear: 2028 }}
        billingEmail="billing@example.com"
        usage={[
          { label: '席', used: 9, limit: 10 },
          { label: '保存容量', used: 20, limit: 20, format: (value) => `${String(value)} GB` },
          { label: 'API の呼び出し', used: 38200, limit: 100000 },
        ]}
      />,
    );
    const payment = screen.getByRole('region', { name: '支払い方法' });
    // 見た目の点は読ませず、読み上げは「末尾」で
    expect(payment.querySelector('.g-billing-card-number .g-sr-only')).toHaveTextContent('Visa、末尾 4242');
    expect(payment.querySelector('.g-billing-card-number [aria-hidden="true"]')).toHaveTextContent('Visa •••• 4242');
    expect(payment).toHaveTextContent('有効期限 04/28');
    expect(payment).toHaveTextContent('billing@example.com');
    const meters = screen.getAllByRole('progressbar');
    // 8 割を超えたら注意、上限に届いたら失敗の色。それ以外は既定（アクセント）
    expect(meters.map((meter) => meter.closest('.g-progress')?.getAttribute('data-tone'))).toEqual(['warning', 'error', 'accent']);
    expect(meters[1]).toHaveAttribute('aria-valuetext', '20 GB / 20 GB');
    // format を渡さなければ、言語の書式の数（桁区切り）
    expect(meters[2]).toHaveAttribute('aria-valuetext', '38,200 / 100,000');
  });

  it('請求書は日付の新しい順で、PDF のリンクは番号を含む名前。解約は使える最後の日を示して確かめる', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderInSite(
      <BillingPage
        plan={{ name: 'Pro', price: 1500, periodEnd: '2026-11-01' }}
        onCancel={onCancel}
        invoices={[
          { id: 'a', number: 'INV-008', date: '2026-08-01', amount: 1500, status: 'paid', href: '/invoices/8.pdf' },
          { id: 'b', number: 'INV-010', date: '2026-10-01', amount: 1500, status: 'open', href: '/invoices/10.pdf' },
        ]}
      />,
    );
    const table = screen.getByRole('table', { name: '請求書' });
    expect(within(table).getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['INV-010', 'INV-008']);
    expect(within(table).getByRole('link', { name: 'INV-010 の PDF を保存' })).toHaveAttribute('href', '/invoices/10.pdf');
    expect(within(table).getByText('未払い')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '解約する' }));
    const dialog = screen.getByRole('dialog', { name: '解約しますか' });
    expect(dialog).toHaveTextContent('2026年11月1日 までは今のプランのまま使えます');
    await user.click(within(dialog).getByRole('button', { name: '解約する' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await notice('解約しました。期間の終わりまで、今のプランのまま使えます。');
  });
});

describe('はじめの設定 / P-16', () => {
  const STEPS = (validate: () => string | null) => [
    { id: 'workspace', title: 'ワークスペースを作る', description: '名前はあとで変えられます。', content: <p>名前の欄</p>, validate },
    { id: 'invite', title: 'チームを招待する', content: <p>招待の欄</p>, optional: true },
    { id: 'done', title: '準備ができました', content: <p>おわり</p> },
  ];

  it('手順の進み具合を示し、次へで確かめてから進み、見出しへフォーカスを移す。最後は「始める」で送る', async () => {
    const user = userEvent.setup();
    let reason: string | null = '名前を入力してください';
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    renderInSite(<OnboardingPage steps={STEPS(() => reason)} onComplete={onComplete} onStepChange={onStepChange} />);
    const progress = screen.getByRole('list', { name: 'はじめの設定' });
    expect(within(progress).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 1, name: 'ワークスペースを作る' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(screen.getByRole('alert')).toHaveTextContent('名前を入力してください');
    expect(onStepChange).not.toHaveBeenCalled();
    reason = null;
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('heading', { level: 1, name: 'チームを招待する' })).toHaveFocus();
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByRole('button', { name: '次へ' }));
    await user.click(screen.getByRole('button', { name: '始める' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('飛ばせる手順は「あとで設定する」で進め、戻ると前の手順へ。最初の手順では戻るを出さない', async () => {
    const user = userEvent.setup();
    renderInSite(<OnboardingPage steps={STEPS(() => null)} onComplete={vi.fn()} defaultStep={1} />);
    expect(screen.getByRole('heading', { level: 1, name: 'チームを招待する' })).not.toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'あとで設定する' }));
    expect(screen.getByRole('heading', { level: 1, name: '準備ができました' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'あとで設定する' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '戻る' }));
    await user.click(screen.getByRole('button', { name: '戻る' }));
    expect(screen.getByRole('heading', { level: 1, name: 'ワークスペースを作る' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: '戻る' })).toBeNull();
  });
});

describe('招待を受ける / P-17', () => {
  it('誰から・どこへ・どの役割かを示して受ける / 断るを置き、断ったら見出しへフォーカスを移す', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    renderInSite(<InviteAcceptPage workspace="Atlas Design" inviter="佐藤 葵" role="編集者" onAccept={onAccept} onDecline={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Atlas Design への招待' })).toBeInTheDocument();
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('佐藤 葵 さんが、あなたを Atlas Design に招待しています。');
    expect(document.querySelector('.g-invite-from')).toHaveTextContent('役割: 編集者');
    await user.click(screen.getByRole('button', { name: '招待を受ける' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: '断る' }));
    await act(async () => Promise.resolve());
    expect(screen.getByRole('heading', { level: 1, name: '招待を断りました' })).toHaveFocus();
  });

  it('ログインしていなければログインとアカウントの作成へ、宛先と違えば別のアカウントへ案内し、期限切れは次にすることだけを書く', () => {
    const { unmount } = renderInSite(<InviteAcceptPage workspace="Atlas" inviter="佐藤 葵" signedIn={false} />);
    expect(screen.getByRole('link', { name: 'ログインして参加する' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'アカウントを作って参加する' })).toHaveAttribute('href', '/signup');
    unmount();
    const second = renderInSite(<InviteAcceptPage workspace="Atlas" inviter="佐藤 葵" wrongAccountEmail="hina@example.com" onSwitchAccount={vi.fn()} />);
    expect(screen.getByText('この招待は hina@example.com 宛てです。宛先のアカウントでログインし直してください。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '別のアカウントでログインする' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '招待を受ける' })).toBeNull();
    second.unmount();
    renderInSite(<InviteAcceptPage workspace="Atlas" inviter="佐藤 葵" status="expired" />);
    expect(screen.getByRole('heading', { level: 1, name: '招待の期限が切れています' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/app');
  });
});
