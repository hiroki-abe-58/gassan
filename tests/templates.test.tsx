/**
 * ページのテンプレート（P-01〜P-06）。
 *
 * 形（カードの幅・器が広いときの横並び・大きな状態コード）は templates.css の container query なので、
 * ヘッドレス Chrome で確かめる。ここではランドマークと見出し・入力欄の属性（自動入力）・送信の流れ
 * （直す所のまとめとフォーカス・失敗の文・二度押し）・画面の切り替えとフォーカス・状態ごとの次の一歩を見る。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ChangelogPage,
  ContactPage,
  DocumentPage,
  ErrorPage,
  FaqPage,
  ForgotPasswordPage,
  GassanProvider,
  MaintenancePage,
  PricingPage,
  ResetPasswordPage,
  SignInPage,
  SignOutPage,
  SignUpPage,
  SiteLayout,
  SiteProvider,
  TwoFactorPage,
  VerifyEmailPage,
  englishLabels,
  type SiteLinkProps,
} from '../src';
import * as auth from '../src/templates/auth';
import * as layouts from '../src/templates/layouts';
import * as publicPages from '../src/templates/public';
import * as siteLayout from '../src/templates/site-layout';
import * as status from '../src/templates/status';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const LINKS = {
  home: '/',
  signIn: '/login',
  signUp: '/signup',
  forgotPassword: '/forgot',
  terms: '/terms',
  privacy: '/privacy',
  help: '/help',
  contact: '/contact',
  status: 'https://status.example.com',
};

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={LINKS} copyright="© 2026 Genelab">
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

describe('骨組みと共有の設定 / P-01', () => {
  it('header・main・footer のランドマークと 1 つの h1 を持ち、製品の名前はホームへのリンク、足元に規約のリンク', () => {
    renderInSite(<SignInPage onSubmit={vi.fn()} />);
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('link', { name: 'Atlas' }));
    expect(screen.getByRole('link', { name: 'Atlas' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1, name: 'ログイン' }));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: '利用規約' })).toHaveAttribute('href', '/terms');
    expect(within(footer).getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '/privacy');
    expect(footer).toHaveTextContent('© 2026 Genelab');
  });

  it('足元に置くもの（規約のリンク・著作権・リンクの列）が無ければ、footer ごと出さない（空のランドマークを作らない）', () => {
    for (const node of [<layouts.AuthLayout key="auth" title="t" />, <layouts.StatusLayout key="status" title="t" />, <SiteLayout key="site">x</SiteLayout>]) {
      const { unmount } = render(
        <SiteProvider name="Atlas" links={{ home: '/' }}>
          {node}
        </SiteProvider>,
      );
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.queryByRole('contentinfo')).toBeNull();
      unmount();
    }
  });

  it('文言は GassanProvider の言語から選び（日本語以外は英語）、SiteProvider の labels で差し替えられる', () => {
    const { unmount } = render(
      <GassanProvider labels={englishLabels}>
        <Site>
          <SignInPage onSubmit={vi.fn()} />
        </Site>
      </GassanProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute('href', '/forgot');
    unmount();
  });

  it('linkComponent を渡すと、テンプレートのリンクはその部品で描かれる（Next.js の Link など）', () => {
    const seen: string[] = [];
    function RouterLink({ href, children, ...rest }: SiteLinkProps): ReactNode {
      seen.push(href);
      return (
        <a href={`#app${href}`} {...rest}>
          {children}
        </a>
      );
    }
    render(
      <SiteProvider name="Atlas" links={LINKS} linkComponent={RouterLink}>
        <SignOutPage />
      </SiteProvider>,
    );
    expect(screen.getByRole('link', { name: 'もう一度ログインする' })).toHaveAttribute('href', '#app/login');
    expect(seen).toEqual(expect.arrayContaining(['/', '/login', '/terms']));
  });

  it('テンプレートは 1 つ残らず data-* を外側の要素へ渡す', () => {
    const cases: Record<string, () => ReactNode> = {
      AuthLayout: () => <layouts.AuthLayout title="t" data-testid="probe" />,
      StatusLayout: () => <layouts.StatusLayout title="t" data-testid="probe" />,
      SignInPage: () => <SignInPage onSubmit={vi.fn()} data-testid="probe" />,
      SignUpPage: () => <SignUpPage onSubmit={vi.fn()} data-testid="probe" />,
      ForgotPasswordPage: () => <ForgotPasswordPage onSubmit={vi.fn()} data-testid="probe" />,
      ResetPasswordPage: () => <ResetPasswordPage onSubmit={vi.fn()} data-testid="probe" />,
      TwoFactorPage: () => <TwoFactorPage onSubmit={vi.fn()} data-testid="probe" />,
      VerifyEmailPage: () => <VerifyEmailPage email="a@example.com" data-testid="probe" />,
      SignOutPage: () => <SignOutPage data-testid="probe" />,
      ErrorPage: () => <ErrorPage data-testid="probe" />,
      MaintenancePage: () => <MaintenancePage data-testid="probe" />,
      SiteLayout: () => <SiteLayout data-testid="probe">x</SiteLayout>,
      WithSiteLayout: () => (
        <siteLayout.WithSiteLayout layout data={{ 'data-testid': 'probe' }}>
          x
        </siteLayout.WithSiteLayout>
      ),
      DocumentPage: () => <DocumentPage title="t" sections={[]} data-testid="probe" />,
      FaqPage: () => <FaqPage items={[]} data-testid="probe" />,
      PricingPage: () => <PricingPage plans={[]} data-testid="probe" />,
      ContactPage: () => <ContactPage onSubmit={vi.fn()} data-testid="probe" />,
      ChangelogPage: () => <ChangelogPage entries={[]} data-testid="probe" />,
    };
    const exported = [layouts, auth, status, siteLayout, publicPages]
      .flatMap((module) => Object.entries(module))
      .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
      .map(([name]) => name)
      .sort();
    expect(Object.keys(cases).sort()).toEqual(exported);
    for (const [name, renderCase] of Object.entries(cases)) {
      const { unmount } = renderInSite(renderCase());
      expect(screen.getByTestId('probe'), name).toHaveClass('g-page');
      unmount();
    }
  });
});

describe('ログインと登録 / P-02', () => {
  it('ログインの欄は自動入力が効く属性を持ち、全部が必須なので「必須」のバッジは出さない', () => {
    renderInSite(<SignInPage onSubmit={vi.fn()} />);
    const email = screen.getByLabelText('メールアドレス');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'username');
    expect(email).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('パスワード')).toHaveAttribute('autocomplete', 'current-password');
    expect(document.querySelector('.g-label-badge')).toBeNull();
  });

  it('失敗なら既定の文を割り込ませて読み、入力は残す。例外のときは中身を見せずに「送信できませんでした」', async () => {
    const user = userEvent.setup();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onSubmit = vi.fn().mockResolvedValueOnce({ error: true }).mockRejectedValueOnce(new Error('TypeError: Failed to fetch'));
    renderInSite(<SignInPage onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('メールアドレスかパスワードが違います。');
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('hana@example.com');
    expect(onSubmit).toHaveBeenCalledWith({ email: 'hana@example.com', password: 'wrong-password', remember: false });
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByText('送信できませんでした。時間をおいて、もう一度お試しください。')).toBeInTheDocument();
    expect(screen.queryByText(/Failed to fetch/)).toBeNull();
    expect(error).toHaveBeenCalled();
  });

  it('外部の ID は「〜で続ける」のボタンと「または」の区切りで並べる', async () => {
    const user = userEvent.setup();
    const google = vi.fn();
    renderInSite(<SignInPage onSubmit={vi.fn()} providers={[{ id: 'google', name: 'Google', onClick: google }]} />);
    await user.click(screen.getByRole('button', { name: 'Googleで続ける' }));
    expect(google).toHaveBeenCalledTimes(1);
    expect(screen.getByText('または')).toBeInTheDocument();
  });

  it('登録は新しいパスワードの属性と強さの説明を持ち、規約とプライバシーポリシーのリンクを含む同意を求める', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<SignUpPage onSubmit={onSubmit} />);
    expect(screen.getByLabelText('お名前')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('autocomplete', 'email');
    const password = screen.getByLabelText('パスワード');
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(password).toHaveAccessibleDescription(expect.stringContaining('8 文字以上'));
    const agree = screen.getByRole('checkbox', { name: '利用規約とプライバシーポリシーに同意します' });
    expect(within(agree.closest('label')!).getByRole('link', { name: '利用規約' })).toHaveAttribute('href', '/terms');
    await user.type(screen.getByLabelText('お名前'), '山田 花子');
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.type(password, 'short');
    await user.click(screen.getByRole('button', { name: 'アカウントを作る' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(password).toHaveAccessibleDescription(expect.stringContaining('8 文字以上で入力してください'));
    expect(agree).toHaveAttribute('aria-invalid', 'true');
    expect(agree).toHaveAccessibleDescription('登録するには、利用規約とプライバシーポリシーへの同意が必要です');
  });
});

describe('送信の流れ / P-03', () => {
  it('空で送ると直す所のまとめへフォーカスを移し、各行のリンクで欄へ移れる。その後は打つたびに直る', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<SignInPage onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    const summary = document.querySelector('.g-form-summary') as HTMLElement;
    expect(summary).toHaveFocus();
    expect(within(summary).getByRole('alert')).toHaveTextContent('入力内容を確認してください');
    const email = screen.getByLabelText('メールアドレス');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('メールアドレスを入力してください');
    await user.click(within(summary).getByRole('link', { name: 'パスワードを入力してください' }));
    expect(screen.getByLabelText('パスワード')).toHaveFocus();
    await user.type(email, 'hana@');
    expect(email).toHaveAccessibleDescription('メールアドレスの形で入力してください（例: name@example.com）');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('送信の間はボタンが処理中になり、二度押しで二度送らない', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    renderInSite(<SignInPage onSubmit={onSubmit} defaultEmail="hana@example.com" />);
    await user.type(screen.getByLabelText('パスワード'), 'secret-pass');
    const submit = screen.getByRole('button', { name: 'ログイン' });
    await user.click(submit);
    expect(submit).toHaveAttribute('aria-busy', 'true');
    await user.click(submit);
    fireEvent.submit(submit.closest('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(submit).not.toHaveAttribute('aria-busy');
  });
});

describe('再設定と確認 / P-04', () => {
  it('再設定のメールを送ると、登録の有無を明かさない文の画面に切り替えて見出しへフォーカスし、待ってから送り直せる', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn();
    renderInSite(<ForgotPasswordPage onSubmit={onSubmit} resendAfter={30} />);
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(screen.getByRole('button', { name: '再設定のメールを送る' }));
    const heading = await screen.findByRole('heading', { level: 1, name: 'メールを確認してください' });
    expect(heading).toHaveFocus();
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('hana@example.com が登録されていれば');
    // 待つ間は aria-disabled で、待ち時間を説明として読む。毎秒変わる待ち時間は読み上げの領域に入れない
    const resend = screen.getByRole('button', { name: 'もう一度送る' });
    const status = document.querySelector('.g-auth-hint [role="status"]');
    expect(resend).toHaveAttribute('aria-disabled', 'true');
    expect(resend).toHaveAccessibleDescription('30 秒後に、もう一度送れます');
    expect(status).toHaveTextContent('');
    await user.click(resend);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(resend).not.toHaveAttribute('aria-disabled');
    await user.click(resend);
    expect(onSubmit).toHaveBeenLastCalledWith({ email: 'hana@example.com' });
    expect(onSubmit).toHaveBeenCalledTimes(2);
    // 送り直した結果は読み上げ、また待たせる
    await vi.waitFor(() => expect(status).toHaveTextContent('送り直しました'));
    expect(resend).toHaveAttribute('aria-disabled', 'true');
  });

  it('新しいパスワードは確認と一致させ、変えたら完了の画面からログインへ。期限切れならメールを送り直す案内だけ', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = renderInSite(<ResetPasswordPage onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('新しいパスワード'), 'Gassan-2026!');
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'Gassan-2025!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変える' }));
    expect(screen.getByLabelText('新しいパスワード（確認）')).toHaveAccessibleDescription('パスワードが一致しません');
    await user.clear(screen.getByLabelText('新しいパスワード（確認）'));
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'Gassan-2026!');
    await user.click(screen.getByRole('button', { name: 'パスワードを変える' }));
    expect(onSubmit).toHaveBeenCalledWith({ password: 'Gassan-2026!' });
    expect(await screen.findByRole('heading', { level: 1, name: 'パスワードを変えました' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute('href', '/login');
    rerender(
      <Site>
        <ResetPasswordPage onSubmit={onSubmit} expired key="expired" />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'リンクの有効期限が切れています' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'もう一度メールを送る' })).toHaveAttribute('href', '/forgot');
  });

  it('メールの確認は送った先を示し、確認できたら「続ける」、期限切れならすぐ送り直せる', () => {
    const { rerender } = renderInSite(<VerifyEmailPage email="hana@example.com" onResend={vi.fn()} changeHref="/settings/email" />);
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('hana@example.com に確認のメールを送りました');
    expect(screen.getByRole('link', { name: 'メールアドレスを変える' })).toHaveAttribute('href', '/settings/email');
    rerender(
      <Site>
        <VerifyEmailPage email="hana@example.com" status="expired" onResend={vi.fn()} />
      </Site>,
    );
    expect(screen.getByRole('button', { name: 'もう一度送る' })).toBeEnabled();
    rerender(
      <Site>
        <VerifyEmailPage email="hana@example.com" status="verified" continueHref="/app" />
      </Site>,
    );
    expect(screen.getByRole('link', { name: '続ける' })).toHaveAttribute('href', '/app');
  });

  it('2 段階認証は 1 つの欄（one-time-code）で、桁がそろうと送り、違えば消して欄へ戻す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValueOnce({ error: true }).mockResolvedValueOnce(undefined);
    renderInSite(<TwoFactorPage onSubmit={onSubmit} method="sms" destination="•••• 1234" trustDays={30} />);
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('•••• 1234 に送った 6 桁のコードを入力してください。');
    const code = screen.getByLabelText('確認コード');
    expect(code).toHaveAttribute('autocomplete', 'one-time-code');
    await user.click(screen.getByRole('checkbox', { name: 'このデバイスを 30 日間信頼する' }));
    await user.type(code, '123456');
    expect(onSubmit).toHaveBeenCalledWith({ code: '123456', trust: true });
    expect(await screen.findByRole('alert')).toHaveTextContent('コードが違います。');
    expect(code).toHaveValue('');
    expect(code).toHaveFocus();
  });

  it('2 段階認証の説明はコードの桁数に合わせる', () => {
    renderInSite(<TwoFactorPage onSubmit={vi.fn()} length={8} />);
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('認証アプリに表示されている 8 桁のコードを入力してください。');
  });

  it('ログアウトは確かめてから行い、した後はもう一度ログインする道とホームへの道を出す', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const { rerender } = renderInSite(<SignOutPage status="confirm" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'ログアウト' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'キャンセル' })).toHaveAttribute('href', '/');
    rerender(
      <Site>
        <SignOutPage />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'ログアウトしました' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'もう一度ログインする' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/');
  });
});

const NAV = [
  { label: '料金', href: '/pricing' },
  { label: 'よくある質問', href: '/faq' },
];
const FOOTER = [{ title: '会社', links: [{ label: '会社概要', href: '/about' }] }];

function PublicSite({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={{ ...LINKS, pricing: '/pricing', faq: '/faq' }} nav={NAV} footer={FOOTER}>
      {children}
    </SiteProvider>
  );
}

describe('公開ページの外枠 / P-01', () => {
  it('本文へ飛ぶリンクで main へフォーカスを移し、いまのページの案内に aria-current を付ける', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <SiteLayout current="/faq">本文</SiteLayout>
      </PublicSite>,
    );
    await user.tab();
    const skip = screen.getByRole('link', { name: '本文へ移動' });
    expect(skip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
    const nav = screen.getByRole('navigation', { name: 'サイトの案内' });
    expect(within(nav).getByRole('link', { name: 'よくある質問' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: '料金' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'アカウントを作る' })).toHaveAttribute('href', '/signup');
    expect(within(screen.getByRole('navigation', { name: 'サイトの情報' })).getByRole('link', { name: '会社概要' })).toHaveAttribute('href', '/about');
  });

  it('狭い器のメニューは開け閉めのボタン（aria-expanded と aria-controls）で、案内は role="menu" にしない', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <SiteLayout>本文</SiteLayout>
      </PublicSite>,
    );
    const button = screen.getByRole('button', { name: 'メニュー' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    // 狭い器では案内とログインなどの操作を一緒に畳むので、両方を指す
    const actions = screen.getByRole('link', { name: 'ログイン' }).closest('.g-site-actions');
    expect(button).toHaveAttribute('aria-controls', `${screen.getByRole('navigation', { name: 'サイトの案内' }).id} ${actions?.id ?? ''}`);
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button.closest('.g-site-bar')).toHaveAttribute('data-open');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('文書 / P-07', () => {
  const SECTIONS = [
    { id: 'purpose', title: '目的', content: <p>この規約は…</p> },
    { id: 'account', title: 'アカウント', content: <p>利用者は…</p> },
    { id: 'payment', title: '料金と支払い', content: <p>料金は…</p> },
  ];

  it('施行日と更新日は time 要素、目次は名前のある nav で、各節は id を持つ見出しへのリンク', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <DocumentPage title="利用規約" effective="2026-04-01" updated="2026-10-01" numbering="article" sections={SECTIONS} />
      </PublicSite>,
    );
    expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
    const times = document.querySelectorAll('.g-doc-meta time');
    expect([...times].map((time) => time.getAttribute('dateTime'))).toEqual(['2026-04-01', '2026-10-01']);
    expect(times[0]).toHaveTextContent('2026年4月1日');
    const toc = screen.getByRole('navigation', { name: '目次' });
    const link = within(toc).getByRole('link', { name: '第 2 条 アカウント' });
    expect(link).toHaveAttribute('href', '#account');
    expect(screen.getByRole('region', { name: '第 3 条 料金と支払い' })).toBeInTheDocument();
    Element.prototype.scrollIntoView = vi.fn();
    await user.click(link);
    expect(screen.getByRole('heading', { level: 2, name: '第 2 条 アカウント' })).toHaveFocus();
  });

  it('節が 2 つまでなら目次を出さない', () => {
    render(
      <PublicSite>
        <DocumentPage title="特定商取引法に基づく表記" sections={SECTIONS.slice(0, 2)} />
      </PublicSite>,
    );
    expect(screen.queryByRole('navigation', { name: '目次' })).toBeNull();
  });
});

describe('よくある質問 / P-08', () => {
  const ITEMS = [
    { id: 'refund', question: '返金はできますか', answer: '30 日以内なら返金します。', category: '料金' },
    { id: 'invoice', question: 'インボイスに対応していますか', answer: '対応しています。', category: '料金', keywords: ['適格請求書'] },
    { id: 'sso', question: 'SSO は使えますか', answer: 'Enterprise で使えます。', category: 'アカウント' },
    { id: 'delete', question: 'アカウントを消すには', answer: '設定から消せます。', category: 'アカウント' },
    { id: 'export', question: 'データを書き出せますか', answer: 'CSV で書き出せます。' },
    { id: 'api', question: 'API はありますか', answer: 'あります。' },
  ];

  it('まとまりの見出しで分け、かなと全角半角を区別せずに絞り込んで件数を読み上げる。無ければ問い合わせへ', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <FaqPage items={ITEMS} />
      </PublicSite>,
    );
    expect(screen.getByRole('heading', { level: 2, name: '料金' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'その他' })).toBeInTheDocument();
    const search = screen.getByRole('searchbox', { name: '質問を探す' });
    await user.type(search, 'いんぼいす');
    expect(screen.getByRole('status')).toHaveTextContent('1 件の質問が見つかりました');
    expect(screen.getByText('インボイスに対応していますか')).toBeInTheDocument();
    expect(screen.queryByText('返金はできますか')).toBeNull();
    await user.clear(search);
    await user.type(search, '適格請求書');
    expect(screen.getByText('インボイスに対応していますか')).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'ｓｓｏ');
    expect([...document.querySelectorAll('.g-accordion-title')].map((title) => title.textContent)).toEqual(['SSO は使えますか']);
    await user.type(search, 'xyz');
    expect(screen.getByText(/当てはまる質問がありませんでした/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact');
  });

  it('アドレスの #id の質問は開いた状態で出す', () => {
    window.location.hash = '#sso';
    Element.prototype.scrollIntoView = vi.fn();
    render(
      <PublicSite>
        <FaqPage items={ITEMS} />
      </PublicSite>,
    );
    expect((document.getElementById('sso') as HTMLDetailsElement).open).toBe(true);
    expect((document.getElementById('refund') as HTMLDetailsElement).open).toBe(false);
    window.location.hash = '';
  });
});

describe('料金 / P-09', () => {
  const PLANS = [
    { id: 'free', name: 'Free', monthly: 0, features: ['3 人まで'], cta: { label: '無料で始める', href: '/signup' } },
    { id: 'pro', name: 'Pro', monthly: 1200, yearly: 12000, features: ['人数の上限なし', '優先サポート'], cta: { label: 'Pro を選ぶ', href: '/signup?plan=pro' }, recommended: true },
    { id: 'enterprise', name: 'Enterprise', monthly: null, features: ['SSO'], cta: { label: 'お問い合わせ', href: '/contact' } },
  ];

  it('値段は通貨の書式で、読み上げは「月額」と言葉にする。年払いに切り替えると月あたりと一括の額を出す', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <PricingPage plans={PLANS} yearlyNote="2 か月分お得" />
      </PublicSite>,
    );
    const pro = screen.getByRole('article', { name: 'Pro' });
    expect(within(pro).getByText('月額 ￥1,200')).toHaveClass('g-sr-only');
    expect(within(pro).getByText('おすすめ')).toBeInTheDocument();
    expect(within(pro).getByRole('link', { name: 'Pro を選ぶ' })).toHaveAttribute('data-variant', 'primary');
    expect(within(screen.getByRole('article', { name: 'Enterprise' })).getByText('ご相談')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '年払い（2 か月分お得）' }));
    expect(within(pro).getByText('月額 ￥1,000')).toBeInTheDocument();
    expect(pro.querySelector('.g-plan-note')).toHaveTextContent('年 ￥12,000 を一括でお支払い');
  });

  it('比べる表は列と行の見出しを持ち、あり・なしを言葉でも添える', () => {
    render(
      <PublicSite>
        <PricingPage plans={PLANS} comparison={[{ feature: 'SSO', values: { free: false, pro: false, enterprise: true } }, { feature: '保存容量', values: { free: '1 GB', pro: '100 GB', enterprise: '無制限' } }]} />
      </PublicSite>,
    );
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Pro' })).toBeInTheDocument();
    const sso = within(table).getByRole('rowheader', { name: 'SSO' }).closest('tr')!;
    expect(sso).toHaveTextContent('なし');
    expect(sso).toHaveTextContent('あり');
    expect(screen.getByRole('region', { name: 'プランの比較' })).toHaveAttribute('tabindex', '0');
  });
});

describe('お問い合わせ / P-10', () => {
  it('必須と任意の印を出し、種類と同意を確かめ、送ったら受付の画面の見出しへフォーカスを移す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <PublicSite>
        <ContactPage onSubmit={onSubmit} />
      </PublicSite>,
    );
    expect(screen.getByText('会社名').closest('label')).toHaveTextContent('任意');
    expect(screen.getByText('お名前').closest('label')).toHaveTextContent('必須');
    expect(screen.getByLabelText(/会社名/)).toHaveAttribute('autocomplete', 'organization');
    await user.type(screen.getByLabelText(/お名前/), '山田 花子');
    await user.type(screen.getByLabelText(/メールアドレス/), 'hana@example.com');
    await user.type(screen.getByRole('textbox', { name: /お問い合わせの内容/ }), '請求書の宛名を変えたい');
    await user.click(screen.getByRole('button', { name: '送信する' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = document.querySelector('.g-form-summary') as HTMLElement;
    expect(summary).toHaveTextContent('お問い合わせの種類を入力してください');
    expect(summary).toHaveTextContent('送るには、プライバシーポリシーへの同意が必要です');
    await user.click(screen.getByRole('combobox', { name: /お問い合わせの種類/ }));
    await user.click(screen.getByRole('option', { name: '料金・請求について' }));
    await user.click(screen.getByRole('checkbox', { name: 'プライバシーポリシーに同意します' }));
    await user.click(screen.getByRole('button', { name: '送信する' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ topic: 'billing', agree: true, company: '' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'お問い合わせを受け付けました' })).toHaveFocus();
    expect(document.querySelector('.g-contact-done')).toHaveTextContent('hana@example.com に受付の控えを送りました');
  });
});

describe('更新履歴 / P-11', () => {
  it('更新ごとに見出し・time 要素・版・種類の言葉の印を持ち、使われている種類だけで絞り込める', async () => {
    const user = userEvent.setup();
    render(
      <PublicSite>
        <ChangelogPage
          feedHref="/changelog.xml"
          entries={[
            { version: 'v2.4', date: '2026-10-20', title: 'ページのテンプレート', tags: ['new'], content: <p>ログインから料金まで。</p> },
            { version: 'v2.3.1', date: '2026-10-12', title: '日付の表示を直しました', tags: ['fixed'], content: <p>時差で前の日になっていた。</p> },
          ]}
        />
      </PublicSite>,
    );
    const first = screen.getByRole('article', { name: 'ページのテンプレート' });
    expect(first.querySelector('time')).toHaveAttribute('dateTime', '2026-10-20');
    expect(first).toHaveTextContent('v2.4');
    expect(first).toHaveTextContent('新機能');
    const filter = screen.getByRole('radiogroup', { name: '種類で絞り込む' });
    expect(within(filter).getAllByRole('radio').map((radio) => radio.closest('label')?.textContent)).toEqual(['すべて', '新機能', '修正']);
    await user.click(within(filter).getByRole('radio', { name: '修正' }));
    expect(screen.queryByRole('article', { name: 'ページのテンプレート' })).toBeNull();
    expect(screen.getByRole('article', { name: '日付の表示を直しました' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RSS で購読する' })).toHaveAttribute('href', '/changelog.xml');
  });
});

describe('templates.css / P-01', () => {
  const sheet = readFileSync(resolve(process.cwd(), 'src/templates.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  it('層の順を styles.css と同じ文で先に宣言し（読み込む順が逆でも崩れない）、部品と同じ層に書く', () => {
    expect(sheet.trimStart().startsWith('@layer gassan.reset, gassan.tokens, gassan.core, gassan.theme;')).toBe(true);
    expect(sheet).toContain('@layer gassan.core {');
    expect(sheet).not.toMatch(/z-index/);
    expect(sheet).not.toMatch(/outline:\s*none/);
  });

  it('形は画面の幅ではなく器の幅で決める（管理画面の中や見本の枠でも崩れない）', () => {
    expect(sheet).toMatch(/\.g-page\s*\{[^}]*container-type:\s*inline-size/);
    expect(sheet).toMatch(/@container \(min-width: 960px\)/);
    expect(sheet).not.toMatch(/@media[^{]*width/);
  });
});

describe('エラーとメンテナンス / P-05 / P-06', () => {
  it('状態コードは「エラー 404」と読ませ、状態ごとに次の一歩を変える', () => {
    const { rerender } = renderInSite(<ErrorPage />);
    expect(document.querySelector('.g-status-code')).toHaveTextContent('エラー 404');
    expect(screen.getByRole('heading', { level: 1, name: 'ページが見つかりません' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('data-variant', 'primary');
    expect(screen.getByRole('button', { name: '前のページへ戻る' })).toBeInTheDocument();
    rerender(
      <Site>
        <ErrorPage status={401} />
      </Site>,
    );
    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute('href', '/login');
    rerender(
      <Site>
        <ErrorPage status={403} />
      </Site>,
    );
    expect(screen.getByRole('link', { name: 'サポートに問い合わせる' })).toHaveAttribute('href', '/contact');
    rerender(
      <Site>
        <ErrorPage status={500} />
      </Site>,
    );
    expect(screen.getByRole('button', { name: 'もう一度試す' })).toHaveAttribute('data-variant', 'primary');
    expect(screen.getByRole('link', { name: '稼働状況を見る' })).toHaveAttribute('href', 'https://status.example.com');
    rerender(
      <Site>
        <ErrorPage status={418} />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'リクエストを完了できませんでした' })).toBeInTheDocument();
    rerender(
      <Site>
        <ErrorPage status="offline" />
      </Site>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'インターネットに接続されていません' })).toBeInTheDocument();
    expect(document.querySelector('.g-status-code')).toBeNull();
  });

  it('問い合わせ番号は写せ、Retry-After の間は「もう一度試す」を押せない', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onRetry = vi.fn();
    renderInSite(<ErrorPage status={429} retryAfter={5} onRetry={onRetry} reference="req_8f2k1" />);
    expect(screen.getByText('req_8f2k1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '問い合わせ番号をコピー' })).toBeInTheDocument();
    // 待つ間は aria-disabled で押しても何もせず、待ち時間を説明として読む
    const retry = screen.getByRole('button', { name: 'もう一度試す' });
    expect(retry).toHaveAttribute('aria-disabled', 'true');
    expect(retry).toHaveAccessibleDescription('5 秒後に、もう一度試せます');
    fireEvent.click(retry);
    expect(onRetry).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(5_000));
    expect(retry).not.toHaveAttribute('aria-disabled');
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('メンテナンスの予定は時間帯の名前を添えて出し、経過の知らせは時刻つきの一覧にする', () => {
    renderInSite(
      <MaintenancePage
        start="2026-10-24T02:00:00+09:00"
        end="2026-10-24T04:00:00+09:00"
        timeZone="Asia/Tokyo"
        updates={[{ time: '2026-10-24T02:10:00+09:00', text: 'データベースの移行を始めました' }]}
      />,
    );
    // 同じ日なので日付は 1 度だけ。区切りは「〜」、末尾に時間帯の名前。
    expect(document.querySelector('.g-status-schedule > dd')).toHaveTextContent(/^10月24日\(土\) 2:00〜4:00 \((JST|GMT\+9)\)$/);
    const updates = screen.getByRole('region', { name: '最新の情報' });
    expect(within(updates).getByRole('listitem')).toHaveTextContent('データベースの移行を始めました');
    expect(updates.querySelector('time')).toHaveAttribute('dateTime', '2026-10-23T17:10:00.000Z');
    expect(screen.getByRole('link', { name: '稼働状況を見る' })).toHaveAttribute('data-variant', 'primary');
  });
});
