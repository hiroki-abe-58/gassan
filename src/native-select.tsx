import { forwardRef, type SelectHTMLAttributes } from 'react';

import { Icon } from './internal/icons';
import { stripReservedData } from './internal/passthrough';
import type { SelectOption } from './select';

export interface ModalNativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'multiple' | 'size'> {
  options: readonly SelectOption[];
  /** 先頭に置く空の選択肢（value=""）の文字（「選択してください」）。渡さなければ置かない。 */
  placeholder?: string;
}

/**
 * ネイティブの select。I-26。
 *
 * 一覧をブラウザが出すので、自動入力（都道府県・生年月日・国）とスマートフォンの標準のピッカーが効く。
 * 自前で一覧を描く Select は見た目と操作をそろえられるが、ブラウザの自動入力が届かない。
 * 矢印はネイティブのものを消して（appearance: none）、Select と同じ印を余白の内側に置く（§10-30）。
 * ref と select の属性は select に届き、className だけは枠（Input と同じ .g-input）に付く。
 */
// forwardRef の前の PURE の注釈は、使わないアプリの束から部品ごと外せるようにするため（src/japanese.ts の先頭の注を参照）
export const ModalNativeSelect = /* @__PURE__ */ forwardRef<HTMLSelectElement, ModalNativeSelectProps>(function ModalNativeSelect(
  { options, placeholder, className, ...rest },
  ref,
) {
  return (
    <div
      className={className ? `g-input g-native-select ${className}` : 'g-input g-native-select'}
      data-disabled={rest.disabled ? '' : undefined}
    >
      {/* 印を先に置く。select を枠の先頭の子にすると、浮くラベル（I-24。先頭の .g-bare を探す）が select に重なる */}
      <Icon name="chevronDown" className="g-select-icon" />
      <select {...stripReservedData(rest, 'Modal.NativeSelect')} ref={ref} className="g-bare">
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});
