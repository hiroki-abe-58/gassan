import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import type { ChartBaseProps, ChartFormat, ChartSeries } from './charts';
import {
  ChartData,
  Description,
  Grid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  besideStyle,
  colorStyle,
  cx,
  seriesColor,
  useFormats,
  useRoving,
  useShell,
  useVisibleSeries,
} from './internal/chart-parts';
import { niceTicks, toLeft, toTop, valueExtent } from './internal/chart-scale';
import { domPassthrough } from './internal/passthrough';
import { useWidth } from './internal/use-width';

export interface ScatterPoint {
  x: number;
  y: number;
  /** 泡の大きさの値（sizeLabel を渡したときに、泡の面積にする）。 */
  size?: number;
  /** 点の名前（「A 社」）。読み上げとツールチップの見出し。省略すると系列の名前。 */
  label?: string;
}

export interface ScatterSeries extends ChartSeries {
  data: readonly ScatterPoint[];
}

export interface ScatterChartProps extends ChartBaseProps {
  /** 系列（点の群れ）。系列ごとに色を変え、凡例で出し入れできる。 */
  series: readonly ScatterSeries[];
  /** 横の軸の名前（「売上」）。軸の見出しと点の読み上げに使う。 */
  xLabel: string;
  /** 縦の軸の名前（「利益率」）。 */
  yLabel: string;
  /** 泡の大きさの名前（「社員数」）。渡すと、点の size を泡の面積にする（泡のグラフ）。 */
  sizeLabel?: string;
  xFormat?: ChartFormat;
  yFormat?: ChartFormat;
  sizeFormat?: ChartFormat;
  /** 描く領域の高さ（px）。既定 280。 */
  height?: number;
  /** 縦と横の範囲に 0 を含める。既定 false（値のある範囲を見せる）。 */
  zero?: boolean;
  /** 凡例を出す。既定は系列が 2 つ以上のとき。 */
  legend?: boolean;
}

interface Placed {
  key: string;
  series: ScatterSeries;
  point: ScatterPoint;
}

const finite = (value: number | undefined): value is number => typeof value === 'number' && Number.isFinite(value);

/** 泡の半径（px）。面積を値に比べるので、半径は値の平方根に比べる。 */
const MIN_RADIUS = 4;
const MAX_RADIUS = 20;
/** 泡を使わない点の半径（px）。 */
const DOT_RADIUS = 5;
/** ポインタからこの距離（px）までの点を指す。 */
const REACH = 24;

/**
 * 散布図と泡のグラフ（2 つの量の関係）。Q-13。
 * 点は横の値の順（同じなら縦の値の順）に 1 つだけが Tab で止まり、矢印でたどると、点の名前と横・縦（・大きさ）の値を読む。
 * ポインタは近い点を指す。軸の名前は目に見せ、読み上げは点の名前に含める。
 */
export function ScatterChart({
  label,
  description,
  table = false,
  series,
  xLabel,
  yLabel,
  sizeLabel,
  xFormat,
  yFormat,
  sizeFormat,
  height = 280,
  zero = false,
  legend,
  className,
  ...rest
}: ScatterChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef, 600);
  const xf = useFormats(xFormat);
  const yf = useFormats(yFormat);
  const sf = useFormats(sizeFormat);
  const { visible, hidden, toggle } = useVisibleSeries(series);
  const colors = new Map(series.map((s, index) => [s.key, seriesColor(s, index)]));
  const colorOf = (s: ChartSeries): string => colors.get(s.key) ?? 'currentColor';

  const placedOf = (list: readonly ScatterSeries[]): Placed[] =>
    list.flatMap((s) =>
      s.data.flatMap((point, index) => (finite(point.x) && finite(point.y) ? [{ key: `${s.key}-${String(index)}`, series: s, point }] : [])),
    );
  // キーでたどる順（横の値の順、同じなら縦の値の順）
  const points = placedOf(visible).sort((a, b) => a.point.x - b.point.x || a.point.y - b.point.y);
  const roving = useRoving(points.length);
  const active = roving.active;

  const xTicks = niceTicks(...valueExtent(points.map((p) => p.point.x), zero), 5);
  const yTicks = niceTicks(...valueExtent(points.map((p) => p.point.y), zero), height < 180 ? 3 : 5);
  const xDomain: [number, number] = [xTicks[0] ?? 0, xTicks.at(-1) ?? 1];
  const yDomain: [number, number] = [yTicks[0] ?? 0, yTicks.at(-1) ?? 1];
  // 泡の大きさは、隠した系列も含めた最大に比べる（凡例で出し入れしても泡の大きさが変わらない）
  const largest = sizeLabel ? Math.max(0, ...series.flatMap((s) => s.data.map((point) => (finite(point.size) ? point.size : 0)))) : 0;
  const radiusOf = (point: ScatterPoint): number =>
    largest > 0 && finite(point.size) ? MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(Math.max(0, point.size) / largest) : DOT_RADIUS;

  const nameOf = ({ series: s, point }: Placed): string =>
    point.label ? (series.length > 1 ? labels.chartGroup(point.label, s.label) : point.label) : s.label;
  const entriesOf = ({ point }: Placed): (readonly [string, string])[] => [
    [xLabel, xf.value(point.x)],
    [yLabel, yf.value(point.y)],
    ...(sizeLabel && finite(point.size) ? [[sizeLabel, sf.value(point.size)] as const] : []),
  ];

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    let nearest: number | null = null;
    let best = REACH * REACH;
    points.forEach((p, index) => {
      const dx = rect.left + (toLeft(p.point.x, xDomain) / 100) * rect.width - event.clientX;
      const dy = rect.top + (toTop(p.point.y, yDomain) / 100) * rect.height - event.clientY;
      const distance = dx * dx + dy * dy;
      if (distance <= best) {
        best = distance;
        nearest = index;
      }
    });
    roving.setHovered(nearest);
  };

  const focus = active === null ? undefined : points[active];

  return (
    <div {...domPassthrough(rest, 'ScatterChart')} {...groupProps} className={cx('g-viz g-scatter', className)}>
      {(legend ?? series.length > 1) ? <Legend series={series} hidden={hidden} onToggle={toggle} shape="dot" /> : null}
      <div className="g-viz-frame" style={{ '--g-viz-height': `${String(height)}px` } as CSSProperties}>
        <span className="g-viz-axis-title" data-axis="y" aria-hidden="true">
          {yLabel}
        </span>
        <YAxis ticks={yTicks} format={yf.axis} />
        <div ref={plotRef} className="g-viz-plot" onPointerMove={onPointerMove} onPointerLeave={() => roving.setHovered(null)}>
          <Grid ticks={yTicks} domain={yDomain} />
          <Grid ticks={xTicks} domain={xDomain} horizontal />
          {points.length === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
          {points.map((p, index) => {
            const left = toLeft(p.point.x, xDomain);
            return (
              <span
                key={p.key}
                role="img"
                aria-label={labels.chartPoint(nameOf(p), entriesOf(p))}
                className="g-scatter-point"
                style={
                  {
                    ...colorStyle(colorOf(p.series)),
                    left: `${String(left)}%`,
                    top: `${String(toTop(p.point.y, yDomain))}%`,
                    '--g-scatter-r': `${String(radiusOf(p.point))}px`,
                    '--g-viz-x': left,
                  } as CSSProperties
                }
                data-active={index === active ? '' : undefined}
                {...roving.hitProps(index)}
              />
            );
          })}
          {focus ? (
            <Tooltip
              title={nameOf(focus)}
              style={besideStyle(toLeft(focus.point.x, xDomain))}
              rows={entriesOf(focus).map(([name, value]) => ({ key: name, label: name, value, color: colorOf(focus.series) }))}
            />
          ) : null}
        </div>
        <XAxis texts={xTicks.map((tick) => xf.axis(tick))} positions={xTicks.map((tick) => toLeft(tick, xDomain))} width={width} />
        <span className="g-viz-axis-title" data-axis="x" aria-hidden="true">
          {xLabel}
        </span>
      </div>
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[labels.chartCategory, xLabel, yLabel, ...(sizeLabel ? [sizeLabel] : [])]}
          rows={placedOf(series).map((p) => [nameOf(p), ...entriesOf(p).map(([, value]) => value), ...(sizeLabel && !finite(p.point.size) ? [labels.noValue] : [])])}
        />
      ) : null}
    </div>
  );
}
