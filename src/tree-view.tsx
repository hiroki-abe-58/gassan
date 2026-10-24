import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import { useControllable } from './internal/controllable';
import { warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useTypeahead } from './internal/typeahead';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface TreeNode {
  id: string;
  /** 名前（打った文字で移るときにも使う）。 */
  label: string;
  /** 名前の前の印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
  children?: readonly TreeNode[];
}

export interface TreeViewProps extends DataAttributes {
  /** 木の名前（読み上げ）。 */
  label: string;
  items: readonly TreeNode[];
  /** 選んでいる項目の id。 */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string) => void;
  /** 開いている枝の id。 */
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (ids: string[]) => void;
  className?: string;
}

/** 見えている項目（開いた枝の中まで）を、上から順に並べたもの。 */
interface Visible {
  node: TreeNode;
  parent: string | null;
}

function flatten(nodes: readonly TreeNode[], open: ReadonlySet<string>, parent: string | null, out: Visible[]): Visible[] {
  for (const node of nodes) {
    out.push({ node, parent });
    if (node.children && node.children.length > 0 && open.has(node.id)) flatten(node.children, open, node.id, out);
  }
  return out;
}

function collectIds(nodes: readonly TreeNode[], out: string[]): string[] {
  for (const node of nodes) {
    out.push(node.id);
    if (node.children) collectIds(node.children, out);
  }
  return out;
}

/**
 * ツリー。U-31（WAI-ARIA APG の tree）。
 *
 * role="tree" の中に、名前（aria-labelledby で名前の部分だけ）・深さ・兄弟の数と位置・開閉の状態を持つ treeitem を入れ子に並べる。
 * Tab で止まるのは 1 つ（選んでいる項目か、無ければ最初の項目）。↑↓ で見えている項目を動き、→ で閉じた枝を開く（開いていれば
 * 最初の子へ）、← で開いた枝を閉じる（閉じていれば親へ）。Home / End で最初と最後、文字を打つとその文字で始まる項目へ。
 * Enter・Space・押下で選び、枝なら開閉も切り替える。閉じた枝の中にフォーカスがあったら、見えている親へ移す。
 */
export function TreeView({
  label,
  items,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  className,
  ...rest
}: TreeViewProps): ReactNode {
  const phrase = usePhrase();
  const base = useId();
  const [selected, setSelected] = useControllable<string | null>(selectedProp, defaultSelected, (next) => {
    if (next !== null) onSelectedChange?.(next);
  });
  const [expandedList, setExpanded] = useControllable<readonly string[]>(expandedProp, defaultExpanded, (next) => onExpandedChange?.([...next]));
  const open = new Set(expandedList);
  const visible = flatten(items, open, null, []);
  const [focusId, setFocusId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const moveTo = useRef<string | null>(null);
  const typeahead = useTypeahead();

  const ids = collectIds(items, []).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('TreeView', 'items[].id', ids.split('\u0000'));
  }, [ids]);

  // Tab で止まる項目。フォーカスした項目が閉じた枝の中に隠れたら、見えている一番近い親にする
  const parentOf = new Map<string, string | null>();
  (function walk(nodes: readonly TreeNode[], parent: string | null): void {
    for (const node of nodes) {
      parentOf.set(node.id, parent);
      if (node.children) walk(node.children, node.id);
    }
  })(items, null);
  const isVisible = (id: string): boolean => visible.some((entry) => entry.node.id === id);
  let tabStop = focusId ?? (selected !== null && isVisible(selected) ? selected : (visible[0]?.node.id ?? null));
  while (tabStop !== null && !isVisible(tabStop)) tabStop = parentOf.get(tabStop) ?? null;
  if (tabStop === null) tabStop = visible[0]?.node.id ?? null;

  // キーで動いた先へフォーカスを移す（描いた後に。開いた子はこの時に初めて DOM にある）
  useEffect(() => {
    const id = moveTo.current;
    moveTo.current = null;
    if (id !== null) itemRefs.current.get(id)?.focus();
  });

  const focus = (id: string): void => {
    moveTo.current = id;
    setFocusId(id);
  };
  const toggle = (id: string, next: boolean): void => {
    setExpanded(next ? [...expandedList, id] : expandedList.filter((value) => value !== id));
  };
  const choose = (node: TreeNode): void => {
    setSelected(node.id);
    if (node.children && node.children.length > 0) toggle(node.id, !open.has(node.id));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>): void => {
    const index = visible.findIndex((entry) => entry.node.id === tabStop);
    const current = visible[index];
    if (!current) return;
    const { node, parent } = current;
    const branch = Boolean(node.children && node.children.length > 0);
    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === 'ArrowDown') {
      const next = visible[index + 1];
      if (next) focus(next.node.id);
    } else if (event.key === 'ArrowUp') {
      const previous = visible[index - 1];
      if (previous) focus(previous.node.id);
    } else if (event.key === 'ArrowRight') {
      if (branch && !open.has(node.id)) toggle(node.id, true);
      else if (branch && node.children?.[0]) focus(node.children[0].id);
    } else if (event.key === 'ArrowLeft') {
      if (branch && open.has(node.id)) toggle(node.id, false);
      else if (parent !== null) focus(parent);
    } else if (event.key === 'Home') {
      const first = visible[0];
      if (first) focus(first.node.id);
    } else if (event.key === 'End') {
      const last = visible[visible.length - 1];
      if (last) focus(last.node.id);
    } else if (event.key === 'Enter' || (event.key === ' ' && !typeahead.typing())) {
      choose(node);
    } else if (printable) {
      const found = typeahead.find(
        event.key,
        index,
        visible.map((entry) => entry.node.label),
      );
      const target = visible[found];
      if (target) focus(target.node.id);
    } else {
      return;
    }
    event.preventDefault();
  };

  // 名前の id は位置から作る（項目の id に空白などがあっても aria-labelledby を壊さない）
  const renderNodes = (nodes: readonly TreeNode[], level: number, path: string): ReactNode =>
    nodes.map((node, index) => {
      const branch = Boolean(node.children && node.children.length > 0);
      const isOpen = branch && open.has(node.id);
      const labelId = `${base}${path}-${String(index)}`;
      return (
        <li
          key={node.id}
          ref={(element) => {
            if (element) itemRefs.current.set(node.id, element);
            else itemRefs.current.delete(node.id);
          }}
          role="treeitem"
          className="g-tree-item"
          aria-labelledby={labelId}
          aria-level={level}
          aria-setsize={nodes.length}
          aria-posinset={index + 1}
          aria-expanded={branch ? isOpen : undefined}
          aria-selected={selected === node.id}
          tabIndex={node.id === tabStop ? 0 : -1}
          onFocus={(event) => {
            // 中の子の項目へのフォーカスが、外側の枝まで届いて上書きしないように
            if (event.target === event.currentTarget) setFocusId(node.id);
          }}
        >
          <span
            className="g-tree-row"
            style={{ '--g-tree-level': level - 1 } as CSSProperties}
            onClick={() => {
              focus(node.id);
              choose(node);
            }}
          >
            <span className="g-tree-toggle" aria-hidden="true">
              {branch ? <Icon name="chevronRight" /> : null}
            </span>
            {node.icon ? <span className="g-tree-icon">{node.icon}</span> : null}
            <span id={labelId} className="g-tree-label">
              {phrase(node.label)}
            </span>
          </span>
          {isOpen && node.children ? (
            <ul role="group" className="g-tree-group">
              {renderNodes(node.children, level + 1, `${path}-${String(index)}`)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <ul {...domPassthrough(rest, 'TreeView')} role="tree" aria-label={label} className={cx('g-tree', className)} onKeyDown={onKeyDown}>
      {renderNodes(items, 1, '')}
    </ul>
  );
}
