import { useId, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button, IconButton } from '../button';
import { DataTable, type DataTableColumn } from '../data-table';
import { Avatar, Badge } from '../display';
import { Progress } from '../feedback';
import { ModalField } from '../fields';
import { ModalButton, ModalFooter } from '../footer';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { ModalSearchInput, ModalTextarea } from '../inputs';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { useLabels } from '../labels';
import { Menu } from '../overlay';
import { PageHeader } from '../page-header';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { ModalSelect, normalizeForMatch } from '../select';
import { ModalTagInput } from '../tag-input';
import { FormError, formatDateTime, looksLikeEmail, runAction, type SubmitResult } from './form';
import { commonLabels, membersLabels } from './labels';
import { ConfirmDialog, useNotice } from './page-parts';
import { useTemplateLabels, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  /** 役割の値（roles の value）。 */
  role: string;
  /** 既定 'active'。 */
  status?: 'active' | 'invited' | 'suspended';
  /** アバターの画像。無ければ名前の頭文字。 */
  avatarSrc?: string;
  /** 最後にログインした日時（Date か ISO 8601 の文字列）。 */
  lastActive?: Date | string;
}

export interface MemberRole {
  value: string;
  label: string;
}

export interface MemberInvitation {
  id: string;
  email: string;
  role: string;
  /** 招待した日時。 */
  sentAt: Date | string;
}

export interface MemberInviteValues {
  emails: string[];
  role: string;
  message: string;
}

export interface MembersPageProps extends DataAttributes {
  members: readonly WorkspaceMember[];
  roles: readonly MemberRole[];
  /** 自分の id。自分の行は選べず、外せず、役割も変えられない。 */
  currentUserId?: string;
  /** 渡すと「メンバーを招待」を出す。 */
  onInvite?: (values: MemberInviteValues) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと、役割の欄をセレクトにする。 */
  onRoleChange?: (id: string, role: string) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと、行を選んでまとめて外せる。 */
  onRemove?: (ids: string[]) => SubmitResult | Promise<SubmitResult>;
  invitations?: readonly MemberInvitation[];
  onResend?: (id: string) => SubmitResult | Promise<SubmitResult>;
  onRevoke?: (id: string) => SubmitResult | Promise<SubmitResult>;
  /** 使っている席と、席の数。 */
  seats?: { used: number; total: number };
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const MEMBERS_LABELS = { common: commonLabels, members: membersLabels } as const;

/**
 * ワークスペースのメンバー。P-14。AppShell の中に置く中身。
 *
 * 見出しの帯の「メンバーを招待」・使っている席・名前とメールアドレスでの絞り込み・メンバーの表（U-26。並べ替え・選択・
 * まとめて外す・行の操作）・招待中の一覧を並べる。招待はモーダルで、メールアドレスをタグとしてまとめて入れる。
 * 外すときは確かめるモーダルを挟む。自分の行は選べず、外せず、役割も変えられない。結果は知らせの帯で読み上げる。
 */
export function MembersPage({
  members,
  roles,
  currentUserId,
  onInvite,
  onRoleChange,
  onRemove,
  invitations,
  onResend,
  onRevoke,
  seats,
  title,
  description,
  className,
  ...rest
}: MembersPageProps): ReactNode {
  const labels = useTemplateLabels(MEMBERS_LABELS);
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const { common, members: m } = labels;
  const base = useId();
  const invitationsId = `${base}-invitations`;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { notice, report, show } = useNotice();
  const [removing, setRemoving] = useState<string[] | null>(null);
  const [inviting, setInviting] = useState(false);
  // 外した行は消えるので、済んだらフォーカスを探す欄へ移す
  const searchRef = useRef<HTMLInputElement>(null);

  const roleLabel = (value: string): string => roles.find((role) => role.value === value)?.label ?? value;
  const nameOf = (id: string): string => members.find((member) => member.id === id)?.name ?? id;
  const needle = normalizeForMatch(query.trim());
  const shown = needle ? members.filter((member) => normalizeForMatch(`${member.name} ${member.email}`).includes(needle)) : members;

  const columns: DataTableColumn<WorkspaceMember>[] = [
    {
      key: 'name',
      header: m.name,
      cell: (member) => (
        <span className="g-member">
          {/* アバターは飾り。名前は文字で読む（行を選ぶチェックボックスの名前にもなる） */}
          <span aria-hidden="true" className="g-member-avatar">
            <Avatar name={member.name} src={member.avatarSrc} size="sm" />
          </span>
          <span className="g-member-text">
            <span className="g-member-name">
              {member.name}
              {member.id === currentUserId ? <Badge>{m.you}</Badge> : null}
            </span>
            <span className="g-member-email">{member.email}</span>
          </span>
        </span>
      ),
      sortValue: (member) => member.name,
    },
    {
      key: 'role',
      header: m.role,
      cell: (member) =>
        onRoleChange && member.id !== currentUserId ? (
          <ModalSelect
            aria-label={m.roleFor(member.name)}
            className="g-member-role"
            options={roles}
            value={member.role}
            onValueChange={(role) => {
              void runAction(() => onRoleChange(member.id, role), common.submitFailed).then((failure) => report(failure, m.roleChanged(member.name, roleLabel(role))));
            }}
          />
        ) : (
          roleLabel(member.role)
        ),
      sortValue: (member) => roleLabel(member.role),
    },
    {
      key: 'status',
      header: m.status,
      cell: (member) => {
        const status = member.status ?? 'active';
        return <Badge tone={status === 'active' ? 'success' : status === 'invited' ? 'info' : 'warning'}>{m.statuses[status]}</Badge>;
      },
    },
    {
      key: 'lastActive',
      header: m.lastActive,
      cell: (member) => {
        if (!member.lastActive) return '—';
        const { text, iso } = formatDateTime(member.lastActive, labels.locale, timeZone);
        return <time dateTime={iso}>{text}</time>;
      },
      sortValue: (member) => (member.lastActive ? new Date(member.lastActive) : null),
      align: 'end',
    },
  ];

  const invitationColumns: DataTableColumn<MemberInvitation>[] = [
    { key: 'email', header: common.email, cell: (invitation) => invitation.email },
    { key: 'role', header: m.role, cell: (invitation) => roleLabel(invitation.role) },
    {
      key: 'sentAt',
      header: m.invitedAt,
      cell: (invitation) => {
        const { text, iso } = formatDateTime(invitation.sentAt, labels.locale, timeZone);
        return <time dateTime={iso}>{text}</time>;
      },
      align: 'end',
    },
  ];

  return (
    <div {...domPassthrough(rest, 'MembersPage')} className={cx('g-members', className)}>
      <PageHeader
        title={title ?? m.title}
        description={description ?? m.description}
        actions={
          onInvite ? (
            <Button variant="primary" onClick={() => setInviting(true)}>
              {m.invite}
            </Button>
          ) : undefined
        }
      />
      {notice}
      {seats ? (
        <Progress
          className="g-members-seats"
          label={m.seats}
          value={seats.used}
          max={seats.total}
          tone={seats.used >= seats.total ? 'warning' : undefined}
          valueText={(used, total) => m.seatsValue(used, total)}
        />
      ) : null}
      <div className="g-members-toolbar">
        <ModalSearchInput ref={searchRef} aria-label={m.search} placeholder={m.search} value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <DataTable
        label={m.title}
        columns={columns}
        rows={shown}
        getRowId={(member) => member.id}
        selectable={Boolean(onRemove)}
        canSelect={(member) => member.id !== currentUserId}
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={
          onRemove
            ? (ids) => (
                <Button size="sm" onClick={() => setRemoving(ids)}>
                  {m.remove}
                </Button>
              )
            : undefined
        }
        rowActions={
          onRemove
            ? (member) =>
                member.id === currentUserId ? null : (
                  <Menu
                    align="end"
                    trigger={
                      <IconButton label={m.actionsFor(member.name)} size="sm">
                        <Icon name="more" />
                      </IconButton>
                    }
                    items={[{ value: 'remove', label: m.remove, tone: 'danger' }]}
                    onSelect={() => setRemoving([member.id])}
                  />
                )
            : undefined
        }
        empty={needle ? phrase(m.noMatch(query.trim())) : undefined}
      />

      {invitations && invitations.length > 0 ? (
        <section className="g-members-invitations" aria-labelledby={invitationsId}>
          <h2 id={invitationsId} className="g-app-subtitle">
            {phrase(m.invitations)}
          </h2>
          <DataTable
            label={m.invitations}
            columns={invitationColumns}
            rows={invitations}
            getRowId={(invitation) => invitation.id}
            rowActions={
              onResend || onRevoke
                ? (invitation) => (
                    <>
                      {onResend ? (
                        <Button
                          size="sm"
                          aria-label={m.resendFor(invitation.email)}
                          onAction={async () => report(await runAction(() => onResend(invitation.id), common.submitFailed), m.resent(invitation.email))}
                        >
                          {m.resend}
                        </Button>
                      ) : null}
                      {onRevoke ? (
                        <Button
                          size="sm"
                          variant="tertiary"
                          aria-label={m.revokeFor(invitation.email)}
                          onAction={async () => report(await runAction(() => onRevoke(invitation.id), common.submitFailed), m.revoked(invitation.email))}
                        >
                          {m.revoke}
                        </Button>
                      ) : null}
                    </>
                  )
                : undefined
            }
          />
        </section>
      ) : null}

      {onInvite ? (
        <InviteModal
          open={inviting}
          onOpenChange={setInviting}
          roles={roles}
          onInvite={onInvite}
          onSent={(count) => show(m.sent(count))}
        />
      ) : null}

      {onRemove ? (
        <ConfirmDialog
          open={removing !== null}
          onClose={() => setRemoving(null)}
          title={removing && removing.length === 1 ? m.removeTitle(nameOf(removing[0] ?? '')) : m.removeManyTitle(removing?.length ?? 0)}
          description={m.removeDescription}
          confirm={m.remove}
          onConfirm={() => onRemove(removing ?? [])}
          onDone={() => {
            const ids = removing ?? [];
            setSelected((current) => current.filter((id) => !ids.includes(id)));
            show(m.removed(ids.length));
          }}
          fallbackFocus={searchRef}
        />
      ) : null}
    </div>
  );
}

/** 招待のモーダル。メールアドレスはタグとしてまとめて入れ、形の合わないものは付けずに欄に残す。 */
function InviteModal({
  open,
  onOpenChange,
  roles,
  onInvite,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: readonly MemberRole[];
  onInvite: (values: MemberInviteValues) => SubmitResult | Promise<SubmitResult>;
  onSent: (count: number) => void;
}): ReactNode {
  const labels = useTemplateLabels(MEMBERS_LABELS);
  const gassan = useLabels();
  const { common, members: m } = labels;
  const firstRole = roles[0]?.value ?? '';
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState(firstRole);
  const [message, setMessage] = useState('');
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const emailsRef = useRef<HTMLDivElement>(null);
  const close = (): void => {
    onOpenChange(false);
    setEmails([]);
    setRole(firstRole);
    setMessage('');
    setMissing(false);
    setError(null);
  };
  return (
    <ModalRoot open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())} kind="form">
      <ModalHeader>
        <ModalTitle>{m.invite}</ModalTitle>
        <ModalDescription>{m.inviteDescription}</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <FormError>{error}</FormError>
        <div ref={emailsRef}>
          <ModalField label={m.emails} help={m.emailsHelp} required error={missing ? m.emailsRequired : undefined}>
            {(control) => (
              <ModalTagInput
                {...control}
                value={emails}
                validate={looksLikeEmail}
                onValueChange={(next) => {
                  setEmails(next);
                  if (next.length > 0) setMissing(false);
                }}
              />
            )}
          </ModalField>
        </div>
        <ModalField label={m.role} required requiredBadge={false}>
          {(control) => <ModalSelect {...control} options={roles} value={role} onValueChange={setRole} />}
        </ModalField>
        <ModalField label={m.message}>
          {(control) => <ModalTextarea {...control} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} />}
        </ModalField>
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="tertiary" onClick={close}>
          {gassan.cancel}
        </ModalButton>
        <ModalButton
          variant="primary"
          onAction={async () => {
            if (emails.length === 0) {
              setMissing(true);
              emailsRef.current?.querySelector('input')?.focus();
              return;
            }
            const failure = await runAction(() => onInvite({ emails, role, message }), common.submitFailed);
            if (failure) {
              setError(failure);
              return;
            }
            onSent(emails.length);
            close();
          }}
        >
          {m.send}
        </ModalButton>
      </ModalFooter>
    </ModalRoot>
  );
}
