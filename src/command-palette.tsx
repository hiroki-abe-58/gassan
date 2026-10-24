import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react';

import { Kbd } from './display';
import { ModalSearchInput } from './inputs';
import { useControllable } from './internal/controllable';
import { isComposing, warnDuplicateKeys } from './internal/dom';
import { firstEnabled, navigate } from './internal/listbox';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useEvent } from './internal/use-event';
import { useLabels } from './labels';
import { usePhrase } from './phrase';
import { ModalRoot } from './root';
import { normalizeForMatch } from './select';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface CommandItem {
  id: string;
  /** 名前。表示と絞り込みに使い、当てはまった所を太字にする。 */
  label: string;
  /** 補足（行き先・説明）。絞り込みにも使う。 */
  description?: string;
  /** 絞り込みにだけ使う語（別名・英語の名前・読み）。漢字の名前は読み（かな）を入れておくと、変換する前のかなでも当たる。 */
  keywords?: readonly string[];
  /** まとまりの見出し（「ページ」「操作」）。同じまとまりの項目は並べて出す。 */
  group?: string;
  /** 飾りの印。 */
  icon?: ReactNode;
  /** キーの表記（['G', 'M']）。見せるだけで、押しても動かない。 */
  shortcut?: readonly string[];
  disabled?: boolean;
  /** 選んだとき（パレットは先に閉じる）。 */
  onSelect?: () => void;
  /** 選んだら移る行き先。onSelect の後に移る。 */
  href?: string;
}

export interface CommandPaletteProps extends DataAttributes {
  items: readonly CommandItem[];
  /** 開いているか。渡すと制御になる。 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 開くキー（'mod+k'。mod は Apple の端末で ⌘、ほかで Ctrl）。既定 'mod+k'。false で付けない。 */
  hotkey?: string | false;
  /** 検索欄の案内。既定 labels.commandPlaceholder。 */
  placeholder?: string;
  /** パレットの名前（読み上げ）。既定 labels.commandPalette。 */
  label?: string;
  /** 当てはまる項目が無いときに出すもの。既定 labels.commandResults(0)。 */
  empty?: ReactNode;
  /** 閉じた後のフォーカス先。既定は開く前の場所。選んだ項目でページが変わるなら、新しいページの見出しを返す（K-06）。 */
  finalFocus?: RefObject<HTMLElement | null>;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* 絞り込み                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 1 文字ずつ正規化した文字列と、正規化した位置から元の文字の位置への対応。
 * 正規化（全角半角・大文字小文字・かなの種類）で長さが変わっても、当てはまった所を元の文字で示せる。
 */
interface Folded {
  text: string;
  origin: number[];
  chars: string[];
}

function fold(source: string): Folded {
  const chars = [...source];
  let text = '';
  const origin: number[] = [];
  chars.forEach((char, index) => {
    const piece = normalizeForMatch(char);
    text += piece;
    for (let k = 0; k < piece.length; k += 1) origin.push(index);
  });
  return { text, origin, chars };
}

interface Match {
  item: CommandItem;
  /** 0 は当てはまらない。名前の頭 3・名前の中 2・補足と別名 1。打っていなければ全部 1。 */
  score: number;
  /** 名前の中の当てはまった範囲（元の文字の位置）。 */
  range: [number, number] | null;
  label: Folded;
}

function matchItem(item: CommandItem, needle: string): Match {
  const label = fold(item.label);
  if (!needle) return { item, score: 1, range: null, label };
  const at = label.text.indexOf(needle);
  if (at >= 0) {
    const start = label.origin[at] ?? 0;
    const end = (label.origin[at + needle.length - 1] ?? start) + 1;
    return { item, score: at === 0 ? 3 : 2, range: [start, end], label };
  }
  const extra = fold([item.description ?? '', ...(item.keywords ?? [])].join('\n')).text;
  return { item, score: extra.includes(needle) ? 1 : 0, range: null, label };
}

interface Group {
  title: string | undefined;
  matches: Match[];
}

/** 当てはまる項目を、まとまりごとに並べる。打っている間は当てはまり方の強い順（同じなら渡した順）。 */
function arrange(items: readonly CommandItem[], needle: string): Group[] {
  const matched = items.map((item) => matchItem(item, needle)).filter((match) => match.score > 0);
  if (needle) matched.sort((a, b) => b.score - a.score);
  const groups: Group[] = [];
  for (const match of matched) {
    const group = groups.find((candidate) => candidate.title === match.item.group);
    if (group) group.matches.push(match);
    else groups.push({ title: match.item.group, matches: [match] });
  }
  return groups;
}

function Highlighted({ label, range }: { label: Folded; range: [number, number] | null }): ReactNode {
  if (!range) return label.chars.join('');
  const [start, end] = range;
  return (
    <>
      {label.chars.slice(0, start).join('')}
      <mark className="g-command-mark">{label.chars.slice(start, end).join('')}</mark>
      {label.chars.slice(end).join('')}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 開くキー                                                                    */
/* -------------------------------------------------------------------------- */

interface Hotkey {
  key: string;
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

function parseHotkey(text: string): Hotkey {
  const parts = text.toLowerCase().split('+').map((part) => part.trim());
  return {
    key: parts.at(-1) ?? '',
    mod: parts.includes('mod'),
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
  };
}

const isApple = (): boolean => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

function pressed(event: KeyboardEvent, hotkey: Hotkey): boolean {
  const apple = isApple();
  return (
    event.key.toLowerCase() === hotkey.key &&
    event.metaKey === (hotkey.meta || (hotkey.mod && apple)) &&
    event.ctrlKey === (hotkey.ctrl || (hotkey.mod && !apple)) &&
    event.altKey === hotkey.alt &&
    event.shiftKey === hotkey.shift
  );
}

/* -------------------------------------------------------------------------- */
/* CommandPalette                                                             */
/* -------------------------------------------------------------------------- */

/**
 * コマンドパレット。U-27。
 *
 * ⌘K / Ctrl+K で画面の上に開くモーダル。検索欄（combobox）と候補の一覧（listbox）を持ち、フォーカスは検索欄に置いたまま
 * aria-activedescendant で候補を指す（WAI-ARIA APG の combobox）。打った文字は全角半角・大文字小文字・かなの種類を
 * 区別せずに名前・補足・別名と突き合わせ、名前の頭に当てはまるものから並べて、当てはまった所を太字にする。
 * まとまりは見出しのある group にし、当てはまった数を読み上げる。IME の変換中の Enter は確定に使わせる。
 * 選ぶとパレットを閉じてから onSelect を呼び、href があれば移る。閉じるとフォーカスは開く前の場所へ戻る。
 */
export function CommandPalette({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  hotkey = 'mod+k',
  placeholder,
  label,
  empty,
  finalFocus,
  className,
  ...rest
}: CommandPaletteProps): ReactNode {
  const labels = useLabels();
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggle = useEvent(() => setOpen(!isOpen));
  const name = label ?? labels.commandPalette;

  useEffect(() => {
    if (hotkey === false) return undefined;
    const parsed = parseHotkey(hotkey);
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.isComposing || event.defaultPrevented || !pressed(event, parsed)) return;
      event.preventDefault();
      toggle();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey, toggle]);

  useEffect(() => {
    warnDuplicateKeys(
      'CommandPalette',
      'items[].id',
      items.map((item) => item.id),
    );
  }, [items]);

  return (
    <ModalRoot
      {...domPassthrough(rest, 'CommandPalette')}
      open={isOpen}
      onOpenChange={(next) => setOpen(next)}
      kind="view"
      placement="top"
      label={name}
      initialFocus={inputRef}
      finalFocus={finalFocus}
      className={cx('g-command', className)}
    >
      {/* 中身は閉じるたびに作り直す（resetOnClose）ので、開くたびに検索欄は空から始まる */}
      <CommandList
        items={items}
        name={name}
        placeholder={placeholder ?? labels.commandPlaceholder}
        empty={empty}
        inputRef={inputRef}
        onRun={(item) => {
          setOpen(false);
          item.onSelect?.();
          if (item.href) window.location.assign(item.href);
        }}
      />
    </ModalRoot>
  );
}

function CommandList({
  items,
  name,
  placeholder,
  empty,
  inputRef,
  onRun,
}: {
  items: readonly CommandItem[];
  name: string;
  placeholder: string;
  empty: ReactNode;
  inputRef: RefObject<HTMLInputElement | null>;
  onRun: (item: CommandItem) => void;
}): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const listId = `${useId()}-list`;
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  /** 指している項目。絞り込みで並びが変わっても、同じ項目を指し続ける。null なら最初の項目。 */
  const [activeId, setActiveId] = useState<string | null>(null);

  const needle = fold(query.trim()).text;
  const groups = arrange(items, needle);
  const shown = groups.flatMap((group) => group.matches.map((match) => match.item));
  const found = shown.findIndex((item) => item.id === activeId);
  const active = found >= 0 && !shown[found]?.disabled ? found : firstEnabled(shown);
  const indexOf = new Map(shown.map((item, index) => [item.id, index]));
  const optionId = (index: number): string => `${listId}-${String(index)}`;

  useEffect(() => {
    listRef.current?.querySelector('[data-active]')?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (isComposing(event)) return;
    if (event.key === 'Enter') {
      const item = shown[active];
      if (!item) return;
      event.preventDefault();
      onRun(item);
      return;
    }
    // Home / End は検索欄の中の移動に残す（APG の編集できる combobox と同じ）
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'PageDown' && event.key !== 'PageUp') return;
    const next = navigate(event.key, shown, active);
    if (next === null) return;
    event.preventDefault();
    setActiveId(shown[next]?.id ?? null);
  };

  const option = (match: Match): ReactNode => {
    const { item } = match;
    const index = indexOf.get(item.id) ?? -1;
    const id = optionId(index);
    const current = index === active;
    return (
      <div
        key={item.id}
        id={id}
        role="option"
        className="g-command-item"
        aria-selected={current}
        aria-disabled={item.disabled ? true : undefined}
        // 名前は名前の部分だけ。補足は説明として読み、キーの表記は読ませない
        aria-labelledby={`${id}-label`}
        aria-describedby={item.description ? `${id}-description` : undefined}
        data-active={current ? '' : undefined}
        onPointerMove={() => {
          if (!item.disabled && !current) setActiveId(item.id);
        }}
        onClick={() => {
          if (!item.disabled) onRun(item);
        }}
      >
        {item.icon ? (
          <span className="g-command-icon" aria-hidden="true">
            {item.icon}
          </span>
        ) : null}
        <span className="g-command-text">
          <span id={`${id}-label`} className="g-command-label">
            <Highlighted label={match.label} range={match.range} />
          </span>
          {item.description ? (
            <span id={`${id}-description`} className="g-command-description">
              {item.description}
            </span>
          ) : null}
        </span>
        {item.shortcut && item.shortcut.length > 0 ? (
          <span className="g-command-shortcut" aria-hidden="true">
            {item.shortcut.map((key, keyIndex) => (
              <Kbd key={`${key}-${String(keyIndex)}`}>{key}</Kbd>
            ))}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div className="g-command-head">
        <ModalSearchInput
          ref={inputRef}
          role="combobox"
          aria-label={name}
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveId(null);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* 押してもフォーカスを検索欄から奪わない */}
      <div ref={listRef} className="g-command-body" onMouseDown={(event) => event.preventDefault()}>
        <div className="g-command-list" role="listbox" id={listId} aria-label={name}>
          {groups.map((group, groupIndex) =>
            group.title === undefined ? (
              group.matches.map(option)
            ) : (
              <div key={group.title} role="group" aria-labelledby={`${listId}-group-${String(groupIndex)}`} className="g-command-group">
                <div id={`${listId}-group-${String(groupIndex)}`} className="g-command-group-title" role="presentation">
                  {phrase(group.title)}
                </div>
                {group.matches.map(option)}
              </div>
            ),
          )}
        </div>
        {shown.length === 0 ? <p className="g-command-empty">{empty ?? phrase(labels.commandResults(0))}</p> : null}
      </div>
      {/* 当てはまった数は、いつも置いてある領域で読み上げる（打つたびに出し入れすると読まれないことがある） */}
      <p className="g-sr-only g-command-status" role="status">
        {needle ? labels.commandResults(shown.length) : ''}
      </p>
      <div className="g-command-foot" aria-hidden="true">
        <span className="g-command-hint">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          {labels.commandMove}
        </span>
        <span className="g-command-hint">
          <Kbd>Enter</Kbd>
          {labels.commandSelect}
        </span>
        <span className="g-command-hint">
          <Kbd>Esc</Kbd>
          {labels.close}
        </span>
      </div>
    </>
  );
}
