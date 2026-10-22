import { useId, useRef, useState, type ReactNode } from 'react';

import type { ControlAria } from './fields';
import { useControllable } from './internal/controllable';
import { focusInputOnFrame, isComposing } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';

export interface ModalTagInputProps extends ControlAria, DataAttributes {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (tags: string[]) => void;
  /** 区切りの文字。既定はカンマと読点（「,」「、」「，」）。Enter・改行・タブはいつも区切り。 */
  separators?: readonly string[];
  /** 付けられる数の上限。 */
  max?: number;
  /** 付けてよいか。false を返したタグは付けず、入力欄に残す（直して付け直せる）。 */
  validate?: (tag: string) => boolean;
  /** 入力の候補（ブラウザの候補一覧に出す。付けたものは除く）。 */
  suggestions?: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  /** フォームに送る名前。タグごとに hidden の input を置く（同じ name が並ぶ）。 */
  name?: string;
  className?: string;
}

const DEFAULT_SEPARATORS: readonly string[] = [',', '、', '，'];

/** 区切りで分ける。改行とタブ（表計算からの貼り付け）もいつも区切る。 */
function splitTags(text: string, separators: readonly string[]): string[] {
  let parts = [text];
  for (const separator of [...separators, '\n', '\t']) parts = parts.flatMap((part) => part.split(separator));
  return parts;
}

/** 前後の空白を落とし、中の空白の並びを 1 つにする。 */
const tidy = (text: string): string => text.trim().replace(/\s+/gu, ' ');

/**
 * タグの入力。I-21。
 *
 * 打って Enter か区切り（カンマ・読点）で付け、× で外す。貼り付けた「a, b, c」は 3 つに分ける。
 * 変換中（IME）の Enter と読点では付けず、確定してから分ける。空の入力欄で Backspace を押すと、
 * 最後のタグを入力欄へ戻す（消さずに直せる）。同じタグは 2 度付けない。入力欄を離れたら、打ちかけの文字も付ける。
 * 付けた・外したことは role="status" で読み上げる。名前・説明・エラーは入力欄に付く（Field の配線をそのまま渡せる）。
 */
export function ModalTagInput({
  value,
  defaultValue = [],
  onValueChange,
  separators = DEFAULT_SEPARATORS,
  max,
  validate,
  suggestions,
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
}: ModalTagInputProps): ReactNode {
  const labels = useLabels();
  const listId = `${useId()}-suggestions`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useControllable<readonly string[]>(value, defaultValue, (next) => onValueChange?.([...next]));
  const [text, setText] = useState('');
  const [announcement, setAnnouncement] = useState('');
  /** IME で変換中か。input イベントの isComposing を持たない環境もあるので、composition のイベントでも持つ。 */
  const composing = useRef(false);

  /**
   * 文字列をタグにして付ける。keepTail なら最後の区切りの後ろ（打ちかけ）は付けずに入力欄に残す。
   * 弾かれたタグ（上限・validate）も入力欄に残す。
   */
  const add = (raw: string, keepTail: boolean): void => {
    const parts = splitTags(raw, separators);
    const tail = keepTail ? (parts.pop() ?? '') : '';
    const next = [...tags];
    const rejected: string[] = [];
    for (const part of parts) {
      const tag = tidy(part);
      if (!tag || next.includes(tag)) continue;
      if ((max !== undefined && next.length >= max) || (validate && !validate(tag))) rejected.push(tag);
      else next.push(tag);
    }
    const added = next.slice(tags.length);
    if (added.length > 0) {
      setTags(next);
      setAnnouncement(added.map(labels.tagAdded).join(' '));
    }
    setText([...rejected, tail.trimStart()].filter(Boolean).join(`${separators[0] ?? ','} `));
  };

  const remove = (tag: string): void => {
    setTags(tags.filter((item) => item !== tag));
    setAnnouncement(labels.tagRemoved(tag));
  };

  const hasSeparator = (raw: string): boolean => splitTags(raw, separators).length > 1;
  const offered = suggestions?.filter((suggestion) => !tags.includes(suggestion)) ?? [];

  return (
    <div
      {...domPassthrough(rest, 'Modal.TagInput')}
      className={className ? `g-input g-tags ${className}` : 'g-input g-tags'}
      data-disabled={disabled ? '' : undefined}
      onMouseDown={focusInputOnFrame}
    >
      {tags.length > 0 ? (
        <ul className="g-tags-list">
          {tags.map((tag) => (
            <li key={tag} className="g-tag">
              <span className="g-tag-label">{tag}</span>
              <button
                type="button"
                className="g-tag-remove"
                aria-label={labels.removeTag(tag)}
                disabled={disabled}
                onClick={() => {
                  remove(tag);
                  inputRef.current?.focus();
                }}
              >
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        id={id}
        className="g-bare g-tags-input"
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="enter"
        list={offered.length > 0 ? listId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          // 変換中は区切りを見ない（確定した時に分ける）。
          if (!composing.current && !(event.nativeEvent as InputEvent).isComposing && hasSeparator(next)) add(next, true);
          else setText(next);
        }}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          const current = event.currentTarget.value;
          if (hasSeparator(current)) add(current, true);
        }}
        onKeyDown={(event) => {
          if (isComposing(event)) return;
          if (event.key === 'Enter' && tidy(text)) {
            // 打ちかけの文字があるときだけ、フォームの送信を止めて付ける（空なら Enter で送信できる）。
            event.preventDefault();
            add(text, false);
          } else if (event.key === 'Backspace' && text === '' && tags.length > 0) {
            event.preventDefault();
            const last = tags[tags.length - 1] ?? '';
            remove(last);
            setText(last);
          }
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData('text');
          if (!hasSeparator(pasted)) return;
          event.preventDefault();
          const input = event.currentTarget;
          add(input.value.slice(0, input.selectionStart ?? 0) + pasted + input.value.slice(input.selectionEnd ?? 0), false);
        }}
        onBlur={() => {
          if (tidy(text)) add(text, false);
        }}
      />
      {offered.length > 0 ? (
        <datalist id={listId}>
          {offered.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
      {name ? tags.map((tag) => <input key={tag} type="hidden" name={name} value={tag} />) : null}
      <span className="g-sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
