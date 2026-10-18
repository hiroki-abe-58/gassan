import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import type { ControlAria } from './fields';
import { useControllable } from './internal/controllable';
import { warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { Popup } from './internal/popup';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

export interface SelectOption {
  value: string;
  /** 表示と文字送り・絞り込みに使う。文字列に限るのは、打った文字と突き合わせるため。 */
  label: string;
  disabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/* 共通: 候補の一覧                                                            */
/* -------------------------------------------------------------------------- */

/** 有効な選択肢を from から step 方向に探す。端で止まる（折り返さない）。 */
function nextEnabled(options: readonly SelectOption[], from: number, step: number): number {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i;
  }
  return from;
}

function firstEnabled(options: readonly SelectOption[], fromEnd = false): number {
  return nextEnabled(options, fromEnd ? options.length : -1, fromEnd ? -1 : 1);
}

/** 一覧を開いている間の上下キー。動いた先の位置を返す。扱わないキーなら null。 */
function navigate(key: string, options: readonly SelectOption[], active: number): number | null {
  switch (key) {
    case 'ArrowDown':
      return nextEnabled(options, active, 1);
    case 'ArrowUp':
      return active < 0 ? firstEnabled(options, true) : nextEnabled(options, active, -1);
    case 'Home':
      return firstEnabled(options);
    case 'End':
      return firstEnabled(options, true);
    case 'PageDown':
      return nextEnabled(options, Math.min(options.length, active + 10) - 1, 1);
    case 'PageUp':
      return nextEnabled(options, Math.max(-1, active - 10) + 1, -1);
    default:
      return null;
  }
}

/** IME で変換中のキーは、確定の Enter も含めて部品が扱わない。 */
function isComposing(event: ReactKeyboardEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}

function useWarnDuplicates(component: string, options: readonly SelectOption[]): void {
  const values = options.map((option) => option.value).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys(component, 'options[].value', values.split('\u0000'));
  }, [component, values]);
}

interface ListboxProps {
  id: string;
  labelledBy: string | undefined;
  options: readonly SelectOption[];
  active: number;
  selected: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  onActive: (index: number) => void;
  onPick: (index: number) => void;
  onDismiss: () => void;
}

/**
 * 候補の一覧。I-02 / I-11 / I-12。
 *
 * フォーカスは起点（ボタンや入力欄）に置いたまま、aria-activedescendant で
 * 「いまどれを指しているか」だけを伝える。押下で起点からフォーカスを奪わないよう、
 * mousedown の既定動作を止める。
 */
function Listbox({ id, labelledBy, options, active, selected, anchorRef, onActive, onPick, onDismiss }: ListboxProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.querySelector('[data-active]')?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);

  return (
    <Popup anchorRef={anchorRef} onDismiss={onDismiss} onMouseDown={(event) => event.preventDefault()}>
      <ul ref={listRef} className="g-listbox" role="listbox" id={id} aria-labelledby={labelledBy}>
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${id}-${String(index)}`}
            className="g-option"
            role="option"
            aria-selected={option.value === selected}
            aria-disabled={option.disabled ? true : undefined}
            data-active={index === active ? '' : undefined}
            onPointerMove={() => {
              if (!option.disabled && index !== active) onActive(index);
            }}
            onClick={() => onPick(index)}
          >
            <Icon name="check" className="g-option-check" />
            <span className="g-option-label">{phrase(option.label)}</span>
          </li>
        ))}
      </ul>
      {options.length === 0 ? (
        <p className="g-listbox-empty" role="status">
          {labels.noResults}
        </p>
      ) : null}
    </Popup>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalSelectProps extends ControlAria, DataAttributes {
  options: readonly SelectOption[];
  /** 選んでいる value。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** 未選択のときの表示。既定は labels.choose。 */
  placeholder?: string;
  disabled?: boolean;
  /** 渡すと hidden input を置き、ネイティブの form 送信に値を載せる。 */
  name?: string;
  className?: string;
}

/**
 * 一覧まで自前で描くセレクト。I-11。
 *
 * WAI-ARIA APG の select-only combobox。フォーカスはボタンに置いたまま、
 * ↑↓ Home End PageUp PageDown で動き、Enter / Space / Tab で決め、Esc で閉じる。
 * 文字を打つと、その文字で始まる選択肢へ飛ぶ（続けて打てば語で、同じ文字なら次へ）。
 *
 * ボタンにしているのは、<label for> がそのまま名前になるため（div では付かない）。
 */
export function ModalSelect({
  options,
  value,
  defaultValue = null,
  onValueChange,
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
}: ModalSelectProps): ReactNode {
  const labels = useLabels();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const listId = `${useId()}-listbox`;
  useWarnDuplicates('Modal.Select', options);

  const selectedIndex = options.findIndex((option) => option.value === selected);
  const current = options[selectedIndex];
  const start = selectedIndex >= 0 ? selectedIndex : firstEnabled(options);

  const show = (index: number): void => {
    setActive(index);
    setOpen(true);
  };
  const pick = (index: number): void => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== selected) setSelected(option.value);
    setOpen(false);
  };

  /** 打った文字で始まる選択肢を探す。同じ文字の連打は「次の候補」。 */
  const typeahead = (key: string, from: number): number => {
    const now = Date.now();
    const text = now - typed.current.at > 500 ? key : typed.current.text + key;
    typed.current = { text, at: now };
    const repeated = [...text].every((char) => char === text[0]);
    const query = (repeated ? key : text).toLocaleLowerCase();
    const offset = repeated ? from + 1 : Math.max(from, 0);
    for (let i = 0; i < options.length; i += 1) {
      const index = (offset + i) % options.length;
      const option = options[index];
      if (option && !option.disabled && option.label.toLocaleLowerCase().startsWith(query)) return index;
    }
    return -1;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    const { key } = event;
    const printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    const typing = Date.now() - typed.current.at <= 500;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) show(start);
      else if (key === 'Home' || key === 'End') show(firstEnabled(options, key === 'End'));
      else if (printable) {
        const found = typeahead(key, selectedIndex);
        show(found >= 0 ? found : start);
      } else return;
      event.preventDefault();
      return;
    }
    if (key === 'Tab') {
      pick(active);
      return;
    }
    if (key === 'Escape') setOpen(false);
    else if (key === 'Enter' || (key === ' ' && !typing) || (key === 'ArrowUp' && event.altKey)) pick(active);
    else if (printable) {
      const found = typeahead(key, active);
      if (found >= 0) setActive(found);
    } else {
      const moved = navigate(key, options, active);
      if (moved === null) return;
      setActive(moved);
    }
    event.preventDefault();
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.Select')}
      ref={anchorRef}
      className={className ? `g-select ${className}` : 'g-select'}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="g-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${String(active)}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show(start))}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      >
        <span className="g-select-value" data-placeholder={current ? undefined : ''}>
          {current ? current.label : (placeholder ?? labels.choose)}
        </span>
        <Icon name="chevronDown" className="g-select-icon" />
      </button>
      {open ? (
        <Listbox
          id={listId}
          labelledBy={ariaLabelledBy ?? id}
          options={options}
          active={active}
          selected={selected}
          anchorRef={anchorRef}
          onActive={setActive}
          onPick={(index) => {
            pick(index);
            triggerRef.current?.focus();
          }}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Combobox                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 絞り込みの比較用に正規化する。全角・半角（NFKC）、大文字・小文字、
 * カタカナ・ひらがなの違いを無視する（「とうきょう」で「トウキョウ」に当たる）。
 */
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

/** 打った文字列を含む候補。空なら全部。 */
function filterOptions(options: readonly SelectOption[], text: string): readonly SelectOption[] {
  const needle = normalizeForMatch(text.trim());
  return needle ? options.filter((option) => normalizeForMatch(option.label).includes(needle)) : options;
}

export interface ModalComboboxProps extends ControlAria, DataAttributes {
  options: readonly SelectOption[];
  /** 選んでいる value。null は未選択。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  /** 入力を空にして離れると null で呼ばれる（選択の解除）。 */
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * 打ちながら候補を絞るセレクト。I-12。
 *
 * WAI-ARIA APG の combobox（list autocomplete）。打つと最初の候補を指し、Enter で決まる。
 * 一覧にない文字列は値にしない。離れたとき、ちょうど一致する候補があればそれを選び、
 * 無ければ選んでいた候補の名前に戻す（打ちかけの文字列を値と取り違えさせない）。
 * IME の変換中の Enter は確定に使わせる（候補を決めない）。
 */
export function ModalCombobox({
  options,
  value,
  defaultValue = null,
  onValueChange,
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
}: ModalComboboxProps): ReactNode {
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue, onValueChange);
  /** 打ちかけの文字列。null なら「選んでいる候補の名前」を出している。 */
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${useId()}-listbox`;
  useWarnDuplicates('Modal.Combobox', options);

  const current = options.find((option) => option.value === selected);
  const shown = filterOptions(options, query ?? '');

  const choose = (option: SelectOption | undefined): void => {
    if (option && !option.disabled && option.value !== selected) setSelected(option.value);
    setQuery(null);
    setOpen(false);
  };

  const commit = (): void => {
    setOpen(false);
    if (query === null) return;
    if (query.trim() === '') {
      if (selected !== null) setSelected(null);
      setQuery(null);
      return;
    }
    const needle = normalizeForMatch(query.trim());
    choose(shown.find((option) => normalizeForMatch(option.label) === needle));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (isComposing(event)) return;
    const { key } = event;
    if (!open) {
      if (key !== 'ArrowDown' && key !== 'ArrowUp') return;
      const index = shown.findIndex((option) => option.value === selected);
      setActive(event.altKey ? -1 : index >= 0 ? index : firstEnabled(shown, key === 'ArrowUp'));
      setOpen(true);
    } else if (key === 'Escape') setOpen(false);
    else if (key === 'Enter') {
      if (active < 0) return;
      choose(shown[active]);
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      setActive(navigate(key, shown, active) ?? active);
    } else return;
    event.preventDefault();
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.Combobox')}
      ref={anchorRef}
      className={className ? `g-input g-combobox ${className}` : 'g-input g-combobox'}
      data-disabled={disabled ? '' : undefined}
    >
      <input
        ref={inputRef}
        type="text"
        id={id}
        className="g-bare"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${String(active)}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        disabled={disabled}
        value={query ?? current?.label ?? ''}
        onChange={(event) => {
          const text = event.target.value;
          setQuery(text);
          setActive(firstEnabled(filterOptions(options, text)));
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
      <button
        type="button"
        className="g-input-action"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          inputRef.current?.focus();
          if (open) {
            setOpen(false);
            return;
          }
          setActive(shown.findIndex((option) => option.value === selected));
          setOpen(true);
        }}
      >
        <Icon name="chevronDown" />
      </button>
      {open ? (
        <Listbox
          id={listId}
          labelledBy={ariaLabelledBy ?? id}
          options={shown}
          active={active}
          selected={selected}
          anchorRef={anchorRef}
          onActive={setActive}
          onPick={(index) => choose(shown[index])}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
      {name ? <input type="hidden" name={name} value={selected ?? ''} /> : null}
    </div>
  );
}
