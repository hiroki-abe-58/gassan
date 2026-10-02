import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { ModalBody } from './body';
import { ModalConsent, ModalGateStatus } from './gate';
import {
  ModalClose,
  ModalControls,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from './header';
import { ModalButton, ModalFooter } from './footer';
import { warnOnce } from './internal/dom';
import { useLabels } from './labels';
import { ModalRoot } from './root';
import type { ModalKind, SizeToken } from './types';

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  /** 指定すると同意チェックが必須になり、チェックするまで確定できない。 */
  consent?: string;
  /** 既定は confirm（consent 指定時は consent）。 */
  kind?: ModalKind;
  size?: SizeToken;
  /** × ボタンを出すか。既定 true（consent 指定時は false）。 */
  dismissible?: boolean;
}

interface QueueItem {
  id: number;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* store                                                                      */
/* -------------------------------------------------------------------------- */

let queue: readonly QueueItem[] = [];
let sequence = 0;
let hostCount = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): readonly QueueItem[] {
  return queue;
}

const EMPTY: readonly QueueItem[] = [];
function getServerSnapshot(): readonly QueueItem[] {
  return EMPTY;
}

/**
 * 確認ダイアログを1枚出し、結果を Promise で返す。L-14。
 *
 * 同時に2枚出さない。先に出ているものが片付くまで待たせる。
 * 2枚重なると、利用者はどちらに答えているのか分からなくなる。
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    sequence += 1;
    const item: QueueItem = { id: sequence, options, resolve };
    queue = [...queue, item];
    emit();

    // ホストの有無をその場で見ない。
    // 子の effect は親より先に走るので、<ModalHost /> を正しくルートに置いていても
    // 「子の effect から confirm()」はホスト登録前に到達する。
    // そこで判定を 1 ティック遅らせ、まだホストが無く、かつ自分がまだ
    // 待たされたままのときだけ警告する。誤報を出す警告は無視される警告になる。
    queueMicrotask(() => {
      if (hostCount > 0) return;
      if (!queue.includes(item)) return;
      warnOnce(
        'no-host',
        'confirm() was called but <ModalHost /> is not mounted. The promise will never settle.',
      );
    });
  });
}

function dequeue(item: QueueItem, value: boolean): void {
  if (queue[0] !== item) {
    queue = queue.filter((entry) => entry !== item);
    emit();
    item.resolve(value);
    return;
  }
  queue = queue.slice(1);
  emit();
  item.resolve(value);
}

export interface ModalsApi {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function useModals(): ModalsApi {
  return useMemo(() => ({ confirm }), []);
}

/** テスト用。待機中の Promise を全部 false で解決して捨てる。 */
export function resetModalQueue(): void {
  const pending = queue;
  queue = [];
  emit();
  for (const item of pending) item.resolve(false);
}

/* -------------------------------------------------------------------------- */
/* Host                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * 命令的 API の描画先。アプリのルートに1つだけ置く。
 * 先頭の1件だけを描画し、閉じ切ってから次に進む。
 */
export function ModalHost(): ReactNode {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hostCount += 1;
    if (hostCount > 1) {
      warnOnce(
        'multiple-hosts',
        `${hostCount} <ModalHost /> instances are mounted. ` +
          'Each one renders the head of the same queue, so the dialog appears duplicated ' +
          'and one answer resolves it for all of them. Mount exactly one at the app root.',
      );
    }
    return () => {
      hostCount -= 1;
      // 待たせたまま出口が消えた。この Promise は誰も解決しない。
      // 握りつぶすと「await が返ってこない」だけが残り、原因が辿れなくなる。
      if (hostCount === 0 && queue.length > 0) {
        warnOnce(
          'host-unmounted',
          `<ModalHost /> unmounted while ${queue.length} confirm() call(s) were still pending. ` +
            'Those promises will never settle. Keep the host mounted for the whole app lifetime, ' +
            'or call resetModalQueue() when tearing it down.',
        );
      }
    };
  }, []);

  const head = items[0];
  if (!head) return null;
  // key を付けないと、2件目が1件目のチェック状態を引き継いでしまう。
  return <QueuedConfirm key={head.id} item={head} />;
}

function QueuedConfirm({ item }: { item: QueueItem }): ReactNode {
  const labels = useLabels();
  const {
    title,
    description,
    confirmLabel,
    cancelLabel,
    tone = 'default',
    consent,
    kind,
    size = 'sm',
    dismissible,
  } = item.options;

  const [open, setOpen] = useState(true);
  const resultRef = useRef(false);

  const resolvedKind: ModalKind = kind ?? (consent ? 'consent' : 'confirm');
  const showClose = dismissible ?? !consent;

  const finish = (value: boolean): void => {
    resultRef.current = value;
    setOpen(false);
  };

  return (
    <ModalRoot
      open={open}
      kind={resolvedKind}
      size={size}
      onOpenChange={(next) => {
        if (!next) finish(false);
      }}
      // 退出アニメが終わってから解決する。
      // 即座に解決して unmount すると、閉じる動きが一切見えない。
      onExited={() => dequeue(item, resultRef.current)}
    >
      <ModalHeader>
        <ModalControls end={showClose ? <ModalClose /> : undefined} />
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>

      <ModalBody readGate={undefined}>
        {description ? <ModalDescription>{description}</ModalDescription> : null}
        {consent ? <ModalConsent gate="confirm-consent">{consent}</ModalConsent> : null}
        {consent ? <ModalGateStatus gate={['confirm-consent']} /> : null}
      </ModalBody>

      <ModalFooter>
        <ModalButton variant="tertiary" onClick={() => finish(false)}>
          {cancelLabel ?? labels.cancel}
        </ModalButton>
        <ModalButton
          variant={tone === 'danger' ? 'danger' : 'primary'}
          gate={consent ? ['confirm-consent'] : undefined}
          onClick={() => finish(true)}
        >
          {confirmLabel ?? labels.ok}
        </ModalButton>
      </ModalFooter>
    </ModalRoot>
  );
}
