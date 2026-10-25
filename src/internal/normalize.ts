import type { ChangeEvent, CompositionEvent } from 'react';

/**
 * 値を React の外から書き換え、input イベントを起こす。
 * 制御・非制御のどちらで使われていても、利用側の onChange がいつもどおり呼ばれる。
 */
export function setNativeValue(input: HTMLInputElement, value: string): void {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** 入力位置。email と number の入力欄は持たない（null）。 */
function caretOf(input: HTMLInputElement): number | null {
  try {
    return input.selectionStart;
  } catch {
    return null;
  }
}

/**
 * 入力欄の値を normalize でそろえ、入力位置を「元の位置より前の文字列をそろえた長さ」に置き直す。I-25。
 * notify が true なら React の外から書き換えて input イベントを起こす（IME の確定のとき。onChange を呼ばせる）。
 * false なら onChange の中で書き換える（このあと利用側の onChange が、そろえた値を event.target.value で読む）。
 */
function normalizeInput(input: HTMLInputElement, normalize: (value: string) => string, notify: boolean): void {
  const raw = input.value;
  const next = normalize(raw);
  if (next === raw) return;
  const caret = caretOf(input);
  if (notify) setNativeValue(input, next);
  else input.value = next;
  if (caret === null || input.ownerDocument.activeElement !== input) return;
  const at = Math.min(normalize(raw.slice(0, caret)).length, next.length);
  input.setSelectionRange(at, at);
}

interface NormalizeHandlers {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onCompositionEnd?: (event: CompositionEvent<HTMLInputElement>) => void;
}

/**
 * 入力欄の onChange と onCompositionEnd に、値をそろえる処理を挟む。I-25。
 * IME の変換中（isComposing）は触らない（変換の途中の文字列を書き換えると IME が壊れる）。
 * 確定・貼り付け・自動入力・ドロップ・1 文字ごとの入力は、どれも変換中でない input イベントか、変換の終わりで受ける。
 */
export function withNormalize(normalize: ((value: string) => string) | undefined, handlers: NormalizeHandlers): NormalizeHandlers {
  if (!normalize) return handlers;
  return {
    onChange: (event) => {
      if (!(event.nativeEvent as Partial<InputEvent>).isComposing) normalizeInput(event.currentTarget, normalize, false);
      handlers.onChange?.(event);
    },
    onCompositionEnd: (event) => {
      handlers.onCompositionEnd?.(event);
      normalizeInput(event.currentTarget, normalize, true);
    },
  };
}
