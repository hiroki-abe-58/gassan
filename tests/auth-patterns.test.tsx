/**
 * ログインと登録の形を変えたもの（P-21〜P-30）。
 *
 * 窓のログインと登録・メールを先に聞くログイン・メールのリンクとコード・メールアドレスだけの仮登録・本登録の手順・
 * SMS・パスキー・アカウントの選択・本人確認と期限切れ・購入の後のアカウント作成。形は templates.css で、ここでは
 * 画面の切り替えとフォーカス・入力欄の属性（自動入力）・送信の流れ・読み上げを見る。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AccountChooserPage,
  AuthDialog,
  EmailFirstPage,
  GuestAccountCard,
  MagicLinkPage,
  PasskeyPromptPage,
  PhoneSignInPage,
  QuickSignUpPage,
  ReauthDialog,
  RegistrationWizardPage,
  SignInPage,
  SiteProvider,
  type AuthDialogMode,
  type RegistrationStep,
} from '../src';
import * as authDialog from '../src/templates/auth-dialog';
import * as passwordless from '../src/templates/passwordless';
import * as registration from '../src/templates/registration';
import * as session from '../src/templates/session';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const LINKS = { home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' };

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={LINKS}>
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

describe('窓のログインと登録 / P-21', () => {
  function Header({ onSignIn = vi.fn(), onSignUp = vi.fn(), onForgotPassword = vi.fn(), onSuccess = vi.fn() }) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<AuthDialogMode>('signIn');
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setMode('signIn');
            setOpen(true);
          }}
        >
          ヘッダのログイン
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signUp');
            setOpen(true);
          }}
        >
          無料で始める
        </button>
        <AuthDialog
          open={open}
          onOpenChange={setOpen}
          mode={mode}
          onModeChange={setMode}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          onForgotPassword={onForgotPassword}
          onSuccess={onSuccess}
          sender="example.com"
        />
      </>
    );
  }

  it('ヘッダのボタンから選んだ画面で開き、ログインと登録を窓の中で行き来する。打ったメールアドレスは引き継ぎ、切り替えたら最初の欄へ', async () => {
    const user = userEvent.setup();
    renderInSite(<Header />);
    await user.click(screen.getByRole('button', { name: '無料で始める' }));
    const dialog = screen.getByRole('dialog', { name: 'アカウントを作る' });
    await user.type(within(dialog).getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'ログイン' }));
    expect(screen.getByRole('dialog', { name: 'ログイン' })).toBeInTheDocument();
    const email = within(screen.getByRole('dialog')).getByLabelText('メールアドレス');
    expect(email).toHaveValue('hana@example.com');
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute('autocomplete', 'username');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'アカウントを作る' }));
    expect(within(screen.getByRole('dialog', { name: 'アカウントを作る' })).getByLabelText('お名前')).toHaveFocus();
  });

  it('ログインが済んだら閉じて onSuccess を呼び、開いた起点へフォーカスを戻す', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onSignIn = vi.fn();
    renderInSite(<Header onSuccess={onSuccess} onSignIn={onSignIn} />);
    const opener = screen.getByRole('button', { name: 'ヘッダのログイン' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'ログイン' });
    await user.type(within(dialog).getByLabelText('メールアドレス'), 'hana@example.com');
    await user.type(within(dialog).getByLabelText('パスワード'), 'correct-horse');
    await user.click(within(dialog).getByRole('button', { name: 'ログイン' }));
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledWith('signIn'));
    expect(onSignIn).toHaveBeenCalledWith({ email: 'hana@example.com', password: 'correct-horse', remember: false });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await vi.waitFor(() => expect(opener).toHaveFocus());
  });

  it('「パスワードを忘れた場合」は窓の中で再設定のメールを送り、送った後は送り直しと届かないときの案内、ログインへ戻る道', async () => {
    const user = userEvent.setup();
    const onForgotPassword = vi.fn();
    renderInSite(<Header onForgotPassword={onForgotPassword} />);
    await user.click(screen.getByRole('button', { name: 'ヘッダのログイン' }));
    await user.type(within(screen.getByRole('dialog')).getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'パスワードを忘れた場合' }));
    const forgot = screen.getByRole('dialog', { name: 'パスワードの再設定' });
    expect(within(forgot).getByLabelText('メールアドレス')).toHaveValue('hana@example.com');
    await user.click(within(forgot).getByRole('button', { name: '再設定のメールを送る' }));
    const sent = await screen.findByRole('dialog', { name: 'メールを確認してください' });
    expect(onForgotPassword).toHaveBeenCalledWith({ email: 'hana@example.com' });
    expect(within(sent).getByRole('button', { name: 'もう一度送る' })).toHaveFocus();
    // 文は文節ごとに分けて描くので、文の一致は器の textContent で見る
    expect(sent.querySelector('.g-auth-tips summary')).toHaveTextContent('メールが届かないとき');
    expect(sent.querySelector('.g-auth-tips')).toHaveTextContent('「example.com」からのメールを受け取れるように');
    await user.click(within(sent).getByRole('button', { name: 'ログインに戻る' }));
    expect(screen.getByRole('dialog', { name: 'ログイン' })).toBeInTheDocument();
  });
});

describe('メールアドレスを先に聞くログイン / P-22', () => {
  it('登録してあるアドレスはパスワードへ。アドレスは変えられない形で示し、隠した username の欄でパスワード管理ソフトに渡す', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    renderInSite(<EmailFirstPage onContinue={() => ({ next: 'password' })} onSignIn={onSignIn} />);
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('autocomplete', 'username');
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(screen.getByRole('button', { name: '続ける' }));
    const heading = await screen.findByRole('heading', { level: 1, name: 'ログイン' });
    expect(heading).toHaveFocus();
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('hana@example.com でログインします。');
    const username = document.querySelector<HTMLInputElement>('input[autocomplete="username"]');
    expect(username).toHaveValue('hana@example.com');
    expect(username).not.toBeVisible();
    await user.type(screen.getByLabelText('パスワード'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(onSignIn).toHaveBeenCalledWith({ email: 'hana@example.com', password: 'correct-horse', remember: false });
    await user.click(screen.getByRole('button', { name: 'メールアドレスを変える' }));
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('hana@example.com');
  });

  it('答えで、登録・組織の ID・ログインのリンクへ振り分け、失敗なら理由を読んでとどまる', async () => {
    const user = userEvent.setup();
    const onSso = vi.fn();
    const answers = [{ next: 'signUp' as const }, { next: 'sso' as const, provider: 'Okta' }, { next: 'link' as const }, { error: '少し時間をおいてください' }];
    let call = 0;
    renderInSite(
      <EmailFirstPage
        onContinue={() => answers[call++] ?? { next: 'password' }}
        onSignIn={vi.fn()}
        onSignUp={vi.fn()}
        onSso={onSso}
        onCode={vi.fn()}
        onResendLink={vi.fn()}
      />,
    );
    const go = async (email: string): Promise<void> => {
      const field = screen.getByLabelText('メールアドレス');
      await user.clear(field);
      await user.type(field, email);
      await user.click(screen.getByRole('button', { name: '続ける' }));
    };
    await go('new@example.com');
    expect(await screen.findByRole('heading', { level: 1, name: 'アカウントを作る' })).toBeInTheDocument();
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('new@example.com のアカウントはまだありません。このまま新しく作ります。');
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('new@example.com');
    await user.click(screen.getByRole('button', { name: 'メールアドレスを変える' }));
    await go('taro@corp.example.com');
    await user.click(await screen.findByRole('button', { name: 'Oktaで続ける' }));
    expect(onSso).toHaveBeenCalledWith('taro@corp.example.com', 'Okta');
    await user.click(screen.getByRole('button', { name: 'メールアドレスを変える' }));
    await go('link@example.com');
    expect(await screen.findByRole('heading', { level: 1, name: 'メールを確認してください' })).toBeInTheDocument();
    expect(screen.getByLabelText('確認コード')).toHaveAttribute('autocomplete', 'one-time-code');
    await user.click(screen.getByRole('button', { name: '別のメールアドレスを使う' }));
    await go('busy@example.com');
    expect(await screen.findByRole('alert')).toHaveTextContent('少し時間をおいてください');
    expect(screen.getByRole('heading', { level: 1, name: 'ログインまたは登録' })).toBeInTheDocument();
  });
});

describe('メールのリンクと確認コード / P-23', () => {
  it('送ったら見出しへフォーカスし、コードは桁がそろうと送り、違えば消して欄へ戻す。アドレスを変えて戻れる', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onCode = vi.fn().mockResolvedValueOnce({ error: true }).mockResolvedValueOnce(undefined);
    renderInSite(<MagicLinkPage onSend={onSend} onCode={onCode} sender="example.com" passwordHref="/login" />);
    expect(screen.getByRole('link', { name: 'パスワードでログイン' })).toHaveAttribute('href', '/login');
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(screen.getByRole('button', { name: 'ログイン用のメールを送る' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'メールを確認してください' })).toHaveFocus();
    expect(onSend).toHaveBeenCalledWith({ email: 'hana@example.com' });
    const code = screen.getByLabelText('確認コード');
    await user.type(code, '123456');
    expect(await screen.findByRole('alert')).toHaveTextContent('コードが違うか、有効期限が切れています。');
    expect(onCode).toHaveBeenCalledWith({ email: 'hana@example.com', code: '123456' });
    expect(code).toHaveValue('');
    expect(code).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '別のメールアドレスを使う' }));
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('hana@example.com');
  });
});

describe('メールアドレスだけの仮登録 / P-24', () => {
  it('規約に同意してメールアドレスだけで登録し、送った画面にリンクの期限・このあとの流れ・送り直し・届かないときの案内を出す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<QuickSignUpPage onSubmit={onSubmit} expiresIn="24 時間" steps={['メールのリンクを開く', 'お客様情報を入力する']} sender="example.com" />);
    await user.type(screen.getByLabelText('メールアドレス'), 'hana@example.com');
    await user.click(screen.getByRole('button', { name: '登録する' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: '利用規約とプライバシーポリシーに同意します' })).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('checkbox', { name: '利用規約とプライバシーポリシーに同意します' }));
    await user.click(screen.getByRole('button', { name: '登録する' }));
    expect(await screen.findByRole('heading', { level: 1, name: '仮登録が完了しました' })).toHaveFocus();
    expect(onSubmit).toHaveBeenCalledWith({ email: 'hana@example.com' });
    expect(document.querySelector('.g-auth-note')).toHaveTextContent('リンクの有効期限は 24 時間 です。');
    const steps = screen.getByRole('list', { name: 'このあとの流れ' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3);
    expect(within(steps).getByText('メールのリンクを開く').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: 'もう一度送る' })).toBeInTheDocument();
    expect(screen.getByText('メールが届かないとき')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'メールアドレスを変える' }));
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('hana@example.com');
  });

  it('同意の文は、リンクの間の「と」「に同意します」も文節に分ける（「同意しま／す」のように折らない）', () => {
    renderInSite(<QuickSignUpPage onSubmit={vi.fn()} />);
    const text = document.querySelector('.g-choice-text');
    expect(text).toHaveTextContent('利用規約とプライバシーポリシーに同意します');
    // 文字は、リンクの中か文節の箱の中にだけある（素の文字が残ると、ブラウザが字の間で折る）
    const bare = [...(text?.childNodes ?? [])].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    expect(bare).toEqual([]);
  });
});

describe('本登録の手順 / P-25', () => {
  function Wizard({ onSave = vi.fn(), onSubmit = vi.fn(), onSaveAndExit, defaultStep }: { onSave?: () => unknown; onSubmit?: () => unknown; onSaveAndExit?: (id: string) => void; defaultStep?: string }) {
    const [name, setName] = useState('');
    const steps: RegistrationStep[] = [
      {
        id: 'profile',
        title: 'お客様情報',
        content: (
          <label>
            氏名
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ),
        validate: () => (name ? null : '氏名を入力してください'),
        summary: [{ label: '氏名', value: name }],
      },
      { id: 'job', title: 'ご職業', content: <p>職業の欄</p>, optional: true, summary: [{ label: '職業', value: '会社員' }] },
      { id: 'agree', title: '同意', content: <p>同意の欄</p>, summary: [] },
    ];
    return (
      <RegistrationWizardPage
        steps={steps}
        onSave={onSave as () => undefined}
        onSubmit={onSubmit as () => undefined}
        onSaveAndExit={onSaveAndExit}
        defaultStep={defaultStep}
        done={<a href="/app">はじめる</a>}
      />
    );
  }

  it('進み具合を出し、validate の理由で止め、進むたびに保存して知らせる。任意の手順は飛ばせる', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderInSite(<Wizard onSave={onSave} />);
    const progress = screen.getByRole('list', { name: '登録の手順' });
    expect(within(progress).getAllByRole('listitem')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('氏名を入力してください');
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('氏名'), '山田 花子');
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'ご職業' })).toHaveFocus();
    expect(onSave).toHaveBeenCalledWith('profile');
    expect(screen.getByText('入力した内容を保存しました。')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'あとで入力する' }));
    expect(await screen.findByRole('heading', { level: 1, name: '同意' })).toBeInTheDocument();
  });

  it('確認の画面で手順ごとの内容を並べ、「〜を修正する」で戻って「確認に戻る」で帰る。登録したら済んだ画面', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderInSite(<Wizard onSubmit={onSubmit} defaultStep="profile" />);
    await user.type(screen.getByLabelText('氏名'), '山田 花子');
    await user.click(screen.getByRole('button', { name: '次へ' }));
    await user.click(await screen.findByRole('button', { name: '次へ' }));
    await user.click(await screen.findByRole('button', { name: '次へ' }));
    const review = await screen.findByRole('heading', { level: 1, name: '入力内容の確認' });
    expect(review).toHaveFocus();
    const profile = screen.getByRole('region', { name: 'お客様情報' });
    expect(within(profile).getByText('山田 花子')).toBeInTheDocument();
    await user.click(within(profile).getByRole('button', { name: 'お客様情報を修正する' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'お客様情報' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: '戻る' })).toBeNull();
    await user.type(screen.getByLabelText('氏名'), '子');
    await user.click(screen.getByRole('button', { name: '確認に戻る' }));
    expect(await screen.findByText('山田 花子子')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '登録する' }));
    expect(await screen.findByRole('heading', { level: 1, name: '登録が完了しました' })).toHaveFocus();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'はじめる' })).toBeInTheDocument();
  });

  it('途中から続けられ、「保存してあとで続ける」は保存してから呼ぶ。保存に失敗したら進まずに理由を読む', async () => {
    const user = userEvent.setup();
    const onSaveAndExit = vi.fn();
    const onSave = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce({ error: '保存できませんでした' });
    renderInSite(<Wizard defaultStep="job" onSave={onSave} onSaveAndExit={onSaveAndExit} />);
    expect(screen.getByRole('heading', { level: 1, name: 'ご職業' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '保存してあとで続ける' }));
    await vi.waitFor(() => expect(onSaveAndExit).toHaveBeenCalledWith('job'));
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('保存できませんでした');
    expect(screen.getByRole('heading', { level: 1, name: 'ご職業' })).toBeInTheDocument();
  });
});

describe('電話番号と SMS / P-26', () => {
  it('番号は書き方を問わず数字だけにそろえ、SMS を受け取れない番号には直し方の分かる文を出す。送ったらコードの画面', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onVerify = vi.fn();
    renderInSite(<PhoneSignInPage onSend={onSend} onVerify={onVerify} other={{ href: '/login', label: 'メールアドレスでログイン' }} />);
    const phone = screen.getByLabelText('携帯電話の番号');
    expect(phone).toHaveAttribute('autocomplete', 'tel');
    expect(phone).toHaveAccessibleDescription('ハイフンは無くても大丈夫です。');
    await user.type(phone, '03-1234-5678');
    await user.click(screen.getByRole('button', { name: '確認コードを送る' }));
    expect(phone).toHaveAccessibleDescription(expect.stringContaining('SMS を受け取れる携帯電話の番号（070・080・090 など）を入力してください'));
    expect(onSend).not.toHaveBeenCalled();
    await user.clear(phone);
    fireEvent.change(phone, { target: { value: '０９０ー１２３４ー５６７８' } });
    expect(phone).toHaveValue('09012345678');
    await user.click(screen.getByRole('button', { name: '確認コードを送る' }));
    expect(onSend).toHaveBeenCalledWith({ phone: '09012345678' });
    expect(await screen.findByRole('heading', { level: 1, name: '確認コードを入力' })).toHaveFocus();
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('09012345678 に SMS で送った 6 桁のコードを入力してください。');
    await user.type(screen.getByLabelText('確認コード'), '654321');
    expect(onVerify).toHaveBeenCalledWith({ phone: '09012345678', code: '654321' });
    await user.click(screen.getByRole('button', { name: '電話番号を変える' }));
    expect(screen.getByLabelText('携帯電話の番号')).toBeInTheDocument();
  });
});

describe('パスキー / P-27', () => {
  it('ログインのページに「パスキーでログイン」を出し、メールの欄からもパスキーを選べる（username webauthn）。失敗は理由を読む', async () => {
    const user = userEvent.setup();
    const onPasskey = vi.fn().mockResolvedValueOnce({ error: 'パスキーが見つかりません' });
    renderInSite(<SignInPage onSubmit={vi.fn()} onPasskey={onPasskey} />);
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('autocomplete', 'username webauthn');
    await user.click(screen.getByRole('button', { name: 'パスキーでログイン' }));
    expect(onPasskey).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('alert')).toHaveTextContent('パスキーが見つかりません');
  });

  it('作るかを尋ねる画面は良い点を言葉で並べ、「作る」と「あとで」を選べる。作れたら完了の画面の見出しへ', async () => {
    const user = userEvent.setup();
    const onLater = vi.fn();
    const onCreate = vi.fn();
    renderInSite(<PasskeyPromptPage onCreate={onCreate} onLater={onLater} continueHref="/app" />);
    expect(screen.getByRole('heading', { level: 1, name: 'パスキーを作りませんか' })).toBeInTheDocument();
    expect(within(document.querySelector<HTMLElement>('.g-auth-benefits')!).getAllByRole('listitem')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'あとで' }));
    expect(onLater).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'パスキーを作る' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'パスキーを作りました' })).toHaveFocus();
    expect(screen.getByRole('link', { name: '続ける' })).toHaveAttribute('href', '/app');
  });
});

describe('アカウントの選択 / P-28', () => {
  it('アカウントごとに名前とアドレスを持つボタンで選び（アドレスは「@」の後と「.」の前でだけ折る）、外したら知らせて次の行へフォーカスを移す', async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    const accounts = [
      { id: 'a', name: '山田 花子', email: 'hana@example.com' },
      { id: 'b', name: '佐藤 太郎', email: 'taro@example.com' },
    ];
    function Chooser() {
      const [list, setList] = useState(accounts);
      return <AccountChooserPage accounts={list} onChoose={onChoose} onUseAnother={vi.fn()} onRemove={(account) => setList((rows) => rows.filter((row) => row.id !== account.id))} />;
    }
    renderInSite(<Chooser />);
    const list = screen.getByRole('list', { name: 'アカウント' });
    // 「hana@｜example｜.com」。文字列は元のまま（<wbr> は読み上げに混ざらない）
    const address = list.querySelector('.g-account-email');
    expect(address).toHaveTextContent('hana@example.com');
    expect(address?.querySelectorAll('wbr[aria-hidden="true"]')).toHaveLength(2);
    await user.click(within(list).getByRole('button', { name: /山田 花子.*hana@example.com/ }));
    expect(onChoose).toHaveBeenCalledWith(accounts[0]);
    await user.click(screen.getByRole('button', { name: 'hana@example.com をこの端末から外す' }));
    expect(screen.getByRole('status')).toHaveTextContent('hana@example.com をこの端末から外しました。');
    await vi.waitFor(() => expect(screen.getByRole('button', { name: /佐藤 太郎/ })).toHaveFocus());
    expect(screen.getByRole('button', { name: '別のアカウントを使う' })).toBeInTheDocument();
  });
});

describe('本人確認とログインの期限切れ / P-29', () => {
  it('大事な操作の前はパスワードだけを聞き、違えば消して欄へ戻す。確かめられたら閉じる', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const onConfirm = vi.fn().mockResolvedValueOnce({ error: true }).mockResolvedValueOnce(undefined);
    renderInSite(<ReauthDialog open onOpenChange={onOpenChange} email="hana@example.com" onConfirm={onConfirm} onSuccess={onSuccess} />);
    const dialog = screen.getByRole('dialog', { name: '本人確認' });
    expect(within(dialog).getByText('hana@example.com')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    const password = within(dialog).getByLabelText('パスワード');
    await user.type(password, 'wrong');
    await user.click(within(dialog).getByRole('button', { name: '確認する' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('パスワードが違います。');
    expect(password).toHaveValue('');
    await user.type(password, 'correct-horse');
    await user.click(within(dialog).getByRole('button', { name: '確認する' }));
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'programmatic');
  });

  it('期限切れは閉じるボタンと Esc で閉じず、入力を残したままログインし直すか、別のアカウントでログインする', () => {
    const onOpenChange = vi.fn();
    renderInSite(<ReauthDialog open onOpenChange={onOpenChange} reason="expired" email="hana@example.com" onConfirm={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'もう一度ログインしてください' });
    expect(within(dialog).queryByRole('button', { name: '閉じる' })).toBeNull();
    expect(within(dialog).getByText(/入力中の内容はそのまま残っています/)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('link', { name: '別のアカウントでログイン' })).toHaveAttribute('href', '/login');
  });
});

describe('購入の後のアカウント作成 / P-30', () => {
  it('注文のアドレスでパスワードを決めるだけで作り、作れたら知らせる。いまは作らないこともできる', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onDismiss = vi.fn();
    renderInSite(<GuestAccountCard email="hana@example.com" onCreate={onCreate} onDismiss={onDismiss} />);
    const card = screen.getByRole('region', { name: 'アカウントを作りませんか' });
    expect(card).toHaveTextContent('hana@example.com のアカウントを作れます');
    expect(card.querySelector('input[autocomplete="username"]')).toHaveValue('hana@example.com');
    const password = within(card).getByLabelText('パスワード');
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    await user.click(within(card).getByRole('button', { name: 'いまは作らない' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await user.type(password, 'correct-horse-battery');
    await user.click(within(card).getByRole('button', { name: 'アカウントを作る' }));
    expect(onCreate).toHaveBeenCalledWith({ password: 'correct-horse-battery' });
    expect(await screen.findByRole('heading', { level: 2, name: 'アカウントを作りました' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('次回から、このメールアドレスとパスワードでログインできます。');
  });
});

describe('D-11 ログインと登録の形を変えたものの data-*', () => {
  it('どのテンプレートも data-* を外側の要素（ページ・窓・カード）へ渡す', () => {
    const cases: Record<string, () => ReactNode> = {
      AuthDialog: () => <AuthDialog open onOpenChange={vi.fn()} onSignIn={vi.fn()} data-testid="probe" />,
      EmailFirstPage: () => <EmailFirstPage onContinue={() => ({ next: 'password' })} onSignIn={vi.fn()} data-testid="probe" />,
      MagicLinkPage: () => <MagicLinkPage onSend={vi.fn()} onCode={vi.fn()} data-testid="probe" />,
      PhoneSignInPage: () => <PhoneSignInPage onSend={vi.fn()} onVerify={vi.fn()} data-testid="probe" />,
      QuickSignUpPage: () => <QuickSignUpPage onSubmit={vi.fn()} data-testid="probe" />,
      RegistrationWizardPage: () => <RegistrationWizardPage steps={[{ id: 'a', title: 'A', content: null }]} onSubmit={vi.fn()} data-testid="probe" />,
      GuestAccountCard: () => <GuestAccountCard email="a@example.com" onCreate={vi.fn()} data-testid="probe" />,
      PasskeyPromptPage: () => <PasskeyPromptPage onCreate={vi.fn()} onLater={vi.fn()} data-testid="probe" />,
      AccountChooserPage: () => <AccountChooserPage accounts={[]} onChoose={vi.fn()} onUseAnother={vi.fn()} data-testid="probe" />,
      ReauthDialog: () => <ReauthDialog open onOpenChange={vi.fn()} email="a@example.com" onConfirm={vi.fn()} data-testid="probe" />,
    };
    const exported = [authDialog, passwordless, registration, session]
      .flatMap((module) => Object.entries(module))
      .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
      .map(([name]) => name)
      .sort();
    expect(Object.keys(cases).sort()).toEqual(exported);
    for (const [name, renderCase] of Object.entries(cases)) {
      const { unmount } = renderInSite(renderCase());
      expect(screen.getByTestId('probe'), name).toBeInTheDocument();
      unmount();
    }
    act(() => undefined);
  });
});
