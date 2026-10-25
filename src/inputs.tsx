import {
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { FloatingLabelContext, type ControlAria } from './fields';
import { clampToStep, mergeRefs, useControllable } from './internal/controllable';
import { focusInputOnFrame } from './internal/dom';
import { Icon } from './internal/icons';
import { setNativeValue, withNormalize } from './internal/normalize';
import { domPassthrough, stripReservedData, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 入力欄の前に置くもの（「@」「¥」、アイコン）。 */
  start?: ReactNode;
  /** 入力欄の後ろに置くもの（「円」「kg」、ボタン）。 */
  end?: ReactNode;
  /**
   * 打った文字をそろえる関数（toHalfWidth・toKatakana・formatPostalCode・normalizePhone など）。I-25。
   * IME の変換中は触らず、1 文字ごとの入力・確定・貼り付け・自動入力のたびに当て、入力位置を保つ。
   * 利用側の onChange は、そろえた後の値を受け取る。打ち途中の文字列に当てても崩れない関数を渡す
   * （前後の空白を落とすような処理は送信のときに）。maxLength とは併せない（貼り付けが先に切られる）。
   */
  normalize?: (value: string) => string;
}

/**
 * テキスト入力。I-03。
 *
 * ネイティブの input をそのまま使い、枠だけを描く。ref・onChange・autoComplete など
 * input の属性は全部 input に届く。className だけは枠（外側の div）に付く。
 * type="date" / "time" / "color" も同じ枠に収まる（I-15）。
 *
 * 浮くラベルの Field の中では、プレースホルダが無ければ空白 1 文字を持つ。値が空かどうかを
 * CSS が :placeholder-shown で見るためで、空白は見えない（I-24）。
 */
export const ModalInput = forwardRef<HTMLInputElement, ModalInputProps>(function ModalInput(
  { start, end, normalize, className, ...rest },
  ref,
) {
  const floating = useContext(FloatingLabelContext);
  return (
    <div
      className={className ? `g-input ${className}` : 'g-input'}
      data-disabled={rest.disabled ? '' : undefined}
      onMouseDown={focusInputOnFrame}
    >
      {start != null ? <span className="g-input-adorn">{start}</span> : null}
      <input
        {...stripReservedData(rest, 'Modal.Input')}
        {...withNormalize(normalize, { onChange: rest.onChange, onCompositionEnd: rest.onCompositionEnd })}
        placeholder={floating && !rest.placeholder ? ' ' : rest.placeholder}
        ref={ref}
        className="g-bare"
      />
      {end != null ? <span className="g-input-adorn">{end}</span> : null}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* PasswordInput                                                              */
/* -------------------------------------------------------------------------- */

export type ModalPasswordInputProps = Omit<ModalInputProps, 'type' | 'end'>;

/**
 * 表示を切り替えられるパスワード。I-04。
 * トグルは aria-pressed で状態を持つので、文言は「パスワードを表示」の 1 つで足りる。
 */
export const ModalPasswordInput = forwardRef<HTMLInputElement, ModalPasswordInputProps>(
  function ModalPasswordInput(props, ref) {
    const labels = useLabels();
    const [visible, setVisible] = useState(false);
    return (
      <ModalInput
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        spellCheck={false}
        end={
          <button
            type="button"
            className="g-input-action"
            aria-pressed={visible}
            aria-label={labels.showPassword}
            disabled={props.disabled}
            onClick={() => setVisible((v) => !v)}
          >
            <Icon name="eye" />
          </button>
        }
      />
    );
  },
);

/* -------------------------------------------------------------------------- */
/* SearchInput                                                                */
/* -------------------------------------------------------------------------- */

export type ModalSearchInputProps = Omit<ModalInputProps, 'type' | 'start' | 'end'>;

/**
 * 検索欄。I-05。
 *
 * 消すボタンは値があるときだけ見せる（:placeholder-shown で判定するので、placeholder を必ず持たせる）。
 * 消したらフォーカスを入力欄へ戻す。ボタンが消えるとフォーカスの行き先が無くなるため。
 */
export const ModalSearchInput = forwardRef<HTMLInputElement, ModalSearchInputProps>(function ModalSearchInput(
  { className, placeholder, ...inputProps },
  ref,
) {
  const labels = useLabels();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    // 濾過は Modal.Input が行う。
    <ModalInput
      {...inputProps}
      ref={mergeRefs(ref, inputRef)}
      type="search"
      placeholder={placeholder ?? ' '}
      className={className ? `g-search ${className}` : 'g-search'}
      start={<Icon name="search" />}
      end={
        <button
          type="button"
          className="g-input-action g-search-clear"
          aria-label={labels.clear}
          disabled={inputProps.disabled}
          onClick={() => {
            const input = inputRef.current;
            if (!input) return;
            setNativeValue(input, '');
            input.focus();
          }}
        >
          <Icon name="close" />
        </button>
      }
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

export type ModalTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * 複数行の入力。I-06。
 *
 * maxLength を渡すと「12 / 200」を出し、aria-describedby に足す。
 * 読み上げは説明としてフォーカス時だけ（打つたびに割り込ませない。B-09 と同じ理由）。
 * 数え方はブラウザの maxLength と同じ UTF-16 の単位。表示と制限をずらさない。
 * 高さは中身に合わせて伸びる（field-sizing。対応していないブラウザでは手で伸ばす）。
 */
export const ModalTextarea = forwardRef<HTMLTextAreaElement, ModalTextareaProps>(function ModalTextarea(
  { className, maxLength, onChange, 'aria-describedby': describedBy, ...rest },
  ref,
) {
  const counterId = `${useId()}-count`;
  const [typed, setTyped] = useState(String(rest.defaultValue ?? '').length);
  const count = rest.value !== undefined ? String(rest.value).length : typed;
  const counted = maxLength !== undefined;
  return (
    <div className={className ? `g-textarea ${className}` : 'g-textarea'}>
      <textarea
        {...stripReservedData(rest, 'Modal.Textarea')}
        ref={ref}
        className="g-bare"
        maxLength={maxLength}
        aria-describedby={[describedBy, counted ? counterId : null].filter(Boolean).join(' ') || undefined}
        onChange={(event) => {
          setTyped(event.target.value.length);
          onChange?.(event);
        }}
      />
      {counted ? (
        <span className="g-counter" id={counterId} data-full={count >= maxLength ? '' : undefined}>
          {count} / {maxLength}
        </span>
      ) : null}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* NumberField                                                                */
/* -------------------------------------------------------------------------- */

export interface ModalNumberFieldProps extends ControlAria, DataAttributes {
  /** null は空欄。渡すと制御になる。 */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 数の後ろに添える単位（「席」「kg」）。 */
  unit?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * − と + の付いた数値入力。I-07。
 *
 * 中身はネイティブの input type="number"（spinbutton の役割・↑↓・数字キーボードはブラウザが持つ）。
 * ボタンは範囲の端で押せなくなり、step の桁で丸める。離れたときに範囲の外なら端へ戻す。
 * ボタンを Tab の順に入れないのは、↑↓ で同じことができ、1 項目で Tab が 3 回止まるのを避けるため。
 */
export function ModalNumberField({
  value,
  defaultValue = null,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  placeholder,
  disabled = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...rest
}: ModalNumberFieldProps): ReactNode {
  const labels = useLabels();
  const [current, setCurrent] = useControllable<number | null>(value, defaultValue, onValueChange);
  const stepBy = (direction: 1 | -1): void => {
    const base = current ?? (Number.isFinite(min) ? min : 0);
    setCurrent(clampToStep(current === null ? base : base + direction * step, min, max, step));
  };
  const stepper = (direction: 1 | -1): ReactNode => (
    <button
      type="button"
      className="g-input-action"
      tabIndex={-1}
      aria-label={direction > 0 ? labels.increment : labels.decrement}
      disabled={disabled || (current !== null && (direction > 0 ? current >= max : current <= min))}
      onClick={() => stepBy(direction)}
    >
      <Icon name={direction > 0 ? 'plus' : 'minus'} />
    </button>
  );
  return (
    <div
      {...domPassthrough(rest, 'Modal.NumberField')}
      className={className ? `g-input g-number ${className}` : 'g-input g-number'}
      data-disabled={disabled ? '' : undefined}
    >
      {stepper(-1)}
      <input
        type="number"
        id={id}
        name={name}
        className="g-bare"
        inputMode="decimal"
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        value={current ?? ''}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          setCurrent(Number.isNaN(next) ? null : next);
        }}
        onBlur={() => {
          if (current === null) return;
          const clamped = Math.min(max, Math.max(min, current));
          if (clamped !== current) setCurrent(clamped);
        }}
      />
      {unit != null ? <span className="g-input-adorn">{unit}</span> : null}
      {stepper(1)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CodeInput                                                                  */
/* -------------------------------------------------------------------------- */

export interface ModalCodeInputProps extends ControlAria, DataAttributes {
  /** 桁数。既定 6。 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 全桁がそろったとき。自動で送信するならここで。 */
  onComplete?: (code: string) => void;
  /** 英字も受ける。既定は数字だけ。 */
  alphanumeric?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * 確認コード（ワンタイムパスワード）。I-08。
 *
 * 入力欄は 1 つ。桁ごとの箱は見た目だけで、読み上げには出さない。
 * 桁ごとに input を分けると、SMS の自動入力・貼り付け・消去がそれぞれ壊れ、
 * スクリーンリーダーには 6 個の名前の無い欄が並ぶ。
 * 全角数字は半角に直して受ける（日本語 IME のまま打っても通る）。
 */
export function ModalCodeInput({
  length = 6,
  value,
  defaultValue = '',
  onValueChange,
  onComplete,
  alphanumeric = false,
  disabled = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...rest
}: ModalCodeInputProps): ReactNode {
  const [code, setCode] = useControllable(value, defaultValue, onValueChange);
  const cells = Array.from({ length }, (_, index) => index);
  const caret = Math.min(code.length, length - 1);
  const accept = (text: string): void => {
    const normalized = text.normalize('NFKC').toUpperCase();
    const next = normalized.replace(alphanumeric ? /[^0-9A-Z]/g : /\D/g, '').slice(0, length);
    setCode(next);
    if (next.length === length && next !== code) onComplete?.(next);
  };
  return (
    <div
      {...domPassthrough(rest, 'Modal.CodeInput')}
      className={className ? `g-code ${className}` : 'g-code'}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="g-code-cells" aria-hidden="true">
        {cells.map((index) => (
          <span
            key={index}
            className="g-code-cell"
            data-filled={index < code.length ? '' : undefined}
            data-current={index === caret ? '' : undefined}
          >
            {code[index]}
          </span>
        ))}
      </div>
      <input
        type="text"
        id={id}
        name={name}
        className="g-code-input"
        inputMode={alphanumeric ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={length}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        value={code}
        onChange={(event) => accept(event.target.value)}
        onPaste={(event) => {
          // 貼り付けは全体の置き換え。埋まった後に別のコードを貼っても maxLength で弾かれない。
          event.preventDefault();
          accept(event.clipboardData.getData('text'));
        }}
        onSelect={(event) => {
          // 桁の途中に入力位置を置かせない。箱の並びと入力位置がずれるため。
          const input = event.currentTarget;
          const end = input.value.length;
          if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
        }}
      />
    </div>
  );
}
