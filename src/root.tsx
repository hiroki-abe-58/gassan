import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SyntheticEvent,
} from 'react';

import { GateContext, ModalContext, type ModalContextValue, type ModalIds } from './context';
import {
  isCoarsePointer,
  isFocusable,
  isOwnDialogEvent,
  isPrimaryPointer,
  isTextEntry,
  matchMediaSafe,
  prefersReducedMotion,
  readCssDurationMs,
  viewportHeight,
  warnOnce,
} from './internal/dom';
import { lockBodyScroll, unlockBodyScroll } from './internal/scroll-lock';
import { isTopModal, popModal, pushModal } from './internal/stack';
import {
  CLICK_SUPPRESS_WINDOW,
  DRAG_SLOP,
  SWIPE_BLOCKING_SELECTOR,
  shouldDismissBySwipe,
} from './internal/swipe';
import {
  detentCssValue,
  detentHeight,
  detentIndexOf,
  resolveDetents,
  snapToDetent,
  type DetentToken,
} from './internal/detent';
import {
  duplicateGateNames,
  mergeGateInstances,
  setGateInstance,
  type GateInstances,
} from './internal/gate-registry';
import { useLabels } from './labels';
import { useEvent } from './internal/use-event';
import {
  DEFAULT_BLOCKED_MESSAGE,
  KIND_DEFAULTS,
  type CloseReason,
  type DismissPolicy,
  type GateEntry,
  type ModalKind,
  type PlacementOption,
  type PlacementToken,
  type ScrimToken,
  type SizeToken,
} from './types';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

/** 同一文言を読み直させるため、一度空にしてから入れる。その間隔。A-05。 */
const LIVE_REGION_DELAY = 60;
/** 拒否フィードバックの表示時間。CSS のシェイクより少し長く取る。 */
const BLOCKED_FEEDBACK_MS = 420;
/** 退出アニメの取りこぼしを防ぐ余白。 */
const EXIT_GRACE_MS = 20;
/**
 * prefers-reduced-motion: reduce のときの退出待ち。
 * 0 でも setTimeout を経由させるのは、「退出中に再オープン」の経路を
 * 動きの有無で分岐させず、同じコードパスに通すため。
 */
const REDUCED_EXIT_MS = 0;

export interface ModalRootProps extends DataAttributes {
  /** 開いているか。常時マウントし、この prop で開閉する（条件マウントにしない）。 */
  open: boolean;
  /**
   * 開閉要求。閉じる要求は理由つきで届く。
   * 制御コンポーネントなので、ここで state を更新しない限りモーダルは閉じない。
   */
  onOpenChange: (open: boolean, reason: CloseReason) => void;
  /** モーダルの類型（§2）。scrim / dismiss / placement の既定がここから決まる。 */
  kind?: ModalKind;
  size?: SizeToken;
  scrim?: ScrimToken;
  placement?: PlacementOption;
  /** kind の既定を個別に上書きする。 */
  dismiss?: DismissPolicy;
  /**
   * 閉じてよいかの最終判断。false を返すと閉じずに拒否フィードバックが出る。
   * 非同期（未保存確認など）も可。
   */
  onRequestClose?: (reason: CloseReason) => boolean | Promise<boolean>;
  /** 拒否時に読み上げる文言。 */
  blockedMessage?: string;
  /** Modal.Title を置かない場合のアクセシブルネーム。A-01。 */
  label?: string;
  /** 初期フォーカス先。既定はパネル本体。K-03 / K-04。 */
  initialFocus?: RefObject<HTMLElement | null>;
  /** 閉じた後のフォーカス先。トリガーが消えるフローで使う。K-06。 */
  finalFocus?: RefObject<HTMLElement | null>;
  /** iOS 向けの JS スクロールロックを併用する。M-06。 */
  lockScroll?: boolean;
  /** placement="auto" をシートに切り替える幅。既定 600。 */
  sheetBreakpoint?: number;
  /** シート配置でのスワイプ閉じ。M-02。 */
  swipeToDismiss?: boolean;
  /**
   * シートが止まる高さ。M-03。渡さなければ従来どおり内容なりの高さになる。
   * 順序は問わない（低い順に並べ替える）。未知の名前は捨てる。
   */
  detents?: readonly DetentToken[];
  /** 開いたときの段。既定は最も高い段。 */
  defaultDetent?: DetentToken;
  /** 段が変わったときに呼ばれる。 */
  onDetentChange?: (detent: DetentToken) => void;
  /** ブラウザバックで閉じる。M-07。 */
  closeOnBack?: boolean;
  /** 値が変わったら route-change として閉じる。Next.js なら usePathname() を渡す。L-13。 */
  routeKey?: string | number;
  /** 閉じ切ったら中身を作り直す。前回のチェック状態が残る事故を防ぐ。既定 true。 */
  resetOnClose?: boolean;
  /** Cmd/Ctrl + Enter で primary を実行する。F-10。 */
  submitShortcut?: boolean;
  /**
   * 退出アニメを含めて完全に閉じ切った後（dialog.close() の後）に一度だけ呼ばれる。L-06。
   * 退出中に open が true に戻った場合は呼ばれない。
   */
  onExited?: () => void;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  'aria-describedby'?: string;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (value: T | null) => void {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value);
      else if (ref) (ref as { current: T | null }).current = value;
    }
  };
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const ModalRoot = forwardRef<HTMLDialogElement, ModalRootProps>(function ModalRoot(
  props,
  forwardedRef,
) {
  const {
    open,
    onOpenChange,
    kind = 'form',
    size = 'md',
    scrim,
    placement,
    dismiss,
    onRequestClose,
    blockedMessage,
    label,
    initialFocus,
    finalFocus,
    lockScroll = false,
    sheetBreakpoint = 600,
    swipeToDismiss = false,
    detents,
    defaultDetent,
    onDetentChange,
    closeOnBack = false,
    routeKey,
    resetOnClose = true,
    submitShortcut = false,
    onExited,
    id,
    className,
    style,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const defaults = KIND_DEFAULTS[kind];
  const resolvedScrim: ScrimToken = scrim ?? defaults.scrim;
  const escAllowed = dismiss?.esc ?? defaults.dismiss.esc;
  const backdropAllowed = dismiss?.backdrop ?? defaults.dismiss.backdrop;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);

  /**
   * unmount 時のクリーンアップ用。
   * useEffect の cleanup は ref の切り離しより後に走るため、
   * その時点で dialogRef.current は既に null になっている。
   */
  const lastNodeRef = useRef<HTMLDialogElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** showModal() してから後始末（finalizeClose）を終えるまで true。 */
  const shownRef = useRef(false);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardPendingRef = useRef(false);
  const scrollLockedRef = useRef(false);
  const pointerDownOnScrimRef = useRef(false);
  const swipeRef = useRef<{
    id: number | undefined;
    startY: number;
    startedAt: number;
    /** ドラッグ開始時のパネル高さ (px)。段の計算の起点。 */
    startHeight: number;
    /** DRAG_SLOP を超えて動いたか。合成 click を捨てるかの判断に使う。 */
    moved: boolean;
  } | null>(null);
  /** 直前のドラッグが終わった時刻 (ms)。null なら捨てる click は無い。H-09。 */
  const suppressClickRef = useRef<number | null>(null);

  const detentIndexRef = useRef(0);

  const [live, setLive] = useState('');
  const [generation, setGeneration] = useState(0);
  const [gateInstances, setGateInstances] = useState<GateInstances>(() => new Map());
  /**
   * 「この世代の登録が出揃った」と言える世代番号。G-12。
   *
   * -1 は「まだどの世代も出揃っていない」。レンダー時に generation と突き合わせるので、
   * resetOnClose で子が作り直されると自動的に未確定へ戻る。
   * フラグを別に持って effect で false に戻すと、戻すまでの 1 レンダーが
   * 「空の登録簿 × 確定済み」になり、そこだけ fail-open になる。
   */
  const [gatesReadyFor, setGatesReadyFor] = useState(-1);
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  const labels = useLabels();
  const reactId = useId();
  const base = id ?? `kasane-${reactId}`;
  const ids = useMemo<ModalIds>(
    () => ({
      dialog: base,
      title: `${base}-title`,
      description: `${base}-description`,
      body: `${base}-body`,
    }),
    [base],
  );

  /* ---------------------------------------------------------------- placement */

  const requestedPlacement: PlacementOption = placement ?? defaults.placement;
  const [autoPlacement, setAutoPlacement] = useState<PlacementToken>('center');

  useEffect(() => {
    if (requestedPlacement !== 'auto') return;
    const mq = matchMediaSafe(`(max-width: ${Math.max(0, sheetBreakpoint - 1)}px)`);
    if (!mq) return;
    const apply = () => setAutoPlacement(mq.matches ? 'sheet' : 'center');
    apply();
    if (typeof mq.addEventListener !== 'function') return;
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [requestedPlacement, sheetBreakpoint]);

  const resolvedPlacement: PlacementToken =
    requestedPlacement === 'auto' ? autoPlacement : requestedPlacement;

  /* ------------------------------------------------------------ announcements */

  const announce = useEvent((message: string) => {
    if (!message) return;
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    setLive('');
    announceTimerRef.current = setTimeout(() => {
      announceTimerRef.current = null;
      setLive(message);
    }, LIVE_REGION_DELAY);
  });

  /** L-10。無反応にせず、必ず理由を返す。 */
  const signalBlocked = useEvent((message?: string) => {
    const panel = panelRef.current;
    if (panel) {
      panel.setAttribute('data-k-blocked', '');
      if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
      blockTimerRef.current = setTimeout(() => {
        blockTimerRef.current = null;
        panel.removeAttribute('data-k-blocked');
      }, BLOCKED_FEEDBACK_MS);
    }
    announce(message ?? blockedMessage ?? DEFAULT_BLOCKED_MESSAGE);
  });

  /* -------------------------------------------------------------- close route */

  const commitClose = useEvent((reason: CloseReason) => {
    onOpenChange(false, reason);
  });

  const requestClose = useEvent((reason: CloseReason) => {
    if (!open) return;

    const allowed =
      reason === 'esc' ? escAllowed : reason === 'backdrop' || reason === 'swipe' ? backdropAllowed : true;
    if (!allowed) {
      signalBlocked();
      return;
    }

    if (guardPendingRef.current) return;

    if (!onRequestClose) {
      commitClose(reason);
      return;
    }

    let verdict: boolean | Promise<boolean>;
    try {
      verdict = onRequestClose(reason);
    } catch (error) {
      console.error('[kasane] onRequestClose threw; keeping the dialog open.', error);
      return;
    }

    if (typeof verdict === 'boolean') {
      if (verdict) commitClose(reason);
      else signalBlocked();
      return;
    }

    guardPendingRef.current = true;
    void Promise.resolve(verdict).then(
      (ok) => {
        guardPendingRef.current = false;
        if (ok) commitClose(reason);
        else signalBlocked();
      },
      (error: unknown) => {
        guardPendingRef.current = false;
        console.error('[kasane] onRequestClose rejected; keeping the dialog open.', error);
      },
    );
  });

  /* ------------------------------------------------------------------- focus */

  const focusInitial = useEvent(() => {
    const explicit = initialFocus?.current ?? null;
    let target: HTMLElement | null = panelRef.current;
    if (isFocusable(explicit)) {
      // タッチ端末でテキスト入力に当てると仮想キーボードが本文を隠す。K-04。
      target = isCoarsePointer() && isTextEntry(explicit) ? panelRef.current : explicit;
    }
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  });

  const restoreFocus = useEvent(() => {
    const explicit = finalFocus?.current ?? null;
    if (isFocusable(explicit)) {
      explicit.focus();
      return;
    }
    if (typeof document === 'undefined') return;
    // ネイティブがトリガーへ戻していれば何もしない。K-06。
    // ただし閉じた dialog の内側に取り残されている場合は戻す
    // （フォーカス復帰を持たない環境・jsdom では activeElement が非表示の要素に残る）。
    const active = document.activeElement;
    const dialog = dialogRef.current ?? lastNodeRef.current;
    const stranded =
      !active || active === document.body || Boolean(dialog && dialog.contains(active));
    if (!stranded) return;
    const previous = previousFocusRef.current;
    if (isFocusable(previous)) previous.focus();
  });

  /* ------------------------------------------------------------ open / close */

  const notifyExited = useEvent(() => {
    onExited?.();
  });

  /**
   * 実際に閉じ、後始末をする。L-06 / L-07。
   * onExited / 中身のリセット / フォーカス復帰 / スクロールロック解除は、
   * すべて dialog.close() の「後」に行う。
   */
  const finalizeClose = useEvent((el: HTMLDialogElement) => {
    if (el.open) {
      try {
        el.close();
      } catch {
        /* 既に閉じている */
      }
    }
    if (el.hasAttribute('data-exiting')) {
      // [data-exiting] が付いたまま一度スタイルを確定させる。
      // CSS 側は .k-dialog[data-exiting] { transition: none } なので、
      // overlay 対応ブラウザでも display / overlay の discrete transition が
      // もう一周走らない（見えない全画面要素が 120ms 居座ってクリックを奪う、を防ぐ）。
      try {
        void getComputedStyle(el).display;
      } catch {
        /* getComputedStyle が無い環境 */
      }
      el.removeAttribute('data-exiting');
    }
    shownRef.current = false;
    popModal(el);
    if (scrollLockedRef.current) {
      unlockBodyScroll();
      scrollLockedRef.current = false;
    }
    if (resetOnClose) setGeneration((value) => value + 1);
    restoreFocus();
    notifyExited();
  });

  /**
   * 退出アニメーション。L-07。
   *
   * CSS の overlay transition は MDN 上 Limited availability（Baseline ではない）。
   * 未対応ブラウザで data-exiting を付けた直後に close() すると、top layer から即座に外れて
   * 一瞬で消える。そこで dialog は open のまま data-exiting で退出状態を描き、
   * --k-dur-out（reduced-motion なら最短）を待ってから close() する。
   * state を経由すると1フレーム遅れるので、属性は DOM に直接付ける。
   */
  const performClose = useEvent((el: HTMLDialogElement) => {
    if (exitTimerRef.current) return;
    el.setAttribute('data-exiting', '');
    // 下のモーダルのスクリムを退出と同時に戻す（クロスフェード）。再オープンなら push し直す。
    popModal(el);
    const delay = prefersReducedMotion()
      ? REDUCED_EXIT_MS
      : readCssDurationMs(el, '--k-dur-out', 120) + EXIT_GRACE_MS;
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      finalizeClose(el);
    }, delay);
  });

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    lastNodeRef.current = el;

    if (open) {
      if (exitTimerRef.current) {
        // 退出中に開き直された。close() せず、open のまま元に戻す。
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
        if (el.open) pushModal(el);
      }
      el.removeAttribute('data-exiting');
      if (!el.open) {
        previousFocusRef.current =
          typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
        // showModal() は「最初のフォーカサブル子孫」を選ぶ。放置すると × に当たる。K-03。
        panelRef.current?.setAttribute('autofocus', '');
        // returnValue は close() / showModal() のどちらでも初期化されない。
        // 前回 <form method="dialog"> で閉じた値が残ると、次回の外部 close() が
        // submit と誤分類される。F-11。
        el.returnValue = '';
        try {
          el.showModal();
        } catch {
          /* 既に別経路で開いている */
        }
        shownRef.current = true;
        pushModal(el);
        if (lockScroll && !scrollLockedRef.current) {
          lockBodyScroll();
          scrollLockedRef.current = true;
        }
        focusInitial();
      }
    } else if (el.open) {
      performClose(el);
    } else if (shownRef.current && !exitTimerRef.current) {
      // <form method="dialog"> や外部の el.close() でネイティブ側が先に閉じた。
      // 退出アニメは描けないが、後始末（スタック / スクロールロック / onExited）は必ず行う。
      finalizeClose(el);
    }
  }, [open, lockScroll, focusInitial, performClose, finalizeClose]);

  // unmount 専用。ref が切り離された後でも last node を掴んでいる。
  useEffect(
    () => () => {
      const el = lastNodeRef.current;
      shownRef.current = false;
      if (el) {
        popModal(el);
        el.removeAttribute('data-exiting');
        if (el.open) {
          try {
            el.close();
          } catch {
            /* noop */
          }
        }
      }
      if (scrollLockedRef.current) {
        unlockBodyScroll();
        scrollLockedRef.current = false;
      }
      for (const timer of [exitTimerRef, blockTimerRef, announceTimerRef]) {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
      }
    },
    [],
  );

  /* ------------------------------------------------------- environment hooks */

  // 仮想キーボードぶんの余白を CSS 変数で渡す。M-04。
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const el = dialogRef.current;
    if (!vv || !el) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty('--k-keyboard-inset', `${Math.round(inset)}px`);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      el.style.removeProperty('--k-keyboard-inset');
    };
  }, [open]);

  // ブラウザバックで閉じる。M-07。
  useEffect(() => {
    if (!open || !closeOnBack || typeof window === 'undefined' || !window.history) return;
    const token = `kasane-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.history.pushState({ __kasane: token }, '');
    const onPop = (event: PopStateEvent) => {
      // popstate は window のイベントなので、開いている全モーダルの購読者に届く。
      // 戻る1回で閉じるのは最前面だけ。これが無いと重なった2枚が同時に消える。L-12。
      const el = dialogRef.current;
      if (el && !isTopModal(el)) return;
      // 行き先が自分の印そのものなら、戻るジェスチャではない。
      // 上のモーダルが × で閉じると、後始末の history.back() で「自分の entry」に戻ってくる。
      // それを戻る操作と取り違えると、上を閉じただけで下まで連鎖して閉じる。
      // 逆にユーザーが戻るを押したときは、自分の entry より手前へ出るので印は一致しない。
      // カウンタで打ち消す手もあるが、back() が最初の entry で何も起こさないと
      // 印が消費されず次の本物の戻るを飲み込む。状態を持たないこの判定なら漏れない。M-07。
      const landing = event.state as { __kasane?: string } | null;
      if (landing?.__kasane === token) return;
      requestClose('back-button');
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      const state = window.history.state as { __kasane?: string } | null;
      if (state?.__kasane === token) window.history.back();
    };
  }, [open, closeOnBack, requestClose]);

  // ルート変更で閉じる。L-13。
  const previousRouteKeyRef = useRef(routeKey);
  useEffect(() => {
    if (previousRouteKeyRef.current === routeKey) return;
    previousRouteKeyRef.current = routeKey;
    if (open) requestClose('route-change');
  }, [routeKey, open, requestClose]);

  /* ----------------------------------------------------------------- gates */

  const registerGate = useEvent(
    (name: string, entry: GateEntry | null, instanceId?: string) => {
      // instanceId 省略時は名前そのものを登録者 ID にする。
      // 公開型なので、2 引数で呼ぶ既存のコードも従来どおり動く。
      const key = instanceId ?? name;
      setGateInstances((previous) => setGateInstance(previous, name, key, entry));
    },
  );

  /**
   * 参照側に渡す形へ畳む。名前ごとに 1 件、連言（ひとつでも未充足なら未充足）。
   * 畳み方は src/internal/gate-registry.ts に純粋関数として置いてある。
   */
  const gates = useMemo(() => mergeGateInstances(gateInstances), [gateInstances]);

  /**
   * 子の effect がすべて走り終えた時点で「出揃った」と記録する。
   *
   * React は子の effect を親より先に流すので、この effect が走る時点では
   * 配下の Gate / Consent / Body(readGate) の登録が済んでいる。
   * 登録による setState とこの setState は同じフラッシュで束ねられるため、
   * 再レンダーは 1 回で済み、ちらつかない。
   */
  useEffect(() => {
    setGatesReadyFor(generation);
  }, [generation]);

  useEffect(() => {
    const duplicated = duplicateGateNames(gateInstances);
    for (const name of duplicated) {
      warnOnce(
        `duplicate-gate:${name}`,
        `Two or more gates are registered under the name "${name}". ` +
          'They are combined with AND (the button stays blocked while any of them is unsatisfied), ' +
          'but sharing a name makes the reason text ambiguous. Give each gate its own name.',
      );
    }
  }, [gateInstances]);

  const scrollBodyByPage = useEvent(() => {
    const body = bodyRef.current;
    if (!body) return;
    const delta = Math.max(80, body.clientHeight * 0.85);
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (typeof body.scrollBy === 'function') body.scrollBy({ top: delta, behavior });
    else body.scrollTop += delta;
  });

  /**
   * state と別に、同期的に更新される登録数を持つ。
   * 名前なし警告のタイマーは「子の setState が親に届く前」に走ることがあり
   * （外部ストア起点の再マウントなど）、state だけを見ると誤検知する。A-01。
   */
  const titleCountRef = useRef(0);
  const setHasTitle = useEvent((present: boolean) => {
    titleCountRef.current = Math.max(0, titleCountRef.current + (present ? 1 : -1));
    setTitleCount((count) => Math.max(0, count + (present ? 1 : -1)));
  });
  const setHasDescription = useEvent((present: boolean) => {
    setDescriptionCount((count) => Math.max(0, count + (present ? 1 : -1)));
  });

  /* ------------------------------------------------------------- DOM events */

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement, Event>) => {
      // 入れ子の内側で起きた cancel は無視する。L-12。
      // React は非バブルの cancel でも fiber ツリーを遡って祖先の onCancel を呼ぶため、
      // これが無いと Esc 一回で重なった2枚が同時に閉じる。
      if (!isOwnDialogEvent(dialogRef.current, event.target)) return;
      // 常に止めて自前ルートへ一本化する。L-09。
      // closedby="none" を使わないのは、あれだと cancel すら発火せず理由を返せないため
      // （closedby は MDN 上 Limited availability でもある）。
      event.preventDefault();
      requestClose('esc');
    },
    [requestClose],
  );

  const handleNativeClose = useEvent((event: SyntheticEvent<HTMLDialogElement, Event>) => {
    const el = dialogRef.current;
    // 入れ子の内側が閉じたときの close を弾く。L-12。cancel と同じく React 経由で遡る。
    if (!isOwnDialogEvent(el, event.target)) return;
    // 閉→即開のときに遅れて届く close を弾く。
    if (el?.open) return;
    // 我々の同期による close。
    if (!open) return;
    // ここに来るのは <form method="dialog"> か、外部から el.close() を呼ばれた場合。F-11。
    const hasReturnValue = Boolean(el?.returnValue);
    onOpenChange(false, hasReturnValue ? 'submit' : 'programmatic');
  });

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDialogElement>) => {
    pointerDownOnScrimRef.current =
      isPrimaryPointer(event) && event.target === scrimRef.current;
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDialogElement>) => {
      const startedOnScrim = pointerDownOnScrimRef.current;
      pointerDownOnScrimRef.current = false;
      if (!startedOnScrim) return;
      // 押下と解放の両方がスクリム上のときだけ閉じる。
      // これが無いと、本文のテキスト選択が外へ抜けた瞬間に閉じる。S-08。
      if (event.target !== scrimRef.current) return;
      if (!isPrimaryPointer(event)) return;
      requestClose('backdrop');
    },
    [requestClose],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDialogElement>) => {
      if (!submitShortcut) return;
      // keydown はネイティブでバブルする。入れの内側で押された Cmd/Ctrl+Enter が
      // 外側まで上がってきて、外側の primary まで押してしまうのを防ぐ。L-12 / F-10。
      if (!isOwnDialogEvent(dialogRef.current, event.target)) return;
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
      // 入れ子の内側の primary を拾わないこと。L-12 / F-10。
      // querySelector はパネル配下を全部見るので、本文の中にマウントされた
      // 内側のモーダル（閉じていても DOM には居る）のボタンが先に当たってしまう。
      const candidates =
        panelRef.current?.querySelectorAll<HTMLElement>(
          '.k-btn[data-variant="primary"]:not([data-gated]):not([data-loading])',
        ) ?? [];
      let button: HTMLElement | null = null;
      for (const candidate of Array.from(candidates)) {
        if (isOwnDialogEvent(dialogRef.current, candidate)) {
          button = candidate;
          break;
        }
      }
      if (!button) return;
      event.preventDefault();
      button.click();
    },
    [submitShortcut],
  );

  /* ---------------------------------------------------------------- detents */

  // detents は配列リテラルで渡されることが多く、参照は毎レンダー変わる。
  // 中身を連結した文字列だけを memo の入力にして、参照の揺れを外へ出す。
  // 「指定なし」と「空配列」を null で区別する（join だけだと両者が '' に潰れる）。
  const detentKey = detents && detents.length > 0 ? detents.join(',') : null;
  const detentTokens = useMemo<DetentToken[]>(() => {
    if (detentKey === null) return [];
    const requested = detentKey.split(',');
    const resolved = resolveDetents(requested);
    if (resolved.length !== new Set(requested).size) {
      warnOnce(
        `detents:${detentKey}`,
        `Unknown detent in [${detentKey}]. Valid values are "peek" | "half" | "full". (M-03)`,
      );
    }
    return resolved;
  }, [detentKey]);

  const detentsEnabled = detentTokens.length > 0;
  const lastDetent = detentTokens.length - 1;
  const defaultDetentIndex = detentsEnabled ? detentIndexOf(detentTokens, defaultDetent) : 0;
  const [detentIndex, setDetentIndexState] = useState(defaultDetentIndex);

  // 開くたびに既定の段へ戻す。前回ユーザーが縮めた状態が残っていると、
  // 次に開いた人は「中身が切れている」としか認識できない。
  useEffect(() => {
    if (!open) return;
    detentIndexRef.current = defaultDetentIndex;
    setDetentIndexState(defaultDetentIndex);
  }, [open, defaultDetentIndex]);

  const emitDetentChange = useEvent((token: DetentToken) => onDetentChange?.(token));

  const setDetentIndex = useEvent((next: number, options?: { silent?: boolean }) => {
    if (!detentsEnabled) return;
    const rounded = Number.isFinite(next) ? Math.round(next) : 0;
    const clamped = Math.min(lastDetent, Math.max(0, rounded));
    if (clamped === detentIndexRef.current) return;
    const token = detentTokens[clamped];
    if (!token) return;
    detentIndexRef.current = clamped;
    setDetentIndexState(clamped);
    if (!options?.silent) announce(labels.detentChanged(labels.detent(token)));
    emitDetentChange(token);
  });

  // 段の一覧は利用側の prop なので、開いている最中に減ることがある。
  // 減った直後の 1 レンダーで state が範囲外になり、つまみが
  // aria-valuenow > aria-valuemax という成立しない値を出す。読み取り時に丸める。
  const safeDetentIndex = detentsEnabled
    ? Math.min(lastDetent, Math.max(0, detentIndex))
    : 0;

  const activeDetent = detentsEnabled
    ? (detentTokens[safeDetentIndex] ?? detentTokens[lastDetent])
    : undefined;

  // 丸めた結果を state 側にも書き戻す。ここを放っておくと ref が範囲外のまま残り、
  // 次の setDetentIndex が「変化なし」と誤判定して操作が 1 回効かなくなる。
  // onDetentChange は鳴らさない。prop を変えたのは利用側であり、
  // その通知で detents をまた変えられると往復が止まらなくなる。
  useEffect(() => {
    if (!detentsEnabled) return;
    if (detentIndexRef.current <= lastDetent && detentIndexRef.current >= 0) return;
    const clamped = Math.min(lastDetent, Math.max(0, detentIndexRef.current));
    detentIndexRef.current = clamped;
    setDetentIndexState(clamped);
  }, [detentsEnabled, lastDetent]);

  /* ------------------------------------------------------------------ swipe */

  const sheetMode = resolvedPlacement === 'sheet';
  // スワイプで閉じるのは「スクリムを押して閉じる」の指版なので、同じ許可に従わせる。
  // 片方だけ許すと、指とマウスで閉じられる条件が変わって説明がつかなくなる。
  const dismissBySwipe = swipeToDismiss && backdropAllowed;
  if (swipeToDismiss && !backdropAllowed) {
    warnOnce(
      'swipeToDismiss:backdrop',
      'swipeToDismiss has no effect while dismiss.backdrop is false. ' +
        'Swiping down is the touch equivalent of pressing the scrim. (M-02)',
    );
  }
  // 段があるなら、閉じられないダイアログでも高さは変えられてよい。
  const dragEnabled = sheetMode && (detentsEnabled || dismissBySwipe);

  /**
   * ドラッグ由来のインラインスタイルを落とし、React が書いた値へ戻す。
   *
   * 戻す先を ref や state から組み立て直してはいけない。
   * ここが欲しいのは「React が最後に DOM へ書いた値」そのものであり、
   * それは activeDetent から出る文字列ちょうど 1 つである。
   * 別経路で作ると、まだ同期していない ref を拾って別の段の高さを書き込み、
   * しかも React は自分の値が残っていると信じているので差分を出さない。
   */
  const restorePanelStyle = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.removeAttribute('data-k-dragging');
    panel.style.removeProperty('--k-swipe-y');
    // removeProperty で済ませない。同じ段に吸い付いたときは再レンダーが起きず、
    // 消したままだと block-size が auto に落ちてシートが内容なりの高さへ縮む。C-08。
    if (activeDetent) panel.style.setProperty('--k-sheet-detent', detentCssValue(activeDetent));
    else panel.style.removeProperty('--k-sheet-detent');
  }, [activeDetent]);

  const handlePanelPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // 指を置いた時点で、前のドラッグの残り香は捨てる。
      // キーボードでの Enter には pointerdown が無いので、ここだけでは足りない。
      suppressClickRef.current = null;
      if (!dragEnabled || !isPrimaryPointer(event)) return;
      // すでに掴んでいる最中の 2 本目は無視する。pointerType が違えば
      // どちらも isPrimary になりうるため、isPrimary だけでは弾けない。
      if (swipeRef.current) return;
      const target = event.target as HTMLElement | null;
      // つまみは「掴むための場所」なので、本文スクロール位置も
      // ボタン類の除外リストも無視して必ずドラッグを始める。
      const fromHandle = Boolean(target?.closest?.('[data-k-swipe-origin]'));
      if (!fromHandle) {
        // 本文がスクロール途中ならドラッグを始めない。さもないとスクロールと競合する。M-02。
        if ((bodyRef.current?.scrollTop ?? 0) > 0) return;
        if (target?.closest?.(SWIPE_BLOCKING_SELECTOR)) return;
      }
      swipeRef.current = {
        id: event.pointerId,
        startY: event.clientY,
        startedAt: Date.now(),
        startHeight: panelRef.current?.offsetHeight ?? 0,
        moved: false,
      };
      // 捕捉しておかないと、指やマウスがパネルの外へ出た瞬間に
      // pointermove も pointerup も届かなくなり、縮んだ姿で固まる。M-02。
      const panel = event.currentTarget;
      if (typeof panel.setPointerCapture === 'function') {
        try {
          panel.setPointerCapture(event.pointerId);
        } catch {
          // 既に離されたポインタだと NotFoundError。捕捉なしで続行する。
        }
      }
    },
    [dragEnabled],
  );

  const handlePanelPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const session = swipeRef.current;
      if (!session || session.id !== event.pointerId) return;
      const panel = panelRef.current;
      if (!panel) return;
      const deltaY = event.clientY - session.startY;
      if (Math.abs(deltaY) > DRAG_SLOP) session.moved = true;

      if (detentsEnabled) {
        // 段があるときは「ずらす」のではなく「高さを変える」。
        // 下端に貼り付いたまま縮むので、下に隙間が空かない。
        const vh = viewportHeight();
        const top = detentTokens[lastDetent];
        const max = top ? detentHeight(top, vh) : 0;
        const raw = session.startHeight - deltaY;
        const next = max > 0 ? Math.min(max, Math.max(0, raw)) : Math.max(0, raw);
        panel.setAttribute('data-k-dragging', '');
        panel.style.setProperty('--k-sheet-detent', `${next}px`);
        return;
      }

      if (deltaY <= 0) {
        panel.style.removeProperty('--k-swipe-y');
        return;
      }
      panel.setAttribute('data-k-dragging', '');
      panel.style.setProperty('--k-swipe-y', `${deltaY}px`);
    },
    [detentsEnabled, detentTokens, lastDetent],
  );

  const endSwipe = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const session = swipeRef.current;
      if (!session || session.id !== event.pointerId) return;
      swipeRef.current = null;
      const panel = panelRef.current;
      // インラインの px を捨て、React が持っている段（dvh）に戻す。
      restorePanelStyle();
      if (cancelled) return;

      const deltaY = event.clientY - session.startY;
      const elapsedMs = Date.now() - session.startedAt;
      // 掴んで動かしたなら、ブラウザがこのあと出す click は指の軌跡の残りかすであって
      // 「押した」ではない。つまみの click（1 段上げる）が二重に走るのを防ぐ。H-09。
      if (session.moved || Math.abs(deltaY) > DRAG_SLOP) suppressClickRef.current = Date.now();

      if (detentsEnabled) {
        const result = snapToDetent({
          detents: detentTokens,
          currentIndex: detentIndexRef.current,
          deltaY,
          elapsedMs,
          viewportHeight: viewportHeight(),
          dismissible: dismissBySwipe,
        });
        if (result.type === 'dismiss') requestClose('swipe');
        else setDetentIndex(result.index);
        return;
      }

      if (!dismissBySwipe) return;
      const decided = shouldDismissBySwipe({
        deltaY,
        elapsedMs,
        panelHeight: panel?.offsetHeight ?? 0,
      });
      if (decided) requestClose('swipe');
    },
    [detentsEnabled, detentTokens, dismissBySwipe, requestClose, setDetentIndex],
  );

  const handlePanelPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => endSwipe(event, false),
    [endSwipe],
  );
  const handlePanelPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => endSwipe(event, true),
    [endSwipe],
  );
  // 捕捉が外れる＝以後の pointerup は届かない。中断として畳む。
  // 正常な指離しでも pointerup のあとに届くが、そのときは既に session が無く素通りする。
  const handlePanelLostCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => endSwipe(event, true),
    [endSwipe],
  );

  const handlePanelClickCapture = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const at = suppressClickRef.current;
    if (at === null) return;
    suppressClickRef.current = null;
    // 時間で切る。ドラッグのあと click が来ないまま終わることもあり
    // （パネル外で指を離した、捕捉が外れた）、その残骸で
    // 次のキーボード操作を飲み込んではいけない。
    if (Date.now() - at > CLICK_SUPPRESS_WINDOW) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // 閉じるときはドラッグを畳む。掴んだまま Esc を押された場合などに、
  // data-k-dragging と px の高さが残り、次に開いたとき縮んだ姿で現れる。
  useEffect(() => {
    if (open) return;
    swipeRef.current = null;
    suppressClickRef.current = null;
    restorePanelStyle();
  }, [open, restorePanelStyle]);

  /* ------------------------------------------------------------------ names */

  const hasTitle = titleCount > 0;
  const hasDescription = descriptionCount > 0;

  useEffect(() => {
    if (!open) return;
    if (hasTitle || label) return;
    // Title の登録は子の effect で起きる。その結果が親に届くのは次のレンダー。
    // ここで即座に警告すると、正しく <Modal.Title> を置いている利用者にも
    // 初回に必ず誤検知が飛ぶ。1 tick 待ってから判定する。
    const timer = setTimeout(() => {
      if (titleCountRef.current > 0) return;
      warnOnce(
        `unnamed:${base}`,
        'Modal has no accessible name. Render <Modal.Title> or pass the `label` prop. (A-01)',
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [open, hasTitle, label, base]);

  const describedBy =
    [hasDescription ? ids.description : null, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;

  const hasBlockedGate = useMemo(() => {
    for (const entry of gates.values()) if (!entry.satisfied) return true;
    return false;
  }, [gates]);

  /* --------------------------------------------------------------- contexts */

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      open,
      ids,
      placement: resolvedPlacement,
      size,
      scrim: resolvedScrim,
      requestClose,
      announce,
      registerGate,
      setHasTitle,
      setHasDescription,
      panelRef,
      bodyRef,
      scrollBodyByPage,
      detents: detentTokens,
      detentIndex: safeDetentIndex,
      setDetentIndex,
    }),
    [
      open,
      ids,
      resolvedPlacement,
      size,
      resolvedScrim,
      requestClose,
      announce,
      registerGate,
      setHasTitle,
      setHasDescription,
      scrollBodyByPage,
      detentTokens,
      safeDetentIndex,
      setDetentIndex,
    ],
  );

  const gatesReady = gatesReadyFor === generation;
  const gateContextValue = useMemo(
    () => ({ gates, ready: gatesReady }),
    [gates, gatesReady],
  );

  return (
    <dialog
      {...domPassthrough(rest, 'Modal.Root')}
      ref={mergeRefs(dialogRef, forwardedRef)}
      id={ids.dialog}
      className={cx('k-dialog', className)}
      style={style}
      data-kind={kind}
      data-size={size}
      data-scrim={resolvedScrim}
      data-placement={resolvedPlacement}
      data-gated={hasBlockedGate ? '' : undefined}
      data-detent={activeDetent}
      aria-labelledby={hasTitle ? ids.title : undefined}
      aria-label={!hasTitle && label ? label : undefined}
      aria-describedby={describedBy}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div className="k-scrim" ref={scrimRef} aria-hidden="true" />
      <div
        className="k-panel"
        ref={panelRef}
        tabIndex={-1}
        style={
          activeDetent
            ? ({ '--k-sheet-detent': detentCssValue(activeDetent) } as CSSProperties)
            : undefined
        }
        onPointerDown={handlePanelPointerDown}
        onPointerMove={handlePanelPointerMove}
        onPointerUp={handlePanelPointerUp}
        onPointerCancel={handlePanelPointerCancel}
        onLostPointerCapture={handlePanelLostCapture}
        onClickCapture={handlePanelClickCapture}
      >
        <ModalContext.Provider value={contextValue}>
          <GateContext.Provider value={gateContextValue}>
            <Fragment key={generation}>{children}</Fragment>
          </GateContext.Provider>
        </ModalContext.Provider>
      </div>
      <p className="k-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </dialog>
  );
});
