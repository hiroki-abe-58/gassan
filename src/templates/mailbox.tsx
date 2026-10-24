import { useId, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button, IconButton } from '../button';
import { Avatar } from '../display';
import { ModalField } from '../fields';
import { ModalButton, ModalFooter } from '../footer';
import { ModalHeader, ModalTitle } from '../header';
import { ModalInput, ModalSearchInput, ModalTextarea } from '../inputs';
import { dayKeyFormat, daysBetween } from '../internal/day-key';
import { Icon, PathIcon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { SelectBox } from '../internal/select-box';
import { useLabels } from '../labels';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { ModalSelect, normalizeForMatch } from '../select';
import { ModalTagInput } from '../tag-input';
import { FormError, formatDateTime, looksLikeEmail, runAction, type SubmitResult } from './form';
import { useListDetail } from './list-detail';
import { useSite, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface MailFolder {
  id: string;
  label: string;
  /** 印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
  /** 読んでいないメールの数。 */
  unread?: number;
}

export interface MailAddress {
  name?: string;
  email: string;
}

export interface MailAttachment {
  name: string;
  /** 大きさ（バイト）。 */
  size?: number;
  /** ダウンロードの行き先。 */
  href?: string;
}

export interface MailMessage {
  id: string;
  from: MailAddress;
  to?: readonly MailAddress[];
  cc?: readonly MailAddress[];
  subject: string;
  /** 一覧に添える、本文の冒頭（1 行に収まらなければ … で切る）。 */
  snippet?: string;
  /** 読む面に出す本文。 */
  body?: ReactNode;
  receivedAt: Date | string;
  read?: boolean;
  starred?: boolean;
  attachments?: readonly MailAttachment[];
}

export interface MailComposeValues {
  /** 新しく書いたか、返信か、転送か。 */
  mode: 'new' | 'reply' | 'forward';
  /** 返信・転送の元のメールの id。 */
  source?: string;
  to: string[];
  subject: string;
  body: string;
}

type Action = (ids: string[]) => SubmitResult | Promise<SubmitResult>;

export interface MailboxPageProps extends DataAttributes {
  folders: readonly MailFolder[];
  currentFolder: string;
  onFolderChange: (id: string) => void;
  /** いまのフォルダのメール（新しい順）。 */
  messages: readonly MailMessage[];
  /** 開いているメールの id。 */
  current?: string;
  /** メールを開いたとき（既読にするのは利用側）。 */
  onOpen: (id: string) => void;
  /** 渡すと、アーカイブの操作を出す。 */
  onArchive?: Action;
  /** 渡すと、削除の操作を出す。 */
  onDelete?: Action;
  /** 渡すと、既読 / 未読にする操作を出す。 */
  onMarkRead?: (ids: string[], read: boolean) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと、スターのボタンを出す。 */
  onStar?: (id: string, starred: boolean) => void;
  /** 渡すと、作成・返信・転送を出す。 */
  onSend?: (values: MailComposeValues) => SubmitResult | Promise<SubmitResult>;
  /** 一覧の見出し。既定は「メール」。 */
  title?: ReactNode;
  className?: string;
}

/** 書く画面の初めの値。 */
interface Draft {
  mode: MailComposeValues['mode'];
  source?: string;
  to: string[];
  subject: string;
}

const NEW_DRAFT: Draft = { mode: 'new', to: [], subject: '' };

/** メールだけが使う印（作る・返す・送る・しまう・捨てる・添付・読んだ / 読んでいない）。共有の ICONS には入れない。 */
const MAIL_ICONS = {
  pen: 'M12.75 4.25l3 3L7.5 15.5h-3v-3l8.25-8.25Z',
  reply: 'M8.5 5.5 4 10l4.5 4.5M4.5 10H12a4 4 0 0 1 4 4v1.5',
  forward: 'M11.5 5.5 16 10l-4.5 4.5M15.5 10H8a4 4 0 0 0-4 4v1.5',
  archive: 'M3.5 4.5h13v3h-13v-3ZM4.5 7.5v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-7M8.5 10.5h3',
  trash: 'M4 6h12M8 6V4.5h4V6M5.75 6l.7 9.6a1 1 0 0 0 1 .9h5.1a1 1 0 0 0 1-.9l.7-9.6',
  paperclip: 'M15 9.25l-5.3 5.3a3 3 0 0 1-4.25-4.25l5.65-5.65a2 2 0 0 1 2.85 2.85l-5.6 5.6a1 1 0 0 1-1.4-1.4l5.1-5.1',
  mail: 'M3.5 5.5h13v9h-13v-9ZM3.75 6l6.25 4.75L16.25 6',
  mailOpen: 'M3.5 8.5 10 4l6.5 4.5v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V8.5ZM3.75 9l6.25 4.5L16.25 9',
} as const;

const MailIcon = ({ name }: { name: keyof typeof MAIL_ICONS }): ReactNode => <PathIcon d={MAIL_ICONS[name]} />;

const nameOf = (address: MailAddress): string => address.name ?? address.email;

/** 添付の大きさ（120 KB・1.4 MB）。 */
function formatSize(size: number): string {
  if (size < 1024 * 1024) return `${String(Math.max(1, Math.round(size / 1024)))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * メールのページ。P-20。AppShell の中に置く中身。
 *
 * フォルダ・メールの一覧・読む面。器が広ければ 3 つを並べ、中くらいならフォルダを一覧の上のセレクトにし、狭ければ一覧と
 * 読む面を切り替える（P-18 と同じ。templates/list-detail.ts）。一覧は行を選んでまとめてアーカイブ・削除・既読にでき、
 * 結果はいつも置いてある role="status" の領域で読み上げる。作成・返信・転送はモーダルで書く。
 */
export function MailboxPage({
  folders,
  currentFolder,
  onFolderChange,
  messages,
  current,
  onOpen,
  onArchive,
  onDelete,
  onMarkRead,
  onStar,
  onSend,
  title,
  className,
  ...rest
}: MailboxPageProps): ReactNode {
  const { labels } = useSite();
  const gassan = useLabels();
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const { common, mail: m } = labels;
  const base = useId();
  const headingId = `${base}-heading`;
  const { view, showDetail, showList, headingRef, currentRef } = useListDetail('list');
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<ReactNode>(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<{ key: number; value: Draft }>({ key: 0, value: NEW_DRAFT });

  const folder = folders.find((item) => item.id === currentFolder);
  const message = messages.find((item) => item.id === current);
  const needle = normalizeForMatch(query.trim());
  const shown = needle
    ? messages.filter((item) => normalizeForMatch(`${item.from.name ?? ''} ${item.from.email} ${item.subject} ${item.snippet ?? ''}`).includes(needle))
    : messages;
  // 選んだ行は、見えている行の中だけで数える（絞り込みで隠れた行を、まとめての操作に巻き込まない）
  const chosen = selected.filter((id) => shown.some((item) => item.id === id));
  const allChosen = shown.length > 0 && chosen.length === shown.length;
  const allRead = chosen.every((id) => messages.find((item) => item.id === id)?.read);

  // 一覧の日時は短く（今日は時刻、昨日は「昨日」、今年は月日、それより前は年月日）
  const dayKey = dayKeyFormat(timeZone);
  const today = dayKey(new Date());
  const time = new Intl.DateTimeFormat(labels.locale, { hour: 'numeric', minute: '2-digit', timeZone });
  const monthDay = new Intl.DateTimeFormat(labels.locale, { month: 'short', day: 'numeric', timeZone });
  const fullDate = new Intl.DateTimeFormat(labels.locale, { dateStyle: 'short', timeZone });
  const when = (value: Date | string): { text: string; iso: string } => {
    const date = value instanceof Date ? value : new Date(value);
    const key = dayKey(date);
    const ago = daysBetween(today, key);
    const text = ago === 0 ? time.format(date) : ago === 1 ? gassan.yesterday : key.slice(0, 4) === today.slice(0, 4) ? monthDay.format(date) : fullDate.format(date);
    return { text, iso: date.toISOString() };
  };

  const changeFolder = (id: string): void => {
    setSelected([]);
    setQuery('');
    setStatus('');
    setError(null);
    if (id !== currentFolder) onFolderChange(id);
  };

  const open = (id: string): void => {
    if (id !== current) onOpen(id);
    showDetail();
  };

  /** まとめての操作。終えたら選択を解き、結果を読み上げる。消えるボタンからは「すべて選ぶ」か見出しへフォーカスを移す。 */
  const run = async (action: () => SubmitResult | Promise<SubmitResult>, done: string, ids: readonly string[], from: 'list' | 'reader'): Promise<void> => {
    const failure = await runAction(action, common.submitFailed);
    if (failure) {
      setError(failure);
      return;
    }
    setError(null);
    setSelected([]);
    setStatus(done);
    if (from === 'list') selectAllRef.current?.focus();
    else if (current !== undefined && ids.includes(current)) headingRef.current?.focus();
  };

  const compose = (value: Draft): void => {
    setDraft((previous) => ({ key: previous.key + 1, value }));
    setComposing(true);
  };
  const prefixed = (prefix: string, subject: string): string => (subject.startsWith(prefix.trim()) ? subject : `${prefix}${subject}`);

  return (
    <div {...domPassthrough(rest, 'MailboxPage')} className={cx('g-split g-mail-page', className)} data-view={view}>
      <div className="g-split-frame">
        <nav className="g-mail-folders" aria-label={m.folders}>
          <ul className="g-split-items">
            {folders.map((item, index) => {
              const folderId = `${base}-folder-${String(index)}`;
              return (
                <li key={item.id}>
                  {/* 名前は「受信トレイ 未読 3件」（文言と数を空白で区切って読む。数の印は飾り） */}
                  <button
                    type="button"
                    className="g-split-item g-mail-folder"
                    aria-current={item.id === currentFolder ? 'true' : undefined}
                    aria-labelledby={item.unread ? `${folderId}-label ${folderId}-count` : `${folderId}-label`}
                    onClick={() => changeFolder(item.id)}
                  >
                    {item.icon ? <span className="g-mail-folder-icon">{item.icon}</span> : null}
                    <span id={`${folderId}-label`} className="g-mail-folder-label">
                      {phrase(item.label)}
                    </span>
                    {item.unread ? (
                      <span className="g-mail-folder-count">
                        <span aria-hidden="true">{item.unread}</span>
                        <span id={`${folderId}-count`} className="g-sr-only">
                          {m.unreadCount(item.unread)}
                        </span>
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="g-split-list g-mail-list">
          <div className="g-split-list-head">
            <h1 className="g-split-list-title">{title ?? phrase(m.title)}</h1>
            {onSend ? (
              <Button size="sm" variant="primary" iconStart={<MailIcon name="pen" />} onClick={() => compose(NEW_DRAFT)}>
                {m.compose}
              </Button>
            ) : null}
          </div>
          {/* 器が狭いときは、フォルダの並びの代わりに出す（どちらか一方だけが見える） */}
          <div className="g-mail-folder-select">
            <ModalSelect
              aria-label={m.folders}
              options={folders.map((item) => ({ value: item.id, label: item.unread ? `${item.label} (${String(item.unread)})` : item.label }))}
              value={currentFolder}
              onValueChange={changeFolder}
            />
          </div>
          <div className="g-split-search">
            <ModalSearchInput aria-label={m.search} placeholder={m.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="g-mail-toolbar">
            <SelectBox
              className="g-mail-check"
              inputRef={selectAllRef}
              checked={allChosen}
              indeterminate={chosen.length > 0 && !allChosen}
              onChange={(checked) => setSelected(checked ? shown.map((item) => item.id) : [])}
              label={m.selectAll}
            />
            {chosen.length > 0 ? (
              <>
                <span className="g-mail-selected">{phrase(m.selected(chosen.length))}</span>
                {onArchive ? (
                  <IconButton label={m.archive} size="sm" onClick={() => void run(() => onArchive(chosen), m.archived(chosen.length), chosen, 'list')}>
                    <MailIcon name="archive" />
                  </IconButton>
                ) : null}
                {onMarkRead ? (
                  <IconButton
                    label={allRead ? m.markUnread : m.markRead}
                    size="sm"
                    onClick={() => void run(() => onMarkRead(chosen, !allRead), allRead ? m.markedUnread(chosen.length) : m.markedRead(chosen.length), chosen, 'list')}
                  >
                    <MailIcon name={allRead ? 'mail' : 'mailOpen'} />
                  </IconButton>
                ) : null}
                {onDelete ? (
                  <IconButton label={m.delete} size="sm" onClick={() => void run(() => onDelete(chosen), m.deleted(chosen.length), chosen, 'list')}>
                    <MailIcon name="trash" />
                  </IconButton>
                ) : null}
              </>
            ) : (
              <span className="g-mail-folder-name">{folder ? phrase(folder.label) : null}</span>
            )}
          </div>
          {/* 結果の読み上げ。いつも置いておき、文だけを入れ替える */}
          <p className="g-sr-only" role="status">
            {status}
          </p>
          <FormError>{error}</FormError>
          <ul className="g-mail-rows" aria-label={folder?.label}>
            {shown.map((item) => {
              const rowId = `${base}-row-${String(messages.indexOf(item))}`;
              const stamp = when(item.receivedAt);
              const isSelected = chosen.includes(item.id);
              const clipped = (item.attachments?.length ?? 0) > 0;
              return (
                <li key={item.id} className="g-mail-row" data-unread={item.read ? undefined : ''} data-selected={isSelected ? '' : undefined}>
                  <SelectBox
                    className="g-mail-check"
                    checked={isSelected}
                    onChange={(checked) => setSelected((previous) => (checked ? [...previous, item.id] : previous.filter((id) => id !== item.id)))}
                    label={m.select(item.subject)}
                  />
                  {/* 名前は「未読 差出人 件名」。冒頭の文・日時・添付は説明として続けて読む */}
                  <button
                    ref={item.id === current ? currentRef : undefined}
                    type="button"
                    className="g-mail-item"
                    aria-current={item.id === current ? 'true' : undefined}
                    aria-labelledby={[item.read ? '' : `${rowId}-unread`, `${rowId}-from`, `${rowId}-subject`].filter(Boolean).join(' ')}
                    aria-describedby={[item.snippet ? `${rowId}-snippet` : '', `${rowId}-time`, clipped ? `${rowId}-clip` : ''].filter(Boolean).join(' ')}
                    onClick={() => open(item.id)}
                  >
                    <span className="g-mail-item-top">
                      {item.read ? null : (
                        <span id={`${rowId}-unread`} className="g-sr-only">
                          {m.unread}
                        </span>
                      )}
                      <span id={`${rowId}-from`} className="g-mail-item-from">
                        {nameOf(item.from)}
                      </span>
                      {clipped ? (
                        <span className="g-mail-item-clip">
                          <MailIcon name="paperclip" />
                          <span id={`${rowId}-clip`} className="g-sr-only">
                            {m.attachment}
                          </span>
                        </span>
                      ) : null}
                      <time id={`${rowId}-time`} dateTime={stamp.iso} className="g-mail-item-time">
                        {stamp.text}
                      </time>
                    </span>
                    <span id={`${rowId}-subject`} className="g-mail-item-subject">
                      {item.subject}
                    </span>
                    {item.snippet ? (
                      <span id={`${rowId}-snippet`} className="g-mail-item-snippet">
                        {item.snippet}
                      </span>
                    ) : null}
                  </button>
                  {onStar ? (
                    <button
                      type="button"
                      className="g-mail-star"
                      aria-pressed={Boolean(item.starred)}
                      aria-label={m.starFor(item.subject)}
                      onClick={() => onStar(item.id, !item.starred)}
                    >
                      <Icon name="star" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {shown.length === 0 ? <p className="g-split-empty">{phrase(needle ? m.noMatch(query.trim()) : m.empty)}</p> : null}
        </div>

        <section className="g-split-detail g-mail-reader" aria-labelledby={headingId}>
          <header className="g-split-head">
            <button type="button" className="g-split-back" onClick={showList}>
              <Icon name="chevronLeft" />
              <span className="g-sr-only">{m.back}</span>
            </button>
            <div className="g-split-heading">
              <h2 id={headingId} ref={headingRef} tabIndex={-1} className="g-split-title">
                {phrase(message ? message.subject : m.none)}
              </h2>
            </div>
            {message ? (
              <div className="g-split-actions">
                {onSend ? (
                  <IconButton label={m.reply} size="sm" onClick={() => compose({ mode: 'reply', source: message.id, to: [message.from.email], subject: prefixed(m.replyPrefix, message.subject) })}>
                    <MailIcon name="reply" />
                  </IconButton>
                ) : null}
                {onSend ? (
                  <IconButton label={m.forward} size="sm" onClick={() => compose({ mode: 'forward', source: message.id, to: [], subject: prefixed(m.forwardPrefix, message.subject) })}>
                    <MailIcon name="forward" />
                  </IconButton>
                ) : null}
                {onArchive ? (
                  <IconButton label={m.archive} size="sm" onClick={() => void run(() => onArchive([message.id]), m.archived(1), [message.id], 'reader')}>
                    <MailIcon name="archive" />
                  </IconButton>
                ) : null}
                {onDelete ? (
                  <IconButton label={m.delete} size="sm" onClick={() => void run(() => onDelete([message.id]), m.deleted(1), [message.id], 'reader')}>
                    <MailIcon name="trash" />
                  </IconButton>
                ) : null}
                {onStar ? (
                  <IconButton label={m.star} size="sm" className="g-mail-star-toggle" aria-pressed={Boolean(message.starred)} onClick={() => onStar(message.id, !message.starred)}>
                    <Icon name="star" />
                  </IconButton>
                ) : null}
              </div>
            ) : null}
          </header>
          {message ? (
            <div className="g-mail-body">
              <div className="g-mail-meta">
                <span className="g-mail-meta-avatar" aria-hidden="true">
                  <Avatar name={nameOf(message.from)} />
                </span>
                <div className="g-mail-meta-text">
                  <p className="g-mail-from">
                    <span className="g-mail-from-name">{nameOf(message.from)}</span>
                    {message.from.name ? <span className="g-mail-from-email">{`<${message.from.email}>`}</span> : null}
                  </p>
                  {message.to && message.to.length > 0 ? (
                    <p className="g-mail-to">
                      {m.to}: {message.to.map(nameOf).join(', ')}
                    </p>
                  ) : null}
                  {message.cc && message.cc.length > 0 ? (
                    <p className="g-mail-to">
                      {m.cc}: {message.cc.map(nameOf).join(', ')}
                    </p>
                  ) : null}
                </div>
                <MailDate value={message.receivedAt} locale={labels.locale} timeZone={timeZone} />
              </div>
              {message.body ? <div className="g-mail-content">{phrase(message.body)}</div> : null}
              {message.attachments && message.attachments.length > 0 ? (
                <ul className="g-mail-attachments" aria-label={m.attachments}>
                  {message.attachments.map((file) => (
                    <li key={file.name} className="g-mail-attachment">
                      <Icon name="file" />
                      {file.href ? (
                        <a href={file.href} download className="g-mail-attachment-name" aria-label={m.download(file.name)}>
                          {file.name}
                        </a>
                      ) : (
                        <span className="g-mail-attachment-name">{file.name}</span>
                      )}
                      {file.size === undefined ? null : <span className="g-mail-attachment-size">{formatSize(file.size)}</span>}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      {onSend ? (
        <ComposeModal
          key={draft.key}
          open={composing}
          draft={draft.value}
          onOpenChange={setComposing}
          onSend={onSend}
          onSent={() => {
            setComposing(false);
            setStatus(m.sent);
          }}
        />
      ) : null}
    </div>
  );
}

function MailDate({ value, locale, timeZone }: { value: Date | string; locale: string; timeZone?: string }): ReactNode {
  const { text, iso } = formatDateTime(value, locale, timeZone);
  return (
    <time className="g-mail-date" dateTime={iso}>
      {text}
    </time>
  );
}

/** 作成・返信・転送のモーダル。宛先はタグとしてまとめて入れ、形の合わないものは付けずに欄に残す。 */
function ComposeModal({
  open,
  draft,
  onOpenChange,
  onSend,
  onSent,
}: {
  open: boolean;
  draft: Draft;
  onOpenChange: (open: boolean) => void;
  onSend: (values: MailComposeValues) => SubmitResult | Promise<SubmitResult>;
  onSent: () => void;
}): ReactNode {
  const { labels } = useSite();
  const gassan = useLabels();
  const { common, mail: m } = labels;
  const [to, setTo] = useState(draft.to);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState('');
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const titles = { new: m.newMessage, reply: m.reply, forward: m.forward };
  return (
    <ModalRoot open={open} onOpenChange={onOpenChange} kind="form" size="lg">
      <ModalHeader>
        <ModalTitle>{titles[draft.mode]}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FormError>{error}</FormError>
        <div ref={toRef}>
          <ModalField label={m.to} help={m.toHelp} required error={missing ? m.toRequired : undefined}>
            {(control) => (
              <ModalTagInput
                {...control}
                value={to}
                validate={looksLikeEmail}
                onValueChange={(next) => {
                  setTo(next);
                  if (next.length > 0) setMissing(false);
                }}
              />
            )}
          </ModalField>
        </div>
        <ModalField label={m.subject}>{(control) => <ModalInput {...control} value={subject} onChange={(event) => setSubject(event.target.value)} />}</ModalField>
        <ModalField label={m.body}>{(control) => <ModalTextarea {...control} rows={8} value={body} onChange={(event) => setBody(event.target.value)} />}</ModalField>
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="tertiary" onClick={() => onOpenChange(false)}>
          {gassan.cancel}
        </ModalButton>
        <ModalButton
          variant="primary"
          onAction={async () => {
            if (to.length === 0) {
              setMissing(true);
              toRef.current?.querySelector('input')?.focus();
              return;
            }
            const failure = await runAction(() => onSend({ mode: draft.mode, source: draft.source, to, subject, body }), common.submitFailed);
            if (failure) {
              setError(failure);
              return;
            }
            onSent();
          }}
        >
          {m.send}
        </ModalButton>
      </ModalFooter>
    </ModalRoot>
  );
}
