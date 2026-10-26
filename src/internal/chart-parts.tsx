import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import type { ChartFormat, ChartSeries, ChartValue } from '../charts';
import { ModalTable } from '../fields';
import { useLabels } from '../labels';
import { usePhrase } from '../phrase';
import { estimateTextWidth, placeAxisLabels, toLeft, toTop } from './chart-scale';

/*
 * グラフの部品が共有する小物（Q-01・Q-02・Q-09〜Q-11）。名前と説明の器・点をたどるキー操作・凡例・ツールチップ・
 * 元データの表・目盛り。グラフごとのファイル（charts.tsx・scatter-chart.tsx など）から使う。
 */

export const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export const toNumber = (value: ChartValue): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const isNumber = (value: number | null): value is number => value !== null;

/** 条件に合う最後の位置（ES2023 の findLastIndex の代わり。型の lib は ES2022 まで）。 */
export function lastIndexWhere<T>(items: readonly T[], match: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item !== undefined && match(item)) return index;
  }
  return -1;
}

/** 系列の色。渡した順の位置で決めるので、凡例で隠しても他の系列の色は変わらない。 */
export const seriesColor = (series: ChartSeries, index: number): string =>
  series.color ?? `var(--g-chart-${String((index % 8) + 1)})`;

export const colorStyle = (color: string): CSSProperties => ({ '--g-viz-color': color }) as CSSProperties;

export function makeFormat(locale: string, format: ChartFormat | undefined, base: Intl.NumberFormatOptions): (value: number) => string {
  if (typeof format === 'function') return format;
  const intl = new Intl.NumberFormat(locale, { ...base, ...format });
  return (value) => intl.format(value);
}

export function useFormats(valueFormat: ChartFormat | undefined, axisFormat?: ChartFormat): { value: (v: number) => string; axis: (v: number) => string } {
  const { locale } = useLabels();
  const value = makeFormat(locale, valueFormat, {});
  // 関数の書式は短くできないので、目盛りにもそのまま使う
  const axis =
    axisFormat === undefined && typeof valueFormat === 'function'
      ? value
      : makeFormat(locale, axisFormat ?? valueFormat, { notation: 'compact', maximumFractionDigits: 1 });
  return { value, axis };
}

/** 割合の書式（「38.2%」）。 */
export function usePercent(): (ratio: number) => string {
  const { locale } = useLabels();
  const intl = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  return (ratio) => intl.format(ratio);
}

/** 凡例で隠した系列。最後の 1 つは隠さない（何も描かれないグラフにしない）。Q-11。 */
export function useVisibleSeries<S extends ChartSeries>(series: readonly S[]): {
  visible: readonly S[];
  hidden: ReadonlySet<string>;
  toggle: (key: string) => void;
} {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = (key: string): void => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else if (series.filter((s) => !next.has(s.key)).length > 1) next.add(key);
      return next;
    });
  };
  const visible = series.filter((s) => !hidden.has(s.key));
  return { visible: visible.length > 0 ? visible : series.slice(0, 1), hidden, toggle };
}

export interface Roving {
  active: number | null;
  setHovered: (index: number | null) => void;
  hitProps: (index: number) => {
    ref: (node: HTMLElement | null) => void;
    tabIndex: number;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (event: ReactKeyboardEvent) => void;
  };
}

/**
 * 点をたどるキー操作（Q-02）。点は 1 つだけが Tab で止まり（ロービング）、矢印・Home・End で移る。
 * フォーカスのある点とポインタの乗った点を分けて持ち、フォーカスを優先して示す。
 * initial は最初に Tab で止まる点（稼働の帯は、いちばん新しい今日から）。
 */
export function useRoving(count: number, initial = 0): Roving {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [tabStop, setTabStop] = useState(initial);
  const [focused, setFocused] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const stop = Math.min(tabStop, Math.max(0, count - 1));
  const go = (index: number): void => {
    const next = Math.min(Math.max(index, 0), count - 1);
    setTabStop(next);
    refs.current[next]?.focus();
  };
  const onKeyDown = (event: ReactKeyboardEvent, index: number): void => {
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
    if (step !== undefined) go(index + step);
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(count - 1);
    else return;
    event.preventDefault();
  };
  const at = (index: number | null): number | null => (index === null || index >= count ? null : index);
  return {
    active: at(focused) ?? at(hovered),
    setHovered,
    hitProps: (index) => ({
      ref: (node) => {
        refs.current[index] = node;
      },
      tabIndex: index === stop ? 0 : -1,
      onFocus: () => {
        setFocused(index);
        setTabStop(index);
      },
      onBlur: () => setFocused((current) => (current === index ? null : current)),
      onKeyDown: (event) => onKeyDown(event, index),
    }),
  };
}

/**
 * 凡例。系列が 2 つ以上なら押して出し入れするボタン（aria-pressed）、1 つなら印と名前だけ。Q-11。
 * 出し入れできない凡例（増加・減少・合計のような色の意味）は interactive={false} で、印と名前だけにする。
 */
export function Legend({
  series,
  hidden = new Set<string>(),
  onToggle,
  shape,
  interactive = series.length > 1,
}: {
  series: readonly (ChartSeries & { shape?: 'line' | 'square' | 'dot' })[];
  hidden?: ReadonlySet<string>;
  onToggle?: (key: string) => void;
  shape: 'line' | 'square' | 'dot';
  interactive?: boolean;
}): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  return (
    <ul className="g-viz-legend" aria-label={labels.legend}>
      {series.map((s, index) => {
        const swatch = <span className="g-viz-swatch" data-shape={s.shape ?? shape} aria-hidden="true" />;
        return (
          <li key={s.key} style={colorStyle(seriesColor(s, index))}>
            {interactive && onToggle ? (
              <button type="button" className="g-viz-legend-item" aria-pressed={!hidden.has(s.key)} onClick={() => onToggle(s.key)}>
                {swatch}
                {phrase(s.label)}
              </button>
            ) : (
              <span className="g-viz-legend-item">
                {swatch}
                {phrase(s.label)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
}

/** ツールチップ。同じ値は点の名前で読み上げるので、飾り（aria-hidden）にする。Q-02。 */
export function Tooltip({ title, rows, style }: { title: string; rows: readonly TooltipRow[]; style: CSSProperties }): ReactNode {
  return (
    <div className="g-viz-tooltip" style={style} aria-hidden="true">
      <div className="g-viz-tooltip-title">{title}</div>
      <ul>
        {rows.map((row) => (
          <li key={row.key} style={colorStyle(row.color)}>
            <span className="g-viz-swatch" />
            <span className="g-viz-tooltip-label">{row.label}</span>
            <span className="g-viz-tooltip-value">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 点の横の位置から、ツールチップを右に出すか左に出すか。 */
export const besideStyle = (at: number): CSSProperties =>
  at <= 55 ? { left: `calc(${String(at)}% + 12px)` } : { right: `calc(${String(100 - at)}% + 12px)` };

/** 元データの表（「元データを表示」で開く）。Q-01。 */
export function ChartData({ label, head, rows }: { label: string; head: readonly string[]; rows: readonly (readonly string[])[] }): ReactNode {
  const labels = useLabels();
  return (
    <details className="g-chart-data">
      <summary>{labels.chartData}</summary>
      <ModalTable label={labels.chartTable(label)}>
        <table>
          <thead>
            <tr>
              {head.map((cell, column) => (
                <th key={`h-${String(column)}`} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`r-${String(rowIndex)}`}>
                {row.map((cell, column) =>
                  column === 0 ? (
                    <th key={`c-${String(column)}`} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={`c-${String(column)}`}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ModalTable>
    </details>
  );
}

/**
 * 縦の目盛りの文字。目盛りは等間隔なので、上下に文字の高さの半分はみ出した列に均等に並べると線にそろう。
 * 上から大きい順に置く（column-reverse で並びを逆にしない。§5 の決まり）。
 */
export function YAxis({ ticks, format, side }: { ticks: readonly number[]; format: (value: number) => string; side?: 'end' }): ReactNode {
  return (
    <div className="g-viz-y" aria-hidden="true" data-side={side}>
      {[...ticks].reverse().map((tick) => (
        <span key={tick}>{format(tick)}</span>
      ))}
    </div>
  );
}

export function Grid({ ticks, domain, horizontal }: { ticks: readonly number[]; domain: readonly [number, number]; horizontal?: boolean }): ReactNode {
  return (
    <div className="g-viz-grid" aria-hidden="true" data-axis={horizontal ? 'x' : undefined}>
      {ticks.map((tick) => (
        <span
          key={tick}
          style={horizontal ? { left: `${String(toLeft(tick, domain))}%` } : { top: `${String(toTop(tick, domain))}%` }}
          data-zero={tick === 0 ? '' : undefined}
        />
      ))}
    </div>
  );
}

/**
 * 横の目盛りの文字（Q-10）。いちばん長い文字が隣と重ならない本数おきに出し、器からはみ出す文字は端へ寄せる
 * （線のグラフでは最初と最後の点が端にあるので、端の文字は内側へ寄る）。
 */
export function XAxis({ texts, positions, width }: { texts: readonly string[]; positions: readonly number[]; width: number }): ReactNode {
  const labels = placeAxisLabels(
    texts.map((text) => estimateTextWidth(text, 12)),
    positions,
    width,
  );
  return (
    <div className="g-viz-x" aria-hidden="true">
      {labels.map(({ index, edge }) => (
        <span
          key={`x-${String(index)}`}
          style={{ left: edge === 'start' ? '0%' : edge === 'end' ? '100%' : `${String(positions[index] ?? 0)}%` }}
          data-edge={edge}
        >
          {texts[index]}
        </span>
      ))}
    </div>
  );
}

/**
 * 項目ごとの帯の当たりの領域（棒・ウォーターフォール・パレート図）。帯は描く領域を項目の数で等分し、1 つだけが Tab で止まる。
 * 横の棒は帯を縦に積む。
 */
export function BandHits({
  count,
  roving,
  labelOf,
  horizontal = false,
}: {
  count: number;
  roving: Roving;
  labelOf: (index: number) => string;
  horizontal?: boolean;
}): ReactNode {
  return (
    <div className="g-viz-hits">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`h-${String(index)}`}
          role="img"
          aria-label={labelOf(index)}
          className="g-viz-hit"
          style={
            horizontal
              ? { top: `${String((index / count) * 100)}%`, height: `${String(100 / count)}%` }
              : { left: `${String((index / count) * 100)}%`, width: `${String(100 / count)}%` }
          }
          data-active={index === roving.active ? '' : undefined}
          {...roving.hitProps(index)}
        />
      ))}
    </div>
  );
}

/** ポインタの位置から、乗っている帯を指す（帯は描く領域の等分）。 */
export function bandPointer(count: number, roving: Roving, horizontal = false): (event: ReactPointerEvent<HTMLElement>) => void {
  return (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = horizontal ? rect.height : rect.width;
    if (size <= 0 || count === 0) return;
    const ratio = horizontal ? (event.clientY - rect.top) / size : (event.clientX - rect.left) / size;
    roving.setHovered(Math.min(count - 1, Math.max(0, Math.floor(ratio * count))));
  };
}

export interface ChartShell {
  labels: ReturnType<typeof useLabels>;
  descriptionId: string | undefined;
  groupProps: {
    role: 'group';
    'aria-roledescription': string;
    'aria-label': string;
    'aria-describedby': string | undefined;
  };
}

/** グラフの器の名前と説明（Q-01）。roleDescription は既定で labels.chart（「グラフ」）。 */
export function useShell(label: string, description: ReactNode, roleDescription?: string): ChartShell {
  const labels = useLabels();
  const descriptionId = `${useId()}-description`;
  const described = description !== undefined && description !== null && description !== false;
  return {
    labels,
    descriptionId: described ? descriptionId : undefined,
    groupProps: {
      role: 'group',
      'aria-roledescription': roleDescription ?? labels.chart,
      'aria-label': label,
      'aria-describedby': described ? descriptionId : undefined,
    },
  };
}

export function Description({ id, children }: { id: string | undefined; children: ReactNode }): ReactNode {
  const phrase = usePhrase();
  if (!id) return null;
  return (
    <p id={id} className="g-viz-description">
      {phrase(children)}
    </p>
  );
}
