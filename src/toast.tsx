import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { warnOnce } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { transitionMs } from './internal/popup';
import { subscribeDepth, topModal } from './internal/stack';
import { useEvent } from './internal/use-event';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

export type ToastTone = 'neutral' | 'success' | 'info' | 'warning' | 'error';
export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** 見出しの下に添える文。 */
  description?: ReactNode;
  /** 色と印。既定 'neutral'（印なし）。 */
  tone?: ToastTone;
  /**
   * 時間で閉じるまで（ms）。既定 5000（warning と error は 8000、action があれば 10000 以上）。
   * Infinity なら時間では閉じず、メーターも出さない。N-02。
   */
  duration?: number;
  /** 1 つだけ置けるボタン（「元に戻す」など）。押すと onClick を呼んで閉じる。 */
  action?: ToastAction;
  /** 同じ id のトーストが出ていれば、中身を置き換えて時間をやり直す。 */
  id?: string;
  /** 閉じ終えたとき（時間・×・Esc・スワイプ・toast.dismiss のどれでも）。 */
  onDismiss?: (id: string) => void;
}

export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

/** 読み込み中（toast.promise の間）は内部だけのトーン。 */
type Tone = ToastTone | 'loading';

interface ToastRecord {
  id: string;
  message: ReactNode;
  description: ReactNode;
  tone: Tone;
  action: ToastAction | undefined;
  onDismiss: ((id: string) => void) | undefined;
  /** 全体の長さ（ms）。Infinity は時間で閉じない。 */
  duration: number;
  /** 止めたときに残っていた時間（ms）。 */
  remaining: number;
  /** 時計が動き出した時刻（Date.now）。止めている間と、時間で閉じないものは null。 */
  since: number | null;
  /** 閉じる動きの最中。描き終えたら外す。 */
  exiting: boolean;
  /** 置き換えるたびに増やす。メーターを始めからやり直す。 */
  revision: number;
}

/* -------------------------------------------------------------------------- */
/* store                                                                      */
/* -------------------------------------------------------------------------- */

/*
 * 時間は store が持ち、ホストのタイマー 1 本で「次に切れるもの」まで待つ。
 * メーターは CSS のアニメーションで、止める・動かすは animation-play-state で同じ印に従わせる。
 * どちらも経った時間（duration − 残り）から始めるので、モーダルの中へ移って描き直しても続きから動く。
 */
let toasts: readonly ToastRecord[] = [];
let paused = false;
let sequence = 0;
let hostCount = 0;
const listeners = new Set<() => void>();
const EMPTY: readonly ToastRecord[] = [];

const DEFAULT_DURATION: Record<Tone, number> = {
  neutral: 5000,
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 8000,
  loading: Number.POSITIVE_INFINITY,
};
/** ボタンの付いたトーストは、押しに行く時間を見込んで長くする（WCAG 2.2.1）。 */
const ACTION_DURATION = 10000;

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): readonly ToastRecord[] => toasts;
const getServerSnapshot = (): readonly ToastRecord[] => EMPTY;

/** 残り時間（ms）。動いている間は経った分を引く。 */
function remainingOf(record: ToastRecord, at: number): number {
  return record.since === null ? record.remaining : record.remaining - (at - record.since);
}

function put(message: ReactNode, options: ToastOptions, tone: Tone): string {
  const id = options.id ?? `g-toast-${String((sequence += 1))}`;
  const base = options.duration ?? DEFAULT_DURATION[tone];
  const duration = Math.max(0, options.duration === undefined && options.action ? Math.max(base, ACTION_DURATION) : base);
  const existing = toasts.find((record) => record.id === id);
  const record: ToastRecord = {
    id,
    message,
    description: options.description,
    tone,
    action: options.action,
    onDismiss: options.onDismiss,
    duration,
    remaining: duration,
    since: paused || !Number.isFinite(duration) ? null : Date.now(),
    exiting: false,
    revision: (existing?.revision ?? 0) + 1,
  };
  toasts = existing ? toasts.map((entry) => (entry === existing ? record : entry)) : [...toasts, record];
  emit();
  // ホストの有無は 1 ティック遅らせて見る（子の effect から呼ばれると、ホストの effect より先に来る）。
  queueMicrotask(() => {
    if (hostCount === 0 && toasts.includes(record)) {
      warnOnce('no-toast-host', 'toast() was called but <ToastHost /> is not mounted. Nothing will be shown.');
    }
  });
  return id;
}

/** 閉じる（退出を描いてから外す）。id を省くと全部。 */
function dismiss(id?: string): void {
  let changed = false;
  toasts = toasts.map((record) => {
    if (record.exiting || (id !== undefined && record.id !== id)) return record;
    changed = true;
    return { ...record, exiting: true, since: null };
  });
  if (changed) emit();
}

/** 退出を描き終えたものを外し、onDismiss を呼ぶ。 */
function remove(id: string): void {
  const record = toasts.find((entry) => entry.id === id);
  if (!record?.exiting) return;
  toasts = toasts.filter((entry) => entry !== record);
  emit();
  record.onDismiss?.(id);
}

/** 時計を止める・動かす。止めている間は残り時間が減らない。N-03。 */
function setPaused(next: boolean): void {
  if (paused === next) return;
  paused = next;
  const now = Date.now();
  toasts = toasts.map((record) => {
    if (record.exiting || !Number.isFinite(record.duration)) return record;
    return next ? { ...record, remaining: remainingOf(record, now), since: null } : { ...record, since: now };
  });
  emit();
}

/** 時間の切れたものを閉じる。 */
function expire(): void {
  const now = Date.now();
  for (const record of toasts) {
    if (record.since !== null && remainingOf(record, now) <= 0) dismiss(record.id);
  }
}

/** 次に時間が切れるまで（ms）。動いているものが無ければ null。 */
function nextDeadline(now: number): number | null {
  let soonest = Number.POSITIVE_INFINITY;
  for (const record of toasts) {
    if (record.since !== null) soonest = Math.min(soonest, remainingOf(record, now));
  }
  return Number.isFinite(soonest) ? Math.max(0, soonest) : null;
}

function show(message: ReactNode, options: ToastOptions = {}): string {
  return put(message, options, options.tone ?? 'neutral');
}

function withTone(tone: ToastTone) {
  return (message: ReactNode, options: Omit<ToastOptions, 'tone'> = {}): string => put(message, options, tone);
}

/**
 * 処理の間は読み込み中のトーストを出し（時間で閉じない）、終わったら成功か失敗に置き換える。N-07。
 * 渡した Promise をそのまま返すので、続けて await できる。
 */
function promise<T>(
  task: Promise<T>,
  messages: ToastPromiseMessages<T>,
  options: Omit<ToastOptions, 'tone' | 'id'> = {},
): Promise<T> {
  const id = put(messages.loading, { ...options, duration: Number.POSITIVE_INFINITY, action: undefined }, 'loading');
  task.then(
    (value) => {
      const message = typeof messages.success === 'function' ? messages.success(value) : messages.success;
      put(message, { ...options, id }, 'success');
    },
    (error: unknown) => {
      const message = typeof messages.error === 'function' ? messages.error(error) : messages.error;
      put(message, { ...options, id }, 'error');
    },
  );
  return task;
}

/**
 * トーストを出す。N-01。`<ToastHost />` をアプリに 1 つ置くと、そこに描く。返り値は id。
 *
 * ```tsx
 * toast.success('保存しました');
 * toast('下書きを削除しました', { action: { label: '元に戻す', onClick: restore } });
 * await toast.promise(save(), { loading: '保存しています…', success: '保存しました', error: '保存できませんでした' });
 * ```
 */
export const toast = Object.assign(show, {
  success: withTone('success'),
  info: withTone('info'),
  warning: withTone('warning'),
  error: withTone('error'),
  promise,
  dismiss,
});

/** テスト用。出ているトーストを、onDismiss を呼ばずに全部捨てる。 */
export function resetToasts(): void {
  toasts = [];
  paused = false;
  emit();
}

/* -------------------------------------------------------------------------- */
/* Host                                                                       */
/* -------------------------------------------------------------------------- */

export interface ToastHostProps extends DataAttributes {
  /** 出す場所。既定 'bottom-end'（右下。右から左の言語では左下）。 */
  position?: ToastPosition;
  /** 同時に見せる数。超えると古いものから閉じる。既定 3。 */
  max?: number;
  className?: string;
}

const subscribeModal = (onChange: () => void): (() => void) => subscribeDepth(() => onChange());

/**
 * トーストの描画先。アプリのルートに 1 つだけ置く。N-01〜N-08。
 *
 * 領域は popover で top layer に出す。モーダルが開いている間は、最前面の dialog の中へ移して出し直す
 * （外に置くと、モーダルの外として inert になり、押せず読まれない。N-06）。
 * 領域は空でも置いたままにする（aria-live の領域は、中身より先にあると読み上げが確かになる）。
 */
export function ToastHost({ position = 'bottom-end', max = 3, className, ...rest }: ToastHostProps): ReactNode {
  const labels = useLabels();
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const modal = useSyncExternalStore(subscribeModal, topModal, () => null);
  const [mounted, setMounted] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  /** 通知へ入る前にフォーカスがあった場所。最後のトーストを閉じたら、そこへ戻す。 */
  const returnFocus = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const halt = hovered || focused || hidden || dragging;

  useEffect(() => {
    hostCount += 1;
    if (hostCount > 1) warnOnce('two-toast-hosts', 'More than one <ToastHost /> is mounted. Each toast will be shown twice.');
    setMounted(true);
    const sync = (): void => setHidden(document.visibilityState === 'hidden');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      hostCount -= 1;
      document.removeEventListener('visibilitychange', sync);
      setPaused(false);
    };
  }, []);

  // ポインタが乗っている・フォーカスが中にある・タブが隠れている・指で動かしている間は止める。N-03。
  useEffect(() => {
    setPaused(halt);
  }, [halt]);

  // 次に時間が切れるものまで待つ。中身が変わるたびに待ち直す。
  useEffect(() => {
    const wait = nextDeadline(Date.now());
    if (wait === null) return undefined;
    const timer = setTimeout(expire, wait);
    return () => clearTimeout(timer);
  }, [list]);

  // 見せる数を超えたら、古いものから閉じる。N-08。
  useEffect(() => {
    const live = list.filter((record) => !record.exiting);
    for (const record of live.slice(0, Math.max(0, live.length - Math.max(1, max)))) dismiss(record.id);
  }, [list, max]);

  // 置き場所が変わるたびに top layer へ出し直す（後から出したものが上に来る）。
  useLayoutEffect(() => {
    const region = regionRef.current;
    if (!region || typeof (region.showPopover as unknown) !== 'function') return;
    if (!region.matches(':popover-open')) region.showPopover();
  }, [mounted, modal]);

  /** 閉じたトーストにフォーカスがあったら、隣のトーストか、通知へ入る前の場所へ移す。 */
  const leave = useEvent((slot: HTMLElement): void => {
    const live = (step: 'nextElementSibling' | 'previousElementSibling'): Element | null => {
      let element = slot[step];
      while (element?.hasAttribute('data-exiting')) element = element[step];
      return element;
    };
    const next = (live('nextElementSibling') ?? live('previousElementSibling'))?.querySelector<HTMLElement>('button');
    if (next) next.focus();
    else if (returnFocus.current?.isConnected) returnFocus.current.focus();
  });

  if (!mounted) return null;

  // 上に出すときは新しいものを上に置く。見た目の順と DOM の順（読み上げ・Tab の順）をそろえる。
  const ordered = position.startsWith('top') ? [...list].reverse() : list;

  return createPortal(
    <section
      {...domPassthrough(rest, 'ToastHost')}
      ref={regionRef}
      popover="manual"
      className={className ? `g-toast-region ${className}` : 'g-toast-region'}
      data-position={position}
      data-paused={halt ? '' : undefined}
      aria-label={labels.notifications}
      aria-live="polite"
    >
      <ol
        ref={listRef}
        className="g-toast-list"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => {
          const from = event.relatedTarget;
          if (!event.currentTarget.contains(from)) returnFocus.current = from instanceof HTMLElement ? from : null;
          setFocused(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
      >
        {ordered.map((record) => (
          <ToastItem key={record.id} record={record} onLeave={leave} onDrag={setDragging} />
        ))}
      </ol>
    </section>,
    modal ?? document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* 1 つのトースト                                                              */
/* -------------------------------------------------------------------------- */

/** 指で横へこれだけ動かすか、この速さ（px/ms）で払うと閉じる。N-04。 */
const SWIPE_RATIO = 0.35;
const SWIPE_VELOCITY = 0.5;
/** これより小さい動きは押しただけとみなす。 */
const SWIPE_SLOP = 8;

const ICON_OF: Partial<Record<Tone, 'success' | 'error' | 'warning' | 'info'>> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

interface ToastItemProps {
  record: ToastRecord;
  onLeave: (slot: HTMLElement) => void;
  onDrag: (dragging: boolean) => void;
}

function ToastItem({ record, onLeave, onDrag }: ToastItemProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const slotRef = useRef<HTMLLIElement>(null);
  const drag = useRef<{ x: number; y: number; at: number; pointer: number; active: boolean } | null>(null);
  const [offset, setOffset] = useState(0);
  /** 指で動かしている間は、指に付いてくるよう遷移を切る。 */
  const [dragging, setDragging] = useState(false);
  /** 払って閉じた向き（-1 / 1）。退出もその向きへ流す。 */
  const [away, setAway] = useState(0);
  const { id, exiting } = record;

  // 閉じたら退出を描き、描き終えてから外す（V-04 と同じく、待つ時間は CSS の計算値から読む）。
  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!exiting || !slot) return undefined;
    if (slot.contains(document.activeElement)) onLeave(slot);
    const wait = transitionMs(slot);
    if (wait <= 0) {
      remove(id);
      return undefined;
    }
    const timer = setTimeout(() => remove(id), wait);
    return () => clearTimeout(timer);
  }, [exiting, id, onLeave]);

  const end = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const state = drag.current;
    drag.current = null;
    if (!state?.active) return;
    setDragging(false);
    onDrag(false);
    const dx = event.clientX - state.x;
    const fast = Math.abs(dx) / Math.max(1, event.timeStamp - state.at) > SWIPE_VELOCITY;
    if (!cancelled && (Math.abs(dx) > event.currentTarget.offsetWidth * SWIPE_RATIO || fast)) {
      setAway(Math.sign(dx));
      dismiss(id);
    } else {
      setOffset(0);
    }
  };

  const icon = record.tone === 'loading' ? (
    <span className="g-toast-spinner" aria-hidden="true" />
  ) : ICON_OF[record.tone] ? (
    <Icon name={ICON_OF[record.tone] ?? 'info'} className="g-toast-icon" />
  ) : null;

  return (
    <li ref={slotRef} className="g-toast-slot" data-exiting={exiting ? '' : undefined}>
      <div
        className="g-toast"
        data-tone={record.tone}
        data-dragging={dragging ? '' : undefined}
        style={
          {
            ...(offset ? { '--g-toast-drag': `${String(offset)}px` } : {}),
            ...(away ? { '--g-toast-away': away } : {}),
          } as CSSProperties
        }
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // モーダルの中に出ているときも、Esc はこのトーストだけを閉じる（モーダルの cancel まで届かせない）。
          event.preventDefault();
          dismiss(id);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || (event.target as Element).closest('button, a')) return;
          drag.current = { x: event.clientX, y: event.clientY, at: event.timeStamp, pointer: event.pointerId, active: false };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || state.pointer !== event.pointerId) return;
          const dx = event.clientX - state.x;
          if (!state.active) {
            if (Math.abs(dx) < SWIPE_SLOP) return;
            // 縦に動かしたならスクロールに任せる。
            if (Math.abs(event.clientY - state.y) > Math.abs(dx)) {
              drag.current = null;
              return;
            }
            state.active = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            onDrag(true);
          }
          setOffset(dx);
        }}
        onPointerUp={(event) => end(event, false)}
        onPointerCancel={(event) => end(event, true)}
      >
        {icon}
        <div className="g-toast-body">
          <div className="g-toast-message">{phrase(record.message)}</div>
          {record.description ? <div className="g-toast-description">{phrase(record.description)}</div> : null}
          {record.action ? (
            <button
              type="button"
              className="g-toast-action"
              onClick={() => {
                record.action?.onClick();
                dismiss(id);
              }}
            >
              {phrase(record.action.label)}
            </button>
          ) : null}
        </div>
        <button type="button" className="g-toast-close" aria-label={labels.closeNotification} onClick={() => dismiss(id)}>
          <Icon name="close" />
        </button>
        {Number.isFinite(record.duration) ? <ToastMeter key={record.revision} record={record} /> : null}
      </div>
    </li>
  );
}

/**
 * 残り時間のメーター。N-02。下端の線が、残り時間に比例して縮む（薄い下地が全体の長さを見せる）。
 * 経った時間はマウントしたときに 1 度だけ読む（描き直しで animation-delay を変えると、動いているアニメーションが飛ぶ）。
 * 動きを減らす設定では、1 秒ごとに刻んで縮める（--g-toast-steps）。
 */
function ToastMeter({ record }: { record: ToastRecord }): ReactNode {
  const [elapsed] = useState(() => record.duration - remainingOf(record, Date.now()));
  return (
    <span className="g-toast-meter" aria-hidden="true">
      <span
        className="g-toast-meter-fill"
        style={
          {
            '--g-toast-duration': `${String(record.duration)}ms`,
            '--g-toast-elapsed': `${String(-Math.max(0, elapsed))}ms`,
            '--g-toast-steps': Math.max(1, Math.round(record.duration / 1000)),
          } as CSSProperties
        }
      />
    </span>
  );
}
