import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import { Avatar } from './display';
import { useControllable } from './internal/controllable';
import { dayKeyFormat, daysBetween } from './internal/day-key';
import { isCoarsePointer, isComposing, motionStill, warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';
import { useTimeZone } from './templates/site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/*
 * 会話。E-01〜E-08。
 *
 * メッセージの列（ChatThread）・入力欄（ChatComposer）・入力中の印（TypingIndicator）・質問の例（ChatSuggestions）。
 * 人どうしのチャットにも、AI との対話にも使う。列は role="log"（足したメッセージを読み上げる）で、
 * いちばん下を見ている間は新しいメッセージに付いていき、上を読んでいる間は位置を動かさない。
 */

export interface ChatAuthor {
  id: string;
  name: string;
  /** 顔の画像。無ければ頭文字。 */
  avatar?: string;
  /** 'assistant' は AI の回答（吹き出しにせず、本文として幅いっぱいに出す）。 */
  role?: 'user' | 'assistant';
}

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  /** 本文。文字列か、要素（リンク・コード・添付など）。 */
  content: ReactNode;
  /** 送った日時（ISO 8601 か Date）。 */
  sentAt: string | Date;
  /** 自分のメッセージの状態。'failed' なら onRetry で再送のボタンを出す。E-03。 */
  status?: 'sending' | 'sent' | 'read' | 'failed';
  onRetry?: () => void;
  /** AI の回答を流しながら書いている間。読み上げは書き終えてから（aria-busy）。E-06。 */
  streaming?: boolean;
  /** 編集した。E-02。 */
  edited?: boolean;
  /** 参加・退出などの知らせ。真ん中に小さく出し、名前と時刻を付けない。 */
  system?: boolean;
  /** 本文の下に置く操作（写す・もう一度・評価）。 */
  actions?: ReactNode;
}

const toDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

/** 同じ人の続けてのメッセージを 1 つにまとめる間隔（名前と顔を繰り返さない）。 */
const GROUP_GAP_MS = 5 * 60 * 1000;
/** 「いちばん下を見ている」とみなす余白（px）。 */
const BOTTOM_SLACK = 40;

/* -------------------------------------------------------------------------- */
/* ChatThread                                                                 */
/* -------------------------------------------------------------------------- */

export interface ChatThreadProps extends DataAttributes {
  /** 会話の名前（読み上げ）。「佐藤さんとの会話」「サポート」など。 */
  label: string;
  messages: readonly ChatMessage[];
  /** 自分の id。自分のメッセージを右に寄せ、状態を出す。 */
  currentUserId: string;
  /** この id のメッセージの前に「ここから新着」の線を引き、はじめはそこを見せる。 */
  unreadFrom?: string;
  /** もっと前のメッセージがある（上に「前のメッセージを読み込む」を出す）。E-04。 */
  hasOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  /** 入力中の人。列の下に「佐藤さんが入力中」を出す。E-07。 */
  typing?: readonly ChatAuthor[];
  /** 日時を見せる時間帯。既定は SiteProvider の timeZone か、見ている人の時間帯（hydration までは UTC）。 */
  timeZone?: string;
  className?: string;
}

/**
 * メッセージの列。E-01〜E-04。
 *
 * 日付が変わる所に区切りを置き、同じ人が 5 分以内に続けたメッセージは名前と顔を繰り返さない（読み上げの名前には残す）。
 * いちばん下を見ている間は、足したメッセージに付いていく。上を読んでいる間は位置を動かさず、「新しいメッセージ」の
 * ボタンを出す。前のメッセージを読み込んでも、読んでいた所を保つ。列は Tab で止まり、矢印キーでスクロールできる。
 */
export function ChatThread({
  label,
  messages,
  currentUserId,
  unreadFrom,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  typing,
  timeZone,
  className,
  ...rest
}: ChatThreadProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const siteZone = useTimeZone();
  const zone = timeZone ?? siteZone;
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [unseen, setUnseen] = useState(0);
  const seen = useRef<{ first?: string; last?: string; count: number; height: number; top: number }>({ count: 0, height: 0, top: 0 });

  const ids = messages.map((message) => message.id).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('ChatThread', 'messages[].id', ids.split('\u0000'));
  }, [ids]);

  const time = new Intl.DateTimeFormat(labels.locale, { hour: 'numeric', minute: '2-digit', timeZone: zone });
  const day = new Intl.DateTimeFormat(labels.locale, { month: 'long', day: 'numeric', weekday: 'short', timeZone: zone });
  const dayWithYear = new Intl.DateTimeFormat(labels.locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: zone });
  const dayKey = dayKeyFormat(zone);
  const today = dayKey(new Date());
  const dayLabel = (date: Date): string => {
    const key = dayKey(date);
    const ago = daysBetween(today, key);
    if (ago === 0) return labels.today;
    if (ago === 1) return labels.yesterday;
    return key.slice(0, 4) === today.slice(0, 4) ? day.format(date) : dayWithYear.format(date);
  };

  const scrollToBottom = (smooth: boolean): void => {
    const el = scrollRef.current;
    if (!el) return;
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: smooth && !motionStill(el) ? 'smooth' : 'auto' });
    else el.scrollTop = el.scrollHeight;
  };

  // 足したメッセージに付いていくか、上を読んでいる間は数えるだけにするか。前を読み込んだら位置を保つ。
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = messages[0]?.id;
    const last = messages[messages.length - 1]?.id;
    const before = seen.current;
    if (before.count === 0 && messages.length > 0) {
      const divider = el.querySelector<HTMLElement>('.g-chat-unread');
      el.scrollTop = divider ? divider.offsetTop - 8 : el.scrollHeight;
    } else if (first !== before.first && last === before.last) {
      el.scrollTop = before.top + (el.scrollHeight - before.height);
    } else if (last !== before.last) {
      if (atBottom.current) el.scrollTop = el.scrollHeight;
      else setUnseen((count) => count + Math.max(1, messages.length - before.count));
    }
    seen.current = { first, last, count: messages.length, height: el.scrollHeight, top: el.scrollTop };
  }, [messages]);

  // 入力中の印が出入りしても、いちばん下を見ていれば下に付いていく
  const typingCount = typing?.length ?? 0;
  useLayoutEffect(() => {
    if (atBottom.current) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [typingCount]);

  const onScroll = (): void => {
    const el = scrollRef.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
    seen.current = { ...seen.current, height: el.scrollHeight, top: el.scrollTop };
    if (atBottom.current && unseen > 0) setUnseen(0);
  };

  const rows: ReactNode[] = [];
  messages.forEach((message, index) => {
    const date = toDate(message.sentAt);
    const previous = messages[index - 1];
    const previousDate = previous ? toDate(previous.sentAt) : null;
    const newDay = !previousDate || dayKey(previousDate) !== dayKey(date);
    if (newDay) {
      rows.push(
        <p key={`day-${message.id}`} className="g-chat-day">
          <time dateTime={date.toISOString()}>{dayLabel(date)}</time>
        </p>,
      );
    }
    if (message.id === unreadFrom) {
      rows.push(
        <p key="unread" className="g-chat-unread">
          <span>{labels.unread}</span>
        </p>,
      );
    }
    const grouped =
      !newDay &&
      previous !== undefined &&
      previousDate !== null &&
      !previous.system &&
      !message.system &&
      message.id !== unreadFrom &&
      previous.author.id === message.author.id &&
      date.getTime() - previousDate.getTime() < GROUP_GAP_MS;
    rows.push(
      <ChatBubble
        key={message.id}
        message={message}
        own={message.author.id === currentUserId}
        grouped={grouped}
        time={time.format(date)}
        iso={date.toISOString()}
      />,
    );
  });

  return (
    <div {...domPassthrough(rest, 'ChatThread')} className={cx('g-chat', className)}>
      <div ref={scrollRef} className="g-chat-thread" role="log" aria-label={label} tabIndex={0} onScroll={onScroll}>
        {hasOlder ? (
          <p className="g-chat-older">
            <button
              type="button"
              className="g-chat-older-button"
              aria-disabled={loadingOlder ? true : undefined}
              onClick={() => {
                if (!loadingOlder) onLoadOlder?.();
              }}
            >
              {phrase(loadingOlder ? labels.loading : labels.loadOlder)}
            </button>
          </p>
        ) : null}
        {rows}
      </div>
      {typing && typing.length > 0 ? <TypingIndicator names={typing.map((author) => author.name)} /> : null}
      {unseen > 0 ? (
        <button
          type="button"
          className="g-chat-jump"
          onClick={() => {
            scrollToBottom(true);
            setUnseen(0);
            // ボタンは消えるので、フォーカスは列へ移す（行き場を失わせない）
            scrollRef.current?.focus({ preventScroll: true });
          }}
        >
          <Icon name="arrowDown" />
          {labels.newMessages(unseen)}
        </button>
      ) : null}
    </div>
  );
}

function ChatBubble({ message, own, grouped, time, iso }: { message: ChatMessage; own: boolean; grouped: boolean; time: string; iso: string }): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const id = useId();
  if (message.system) {
    return <p className="g-chat-system">{phrase(message.content)}</p>;
  }
  const nameId = `${id}-name`;
  const timeId = `${id}-time`;
  const assistant = message.author.role === 'assistant';
  return (
    <article
      className="g-chat-message"
      data-own={own ? '' : undefined}
      data-grouped={grouped ? '' : undefined}
      data-variant={assistant ? 'assistant' : undefined}
      // 名前は「誰が・いつ」。本文はその中身として読む
      aria-labelledby={`${nameId} ${timeId}`}
      aria-busy={message.streaming ? true : undefined}
    >
      {own ? null : (
        <div className="g-chat-avatar" aria-hidden="true">
          {grouped ? null : <Avatar name={message.author.name} src={message.author.avatar} size="sm" />}
        </div>
      )}
      <div className="g-chat-main">
        <p className={grouped ? 'g-sr-only' : 'g-chat-head'}>
          <span id={nameId} className={own ? 'g-sr-only' : 'g-chat-name'}>
            {message.author.name}
          </span>
          <time id={timeId} dateTime={iso} className="g-chat-time">
            {time}
          </time>
          {message.edited ? <span className="g-chat-edited">{labels.edited}</span> : null}
        </p>
        <div className="g-chat-bubble">
          {phrase(message.content)}
          {message.streaming ? <span className="g-chat-caret" aria-hidden="true" /> : null}
        </div>
        {own && message.status && message.status !== 'sent' ? (
          <p className="g-chat-status" data-status={message.status}>
            {phrase(message.status === 'sending' ? labels.sending : message.status === 'read' ? labels.read : labels.sendFailed)}
            {message.status === 'failed' && message.onRetry ? (
              <button type="button" className="g-chat-retry" onClick={message.onRetry}>
                {labels.retry}
              </button>
            ) : null}
          </p>
        ) : null}
        {message.actions ? <div className="g-chat-actions">{message.actions}</div> : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* TypingIndicator                                                            */
/* -------------------------------------------------------------------------- */

export interface TypingIndicatorProps extends DataAttributes {
  /** 入力中の人の名前。3 人以上なら人数で言う。 */
  names: readonly string[];
  className?: string;
}

/**
 * 入力中の印。E-07。言葉（「佐藤さんが入力中」）で伝え、3 つの点の動きは飾り。読み上げの領域にはしない
 * （出たり消えたりのたびに読み上げると、会話を読むのを妨げる）。動きを減らす設定と動きの段 none では点を止める。
 */
export function TypingIndicator({ names, className, ...rest }: TypingIndicatorProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  if (names.length === 0) return null;
  return (
    <p {...domPassthrough(rest, 'TypingIndicator')} className={cx('g-typing', className)}>
      <span className="g-typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>{phrase(labels.typing(names))}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* ChatComposer                                                               */
/* -------------------------------------------------------------------------- */

export interface ChatComposerProps extends DataAttributes {
  /** 送るとき（前後の空白を除いた文）。送ったら欄を空にする。 */
  onSend: (text: string) => void;
  /** 入力欄の名前。既定 labels.message。 */
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * 'enter'（既定。Enter で送り、Shift+Enter で改行）か 'mod+enter'（Ctrl / ⌘ + Enter で送り、Enter で改行）。
   * タッチが主の端末では、どちらでも Enter は改行（仮想キーボードには Shift が無い。送るのはボタン）。
   */
  sendOn?: 'enter' | 'mod+enter';
  disabled?: boolean;
  /** AI の回答を作っている間。送信のボタンが「止める」になり、Enter では送らない。E-06。 */
  generating?: boolean;
  onStop?: () => void;
  /** 入力欄の前に置くもの（添付のボタンなど）。 */
  start?: ReactNode;
  /** 何行まで伸ばすか。既定 8。 */
  maxRows?: number;
  /** 下にキーの案内を出す。既定 true（タッチが主の端末では出さない）。 */
  hint?: boolean;
  className?: string;
}

/**
 * 入力欄。E-05 / E-06。
 *
 * 文字に合わせて maxRows まで伸びる。日本語の変換中の Enter は確定に使わせ、送らない。空の文は送らない
 * （送信のボタンは aria-disabled でフォーカスは止まる）。送ったら欄を空にして、フォーカスは欄に残す。
 * タッチが主の端末かどうかは描いた後に見る（サーバーの描画と食い違わせない。案内は CSS でも先に隠す）。
 */
export function ChatComposer({
  onSend,
  label,
  placeholder,
  value,
  defaultValue = '',
  onValueChange,
  sendOn = 'enter',
  disabled = false,
  generating = false,
  onStop,
  start,
  maxRows = 8,
  hint = true,
  className,
  ...rest
}: ChatComposerProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const hintId = `${useId()}-hint`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(isCoarsePointer()), []);
  const canSend = text.trim().length > 0 && !disabled && !generating;
  const showHint = hint && !touch;

  // 文字に合わせて伸ばす（いったん縮めてから測る。maxRows を超えたら欄の中でスクロール）
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || typeof getComputedStyle !== 'function') return;
    const style = getComputedStyle(el);
    const line = Number.parseFloat(style.lineHeight) || 20;
    const padding = (Number.parseFloat(style.paddingBlockStart) || 0) + (Number.parseFloat(style.paddingBlockEnd) || 0);
    el.style.height = 'auto';
    if (el.scrollHeight > 0) el.style.height = `${String(Math.min(el.scrollHeight, line * maxRows + padding))}px`;
  }, [text, maxRows]);

  const send = (): void => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Enter' || isComposing(event)) return;
    const mod = event.metaKey || event.ctrlKey;
    const sends = sendOn === 'enter' && !touch ? !event.shiftKey : mod;
    if (!sends) return;
    event.preventDefault();
    send();
  };

  return (
    <form
      {...domPassthrough(rest, 'ChatComposer')}
      className={cx('g-composer', className)}
      data-disabled={disabled ? '' : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <div className="g-composer-field">
        {start ? <div className="g-composer-start">{start}</div> : null}
        <textarea
          ref={inputRef}
          className="g-composer-input"
          aria-label={label ?? labels.message}
          aria-describedby={showHint ? hintId : undefined}
          rows={1}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {generating ? (
          <button type="button" className="g-composer-send" data-stop="" aria-label={labels.stop} onClick={onStop}>
            <Icon name="stop" />
          </button>
        ) : (
          <button type="submit" className="g-composer-send" aria-label={labels.send} aria-disabled={canSend ? undefined : true}>
            <Icon name="arrowUp" />
          </button>
        )}
      </div>
      {showHint ? (
        <p id={hintId} className="g-composer-hint">
          {phrase(labels.sendHint(sendOn))}
        </p>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* ChatSuggestions                                                            */
/* -------------------------------------------------------------------------- */

export interface ChatSuggestion {
  id: string;
  label: string;
  /** 補足（何が分かるか）。ボタンの名前に続けて読む。 */
  description?: string;
}

export interface ChatSuggestionsProps extends DataAttributes {
  items: readonly ChatSuggestion[];
  onSelect: (item: ChatSuggestion) => void;
  /** 並びの名前。既定 labels.suggestions。 */
  label?: string;
  className?: string;
}

/** 質問の例（AI との対話の始めに並べる）。E-08。押すと onSelect を呼ぶ（送るか、入力欄に入れるかは利用側が決める）。 */
export function ChatSuggestions({ items, onSelect, label, className, ...rest }: ChatSuggestionsProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  return (
    <div {...domPassthrough(rest, 'ChatSuggestions')} className={cx('g-suggestions', className)} role="group" aria-label={label ?? labels.suggestions}>
      {items.map((item) => (
        <button key={item.id} type="button" className="g-suggestion" onClick={() => onSelect(item)}>
          <span className="g-suggestion-label">{phrase(item.label)}</span>
          {item.description ? <span className="g-suggestion-description">{phrase(item.description)}</span> : null}
        </button>
      ))}
    </div>
  );
}
