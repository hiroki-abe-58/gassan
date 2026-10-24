import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import type { ControlAria } from './fields';
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from './internal/color';
import { useControllable } from './internal/controllable';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels } from './labels';

export interface ColorSwatch {
  /** '#rrggbb'。 */
  value: string;
  /** 色の名前（読み上げ。「ブランドの青」など）。 */
  label: string;
}

export interface ModalColorPickerProps extends ControlAria, DataAttributes {
  /** '#rrggbb'。渡すと制御になる。 */
  value?: string;
  /** 既定 '#000000'（ネイティブの input type="color" と同じ）。 */
  defaultValue?: string;
  /** 色が変わるたびに呼ぶ（面や色相を動かしている途中も）。値は '#rrggbb'。 */
  onValueChange?: (value: string) => void;
  /** よく使う色。押すとその色になる。 */
  swatches?: readonly ColorSwatch[];
  disabled?: boolean;
  name?: string;
  className?: string;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

/** 彩度と明るさの面のキー。←→ で彩度、↑↓ と PageUp / PageDown で明るさ、Home / End で彩度の端。Shift で 10 ずつ。 */
function moveInArea(key: string, shift: boolean, { h, s, v }: Hsv): Hsv | null {
  const step = shift ? 10 : 1;
  switch (key) {
    case 'ArrowRight':
      return { h, s: clamp(s + step), v };
    case 'ArrowLeft':
      return { h, s: clamp(s - step), v };
    case 'ArrowUp':
      return { h, s, v: clamp(v + step) };
    case 'ArrowDown':
      return { h, s, v: clamp(v - step) };
    case 'PageUp':
      return { h, s, v: clamp(v + 10) };
    case 'PageDown':
      return { h, s, v: clamp(v - 10) };
    case 'Home':
      return { h, s: 0, v };
    case 'End':
      return { h, s: 100, v };
    default:
      return null;
  }
}

/**
 * 色を選ぶ。I-23。
 *
 * ボタン（色の見本と '#rrggbb'。値はボタンの説明として読む）で開くと、彩度と明るさの面・色相・16 進数の欄
 * （と、渡せばよく使う色）が並び、面の摘みにフォーカスが入る。面は 2 次元のスライダー（role="slider"）で、
 * ←→ で彩度、↑↓ で明るさを動かし、値は「彩度 80%、明るさ 60%」と読む。色相はネイティブの range、
 * よく使う色はネイティブのラジオ（←→ で選ぶ）。16 進数の欄は 6 桁を打ち終えたとき（3 桁は確定したとき）に色を変える。
 * 色は動かすたびに変わり、Esc か外を押すと閉じる（Esc はボタンへ戻す）。面と色相の向きは文書の向きによらず左から右。
 */
export function ModalColorPicker({
  value,
  defaultValue = '#000000',
  onValueChange,
  swatches,
  disabled = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  // 色はいつも値を持つので必須の印は要らない（button には aria-required を付けられない）
  'aria-required': _ariaRequired,
  ...rest
}: ModalColorPickerProps): ReactNode {
  const labels = useLabels();
  const base = useId();
  const valueId = `${base}-value`;
  const [current, setCurrent] = useControllable<string>(
    value === undefined ? undefined : (normalizeHex(value) ?? '#000000'),
    normalizeHex(defaultValue) ?? '#000000',
    onValueChange,
  );
  // 灰色・白・黒では色相が決まらないので、動かしている色相・彩度・明るさは自分で持つ（値から毎回求め直さない）。
  // 外から値が変わったときだけ、値から求め直す。
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(current));
  const [seen, setSeen] = useState(current);
  if (current !== seen) {
    setSeen(current);
    if (hsvToHex(hsv) !== current) setHsv(hexToHsv(current, hsv.h));
  }
  /** 打っている途中の 16 進数（null は打っていない）。 */
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open) thumbRef.current?.focus();
  }, [open]);

  /** 色を変える。hex を渡したときはその値のまま（見本や打った値を、HSV を通した丸めで変えない）。 */
  const apply = (next: Hsv, hex = hsvToHex(next)): void => {
    setHsv(next);
    setSeen(hex);
    if (hex !== current) setCurrent(hex);
  };
  const applyHex = (hex: string): void => apply(hexToHsv(hex, hsv.h), hex);

  const close = (refocus: boolean): void => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const pickAt = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    apply({ h: hsv.h, s: clamp(Math.round(x * 100)), v: clamp(Math.round((1 - y) * 100)) });
  };

  const commitDraft = (): void => {
    const hex = draft === null ? null : normalizeHex(draft);
    if (hex) applyHex(hex);
    setDraft(null);
  };

  return (
    <div {...domPassthrough(rest, 'Modal.ColorPicker')} ref={anchorRef} className={className ? `g-select g-color-picker ${className}` : 'g-select g-color-picker'}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="g-select-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={[valueId, ariaDescribedBy].filter(Boolean).join(' ')}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <span className="g-color-chip" style={{ background: current }} aria-hidden="true" />
        <span id={valueId} className="g-select-value g-color-value">
          {current}
        </span>
        <Icon name="chevronDown" className="g-select-icon" />
      </button>
      <Popup
        open={open}
        anchorRef={anchorRef}
        onDismiss={() => close(false)}
        className="g-color"
        matchWidth={false}
        role="dialog"
        aria-label={labels.chooseColor}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // モーダルの cancel まで届かせない。閉じるのは色の選択だけ。
          event.preventDefault();
          close(true);
        }}
        onBlur={(event) => {
          // Tab で外へ出たときだけ閉じる（DatePicker・TimePicker と同じ）。
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next) && next !== triggerRef.current) close(false);
        }}
      >
        <div
          className="g-color-area"
          dir="ltr"
          style={{ '--g-color-hue': hsv.h } as CSSProperties}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            // 続く mousedown がフォーカスを面の外へ移さないように（摘みにフォーカスを置いたまま、キーでも続けられる）
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            thumbRef.current?.focus();
            pickAt(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) pickAt(event);
          }}
        >
          <div
            ref={thumbRef}
            role="slider"
            tabIndex={0}
            className="g-color-thumb"
            aria-roledescription={labels.twoDimensionalSlider}
            aria-label={labels.saturationBrightness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hsv.s}
            aria-valuetext={labels.saturationBrightnessValue(hsv.s, hsv.v)}
            style={{ insetInlineStart: `${String(hsv.s)}%`, insetBlockStart: `${String(100 - hsv.v)}%`, background: current }}
            onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
              const next = moveInArea(event.key, event.shiftKey, hsv);
              if (!next) return;
              event.preventDefault();
              apply(next);
            }}
          />
        </div>
        <input
          type="range"
          dir="ltr"
          className="g-color-hue"
          min={0}
          max={359}
          step={1}
          value={hsv.h}
          aria-label={labels.hue}
          aria-valuetext={labels.hueValue(hsv.h)}
          style={{ '--g-color-hue': hsv.h } as CSSProperties}
          onChange={(event) => apply({ ...hsv, h: Number(event.target.value) })}
        />
        <div className="g-color-fields">
          <span className="g-color-preview" style={{ background: current }} aria-hidden="true" />
          <input
            type="text"
            className="g-color-hex"
            aria-label={labels.hexColor}
            value={draft ?? current}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setDraft(event.target.value);
              // 3 桁は 6 桁の打ちかけでもあるので、確定（Enter・欄を出る）まで色を変えない
              if (/^#?[0-9a-f]{6}$/i.test(event.target.value.trim())) applyHex(normalizeHex(event.target.value) ?? current);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitDraft();
            }}
            onBlur={commitDraft}
          />
        </div>
        {swatches && swatches.length > 0 ? (
          <div role="radiogroup" aria-label={labels.swatches} className="g-color-swatches">
            {swatches.map((swatch) => {
              const hex = normalizeHex(swatch.value);
              if (!hex) return null;
              return (
                <label key={hex} className="g-color-swatch">
                  <input type="radio" name={`${base}-swatch`} checked={current === hex} aria-label={swatch.label} onChange={() => applyHex(hex)} />
                  <span style={{ background: hex }} aria-hidden="true" />
                </label>
              );
            })}
          </div>
        ) : null}
      </Popup>
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  );
}
