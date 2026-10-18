import type { CSSProperties, ReactNode } from 'react';

import type { ControlAria } from './fields';
import { percentOf, useControllable } from './internal/controllable';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';

interface SliderBase extends DataAttributes {
  min?: number;
  max?: number;
  step?: number;
  /** 値の言い表し方（「3 席」「¥1,200」）。表示と aria-valuetext の両方に使う。 */
  formatValue?: (value: number) => string;
  /** 値を横に出す。 */
  showValue?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** 塗りの範囲。トラックのグラデーションが読む。 */
function fill(start: number, end: number): CSSProperties {
  return { '--g-fill-start': `${String(start)}%`, '--g-fill-end': `${String(end)}%` } as CSSProperties;
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalSliderProps extends SliderBase, ControlAria {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

/**
 * スライダー。I-10。
 *
 * 中身はネイティブの input type="range"（←→ Home End PageUp PageDown はブラウザが持つ）。
 * 摘みと、値までの塗りはテーマのアクセント色（--g-accent）で描く。
 * accent-color に任せないのは、描き方（明るい色に足される縁取り、摘みの形）がブラウザごとに違い、
 * ほかの部品とそろわないため（§10-32）。
 */
export function ModalSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  showValue = false,
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
}: ModalSliderProps): ReactNode {
  const [current, setCurrent] = useControllable(value, defaultValue ?? min, onValueChange);
  const text = formatValue ? formatValue(current) : String(current);
  return (
    <div
      {...domPassthrough(rest, 'Modal.Slider')}
      className={className ? `g-slider ${className}` : 'g-slider'}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="g-slider-track" style={fill(0, percentOf(current, min, max))}>
        <input
          type="range"
          className="g-range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-valuetext={formatValue ? text : undefined}
          onChange={(event) => setCurrent(event.target.valueAsNumber)}
        />
      </div>
      {showValue ? (
        <span className="g-slider-value" aria-hidden="true">
          {text}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RangeSlider                                                                */
/* -------------------------------------------------------------------------- */

export interface ModalRangeSliderProps extends SliderBase {
  value?: readonly [number, number];
  defaultValue?: readonly [number, number];
  onValueChange?: (value: [number, number]) => void;
  /** Fieldset の外で使うときの束の名前。 */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * 2 つ摘みのスライダー（範囲を選ぶ）。I-10。
 *
 * ネイティブの range を 2 本重ね、摘みだけが押せるようにする。
 * 摘みはそれぞれ独立した slider なので、キー操作も読み上げも 1 本のときと同じ。
 * 名前は「下限」「上限」（labels.rangeStart / rangeEnd）。束の名前は Modal.Fieldset の legend。
 * 下限は上限を越えない（越えようとすると上限の位置で止まる）。
 * 2 つがぴったり重なったとき、上に描かれるのは後ろの上限。範囲の上半分で重なったら、
 * 上限の摘みに押下を素通りさせ（data-pass）、下の下限を掴ませる。右端で重なると上限は
 * それ以上右へ動けず、離すには下限を左へ引くしかないため。重なりを z-index で入れ替えないのは、
 * DOM の順（Tab の順）を保ったまま、描く順に頼らず済むから。
 */
export function ModalRangeSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  showValue = false,
  disabled = false,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: ModalRangeSliderProps): ReactNode {
  const labels = useLabels();
  const [[low, high], setRange] = useControllable<readonly [number, number]>(
    value,
    defaultValue ?? [min, max],
    (next) => onValueChange?.([next[0], next[1]]),
  );
  const show = formatValue ?? String;
  const thumb = (which: 0 | 1): ReactNode => {
    const own = which === 0 ? low : high;
    return (
      <input
        type="range"
        className="g-range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={own}
        disabled={disabled}
        aria-label={which === 0 ? labels.rangeStart : labels.rangeEnd}
        aria-describedby={ariaDescribedBy}
        aria-valuetext={formatValue ? formatValue(own) : undefined}
        data-pass={which === 1 && low === high && low > (min + max) / 2 ? '' : undefined}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          setRange(which === 0 ? [Math.min(next, high), high] : [low, Math.max(next, low)]);
        }}
      />
    );
  };
  return (
    <div
      {...domPassthrough(rest, 'Modal.RangeSlider')}
      className={className ? `g-slider g-range-slider ${className}` : 'g-slider g-range-slider'}
      role={ariaLabel || ariaLabelledBy ? 'group' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="g-slider-track" style={fill(percentOf(low, min, max), percentOf(high, min, max))}>
        {thumb(0)}
        {thumb(1)}
      </div>
      {showValue ? (
        <span className="g-slider-value" aria-hidden="true">
          {show(low)} – {show(high)}
        </span>
      ) : null}
    </div>
  );
}
