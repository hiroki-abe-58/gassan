import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalCheckbox } from '../choices';
import { Divider } from '../display';
import { ModalEmailInput } from '../email-input';
import { ModalField } from '../fields';
import { ModalCodeInput, ModalInput, ModalPasswordInput } from '../inputs';
import { ModalPasswordStrength } from '../password-strength';
import { usePhrase } from '../phrase';
import {
  ConsentField,
  ErrorSummary,
  FormError,
  looksLikeEmail,
  runAction,
  useCooldown,
  useTemplateForm,
  type FormErrors,
  type SubmitResult,
} from './form';
import { SiteLink, useSite } from './site';

/*
 * ログインと登録のページ（P-02）と、その形を変えたもの（窓・メールを先に聞く・パスワードなし。P-21〜P-30）が
 * 共有する部品。フォームはページにも窓にも置けるように、外枠（見出し・カード・窓）を持たない。
 */

/** 外部の ID でのログイン（Google・GitHub・SAML など）。 */
export interface AuthProvider {
  /** 識別子（'google'）。 */
  id: string;
  /** 表示名（「Google」）。ボタンは「Google で続ける」になる。 */
  name: string;
  /** 印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
  onClick: () => void;
}

/** パスキーでログインする（WebAuthn の呼び出しは利用側）。失敗なら { error } を返す。 */
export type PasskeyHandler = () => SubmitResult | Promise<SubmitResult>;

/**
 * 外部の ID とパスキーのボタンと、フォームとの「または」の区切り。どちらも無ければ何も描かない。
 * パスキーが失敗したら理由を割り込ませて読み、済んだら onPasskeyDone を呼ぶ（窓を閉じるなど）。
 */
export function ProviderButtons({
  providers,
  onPasskey,
  onPasskeyDone,
}: {
  providers?: readonly AuthProvider[];
  onPasskey?: PasskeyHandler;
  onPasskeyDone?: () => void;
}): ReactNode {
  const { labels } = useSite();
  const [error, setError] = useState<ReactNode>(null);
  if ((!providers || providers.length === 0) && !onPasskey) return null;
  return (
    <>
      <div className="g-auth-providers">
        <FormError>{error}</FormError>
        {onPasskey ? (
          <Button
            block
            onAction={async () => {
              const failure = await runAction(onPasskey, labels.common.submitFailed);
              setError(failure);
              if (!failure) onPasskeyDone?.();
            }}
          >
            {labels.passkey.signIn}
          </Button>
        ) : null}
        {providers?.map((provider) => (
          <Button key={provider.id} block iconStart={provider.icon} onClick={provider.onClick}>
            {labels.common.continueWith(provider.name)}
          </Button>
        ))}
      </div>
      <Divider label={labels.common.or} />
    </>
  );
}

/** 「アカウントをお持ちでない方は アカウントを作る」の 1 行。lead が無ければリンクだけ。 */
function SwitchLine({ lead, href, label }: { lead?: string; href: string; label: string }): ReactNode {
  const phrase = usePhrase();
  const link = <SiteLink href={href}>{phrase(label)}</SiteLink>;
  return lead ? (
    <>
      {phrase(lead)} {link}
    </>
  ) : (
    link
  );
}

/** 行き先があるときだけ、カードの下の 1 行を作る。 */
export const switchLine = (lead: string | undefined, href: string | undefined, label: string): ReactNode =>
  href ? <SwitchLine lead={lead} href={href} label={label} /> : undefined;

/**
 * 画面が切り替わったら（key が変わったら）見出しへフォーカスを移す。読み上げに切り替わりを伝えるため。
 * 開いた直後は奪わない。key は画面の名前（送った後か・何番目の手順か）。
 */
export function useFocusOnChange(key: string | number | boolean) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    headingRef.current?.focus();
  }, [key]);
  return headingRef;
}

/**
 * 送った後の画面の、送り直すボタンと待ち時間。画面に来た時点で 1 通送ってあるので、最初から待たせる。
 * 待つ間のボタンは aria-disabled（フォーカスは止まり、待ち時間を説明として読む）。待ち時間は 1 秒ごとに
 * 変わるので読み上げの領域に入れず、送り直した結果だけを role="status" で伝える。
 */
export function Resend({ onResend, resendAfter }: { onResend: () => SubmitResult | Promise<SubmitResult>; resendAfter: number }): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const waitId = `${useId()}-wait`;
  const { remaining, start } = useCooldown(resendAfter, true);
  const [status, setStatus] = useState('');
  const waiting = remaining > 0;
  return (
    <div className="g-auth-resend">
      <Button
        block
        aria-disabled={waiting || undefined}
        aria-describedby={waiting ? waitId : undefined}
        onAction={async () => {
          setStatus('');
          try {
            const result = await onResend();
            if (result && result.error) {
              setStatus(typeof result.error === 'string' ? result.error : labels.common.submitFailed);
              return;
            }
          } catch (error) {
            console.error('[gassan] onResend rejected.', error);
            setStatus(labels.common.submitFailed);
            return;
          }
          setStatus(labels.common.resent);
          start();
        }}
      >
        {labels.common.resend}
      </Button>
      <div className="g-auth-hint">
        <p role="status">{status ? phrase(status) : null}</p>
        {waiting ? <p id={waitId}>{phrase(labels.common.resendIn(remaining))}</p> : null}
      </div>
    </div>
  );
}

/**
 * 送ったメールが届かないときの案内（迷惑メールのフォルダ・届くまでの時間・打ち間違い・携帯会社のメールの受信設定）。
 * 開け閉めできる details にして、困った人だけが開く。sender（送り主）を渡すと、携帯会社のメールの受信設定にも触れる。
 */
export function NotReceived({ sender }: { sender?: string }): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const t = labels.notReceived;
  const tips = [t.spam, t.wait, t.typo, ...(sender ? [t.carrier(sender)] : [])];
  return (
    <details className="g-auth-tips">
      <summary>{phrase(t.title)}</summary>
      <ul>
        {tips.map((tip) => (
          <li key={tip}>{phrase(tip)}</li>
        ))}
      </ul>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* フォーム                                                                    */
/* -------------------------------------------------------------------------- */

export interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignInFormProps {
  onSubmit: (values: SignInValues) => SubmitResult | Promise<SubmitResult>;
  /** onSubmit が error を返さずに終わったとき（窓を閉じるなど）。 */
  onSuccess?: (values: SignInValues) => void;
  providers?: readonly AuthProvider[];
  onPasskey?: PasskeyHandler;
  remember: boolean;
  defaultEmail: string;
  /** 「パスワードを忘れた場合」（ページではリンク、窓では再設定へ切り替えるボタン）。 */
  forgot?: ReactNode;
  /** メールアドレスを打ったとき（窓でログインと登録を切り替えても、打ったアドレスを引き継ぐため）。 */
  onEmailChange?: (email: string) => void;
}

/**
 * ログインのフォーム。P-02。
 *
 * メールアドレス（autocomplete="username"。パスキーがあれば "username webauthn" で、欄からパスキーを選べる）と
 * パスワード（current-password）。メールアドレスは打ち間違いの候補を出す（I-30）。失敗の理由はどちらが違うかを明かさない。
 */
export function SignInForm({ onSubmit, onSuccess, providers, onPasskey, remember, defaultEmail, forgot, onEmailChange }: SignInFormProps): ReactNode {
  const { labels } = useSite();
  const { common, signIn } = labels;
  const form = useTemplateForm<SignInValues>({
    initial: { email: defaultEmail, password: '', remember: false },
    validate: ({ email, password }) => {
      const errors: FormErrors<SignInValues> = {};
      if (!email.trim()) errors.email = common.requiredField(common.email);
      else if (!looksLikeEmail(email)) errors.email = common.invalidEmail;
      if (!password) errors.password = common.requiredField(common.password);
      return errors;
    },
    onSubmit,
    onSuccess,
    submitFailed: common.submitFailed,
    defaultError: signIn.failed,
  });
  return (
    <>
      <ProviderButtons providers={providers} onPasskey={onPasskey} />
      <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('email')} label={common.email} required requiredBadge={false} error={form.errors.email}>
          {(control) => (
            <ModalEmailInput
              {...control}
              name="email"
              autoComplete={onPasskey ? 'username webauthn' : 'username'}
              carrierNotice={false}
              value={form.values.email}
              onChange={(event) => {
                form.set('email', event.target.value);
                onEmailChange?.(event.target.value);
              }}
            />
          )}
        </ModalField>
        <ModalField id={form.idOf('password')} label={common.password} required requiredBadge={false} error={form.errors.password}>
          {(control) => (
            <ModalPasswordInput
              {...control}
              name="password"
              autoComplete="current-password"
              value={form.values.password}
              onChange={(event) => form.set('password', event.target.value)}
            />
          )}
        </ModalField>
        {remember || forgot ? (
          <div className="g-auth-row">
            {remember ? (
              <ModalCheckbox name="remember" checked={form.values.remember} onCheckedChange={(checked) => form.set('remember', checked)}>
                {signIn.remember}
              </ModalCheckbox>
            ) : null}
            {forgot}
          </div>
        ) : null}
        <Button type="submit" variant="primary" block loading={form.pending}>
          {signIn.submit}
        </Button>
      </form>
    </>
  );
}

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
  agree: boolean;
}

export interface SignUpFormProps {
  onSubmit: (values: SignUpValues) => SubmitResult | Promise<SubmitResult>;
  onSuccess?: (values: SignUpValues) => void;
  providers?: readonly AuthProvider[];
  nameField: boolean;
  consent: boolean;
  passwordMinLength: number;
  defaultEmail?: string;
  /** 確認のメールの送り主。携帯会社のメールへの注意に入れる（I-30）。 */
  sender?: string;
  onEmailChange?: (email: string) => void;
}

/**
 * 登録のフォーム。P-02。
 *
 * 名前（autocomplete="name"）・メールアドレス（email。打ち間違いの候補と携帯会社のメールへの注意）・
 * パスワード（new-password。強さと条件を説明として結ぶ）・規約への同意。送信するまでは責めない。
 */
export function SignUpForm({
  onSubmit,
  onSuccess,
  providers,
  nameField,
  consent,
  passwordMinLength,
  defaultEmail = '',
  sender,
  onEmailChange,
}: SignUpFormProps): ReactNode {
  const { labels } = useSite();
  const { common, signUp } = labels;
  const form = useTemplateForm<SignUpValues>({
    initial: { name: '', email: defaultEmail, password: '', agree: false },
    validate: ({ name, email, password, agree }) => {
      const errors: FormErrors<SignUpValues> = {};
      if (nameField && !name.trim()) errors.name = common.requiredField(common.name);
      if (!email.trim()) errors.email = common.requiredField(common.email);
      else if (!looksLikeEmail(email)) errors.email = common.invalidEmail;
      if (!password) errors.password = common.requiredField(common.password);
      else if ([...password].length < passwordMinLength) errors.password = common.passwordTooShort(passwordMinLength);
      if (consent && !agree) errors.agree = signUp.agreeRequired;
      return errors;
    },
    onSubmit,
    onSuccess,
    submitFailed: common.submitFailed,
  });
  const strengthId = `${form.idOf('password')}-strength`;

  return (
    <>
      <ProviderButtons providers={providers} />
      <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        {nameField ? (
          <ModalField id={form.idOf('name')} label={common.name} required requiredBadge={false} error={form.errors.name}>
            {(control) => (
              <ModalInput {...control} name="name" autoComplete="name" value={form.values.name} onChange={(event) => form.set('name', event.target.value)} />
            )}
          </ModalField>
        ) : null}
        <ModalField id={form.idOf('email')} label={common.email} required requiredBadge={false} error={form.errors.email}>
          {(control) => (
            <ModalEmailInput
              {...control}
              name="email"
              sender={sender}
              value={form.values.email}
              onChange={(event) => {
                form.set('email', event.target.value);
                onEmailChange?.(event.target.value);
              }}
            />
          )}
        </ModalField>
        <ModalField id={form.idOf('password')} label={common.password} required requiredBadge={false} error={form.errors.password}>
          {(control) => (
            <>
              <ModalPasswordInput
                {...control}
                aria-describedby={[control['aria-describedby'], strengthId].filter(Boolean).join(' ')}
                name="password"
                autoComplete="new-password"
                value={form.values.password}
                onChange={(event) => form.set('password', event.target.value)}
              />
              <ModalPasswordStrength id={strengthId} value={form.values.password} minLength={passwordMinLength} />
            </>
          )}
        </ModalField>
        {consent ? (
          <ConsentField id={form.idOf('agree')} checked={form.values.agree} onCheckedChange={(checked) => form.set('agree', checked)} error={form.errors.agree}>
            <AgreeText />
          </ConsentField>
        ) : null}
        <Button type="submit" variant="primary" block loading={form.pending}>
          {signUp.submit}
        </Button>
      </form>
    </>
  );
}

export interface EmailFormProps {
  onSubmit: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  /** 送れたとき。送った先を受け取る（前後の空白は落としてある）。 */
  onSent: (email: string) => void;
  /** 送信のボタンの文字。 */
  submit: string;
  defaultEmail?: string;
  /** メールアドレスの autocomplete。既定 "email"。 */
  autoComplete?: string;
  /** 確認のメールの送り主。渡すと携帯会社のメールへの注意を出す（I-30）。 */
  sender?: string;
  /** 規約とプライバシーポリシーへの同意を求める（仮登録）。 */
  consent?: boolean;
}

type EmailFormValues = { email: string; agree: boolean };

/**
 * メールアドレスを 1 つ聞いて送るフォーム（パスワードの再設定・ログインのリンク・仮登録・メールを先に聞くログイン）。P-04。
 */
export function EmailForm({ onSubmit, onSent, submit, defaultEmail = '', autoComplete = 'email', sender, consent = false }: EmailFormProps): ReactNode {
  const { labels } = useSite();
  const { common, signUp } = labels;
  const form = useTemplateForm<EmailFormValues>({
    initial: { email: defaultEmail, agree: false },
    validate: ({ email, agree }) => {
      const errors: FormErrors<EmailFormValues> = {};
      if (!email.trim()) errors.email = common.requiredField(common.email);
      else if (!looksLikeEmail(email)) errors.email = common.invalidEmail;
      if (consent && !agree) errors.agree = signUp.agreeRequired;
      return errors;
    },
    onSubmit: ({ email }) => onSubmit({ email: email.trim() }),
    onSuccess: ({ email }) => onSent(email.trim()),
    submitFailed: common.submitFailed,
  });
  return (
    <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
      <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
      <FormError>{form.formError}</FormError>
      <ModalField id={form.idOf('email')} label={common.email} required requiredBadge={false} error={form.errors.email}>
        {(control) => (
          <ModalEmailInput
            {...control}
            name="email"
            autoComplete={autoComplete}
            sender={sender}
            carrierNotice={sender !== undefined}
            value={form.values.email}
            onChange={(event) => form.set('email', event.target.value)}
          />
        )}
      </ModalField>
      {consent ? (
        <ConsentField id={form.idOf('agree')} checked={form.values.agree} onCheckedChange={(checked) => form.set('agree', checked)} error={form.errors.agree}>
          <AgreeText />
        </ConsentField>
      ) : null}
      <Button type="submit" variant="primary" block loading={form.pending}>
        {submit}
      </Button>
    </form>
  );
}

export interface PasswordFormProps {
  /** ログインするアカウント（変えられない）。パスワード管理ソフトに渡すため、隠した username の欄に入れる。 */
  email: string;
  onSubmit: (values: { password: string }) => SubmitResult | Promise<SubmitResult>;
  onSuccess?: () => void;
  submit: string;
  /** onSubmit が error: true を返したときの文。 */
  failed: string;
  /** 「パスワードを忘れた場合」。 */
  forgot?: ReactNode;
}

/**
 * アカウントが決まっていて、パスワードだけを聞くフォーム（メールを先に聞くログイン・本人確認・ログインの期限切れ）。
 * メールアドレスは隠した username の欄（hidden）に入れ、パスワード管理ソフトがどのアカウントか分かるようにする。
 * 違っていたらパスワードを消して欄へ戻す。
 */
export function PasswordForm({ email, onSubmit, onSuccess, submit, failed, forgot }: PasswordFormProps): ReactNode {
  const { labels } = useSite();
  const { common } = labels;
  const form = useTemplateForm<{ password: string }>({
    initial: { password: '' },
    validate: ({ password }) => (password ? {} : { password: common.requiredField(common.password) }),
    onSubmit,
    onSuccess,
    submitFailed: common.submitFailed,
    defaultError: failed,
    onFailure: () => {
      form.reset({ password: '' });
      document.getElementById(form.idOf('password'))?.focus();
    },
  });
  return (
    <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
      <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
      <FormError>{form.formError}</FormError>
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <ModalField id={form.idOf('password')} label={common.password} required requiredBadge={false} error={form.errors.password}>
        {(control) => (
          <ModalPasswordInput
            {...control}
            name="password"
            autoComplete="current-password"
            value={form.values.password}
            onChange={(event) => form.set('password', event.target.value)}
          />
        )}
      </ModalField>
      {forgot ? <div className="g-auth-row">{forgot}</div> : null}
      <Button type="submit" variant="primary" block loading={form.pending}>
        {submit}
      </Button>
    </form>
  );
}

export interface CodeFormProps {
  label: string;
  /** 桁数。既定 6。 */
  length?: number;
  onSubmit: (values: { code: string }) => SubmitResult | Promise<SubmitResult>;
  onSuccess?: () => void;
  submit: string;
  failed: string;
}

/**
 * 確認コードのフォーム（ログインのリンクのメール・SMS）。1 つの欄（one-time-code。SMS の自動入力と貼り付けが効く）で、
 * 桁がそろうと送る。違えば消して欄へ戻す。P-23 / P-26。
 */
export function CodeForm({ label, length = 6, onSubmit, onSuccess, submit, failed }: CodeFormProps): ReactNode {
  const { labels } = useSite();
  const { common } = labels;
  const form = useTemplateForm<{ code: string }>({
    initial: { code: '' },
    validate: ({ code }) => (code.length === length ? {} : { code: common.requiredField(label) }),
    onSubmit,
    onSuccess,
    submitFailed: common.submitFailed,
    defaultError: failed,
    onFailure: () => {
      form.reset({ code: '' });
      document.getElementById(form.idOf('code'))?.focus();
    },
  });
  return (
    <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
      <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
      <FormError>{form.formError}</FormError>
      <ModalField id={form.idOf('code')} label={label} required requiredBadge={false} error={form.errors.code}>
        {(control) => (
          <ModalCodeInput
            {...control}
            length={length}
            name="code"
            value={form.values.code}
            onValueChange={(code) => form.set('code', code)}
            onComplete={(code) => form.submitWith({ code })}
          />
        )}
      </ModalField>
      <Button type="submit" variant="primary" block loading={form.pending}>
        {submit}
      </Button>
    </form>
  );
}

/** 「アカウントをお持ちでない方は」のような前置きと、窓や手順の中で画面を切り替えるボタン（リンクの見た目）。 */
export function SwitchButton({ lead, label, onClick }: { lead?: string; label: string; onClick: () => void }): ReactNode {
  const phrase = usePhrase();
  return (
    <p className="g-auth-switch">
      {lead ? <>{phrase(lead)} </> : null}
      <button type="button" className="g-auth-link" onClick={onClick}>
        {phrase(label)}
      </button>
    </p>
  );
}

/**
 * 「利用規約とプライバシーポリシーに同意します」。文書のリンクは SiteProvider の links から（無ければ文字だけ）。
 * チェックボックスの phrase は部品の要素の中までは入らないので、リンクの間の文（「と」「に同意します」）はここで文節に分ける。
 */
function AgreeText(): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const { common, signUp } = labels;
  const docLink = (href: string | undefined, label: string): ReactNode => (href ? <SiteLink href={href}>{phrase(label)}</SiteLink> : phrase(label));
  return phrase(signUp.agree(docLink(links.terms, common.terms), docLink(links.privacy, common.privacy)));
}
