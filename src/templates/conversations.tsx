import { useId, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ChatComposer, ChatSuggestions, ChatThread, type ChatAuthor, type ChatMessage, type ChatSuggestion } from '../chat';
import { Avatar } from '../display';
import { ModalSearchInput } from '../inputs';
import { dayKeyFormat, daysBetween } from '../internal/day-key';
import { Icon, PathIcon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { ScrollPane } from '../internal/scrollbars';
import { useLabels } from '../labels';
import { usePhrase } from '../phrase';
import { normalizeForMatch } from '../select';
import { useListDetail } from './list-detail';
import { useSite, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 会話ごとの書きかけ。会話を移っても消さず、別の会話へ送り間違えないように会話ごとに持つ。 */
function useDrafts(current: string | undefined): [string, (text: string) => void] {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const key = current ?? '';
  return [drafts[key] ?? '', (text) => setDrafts((previous) => ({ ...previous, [key]: text }))];
}

/* -------------------------------------------------------------------------- */
/* ChatPage                                                                   */
/* -------------------------------------------------------------------------- */

export interface ChatConversation {
  id: string;
  name: string;
  /** 'channel'（# の印。既定）か 'direct'（相手の顔）。一覧はこの 2 つのまとまりに分ける。 */
  kind?: 'channel' | 'direct';
  /** 相手の顔の画像（'direct'）。無ければ頭文字。 */
  avatarSrc?: string;
  /** 読んでいないメッセージの数。 */
  unread?: number;
  /** 一覧に添える、最後のメッセージ（1 行に収まらなければ … で切る）。 */
  preview?: string;
  /** 最後のメッセージの日時。今日なら時刻、昨日なら「昨日」、それより前なら日付で出す。 */
  lastAt?: Date | string;
  /** 会話の見出しの下に添える説明（チャンネルの目的・相手の肩書）。 */
  description?: ReactNode;
}

export interface ChatPageProps extends DataAttributes {
  conversations: readonly ChatConversation[];
  /** いま開いている会話の id。 */
  current?: string;
  onConversationChange: (id: string) => void;
  /** いま開いている会話のメッセージ。 */
  messages: readonly ChatMessage[];
  /** 自分の id。自分のメッセージを右に寄せる。 */
  currentUserId: string;
  onSend: (text: string) => void;
  unreadFrom?: string;
  typing?: readonly ChatAuthor[];
  hasOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  /** 会話の見出しの右に置く操作（メンバー・通話・設定など）。 */
  actions?: ReactNode;
  /** 入力欄の前に置くもの（添付のボタンなど）。 */
  composerStart?: ReactNode;
  /** 一覧の見出し。既定は「メッセージ」。 */
  title?: ReactNode;
  className?: string;
}

/** チャンネルの印（#）。このページだけが使うので、共有の ICONS には入れない。 */
const HASH = 'M8.25 3.5 6.75 16.5M13.25 3.5l-1.5 13M4 7.5h12.5M3.5 12.5H16';

/** 一覧と見出しの前に置く印（飾り）。チャンネルは #、相手との会話は顔。 */
function ConversationMark({ conversation }: { conversation: ChatConversation }): ReactNode {
  return (
    <span className="g-chat-page-mark" aria-hidden="true">
      {conversation.kind === 'direct' ? <Avatar name={conversation.name} src={conversation.avatarSrc} size="sm" /> : <PathIcon d={HASH} />}
    </span>
  );
}

/**
 * チャットのページ。P-18。AppShell の中に置く中身。
 *
 * 左に会話の一覧（チャンネルと相手との会話のまとまり・未読の数・絞り込み）、右に開いている会話（見出し・メッセージの列・
 * 入力欄）。器が狭いときは一覧と会話を切り替え、会話の見出しの前の「戻る」で一覧へ戻る。会話を移ると列を置き直す
 * （前の会話のメッセージを、足したものとして読み上げさせない）。書きかけは会話ごとに残す。
 */
export function ChatPage({
  conversations,
  current,
  onConversationChange,
  messages,
  currentUserId,
  onSend,
  unreadFrom,
  typing,
  hasOlder,
  loadingOlder,
  onLoadOlder,
  actions,
  composerStart,
  title,
  className,
  ...rest
}: ChatPageProps): ReactNode {
  const { labels } = useSite();
  const gassan = useLabels();
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const c = labels.chat;
  const base = useId();
  const headingId = `${base}-heading`;
  const { view, showDetail, showList, headingRef, currentRef } = useListDetail('list');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useDrafts(current);
  const conversation = conversations.find((item) => item.id === current);

  const needle = normalizeForMatch(query.trim());
  const shown = needle ? conversations.filter((item) => normalizeForMatch(`${item.name} ${item.preview ?? ''}`).includes(needle)) : conversations;
  const groups = [
    { key: 'channel', title: c.channels, items: shown.filter((item) => item.kind !== 'direct') },
    { key: 'direct', title: c.directMessages, items: shown.filter((item) => item.kind === 'direct') },
  ].filter((group) => group.items.length > 0);

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

  const select = (id: string): void => {
    if (id !== current) onConversationChange(id);
    showDetail();
  };

  return (
    <div {...domPassthrough(rest, 'ChatPage')} className={cx('g-split g-chat-page', className)} data-view={view}>
      <div className="g-split-frame">
        <ScrollPane className="g-split-list" viewportClassName="g-split-list-scroll">
          <div className="g-split-list-head">
            <h1 className="g-split-list-title">{title ?? phrase(c.title)}</h1>
          </div>
          <div className="g-split-search">
            <ModalSearchInput aria-label={c.search} placeholder={c.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <nav className="g-split-nav" aria-label={c.conversations}>
            {groups.map((group) => {
              const groupId = `${base}-${group.key}`;
              return (
                <div key={group.key} className="g-split-group">
                  <p id={groupId} className="g-split-group-title">
                    {phrase(group.title)}
                  </p>
                  <ul className="g-split-items" aria-labelledby={groupId}>
                    {group.items.map((item) => {
                      const itemId = `${base}-item-${String(conversations.indexOf(item))}`;
                      const stamp = item.lastAt === undefined ? null : when(item.lastAt);
                      const unread = item.unread ?? 0;
                      const describedBy = [item.preview ? `${itemId}-preview` : '', stamp ? `${itemId}-time` : ''].filter(Boolean).join(' ');
                      return (
                        <li key={item.id}>
                          {/* 名前は「名前 未読 3件」。最後のメッセージと日時は説明として続けて読む */}
                          <button
                            ref={item.id === current ? currentRef : undefined}
                            type="button"
                            className="g-split-item g-chat-page-item"
                            aria-current={item.id === current ? 'true' : undefined}
                            aria-labelledby={unread > 0 ? `${itemId}-name ${itemId}-unread` : `${itemId}-name`}
                            aria-describedby={describedBy || undefined}
                            data-unread={unread > 0 ? '' : undefined}
                            onClick={() => select(item.id)}
                          >
                            <ConversationMark conversation={item} />
                            <span className="g-chat-page-item-body">
                              <span className="g-chat-page-item-top">
                                <span id={`${itemId}-name`} className="g-chat-page-item-name">
                                  {item.name}
                                </span>
                                {stamp ? (
                                  <time id={`${itemId}-time`} dateTime={stamp.iso} className="g-chat-page-item-time">
                                    {stamp.text}
                                  </time>
                                ) : null}
                              </span>
                              {item.preview ? (
                                <span id={`${itemId}-preview`} className="g-chat-page-item-preview">
                                  {item.preview}
                                </span>
                              ) : null}
                            </span>
                            {unread > 0 ? (
                              <span className="g-chat-page-item-unread">
                                <span aria-hidden="true">{unread > 99 ? '99+' : unread}</span>
                                <span id={`${itemId}-unread`} className="g-sr-only">
                                  {c.unread(unread)}
                                </span>
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {groups.length === 0 && needle ? <p className="g-split-empty">{phrase(c.noMatch(query.trim()))}</p> : null}
          </nav>
        </ScrollPane>

        <section className="g-split-detail g-chat-page-main" aria-labelledby={headingId}>
          <header className="g-split-head">
            <button type="button" className="g-split-back" onClick={showList}>
              <Icon name="chevronLeft" />
              <span className="g-sr-only">{c.back}</span>
            </button>
            {conversation ? <ConversationMark conversation={conversation} /> : null}
            <div className="g-split-heading">
              <h2 id={headingId} ref={headingRef} tabIndex={-1} className="g-split-title">
                {conversation ? conversation.name : phrase(c.none)}
              </h2>
              {conversation?.description ? <p className="g-split-description">{phrase(conversation.description)}</p> : null}
            </div>
            {conversation && actions ? <div className="g-split-actions">{actions}</div> : null}
          </header>
          {conversation ? (
            <>
              {/* 会話を移ったら列を置き直す。中身を入れ替えると、log が前の会話との差を新着として読み上げるため */}
              <ChatThread
                key={conversation.id}
                className="g-split-thread"
                label={c.messagesIn(conversation.name)}
                messages={messages}
                currentUserId={currentUserId}
                unreadFrom={unreadFrom}
                typing={typing}
                hasOlder={hasOlder}
                loadingOlder={loadingOlder}
                onLoadOlder={onLoadOlder}
              />
              <div className="g-split-foot">
                <ChatComposer
                  value={draft}
                  onValueChange={setDraft}
                  onSend={onSend}
                  start={composerStart}
                  placeholder={c.placeholder(conversation.name, conversation.kind ?? 'channel')}
                />
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AssistantPage                                                              */
/* -------------------------------------------------------------------------- */

export interface AssistantThread {
  id: string;
  title: string;
  /** 最後に使った日時。履歴を「今日」「昨日」「過去 7 日間」「それより前」に分ける。 */
  updatedAt: Date | string;
}

export interface AssistantPageProps extends DataAttributes {
  messages: readonly ChatMessage[];
  /** 自分の id。自分の質問を右に寄せる。 */
  currentUserId: string;
  onSend: (text: string) => void;
  /** 回答を作っている間。送信のボタンが「止める」になる。 */
  generating?: boolean;
  onStop?: () => void;
  /** まだ何も話していないときの問いかけ。既定は「何をお手伝いしましょうか？」。 */
  greeting?: ReactNode;
  /** まだ何も話していないときに並べる質問の例。 */
  suggestions?: readonly ChatSuggestion[];
  /** 質問の例を押したとき。既定はその文を送る（onSend(item.label)）。 */
  onSuggestion?: (item: ChatSuggestion) => void;
  /** 入力欄の下の注意書き。null で出さない。 */
  note?: ReactNode;
  /** これまでの会話。渡すと左に一覧を置く（狭い器では「履歴を見る」で開く）。 */
  history?: readonly AssistantThread[];
  currentThreadId?: string;
  onThreadChange?: (id: string) => void;
  /** 渡すと「新しい会話」を出す。 */
  onNewThread?: () => void;
  /** 見出し（アシスタントの名前）。既定は「アシスタント」。 */
  title?: ReactNode;
  /** 見出しの右に置く操作（モデルの切り替え・共有など）。 */
  actions?: ReactNode;
  /** 入力欄の前に置くもの（添付のボタンなど）。 */
  composerStart?: ReactNode;
  placeholder?: string;
  className?: string;
}

/**
 * AI アシスタントのページ。P-19。AppShell の中に置く中身。
 *
 * 何も話していなければ問いかけと質問の例を、話し始めたら会話を出す。回答を作っている間は止められ、
 * 入力欄の下に注意書きを添える。履歴を渡すと左に一覧（新しい会話・日付のまとまり）を置き、器が狭いときは
 * 見出しの前の「履歴を見る」で一覧と切り替える。
 */
export function AssistantPage({
  messages,
  currentUserId,
  onSend,
  generating = false,
  onStop,
  greeting,
  suggestions,
  onSuggestion,
  note,
  history,
  currentThreadId,
  onThreadChange,
  onNewThread,
  title,
  actions,
  composerStart,
  placeholder,
  className,
  ...rest
}: AssistantPageProps): ReactNode {
  const { labels } = useSite();
  const gassan = useLabels();
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const a = labels.assistant;
  const base = useId();
  const headingId = `${base}-heading`;
  const historyId = `${base}-history`;
  const { view, showDetail, showList, headingRef, currentRef } = useListDetail('detail');
  const [draft, setDraft] = useDrafts(currentThreadId);

  // 履歴は日付で分ける（見ている人の暦で、今日・昨日・過去 7 日間・それより前）
  const dayKey = dayKeyFormat(timeZone);
  const today = dayKey(new Date());
  const bucket = (value: Date | string): number => {
    const ago = daysBetween(today, dayKey(value instanceof Date ? value : new Date(value)));
    return ago <= 0 ? 0 : ago === 1 ? 1 : ago < 7 ? 2 : 3;
  };
  const groups = [gassan.today, gassan.yesterday, a.previous7Days, a.older]
    .map((groupTitle, index) => ({ key: String(index), title: groupTitle, items: (history ?? []).filter((thread) => bucket(thread.updatedAt) === index) }))
    .filter((group) => group.items.length > 0);

  const choose = (id: string): void => {
    if (id !== currentThreadId) onThreadChange?.(id);
    showDetail();
  };

  return (
    <div {...domPassthrough(rest, 'AssistantPage')} className={cx('g-split g-assistant-page', className)} data-view={history ? view : 'detail'}>
      <div className="g-split-frame">
        {history ? (
          <ScrollPane className="g-split-list" viewportClassName="g-split-list-scroll">
            <div className="g-split-list-head">
              <h2 id={historyId} className="g-split-list-title">
                {phrase(a.history)}
              </h2>
              <button type="button" className="g-split-back" onClick={showDetail}>
                <Icon name="close" />
                <span className="g-sr-only">{a.closeHistory}</span>
              </button>
            </div>
            {onNewThread ? (
              <div className="g-split-search">
                <Button
                  block
                  iconStart={<Icon name="plus" />}
                  onClick={() => {
                    onNewThread();
                    showDetail();
                  }}
                >
                  {a.newThread}
                </Button>
              </div>
            ) : null}
            <nav className="g-split-nav" aria-labelledby={historyId}>
              {groups.map((group) => {
                const groupId = `${base}-group-${group.key}`;
                return (
                  <div key={group.key} className="g-split-group">
                    <p id={groupId} className="g-split-group-title">
                      {phrase(group.title)}
                    </p>
                    <ul className="g-split-items" aria-labelledby={groupId}>
                      {group.items.map((thread) => (
                        <li key={thread.id}>
                          <button
                            ref={thread.id === currentThreadId ? currentRef : undefined}
                            type="button"
                            className="g-split-item g-assistant-item"
                            aria-current={thread.id === currentThreadId ? 'true' : undefined}
                            onClick={() => choose(thread.id)}
                          >
                            {thread.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </ScrollPane>
        ) : null}

        <section className="g-split-detail g-assistant-main" aria-labelledby={headingId}>
          <header className="g-split-head">
            {history ? (
              <button type="button" className="g-split-back" onClick={showList}>
                <Icon name="clock" />
                <span className="g-sr-only">{a.showHistory}</span>
              </button>
            ) : null}
            <div className="g-split-heading">
              <h1 id={headingId} ref={headingRef} tabIndex={-1} className="g-split-title">
                {title ?? phrase(a.title)}
              </h1>
            </div>
            {actions ? <div className="g-split-actions">{actions}</div> : null}
          </header>
          {messages.length === 0 ? (
            <ScrollPane className="g-assistant-empty" viewportClassName="g-assistant-empty-scroll">
              <p className="g-assistant-greeting">{phrase(greeting ?? a.greeting)}</p>
              {suggestions && suggestions.length > 0 ? (
                <ChatSuggestions items={suggestions} onSelect={(item) => (onSuggestion ? onSuggestion(item) : onSend(item.label))} />
              ) : null}
            </ScrollPane>
          ) : (
            // 会話を移ったら列を置き直す（前の会話との差を新着として読み上げさせない）
            <ChatThread key={currentThreadId} className="g-split-thread" label={a.conversation} messages={messages} currentUserId={currentUserId} />
          )}
          <div className="g-split-foot">
            <ChatComposer
              value={draft}
              onValueChange={setDraft}
              onSend={onSend}
              generating={generating}
              onStop={onStop}
              start={composerStart}
              placeholder={placeholder ?? a.placeholder}
            />
            {note === null ? null : <p className="g-assistant-note">{phrase(note ?? a.note)}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
