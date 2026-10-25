import { useEffect, useId, useRef, type ReactNode } from 'react';

import type { ChipOption } from './fields';
import { useControllable } from './internal/controllable';
import { warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { useIndicator } from './internal/indicator';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

/** Field の外で束に名前を付けるとき（Fieldset の legend を使わない場合）。 */
export interface GroupAria {
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** 名前が渡されたときだけ役割（radiogroup / group）を付ける。Fieldset の中で名前の無い役割を重ねない。 */
function groupRole({ 'aria-label': label, 'aria-labelledby': labelledBy }: GroupAria, role: 'radiogroup' | 'group' = 'radiogroup') {
  return label || labelledBy ? { role, 'aria-label': label, 'aria-labelledby': labelledBy } : {};
}

function useWarnDuplicateValues(component: string, options: readonly { value: string }[]): void {
  const values = options.map((option) => option.value).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys(component, 'options[].value', values.split('\u0000'));
  }, [component, values]);
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

export interface ModalCheckboxProps extends DataAttributes {
  /** ラベル。 */
  children: ReactNode;
  /** ラベルの下に添える補足。aria-describedby で結ぶ。 */
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** 「一部だけ選ばれている」。読み上げは mixed になる。 */
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
}

/**
 * チェックボックス。I-09。
 *
 * 中身はネイティブの input type="checkbox"。見た目だけを描き替える
 * （Space での切り替え・フォーム送信・必須の検証はブラウザが持つ）。
 * ラベルごと押せる大きさを 44px 取る。
 */
export function ModalCheckbox({
  children,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  required,
  name,
  value,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  className,
  ...rest
}: ModalCheckboxProps): ReactNode {
  const phrase = usePhrase();
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionId = `${useId()}-desc`;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div
      {...domPassthrough(rest, 'Modal.Checkbox')}
      className={className ? `g-choice ${className}` : 'g-choice'}
      data-disabled={disabled ? '' : undefined}
    >
      <label className="g-choice-main">
        <span className="g-choice-mark">
          <input
            ref={inputRef}
            type="checkbox"
            className="g-check"
            id={id}
            name={name}
            value={value}
            checked={on}
            disabled={disabled}
            required={required}
            aria-invalid={invalid}
            aria-describedby={[describedBy, description ? descriptionId : null].filter(Boolean).join(' ') || undefined}
            onChange={(event) => setOn(event.target.checked)}
          />
          <Icon name={indeterminate ? 'minus' : 'check'} className="g-check-icon" />
        </span>
        {/* 文は 1 つの器に入れる。ラベルは flex なので、リンクを挟んだ文がばらばらの項目になり、間が空く */}
        <span className="g-choice-text">{phrase(children)}</span>
      </label>
      <ChoiceDescription id={descriptionId}>{description}</ChoiceDescription>
    </div>
  );
}

/**
 * 選択肢の補足。<label> の外に置く。中に置くと補足まで名前に混ざる
 * （「すべて選択 一部だけ選択中」と読まれる。テストで実測）。説明としては aria-describedby で結ぶ。
 */
function ChoiceDescription({ id, children }: { id: string; children: ReactNode }): ReactNode {
  const phrase = usePhrase();
  return children ? (
    <span className="g-choice-desc" id={id}>
      {phrase(children)}
    </span>
  ) : null;
}

/* -------------------------------------------------------------------------- */
/* RadioGroup                                                                 */
/* -------------------------------------------------------------------------- */

export interface ChoiceOption extends ChipOption {
  description?: ReactNode;
  disabled?: boolean;
}

export interface ModalRadioGroupProps extends GroupAria, DataAttributes {
  options: readonly ChoiceOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** 省略すると自動で付く。フォームで送るなら渡す。 */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** 既定は縦並び。短い選択肢を横に並べるなら 'horizontal'。 */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * ラジオボタンの束。I-09。
 *
 * ネイティブの radio を同じ name で並べる。矢印キーでの移動と選択、Tab で束に 1 回だけ止まる、
 * という約束はブラウザが守る。名前は Modal.Fieldset の legend か、aria-label で付ける。
 */
export function ModalRadioGroup({
  options,
  value,
  defaultValue = null,
  onValueChange,
  name,
  disabled = false,
  required,
  orientation = 'vertical',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalRadioGroupProps): ReactNode {
  const phrase = usePhrase();
  const autoName = useId();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  useWarnDuplicateValues('Modal.RadioGroup', options);

  return (
    <div
      {...domPassthrough(rest, 'Modal.RadioGroup')}
      {...groupRole({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy })}
      className={className ? `g-choices ${className}` : 'g-choices'}
      data-orientation={orientation}
    >
      {options.map((option, index) => {
        const descriptionId = `${autoName}-${String(index)}-desc`;
        const off = disabled || option.disabled;
        return (
          <div key={option.value} className="g-choice" data-disabled={off ? '' : undefined}>
            <label className="g-choice-main">
              <span className="g-choice-mark">
                <input
                  type="radio"
                  className="g-radio"
                  name={name ?? autoName}
                  value={option.value}
                  checked={selected === option.value}
                  disabled={off}
                  required={required}
                  aria-describedby={option.description ? descriptionId : undefined}
                  onChange={() => setSelected(option.value)}
                />
              </span>
              <span className="g-choice-text">{phrase(option.label)}</span>
            </label>
            <ChoiceDescription id={descriptionId}>{option.description}</ChoiceDescription>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CheckboxGroup                                                              */
/* -------------------------------------------------------------------------- */

export interface ModalCheckboxGroupProps extends GroupAria, DataAttributes {
  options: readonly ChoiceOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  /** 選んだ値の並び。並びは options の順（押した順ではない）。 */
  onValueChange?: (value: string[]) => void;
  /** 省略すると自動で付く。フォームで送るなら渡す（同じ name で値ごとに送られる）。 */
  name?: string;
  disabled?: boolean;
  /** 既定は縦並び。短い選択肢を横に並べるなら 'horizontal'。 */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * チェックボックスの束（いくつでも選べる選択肢）。I-32。
 *
 * ネイティブの checkbox を同じ name で並べ、選んだ値を配列で渡す（Space で切り替え、Tab で 1 つずつ止まる）。
 * 名前は Modal.Fieldset の legend か aria-label で付ける（aria-label のときは role="group"）。
 * 「1 つ以上選んでください」は束の決まりなので、各チェックボックスの required ではなく、Fieldset の error で伝える。
 */
export function ModalCheckboxGroup({
  options,
  value,
  defaultValue = [],
  onValueChange,
  name,
  disabled = false,
  orientation = 'vertical',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalCheckboxGroupProps): ReactNode {
  const phrase = usePhrase();
  const autoName = useId();
  const [selected, setSelected] = useControllable<readonly string[]>(value, defaultValue, (next) => onValueChange?.([...next]));
  useWarnDuplicateValues('Modal.CheckboxGroup', options);
  const toggle = (target: string, on: boolean): void => {
    setSelected(options.filter((option) => (option.value === target ? on : selected.includes(option.value))).map((option) => option.value));
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.CheckboxGroup')}
      {...groupRole({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }, 'group')}
      className={className ? `g-choices ${className}` : 'g-choices'}
      data-orientation={orientation}
    >
      {options.map((option, index) => {
        const descriptionId = `${autoName}-${String(index)}-desc`;
        const off = disabled || option.disabled;
        return (
          <div key={option.value} className="g-choice" data-disabled={off ? '' : undefined}>
            <label className="g-choice-main">
              <span className="g-choice-mark">
                <input
                  type="checkbox"
                  className="g-check"
                  name={name ?? autoName}
                  value={option.value}
                  checked={selected.includes(option.value)}
                  disabled={off}
                  aria-describedby={option.description ? descriptionId : undefined}
                  onChange={(event) => toggle(option.value, event.target.checked)}
                />
                <Icon name="check" className="g-check-icon" />
              </span>
              <span className="g-choice-text">{phrase(option.label)}</span>
            </label>
            <ChoiceDescription id={descriptionId}>{option.description}</ChoiceDescription>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented                                                                  */
/* -------------------------------------------------------------------------- */

export interface ModalSegmentedProps extends GroupAria, DataAttributes {
  options: readonly ChipOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** 選択中の区画（ラジオを包む label）。 */
function checkedSegment(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLInputElement>('.g-segment-input:checked')?.parentElement ?? null;
}

/**
 * 横並びの択一（表示の切り替えなど、2〜5 個の短い選択肢）。I-09。
 * 中身はラジオなので、キー操作は RadioGroup と同じ。選んだ区画はテーマのアクセント色で塗る。
 * 塗りは 1 枚の板で、選び直すと前の区画から滑って移る（V-05）。
 */
export function ModalSegmented({
  options,
  value,
  defaultValue = null,
  onValueChange,
  name,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalSegmentedProps): ReactNode {
  const phrase = usePhrase();
  const autoName = useId();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  useWarnDuplicateValues('Modal.Segmented', options);
  const containerRef = useRef<HTMLDivElement>(null);
  useIndicator(containerRef, checkedSegment, selected);

  return (
    <div
      {...domPassthrough(rest, 'Modal.Segmented')}
      {...groupRole({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy })}
      ref={containerRef}
      className={className ? `g-segmented ${className}` : 'g-segmented'}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="g-segment-indicator" aria-hidden="true" />
      {options.map((option) => (
        <label key={option.value} className="g-segment">
          <input
            type="radio"
            className="g-segment-input"
            name={name ?? autoName}
            value={option.value}
            checked={selected === option.value}
            disabled={disabled}
            onChange={() => setSelected(option.value)}
          />
          <span className="g-segment-label">{phrase(option.label)}</span>
        </label>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Rating                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalRatingProps extends GroupAria, DataAttributes {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  /** 段階の数。既定 5。 */
  max?: number;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * 星の評価。I-09。
 *
 * 星ごとにネイティブの radio を置く。各星の名前は「5段階中3」（labels.rating）。
 * 星の絵だけでは、いくつ目を指しているかが読み上げで分からない。
 */
export function ModalRating({
  value,
  defaultValue = null,
  onValueChange,
  max = 5,
  name,
  disabled = false,
  required,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ModalRatingProps): ReactNode {
  const labels = useLabels();
  const autoName = useId();
  const [rating, setRating] = useControllable<number | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const steps = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div
      {...domPassthrough(rest, 'Modal.Rating')}
      {...groupRole({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy })}
      className={className ? `g-rating ${className}` : 'g-rating'}
      data-disabled={disabled ? '' : undefined}
    >
      {steps.map((step) => (
        <label key={step} className="g-star" data-on={rating !== null && step <= rating ? '' : undefined}>
          <input
            type="radio"
            className="g-star-input"
            name={name ?? autoName}
            value={step}
            checked={rating === step}
            disabled={disabled}
            required={required}
            aria-label={labels.rating(step, max)}
            onChange={() => setRating(step)}
          />
          <Icon name="star" />
        </label>
      ))}
    </div>
  );
}
