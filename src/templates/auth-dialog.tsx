import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { ModalClose, ModalControls, ModalDescription, ModalHeader, ModalTitle } from '../header';
import { useControllable } from '../internal/controllable';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import type { CloseReason } from '../types';
import {
  EmailForm,
  NotReceived,
  Resend,
  SignInForm,
  SignUpForm,
  SwitchButton,
  type AuthProvider,
  type PasskeyHandler,
  type SignInValues,
  type SignUpValues,
} from './auth-parts';
import type { SubmitResult } from './form';
import { useSite } from './site';

/** 窓に出している画面。 */
export type AuthDialogMode = 'signIn' | 'signUp' | 'forgotPassword';

export interface AuthDialogProps extends DataAttributes {
  open: boolean;
  onOpenChange: (open: boolean, reason: CloseReason) => void;
  /** 出している画面（ログイン・登録・パスワードの再設定）。渡すと制御になる。 */
  mode?: AuthDialogMode;
  /** 開いたときの画面。ヘッダの「ログイン」なら 'signIn'、「無料で始める」なら 'signUp'。既定 'signIn'。 */
  defaultMode?: AuthDialogMode;
  onModeChange?: (mode: AuthDialogMode) => void;
  onSignIn: (values: SignInValues) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと、ログインと登録を窓の中で切り替えられる。 */
  onSignUp?: (values: SignUpValues) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと「パスワードを忘れた場合」から、窓の中で再設定のメールを送れる。 */
  onForgotPassword?: (values: { email: string }) => SubmitResult | Promise<SubmitResult>;
  /** ログインか登録が済んだとき（onSignIn / onSignUp が error を返さなかった）。窓はこの後に閉じる。 */
  onSuccess?: (mode: 'signIn' | 'signUp') => void;
  providers?: readonly AuthProvider[];
  onPasskey?: PasskeyHandler;
  /** 「ログインしたままにする」を出すか。既定 true。 */
  remember?: boolean;
  /** 登録の名前の欄と規約への同意。既定 true。 */
  nameField?: boolean;
  consent?: boolean;
  passwordMinLength?: number;
  /** 確認のメールの送り主（携帯会社のメールへの注意）。 */
  sender?: string;
  /** 再設定のメールを送り直すまでの秒数。既定 60。 */
  resendAfter?: number;
  className?: string;
}

/**
 * 窓で出すログインと登録。P-21。
 *
 * ヘッダの「ログイン」「無料で始める」から、いまのページを離れずに開く（kind="form"。外を押しても閉じず、Esc と閉じるボタンで閉じる）。
 * 中身はログインのページ・登録のページ・再設定のページと同じフォーム（P-02 / P-04）で、窓の中で行き来できる。
 * 打ったメールアドレスは画面を切り替えても引き継ぐ。切り替えたら新しい画面の最初の欄へフォーカスを移す。
 * ログインか登録が済んだら閉じ、開いた起点へフォーカスを戻す（L 系の約束どおり）。
 */
export function AuthDialog({
  open,
  onOpenChange,
  mode,
  defaultMode = 'signIn',
  onModeChange,
  onSignIn,
  onSignUp,
  onForgotPassword,
  onSuccess,
  providers,
  onPasskey,
  remember = true,
  nameField = true,
  consent = true,
  passwordMinLength = 8,
  sender,
  resendAfter = 60,
  className,
  ...rest
}: AuthDialogProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const { common, signIn, signUp, forgotPassword } = labels;
  const [current, setCurrent] = useControllable<AuthDialogMode>(mode, defaultMode, onModeChange);
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const switched = useRef(false);

  // 画面を切り替えたら、新しい画面の最初の欄へ（開いた直後は窓の初めのフォーカスに任せる）
  useEffect(() => {
    if (!switched.current) return;
    switched.current = false;
    bodyRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), button')?.focus();
  }, [current, sentTo]);

  // 閉じたら、次に開いたときは選んだ画面の初めから
  useEffect(() => {
    if (open) return;
    setSentTo(null);
  }, [open]);

  const go = (next: AuthDialogMode): void => {
    switched.current = true;
    setSentTo(null);
    setCurrent(next);
  };
  const done = (which: 'signIn' | 'signUp'): void => {
    onSuccess?.(which);
    onOpenChange(false, 'programmatic');
  };
  const switchTo = (lead: string, label: string, next: AuthDialogMode): ReactNode => <SwitchButton lead={lead} label={label} onClick={() => go(next)} />;

  const view =
    current === 'forgotPassword' && onForgotPassword
      ? {
          title: sentTo === null ? forgotPassword.title : forgotPassword.sentTitle,
          description: sentTo === null ? forgotPassword.description : forgotPassword.sentDescription(sentTo),
          body:
            sentTo === null ? (
              <EmailForm
                onSubmit={onForgotPassword}
                onSent={(to) => {
                  switched.current = true;
                  setSentTo(to);
                }}
                submit={forgotPassword.submit}
                defaultEmail={email}
              />
            ) : (
              <>
                <Resend onResend={() => onForgotPassword({ email: sentTo })} resendAfter={resendAfter} />
                <NotReceived sender={sender} />
              </>
            ),
          after: <SwitchButton label={common.backToSignIn} onClick={() => go('signIn')} />,
        }
      : current === 'signUp' && onSignUp
        ? {
            title: signUp.title,
            description: signUp.description,
            body: (
              <SignUpForm
                onSubmit={onSignUp}
                onSuccess={() => done('signUp')}
                providers={providers}
                nameField={nameField}
                consent={consent}
                passwordMinLength={passwordMinLength}
                defaultEmail={email}
                sender={sender}
                onEmailChange={setEmail}
              />
            ),
            after: switchTo(signUp.hasAccount, common.signIn, 'signIn'),
          }
        : {
            title: signIn.title,
            description: signIn.description,
            body: (
              <SignInForm
                onSubmit={onSignIn}
                onSuccess={() => done('signIn')}
                providers={providers}
                onPasskey={onPasskey}
                remember={remember}
                defaultEmail={email}
                onEmailChange={setEmail}
                forgot={
                  onForgotPassword ? (
                    <button type="button" className="g-auth-link" onClick={() => go('forgotPassword')}>
                      {phrase(signIn.forgot)}
                    </button>
                  ) : null
                }
              />
            ),
            after: onSignUp ? switchTo(signIn.noAccount, common.signUp, 'signUp') : null,
          };

  return (
    <ModalRoot
      {...domPassthrough(rest, 'AuthDialog')}
      open={open}
      onOpenChange={onOpenChange}
      kind="form"
      size="sm"
      className={className ? `g-auth-dialog ${className}` : 'g-auth-dialog'}
    >
      <ModalHeader>
        <ModalControls end={<ModalClose />} />
        <ModalTitle>{view.title}</ModalTitle>
        <ModalDescription>{view.description}</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <div ref={bodyRef} className="g-auth-dialog-body" key={`${current}-${sentTo === null ? 'form' : 'sent'}`}>
          {view.body}
          {view.after}
        </div>
      </ModalBody>
    </ModalRoot>
  );
}
