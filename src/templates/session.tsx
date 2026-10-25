import { Fragment, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button, IconButton } from '../button';
import { Avatar } from '../display';
import { ModalClose, ModalControls, ModalDescription, ModalHeader, ModalTitle } from '../header';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import type { CloseReason } from '../types';
import { PasswordForm, ProviderButtons, useFocusOnChange, type PasskeyHandler } from './auth-parts';
import { FormError, runAction, type SubmitResult } from './form';
import { AuthLayout } from './layouts';
import { SiteButtonLink, SiteLink, useSite } from './site';

/**
 * メールアドレスを、「@」の後と「.」の前でだけ折れるようにする（狭い器で「example.co｜m」のように語の途中で折らない）。
 * 文字列は変えない（<wbr> は読み上げに混ざらないよう aria-hidden。W-01 と同じ）。1 つの区切りが器より長いときは CSS の
 * overflow-wrap が文字単位で折る。
 */
function breakableEmail(email: string): ReactNode {
  return email.split(/(?<=@)|(?=\.)/).map((part, index) => (
    <Fragment key={index}>
      {index === 0 ? null : <wbr aria-hidden="true" />}
      {part}
    </Fragment>
  ));
}

/* -------------------------------------------------------------------------- */
/* PasskeyPromptPage                                                           */
/* -------------------------------------------------------------------------- */

export interface PasskeyPromptPageProps extends DataAttributes {
  /** パスキーを作る（WebAuthn の navigator.credentials.create は利用側が呼ぶ）。失敗なら { error }。 */
  onCreate: PasskeyHandler;
  /** 「あとで」。作らずに先へ進む。 */
  onLater: () => void;
  /** 作った後の「続ける」の行き先。無ければ onLater と同じ所へ進むボタンにする。 */
  continueHref?: string;
  aside?: ReactNode;
  className?: string;
}

/**
 * パスキーを作るかを尋ねる画面（ログインの直後に 1 度）。P-27。
 *
 * パスワードの代わりに指紋・顔・画面のロックでログインできることと、良い点（覚えなくてよい・にせのサイトで使えない・
 * 同期した端末でも使える）を言葉で並べ、「パスキーを作る」と「あとで」を同じ重さの選択として出す（作らせることを強いない）。
 * 作れたら完了の画面に切り替え、見出しへフォーカスを移す。失敗の理由は割り込ませて読む。ログインの側は SignInPage の onPasskey。
 */
export function PasskeyPromptPage({ onCreate, onLater, continueHref, aside, className, ...rest }: PasskeyPromptPageProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const { verifyEmail, passkey } = labels;
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const headingRef = useFocusOnChange(created);
  const layout = { ...domPassthrough(rest, 'PasskeyPromptPage'), className, aside, headingRef };

  if (created) {
    return (
      <AuthLayout {...layout} title={passkey.createdTitle} description={passkey.createdDescription}>
        {continueHref ? (
          <SiteButtonLink href={continueHref} variant="primary" block>
            {verifyEmail.continue}
          </SiteButtonLink>
        ) : (
          <Button variant="primary" block onClick={onLater}>
            {verifyEmail.continue}
          </Button>
        )}
      </AuthLayout>
    );
  }
  return (
    <AuthLayout {...layout} title={passkey.promptTitle} description={passkey.promptDescription}>
      <FormError>{error}</FormError>
      <ul className="g-auth-benefits">
        {passkey.benefits.map((benefit) => (
          <li key={benefit}>
            <Icon name="check" />
            <span>{phrase(benefit)}</span>
          </li>
        ))}
      </ul>
      <div className="g-auth-actions">
        <Button
          variant="primary"
          block
          onAction={async () => {
            const failure = await runAction(onCreate, passkey.failed);
            setError(failure);
            if (!failure) setCreated(true);
          }}
        >
          {passkey.create}
        </Button>
        <Button variant="tertiary" block onClick={onLater}>
          {passkey.later}
        </Button>
      </div>
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* AccountChooserPage                                                          */
/* -------------------------------------------------------------------------- */

/** この端末で前にログインしたアカウント。 */
export interface RememberedAccount {
  id: string;
  name: string;
  email: string;
  /** 顔写真の URL（無ければ頭文字）。 */
  avatar?: string;
}

export interface AccountChooserPageProps extends DataAttributes {
  accounts: readonly RememberedAccount[];
  /** アカウントを選んだとき（パスワードやパスキーの画面へ進む）。 */
  onChoose: (account: RememberedAccount) => void;
  /** 「別のアカウントを使う」。 */
  onUseAnother: () => void;
  /** 渡すと、アカウントごとに「この端末から外す」を出す。 */
  onRemove?: (account: RememberedAccount) => void;
  title?: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/**
 * この端末で使ったアカウントから選ぶ（2 回目からのログイン）。P-28。
 *
 * アカウントごとに顔（頭文字）・名前・メールアドレスを並べた 1 つのボタンにし、押すとそのアカウントのログインへ進む
 * （メールアドレスを打ち直させない）。「別のアカウントを使う」をいつも出す。外すボタンは名前つき（「〜をこの端末から外す」）で、
 * 外したら結果を role="status" で知らせ、フォーカスを次のアカウント（無ければ「別のアカウントを使う」）へ移す。
 */
export function AccountChooserPage({
  accounts,
  onChoose,
  onUseAnother,
  onRemove,
  title,
  description,
  aside,
  className,
  ...rest
}: AccountChooserPageProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const { accountChooser } = labels;
  const [status, setStatus] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const anotherRef = useRef<HTMLButtonElement>(null);

  const remove = (account: RememberedAccount, index: number): void => {
    onRemove?.(account);
    setStatus(accountChooser.removed(account.email));
    // 外した行は消えるので、次の行（無ければ前の行、どれも無ければ「別のアカウントを使う」）へ
    requestAnimationFrame(() => {
      const rows = listRef.current?.querySelectorAll<HTMLButtonElement>('.g-account-choice');
      const target = rows?.[Math.min(index, rows.length - 1)] ?? anotherRef.current;
      target?.focus();
    });
  };

  return (
    <AuthLayout
      {...domPassthrough(rest, 'AccountChooserPage')}
      className={className}
      aside={aside}
      title={title ?? accountChooser.title}
      description={description ?? accountChooser.description}
    >
      <ul ref={listRef} className="g-account-list" aria-label={accountChooser.list}>
        {accounts.map((account, index) => (
          <li key={account.id} className="g-account-row">
            <button type="button" className="g-account-choice" onClick={() => onChoose(account)}>
              <Avatar name={account.name} src={account.avatar} size="sm" />
              <span className="g-account-text">
                <span className="g-account-name">{phrase(account.name)}</span>
                <span className="g-account-email">{breakableEmail(account.email)}</span>
              </span>
              <Icon name="chevronRight" className="g-account-go" />
            </button>
            {onRemove ? (
              <IconButton label={accountChooser.remove(account.email)} onClick={() => remove(account, index)}>
                <Icon name="close" />
              </IconButton>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="g-auth-switch">
        <button ref={anotherRef} type="button" className="g-auth-link" onClick={onUseAnother}>
          {phrase(accountChooser.useAnother)}
        </button>
      </p>
      {/* 空の間は流れから外す（カードの下に余白を作らない） */}
      <p className="g-auth-hint g-live" role="status">
        {status ? phrase(status) : null}
      </p>
    </AuthLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* ReauthDialog                                                                */
/* -------------------------------------------------------------------------- */

export interface ReauthDialogProps extends DataAttributes {
  open: boolean;
  onOpenChange: (open: boolean, reason: CloseReason) => void;
  /**
   * 'confirm'（既定）は大事な操作の前の本人確認（パスワードの変更・削除・支払い）。閉じれば操作をやめる。
   * 'expired' はログインの期限切れ。入力中の内容を残したままログインし直す。閉じられず、別のアカウントでログインする道を出す。
   */
  reason?: 'confirm' | 'expired';
  /** ログインしているアカウント。 */
  email: string;
  /** パスワードを確かめる。違えば { error: true }（パスワードを消して欄へ戻す）。 */
  onConfirm: (values: { password: string }) => SubmitResult | Promise<SubmitResult>;
  /** 確かめられたとき。窓はこの後に閉じる。 */
  onSuccess?: () => void;
  /** パスキーで確かめる。 */
  onPasskey?: PasskeyHandler;
  /** 'expired' の「別のアカウントでログイン」の行き先。既定は SiteProvider の links.signIn。 */
  signInHref?: string;
  className?: string;
}

/**
 * もう一度パスワードを聞く窓（大事な操作の前の本人確認と、ログインの期限切れ）。P-29。
 *
 * ページを離れずにパスワード（かパスキー）だけを聞き、入力中の内容と開いていた画面を失わせない。アカウントは変えられない形で示し、
 * 隠した username の欄でパスワード管理ソフトに渡す。違っていたらパスワードを消して欄へ戻す。'expired' は閉じるボタンと Esc を
 * 持たない（ログインし直すか、別のアカウントでログインするかを選ぶ）。
 */
export function ReauthDialog({
  open,
  onOpenChange,
  reason = 'confirm',
  email,
  onConfirm,
  onSuccess,
  onPasskey,
  signInHref,
  className,
  ...rest
}: ReauthDialogProps): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const { signIn, reauth } = labels;
  const expired = reason === 'expired';
  const done = (): void => {
    onSuccess?.();
    onOpenChange(false, 'programmatic');
  };
  const another = signInHref ?? links.signIn;

  return (
    <ModalRoot
      {...domPassthrough(rest, 'ReauthDialog')}
      open={open}
      onOpenChange={onOpenChange}
      kind="form"
      size="sm"
      dismiss={expired ? { esc: false, backdrop: false } : undefined}
      className={className ? `g-auth-dialog ${className}` : 'g-auth-dialog'}
    >
      <ModalHeader>
        {/* 閉じるボタンが無くても操作の段は置く（見出しの位置をほかの窓とそろえる。命令的な確認と同じ） */}
        <ModalControls end={expired ? undefined : <ModalClose />} />
        <ModalTitle>{expired ? reauth.expiredTitle : reauth.confirmTitle}</ModalTitle>
        <ModalDescription>{expired ? reauth.expiredDescription : reauth.confirmDescription}</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <div className="g-auth-dialog-body">
          <p className="g-auth-identity">{breakableEmail(email)}</p>
          <ProviderButtons onPasskey={onPasskey} onPasskeyDone={done} />
          <PasswordForm
            email={email}
            onSubmit={onConfirm}
            onSuccess={done}
            submit={expired ? signIn.submit : reauth.confirm}
            failed={reauth.failed}
          />
          {expired && another ? (
            <p className="g-auth-switch">
              <SiteLink href={another} className="g-auth-link">
                {phrase(reauth.signInAnother)}
              </SiteLink>
            </p>
          ) : null}
        </div>
      </ModalBody>
    </ModalRoot>
  );
}

