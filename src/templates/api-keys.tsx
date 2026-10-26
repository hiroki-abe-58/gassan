import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button, CopyButton } from '../button';
import { ModalCheckboxGroup } from '../choices';
import { DataTable, type DataTableColumn } from '../data-table';
import { Badge } from '../display';
import { ModalField, ModalFieldset } from '../fields';
import { ModalButton, ModalFooter } from '../footer';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { ModalInput } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { useLabels } from '../labels';
import { PageHeader } from '../page-header';
import { ModalRoot } from '../root';
import { ModalSelect } from '../select';
import { FormError, formatDate, formatDateTime, type SubmitResult } from './form';
import { apiKeysLabels, commonLabels } from './labels';
import { ConfirmDialog, useNotice } from './page-parts';
import { useTemplateLabels, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface ApiKeyScope {
  value: string;
  label: string;
  /** できること。選ぶ欄の説明になる。 */
  description?: ReactNode;
}

export interface ApiKey {
  id: string;
  name: string;
  /** 見分けるための一部（「sk_live_…4f2a」）。キーそのものは渡さない。 */
  hint: string;
  /** 持っている権限（scopes の value）。 */
  scopes?: readonly string[];
  /** 作った日時（Date か ISO 8601）。 */
  createdAt: Date | string;
  /** 有効期限。省略か null は期限なし。 */
  expiresAt?: Date | string | null;
  /** 最後に使った日時。省略か null は、まだ使っていない。 */
  lastUsedAt?: Date | string | null;
  /** 期限が切れているか。今の時刻で決めるとサーバーとブラウザで食い違うので、利用側が渡す。 */
  expired?: boolean;
}

export interface ApiKeyCreateValues {
  name: string;
  scopes: string[];
  /** 有効期限の日数。null は期限なし。 */
  expiresInDays: number | null;
}

/** 作ったキー（1 度だけ見せる）か、作れなかった理由（true は既定の文）。 */
export type ApiKeyCreateResult = { secret: string } | { error: ReactNode };

export interface ApiKeysPageProps extends DataAttributes {
  keys: readonly ApiKey[];
  /** 渡すと、作る窓で 1 つ以上選ばせ、表に権限の列を出す。 */
  scopes?: readonly ApiKeyScope[];
  /** 選べる有効期限の日数（null は期限なし）。最初の値を選んでおく。既定 [30, 90, 365, null]（短い期限を既定にする）。 */
  expiryOptions?: readonly (number | null)[];
  /** 渡すと「API キーを作る」を出す。作ったキーを返す（部品は見せた後にキーを持たない）。 */
  onCreate?: (values: ApiKeyCreateValues) => ApiKeyCreateResult | Promise<ApiKeyCreateResult>;
  /** 渡すと行ごとに「無効にする」を出す（確かめてから呼ぶ）。 */
  onRevoke?: (id: string) => SubmitResult | Promise<SubmitResult>;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const API_KEYS_LABELS = { common: commonLabels, apiKeys: apiKeysLabels } as const;

const NO_EXPIRY = 'none';

/**
 * API キー。P-36。AppShell の中に置く中身。
 *
 * キーの表（U-26。名前を行の見出しに、見分けるための一部・権限・作った日・有効期限・最後に使った日時）と
 * 「API キーを作る」を並べる。作ったキーは同じ窓で 1 度だけ、読み取り専用の欄に出してフォーカスを移し、写すボタンと
 * 「今しか表示できない」注意を欄の説明として結ぶ。キーを見せている間は Esc と外を押しても閉じず、理由を読み上げる。
 * 「無効にする」はキーの名前を含む名前を持ち、確かめてから呼ぶ。済んだら行が消えるので、フォーカスを「API キーを作る」へ移す。
 */
export function ApiKeysPage({
  keys,
  scopes,
  expiryOptions = [30, 90, 365, null],
  onCreate,
  onRevoke,
  title,
  description,
  className,
  ...rest
}: ApiKeysPageProps): ReactNode {
  const labels = useTemplateLabels(API_KEYS_LABELS);
  const timeZone = useTimeZone();
  const { apiKeys: a } = labels;
  const { notice, show } = useNotice();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const list = new Intl.ListFormat(labels.locale, { type: 'conjunction' });
  const scopeLabel = (value: string): string => scopes?.find((scope) => scope.value === value)?.label ?? value;

  const columns: DataTableColumn<ApiKey>[] = [
    {
      key: 'name',
      header: a.name,
      cell: (key) => (
        <span className="g-api-key-name">
          {key.name}
          <code className="g-api-key-hint">{key.hint}</code>
        </span>
      ),
    },
    ...(scopes
      ? [{ key: 'scopes', header: a.scopes, wrap: true, cell: (key: ApiKey) => list.format((key.scopes ?? []).map(scopeLabel)) }]
      : []),
    {
      key: 'created',
      header: a.created,
      cell: (key) => {
        const { text, iso } = formatDate(key.createdAt, labels.locale, timeZone);
        return <time dateTime={iso}>{text}</time>;
      },
    },
    {
      key: 'expires',
      header: a.expiry,
      cell: (key) => {
        if (!key.expiresAt) return a.noExpiry;
        const { text, iso } = formatDate(key.expiresAt, labels.locale, timeZone);
        return (
          <span className="g-api-key-expiry">
            <time dateTime={iso}>{text}</time>
            {key.expired ? <Badge tone="warning">{a.expired}</Badge> : null}
          </span>
        );
      },
    },
    {
      key: 'lastUsed',
      header: a.lastUsed,
      cell: (key) => {
        if (!key.lastUsedAt) return a.neverUsed;
        const { text, iso } = formatDateTime(key.lastUsedAt, labels.locale, timeZone);
        return <time dateTime={iso}>{text}</time>;
      },
    },
  ];

  return (
    <div {...domPassthrough(rest, 'ApiKeysPage')} className={cx('g-api-keys', className)}>
      <PageHeader
        title={title ?? a.title}
        description={description ?? a.description}
        actions={
          onCreate ? (
            <Button ref={createRef} variant="primary" onClick={() => setCreating(true)}>
              {a.create}
            </Button>
          ) : undefined
        }
      />
      {notice}
      <DataTable
        label={a.title}
        columns={columns}
        rows={keys}
        getRowId={(key) => key.id}
        rowActions={
          onRevoke
            ? (key) => (
                <Button size="sm" variant="tertiary" aria-label={a.revokeFor(key.name)} onClick={() => setRevoking(key)}>
                  {a.revoke}
                </Button>
              )
            : undefined
        }
        empty={a.empty}
      />
      {onCreate ? <CreateDialog open={creating} onClose={() => setCreating(false)} scopes={scopes} expiryOptions={expiryOptions} onCreate={onCreate} /> : null}
      {onRevoke ? (
        <ConfirmDialog
          open={revoking !== null}
          onClose={() => setRevoking(null)}
          title={a.revokeTitle(revoking?.name ?? '')}
          description={a.revokeDescription}
          confirm={a.revoke}
          onConfirm={() => onRevoke(revoking?.id ?? '')}
          onDone={() => show(a.revoked(revoking?.name ?? ''))}
          fallbackFocus={onCreate ? createRef : undefined}
        />
      ) : null}
    </div>
  );
}

/** キーを作る窓。名前・権限・有効期限を聞き、作ったキーを同じ窓で 1 度だけ見せる。閉じたらキーを持たない。 */
function CreateDialog({
  open,
  onClose,
  scopes,
  expiryOptions,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  scopes?: readonly ApiKeyScope[];
  expiryOptions: readonly (number | null)[];
  onCreate: (values: ApiKeyCreateValues) => ApiKeyCreateResult | Promise<ApiKeyCreateResult>;
}): ReactNode {
  const { common, apiKeys: a } = useTemplateLabels(API_KEYS_LABELS);
  const gassan = useLabels();
  const firstExpiry = expiryOptions[0] === null || expiryOptions[0] === undefined ? NO_EXPIRY : String(expiryOptions[0]);
  const [name, setName] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);
  const [expiry, setExpiry] = useState(firstExpiry);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const scopesRef = useRef<HTMLDivElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const nameError = submitted && !name.trim() ? common.requiredField(a.name) : undefined;
  const scopesError = submitted && scopes && chosen.length === 0 ? a.scopesRequired : undefined;

  // キーを見せたら、読み取り専用の欄へフォーカスを移して全体を選ぶ（説明の「今しか表示できない」も読まれる）
  useEffect(() => {
    if (secret === null) return;
    secretRef.current?.focus();
    secretRef.current?.select();
  }, [secret]);

  const close = (): void => {
    onClose();
    setName('');
    setChosen([]);
    setExpiry(firstExpiry);
    setSubmitted(false);
    setError(null);
    setSecret(null);
  };

  const create = async (): Promise<void> => {
    setSubmitted(true);
    setError(null);
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (scopes && chosen.length === 0) {
      scopesRef.current?.querySelector('input')?.focus();
      return;
    }
    let result: ApiKeyCreateResult;
    try {
      result = await onCreate({ name: name.trim(), scopes: chosen, expiresInDays: expiry === NO_EXPIRY ? null : Number(expiry) });
    } catch {
      setError(common.submitFailed);
      return;
    }
    if ('error' in result) setError(result.error === true ? common.submitFailed : result.error);
    else setSecret(result.secret);
  };

  return (
    <ModalRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      kind="form"
      initialFocus={nameRef}
      // キーを見せている間は、Esc や外を押しても閉じない（写す前に消えないように）。閉じない理由を読み上げる
      dismiss={secret === null ? undefined : { esc: false, backdrop: false }}
      blockedMessage={a.closeBlocked}
    >
      {secret === null ? (
        <>
          <ModalHeader>
            <ModalTitle>{a.create}</ModalTitle>
            <ModalDescription>{a.createDescription}</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <FormError>{error}</FormError>
            <ModalField label={a.name} help={a.nameHelp} required error={nameError}>
              {(control) => <ModalInput {...control} ref={nameRef} autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} />}
            </ModalField>
            {scopes ? (
              <div ref={scopesRef}>
                <ModalFieldset label={a.scopes} required error={scopesError}>
                  <ModalCheckboxGroup options={scopes} value={chosen} onValueChange={setChosen} />
                </ModalFieldset>
              </div>
            ) : null}
            <ModalField label={a.expiry} required requiredBadge={false}>
              {(control) => (
                <ModalSelect
                  {...control}
                  options={expiryOptions.map((days) => (days === null ? { value: NO_EXPIRY, label: a.noExpiry } : { value: String(days), label: a.days(days) }))}
                  value={expiry}
                  onValueChange={setExpiry}
                />
              )}
            </ModalField>
          </ModalBody>
          <ModalFooter>
            <ModalButton variant="tertiary" onClick={close}>
              {gassan.cancel}
            </ModalButton>
            <ModalButton variant="primary" onAction={create}>
              {a.submit}
            </ModalButton>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader>
            <ModalTitle>{a.createdTitle}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="g-api-key-secret">
              <ModalField label={a.secret} help={a.secretWarning} readOnly>
                {(control) => <ModalInput {...control} ref={secretRef} readOnly value={secret} spellCheck={false} autoComplete="off" />}
              </ModalField>
              <CopyButton value={secret} label={a.copySecret}>
                {gassan.copy}
              </CopyButton>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalButton variant="primary" onClick={close}>
              {a.done}
            </ModalButton>
          </ModalFooter>
        </>
      )}
    </ModalRoot>
  );
}
