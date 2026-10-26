import { useId, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button } from '../button';
import { Badge } from '../display';
import { ModalField } from '../fields';
import { ModalButton, ModalFooter } from '../footer';
import { ModalGate, ModalGateStatus } from '../gate';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { ModalInput, ModalPasswordInput } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { useLabels } from '../labels';
import { PageHeader } from '../page-header';
import { ModalPasswordStrength } from '../password-strength';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import {
  EMAIL_INPUT,
  ErrorSummary,
  FormError,
  formatDateTime,
  looksLikeEmail,
  runAction,
  useTemplateForm,
  type FormErrors,
  type SubmitResult,
} from './form';
import { commonLabels, settingsLabels } from './labels';
import { useTemplateLabels, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/* -------------------------------------------------------------------------- */
/* SettingsSection                                                             */
/* -------------------------------------------------------------------------- */

export interface SettingsSectionProps extends DataAttributes {
  title: ReactNode;
  description?: ReactNode;
  /** 'danger' は取り消せない操作の節。見出しを危険の色にするだけで、枠や地の色では囲まない（§5 の 21）。 */
  tone?: 'danger';
  children: ReactNode;
  className?: string;
}

/**
 * 設定の 1 つの節。P-13。
 *
 * 見出しを名前にした region で、器が広いときは見出しと説明を左、中身を右に置く（狭いときは縦に積む）。
 * 節の間は 1px の線で区切り、中身は面に載せる。SettingsPage の children に足して、独自の設定の節を作れる。
 */
export function SettingsSection({ title, description, tone, children, className, ...rest }: SettingsSectionProps): ReactNode {
  const phrase = usePhrase();
  const titleId = `${useId()}-title`;
  return (
    <section {...domPassthrough(rest, 'SettingsSection')} className={cx('g-settings-section', className)} data-tone={tone} aria-labelledby={titleId}>
      <div className="g-settings-intro">
        <h2 id={titleId} className="g-settings-title">
          {phrase(title)}
        </h2>
        {description ? <p className="g-settings-description">{phrase(description)}</p> : null}
      </div>
      <div className="g-settings-body">{children}</div>
    </section>
  );
}

/** 節の下端の操作と、結果の知らせ（いつも置いてある role="status" の領域で読み上げる）。 */
function SectionActions({ status, children }: { status: ReactNode; children?: ReactNode }): ReactNode {
  const phrase = usePhrase();
  return (
    <div className="g-settings-actions">
      <p className="g-settings-status" role="status">
        {status ? phrase(status) : null}
      </p>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 節ごとの設定                                                                */
/* -------------------------------------------------------------------------- */

export interface SettingsProfile {
  name: string;
  email: string;
  onSubmit: (values: { name: string; email: string }) => SubmitResult | Promise<SubmitResult>;
}

export interface SettingsPassword {
  onSubmit: (values: { current: string; next: string }) => SubmitResult | Promise<SubmitResult>;
  /** 新しいパスワードの最短の長さ。既定 8。 */
  minLength?: number;
}

export interface SettingsTwoFactor {
  enabled: boolean;
  /** 有効にする手順（認証アプリの QR コードなど）へ進む。 */
  onEnable: () => void | Promise<void>;
  /** 無効にする（確かめてから呼ぶ）。 */
  onDisable: () => SubmitResult | Promise<SubmitResult>;
}

export interface SettingsSession {
  id: string;
  /** 端末の名前（「MacBook Pro · Chrome」）。 */
  device: string;
  /** 場所などの補足（「東京」「203.0.113.4」）。 */
  detail?: string;
  /** 最後に使った日時（Date か ISO 8601 の文字列）。 */
  lastActive: Date | string;
  /** いま使っている端末（ログアウトさせられない）。 */
  current?: boolean;
}

export interface SettingsSessions {
  items: readonly SettingsSession[];
  onRevoke: (id: string) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと「ほかの端末をすべてログアウトさせる」を出す。 */
  onRevokeOthers?: () => SubmitResult | Promise<SubmitResult>;
}

export interface SettingsDeleteAccount {
  /** 確かめるために打ってもらう文字（メールアドレスやワークスペースの名前）。 */
  confirmText: string;
  onDelete: () => SubmitResult | Promise<SubmitResult>;
}

const SECTION_LABELS = { common: commonLabels, settings: settingsLabels } as const;

function ProfileSection({ name, email, onSubmit }: SettingsProfile): ReactNode {
  const labels = useTemplateLabels(SECTION_LABELS);
  const { common, settings } = labels;
  const [saved, setSaved] = useState(false);
  const form = useTemplateForm<{ name: string; email: string }>({
    initial: { name, email },
    validate: (values) => {
      const errors: FormErrors<{ name: string; email: string }> = {};
      if (!values.name.trim()) errors.name = common.requiredField(common.name);
      if (!values.email.trim()) errors.email = common.requiredField(common.email);
      else if (!looksLikeEmail(values.email)) errors.email = common.invalidEmail;
      return errors;
    },
    onSubmit,
    onSuccess: () => setSaved(true),
    submitFailed: common.submitFailed,
  });
  // 打ち直したら「保存しました」を消す（保存していない値に「保存しました」を残さない）
  const edit = (key: 'name' | 'email', value: string): void => {
    setSaved(false);
    form.set(key, value);
  };
  return (
    <SettingsSection title={settings.profile.title} description={settings.profile.description}>
      <form className="g-settings-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('name')} label={common.name} required requiredBadge={false} error={form.errors.name}>
          {(control) => <ModalInput {...control} name="name" autoComplete="name" value={form.values.name} onChange={(event) => edit('name', event.target.value)} />}
        </ModalField>
        <ModalField id={form.idOf('email')} label={common.email} required requiredBadge={false} error={form.errors.email}>
          {(control) => (
            <ModalInput {...control} {...EMAIL_INPUT} name="email" autoComplete="email" value={form.values.email} onChange={(event) => edit('email', event.target.value)} />
          )}
        </ModalField>
        <SectionActions status={saved ? settings.saved : null}>
          <Button type="submit" variant="primary" loading={form.pending}>
            {settings.save}
          </Button>
        </SectionActions>
      </form>
    </SettingsSection>
  );
}

function PasswordSection({ onSubmit, minLength = 8 }: SettingsPassword): ReactNode {
  const labels = useTemplateLabels(SECTION_LABELS);
  const { common, settings } = labels;
  const [changed, setChanged] = useState(false);
  const form = useTemplateForm<{ current: string; next: string; confirm: string }>({
    initial: { current: '', next: '', confirm: '' },
    validate: (values) => {
      const errors: FormErrors<{ current: string; next: string; confirm: string }> = {};
      if (!values.current) errors.current = common.requiredField(settings.password.current);
      if (!values.next) errors.next = common.requiredField(common.newPassword);
      else if ([...values.next].length < minLength) errors.next = common.passwordTooShort(minLength);
      if (!values.confirm) errors.confirm = common.confirmRequired;
      else if (values.confirm !== values.next) errors.confirm = common.passwordMismatch;
      return errors;
    },
    onSubmit: ({ current, next }) => onSubmit({ current, next }),
    onSuccess: () => {
      // 変えたパスワードを欄に残さない
      form.reset({ current: '', next: '', confirm: '' });
      setChanged(true);
    },
    submitFailed: common.submitFailed,
  });
  const strengthId = `${form.idOf('next')}-strength`;
  const edit = (key: 'current' | 'next' | 'confirm', value: string): void => {
    setChanged(false);
    form.set(key, value);
  };
  return (
    <SettingsSection title={settings.password.title} description={settings.password.description}>
      <form className="g-settings-form" noValidate onSubmit={form.handleSubmit}>
        <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
        <FormError>{form.formError}</FormError>
        <ModalField id={form.idOf('current')} label={settings.password.current} required requiredBadge={false} error={form.errors.current}>
          {(control) => (
            <ModalPasswordInput {...control} name="current-password" autoComplete="current-password" value={form.values.current} onChange={(event) => edit('current', event.target.value)} />
          )}
        </ModalField>
        <ModalField id={form.idOf('next')} label={common.newPassword} required requiredBadge={false} error={form.errors.next}>
          {(control) => (
            <>
              <ModalPasswordInput
                {...control}
                aria-describedby={[control['aria-describedby'], strengthId].filter(Boolean).join(' ')}
                name="new-password"
                autoComplete="new-password"
                value={form.values.next}
                onChange={(event) => edit('next', event.target.value)}
              />
              <ModalPasswordStrength id={strengthId} value={form.values.next} minLength={minLength} />
            </>
          )}
        </ModalField>
        <ModalField id={form.idOf('confirm')} label={common.confirmPassword} required requiredBadge={false} error={form.errors.confirm}>
          {(control) => (
            <ModalPasswordInput {...control} name="confirm-password" autoComplete="new-password" value={form.values.confirm} onChange={(event) => edit('confirm', event.target.value)} />
          )}
        </ModalField>
        <SectionActions status={changed ? settings.password.changed : null}>
          <Button type="submit" variant="primary" loading={form.pending}>
            {settings.password.submit}
          </Button>
        </SectionActions>
      </form>
    </SettingsSection>
  );
}

function TwoFactorSection({ enabled, onEnable, onDisable }: SettingsTwoFactor): ReactNode {
  const labels = useTemplateLabels(SECTION_LABELS);
  const gassan = useLabels();
  const { common, settings } = labels;
  const t = settings.twoFactor;
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<ReactNode>(null);
  const [error, setError] = useState<ReactNode>(null);
  return (
    <SettingsSection title={t.title} description={t.description}>
      <div className="g-settings-row">
        <Badge tone={enabled ? 'success' : 'neutral'} dot>
          {enabled ? t.on : t.off}
        </Badge>
        {enabled ? (
          <Button
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
          >
            {t.disable}
          </Button>
        ) : (
          <Button variant="primary" onAction={onEnable}>
            {t.enable}
          </Button>
        )}
      </div>
      <SectionActions status={status} />
      <ModalRoot open={confirming} onOpenChange={setConfirming} kind="confirm">
        <ModalHeader>
          <ModalTitle>{t.disableTitle}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalDescription>{t.disableDescription}</ModalDescription>
          <FormError>{error}</FormError>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="tertiary" onClick={() => setConfirming(false)}>
            {gassan.cancel}
          </ModalButton>
          <ModalButton
            variant="danger"
            onAction={async () => {
              const failure = await runAction(onDisable, common.submitFailed);
              if (failure) {
                setError(failure);
                return;
              }
              setStatus(t.disabled);
              setConfirming(false);
            }}
          >
            {t.disable}
          </ModalButton>
        </ModalFooter>
      </ModalRoot>
    </SettingsSection>
  );
}

function SessionsSection({ items, onRevoke, onRevokeOthers }: SettingsSessions): ReactNode {
  const labels = useTemplateLabels(SECTION_LABELS);
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const { common, settings } = labels;
  const t = settings.sessions;
  const [status, setStatus] = useState<ReactNode>(null);
  const revoke = async (action: () => SubmitResult | Promise<SubmitResult>): Promise<void> => {
    setStatus(null);
    const failure = await runAction(action, common.submitFailed);
    setStatus(failure ?? t.revoked);
  };
  return (
    <SettingsSection title={t.title} description={t.description}>
      <ul className="g-sessions">
        {items.map((session) => {
          const { text, iso } = formatDateTime(session.lastActive, labels.locale, timeZone);
          return (
            <li key={session.id} className="g-session">
              <div className="g-session-main">
                <p className="g-session-device">
                  {phrase(session.device)}
                  {session.current ? <Badge tone="success">{t.current}</Badge> : null}
                </p>
                <p className="g-session-meta">
                  {session.detail ? <span>{phrase(session.detail)}</span> : null}
                  <time dateTime={iso}>{phrase(t.lastActive(text))}</time>
                </p>
              </div>
              {session.current ? null : (
                <Button size="sm" aria-label={t.revokeFor(session.device)} onAction={() => revoke(() => onRevoke(session.id))}>
                  {t.revoke}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <SectionActions status={status}>
        {onRevokeOthers && items.some((session) => !session.current) ? <Button onAction={() => revoke(onRevokeOthers)}>{t.revokeOthers}</Button> : null}
      </SectionActions>
    </SettingsSection>
  );
}

function DeleteAccountSection({ confirmText, onDelete }: SettingsDeleteAccount): ReactNode {
  const labels = useTemplateLabels(SECTION_LABELS);
  const gassan = useLabels();
  const { common, settings } = labels;
  const t = settings.deleteAccount;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<ReactNode>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <SettingsSection tone="danger" title={t.title} description={t.description}>
      <div className="g-settings-row">
        <Button
          variant="danger"
          onClick={() => {
            setTyped('');
            setError(null);
            setOpen(true);
          }}
        >
          {t.open}
        </Button>
      </div>
      {/* 打って確かめるまで「削除する」を押せない（ゲート。押すと理由を読み、欄へ連れて行く。G-07 / G-08） */}
      <ModalRoot open={open} onOpenChange={setOpen} kind="form" initialFocus={inputRef}>
        <ModalHeader>
          <ModalTitle>{t.confirmTitle}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalDescription>{t.confirmDescription}</ModalDescription>
          <FormError>{error}</FormError>
          <ModalField label={t.typeToConfirm(confirmText)} required requiredBadge={false}>
            {(control) => (
              <ModalInput {...control} ref={inputRef} autoComplete="off" autoCapitalize="none" spellCheck={false} value={typed} onChange={(event) => setTyped(event.target.value)} />
            )}
          </ModalField>
          <ModalGate name="typed" satisfied={typed.trim() === confirmText} reason={t.mismatch(confirmText)} focus={() => inputRef.current?.focus()} />
          <ModalGateStatus gate={['typed']} />
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="tertiary" onClick={() => setOpen(false)}>
            {gassan.cancel}
          </ModalButton>
          <ModalButton
            variant="danger"
            gate={['typed']}
            onAction={async () => {
              const failure = await runAction(onDelete, common.submitFailed);
              if (failure) setError(failure);
              else setOpen(false);
            }}
          >
            {t.confirm}
          </ModalButton>
        </ModalFooter>
      </ModalRoot>
    </SettingsSection>
  );
}

/* -------------------------------------------------------------------------- */
/* SettingsPage                                                                */
/* -------------------------------------------------------------------------- */

export interface SettingsPageProps extends DataAttributes {
  title?: ReactNode;
  description?: ReactNode;
  profile?: SettingsProfile;
  password?: SettingsPassword;
  twoFactor?: SettingsTwoFactor;
  sessions?: SettingsSessions;
  deleteAccount?: SettingsDeleteAccount;
  /** 足す節（SettingsSection で書く）。アカウントの削除の節より前に並ぶ。 */
  children?: ReactNode;
  className?: string;
}

const SETTINGS_LABELS = { settings: settingsLabels } as const;

/**
 * アカウントの設定。P-13。AppShell の中に置く中身（ページの外枠は持たない）。
 *
 * 渡した設定の節だけを、プロフィール・パスワード・2 段階認証・ログインしている端末・（足した節）・アカウントの削除の順に並べる。
 * 節ごとに送信の流れ（P-03）を持ち、結果は節の下端で読み上げる。アカウントの削除は、決めた文字を打つまで押せない（ゲート）。
 */
export function SettingsPage({ title, description, profile, password, twoFactor, sessions, deleteAccount, children, className, ...rest }: SettingsPageProps): ReactNode {
  const labels = useTemplateLabels(SETTINGS_LABELS);
  return (
    <div {...domPassthrough(rest, 'SettingsPage')} className={cx('g-settings', className)}>
      <PageHeader title={title ?? labels.settings.title} description={description ?? labels.settings.description} />
      <div className="g-settings-sections">
        {profile ? <ProfileSection {...profile} /> : null}
        {password ? <PasswordSection {...password} /> : null}
        {twoFactor ? <TwoFactorSection {...twoFactor} /> : null}
        {sessions ? <SessionsSection {...sessions} /> : null}
        {children}
        {deleteAccount ? <DeleteAccountSection {...deleteAccount} /> : null}
      </div>
    </div>
  );
}
