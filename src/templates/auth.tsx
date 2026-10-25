import { useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalCheckbox } from '../choices';
import { ModalAlert, ModalField } from '../fields';
import { ModalCodeInput, ModalPasswordInput } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { ModalPasswordStrength } from '../password-strength';
import { usePhrase } from '../phrase';
import {
  EmailForm,
  Resend,
  SignInForm,
  SignUpForm,
  switchLine,
  useFocusOnChange,
  type AuthProvider,
  type PasskeyHandler,
  type SignInValues,
  type SignUpValues,
} from './auth-parts';
import { ErrorSummary, FormError, useTemplateForm, type FormErrors, type SubmitResult } from './form';
import { AuthLayout } from './layouts';
import { SiteButtonLink, SiteLink, useSite } from './site';

export type { AuthProvider, PasskeyHandler, SignInValues, SignUpValues } from './auth-parts';

/** テンプレートの props の共通部分。見出しと説明は既定の文言を上書きできる。 */
interface PageText extends DataAttributes {
  title?: ReactNode;
  description?: ReactNode;
  /** 器が広いときにカードの横に並べる面（製品の紹介など）。 */
  aside?: ReactNode;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* SignInPage                                                                  */
/* -------------------------------------------------------------------------- */

export interface SignInPageProps extends PageText {
  /** 送信したとき。失敗なら { error: true }（既定の文）か { error: '文' } を返す。入力は消さない。 */
  onSubmit: (values: SignInValues) => SubmitResult | Promise<SubmitResult>;
  providers?: readonly AuthProvider[];
  /** 「ログインしたままにする」を出すか。既定 true。 */
  remember?: boolean;
  defaultEmail?: string;
  /** フォームの上に出す知らせ（「パスワードを変えました。新しいパスワードでログインしてください」など）。 */
  notice?: ReactNode;
  /** パスキーでログインする（P-27）。渡すと「パスキーでログイン」を出し、メールの欄からもパスキーを選べるようにする。 */
  onPasskey?: PasskeyHandler;
}

/**
 * ログイン。P-02。
 *
 * メールアドレス（autocomplete="username"）とパスワード（current-password）。パスワード管理ソフトと自動入力が効く。
 * 失敗の理由はどちらが違うかを明かさない（既定の文）。送信の間は二度押しできず、失敗しても入力は消さない。
 */
export function SignInPage({
  onSubmit,
  providers,
  remember = true,
  defaultEmail = '',
  notice,
  onPasskey,
  title,
  description,
  aside,
  className,
  ...rest
}: SignInPageProps): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const { common, signIn } = labels;
  return (
    <AuthLayout
      {...domPassthrough(rest, 'SignInPage')}
      className={className}
      title={title ?? signIn.title}
      description={description ?? signIn.description}
      aside={aside}
      footer={switchLine(signIn.noAccount, links.signUp, common.signUp)}
    >
      {notice ? <ModalAlert tone="info">{notice}</ModalAlert> : null}
      <SignInForm
        onSubmit={onSubmit}
        providers={providers}
        onPasskey={onPasskey}
        remember={remember}
        defaultEmail={defaultEmail}
        forgot={
          links.forgotPassword ? (
            <SiteLink href={links.forgotPassword} className="g-auth-link">
              {phrase(signIn.forgot)}
            </SiteLink>
          ) : null
        }
      />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* SignUpPage                                                                  */
/* -------------------------------------------------------------------------- */

export interface SignUpPageProps extends PageText {
  onSubmit: (values: SignUpValues) => SubmitResult | Promise<SubmitResult>;
  providers?: readonly AuthProvider[];
  /** 名前の欄を出すか。既定 true。 */
  nameField?: boolean;
  /** 規約への同意の欄を出すか。既定 true（規約とプライバシーポリシーのリンクは SiteProvider の links から）。 */
  consent?: boolean;
  /** パスワードの最短の長さ。既定 8。 */
  passwordMinLength?: number;
  /** 確認のメールの送り主（「example.com」）。携帯会社のメールへの注意に入れる（I-30）。 */
  sender?: string;
}

/**
 * アカウントの作成。P-02。
 *
 * 名前（autocomplete="name"）・メールアドレス（email。打ち間違いの候補と携帯会社のメールへの注意）・
 * パスワード（new-password。強さと条件を説明として結ぶ）・規約への同意。パスワードは打ちながら強さが分かり、送信するまでは責めない。
 */
export function SignUpPage({
  onSubmit,
  providers,
  nameField = true,
  consent = true,
  passwordMinLength = 8,
  sender,
  title,
  description,
  aside,
  className,
  ...rest
}: SignUpPageProps): ReactNode {
  const { labels, links } = useSite();
  const { common, signUp } = labels;
  return (
    <AuthLayout
      {...domPassthrough(rest, 'SignUpPage')}
      className={className}
      title={title ?? signUp.title}
      description={description ?? signUp.description}
      aside={aside}
      footer={switchLine(signUp.hasAccount, links.signIn, common.signIn)}
    >
      <SignUpForm
        onSubmit={onSubmit}
        providers={providers}
        nameField={nameField}
        consent={consent}
        passwordMinLength={passwordMinLength}
        sender={sender}
      />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* ForgotPasswordPage                                                          */
/* -------------------------------------------------------------------------- */

export interface ForgotPasswordPageProps extends PageText {
  /** 再設定のメールを送る。登録の有無にかかわらず同じ画面に進む（有無を明かさない。P-04）。 */
  onSubmit: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  /** 送り直すまでの待ち時間（秒）。既定 60。 */
  resendAfter?: number;
}

/**
 * パスワードの再設定のメールを送る。P-04。
 *
 * 送ったら「メールを確認してください」に切り替え、見出しへフォーカスを移す。登録されていないアドレスでも
 * 同じ画面に進む（アカウントの有無を明かさない）。待ち時間の後に送り直せる。
 */
export function ForgotPasswordPage({ onSubmit, resendAfter = 60, title, description, aside, className, ...rest }: ForgotPasswordPageProps): ReactNode {
  const { labels, links } = useSite();
  const { common, forgotPassword } = labels;
  const [sentTo, setSentTo] = useState<string | null>(null);
  const headingRef = useFocusOnChange(sentTo !== null);
  const back = switchLine(undefined, links.signIn, common.backToSignIn);
  const data = domPassthrough(rest, 'ForgotPasswordPage');

  if (sentTo !== null) {
    return (
      <AuthLayout
        {...data}
        className={className}
        headingRef={headingRef}
        title={forgotPassword.sentTitle}
        description={forgotPassword.sentDescription(sentTo)}
        aside={aside}
        footer={back}
      >
        <Resend onResend={() => onSubmit({ email: sentTo })} resendAfter={resendAfter} />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      {...data}
      className={className}
      title={title ?? forgotPassword.title}
      description={description ?? forgotPassword.description}
      aside={aside}
      footer={back}
    >
      <EmailForm onSubmit={onSubmit} onSent={setSentTo} submit={forgotPassword.submit} />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* ResetPasswordPage                                                           */
/* -------------------------------------------------------------------------- */

export interface ResetPasswordPageProps extends PageText {
  onSubmit: (values: { password: string }) => SubmitResult | Promise<SubmitResult>;
  /** リンクの有効期限が切れているとき。もう一度メールを送る案内だけを出す。 */
  expired?: boolean;
  passwordMinLength?: number;
}

/**
 * 新しいパスワードを決める。P-04。
 *
 * 新しいパスワード（new-password。強さを説明として結ぶ）と確認。変えたら完了の画面へ切り替え、見出しへフォーカスを移す。
 * リンクの期限が切れていれば、再設定のメールを送り直す案内を出す。
 */
export function ResetPasswordPage({
  onSubmit,
  expired = false,
  passwordMinLength = 8,
  title,
  description,
  aside,
  className,
  ...rest
}: ResetPasswordPageProps): ReactNode {
  const { labels, links } = useSite();
  const { common, resetPassword } = labels;
  const [done, setDone] = useState(false);
  const headingRef = useFocusOnChange(done);
  const form = useTemplateForm<{ password: string; confirm: string }>({
    initial: { password: '', confirm: '' },
    validate: ({ password, confirm }) => {
      const errors: FormErrors<{ password: string; confirm: string }> = {};
      if (!password) errors.password = common.requiredField(common.newPassword);
      else if ([...password].length < passwordMinLength) errors.password = common.passwordTooShort(passwordMinLength);
      if (!confirm) errors.confirm = common.confirmRequired;
      else if (confirm !== password) errors.confirm = common.passwordMismatch;
      return errors;
    },
    onSubmit: ({ password }) => onSubmit({ password }),
    onSuccess: () => setDone(true),
    submitFailed: common.submitFailed,
  });
  const strengthId = `${form.idOf('password')}-strength`;
  const layout = { ...domPassthrough(rest, 'ResetPasswordPage'), className, aside };

  if (expired) {
    return (
      <AuthLayout {...layout} title={resetPassword.expiredTitle} description={resetPassword.expiredDescription}>
        {links.forgotPassword ? (
          <SiteButtonLink href={links.forgotPassword} variant="primary" block>
            {resetPassword.requestAgain}
          </SiteButtonLink>
        ) : null}
      </AuthLayout>
    );
  }
  if (done) {
    return (
      <AuthLayout {...layout} headingRef={headingRef} title={resetPassword.doneTitle} description={resetPassword.doneDescription}>
        {links.signIn ? (
          <SiteButtonLink href={links.signIn} variant="primary" block>
            {common.signIn}
          </SiteButtonLink>
        ) : null}
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} title={title ?? resetPassword.title} description={description ?? resetPassword.description}>
      <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('password')} label={common.newPassword} required requiredBadge={false} error={form.errors.password}>
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
        <ModalField id={form.idOf('confirm')} label={common.confirmPassword} required requiredBadge={false} error={form.errors.confirm}>
          {(control) => (
            <ModalPasswordInput
              {...control}
              name="confirm"
              autoComplete="new-password"
              value={form.values.confirm}
              onChange={(event) => form.set('confirm', event.target.value)}
            />
          )}
        </ModalField>
        <Button type="submit" variant="primary" block loading={form.pending}>
          {resetPassword.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* TwoFactorPage                                                               */
/* -------------------------------------------------------------------------- */

export interface TwoFactorPageProps extends PageText {
  /** コードを確かめる。違えば { error: true }（既定の文）。コードを消して入力欄へ戻す。 */
  onSubmit: (values: { code: string; trust: boolean }) => SubmitResult | Promise<SubmitResult>;
  /** コードの届け方。既定 'app'（認証アプリ）。 */
  method?: 'app' | 'sms' | 'email';
  /** 送り先（'•••• 1234' や 'h•••@example.com'）。sms / email のときの説明に入る。 */
  destination?: string;
  /** コードを送り直す（sms / email）。渡すと「もう一度送る」を出す。 */
  onResend?: () => SubmitResult | Promise<SubmitResult>;
  resendAfter?: number;
  /** 渡すと「このデバイスを N 日間信頼する」を出す。 */
  trustDays?: number;
  /** 別の方法（バックアップコードなど）への行き先。 */
  otherHref?: string;
  /** コードの桁数。既定 6。 */
  length?: number;
}

/**
 * 2 段階認証のコードの入力。P-02。
 *
 * 入力欄は 1 つ（autocomplete="one-time-code"。SMS の自動入力と貼り付けが効く）。桁がそろうと自動で送る。
 * 違っていたら、コードを消して入力欄へフォーカスを戻す。
 */
export function TwoFactorPage({
  onSubmit,
  method = 'app',
  destination = '',
  onResend,
  resendAfter = 60,
  trustDays,
  otherHref,
  length = 6,
  title,
  description,
  aside,
  className,
  ...rest
}: TwoFactorPageProps): ReactNode {
  const { labels } = useSite();
  const { common, twoFactor } = labels;
  const form = useTemplateForm<{ code: string; trust: boolean }>({
    initial: { code: '', trust: false },
    validate: ({ code }) => (code.length === length ? {} : { code: common.requiredField(twoFactor.code) }),
    onSubmit,
    submitFailed: common.submitFailed,
    defaultError: twoFactor.failed,
    onFailure: () => {
      form.reset({ code: '' });
      document.getElementById(form.idOf('code'))?.focus();
    },
  });
  const explanation =
    method === 'sms' ? twoFactor.sms(destination, length) : method === 'email' ? twoFactor.email(destination, length) : twoFactor.app(length);

  return (
    <AuthLayout
      {...domPassthrough(rest, 'TwoFactorPage')}
      className={className}
      title={title ?? twoFactor.title}
      description={description ?? explanation}
      aside={aside}
    >
      <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('code')} label={twoFactor.code} required requiredBadge={false} error={form.errors.code}>
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
        {trustDays ? (
          <ModalCheckbox name="trust" checked={form.values.trust} onCheckedChange={(checked) => form.set('trust', checked)}>
            {twoFactor.trust(trustDays)}
          </ModalCheckbox>
        ) : null}
        <Button type="submit" variant="primary" block loading={form.pending}>
          {twoFactor.submit}
        </Button>
      </form>
      {onResend && method !== 'app' ? <Resend onResend={onResend} resendAfter={resendAfter} /> : null}
      {otherHref ? (
        <p className="g-auth-after-inline">
          <SiteLink href={otherHref} className="g-auth-link">
            {twoFactor.other}
          </SiteLink>
        </p>
      ) : null}
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* VerifyEmailPage                                                             */
/* -------------------------------------------------------------------------- */

export interface VerifyEmailPageProps extends PageText {
  /** 確認のメールを送った先。 */
  email: string;
  /** 既定 'pending'（メールを開いてもらう）。'verified' は確認できた、'expired' はリンクの期限が切れた。 */
  status?: 'pending' | 'verified' | 'expired';
  /** 確認のメールを送り直す。 */
  onResend?: () => SubmitResult | Promise<SubmitResult>;
  resendAfter?: number;
  /** メールアドレスを変える画面への行き先。 */
  changeHref?: string;
  /** 確認できた後の行き先（「続ける」）。 */
  continueHref?: string;
}

/** メールアドレスの確認。P-04。送った先を示し、送り直し・アドレスの変更・確認後の続きを案内する。 */
export function VerifyEmailPage({
  email,
  status = 'pending',
  onResend,
  resendAfter = 60,
  changeHref,
  continueHref,
  title,
  description,
  aside,
  className,
  ...rest
}: VerifyEmailPageProps): ReactNode {
  const { labels } = useSite();
  const { verifyEmail } = labels;
  const layout = { ...domPassthrough(rest, 'VerifyEmailPage'), className, aside };
  if (status === 'verified') {
    return (
      <AuthLayout {...layout} title={verifyEmail.verifiedTitle} description={verifyEmail.verifiedDescription}>
        {continueHref ? (
          <SiteButtonLink href={continueHref} variant="primary" block>
            {verifyEmail.continue}
          </SiteButtonLink>
        ) : null}
      </AuthLayout>
    );
  }
  const expired = status === 'expired';
  return (
    <AuthLayout
      {...layout}
      title={title ?? (expired ? verifyEmail.expiredTitle : verifyEmail.title)}
      description={description ?? (expired ? verifyEmail.expiredDescription : verifyEmail.description(email))}
      footer={switchLine(undefined, changeHref, verifyEmail.change)}
    >
      {/* 期限切れの画面は別の画面なので作り直す（送った直後の待ち時間を引き継がない） */}
      {onResend ? <Resend key={status} onResend={onResend} resendAfter={expired ? 0 : resendAfter} /> : null}
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* SignOutPage                                                                 */
/* -------------------------------------------------------------------------- */

export interface SignOutPageProps extends PageText {
  /** 既定 'done'（ログアウトした後）。'confirm' はログアウトしてよいかを尋ねる。 */
  status?: 'confirm' | 'done';
  /** 'confirm' でログアウトを押したとき。 */
  onConfirm?: () => void | Promise<void>;
  /** 'confirm' でやめたときの行き先。既定は links.home。 */
  cancelHref?: string;
}

/** ログアウトの確認と、ログアウトした後のページ。P-02。 */
export function SignOutPage({ status = 'done', onConfirm, cancelHref, title, description, aside, className, ...rest }: SignOutPageProps): ReactNode {
  const { labels, links } = useSite();
  const { common, signOut } = labels;
  const layout = { ...domPassthrough(rest, 'SignOutPage'), className, aside };
  if (status === 'confirm') {
    const back = cancelHref ?? links.home;
    return (
      <AuthLayout {...layout} title={title ?? signOut.confirmTitle} description={description ?? signOut.confirmDescription}>
        <div className="g-auth-actions">
          <Button variant="primary" block onAction={onConfirm}>
            {signOut.confirm}
          </Button>
          {back ? (
            <SiteButtonLink href={back} variant="tertiary" block>
              {signOut.cancel}
            </SiteButtonLink>
          ) : null}
        </div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} title={title ?? signOut.doneTitle} description={description ?? signOut.doneDescription}>
      <div className="g-auth-actions">
        {links.signIn ? (
          <SiteButtonLink href={links.signIn} variant="primary" block>
            {signOut.signInAgain}
          </SiteButtonLink>
        ) : null}
        {links.home ? (
          <SiteButtonLink href={links.home} variant="tertiary" block>
            {common.home}
          </SiteButtonLink>
        ) : null}
      </div>
    </AuthLayout>
  );
}
