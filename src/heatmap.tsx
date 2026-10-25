import { useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import type { ChartFormat } from './charts';
import { Description, colorStyle, cx, useFormats, useShell } from './internal/chart-parts';
import { estimateTextWidth, labelStride } from './internal/chart-scale';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useWidth } from './internal/use-width';
import { usePhrase } from './phrase';

export interface HeatmapProps extends DataAttributes {
  /** グラフの名前（表の名前として読む）。 */
  label: string;
  /** 行の見出し（曜日など）。 */
  rows: readonly string[];
  /** 列の見出し（時刻など）。 */
  columns: readonly string[];
  /** 値の行列（rows × columns）。null は「なし」。 */
  values: readonly (readonly (number | null | undefined)[])[];
  /** 主な傾向を言葉で（「平日の 9 時台が最も多い」）。下に出し、説明として読ませる。 */
  description?: ReactNode;
  valueFormat?: ChartFormat;
  /** 値の名前（指した升の表示と、行と列の見出しの左上）。既定 labels.chartValue。 */
  valueLabel?: string;
  /** 色の範囲の下端。既定は値の最小（0 以上の値だけなら 0）。 */
  min?: number;
  /** 色の範囲の上端。既定は値の最大。 */
  max?: number;
  /** 色の段の数（2〜9）。既定 5。 */
  steps?: number;
  /** 升に値を書く。既定 false（色だけ。値は読み上げと、指した升の表示で読める）。 */
  showValues?: boolean;
  /** 色（CSS の色）。既定は --g-chart-1（アクセント）。値を書くなら、濃い段の文字は --g-on-accent になる。 */
  color?: string;
  className?: string;
}

const finite = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value);

/**
 * ヒートマップ（行と列の 2 つの項目で決まる量。曜日 × 時刻のアクセスなど）。Q-15。
 * 行と列の見出しを持つ表（role="grid"）で、升は 1 つだけが Tab で止まり、矢印で上下左右へ、Home / End で行の端へ、
 * Ctrl + Home / End で表の端へ移る。読み上げは升の値に、行と列の見出しが添えられる。色の濃さは段（既定 5 段）で、
 * 指した升の行と列と値を下に出す。
 */
export function Heatmap({
  label,
  rows,
  columns,
  values,
  description,
  valueFormat,
  valueLabel,
  min,
  max,
  steps = 5,
  showValues = false,
  color,
  className,
  ...rest
}: HeatmapProps): ReactNode {
  const { labels, descriptionId } = useShell(label, description);
  const phrase = usePhrase();
  const formats = useFormats(valueFormat);
  const gridRef = useRef<HTMLDivElement>(null);
  const width = useWidth(gridRef, 600);
  const cells = useRef(new Map<string, HTMLElement>());
  const [stop, setStop] = useState<readonly [number, number]>([0, 0]);
  const [focused, setFocused] = useState<readonly [number, number] | null>(null);
  const [hovered, setHovered] = useState<readonly [number, number] | null>(null);

  const numbers = values.flatMap((row) => row.filter(finite));
  const lo = min ?? Math.min(0, ...numbers);
  const hi = max ?? Math.max(lo, ...numbers);
  const count = Math.min(9, Math.max(2, Math.round(steps)));
  /** 値の段（1〜count）。値が無ければ 0。 */
  const stepOf = (value: number | null): number =>
    value === null ? 0 : hi > lo ? 1 + Math.min(count - 1, Math.max(0, Math.floor(((value - lo) / (hi - lo)) * count))) : count;
  /** 段の濃さ（地の色に混ぜるアクセントの割合）。いちばん薄い段も面と見分けられる濃さにする。 */
  const levelOf = (step: number): number => 0.14 + (0.86 * (step - 1)) / (count - 1);
  const valueAt = (r: number, c: number): number | null => {
    const value = values[r]?.[c];
    return finite(value) ? value : null;
  };
  const text = (value: number | null): string => (value === null ? labels.noValue : formats.value(value));

  // 列の見出しは、いちばん長い文字が隣と重ならない本数おきに見せる（隠した見出しも読み上げには残す）
  const rowHeadWidth = Math.max(0, ...rows.map((row) => estimateTextWidth(row, 12))) + 12;
  const stride = labelStride(
    columns.map((column) => estimateTextWidth(column, 12)),
    Math.max(1, (width - rowHeadWidth) / Math.max(1, columns.length)),
    6,
  );

  const lastRow = rows.length - 1;
  const lastColumn = columns.length - 1;
  const tab: readonly [number, number] = [Math.min(stop[0], Math.max(0, lastRow)), Math.min(stop[1], Math.max(0, lastColumn))];
  const go = (r: number, c: number): void => {
    const next = [Math.min(Math.max(r, 0), lastRow), Math.min(Math.max(c, 0), lastColumn)] as const;
    setStop(next);
    cells.current.get(`${String(next[0])}-${String(next[1])}`)?.focus();
  };
  const onKeyDown = (event: ReactKeyboardEvent, r: number, c: number): void => {
    const corner = event.ctrlKey || event.metaKey;
    if (event.key === 'ArrowRight') go(r, c + 1);
    else if (event.key === 'ArrowLeft') go(r, c - 1);
    else if (event.key === 'ArrowDown') go(r + 1, c);
    else if (event.key === 'ArrowUp') go(r - 1, c);
    else if (event.key === 'Home') go(corner ? 0 : r, 0);
    else if (event.key === 'End') go(corner ? lastRow : r, lastColumn);
    else return;
    event.preventDefault();
  };
  const active = focused ?? hovered;
  const activeValue = active ? valueAt(active[0], active[1]) : null;

  return (
    <div {...domPassthrough(rest, 'Heatmap')} className={cx('g-viz g-heatmap', className)} style={color ? colorStyle(color) : undefined}>
      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-describedby={descriptionId}
        className="g-heatmap-grid"
        style={{ '--g-heat-columns': columns.length } as CSSProperties}
        onPointerLeave={() => setHovered(null)}
      >
        <div role="row" className="g-heatmap-row">
          <span role="columnheader" className="g-heatmap-corner">
            <span className="g-sr-only">{valueLabel ?? labels.chartValue}</span>
          </span>
          {columns.map((column, c) => (
            <span key={`c-${String(c)}`} role="columnheader" className="g-heatmap-column" data-active={active?.[1] === c ? '' : undefined}>
              <span className={c % stride === 0 ? undefined : 'g-sr-only'}>{column}</span>
            </span>
          ))}
        </div>
        {rows.map((row, r) => (
          <div key={`r-${String(r)}`} role="row" className="g-heatmap-row">
            <span role="rowheader" className="g-heatmap-row-head" data-active={active?.[0] === r ? '' : undefined}>
              {phrase(row)}
            </span>
            {columns.map((_, c) => {
              const value = valueAt(r, c);
              const step = stepOf(value);
              const key = `${String(r)}-${String(c)}`;
              return (
                <span
                  key={key}
                  ref={(node) => {
                    if (node) cells.current.set(key, node);
                    else cells.current.delete(key);
                  }}
                  role="gridcell"
                  tabIndex={r === tab[0] && c === tab[1] ? 0 : -1}
                  className="g-heatmap-cell"
                  style={step > 0 ? ({ '--g-heat': levelOf(step) } as CSSProperties) : undefined}
                  data-step={step > 0 ? step : undefined}
                  data-strong={step > 0 && levelOf(step) >= 0.6 ? '' : undefined}
                  data-active={active?.[0] === r && active[1] === c ? '' : undefined}
                  onFocus={() => {
                    setFocused([r, c]);
                    setStop([r, c]);
                  }}
                  onBlur={() => setFocused((current) => (current?.[0] === r && current[1] === c ? null : current))}
                  onKeyDown={(event) => onKeyDown(event, r, c)}
                  onPointerEnter={() => setHovered([r, c])}
                >
                  <span className={showValues ? 'g-heatmap-value' : 'g-sr-only'}>{text(value)}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {rows.length === 0 || columns.length === 0 ? <p className="g-viz-none">{labels.noData}</p> : null}
      <div className="g-heatmap-foot" aria-hidden="true">
        <span className="g-heatmap-scale">
          <span>{labels.heatmapLess}</span>
          {Array.from({ length: count }, (_, index) => (
            <span key={`s-${String(index)}`} className="g-heatmap-swatch" style={{ '--g-heat': levelOf(index + 1) } as CSSProperties} />
          ))}
          <span>{labels.heatmapMore}</span>
        </span>
        {active ? (
          <span className="g-heatmap-readout">
            {labels.chartPoint(labels.heatmapCell(rows[active[0]] ?? '', columns[active[1]] ?? ''), [[valueLabel ?? labels.chartValue, text(activeValue)]])}
          </span>
        ) : null}
      </div>
      <Description id={descriptionId}>{description}</Description>
    </div>
  );
}
