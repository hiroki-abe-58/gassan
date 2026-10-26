import { useId, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalField } from '../fields';
import { ModalPasswordInput } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { Steps } from '../navigation';
import { ModalPasswordStrength } from '../password-strength';
import { usePhrase } from '../phrase';
import { EmailForm, NotReceived, ProviderButtons, Resend, SwitchButton, switchLine, useFocusOnChange, type AuthProvider } from './auth-parts';
import { ErrorSummary, FormError, runAction, useTemplateForm, type SubmitResult } from './form';
import { commonLabels, guestAccountLabels, quickSignUpLabels, signUpLabels, verifyEmailLabels, wizardLabels } from './labels';
import { AuthLayout } from './layouts';
import { useSiteConfig, useTemplateLabels } from './site';

/* -------------------------------------------------------------------------- */
/* QuickSignUpPage                                                             */
/* -------------------------------------------------------------------------- */

export interface QuickSignUpPageProps extends DataAttributes {
  /** メールアドレスを受け取り、本登録のリンクをメールで送る。仮登録はここで済む。 */
  onSubmit: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  /** 規約とプライバシーポリシーへの同意を求める。既定 true。 */
  consent?: boolean;
  /** 送ったリンクの有効期限（「24 時間」）。送った画面に添える。 */
  expiresIn?: string;
  /** このあとの流れ（「メールのリンクを開く」「お客様情報を入力する」…）。送った画面に、いまどこかと一緒に見せる。 */
  steps?: readonly string[];
  /** メールの送り主（携帯会社のメールへの注意と、届かないときの案内）。 */
  sender?: string;
  providers?: readonly AuthProvider[];
  resendAfter?: number;
  title?: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

const QUICK_SIGN_UP_LABELS = { common: commonLabels, signUp: signUpLabels, verifyEmail: verifyEmailLabels, quickSignUp: quickSignUpLabels } as const;

/**
 * メールアドレスだけの仮登録。P-24。
 *
 * 最初に聞くのはメールアドレス（と規約への同意）だけ。送ると仮登録は済み、本登録のリンクをメールで送る
 * （金融・保険・不動産のように聞くことが多いサービスで、入口で離れさせない定石）。送った画面は、送った先・リンクの
 * 有効期限・このあとの流れ（済んだ手順に印）・送り直し・届かないときの案内・アドレスの変更を出す。
 * 本登録の手順は RegistrationWizardPage（P-25）。
 */
export function QuickSignUpPage({
  onSubmit,
  consent = true,
  expiresIn,
  steps,
  sender,
  providers,
  resendAfter = 60,
  title,
  description,
  aside,
  className,
  ...rest
}: QuickSignUpPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(QUICK_SIGN_UP_LABELS);
  const phrase = usePhrase();
  const { common, signUp, quickSignUp, verifyEmail } = labels;
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const headingRef = useFocusOnChange(sentTo !== null);
  const layout = { ...domPassthrough(rest, 'QuickSignUpPage'), className, aside, headingRef };

  if (sentTo !== null) {
    return (
      <AuthLayout {...layout} title={quickSignUp.sentTitle} description={quickSignUp.sentDescription(sentTo)}>
        {expiresIn ? <p className="g-auth-note">{phrase(quickSignUp.expires(expiresIn))}</p> : null}
        {steps && steps.length > 0 ? (
          <Steps
            label={quickSignUp.nextSteps}
            items={[quickSignUp.title, ...steps].map((label, index) => ({ key: String(index), label }))}
            current={1}
            orientation="vertical"
          />
        ) : null}
        <Resend onResend={() => onSubmit({ email: sentTo })} resendAfter={resendAfter} />
        <NotReceived sender={sender} />
        <SwitchButton
          label={verifyEmail.change}
          onClick={() => {
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
      title={title ?? quickSignUp.title}
      description={description ?? quickSignUp.description}
      footer={switchLine(signUp.hasAccount, links.signIn, common.signIn)}
    >
      <ProviderButtons providers={providers} />
      <EmailForm onSubmit={onSubmit} onSent={setSentTo} submit={quickSignUp.submit} defaultEmail={email} sender={sender} consent={consent} />
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* RegistrationWizardPage                                                      */
/* -------------------------------------------------------------------------- */

export interface RegistrationStep {
  id: string;
  /** 手順の名前（見出しと進み具合、確認の画面の「〜を修正する」に使う）。 */
  title: string;
  description?: ReactNode;
  /** 手順の中身（入力欄など）。値は利用側が持つ。 */
  content: ReactNode;
  /** 次へ進めるか確かめる。理由の文を返すと進まずに、その文を読み上げる（欄ごとのエラーは利用側が出す）。 */
  validate?: () => string | null | undefined;
  /** 「あとで入力する」で飛ばせる手順。 */
  optional?: boolean;
  /** 確認の画面に並べる行。 */
  summary?: readonly { label: ReactNode; value: ReactNode }[];
}

export interface RegistrationWizardPageProps extends DataAttributes {
  steps: readonly RegistrationStep[];
  /** 確認の画面（review が false なら最後の手順）で「登録する」を押したとき。失敗なら { error }。 */
  onSubmit: () => SubmitResult | Promise<SubmitResult>;
  /** 手順を進めたり戻ったりしたとき。入力した内容をサーバーに保存し、途中で離れても続きから始められるようにする。 */
  onSave?: (stepId: string) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと「保存してあとで続ける」を出す（保存した後に呼ぶ）。 */
  onSaveAndExit?: (stepId: string) => void;
  /** 手順が変わったとき（何番目まで進んだかを URL に残すなど）。 */
  onStepChange?: (stepId: string) => void;
  /** 途中から続けるときの手順の id（前に保存した所）。 */
  defaultStep?: string;
  /** 送る前に確認の画面を出す。既定 true。 */
  review?: boolean;
  /** 登録が済んだ画面に置くもの（次にすることへのリンクなど）。 */
  done?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

const REVIEW = '#review';
const DONE = '#done';

const REGISTRATION_WIZARD_LABELS = { common: commonLabels, wizard: wizardLabels } as const;

/**
 * 本登録の手順（仮登録のメールのリンクから入る）。P-25。
 *
 * カードの上に進み具合（U-24）を置き、手順ごとに見出し・説明・中身・戻る / あとで入力する / 次へを並べる。手順を動かすたびに
 * onSave で保存し（保存できたことを role="status" で知らせる）、「保存してあとで続ける」で離れても、defaultStep で続きから始められる。
 * 最後は確認の画面で手順ごとの内容を並べ、「〜を修正する」でその手順へ戻り、直したら「確認に戻る」で確認の画面へ帰る。
 * 手順が変わったら見出しへフォーカスを移す。登録は送信の流れ（P-03）と同じく二度押しできず、失敗の文を割り込ませて読む。
 */
export function RegistrationWizardPage({
  steps,
  onSubmit,
  onSave,
  onSaveAndExit,
  onStepChange,
  defaultStep,
  review = true,
  done,
  aside,
  className,
  ...rest
}: RegistrationWizardPageProps): ReactNode {
  const labels = useTemplateLabels(REGISTRATION_WIZARD_LABELS);
  const phrase = usePhrase();
  const { common, wizard } = labels;
  // 確認の画面の節の見出しの id。手順の id は利用側の文字列なので、そのまま DOM の id にしない（重なり・空白）
  const reviewId = useId();
  const ids = steps.map((step) => step.id);
  const [current, setCurrent] = useState(defaultStep && ids.includes(defaultStep) ? defaultStep : (ids[0] ?? REVIEW));
  const [fromReview, setFromReview] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const [saved, setSaved] = useState('');
  const headingRef = useFocusOnChange(current);
  const index = ids.indexOf(current);
  const step = steps[index];
  const last = index === steps.length - 1;
  const layout = { ...domPassthrough(rest, 'RegistrationWizardPage'), className: className ? `g-wizard ${className}` : 'g-wizard', aside, headingRef };

  const go = (next: string): void => {
    setError(null);
    setCurrent(next);
    onStepChange?.(next);
  };
  /** 保存してから動く。保存に失敗したら動かずに理由を読む。 */
  const save = async (stepId: string): Promise<boolean> => {
    if (!onSave) return true;
    setSaved('');
    const failure = await runAction(() => onSave(stepId), common.submitFailed);
    if (failure) {
      setError(failure);
      return false;
    }
    setSaved(wizard.saved);
    return true;
  };
  const submit = async (): Promise<void> => {
    const failure = await runAction(onSubmit, common.submitFailed);
    if (failure) setError(failure);
    else go(DONE);
  };
  const forward = async (): Promise<void> => {
    if (!step) return;
    const reason = step.validate?.();
    if (reason) {
      setError(reason);
      return;
    }
    if (!(await save(step.id))) return;
    if (fromReview) {
      setFromReview(false);
      go(REVIEW);
    } else if (!last) go(ids[index + 1] ?? REVIEW);
    else if (review) go(REVIEW);
    else await submit();
  };

  const progress =
    current === DONE ? null : (
      <Steps
        label={wizard.progress}
        items={[...steps.map((item) => ({ key: item.id, label: item.title })), ...(review ? [{ key: REVIEW, label: wizard.reviewTitle }] : [])]}
        current={current === REVIEW ? steps.length : Math.max(index, 0)}
        orientation="horizontal"
      />
    );
  // 空の間は流れから外す（カードの下に余白を作らない）
  const status = (
    <p className="g-wizard-saved g-live" role="status">
      {saved ? phrase(saved) : null}
    </p>
  );

  if (current === DONE) {
    return (
      <AuthLayout {...layout} title={wizard.doneTitle} description={wizard.doneDescription}>
        {done}
      </AuthLayout>
    );
  }
  if (current === REVIEW || !step) {
    return (
      <AuthLayout {...layout} lead={progress} title={wizard.reviewTitle} description={wizard.reviewDescription}>
        <FormError>{error}</FormError>
        {steps.map((item, itemIndex) => (
          <section key={item.id} className="g-wizard-review" aria-labelledby={`${reviewId}-${String(itemIndex)}`}>
            <div className="g-wizard-review-head">
              <h2 id={`${reviewId}-${String(itemIndex)}`}>{phrase(item.title)}</h2>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setFromReview(true);
                  go(item.id);
                }}
              >
                {wizard.edit(item.title)}
              </Button>
            </div>
            {item.summary && item.summary.length > 0 ? (
              <dl className="g-wizard-summary">
                {item.summary.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    <dt>{phrase(row.label)}</dt>
                    <dd>{phrase(row.value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ))}
        <div className="g-wizard-actions">
          <Button variant="primary" block onAction={submit}>
            {wizard.submit}
          </Button>
        </div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} lead={progress} title={step.title} description={step.description}>
      <FormError>{error}</FormError>
      <div className="g-wizard-content">{step.content}</div>
      <div className="g-wizard-actions">
        {index > 0 && !fromReview ? (
          <Button
            onAction={async () => {
              if (await save(step.id)) go(ids[index - 1] ?? current);
            }}
          >
            {wizard.back}
          </Button>
        ) : null}
        {step.optional && !last && !fromReview ? (
          <Button variant="tertiary" onClick={() => go(ids[index + 1] ?? REVIEW)}>
            {wizard.skip}
          </Button>
        ) : null}
        <Button variant="primary" onAction={forward}>
          {fromReview ? wizard.backToReview : last && !review ? wizard.submit : wizard.next}
        </Button>
      </div>
      {onSaveAndExit ? (
        <SwitchButton
          label={wizard.saveAndExit}
          onClick={() => {
            void save(step.id).then((ok) => {
              if (ok) onSaveAndExit(step.id);
            });
          }}
        />
      ) : null}
      {status}
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* GuestAccountCard                                                            */
/* -------------------------------------------------------------------------- */

export interface GuestAccountCardProps extends DataAttributes {
  /** 注文に使ったメールアドレス（アカウントの ID になる）。 */
  email: string;
  /** パスワードを受け取ってアカウントを作る。失敗なら { error }。 */
  onCreate: (values: { password: string }) => SubmitResult | Promise<SubmitResult>;
  /** 「いまは作らない」。渡すとボタンを出す。 */
  onDismiss?: () => void;
  passwordMinLength?: number;
  className?: string;
}

const GUEST_ACCOUNT_LABELS = { common: commonLabels, guestAccount: guestAccountLabels } as const;

/**
 * 購入の後のアカウント作成。P-30。
 *
 * 会員登録を買う前に求めず（ゲストで買える）、買い終えた画面で「パスワードを決めるだけ」でアカウントを作れるようにする。
 * メールアドレスは注文のもの（隠した username の欄でパスワード管理ソフトに渡す）、パスワードは new-password と強さ。
 * 作れたら、カードの中身を完了の知らせに替えて読み上げる（role="status"）。ページの中に置く節（h2）で、ページの見出しは持たない。
 */
export function GuestAccountCard({ email, onCreate, onDismiss, passwordMinLength = 8, className, ...rest }: GuestAccountCardProps): ReactNode {
  const labels = useTemplateLabels(GUEST_ACCOUNT_LABELS);
  const phrase = usePhrase();
  const { common, guestAccount } = labels;
  const titleId = `${useId()}-title`;
  const [created, setCreated] = useState(false);
  const form = useTemplateForm<{ password: string }>({
    initial: { password: '' },
    validate: ({ password }) => {
      if (!password) return { password: common.requiredField(common.password) };
      return [...password].length < passwordMinLength ? { password: common.passwordTooShort(passwordMinLength) } : {};
    },
    onSubmit: onCreate,
    onSuccess: () => setCreated(true),
    submitFailed: common.submitFailed,
  });
  const strengthId = `${form.idOf('password')}-strength`;
  return (
    <section {...domPassthrough(rest, 'GuestAccountCard')} className={className ? `g-guest-account ${className}` : 'g-guest-account'} aria-labelledby={titleId}>
      <h2 id={titleId} className="g-guest-account-title">
        {phrase(created ? guestAccount.doneTitle : guestAccount.title)}
      </h2>
      <div className="g-live" role="status">
        {created ? <p className="g-guest-account-text">{phrase(guestAccount.doneDescription)}</p> : null}
      </div>
      {created ? null : (
        <>
          <p className="g-guest-account-text">{phrase(guestAccount.description(email))}</p>
          <form className="g-auth-form" noValidate onSubmit={form.handleSubmit}>
            <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
            <FormError>{form.formError}</FormError>
            <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
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
            <div className="g-guest-account-actions">
              <Button type="submit" variant="primary" loading={form.pending}>
                {guestAccount.submit}
              </Button>
              {onDismiss ? (
                <Button variant="tertiary" onClick={onDismiss}>
                  {guestAccount.later}
                </Button>
              ) : null}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
