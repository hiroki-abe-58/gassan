import { useEffect, useId, type ReactNode } from 'react';

import { warnDuplicateKeys } from './internal/dom';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
}

export interface ModalFieldProps extends DataAttributes {
  label: ReactNode;
  children: (control: FieldControlProps) => ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
}

/**
 * ラベル・補助テキスト・エラーの配線を1箇所に閉じ込める。B-07。
 *
 * render prop にしているのは、中身をライブラリが決めないため。
 * ネイティブの input でも、Base UI の Select でも、同じ配線が使える。
 *
 * エラーに role="alert" は付けない。
 * 入力のたびに読み上げが割り込むと、かえって入力できなくなる。
 * 送信時のまとめは <Modal.Alert> の役目。
 */
export function ModalField({
  label,
  children,
  help,
  error,
  required = false,
  id,
  className,
  ...rest
}: ModalFieldProps): ReactNode {
  const labels = useLabels();
  const reactId = useId();
  const fieldId = id ?? `gassan-field-${reactId}`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  const describedBy =
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      {...domPassthrough(rest, 'Modal.Field')}
      className={className ? `g-field ${className}` : 'g-field'}
      data-invalid={error ? '' : undefined}
    >
      <label className="g-label" htmlFor={fieldId}>
        <span className="g-label-text">{label}</span>
        <span className="g-label-badge" data-required={required ? '' : undefined}>
          {required ? labels.required : labels.optional}
        </span>
      </label>

      {children({
        id: fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}

      {help ? (
        <p className="g-help" id={helpId}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p className="g-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chips                                                                      */
/* -------------------------------------------------------------------------- */

export interface ChipOption {
  value: string;
  label: ReactNode;
}

export interface ModalChipsProps extends DataAttributes {
  label: string;
  options: readonly ChipOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  className?: string;
}

/**
 * タグ／ジャンルの追加・解除。
 *
 * aria-pressed のトグルボタン群にする。role="listbox" にしないのは、
 * 「選ぶ」より「押して付け外しする」ほうが実態に近く、
 * listbox に必要な複雑なキーボード規約を持ち込まずに済むため。
 */
export function ModalChips({
  label,
  options,
  value,
  onChange,
  className,
  ...rest
}: ModalChipsProps): ReactNode {
  const selected = new Set(value);

  const values = options.map((option) => option.value).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('Modal.Chips', 'options[].value', values.split('\u0000'));
  }, [values]);

  return (
    <div
      {...domPassthrough(rest, 'Modal.Chips')}
      className={className ? `g-chips ${className}` : 'g-chips'}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const isOn = selected.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className="g-chip"
            aria-pressed={isOn}
            onClick={() => {
              const next = new Set(selected);
              if (isOn) next.delete(option.value);
              else next.add(option.value);
              onChange([...next]);
            }}
          >
            <span className="g-chip-mark" aria-hidden="true">
              {isOn ? '×' : '+'}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalSwitchProps extends DataAttributes {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** role="switch" のトグル。ネイティブ button なので Space / Enter が既に効く。 */
export function ModalSwitch({
  checked,
  onCheckedChange,
  children,
  className,
  id,
  ...rest
}: ModalSwitchProps): ReactNode {
  return (
    <button
      {...domPassthrough(rest, 'Modal.Switch')}
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      className={className ? `g-switch ${className}` : 'g-switch'}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="g-switch-track" aria-hidden="true">
        <span className="g-switch-thumb" />
      </span>
      <span className="g-switch-label">{children}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalTableProps extends DataAttributes {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * 横スクロールするテーブルのラッパ。B-13。
 * スクロールできる領域には名前とフォーカスを与える。
 * これが無いと、キーボードだけの利用者は右側の列に到達できない。
 */
export function ModalTable({
  label,
  children,
  className,
  ...rest
}: ModalTableProps): ReactNode {
  return (
    <div
      {...domPassthrough(rest, 'Modal.Table')}
      className={className ? `g-table-wrap ${className}` : 'g-table-wrap'}
      role="group"
      tabIndex={0}
      aria-label={label}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Alert                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalAlertProps extends DataAttributes {
  children: ReactNode;
  tone?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  /** 送信失敗のまとめなど、即座に割り込ませたいときだけ true。 */
  assertive?: boolean;
}

/** 送信結果や検証エラーのまとめ。F-08。 */
export function ModalAlert({
  children,
  tone = 'error',
  className,
  assertive = false,
  ...rest
}: ModalAlertProps): ReactNode {
  return (
    <div
      {...domPassthrough(rest, 'Modal.Alert')}
      className={className ? `g-alert ${className}` : 'g-alert'}
      data-tone={tone}
      role={assertive ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
