import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { navigate } from '../router';

export interface TabDef {
  id: string;
  label: string;
  render: () => ReactNode;
}

/**
 * URL と同期するタブ（APG の Tabs パターン、自動活性化）。
 *
 * 選択中のタブを state ではなくハッシュに持つ。タブごとに URL があれば、
 * 「API のタブを見て」とリンクで渡せるし、戻るボタンも期待どおりに効く。
 */
export function Tabs({
  tabs,
  current,
  basePath,
  label,
}: {
  tabs: readonly TabDef[];
  current: string | undefined;
  basePath: string;
  label: string;
}): ReactNode {
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);

  // キーボードで移ったときだけ、描き直し後に新しいタブへフォーカスを渡す。
  useEffect(() => {
    if (!active || pendingFocus.current !== active.id) return;
    refs.current.get(active.id)?.focus();
    pendingFocus.current = null;
  }, [active]);

  if (!active) return null;

  const select = (id: string, focus: boolean): void => {
    if (focus) pendingFocus.current = id;
    const path = id === tabs[0]?.id ? basePath : `${basePath}/${id}`;
    navigate(path);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const index = tabs.findIndex((tab) => tab.id === active.id);
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    const target = tabs[next];
    if (!target) return;
    event.preventDefault();
    select(target.id, true);
  };

  return (
    <div className="s-tabs">
      <div className="s-tablist" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) refs.current.set(tab.id, el);
                else refs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className="s-tab"
              onClick={() => select(tab.id, false)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        className="s-tabpanel"
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        tabIndex={0}
      >
        {active.render()}
      </div>
    </div>
  );
}
