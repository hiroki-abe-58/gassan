import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { useBlockers, useModalContext } from './context';
import { useLabels } from './labels';
import type { ButtonVariant, CloseReason, GateSelector } from './types';
import { domPassthrough, stripReservedData, type DataAttributes } from './internal/passthrough';

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalFooterProps extends DataAttributes {
  children?: ReactNode;
  /** 左側に置く補足（「後から変更できます」など）。F-12。 */
  note?: ReactNode;
  className?: string;
}

/**
 * grid の 3 行目。F-01 / F-02。
 *
 * DOM 順は「弱い順 → 強い順」で書く。視覚順 = DOM 順 = Tab 順。
 * 広いときはプライマリが右端に来て、最初の tertiary だけが左へ分離する（F-03）。
 * 幅が狭いときも反転せず、DOM 順のまま縦に積む（F-04）。
 * column-reverse で見た目だけ入れ替えると、Tab 順と読み上げ順が視覚順と逆になるため。
 */
export function ModalFooter({ children, note, className, ...rest }: ModalFooterProps): ReactNode {
  return (
    <footer
      {...domPassthrough(rest, 'Modal.Footer')}
      className={className ? `k-footer ${className}` : 'k-footer'}
    >
      {note ? <p className="k-footer-note">{note}</p> : null}
      <div className="k-footer-actions">{children}</div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
  variant?: ButtonVariant;
  children: ReactNode;
  /** 参照するゲート。true で「登録済みの全ゲート」。G-01。 */
  gate?: GateSelector;
  /**
   * 外から制御する処理中フラグ。
   *
   * 内部の pending と **論理和** を取る。`loading={false}` は
   * 「今は自分の都合では処理中ではない」であって、
   * 「onAction の最中でも押させてよい」ではない。F-08。
   */
  loading?: boolean;
  /**
   * 押したら自動で処理中になる非同期アクション。
   * 解決するまで再クリックを握りつぶすので、二重送信が原理的に起きない。F-08。
   */
  onAction?: () => void | Promise<void>;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** 押下後に閉じる。理由を明示する。 */
  closeOnClick?: CloseReason | false;
  /**
   * 本当に操作不能なとき（権限が無い等）だけ true。
   * 「条件を満たせば押せる」ものには絶対に使わない。G-01。
   */
  unavailable?: boolean;
  className?: string;
}

/**
 * フッタのボタン。
 *
 * ゲート未充足でも disabled にしない。
 * disabled はフォーカスを受け取らないため、
 * 「なぜ押せないのか」を本人が確かめる手段が消える。
 * 代わりに aria-disabled を立て、押されたら理由を読み上げて、
 * 詰まっている場所へ連れて行く。G-07 / G-08。
 */
export function ModalButton({
  variant = 'secondary',
  children,
  gate,
  loading,
  onAction,
  onClick,
  closeOnClick = false,
  unavailable = false,
  className,
  type = 'button',
  ...rest
}: ModalButtonProps): ReactNode {
  const labels = useLabels();
  const { announce, requestClose } = useModalContext('Modal.Button');
  const blockers = useBlockers(gate);
  const reactId = useId();
  const reasonId = `kasane-reason-${reactId}`;
  const busyId = `kasane-busy-${reactId}`;

  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // or であって ?? ではない。?? にすると loading={false} を渡した瞬間に
  // 内部 pending が無視され、onAction が解決するまでの間に何度でも押せてしまう。
  // 制御と非制御のどちらか一方でも「処理中」と言っているなら、処理中である。F-08。
  const busy = Boolean(loading) || pending;
  const blocked = blockers.length > 0 && !unavailable;
  const first = blockers[0];

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (busy) {
        event.preventDefault();
        return;
      }
      if (blocked) {
        event.preventDefault();
        if (first) {
          announce(first.reason);
          first.focus?.();
        }
        return;
      }

      onClick?.(event);
      if (event.defaultPrevented) return;

      if (onAction) {
        const result = onAction();
        if (result && typeof (result as Promise<void>).then === 'function') {
          setPending(true);
          void Promise.resolve(result)
            .then(() => {
              if (closeOnClick) requestClose(closeOnClick);
            })
            .catch((error: unknown) => {
              console.error('[kasane] onAction rejected.', error);
            })
            .finally(() => {
              if (mountedRef.current) setPending(false);
            });
          return;
        }
      }

      if (closeOnClick) requestClose(closeOnClick);
    },
    [busy, blocked, first, announce, onClick, onAction, closeOnClick, requestClose],
  );

  // 利用側の指定を殺さずに、状態の説明を足す。
  const describedBy =
    [rest['aria-describedby'], blocked ? reasonId : null, busy ? busyId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <>
      <button
        {...stripReservedData(rest, 'Modal.Button')}
        type={type}
        className={className ? `k-btn ${className}` : 'k-btn'}
        data-variant={variant}
        data-gated={blocked ? '' : undefined}
        data-loading={busy ? '' : undefined}
        aria-disabled={blocked || busy ? true : undefined}
        aria-busy={busy ? true : undefined}
        aria-describedby={describedBy}
        disabled={unavailable || undefined}
        onClick={handleClick}
      >
        <span className="k-btn-label">{children}</span>
        {busy ? <span className="k-btn-spinner" aria-hidden="true" /> : null}
      </button>
      {/*
        状態テキストはボタンの「外」に置く。
        aria-describedby の参照先であっても、子孫にあると
        アクセシブルネーム計算に合流してボタン名が汚れる。
        （「送信する 規約への同意が必要です」のようになる）
      */}
      {blocked && first ? (
        <span id={reasonId} className="k-sr-only">
          {first.reason}
        </span>
      ) : null}
      {busy ? (
        <span id={busyId} className="k-sr-only">
          {labels.loading}
        </span>
      ) : null}
    </>
  );
}
