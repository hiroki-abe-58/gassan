import { useState, type ReactNode } from 'react';

import {
  AccountChooserPage,
  AddressFields,
  AuthDialog,
  BirthDateInput,
  Button,
  DescriptionList,
  EmailFirstPage,
  Field,
  GuestAccountCard,
  Input,
  MagicLinkPage,
  NameFields,
  NativeSelect,
  PageHeader,
  PasskeyPromptPage,
  PhoneSignInPage,
  QuickSignUpPage,
  ReauthDialog,
  RegistrationWizardPage,
  SiteLayout,
  Textarea,
  normalizePhone,
  toast,
  type AuthDialogMode,
  type EmailFirstNext,
  type JapaneseAddress,
  type PersonName,
  type PostalAddress,
} from '@genelab/gassan';

import { POSTAL_SAMPLES } from '../data/japan';
import { useT } from '../i18n';
import { AtlasApp } from './AppPreviews';
import { USER_EMAIL, go, preview, wait } from './shared';

/** 見本のパスワードと確認コード（ほかの見本と同じ）。 */
const PASSWORD = 'gassan';
const CODE = '123456';
const SENDER = 'example.com';

/** 見本の郵便番号の表から引く（住所の欄の見本と同じ。待ち時間を真似る）。 */
const lookup = (postalCode: string): Promise<readonly PostalAddress[]> => wait(300).then(() => POSTAL_SAMPLES[postalCode] ?? []);

/** ログインの見本の応え（パスワードは「gassan」で通る）。 */
function useSignIn() {
  const s = useT().templateSamples;
  return async ({ password }: { password: string }) => {
    await wait(700);
    if (password !== PASSWORD) return { error: true as const };
    toast.success(s.signedIn);
    return undefined;
  };
}

/** 確認コードの見本の応え（「123456」で通る）。 */
function useCode() {
  const s = useT().templateSamples;
  return async ({ code }: { code: string }) => {
    await wait(600);
    if (code !== CODE) return { error: true as const };
    toast.success(s.signedIn);
    return undefined;
  };
}

/** ヘッダの「ログイン」「無料で始める」から窓を開く（P-21）。 */
function DialogSample(): ReactNode {
  const { templateSamples: s, authPatterns } = useT();
  const a = authPatterns.samples;
  const signIn = useSignIn();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>('signIn');
  const openAs = (next: AuthDialogMode): void => {
    setMode(next);
    setOpen(true);
  };
  return (
    <SiteLayout
      actions={
        <>
          <Button variant="tertiary" onClick={() => openAs('signIn')}>
            {a.signIn}
          </Button>
          <Button variant="primary" onClick={() => openAs('signUp')}>
            {a.startFree}
          </Button>
        </>
      }
    >
      <div className="s-preview-hero">
        <PageHeader title={a.heroTitle} description={a.heroDescription} />
      </div>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        providers={[{ id: 'google', name: 'Google', onClick: () => toast(s.providerNotice) }]}
        onSignIn={signIn}
        onSignUp={async () => {
          await wait(900);
          toast.success(a.signedUp);
        }}
        onForgotPassword={() => wait(700)}
        sender={SENDER}
        resendAfter={20}
      />
    </SiteLayout>
  );
}

/** 本登録の手順（P-25）。住所・名前・生年月日は日本の入力の部品（I-27〜I-29）で組む。 */
function WizardSample(): ReactNode {
  const a = useT().authPatterns.samples.wizard;
  const [name, setName] = useState<PersonName>({ familyName: '', givenName: '', familyNameKana: '', givenNameKana: '' });
  const [birth, setBirth] = useState<string | null>(null);
  const [address, setAddress] = useState<JapaneseAddress>({ postalCode: '', prefecture: '', city: '', line1: '', line2: '' });
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const fullName = [name.familyName, name.givenName].filter(Boolean).join(' ');
  const kana = [name.familyNameKana, name.givenNameKana].filter(Boolean).join(' ');
  return (
    <RegistrationWizardPage
      steps={[
        {
          id: 'profile',
          title: a.profileTitle,
          description: a.profileDescription,
          content: (
            <>
              <NameFields label={a.name} required value={name} onValueChange={setName} />
              <BirthDateInput label={a.birth} required value={birth} onValueChange={setBirth} />
            </>
          ),
          validate: () => (name.familyName && name.givenName && birth ? null : a.profileRequired),
          summary: [
            { label: a.name, value: kana ? `${fullName}（${kana}）` : fullName },
            { label: a.birth, value: birth ?? '' },
          ],
        },
        {
          id: 'address',
          title: a.addressTitle,
          description: a.addressDescription,
          content: (
            <>
              <AddressFields label={a.address} required lookup={lookup} value={address} onValueChange={setAddress} />
              <Field label={a.phone} required>
                {(control) => <Input {...control} type="tel" autoComplete="tel" normalize={normalizePhone} value={phone} onChange={(event) => setPhone(event.target.value)} />}
              </Field>
            </>
          ),
          validate: () => (address.postalCode && address.prefecture && address.city && address.line1 && phone ? null : a.addressRequired),
          summary: [
            { label: a.address, value: `〒${address.postalCode} ${address.prefecture}${address.city}${address.line1} ${address.line2}`.trim() },
            { label: a.phone, value: phone },
          ],
        },
        {
          id: 'purpose',
          title: a.purposeTitle,
          description: a.purposeDescription,
          optional: true,
          content: (
            <Field label={a.purpose}>
              {(control) => (
                <NativeSelect
                  {...control}
                  placeholder={a.choose}
                  options={a.purposes.map((label) => ({ value: label, label }))}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                />
              )}
            </Field>
          ),
          summary: [{ label: a.purpose, value: purpose || a.notAnswered }],
        },
      ]}
      onSave={() => wait(300)}
      onSaveAndExit={() => toast(a.savedExit)}
      onSubmit={() => wait(900)}
      done={
        <Button variant="primary" block onClick={() => go('passkey-prompt')}>
          {a.doneNext}
        </Button>
      }
    />
  );
}

/**
 * ログインした後のアプリの中で、もう一度パスワードを聞く（P-29）。
 * パスワードを変える前の本人確認（設定）と、書きかけの報告を残したままのログインの期限切れ（ホーム）。
 * どちらも押してから開く（開いたまま読み込むと、ドキュメントのページのフォーカスが iframe の中の窓へ移ってしまう）。
 */
function ReauthSample({ expired }: { expired: boolean }): ReactNode {
  const a = useT().authPatterns.samples;
  const signIn = useSignIn();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(a.expiredDraft);
  return (
    <AtlasApp page={expired ? 'app-dashboard' : 'app-settings'}>
      <div className="s-preview-hero">
        <PageHeader title={expired ? a.expiredTitle : a.securityTitle} description={expired ? a.expiredDescription : a.securityDescription} />
        {expired ? (
          <Field label={a.expiredLabel}>{(control) => <Textarea {...control} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />}</Field>
        ) : null}
        <Button variant={expired ? 'secondary' : 'primary'} onClick={() => setOpen(true)}>
          {expired ? a.expire : a.changePassword}
        </Button>
      </div>
      <ReauthDialog
        open={open}
        onOpenChange={setOpen}
        reason={expired ? 'expired' : 'confirm'}
        email={USER_EMAIL}
        onConfirm={signIn}
        onSuccess={() => toast.success(expired ? a.expiredDone : a.securityDone)}
        signInHref={preview('account-chooser')}
      />
    </AtlasApp>
  );
}

/** 注文を終えた画面の、アカウントを作るカード（P-30）。 */
function GuestSample(): ReactNode {
  const { templateSamples: s, authPatterns } = useT();
  const a = authPatterns.samples;
  return (
    <SiteLayout>
      <div className="s-preview-hero">
        <PageHeader title={a.orderTitle} description={a.orderDescription} />
        <DescriptionList items={a.orderRows.map((row) => ({ term: row.term, details: row.details }))} />
        <GuestAccountCard email={s.email} onCreate={() => wait(800)} onDismiss={() => toast(a.guestLater)} />
      </div>
    </SiteLayout>
  );
}

/** ログインと登録の形を変えたものの見本（#/preview/<name>）。名前の一覧は TemplatePreview の PREVIEWS にある。 */
export function AuthPatternPreview({ name }: { name: string }): ReactNode {
  const { templates, templateSamples: s, authPatterns } = useT();
  const a = authPatterns.samples;
  const signIn = useSignIn();
  const code = useCode();
  const [accounts, setAccounts] = useState(a.accounts);

  switch (name) {
    case 'auth-dialog':
      return <DialogSample />;
    case 'email-first':
      return (
        <EmailFirstPage
          description={`${templates.emailFirst.description} ${a.emailFirstHint}`}
          onContinue={async (email): Promise<EmailFirstNext> => {
            await wait(500);
            if (email.endsWith('@corp.example.com')) return { next: 'sso', provider: 'Okta' };
            if (email.startsWith('new')) return { next: 'signUp' };
            if (email.startsWith('link')) {
              toast(s.twoFactorHint);
              return { next: 'link' };
            }
            return { next: 'password' };
          }}
          onSignIn={signIn}
          onSignUp={async () => {
            await wait(900);
            toast.success(a.signedUp);
          }}
          onSso={() => toast(s.providerNotice)}
          onCode={code}
          onResendLink={() => wait(600)}
          sender={SENDER}
          resendAfter={20}
        />
      );
    case 'magic-link':
      return (
        <MagicLinkPage
          onSend={async () => {
            await wait(700);
            toast(s.twoFactorHint);
          }}
          onCode={code}
          sender={SENDER}
          resendAfter={20}
          passwordHref={preview('sign-in')}
        />
      );
    case 'quick-sign-up':
      return <QuickSignUpPage onSubmit={() => wait(800)} expiresIn={a.expiresIn} steps={a.quickSteps} sender={SENDER} resendAfter={20} />;
    case 'registration-wizard':
      return <WizardSample />;
    case 'phone-sign-in':
      return (
        <PhoneSignInPage
          onSend={async () => {
            await wait(700);
            toast(s.twoFactorHint);
          }}
          onVerify={code}
          resendAfter={20}
          other={{ href: preview('sign-in'), label: a.useEmail }}
        />
      );
    case 'passkey-prompt':
      return <PasskeyPromptPage onCreate={() => wait(800)} onLater={() => go('app-dashboard')} continueHref={preview('app-dashboard')} />;
    case 'account-chooser':
      return (
        <AccountChooserPage
          accounts={accounts}
          onChoose={() => go('email-first')}
          onUseAnother={() => go('email-first')}
          onRemove={(account) => setAccounts((list) => list.filter((item) => item.id !== account.id))}
        />
      );
    case 'reauth':
      return <ReauthSample expired={false} />;
    case 'session-expired':
      return <ReauthSample expired />;
    case 'guest-account':
      return <GuestSample />;
    default:
      return null;
  }
}
