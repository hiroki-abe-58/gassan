import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from './button';
import { ModalClose, ModalControls, ModalDescription, ModalHeader, ModalTitle } from './header';
import { useControllable } from './internal/controllable';
import { matchMediaSafe } from './internal/dom';
import { Icon, PathIcon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { transitionMs } from './internal/popup';
import { useLabels } from './labels';
import { usePhrase } from './phrase';
import { ModalRoot } from './root';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 吹き出しの印・広げる・小さくする（このウィジェットだけが使うので、共有の ICONS に入れない）。 */
const BUBBLE = 'M4.5 5.5A1.5 1.5 0 0 1 6 4h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 14 13H9l-3.5 3v-3H6a1.5 1.5 0 0 1-1.5-1.5Z';
const EXPAND = 'M11.5 4.5h4v4M15.5 4.5 11 9M8.5 15.5h-4v-4M4.5 15.5 9 11';
const COLLAPSE = 'M15.5 4.5 11 9M11 5.5V9h3.5M4.5 15.5 9 11M9 14.5V11H5.5';

/** 狭い画面（スマートフォンの縦）。小窓では入力欄と仮想キーボードが重なるので、画面いっぱいのシートにする。 */
const NARROW = '(max-width: 639px)';

function useNarrow(): boolean {
  // サーバーと最初の描画は広い側で描き、描いた後に合わせる（食い違わせない）
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = matchMediaSafe(NARROW);
    if (!query) return undefined;
    const update = (): void => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

export interface ChatWidgetProps extends DataAttributes {
  /** 窓の見出し（「Atlas のアシスタント」）。窓の名前にもなる。 */
  title: string;
  /** 見出しの下の補足（「AI が答えます。担当者にもつなげます」）。 */
  description?: ReactNode;
  /** 開いているか（制御）。 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 出す場所。'corner'（右下の小窓。既定）か 'side'（右側の面。モーダル）。狭い画面ではどちらも画面いっぱいのシート。 */
  placement?: 'corner' | 'side';
  defaultPlacement?: 'corner' | 'side';
  onPlacementChange?: (placement: 'corner' | 'side') => void;
  /** 小窓と右側の面を切り替えるボタンを出す。既定 true。 */
  expandable?: boolean;
  /** 起点のボタンの名前。既定は labels.chatOpen（「チャットを開く」）。 */
  launcherLabel?: string;
  /** 起点の印。既定は吹き出し。飾りなので aria-hidden にして渡す。 */
  launcherIcon?: ReactNode;
  /** 読んでいないメッセージの数。起点に数の印を出し、名前に「未読 2件」を足す。 */
  unread?: number;
  /** 閉じている間、起点の横に出すあいさつ（「何かお困りですか？」）。押すと開き、×で消える。 */
  greeting?: ReactNode;
  /** あいさつを消したとき（次に来たときに出さない、などに使う）。 */
  onGreetingDismiss?: () => void;
  /** 起点を置く端。既定 'end'（右下。右から左の言語では左下）。 */
  side?: 'start' | 'end';
  /** 見出しの帯に足す操作（新しい会話・メニューなど）。 */
  actions?: ReactNode;
  /** 窓の中身。ChatThread と ChatComposer を並べる（中身は窓の高さいっぱいに広がる）。 */
  children: ReactNode;
  className?: string;
}

/**
 * サイトの右下に置くチャット（AI のアシスタントやサポート）。E-09。
 *
 * 丸い起点のボタン（名前は「チャットを開く」、未読があれば「未読 2件」を足す。数の印は飾り）を押すと、
 * 右下の小窓（モーダルではない。ページを読みながら話せる）か、右側の面（モーダル）が開く。狭い画面では画面いっぱいのシート。
 * 開くと入力欄へフォーカスを移し、Esc か閉じるボタンで閉じて起点へ戻す。小窓と右側の面は、見出しの帯のボタンで切り替えられる。
 * 中身は ChatThread（E-01〜E-07）と ChatComposer（E-05 / E-06）をそのまま使う。
 * 起点・あいさつ・小窓は body の末尾へ置く（置いた場所の祖先の transform や container-type に閉じ込められない）。
 * サーバーでは何も描かず、描いた後に出す。
 */
export function ChatWidget({
  title,
  description,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement: placementProp,
  defaultPlacement = 'corner',
  onPlacementChange,
  expandable = true,
  launcherLabel,
  launcherIcon,
  unread = 0,
  greeting,
  onGreetingDismiss,
  side = 'end',
  actions,
  children,
  className,
  ...rest
}: ChatWidgetProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const base = useId();
  const panelId = `${base}-panel`;
  const titleId = `${base}-title`;
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [placement, setPlacement] = useControllable(placementProp, defaultPlacement, onPlacementChange);
  const [greetingShown, setGreetingShown] = useState(true);
  const narrow = useNarrow();
  const modal = narrow || placement === 'side';
  // 起点とあいさつは画面に固定する。置いた場所の祖先に transform や container-type（包含ブロックを作る）があっても
  // 画面の端に出るよう、body の末尾へ置く。サーバーでは何も描かない（描いた後に出す）
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  const close = (): void => {
    setOpen(false);
    launcherRef.current?.focus();
  };
  const name = launcherLabel ?? labels.chatOpen;
  const toggle = expandable && !narrow ? (
    <IconButton
      label={placement === 'side' ? labels.chatCollapse : labels.chatExpand}
      size="sm"
      onClick={() => setPlacement(placement === 'side' ? 'corner' : 'side')}
    >
      <PathIcon d={placement === 'side' ? COLLAPSE : EXPAND} />
    </IconButton>
  ) : null;

  if (!host) return null;
  return createPortal(
    <div {...domPassthrough(rest, 'ChatWidget')} className={cx('g-chatbot', className)} data-side={side === 'start' ? 'start' : undefined}>
      {greeting && greetingShown && !open ? (
        <div className="g-chatbot-greeting">
          <button type="button" className="g-chatbot-greeting-open" onClick={() => setOpen(true)}>
            {phrase(greeting)}
          </button>
          <IconButton
            label={labels.chatDismissGreeting}
            size="sm"
            onClick={() => {
              setGreetingShown(false);
              onGreetingDismiss?.();
              launcherRef.current?.focus();
            }}
          >
            <Icon name="close" />
          </IconButton>
        </div>
      ) : null}
      <button
        ref={launcherRef}
        type="button"
        className="g-chatbot-launcher"
        aria-label={open ? labels.chatClose : unread > 0 ? `${name} ${labels.chatUnread(unread)}` : name}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-open={open ? '' : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <Icon name="close" /> : (launcherIcon ?? <PathIcon d={BUBBLE} />)}
        {unread > 0 && !open ? (
          <span className="g-chatbot-badge" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </button>
      {modal ? (
        <ModalRoot
          open={open}
          onOpenChange={(next) => (next ? setOpen(true) : close())}
          placement={narrow ? 'sheet' : 'end'}
          size={narrow ? undefined : 'lg'}
          detents={narrow ? ['full'] : undefined}
          kind="view"
          finalFocus={launcherRef}
          className="g-chatbot-modal"
        >
          <ModalHeader>
            <ModalControls
              end={
                <>
                  {actions}
                  {toggle}
                  <ModalClose />
                </>
              }
            />
            <ModalTitle>{title}</ModalTitle>
            {description ? <ModalDescription>{description}</ModalDescription> : null}
          </ModalHeader>
          <div className="g-chatbot-body" id={panelId}>
            {children}
          </div>
        </ModalRoot>
      ) : (
        <CornerPanel id={panelId} open={open} titleId={titleId} onClose={close}>
          <header className="g-chatbot-head">
            <div className="g-chatbot-heading">
              <h2 id={titleId} className="g-chatbot-title">
                {phrase(title)}
              </h2>
              {description ? <p className="g-chatbot-description">{phrase(description)}</p> : null}
            </div>
            <div className="g-chatbot-actions">
              {actions}
              {toggle}
              <IconButton label={labels.chatClose} size="sm" onClick={close}>
                <Icon name="close" />
              </IconButton>
            </div>
          </header>
          <div className="g-chatbot-body">{children}</div>
        </CornerPanel>
      )}
    </div>,
    host,
  );
}

/**
 * 右下の小窓。モーダルではない（ページを読みながら話せる）が、top layer に出してページの上に重ねる（popover="manual"。
 * 外を押しても閉じない）。開いたら入力欄へフォーカスを移し、Esc で閉じる。閉じると退出を描き終えてから外す（V-04）。
 */
function CornerPanel({ id, open, titleId, onClose, children }: { id: string; open: boolean; titleId: string; onClose: () => void; children: ReactNode }): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!present || !panel) return undefined;
    const top = typeof (panel.showPopover as unknown) === 'function';
    if (top) panel.showPopover();
    else panel.dataset.inline = '';
    // 打てる欄（入力欄）へ。無ければ窓そのものへ
    (panel.querySelector<HTMLElement>('textarea, input:not([type="hidden"])') ?? panel).focus();
    return () => {
      if (top && panel.isConnected) panel.hidePopover();
    };
  }, [present]);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return undefined;
    if (open) {
      delete panel.dataset.exiting;
      return undefined;
    }
    panel.dataset.exiting = '';
    const wait = transitionMs(panel);
    if (wait <= 0) {
      setPresent(false);
      return undefined;
    }
    const timer = setTimeout(() => setPresent(false), wait);
    return () => clearTimeout(timer);
  }, [open]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    // 中の部品（一覧・メニュー）が Esc を使ったときは閉じない。変換中の Esc は確定の取り消し
    if (event.key !== 'Escape' || event.defaultPrevented || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onClose();
  };

  if (!present) return null;
  return (
    <div ref={ref} id={id} className="g-chatbot-panel" role="dialog" aria-labelledby={titleId} tabIndex={-1} popover="manual" onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}
