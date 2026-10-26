import { useRef, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalField } from '../fields';
import { ModalInput } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { isMobilePhone, isPhoneNumber, normalizePhone } from '../japanese';
import { usePhrase } from '../phrase';
import {
  CodeForm,
  EmailForm,
  NotReceived,
  PasswordForm,
  ProviderButtons,
  Resend,
  SignUpForm,
  SwitchButton,
  useFocusOnChange,
  type AuthProvider,
  type PasskeyHandler,
  type SignInValues,
  type SignUpValues,
} from './auth-parts';
import { ErrorSummary, FormError, useTemplateForm, type SubmitResult } from './form';
import { commonLabels, emailFirstLabels, magicLinkLabels, phoneSignInLabels, signInLabels, signUpLabels, twoFactorLabels } from './labels';
import { AuthLayout } from './layouts';
import { SiteLink, useSiteConfig, useTemplateLabels } from './site';

/** テンプレートの props の共通部分。見出しと説明は既定の文言を上書きできる。 */
interface PageText extends DataAttributes {
  title?: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* MagicLinkPage                                                               */
/* -------------------------------------------------------------------------- */

interface LinkSentProps {
  email: string;
  onCode: (values: { email: string; code: string }) => SubmitResult | Promise<SubmitResult>;
  onResend: () => SubmitResult | Promise<SubmitResult>;
  codeLength: number;
  resendAfter: number;
  sender?: string;
  onChangeEmail: () => void;
}

const MAGIC_LINK_LABELS = { magicLink: magicLinkLabels } as const;

/** ログインのリンクとコードを送った後の中身。コードの欄・送り直し・届かないときの案内・アドレスの変更。 */
function LinkSent({ email, onCode, onResend, codeLength, resendAfter, sender, onChangeEmail }: LinkSentProps): ReactNode {
  const labels = useTemplateLabels(MAGIC_LINK_LABELS);
  const { magicLink } = labels;
  return (
    <>
      <CodeForm
        label={magicLink.code}
        length={codeLength}
        onSubmit={({ code }) => onCode({ email, code })}
        submit={magicLink.codeSubmit}
        failed={magicLink.failed}
      />
      <Resend onResend={onResend} resendAfter={resendAfter} />
      <NotReceived sender={sender} />
      <SwitchButton label={magicLink.useAnotherEmail} onClick={onChangeEmail} />
    </>
  );
}

export interface MagicLinkPageProps extends PageText {
  /** ログインのリンクと確認コードをメールで送る。アカウントの有無にかかわらず送った画面に進む（有無を明かさない）。 */
  onSend: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  /** メールに書いた確認コードでログインする（リンクを開けない端末のため）。違えば { error: true }。 */
  onCode: (values: { email: string; code: string }) => SubmitResult | Promise<SubmitResult>;
  /** 確認コードの桁数。既定 6。 */
  codeLength?: number;
  /** 送り直すまでの秒数。既定 60。 */
  resendAfter?: number;
  /** メールの送り主（届かないときの案内で、携帯会社のメールの受信設定に触れる）。 */
  sender?: string;
  /** 「パスワードでログイン」の行き先。 */
  passwordHref?: string;
  defaultEmail?: string;
}

/**
 * パスワードを使わない、メールのリンクと確認コードのログイン。P-23。
 *
 * メールアドレスだけを聞いて、ログインのリンクと確認コードを送る。リンクを開けない端末（メールはスマートフォン、ログインはパソコン）
 * のために、同じ画面でコードも入れられる（one-time-code。桁がそろうと送る）。送った後は見出しへフォーカスを移し、
 * 待ち時間の後に送り直せ、届かないときの案内と、アドレスの変更を出す。
 */
export function MagicLinkPage({
  onSend,
  onCode,
  codeLength = 6,
  resendAfter = 60,
  sender,
  passwordHref,
  defaultEmail = '',
  title,
  description,
  aside,
  className,
  ...rest
}: MagicLinkPageProps): ReactNode {
  const labels = useTemplateLabels(MAGIC_LINK_LABELS);
  const phrase = usePhrase();
  const { magicLink } = labels;
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const headingRef = useFocusOnChange(sentTo !== null);
  const layout = { ...domPassthrough(rest, 'MagicLinkPage'), className, aside, headingRef };

  if (sentTo !== null) {
    return (
      <AuthLayout {...layout} title={magicLink.sentTitle} description={magicLink.sentDescription(sentTo)}>
        <LinkSent
          email={sentTo}
          onCode={onCode}
          onResend={() => onSend({ email: sentTo })}
          codeLength={codeLength}
          resendAfter={resendAfter}
          sender={sender}
          onChangeEmail={() => {
            setEmail(sentTo);
            setSentTo(null);
          }}
        />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      {...layout}
      title={title ?? magicLink.title}
      description={description ?? magicLink.description}
      footer={
        passwordHref ? (
          <SiteLink href={passwordHref} className="g-auth-link">
            {phrase(magicLink.usePassword)}
          </SiteLink>
        ) : undefined
      }
    >
      <EmailForm onSubmit={onSend} onSent={setSentTo} submit={magicLink.submit} defaultEmail={email} autoComplete="username" sender={sender} />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* EmailFirstPage                                                              */
/* -------------------------------------------------------------------------- */

/** メールアドレスを受け取った後の進み方。 */
export type EmailFirstNext =
  /** 登録してあるアカウント。パスワードを聞く。 */
  | { next: 'password' }
  /** まだ無いアカウント。登録のフォームに進む。 */
  | { next: 'signUp' }
  /** 組織の ID（SAML / OIDC）でログインするドメイン。 */
  | { next: 'sso'; provider: string }
  /** パスワードを使わないアカウント。ログインのリンクとコードを送った。 */
  | { next: 'link' };

type EmailFirstStep = { kind: 'email' } | ({ email: string } & ({ kind: 'password' | 'signUp' | 'link' } | { kind: 'sso'; provider: string }));

export interface EmailFirstPageProps extends PageText {
  /**
   * メールアドレスを受け取り、次の進み方を返す（失敗なら { error }）。アカウントの有無を明かしたくなければ、
   * 無いアカウントにも 'password' か 'link' を返す。
   */
  onContinue: (email: string) => EmailFirstNext | { error: ReactNode } | Promise<EmailFirstNext | { error: ReactNode }>;
  onSignIn: (values: SignInValues) => SubmitResult | Promise<SubmitResult>;
  /** 'signUp' に進んだときの登録。 */
  onSignUp?: (values: SignUpValues) => SubmitResult | Promise<SubmitResult>;
  /** 'sso' に進んだとき、組織の ID のログインへ送る。 */
  onSso?: (email: string, provider: string) => void;
  /** 'link' に進んだときのコードの確かめと、送り直し。 */
  onCode?: (values: { email: string; code: string }) => SubmitResult | Promise<SubmitResult>;
  onResendLink?: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  providers?: readonly AuthProvider[];
  onPasskey?: PasskeyHandler;
  /** 登録の名前の欄と規約への同意。既定 true。 */
  nameField?: boolean;
  consent?: boolean;
  passwordMinLength?: number;
  sender?: string;
  codeLength?: number;
  resendAfter?: number;
  defaultEmail?: string;
}

const EMAIL_FIRST_LABELS = {
  common: commonLabels,
  signIn: signInLabels,
  signUp: signUpLabels,
  emailFirst: emailFirstLabels,
  magicLink: magicLinkLabels,
} as const;

/**
 * メールアドレスを先に聞くログイン（識別子が先）。P-22。
 *
 * 最初はメールアドレスだけ（autocomplete="username"。パスキーがあれば "username webauthn"）。onContinue の答えで、
 * パスワード（アドレスは変えられない形で示し、隠した username の欄でパスワード管理ソフトに渡す）・登録・組織の ID・
 * ログインのリンクのどれかへ進む。ログインと登録の入口を 1 つにでき、組織のアカウントを SSO へ振り分けられる。
 * 画面が変わるたびに見出しへフォーカスを移し、どの画面からもメールアドレスを変えて戻れる。
 */
export function EmailFirstPage({
  onContinue,
  onSignIn,
  onSignUp,
  onSso,
  onCode,
  onResendLink,
  providers,
  onPasskey,
  nameField = true,
  consent = true,
  passwordMinLength = 8,
  sender,
  codeLength = 6,
  resendAfter = 60,
  defaultEmail = '',
  title,
  description,
  aside,
  className,
  ...rest
}: EmailFirstPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(EMAIL_FIRST_LABELS);
  const phrase = usePhrase();
  const { common, signIn, signUp, emailFirst, magicLink } = labels;
  const [step, setStep] = useState<EmailFirstStep>({ kind: 'email' });
  const [email, setEmail] = useState(defaultEmail);
  const next = useRef<EmailFirstNext | null>(null);
  const headingRef = useFocusOnChange(step.kind);
  const layout = { ...domPassthrough(rest, 'EmailFirstPage'), className, aside, headingRef };
  const changeEmail = <SwitchButton label={emailFirst.changeEmail} onClick={() => setStep({ kind: 'email' })} />;

  if (step.kind === 'password') {
    return (
      <AuthLayout {...layout} title={signIn.title} description={emailFirst.passwordDescription(step.email)}>
        <PasswordForm
          email={step.email}
          onSubmit={({ password }) => onSignIn({ email: step.email, password, remember: false })}
          submit={signIn.submit}
          failed={signIn.failed}
          forgot={
            links.forgotPassword ? (
              <SiteLink href={links.forgotPassword} className="g-auth-link">
                {phrase(signIn.forgot)}
              </SiteLink>
            ) : undefined
          }
        />
        {changeEmail}
      </AuthLayout>
    );
  }
  if (step.kind === 'signUp' && onSignUp) {
    return (
      <AuthLayout {...layout} title={signUp.title} description={emailFirst.newAccountDescription(step.email)}>
        <SignUpForm
          onSubmit={onSignUp}
          nameField={nameField}
          consent={consent}
          passwordMinLength={passwordMinLength}
          defaultEmail={step.email}
          sender={sender}
        />
        {changeEmail}
      </AuthLayout>
    );
  }
  if (step.kind === 'sso') {
    return (
      <AuthLayout {...layout} title={emailFirst.ssoTitle} description={emailFirst.ssoDescription(step.provider)}>
        <Button variant="primary" block onClick={() => onSso?.(step.email, step.provider)}>
          {common.continueWith(step.provider)}
        </Button>
        {changeEmail}
      </AuthLayout>
    );
  }
  if (step.kind === 'link' && onCode) {
    return (
      <AuthLayout {...layout} title={magicLink.sentTitle} description={magicLink.sentDescription(step.email)}>
        <LinkSent
          email={step.email}
          onCode={onCode}
          onResend={() => onResendLink?.({ email: step.email })}
          codeLength={codeLength}
          resendAfter={resendAfter}
          sender={sender}
          onChangeEmail={() => setStep({ kind: 'email' })}
        />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} title={title ?? emailFirst.title} description={description ?? emailFirst.description}>
      <ProviderButtons providers={providers} onPasskey={onPasskey} />
      <EmailForm
        onSubmit={async ({ email: typed }) => {
          const result = await onContinue(typed);
          if ('error' in result) return result;
          next.current = result;
          return undefined;
        }}
        onSent={(typed) => {
          setEmail(typed);
          const answer = next.current;
          if (answer) setStep(answer.next === 'sso' ? { kind: 'sso', provider: answer.provider, email: typed } : { kind: answer.next, email: typed });
        }}
        submit={emailFirst.continue}
        defaultEmail={email}
        autoComplete={onPasskey ? 'username webauthn' : 'username'}
      />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* PhoneSignInPage                                                             */
/* -------------------------------------------------------------------------- */

export interface PhoneSignInPageProps extends PageText {
  /** SMS で確認コードを送る。phone は数字だけ（I-25 の normalizePhone）。 */
  onSend: (values: { phone: string }) => SubmitResult | Promise<SubmitResult>;
  /** コードを確かめてログインする。違えば { error: true }。 */
  onVerify: (values: { phone: string; code: string }) => SubmitResult | Promise<SubmitResult>;
  codeLength?: number;
  resendAfter?: number;
  /** 「メールアドレスでログイン」など、別の方法への行き先と文字。 */
  other?: { href: string; label: string };
  defaultPhone?: string;
}

const PHONE_SIGN_IN_LABELS = { common: commonLabels, twoFactor: twoFactorLabels, phoneSignIn: phoneSignInLabels } as const;

/**
 * 電話番号と SMS の確認コードのログイン。P-26。
 *
 * 番号は書き方を問わず数字だけにそろえ（I-25）、SMS を受け取れる携帯電話の番号（060・070・080・090）かを確かめる
 * （固定電話や IP 電話には「SMS を受け取れる携帯電話の番号を」と、直し方の分かる文で知らせる）。送った後はコードの画面
 * （one-time-code。SMS の自動入力が効き、桁がそろうと送る）に切り替え、待ち時間の後に送り直せ、番号を変えて戻れる。
 */
export function PhoneSignInPage({
  onSend,
  onVerify,
  codeLength = 6,
  resendAfter = 60,
  other,
  defaultPhone = '',
  title,
  description,
  aside,
  className,
  ...rest
}: PhoneSignInPageProps): ReactNode {
  const labels = useTemplateLabels(PHONE_SIGN_IN_LABELS);
  const phrase = usePhrase();
  const { common, phoneSignIn, twoFactor } = labels;
  const [sentTo, setSentTo] = useState<string | null>(null);
  const headingRef = useFocusOnChange(sentTo !== null);
  const form = useTemplateForm<{ phone: string }>({
    initial: { phone: defaultPhone },
    validate: ({ phone }) => {
      if (!phone.trim()) return { phone: common.requiredField(phoneSignIn.phone) };
      if (!isPhoneNumber(phone)) return { phone: phoneSignIn.invalidPhone };
      return isMobilePhone(phone) ? {} : { phone: phoneSignIn.notMobile };
    },
    onSubmit: ({ phone }) => onSend({ phone: normalizePhone(phone) }),
    onSuccess: ({ phone }) => setSentTo(normalizePhone(phone)),
    submitFailed: common.submitFailed,
  });
  const layout = { ...domPassthrough(rest, 'PhoneSignInPage'), className, aside, headingRef };
  const footer = other ? (
    <SiteLink href={other.href} className="g-auth-link">
      {phrase(other.label)}
    </SiteLink>
  ) : undefined;

  if (sentTo !== null) {
    return (
      <AuthLayout {...layout} title={phoneSignIn.codeTitle} description={phoneSignIn.codeDescription(sentTo, codeLength)} footer={footer}>
        <CodeForm
          label={twoFactor.code}
          length={codeLength}
          onSubmit={({ code }) => onVerify({ phone: sentTo, code })}
          submit={twoFactor.submit}
          failed={twoFactor.failed}
        />
        <Resend onResend={() => onSend({ phone: sentTo })} resendAfter={resendAfter} />
        <SwitchButton label={phoneSignIn.changeNumber} onClick={() => setSentTo(null)} />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} title={title ?? phoneSignIn.title} description={description ?? phoneSignIn.description} footer={footer}>
      <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('phone')} label={phoneSignIn.phone} help={phoneSignIn.phoneHelp} required requiredBadge={false} error={form.errors.phone}>
          {(control) => (
            <ModalInput
              {...control}
              type="tel"
              name="phone"
              autoComplete="tel"
              normalize={normalizePhone}
              value={form.values.phone}
              onChange={(event) => form.set('phone', event.target.value)}
            />
          )}
        </ModalField>
        <Button type="submit" variant="primary" block loading={form.pending}>
          {phoneSignIn.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}
