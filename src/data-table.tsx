import { useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { Button } from './button';
import { Skeleton } from './feedback';
import { useControllable } from './internal/controllable';
import { warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useScrollbars } from './internal/scrollbars';
import { SelectBox } from './internal/select-box';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 並べ替えに使える値。空（null / undefined）は向きにかかわらず最後に並べる。 */
export type DataTableSortValue = string | number | Date | null | undefined;

export interface DataTableColumn<T> {
  /** 列の識別子。並べ替えの鍵にもなる。 */
  key: string;
  /** 列の見出し。 */
  header: ReactNode;
  /** セルの中身。 */
  cell: (row: T) => ReactNode;
  /**
   * 並べ替えに使う値。渡すと見出しが並べ替えのボタンになり、表の中で並べ替える。
   * 文字は言語の照合順で並ぶが、漢字は読みの順にならない。日本語の名前を読みの順に並べるなら、読み（かな）を返す。
   */
  sortValue?: (row: T) => DataTableSortValue;
  /** サーバーで並べ替えるときに true。見出しはボタンになり、onSortChange を呼ぶだけで行の順は変えない。 */
  sortable?: boolean;
  /** 揃え。数と金額は 'end'。既定 'start'。 */
  align?: 'start' | 'center' | 'end';
  /** 行の見出し（th scope="row"）にする列。既定は最初の列。行を選ぶチェックボックスの名前にもなる。 */
  rowHeader?: boolean;
  /** 列の幅（'12rem'・'20%'）。 */
  width?: string;
  /** セルの中で折り返す。既定はセルを 1 行で出し、器より広ければ表を横に送る。説明のような長い文の列だけ true にする。 */
  wrap?: boolean;
}

export interface DataTableSort {
  key: string;
  direction: 'ascending' | 'descending';
}

export interface DataTableProps<T> extends DataAttributes {
  /** 表の名前（caption）。見出しが表の上にあっても、表そのものの名前として要る。読み上げだけに出す。 */
  label: string;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  /** 行の識別子。選択の値と、React の key になる。 */
  getRowId: (row: T) => string;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  /** 行を選べるようにする（先頭にチェックボックスの列を置く）。 */
  selectable?: boolean;
  /** その行を選べるか（自分の行など、操作の対象にできない行は false）。選べない行にはチェックボックスを置かない。 */
  canSelect?: (row: T) => boolean;
  /** 選んでいる行の id。 */
  selected?: readonly string[];
  defaultSelected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  /** 選んだ行への操作。「N 件を選択中」の横に出す。 */
  bulkActions?: (ids: string[]) => ReactNode;
  /** 行の端の操作（Menu・ボタンなど）。いくつ並べても 1 行に収め、端にそろえる。 */
  rowActions?: (row: T) => ReactNode;
  /** 行が無いときに出すもの（EmptyState など）。既定は labels.emptyTable。 */
  empty?: ReactNode;
  /** 読み込み中。行の代わりに骨組みを出し、表を aria-busy にする。 */
  loading?: boolean;
  /** 読み込み中の骨組みの行の数。既定 5。 */
  loadingRows?: number;
  /** 行の詰まり具合。既定 'comfortable'。 */
  density?: 'comfortable' | 'compact';
  className?: string;
}

/**
 * データの表。U-26。
 *
 * table 要素のまま描く（行と列の見出し・caption・aria-sort）。セルの中の操作（リンク・ボタン・チェックボックス）は
 * Tab で順に辿れるので、grid の役割は使わない。並べ替えは見出しの中のボタンで、並べている列だけに aria-sort を付け、
 * 並べ替えたことを読み上げる。行を選ぶ列のチェックボックスは、行の見出しのセルを名前にする（「佐藤 花 を選ぶ」）。
 * 器より広いときは表だけを横に送り、そのときだけ送る領域をフォーカスできるようにする（B-13）。
 * 行の間は 1px の線、囲みは外側の 1px の線と角丸だけ（§5 の 21）。
 */
export function DataTable<T>({
  label,
  columns,
  rows,
  getRowId,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  selectable = false,
  canSelect,
  selected: selectedProp,
  defaultSelected = [],
  onSelectedChange,
  bulkActions,
  rowActions,
  empty,
  loading = false,
  loadingRows = 5,
  density = 'comfortable',
  className,
  ...rest
}: DataTableProps<T>): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const base = useId();
  const captionId = `${base}-caption`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const bars = useScrollbars(scrollRef, { axes: ['x'] });
  const [overflowing, setOverflowing] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [sortState, setSortState] = useState<DataTableSort | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : sortState;
  const [selected, setSelected] = useControllable<readonly string[]>(
    selectedProp,
    defaultSelected,
    onSelectedChange ? (next) => onSelectedChange([...next]) : undefined,
  );

  const ids = rows.map(getRowId);
  const idKey = ids.join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('DataTable', 'getRowId', idKey.split('\u0000'));
  }, [idKey]);

  // 器より広いときだけ、横に送る領域をフォーカスできるようにする（狭くないのに Tab の止まり先を増やさない）
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || typeof ResizeObserver === 'undefined') return undefined;
    const measure = (): void => setOverflowing(scroll.scrollWidth > scroll.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroll);
    const table = scroll.firstElementChild;
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, []);

  const collator = useMemo(() => new Intl.Collator(labels.locale, { numeric: true, sensitivity: 'base' }), [labels.locale]);
  const shown = useMemo(() => {
    const column = sort ? columns.find((candidate) => candidate.key === sort.key) : undefined;
    const value = column?.sortValue;
    if (!sort || !value) return rows;
    const factor = sort.direction === 'ascending' ? 1 : -1;
    const compare = (a: DataTableSortValue, b: DataTableSortValue): number => {
      if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return collator.compare(String(a), String(b));
    };
    return rows
      .map((row, index) => ({ row, index, key: value(row) }))
      .sort((x, y) => {
        const xEmpty = x.key === null || x.key === undefined || x.key === '';
        const yEmpty = y.key === null || y.key === undefined || y.key === '';
        if (xEmpty || yEmpty) return xEmpty === yEmpty ? x.index - y.index : xEmpty ? 1 : -1;
        return factor * compare(x.key, y.key) || x.index - y.index;
      })
      .map((entry) => entry.row);
  }, [rows, columns, sort, collator]);

  // 見えていて、選べる行だけを「すべて選択」の対象にする
  const isSelectable = (row: T): boolean => canSelect?.(row) !== false;
  const shownIds = shown.filter(isSelectable).map(getRowId);
  const selectedSet = new Set(selected);
  const selectedHere = shownIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = shownIds.length > 0 && selectedHere === shownIds.length;
  const someSelected = selectedHere > 0 && !allSelected;
  const rowHeaderIndex = Math.max(
    0,
    columns.findIndex((column) => column.rowHeader),
  );
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  const updateSelection = (next: string[]): void => {
    setSelected(next);
    setAnnouncement(labels.selectedCount(next.length));
  };

  const toggleAll = (checked: boolean): void => {
    const visible = new Set(shownIds);
    updateSelection(checked ? [...selected.filter((id) => !visible.has(id)), ...shownIds] : selected.filter((id) => !visible.has(id)));
  };

  const toggleRow = (id: string, checked: boolean): void => {
    updateSelection(checked ? [...selected, id] : selected.filter((other) => other !== id));
  };

  const changeSort = (column: DataTableColumn<T>, event: MouseEvent<HTMLButtonElement>): void => {
    const direction: DataTableSort['direction'] = sort?.key === column.key && sort.direction === 'ascending' ? 'descending' : 'ascending';
    const next = { key: column.key, direction };
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
    setAnnouncement(labels.sortedBy(event.currentTarget.textContent ?? column.key, direction));
  };

  const headerCell = (column: DataTableColumn<T>): ReactNode => {
    const sortable = Boolean(column.sortValue) || column.sortable === true;
    const active = sort?.key === column.key;
    return (
      <th
        key={column.key}
        scope="col"
        data-align={column.align === 'start' ? undefined : column.align}
        style={column.width ? { inlineSize: column.width } : undefined}
        aria-sort={active && sortable ? sort.direction : undefined}
      >
        {sortable ? (
          <button type="button" className="g-data-table-sort" data-active={active ? '' : undefined} onClick={(event) => changeSort(column, event)}>
            <span>{phrase(column.header)}</span>
            <Icon name={active ? (sort.direction === 'ascending' ? 'arrowUp' : 'arrowDown') : 'sort'} className="g-data-table-sort-icon" />
          </button>
        ) : (
          phrase(column.header)
        )}
      </th>
    );
  };

  const body = ((): ReactNode => {
    if (loading) {
      return Array.from({ length: loadingRows }, (_, index) => (
        // 骨組みは飾り。読み上げは表の aria-busy に任せる
        <tr key={`g-loading-${String(index)}`} aria-hidden="true" data-loading="">
          {selectable ? <td className="g-data-table-select" /> : null}
          {columns.map((column) => (
            <td key={column.key} data-align={column.align === 'start' ? undefined : column.align}>
              <Skeleton width={column.align === 'end' ? '4em' : '70%'} />
            </td>
          ))}
          {rowActions ? <td className="g-data-table-actions" /> : null}
        </tr>
      ));
    }
    if (shown.length === 0) {
      return (
        <tr>
          <td className="g-data-table-empty" colSpan={columnCount}>
            {empty ?? phrase(labels.emptyTable)}
          </td>
        </tr>
      );
    }
    return shown.map((row, rowIndex) => {
      const id = getRowId(row);
      const isSelected = selectedSet.has(id);
      const headerId = `${base}-row-${String(rowIndex)}`;
      return (
        <tr key={id} data-selected={isSelected ? '' : undefined}>
          {selectable ? (
            <td className="g-data-table-select">
              {isSelectable(row) ? (
                <SelectBox className="g-data-table-check" checked={isSelected} onChange={(checked) => toggleRow(id, checked)} labelledBy={headerId} />
              ) : null}
            </td>
          ) : null}
          {columns.map((column, columnIndex) => {
            const align = column.align === 'start' ? undefined : column.align;
            const wrap = column.wrap ? '' : undefined;
            return columnIndex === rowHeaderIndex ? (
              <th key={column.key} id={headerId} scope="row" data-align={align} data-wrap={wrap}>
                {phrase(column.cell(row))}
              </th>
            ) : (
              <td key={column.key} data-align={align} data-wrap={wrap}>
                {phrase(column.cell(row))}
              </td>
            );
          })}
          {rowActions ? (
            <td className="g-data-table-actions">
              <div className="g-data-table-row-actions">{rowActions(row)}</div>
            </td>
          ) : null}
        </tr>
      );
    });
  })();

  return (
    <div {...domPassthrough(rest, 'DataTable')} className={cx('g-data-table', className)} data-density={density === 'compact' ? 'compact' : undefined}>
      {selected.length > 0 ? (
        <div className="g-data-table-bulk">
          <p className="g-data-table-count">{phrase(labels.selectedCount(selected.length))}</p>
          {bulkActions ? <div className="g-data-table-bulk-actions">{bulkActions([...selected])}</div> : null}
          <Button variant="tertiary" size="sm" onClick={() => updateSelection([])}>
            {labels.clearSelection}
          </Button>
        </div>
      ) : null}
      {/* 横に送る窓と、自前のバー（U-35）を重ねる器 */}
      <div className="g-scroll">
        <div
          ref={scrollRef}
          className="g-data-table-scroll g-scroll-viewport"
          role={overflowing ? 'region' : undefined}
          aria-labelledby={overflowing ? captionId : undefined}
          tabIndex={overflowing ? 0 : undefined}
        >
          <table aria-busy={loading || undefined}>
            <caption id={captionId} className="g-sr-only">
              {label}
            </caption>
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" className="g-data-table-select">
                    <span className="g-sr-only">{labels.selectRows}</span>
                    <SelectBox
                      className="g-data-table-check"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label={labels.selectAll}
                    />
                  </th>
                ) : null}
                {columns.map(headerCell)}
                {rowActions ? (
                  <th scope="col" className="g-data-table-actions">
                    <span className="g-sr-only">{labels.rowActions}</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>{body}</tbody>
          </table>
        </div>
        {bars}
      </div>
      {/* 並べ替えと選んだ数は、目に見える文とは別に、いつも置いてある領域で読み上げる（出し入れする要素では読まれないことがある） */}
      <p className="g-sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
