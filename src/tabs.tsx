import { useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import { useControllable } from './internal/controllable';
import { useIndicator } from './internal/indicator';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { usePhrase } from './phrase';

export interface TabItem {
  /** 識別子。 */
  value: string;
  label: ReactNode;
  /** 中身。省略すると、タブだけを並べる（中身は利用者が value で切り替える）。 */
  content?: ReactNode;
  disabled?: boolean;
  /** 名前の後ろに置く印（件数の Badge など）。 */
  badge?: ReactNode;
}

export interface TabsProps extends DataAttributes {
  items: readonly TabItem[];
  /** tablist の名前（何のタブか）。 */
  label: string;
  value?: string;
  /** 既定は最初の使えるタブ。 */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 既定 'automatic'（矢印で移ると同時に選ぶ）。中身を出すのが重いときは 'manual'（Enter / Space で選ぶ）。 */
  activation?: 'automatic' | 'manual';
  /** 既定 'line'（下線が滑る）。'pill' は塗りが滑る。 */
  variant?: 'line' | 'pill';
  className?: string;
}

/**
 * タブ。U-17。WAI-ARIA APG の tabs。
 *
 * tablist の中は選んでいるタブだけが Tab で止まり（roving tabindex）、←→ で隣、Home / End で端へ移る
 * （右から左の言語では ←→ が入れ替わる）。使えないタブは飛ばす。選ぶと印が前の位置から滑って移る（V-05）。
 * 中身は tabpanel で、選んでいないものは hidden で残す（入力中のフォームの値を失わない）。
 */
export function Tabs({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  activation = 'automatic',
  variant = 'line',
  className,
  ...rest
}: TabsProps): ReactNode {
  const phrase = usePhrase();
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = items.filter((item) => !item.disabled);
  const [selected, setSelected] = useControllable<string>(value, defaultValue ?? enabled[0]?.value ?? '', onValueChange);
  /** Tab で止まるタブ（manual では選んでいるタブと別に動く）。 */
  const [focused, setFocused] = useState<string | null>(null);
  const stop = focused !== null && enabled.some((item) => item.value === focused) ? focused : selected;

  useIndicator(listRef, (list) => list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'), selected);

  const tabId = (v: string): string => `${base}-tab-${v}`;
  const panelId = (v: string): string => `${base}-panel-${v}`;

  const move = (target: TabItem | undefined): void => {
    if (!target) return;
    setFocused(target.value);
    if (activation === 'automatic') setSelected(target.value);
    // useId の値はセレクタに使えない文字を含みうるので、id で直接引く。
    document.getElementById(tabId(target.value))?.focus();
  };

  const handleKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const index = enabled.findIndex((item) => item.value === stop);
    const rtl = listRef.current ? getComputedStyle(listRef.current).direction === 'rtl' : false;
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const count = enabled.length;
    if (event.key === forward) move(enabled[(index + 1) % count]);
    else if (event.key === backward) move(enabled[(index - 1 + count) % count]);
    else if (event.key === 'Home') move(enabled[0]);
    else if (event.key === 'End') move(enabled[count - 1]);
    else return;
    event.preventDefault();
  };

  const hasPanels = items.some((item) => item.content !== undefined);

  return (
    <div {...domPassthrough(rest, 'Tabs')} className={className ? `g-tabs ${className}` : 'g-tabs'} data-variant={variant}>
      <div ref={listRef} role="tablist" aria-label={label} className="g-tablist" onKeyDown={handleKey}>
        {/* 選んでいるタブへ滑る印。飾りなので tablist の子でも読ませない。DOM の先頭に置き、タブがその上に描かれる */}
        <span className="g-tab-indicator" aria-hidden="true" />
        {items.map((item) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={tabId(item.value)}
              className="g-tab"
              aria-selected={isSelected}
              aria-controls={hasPanels ? panelId(item.value) : undefined}
              aria-disabled={item.disabled ? true : undefined}
              tabIndex={item.value === stop && !item.disabled ? 0 : -1}
              onFocus={() => setFocused(item.value)}
              onClick={() => {
                if (item.disabled) return;
                setFocused(item.value);
                setSelected(item.value);
              }}
            >
              <span className="g-tab-label">{phrase(item.label)}</span>
              {item.badge}
            </button>
          );
        })}
      </div>
      {hasPanels
        ? items.map((item) => (
            <div
              key={item.value}
              role="tabpanel"
              id={panelId(item.value)}
              className="g-tabpanel"
              aria-labelledby={tabId(item.value)}
              hidden={item.value !== selected}
              tabIndex={0}
            >
              {phrase(item.content)}
            </div>
          ))
        : null}
    </div>
  );
}
