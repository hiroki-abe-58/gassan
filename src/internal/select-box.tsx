import { useEffect, useRef, type ReactNode, type RefObject } from 'react';

import { Icon } from './icons';

/**
 * 行を選ぶためのチェックボックス（データの表・メールの一覧）。包む label いっぱいを当たりにする。
 * 「いくつか選んだ」は DOM の indeterminate なので、描いた後に付ける。
 */
export function SelectBox({
  className,
  checked,
  indeterminate = false,
  onChange,
  label,
  labelledBy,
  disabled = false,
  inputRef,
}: {
  className: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelledBy?: string;
  /** 選べないとき（通知の設定で、通知を止めている間など）。 */
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}): ReactNode {
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [ref, indeterminate]);
  return (
    <label className={className}>
      <span className="g-choice-mark">
        <input
          ref={ref}
          type="checkbox"
          className="g-check"
          checked={checked}
          aria-label={label}
          aria-labelledby={labelledBy}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <Icon name={indeterminate ? 'minus' : 'check'} className="g-check-icon" />
      </span>
    </label>
  );
}
