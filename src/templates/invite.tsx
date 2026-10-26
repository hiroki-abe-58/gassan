import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { Avatar, Badge } from '../display';
import { Banner } from '../feedback';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { FormError, runAction, type SubmitResult } from './form';
import { commonLabels, inviteLabels } from './labels';
import { AuthLayout } from './layouts';
import { SiteButtonLink, useSiteConfig, useTemplateLabels } from './site';

export interface InviteAcceptPageProps extends DataAttributes {
  /** 招待されたワークスペースの名前。 */
  workspace: string;
  /** 招待した人の名前。 */
  inviter: string;
  inviterAvatarSrc?: string;
  /** 参加したときの役割（「編集者」）。 */
  role?: string;
  /** 既定 'pending'。'expired' は期限切れ、'invalid' は使えない招待（取り消された・もう使った）。 */
  status?: 'pending' | 'expired' | 'invalid';
  /** ログインしているか。false なら、ログインかアカウントの作成へ案内する（行き先は SiteProvider の links）。 */
  signedIn?: boolean;
  /** 招待の宛先と、ログインしているアカウントが違うときの、招待の宛先。 */
  wrongAccountEmail?: string;
  onAccept?: () => SubmitResult | Promise<SubmitResult>;
  onDecline?: () => SubmitResult | Promise<SubmitResult>;
  /** 別のアカウントでログインし直す（ログアウトしてからログインへ）。 */
  onSwitchAccount?: () => void | Promise<void>;
  aside?: ReactNode;
  className?: string;
}

const INVITE_LABELS = { common: commonLabels, invite: inviteLabels } as const;

/**
 * 招待を受けるページ。P-17。
 *
 * 誰が・どのワークスペースに・どの役割で招待したかを示し、受ける / 断るを置く。ログインしていなければログインと
 * アカウントの作成へ、宛先と違うアカウントなら宛先を示して別のアカウントへ案内する。期限切れ・使えない招待は、
 * 次にすることだけを書く。断ったら、その画面に切り替えて見出しへフォーカスを移す。
 */
export function InviteAcceptPage({
  workspace,
  inviter,
  inviterAvatarSrc,
  role,
  status = 'pending',
  signedIn = true,
  wrongAccountEmail,
  onAccept,
  onDecline,
  onSwitchAccount,
  aside,
  className,
  ...rest
}: InviteAcceptPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(INVITE_LABELS);
  const phrase = usePhrase();
  const { common, invite } = labels;
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const layout = { ...domPassthrough(rest, 'InviteAcceptPage'), aside, className: className ? `g-invite ${className}` : 'g-invite' };

  useEffect(() => {
    if (declined) headingRef.current?.focus();
  }, [declined]);

  const home = links.home ? (
    <SiteButtonLink href={links.home} variant="secondary" block>
      {common.home}
    </SiteButtonLink>
  ) : null;

  if (declined) {
    return (
      <AuthLayout {...layout} headingRef={headingRef} title={invite.declinedTitle} description={invite.declinedDescription}>
        {home}
      </AuthLayout>
    );
  }
  if (status !== 'pending') {
    const expired = status === 'expired';
    return (
      <AuthLayout {...layout} title={expired ? invite.expiredTitle : invite.invalidTitle} description={expired ? invite.expiredDescription : invite.invalidDescription}>
        {!expired && links.signIn ? (
          <SiteButtonLink href={links.signIn} variant="primary" block>
            {common.signIn}
          </SiteButtonLink>
        ) : null}
        {home}
      </AuthLayout>
    );
  }

  const actions = !signedIn ? (
    <>
      <p className="g-auth-hint">{phrase(invite.signedOutHint)}</p>
      {links.signIn ? (
        <SiteButtonLink href={links.signIn} variant="primary" block>
          {invite.signIn}
        </SiteButtonLink>
      ) : null}
      {links.signUp ? (
        <SiteButtonLink href={links.signUp} variant="secondary" block>
          {invite.signUp}
        </SiteButtonLink>
      ) : null}
    </>
  ) : wrongAccountEmail ? (
    <>
      <Banner tone="warning">{invite.wrongAccount(wrongAccountEmail)}</Banner>
      {onSwitchAccount ? (
        <Button variant="primary" block onAction={onSwitchAccount}>
          {invite.switchAccount}
        </Button>
      ) : null}
    </>
  ) : (
    <>
      {onAccept ? (
        <Button variant="primary" block onAction={async () => setError(await runAction(onAccept, common.submitFailed))}>
          {invite.accept}
        </Button>
      ) : null}
      {onDecline ? (
        <Button
          variant="tertiary"
          block
          onAction={async () => {
            const failure = await runAction(onDecline, common.submitFailed);
            if (failure) setError(failure);
            else setDeclined(true);
          }}
        >
          {invite.decline}
        </Button>
      ) : null}
    </>
  );

  return (
    <AuthLayout {...layout} title={invite.title(workspace)} description={invite.description(inviter, workspace)}>
      <div className="g-invite-from">
        {/* アバターは飾り。誰からかは説明の文で読む */}
        <span aria-hidden="true">
          <Avatar name={inviter} src={inviterAvatarSrc} size="md" />
        </span>
        {role ? <Badge tone="accent">{invite.role(role)}</Badge> : null}
      </div>
      <FormError>{error}</FormError>
      <div className="g-auth-actions">{actions}</div>
    </AuthLayout>
  );
}
