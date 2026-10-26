import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { ButtonBody } from './internal/button-body';
import { Icon } from './internal/icons';
import { domPassthrough, stripReservedData, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import type { ButtonVariant } from './types';

export type ButtonSize = 'sm' | 'md' | 'lg';

/** Button と ButtonLink が共通に受ける見た目の指定。 */
interface ButtonLook {
  /** 既定 'secondary'。強い順に primary（1 画面に 1 つ）・danger・secondary・tertiary。 */
  variant?: ButtonVariant;
  /** 既定 'md'（高さ 44px）。sm は見た目 36px で、当たりは 44px のまま。 */
  size?: ButtonSize;
  /** 文字の前・後ろに置く印（飾りなので aria-hidden にして渡す）。 */
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** 器いっぱいの幅にする。 */
  block?: boolean;
  className?: string;
}

export interface ButtonProps extends ButtonLook, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  /** 外から制御する処理中。押しても onClick を呼ばず、名前は消さずに「処理中」を添える。 */
  loading?: boolean;
  /**
   * 押したら自動で処理中になる非同期の処理。解決するまで再び押せないので、二重送信が起きない（F-08 と同じ）。
   * loading と onAction の処理中は論理和を取る。
   */
  onAction?: () => void | Promise<void>;
}

/**
 * ページの上で使うボタン。U-01。
 *
 * 見た目と押した手応えは Modal.Button と同じ（V-06）。モーダルの外でも使え、ゲートや閉じる理由は持たない。
 * 処理中は aria-busy と「処理中」の説明を足し、名前は消さない。押せない理由を伝えたいときは
 * disabled にせず、aria-disabled と説明（aria-describedby）を添える（G-07 と同じ考え方）。aria-disabled の間は
 * ゲートと同じ見た目になり、押しても何もしない（フォーカスは止まり、理由が読まれる）。
 * ref は button に届く（Tooltip・Menu の起点にできる）。
 */
// forwardRef の前の PURE の注釈は、使わないアプリの束から部品ごと外せるようにするため（src/japanese.ts の先頭の注を参照）
export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', iconStart, iconEnd, block = false, loading = false, onAction, onClick, children, className, type = 'button', ...rest },
  ref,
) {
  const labels = useLabels();
  const busyId = `${useId()}-busy`;
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const busy = loading || pending;
  const gated = !busy && (rest['aria-disabled'] === true || rest['aria-disabled'] === 'true');

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    if (busy || gated) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (event.defaultPrevented || !onAction) return;
    const result = onAction();
    if (result && typeof (result as Promise<void>).then === 'function') {
      setPending(true);
      void Promise.resolve(result)
        .catch((error: unknown) => {
          console.error('[gassan] onAction rejected.', error);
        })
        .finally(() => {
          if (mounted.current) setPending(false);
        });
    }
  };

  const describedBy = [rest['aria-describedby'], busy ? busyId : null].filter(Boolean).join(' ') || undefined;

  return (
    <>
      <button
        {...stripReservedData(rest, 'Button')}
        ref={ref}
        type={type}
        className={className ? `g-btn ${className}` : 'g-btn'}
        data-variant={variant}
        data-size={size === 'md' ? undefined : size}
        data-block={block ? '' : undefined}
        data-loading={busy ? '' : undefined}
        data-gated={gated ? '' : undefined}
        aria-busy={busy ? true : undefined}
        aria-disabled={busy ? true : rest['aria-disabled']}
        aria-describedby={describedBy}
        onClick={handleClick}
      >
        <ButtonBody iconStart={iconStart} iconEnd={iconEnd}>
          {children}
        </ButtonBody>
        {busy ? <span className="g-btn-spinner" aria-hidden="true" /> : null}
      </button>
      {/* 名前に混ぜないよう、説明はボタンの外に置く（Modal.Button と同じ） */}
      {busy ? (
        <span id={busyId} className="g-sr-only">
          {labels.loading}
        </span>
      ) : null}
    </>
  );
});

export interface ButtonLinkProps extends ButtonLook, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  href: string;
  children: ReactNode;
}

/** ボタンの見た目のリンク。行き先が別のページなら、役割はリンクのまま（Enter で辿り、Space では押せない）。U-01。 */
export const ButtonLink = /* @__PURE__ */ forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'secondary', size = 'md', iconStart, iconEnd, block = false, children, className, ...rest },
  ref,
) {
  return (
    <a
      {...stripReservedData(rest, 'ButtonLink')}
      ref={ref}
      className={className ? `g-btn ${className}` : 'g-btn'}
      data-variant={variant}
      data-size={size === 'md' ? undefined : size}
      data-block={block ? '' : undefined}
    >
      <ButtonBody iconStart={iconStart} iconEnd={iconEnd}>
        {children}
      </ButtonBody>
    </a>
  );
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'aria-label'> {
  /** 読み上げる名前（必須）。印だけのボタンは、名前が無いと何のボタンか分からない。 */
  label: string;
  /** 印（svg）。飾りなので aria-hidden にして渡す。 */
  children: ReactNode;
  /** 既定 'ghost'（地の色なし）。tonal は薄い地の色を敷く。 */
  variant?: 'ghost' | 'tonal';
  /** 既定 'md'（44px）。sm は見た目 36px で、当たりは 44px のまま。 */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 印だけのボタン。名前は label で必ず渡す（title 属性の吹き出しには頼らず、要るなら Tooltip を添える）。U-02。
 * aria-disabled の間は押しても何もしない（Button と同じ）。
 */
export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, variant = 'ghost', size = 'md', className, type = 'button', onClick, ...rest },
  ref,
) {
  const gated = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';
  return (
    <button
      {...stripReservedData(rest, 'IconButton')}
      ref={ref}
      type={type}
      className={className ? `g-iconbtn ${className}` : 'g-iconbtn'}
      data-variant={variant === 'ghost' ? undefined : variant}
      data-size={size === 'md' ? undefined : size}
      aria-label={label}
      onClick={(event) => {
        if (gated) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
});

export interface CopyButtonProps extends DataAttributes {
  /** 写す文字列。押したときに作るなら関数で渡す。 */
  value: string | (() => string);
  /** 文字を添えると、印と文字のボタンになる（既定は印だけ）。 */
  children?: ReactNode;
  /** 読み上げる名前。既定 labels.copy。印だけのときは、何を写すのかが分かる名前にする（「招待リンクをコピー」）。 */
  label?: string;
  /** 写したあと・写せなかったとき。 */
  onCopy?: (value: string) => void;
  onError?: (error: unknown) => void;
  variant?: 'ghost' | 'tonal';
  size?: 'sm' | 'md';
  className?: string;
}

/** 写した印を出しておく長さ（ms）。 */
const COPIED_MS = 2000;

/**
 * 文字列をクリップボードへ写すボタン。U-03。
 *
 * 写したら印をチェックに替え、「コピーしました」を role="status" で読み上げる（2 秒で戻す）。
 * クリップボードが使えない（権限が無い・安全でない接続）ときは「コピーできませんでした」を伝える。
 */
export function CopyButton({ value, children, label, onCopy, onError, variant = 'ghost', size = 'md', className, ...rest }: CopyButtonProps): ReactNode {
  const labels = useLabels();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (): Promise<void> => {
    const text = typeof value === 'function' ? value() : value;
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API is not available.');
      await navigator.clipboard.writeText(text);
      setState('copied');
      onCopy?.(text);
    } catch (error) {
      setState('failed');
      onError?.(error);
    }
    timer.current = setTimeout(() => setState('idle'), COPIED_MS);
  };

  const icon = <Icon name={state === 'copied' ? 'check' : 'copy'} className="g-copy-icon" />;
  const name = label ?? labels.copy;
  return (
    <span {...domPassthrough(rest, 'CopyButton')} className={className ? `g-copy ${className}` : 'g-copy'} data-state={state === 'idle' ? undefined : state}>
      {children ? (
        <Button variant={variant === 'tonal' ? 'secondary' : 'tertiary'} size={size} iconStart={icon} onClick={() => void copy()} aria-label={label}>
          {children}
        </Button>
      ) : (
        <IconButton label={name} variant={variant} size={size} onClick={() => void copy()}>
          {icon}
        </IconButton>
      )}
      <span className="g-sr-only" role="status">
        {state === 'copied' ? labels.copied : state === 'failed' ? labels.copyFailed : ''}
      </span>
    </span>
  );
}
