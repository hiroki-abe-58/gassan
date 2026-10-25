import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  version,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

import { mergeRefs, useControllable } from './internal/controllable';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useEvent } from './internal/use-event';
import { usePhrase } from './phrase';

/** 起点の props のうち、ここで読む・足すもの（利用者のハンドラは先に呼んでから足す）。 */
interface TriggerProps {
  ref?: Ref<HTMLElement>;
  id?: string;
  /** IconButton の名前。 */
  label?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-haspopup'?: 'dialog' | 'menu';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  onContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
  onFocus?: (event: ReactFocusEvent<HTMLElement>) => void;
  onBlur?: (event: ReactFocusEvent<HTMLElement>) => void;
}

/** React 18 は ref を要素に、19 は props に持つ（19 で element.ref を読むと警告が出る）。 */
const REF_IN_PROPS = Number.parseInt(version, 10) >= 19;

interface Trigger {
  /** 起点に渡されていた props。 */
  props: TriggerProps;
  /** 位置の基準。 */
  anchorRef: RefObject<HTMLElement | null>;
  /** 起点を、足す props と ref を付けて複製する。 */
  render: (extra: TriggerProps) => ReactElement;
  /** ハンドラで受けた要素を基準として覚える（ref を DOM まで渡さない部品を起点にしても位置が取れる）。 */
  remember: (element: HTMLElement) => void;
}

/** 起点（要素 1 つ）を包む。利用者の ref も生かしたまま、位置の基準を掴む。 */
function useTrigger(element: ReactElement): Trigger {
  const anchorRef = useRef<HTMLElement | null>(null);
  const child = element as ReactElement<TriggerProps>;
  const own = REF_IN_PROPS ? child.props.ref : ((child as unknown as { ref?: Ref<HTMLElement> | null }).ref ?? undefined);
  const ref = mergeRefs(anchorRef, own);
  return {
    props: child.props,
    anchorRef,
    render: (extra) => cloneElement(child, { ...extra, ref }),
    remember: (target) => {
      anchorRef.current = target;
    },
  };
}

/** フォーカスが窓の外（起点を除く）へ出たか。Tab で窓の外へ出たら閉じるため。 */
function focusLeft(event: ReactFocusEvent<HTMLElement>, anchor: HTMLElement | null): boolean {
  const next = event.relatedTarget;
  return next instanceof Node && !event.currentTarget.contains(next) && next !== anchor;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                    */
/* -------------------------------------------------------------------------- */

export interface TooltipProps {
  /** 吹き出しの文。短い補足だけにする（押せる物や、知らないと先へ進めない情報は入れない）。 */
  content: ReactNode;
  /** 起点（フォーカスできる要素 1 つ）。 */
  children: ReactElement;
  /** 先に試す側。既定 'above'（入らなければ反対の側）。 */
  side?: 'above' | 'below';
  /** ポインタを乗せてから出すまで（ms）。既定 400。キーボードのフォーカスではすぐ出す。 */
  delay?: number;
}

/** ポインタが起点から吹き出しへ移る間に消さない猶予（ms）。WCAG 1.4.13 の「乗せたままにできる」。 */
const HIDE_GRACE = 120;
/** 吹き出しが消えてからこの間（ms）に次の起点へ乗ったら、待たずに出す（ツールバーをなぞるとき）。 */
const SKIP_DELAY = 300;

/** 開いている吹き出しは 1 つだけ。次が開いたら前を閉じる。 */
const tooltips: { hide: (() => void) | null; warmUntil: number } = { hide: null, warmUntil: 0 };

/**
 * 短い補足の吹き出し。U-19。title 属性の代わり（§9）。
 *
 * ポインタを乗せる（触れたときは出さない）かキーボードでフォーカスすると出し、離れる・押す・Esc で消す。
 * 吹き出しの上へポインタを移しても消さない（WCAG 1.4.13）。文は起点の説明（aria-describedby）にし、
 * いつも DOM に置く（出ていない間も読める）。文が起点の名前と同じなら説明にしない（同じ語を 2 度読ませない）。
 * Esc は吹き出しだけを消し、モーダルの cancel まで届かせない。
 */
export function Tooltip({ content, children, side = 'above', delay = 400 }: TooltipProps): ReactNode {
  const phrase = usePhrase();
  const descriptionId = useId();
  const { props, anchorRef, render, remember } = useTrigger(children);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hide = useEvent(() => {
    clearTimeout(timer.current);
    setOpen(false);
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  const schedule = (next: boolean, wait: number): void => {
    clearTimeout(timer.current);
    if (wait <= 0) setOpen(next);
    else timer.current = setTimeout(() => setOpen(next), wait);
  };

  useEffect(() => {
    if (!open) return undefined;
    if (tooltips.hide && tooltips.hide !== hide) tooltips.hide();
    tooltips.hide = hide;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      hide();
    };
    // ポインタを乗せただけ（フォーカスは別の場所）でも Esc で消せるよう、文書全体で受ける。
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (tooltips.hide === hide) tooltips.hide = null;
      tooltips.warmUntil = Date.now() + SKIP_DELAY;
    };
  }, [open, hide]);

  const duplicate = typeof content === 'string' && (props['aria-label'] === content || props.label === content);
  const describedBy = duplicate ? props['aria-describedby'] : [props['aria-describedby'], descriptionId].filter(Boolean).join(' ');

  const trigger = render({
    'aria-describedby': describedBy || undefined,
    onPointerEnter: (event) => {
      remember(event.currentTarget);
      props.onPointerEnter?.(event);
      if (event.pointerType === 'touch') return;
      const warm = open || Date.now() < tooltips.warmUntil || (tooltips.hide !== null && tooltips.hide !== hide);
      schedule(true, warm ? 0 : delay);
    },
    onPointerLeave: (event) => {
      props.onPointerLeave?.(event);
      schedule(false, HIDE_GRACE);
    },
    onPointerDown: (event) => {
      props.onPointerDown?.(event);
      hide();
    },
    onFocus: (event) => {
      remember(event.currentTarget);
      props.onFocus?.(event);
      // ポインタで押してフォーカスが来たときは出さない（押すたびに吹き出しが出ると邪魔）。
      let keyboard = true;
      try {
        keyboard = event.currentTarget.matches(':focus-visible');
      } catch {
        // :focus-visible を知らない環境では、フォーカスでいつも出す。
      }
      if (keyboard) schedule(true, 0);
    },
    onBlur: (event) => {
      props.onBlur?.(event);
      hide();
    },
  });

  return (
    <>
      {trigger}
      {duplicate ? null : (
        <span id={descriptionId} hidden>
          {content}
        </span>
      )}
      <Popup
        open={open}
        anchorRef={anchorRef}
        onDismiss={hide}
        className="g-tooltip"
        side={side}
        align="center"
        matchWidth={false}
        aria-hidden="true"
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={() => schedule(false, HIDE_GRACE)}
      >
        {phrase(content)}
      </Popup>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Popover                                                                    */
/* -------------------------------------------------------------------------- */

export interface PopoverProps extends DataAttributes {
  /** 開く起点（button 1 つ）。 */
  trigger: ReactElement;
  /** 窓の見出し。窓の名前にもなる。 */
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 先に試す側。既定 'below'。 */
  side?: 'below' | 'above';
  /** 横のそろえ方。既定 'start'。 */
  align?: 'start' | 'end';
  className?: string;
}

/**
 * 起点の脇に開く、モーダルでない小さな窓（絞り込み・表示の設定・共有など）。U-20。
 *
 * 起点は aria-haspopup="dialog" と aria-expanded を持つ。開くと中の最初の操作へ（無ければ窓へ）フォーカスを移し、
 * Esc で閉じて起点へ戻す（モーダルの cancel まで届かせない）。外を押す・Tab で外へ出ると閉じる。
 * ページの他の場所は押せたまま。画面全体を止めて答えを待つならモーダルを使う。
 */
export function Popover({
  trigger,
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'below',
  align = 'start',
  className,
  ...rest
}: PopoverProps): ReactNode {
  const phrase = usePhrase();
  const base = useId();
  const titleId = `${base}-title`;
  const panelId = `${base}-panel`;
  const { props, anchorRef, render, remember } = useTrigger(trigger);
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen, onOpenChange);
  // 最初から開いているときはフォーカスを奪わない。閉じた状態から開いたときだけ移す。
  const wasOpen = useRef(isOpen);

  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) anchorRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) {
      const panel = document.getElementById(panelId);
      (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen, panelId]);

  const anchor = render({
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined,
    onClick: (event) => {
      remember(event.currentTarget);
      props.onClick?.(event);
      setOpen(!isOpen);
    },
  });

  return (
    <>
      {anchor}
      <Popup
        open={isOpen}
        anchorRef={anchorRef}
        onDismiss={() => close(false)}
        scrollbars
        className={className ? `g-popover ${className}` : 'g-popover'}
        side={side}
        align={align}
        matchWidth={false}
        {...domPassthrough(rest, 'Popover')}
        role="dialog"
        id={panelId}
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          close(true);
        }}
        onBlur={(event) => {
          if (focusLeft(event, anchorRef.current)) close(false);
        }}
      >
        <p id={titleId} className="g-popover-title">
          {phrase(title)}
        </p>
        <div className="g-popover-body">{phrase(children)}</div>
      </Popup>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Menu                                                                       */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  /** 識別子。onSelect に渡る。 */
  value: string;
  label: ReactNode;
  /** 名前の前の印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
  /** 名前の後ろに出すショートカットの表記（「⌘D」）。見た目だけで、キーの割り当ては利用者が持つ。 */
  shortcut?: string;
  /** 使えない項目。フォーカスはできる（何があるかは分かる）が、選べない。 */
  disabled?: boolean;
  /** 'danger' は取り消せない操作（削除など）。 */
  tone?: 'danger';
  /** 渡すとリンクになる（別のページへ移る項目）。 */
  href?: string;
  /** 選んだとき。 */
  onSelect?: () => void;
}

export interface MenuSeparator {
  type: 'separator';
  key?: string;
}

export interface MenuGroup {
  type: 'group';
  /** まとまりの名前（目に見える小見出しにもなる）。 */
  label: string;
  items: readonly MenuItem[];
}

export type MenuEntry = MenuItem | MenuSeparator | MenuGroup;

export interface MenuProps extends DataAttributes {
  /** 開く起点（button 1 つ）。メニューの名前は起点の名前になる。 */
  trigger: ReactElement;
  items: readonly MenuEntry[];
  /** どれかを選んだとき（項目の onSelect の後に呼ぶ）。 */
  onSelect?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 先に試す側。既定 'below'。 */
  side?: 'below' | 'above';
  /** 横のそろえ方。既定 'start'。行の端に置く「…」は 'end'。 */
  align?: 'start' | 'end';
  className?: string;
}

const isItem = (entry: MenuEntry): entry is MenuItem => !('type' in entry);

/** 開いた直後にフォーカスを移す先。キーで開けば最初（↑なら最後）の項目、ポインタならメニューそのもの。 */
type Landing = 'first' | 'last' | 'menu';

interface MenuPopupProps {
  open: boolean;
  id: string;
  items: readonly MenuEntry[];
  /** 位置の基準（メニューの起点か、右クリックした範囲）。 */
  anchorRef: RefObject<HTMLElement | null>;
  /** 画面のこの点に置く（右クリック）。 */
  point?: { x: number; y: number } | null;
  side?: 'below' | 'above';
  align?: 'start' | 'end';
  /** 開いた直後にフォーカスを移す先。開くたびに 1 度だけ読んで空にする。 */
  landing: RefObject<Landing | null>;
  /** ここへフォーカスが移っても閉じない（メニューの起点）。 */
  trigger?: RefObject<HTMLElement | null>;
  /** 閉じる。refocus なら開く前の場所へフォーカスを戻す。 */
  onClose: (refocus: boolean) => void;
  onSelect?: (value: string) => void;
  /** 名前（aria-labelledby か aria-label）と、利用者の data-*。 */
  attributes: Record<string, unknown>;
  className?: string;
}

/**
 * メニューの窓（role="menu"）。Menu（U-21）と ContextMenu（U-34）が共有する。
 *
 * 項目の間は ↑↓（端で回る）・Home / End・頭文字で移り、Enter / Space で選ぶと閉じて開く前の場所へ戻る
 * （選んだ処理がモーダルを開いても、閉じたときにそこへ戻れる）。Esc は選ばずに閉じて戻す
 * （モーダルの cancel まで届かせない）。Tab で外へ出ると閉じる。ポインタを乗せた項目へフォーカスが移る。
 */
function MenuPopup({ open, id, items, anchorRef, point, side, align, landing, trigger, onClose, onSelect, attributes, className }: MenuPopupProps): ReactNode {
  const phrase = usePhrase();
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const flat = items.flatMap((entry) => (isItem(entry) ? [entry] : entry.type === 'group' ? [...entry.items] : []));
  itemRefs.current.length = flat.length;

  const focusItem = (index: number): void => {
    const count = flat.length;
    if (count > 0) itemRefs.current[((index % count) + count) % count]?.focus();
  };

  useLayoutEffect(() => {
    const at = landing.current;
    if (!open || !at) return;
    landing.current = null;
    if (at === 'menu') document.getElementById(id)?.focus();
    else focusItem(at === 'first' ? 0 : flat.length - 1);
  });

  const select = (item: MenuItem): void => {
    item.onSelect?.();
    onSelect?.(item.value);
  };
  const activate = (item: MenuItem): void => {
    if (item.disabled) return;
    onClose(true);
    select(item);
  };

  const handleKey = (event: ReactKeyboardEvent<HTMLElement>): void => {
    const index = itemRefs.current.findIndex((element) => element === document.activeElement);
    const { key } = event;
    if (key === 'ArrowDown') focusItem(index + 1);
    else if (key === 'ArrowUp') focusItem(index < 0 ? flat.length - 1 : index - 1);
    else if (key === 'Home') focusItem(0);
    else if (key === 'End') focusItem(flat.length - 1);
    else if (key === 'Escape') onClose(true);
    else if (key === 'Tab') {
      onClose(false);
      return;
    } else if (key === 'Enter' || key === ' ') {
      const item = flat[index];
      if (item?.href && !item.disabled) {
        // リンクの Enter はブラウザに任せる（修飾キーで新しいタブに開ける）。Space は押したことにする。
        if (key === 'Enter') return;
        itemRefs.current[index]?.click();
      } else if (item) activate(item);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // 頭文字で、今の項目の次から探して回る。
      const lower = key.toLowerCase();
      for (let step = 1; step <= flat.length; step += 1) {
        const at = (index + step + flat.length) % flat.length;
        if (itemRefs.current[at]?.textContent?.trim().toLowerCase().startsWith(lower)) {
          focusItem(at);
          break;
        }
      }
    } else return;
    event.preventDefault();
  };

  let position = -1;
  const renderItem = (item: MenuItem): ReactNode => {
    position += 1;
    const at = position;
    const shared = {
      ref: (element: HTMLElement | null) => {
        itemRefs.current[at] = element;
      },
      role: 'menuitem',
      tabIndex: -1,
      className: 'g-menu-item',
      'data-tone': item.tone,
      'aria-disabled': item.disabled ? true : undefined,
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (document.activeElement !== event.currentTarget) event.currentTarget.focus();
      },
    };
    const body = (
      <>
        {item.icon ? <span className="g-menu-icon">{item.icon}</span> : null}
        <span className="g-menu-label">{phrase(item.label)}</span>
        {item.shortcut ? (
          <kbd className="g-menu-shortcut" aria-hidden="true">
            {item.shortcut}
          </kbd>
        ) : null}
      </>
    );
    return item.href && !item.disabled ? (
      <a
        key={item.value}
        {...shared}
        href={item.href}
        onClick={() => {
          onClose(false);
          select(item);
        }}
      >
        {body}
      </a>
    ) : (
      <div key={item.value} {...shared} onClick={() => activate(item)}>
        {body}
      </div>
    );
  };

  return (
    <Popup
      open={open}
      anchorRef={anchorRef}
      point={point}
      onDismiss={() => onClose(false)}
      scrollbars
      className={className ? `g-menu ${className}` : 'g-menu'}
      side={side}
      align={align}
      matchWidth={false}
      {...attributes}
      role="menu"
      id={id}
      tabIndex={-1}
      onKeyDown={handleKey}
      onBlur={(event) => {
        if (focusLeft(event, trigger?.current ?? null)) onClose(false);
      }}
    >
      {items.map((entry, index) => {
        if (isItem(entry)) return renderItem(entry);
        if (entry.type === 'separator') return <div key={entry.key ?? `separator-${String(index)}`} role="separator" className="g-menu-separator" />;
        return (
          <div key={`group-${entry.label}`} role="group" aria-label={entry.label} className="g-menu-group">
            <div className="g-menu-group-label" aria-hidden="true">
              {phrase(entry.label)}
            </div>
            {entry.items.map(renderItem)}
          </div>
        );
      })}
    </Popup>
  );
}

/**
 * 操作のメニュー。U-21。WAI-ARIA APG の menu button。
 *
 * 起点は aria-haspopup="menu" と aria-expanded を持つ。キー（Enter・Space・↓）で開くと最初の項目へ、
 * ↑ で開くと最後の項目へフォーカスを移す。ポインタで開いたときはメニューそのものへ移し、項目を先回りして光らせない。
 * 選ぶか Esc で閉じると起点へ戻る（項目の間の動き方は MenuPopup）。
 */
export function Menu({
  trigger,
  items,
  onSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  side = 'below',
  align = 'start',
  className,
  ...rest
}: MenuProps): ReactNode {
  const base = useId();
  const { props, anchorRef, render, remember } = useTrigger(trigger);
  const triggerId = props.id ?? `${base}-trigger`;
  const menuId = `${base}-menu`;
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen, onOpenChange);
  const landing = useRef<Landing | null>(null);

  const show = (at: Landing): void => {
    landing.current = at;
    setOpen(true);
  };
  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) anchorRef.current?.focus();
  };

  const anchor = render({
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? menuId : undefined,
    onClick: (event) => {
      remember(event.currentTarget);
      props.onClick?.(event);
      if (isOpen) close(false);
      // キーで押した click は detail が 0。
      else show(event.detail === 0 ? 'first' : 'menu');
    },
    onKeyDown: (event) => {
      remember(event.currentTarget);
      props.onKeyDown?.(event);
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      show(event.key === 'ArrowDown' ? 'first' : 'last');
    },
  });

  return (
    <>
      {anchor}
      <MenuPopup
        open={isOpen}
        id={menuId}
        items={items}
        anchorRef={anchorRef}
        side={side}
        align={align}
        landing={landing}
        trigger={anchorRef}
        onClose={close}
        onSelect={onSelect}
        attributes={{ ...domPassthrough(rest, 'Menu'), 'aria-labelledby': triggerId }}
        className={className}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* ContextMenu                                                                */
/* -------------------------------------------------------------------------- */

export interface ContextMenuProps extends DataAttributes {
  /** 右クリックで開く範囲（要素 1 つ）。props を DOM へ渡す要素にする。キーで開くときは、この中にフォーカスがあること。 */
  children: ReactElement;
  /** メニューの名前（読み上げ。「ファイルの操作」など）。 */
  label: string;
  items: readonly MenuEntry[];
  /** どれかを選んだとき（項目の onSelect の後に呼ぶ）。 */
  onSelect?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** 文字を打つ欄の右クリックは、ブラウザのメニュー（貼り付けなど）に任せる。 */
const isEditable = (target: EventTarget): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select') !== null);

/**
 * 右クリックのメニュー。U-34。
 *
 * 包んだ要素の上の右クリック（タッチの端末では、ブラウザが contextmenu を出す長押し）で、押した位置に U-21 と同じ
 * role="menu" を開き、メニューそのものへフォーカスを移す。中にフォーカスがあるときの Shift+F10 か ContextMenu キーでは、
 * フォーカスのある要素の下に開いて最初の項目へ移す。選ぶか Esc で閉じると、開く前にフォーカスのあった場所へ戻す。
 * 文字を打つ欄の上ではブラウザのメニューを出したままにする。利用者の onContextMenu が preventDefault したら開かない
 * （入れ子にしたときは内側のメニューだけが開く）。
 * 右クリックはキーとタッチでは見つけにくいので、同じ操作を目に見える場所（「…」のメニューなど）にも置く。
 */
export function ContextMenu({ children, label, items, onSelect, onOpenChange, className, ...rest }: ContextMenuProps): ReactNode {
  const menuId = `${useId()}-menu`;
  const { props, anchorRef, render, remember } = useTrigger(children);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const landing = useRef<Landing | null>(null);
  /** 開く前にフォーカスのあった要素。閉じたらそこへ戻す。 */
  const returnTo = useRef<HTMLElement | null>(null);
  /** キーで開いた時刻。キーを離したときに contextmenu を出す OS があり、それで開き直さないため。 */
  const keyOpenedAt = useRef(0);

  const show = (at: Landing, next: { x: number; y: number }): void => {
    // 開いたまま別の所で右クリックしたときは、最初に開く前の場所を覚えたままにする
    if (point === null) {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement ? active : null;
      onOpenChange?.(true);
    }
    landing.current = at;
    setPoint(next);
  };
  const close = (refocus: boolean): void => {
    setPoint(null);
    onOpenChange?.(false);
    if (refocus) returnTo.current?.focus();
  };

  const target = render({
    onContextMenu: (event) => {
      remember(event.currentTarget);
      props.onContextMenu?.(event);
      if (event.defaultPrevented || isEditable(event.target)) return;
      event.preventDefault();
      if (Date.now() - keyOpenedAt.current < 500) return;
      show('menu', { x: event.clientX, y: event.clientY });
    },
    onKeyDown: (event) => {
      remember(event.currentTarget);
      props.onKeyDown?.(event);
      if (event.defaultPrevented || (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey))) return;
      event.preventDefault();
      keyOpenedAt.current = Date.now();
      const focused = event.target instanceof HTMLElement ? event.target : event.currentTarget;
      const rect = focused.getBoundingClientRect();
      show('first', { x: getComputedStyle(focused).direction === 'rtl' ? rect.right : rect.left, y: rect.bottom });
    },
  });

  return (
    <>
      {target}
      <MenuPopup
        open={point !== null}
        id={menuId}
        items={items}
        anchorRef={anchorRef}
        point={point}
        landing={landing}
        onClose={close}
        onSelect={onSelect}
        attributes={{ ...domPassthrough(rest, 'ContextMenu'), 'aria-label': label }}
        className={className}
      />
    </>
  );
}
