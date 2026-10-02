import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { useBlockers, useModalContext } from './context';
import { useEvent } from './internal/use-event';
import { useLabels } from './labels';
import type { GateSelector } from './types';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

const noop = (): void => {};

/**
 * 名前付きゲートを Root に登録する。G-02。
 *
 * effect を3つに割っているのには理由がある。
 * 1つの effect に cleanup を持たせると、依存が変わるたびに
 * 「解除 → 登録」の順で走り、その隙間でゲートが未登録＝fail-closed になる。
 * 結果、理由テキストが一瞬「条件があります」に化けて、ボタンがちらつく。
 *
 * 登録者 ID は useId() で取る。同じ名前を 2 箇所で登録しても、
 * 片方が unmount したときに消えるのは自分の 1 件だけになる。
 * ID を持たせないと、後から登録したほうの条件まで巻き添えで消え、
 * 未充足のままボタンが押せるようになる（fail-open）。
 */
export function useGateRegistration(
  name: string | undefined,
  satisfied: boolean,
  reason: string,
  focus?: () => void,
  order?: number,
): void {
  const { registerGate } = useModalContext('Gate');
  const stableFocus = useEvent(focus ?? noop);
  const hasFocus = Boolean(focus);
  const nameRef = useRef(name);
  const instanceId = useId();

  // 1. 更新用。cleanup は持たない。
  useEffect(() => {
    if (!name) return;
    registerGate(
      name,
      {
        satisfied,
        reason,
        focus: hasFocus ? stableFocus : undefined,
        order,
      },
      instanceId,
    );
  }, [name, satisfied, reason, hasFocus, stableFocus, order, registerGate, instanceId]);

  // 2. 名前が変わったときだけ、古いキーを掃除する。
  useEffect(() => {
    const previous = nameRef.current;
    if (previous && previous !== name) registerGate(previous, null, instanceId);
    nameRef.current = name;
  }, [name, registerGate, instanceId]);

  // 3. unmount 専用。
  useEffect(
    () => () => {
      const current = nameRef.current;
      if (current) registerGate(current, null, instanceId);
    },
    [registerGate, instanceId],
  );
}

/* -------------------------------------------------------------------------- */
/* Gate — DOM を持たない登録専用コンポーネント                                  */
/* -------------------------------------------------------------------------- */

export interface ModalGateProps {
  name: string;
  satisfied: boolean;
  reason: string;
  /** 詰まっている箇所へ連れて行く。G-08。 */
  focus?: () => void;
  order?: number;
}

/**
 * 任意の条件をゲートにする。
 * 「3つ以上選択したら」「決済方法を選んだら」のような、
 * ライブラが知りようのない条件を宣言的に登録できる。
 */
export function ModalGate({ name, satisfied, reason, focus, order }: ModalGateProps): null {
  useGateRegistration(name, satisfied, reason, focus, order);
  return null;
}

/* -------------------------------------------------------------------------- */
/* Consent                                                                    */
/* -------------------------------------------------------------------------- */

export interface ModalConsentProps extends DataAttributes {
  /** 登録するゲート名。 */
  gate: string;
  children: ReactNode;
  reason?: string;
  /** 制御する場合。 */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  order?: number;
  className?: string;
  name?: string;
  value?: string;
}

/**
 * 「同意する」チェックボックス。G-06。
 *
 * チェックボックスはネイティブの input を使う。
 * role="checkbox" を div に付けて自前で実装する理由が無い。
 */
export function ModalConsent({
  gate,
  children,
  reason,
  checked,
  defaultChecked = false,
  onCheckedChange,
  order = 1,
  className,
  name,
  value,
  ...rest
}: ModalConsentProps): ReactNode {
  const labels = useLabels();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const current = isControlled ? checked : internal;

  useGateRegistration(
    gate,
    current,
    reason ?? labels.unconsentedReason,
    () => inputRef.current?.focus(),
    order,
  );

  return (
    <label
      {...domPassthrough(rest, 'Modal.Consent')}
      className={className ? `g-consent ${className}` : 'g-consent'}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={current}
        name={name}
        value={value}
        onChange={(event) => {
          const next = event.currentTarget.checked;
          if (!isControlled) setInternal(next);
          onCheckedChange?.(next);
        }}
      />
      <span>{children}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* GateStatus                                                                 */
/* -------------------------------------------------------------------------- */

export interface ModalGateStatusProps extends DataAttributes {
  gate?: GateSelector;
  className?: string;
}

/**
 * 「なぜ進めないか」を常時可視にする。G-10。
 *
 * role="status" は付けない。Root のライブリージョンと二重に読み上げられるため。
 * ここは「押してから理由を知る」のではなく「押す前に理由が見えている」ための静的テキスト。
 */
export function ModalGateStatus({
  gate = true,
  className,
  ...rest
}: ModalGateStatusProps): ReactNode {
  const blockers = useBlockers(gate);
  const first = blockers[0];
  if (!first) return null;
  return (
    <p
      {...domPassthrough(rest, 'Modal.GateStatus')}
      className={className ? `g-gate-status ${className}` : 'g-gate-status'}
    >
      {first.reason}
    </p>
  );
}
