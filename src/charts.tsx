import { useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import type { StatusTone } from './display';
import {
  BandHits,
  ChartData,
  Description,
  Grid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  bandPointer,
  besideStyle,
  colorStyle,
  cx,
  isNumber,
  lastIndexWhere,
  seriesColor,
  toNumber,
  useFormats,
  usePercent,
  useRoving,
  useShell,
  useVisibleSeries,
} from './internal/chart-parts';
import {
  arcLengths,
  areaPath,
  linearPath,
  monotonePath,
  niceTicks,
  pointAt,
  segmentsOf,
  toLeft,
  toTop,
  valueExtent,
  type Point,
} from './internal/chart-scale';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useWidth } from './internal/use-width';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

/*
 * グラフ。Q-01〜Q-12。
 *
 * 線と面だけを SVG（viewBox="0 0 100 100" を縦横に伸ばし、線の太さは vector-effect で保つ）で描き、
 * 目盛りの文字・点・棒・ツールチップ・当たりの領域は HTML を % の位置に置く。形を決めるのに要素の大きさを測らないので、
 * サーバーで描いた形がそのまま出て、器の幅が変わっても描き直さずに伸び縮みする。測るのは、横の目盛りの文字を
 * 間引く本数を決める幅だけ（測れない間は 600px とみなす）。
 */

/* -------------------------------------------------------------------------- */
/* 共通                                                                        */
/* -------------------------------------------------------------------------- */

export type ChartValue = string | number | null | undefined;
/** グラフの 1 行。x で決めたキーが項目、series の key が値。 */
export type ChartRow = Readonly<Record<string, ChartValue>>;

export interface ChartSeries {
  /** 行のどのキーの値を描くか。 */
  key: string;
  /** 凡例・ツールチップ・読み上げの名前。 */
  label: string;
  /** 色（CSS の色）。既定は --g-chart-1〜8 を順に使う（1 はアクセント）。 */
  color?: string;
}

/** 数の書式。Intl.NumberFormat の設定か、数を文字にする関数。 */
export type ChartFormat = Intl.NumberFormatOptions | ((value: number) => string);

/** どのグラフにもある props。 */
export interface ChartBaseProps extends DataAttributes {
  /** グラフの名前（読み上げ）。器の見出しと同じ語でよい。 */
  label: string;
  /** 主な傾向を言葉で（「3月が最大、以降は横ばい」）。グラフの下に出し、説明として読ませる。Q-01。 */
  description?: ReactNode;
  /** 元データを表で開けるようにする（「元データを表示」）。既定 false。Q-01。 */
  table?: boolean;
  className?: string;
}

/** 項目と値の軸を持つグラフ（LineChart・BarChart）の props。 */
export interface CartesianChartProps extends ChartBaseProps {
  data: readonly ChartRow[];
  /** 項目（横の軸）のキー。 */
  x: string;
  series: readonly ChartSeries[];
  /** 項目の見せ方。既定は値をそのまま文字にする。 */
  xFormat?: (value: ChartValue, index: number) => string;
  /** 値の書式（ツールチップ・読み上げ・表）。既定は labels.locale の桁区切り。 */
  valueFormat?: ChartFormat;
  /** 目盛りの書式。既定は valueFormat を短く（1.2万・12K）。 */
  axisFormat?: ChartFormat;
  /** 描く領域の高さ（px）。既定 240。 */
  height?: number;
  /** 系列を積み上げる。既定 false。 */
  stacked?: boolean;
  /** 凡例を出す。既定は系列が 2 つ以上のとき。系列が 2 つ以上なら、押して出し入れできる。Q-11。 */
  legend?: boolean;
  /** 元データの表の、項目の列の見出し。既定 labels.chartCategory。 */
  xLabel?: string;
}

/** 積み上げ。系列ごとに、下の系列までの合計（base）と自分を足した値（top）を返す。欠けた値は 0 として積む。 */
function stackValues(values: readonly (readonly (number | null)[])[], length: number): { tops: (number | null)[][]; bases: number[][] } {
  const sums = new Array<number>(length).fill(0);
  const tops: (number | null)[][] = [];
  const bases: number[][] = [];
  for (const row of values) {
    bases.push([...sums]);
    tops.push(
      row.map((value, index) => {
        if (value === null) return null;
        sums[index] = (sums[index] ?? 0) + value;
        return sums[index] ?? 0;
      }),
    );
  }
  return { tops, bases };
}

/* -------------------------------------------------------------------------- */
/* LineChart                                                                  */
/* -------------------------------------------------------------------------- */

export interface LineChartProps extends CartesianChartProps {
  /** 線の下を塗る（面のグラフ）。既定 false。 */
  area?: boolean;
  /** 'smooth'（既定。点と点の間で行き過ぎない曲線）か 'linear'。 */
  curve?: 'smooth' | 'linear';
  /** 点を描く。既定は項目が 24 個以下のとき。指している点はいつも描く。 */
  points?: boolean;
  /** 縦の範囲に 0 を含める。既定 true（面と積み上げは常に含める）。 */
  zero?: boolean;
}

/**
 * 折れ線と面のグラフ。Q-02 / Q-03。
 * 線は端から端まで使い、欠けた値（null）で線を切る。曲線は単調な 3 次補間なので、無い山や谷を描かない。
 */
export function LineChart({
  label,
  description,
  table = false,
  data,
  x,
  series,
  xFormat,
  valueFormat,
  axisFormat,
  height = 240,
  stacked = false,
  legend,
  xLabel,
  area = false,
  curve = 'smooth',
  points,
  zero = true,
  className,
  ...rest
}: LineChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const gradientId = useId().replace(/[^\w-]/g, '');
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef, 600);
  const formats = useFormats(valueFormat, axisFormat);
  const { visible, hidden, toggle } = useVisibleSeries(series);
  const count = data.length;
  const roving = useRoving(count);
  const smooth = curve === 'smooth';

  const xText = (index: number): string => {
    const raw = data[index]?.[x];
    return xFormat ? xFormat(raw, index) : String(raw ?? '');
  };
  const raw = visible.map((s) => data.map((row) => toNumber(row[s.key])));
  const { tops, bases } = stacked ? stackValues(raw, count) : { tops: raw, bases: raw.map(() => new Array<number>(count).fill(0)) };
  const extent = valueExtent(tops.flat().filter(isNumber), zero || area || stacked);
  const ticks = niceTicks(extent[0], extent[1], height < 180 ? 3 : 5);
  const domain: [number, number] = [ticks[0] ?? 0, ticks.at(-1) ?? 1];
  const xs = data.map((_, index) => pointAt(index, count, false));
  const showPoints = points ?? count <= 24;
  const colors = new Map(series.map((s, index) => [s.key, seriesColor(s, index)]));
  const colorOf = (s: ChartSeries): string => colors.get(s.key) ?? 'currentColor';
  const active = roving.active;

  const pointLabel = (index: number): string =>
    labels.chartPoint(
      xText(index),
      visible.map((s, k) => {
        const value = raw[k]?.[index] ?? null;
        return [s.label, value === null ? labels.noValue : formats.value(value)] as const;
      }),
    );

  const shapes = visible.map((s, k) => {
    const top = tops[k] ?? [];
    const base = bases[k] ?? [];
    const segments = segmentsOf(top.map((value, index) => (value === null ? null : ([xs[index] ?? 0, toTop(value, domain)] as Point))));
    const line = segments.map((segment) => (smooth ? monotonePath(segment.values) : linearPath(segment.values))).join('');
    const fill = area
      ? segments
          .map((segment) =>
            areaPath(
              segment.values,
              segment.values.map((_, j) => [xs[segment.start + j] ?? 0, toTop(base[segment.start + j] ?? 0, domain)] as Point),
              smooth,
            ),
          )
          .join('')
      : '';
    return { s, k, line, fill };
  });

  return (
    <div {...domPassthrough(rest, 'LineChart')} {...groupProps} className={cx('g-viz g-line-chart', className)}>
      {(legend ?? series.length > 1) ? <Legend series={series} hidden={hidden} onToggle={toggle} shape={area ? 'square' : 'line'} /> : null}
      <div className="g-viz-frame" style={{ '--g-viz-height': `${String(height)}px` } as CSSProperties}>
        <YAxis ticks={ticks} format={formats.axis} />
        <div
          ref={plotRef}
          className="g-viz-plot"
          onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            if (rect.width <= 0 || count === 0) return;
            const ratio = (event.clientX - rect.left) / rect.width;
            roving.setHovered(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1)))));
          }}
          onPointerLeave={() => roving.setHovered(null)}
        >
          <Grid ticks={ticks} domain={domain} />
          {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
          <svg className="g-viz-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {area ? (
              <defs>
                {shapes.map(({ s, k }) => (
                  <linearGradient key={s.key} id={`${gradientId}-${String(k)}`} x1="0" y1="0" x2="0" y2="1">
                    {/* 重ねる面は薄く始めて下で消す（重なった所が濁らない）。積み上げは重ならないので濃くてよい */}
                    <stop offset="0" style={{ stopColor: colorOf(s), stopOpacity: stacked ? 0.5 : 0.24 }} />
                    <stop offset="1" style={{ stopColor: colorOf(s), stopOpacity: stacked ? 0.3 : 0 }} />
                  </linearGradient>
                ))}
              </defs>
            ) : null}
            {area
              ? shapes.map(({ s, k, fill }) => <path key={`a-${s.key}`} className="g-viz-area" d={fill} fill={`url(#${gradientId}-${String(k)})`} />)
              : null}
            {shapes.map(({ s, line }) => (
              <path key={`l-${s.key}`} className="g-viz-line" d={line} style={colorStyle(colorOf(s))} />
            ))}
          </svg>
          {active !== null ? <span className="g-viz-guide" style={{ left: `${String(xs[active] ?? 0)}%` }} aria-hidden="true" /> : null}
          {visible.map((s, k) =>
            (tops[k] ?? []).map((value, index) =>
              value === null || (!showPoints && index !== active) ? null : (
                <span
                  key={`p-${s.key}-${String(index)}`}
                  className="g-viz-dot"
                  style={{ ...colorStyle(colorOf(s)), left: `${String(xs[index] ?? 0)}%`, top: `${String(toTop(value, domain))}%`, '--g-viz-x': xs[index] ?? 0 } as CSSProperties}
                  data-active={index === active ? '' : undefined}
                  aria-hidden="true"
                />
              ),
            ),
          )}
          <div className="g-viz-hits">
            {data.map((_, index) => {
              const half = count > 1 ? 50 / (count - 1) : 50;
              const left = Math.max(0, (xs[index] ?? 0) - half);
              const right = Math.min(100, (xs[index] ?? 0) + half);
              return (
                <div
                  key={`h-${String(index)}`}
                  role="img"
                  aria-label={pointLabel(index)}
                  className="g-viz-hit"
                  style={{ left: `${String(left)}%`, width: `${String(right - left)}%` }}
                  data-active={index === active ? '' : undefined}
                  {...roving.hitProps(index)}
                />
              );
            })}
          </div>
          {active !== null ? (
            <Tooltip
              title={xText(active)}
              style={besideStyle(xs[active] ?? 0)}
              rows={visible.map((s, k) => {
                const value = raw[k]?.[active] ?? null;
                return { key: s.key, label: s.label, value: value === null ? labels.noValue : formats.value(value), color: colorOf(s) };
              })}
            />
          ) : null}
        </div>
        <XAxis texts={data.map((_, index) => xText(index))} positions={xs} width={width} />
      </div>
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[xLabel ?? labels.chartCategory, ...series.map((s) => s.label)]}
          rows={data.map((row, index) => [
            xText(index),
            ...series.map((s) => {
              const value = toNumber(row[s.key]);
              return value === null ? labels.noValue : formats.value(value);
            }),
          ])}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BarChart                                                                   */
/* -------------------------------------------------------------------------- */

export interface BarChartProps extends CartesianChartProps {
  /** 'vertical'（既定。縦の棒）か 'horizontal'（横の棒。項目の名前が長いとき）。 */
  layout?: 'vertical' | 'horizontal';
}

interface BarPiece {
  key: string;
  color: string;
  from: number;
  to: number;
  /** 値の側の端を丸めるか（積み上げなら、0 から最も遠い片だけ）。 */
  end: boolean;
}

/**
 * 棒のグラフ。Q-04。
 * 棒は 0 の線から伸ばす（負の値は反対側へ）。並べるか積み上げるかを選べ、積み上げは正と負を別々に積む。
 * 値の側の端だけを丸め、0 の線の側は角のままにする。
 */
export function BarChart({
  label,
  description,
  table = false,
  data,
  x,
  series,
  xFormat,
  valueFormat,
  axisFormat,
  height,
  stacked = false,
  legend,
  xLabel,
  layout = 'vertical',
  className,
  ...rest
}: BarChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef, 600);
  const formats = useFormats(valueFormat, axisFormat);
  const { visible, hidden, toggle } = useVisibleSeries(series);
  const count = data.length;
  const roving = useRoving(count);
  const horizontal = layout === 'horizontal';
  const colors = new Map(series.map((s, index) => [s.key, seriesColor(s, index)]));
  const colorOf = (s: ChartSeries): string => colors.get(s.key) ?? 'currentColor';
  const active = roving.active;

  const xText = (index: number): string => {
    const raw = data[index]?.[x];
    return xFormat ? xFormat(raw, index) : String(raw ?? '');
  };
  const valueAt = (index: number, s: ChartSeries): number | null => toNumber(data[index]?.[s.key]);

  // 項目ごとの片。積み上げは正と負を別々に積み、0 から最も遠い片の端だけを丸める
  const pieces: BarPiece[][] = data.map((_, index) => {
    if (!stacked) {
      return visible.flatMap((s) => {
        const value = valueAt(index, s);
        return value === null ? [] : [{ key: s.key, color: colorOf(s), from: 0, to: value, end: true }];
      });
    }
    let up = 0;
    let down = 0;
    const out: BarPiece[] = [];
    for (const s of visible) {
      const value = valueAt(index, s);
      if (value === null || value === 0) continue;
      if (value > 0) {
        out.push({ key: s.key, color: colorOf(s), from: up, to: up + value, end: false });
        up += value;
      } else {
        out.push({ key: s.key, color: colorOf(s), from: down, to: down + value, end: false });
        down += value;
      }
    }
    const lastUp = lastIndexWhere(out, (piece) => piece.to > piece.from);
    const lastDown = lastIndexWhere(out, (piece) => piece.to < piece.from);
    return out.map((piece, i) => (i === lastUp || i === lastDown ? { ...piece, end: true } : piece));
  });
  const extent = valueExtent(
    pieces.flat().flatMap((piece) => [piece.from, piece.to]),
    true,
  );
  const plotHeight = height ?? (horizontal ? Math.max(1, count) * Math.max(32, (stacked ? 1 : visible.length) * 12 + 16) : 240);
  const ticks = niceTicks(extent[0], extent[1], horizontal || plotHeight >= 180 ? 5 : 3);
  const domain: [number, number] = [ticks[0] ?? 0, ticks.at(-1) ?? 1];
  const zeroAt = horizontal ? toLeft(0, domain) : toTop(0, domain);

  const pointLabel = (index: number): string =>
    labels.chartPoint(
      xText(index),
      visible.map((s) => {
        const value = valueAt(index, s);
        return [s.label, value === null ? labels.noValue : formats.value(value)] as const;
      }),
    );

  /** 片の位置（縦の棒なら top と height、横の棒なら left と width。どれも %）。 */
  const pieceStyle = (piece: BarPiece): CSSProperties => {
    if (horizontal) {
      const a = toLeft(piece.from, domain);
      const b = toLeft(piece.to, domain);
      return { ...colorStyle(piece.color), left: `${String(Math.min(a, b))}%`, width: `${String(Math.abs(b - a))}%` };
    }
    const a = toTop(piece.from, domain);
    const b = toTop(piece.to, domain);
    return { ...colorStyle(piece.color), top: `${String(Math.min(a, b))}%`, height: `${String(Math.abs(b - a))}%` };
  };
  const pieceEnd = (piece: BarPiece): string | undefined => {
    if (!piece.end) return undefined;
    const positive = piece.to >= piece.from;
    return horizontal ? (positive ? 'end' : 'start') : positive ? 'top' : 'bottom';
  };

  /**
   * 項目 1 つ分の棒。並べるなら系列ごとの溝に 1 本ずつ、積み上げなら 1 つの溝に片を重ねる。
   * 溝の束（g-viz-group）は帯の 72% の幅。帯は % で置くので、帯に対する割合は中の器で取る（帯の padding の % は描く領域全体の幅になる）。
   */
  const band = (index: number): ReactNode => {
    const list = pieces[index] ?? [];
    const slot = (key: string, content: ReactNode): ReactNode => (
      <span key={key} className="g-viz-slot">
        {content}
      </span>
    );
    const bar = (piece: BarPiece): ReactNode => (
      <span key={piece.key} className="g-viz-bar" style={pieceStyle(piece)} data-end={pieceEnd(piece)} />
    );
    return (
      <span className="g-viz-group">
        {stacked
          ? slot('stack', list.map(bar))
          : visible.map((s) => {
              const piece = list.find((candidate) => candidate.key === s.key);
              return slot(s.key, piece ? bar(piece) : null);
            })}
      </span>
    );
  };

  const tooltip =
    active !== null ? (
      <Tooltip
        title={xText(active)}
        style={
          horizontal
            ? {
                top: `${String((active / Math.max(1, count)) * 100)}%`,
                ...besideStyle(Math.max(zeroAt, ...(pieces[active] ?? []).map((piece) => toLeft(piece.to, domain)))),
              }
            : besideStyle(pointAt(active, count, true))
        }
        rows={visible.map((s) => {
          const value = valueAt(active, s);
          return { key: s.key, label: s.label, value: value === null ? labels.noValue : formats.value(value), color: colorOf(s) };
        })}
      />
    ) : null;

  const onPointer = bandPointer(count, roving, horizontal);
  const hits = <BandHits count={count} roving={roving} labelOf={pointLabel} horizontal={horizontal} />;

  return (
    <div {...domPassthrough(rest, 'BarChart')} {...groupProps} className={cx('g-viz g-bar-chart', className)} data-layout={horizontal ? 'horizontal' : undefined}>
      {(legend ?? series.length > 1) ? <Legend series={series} hidden={hidden} onToggle={toggle} shape="square" /> : null}
      {horizontal ? (
        <div className="g-viz-hframe" style={{ '--g-viz-height': `${String(plotHeight)}px`, '--g-viz-rows': count } as CSSProperties}>
          <div className="g-viz-hlabels" aria-hidden="true">
            {data.map((_, index) => (
              <span key={`l-${String(index)}`} data-active={index === active ? '' : undefined}>
                {xText(index)}
              </span>
            ))}
          </div>
          <div ref={plotRef} className="g-viz-plot" onPointerMove={onPointer} onPointerLeave={() => roving.setHovered(null)}>
            <Grid ticks={ticks} domain={domain} horizontal />
            {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
            {data.map((_, index) => (
              <div
                key={`b-${String(index)}`}
                className="g-viz-band"
                style={{ top: `${String((index / count) * 100)}%`, height: `${String(100 / count)}%`, '--g-viz-zero': `${String(zeroAt)}%`, '--g-viz-x': pointAt(index, count, true) } as CSSProperties}
                data-active={index === active ? '' : undefined}
              >
                {band(index)}
              </div>
            ))}
            {hits}
            {tooltip}
          </div>
          <XAxis texts={ticks.map((tick) => formats.axis(tick))} positions={ticks.map((tick) => toLeft(tick, domain))} width={width} />
        </div>
      ) : (
        <div className="g-viz-frame" style={{ '--g-viz-height': `${String(plotHeight)}px` } as CSSProperties}>
          <YAxis ticks={ticks} format={formats.axis} />
          <div ref={plotRef} className="g-viz-plot" onPointerMove={onPointer} onPointerLeave={() => roving.setHovered(null)}>
            <Grid ticks={ticks} domain={domain} />
            {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
            {data.map((_, index) => (
              <div
                key={`b-${String(index)}`}
                className="g-viz-band"
                style={{ left: `${String((index / count) * 100)}%`, width: `${String(100 / count)}%`, '--g-viz-zero': `${String(zeroAt)}%`, '--g-viz-x': pointAt(index, count, true) } as CSSProperties}
                data-active={index === active ? '' : undefined}
              >
                {band(index)}
              </div>
            ))}
            {hits}
            {tooltip}
          </div>
          <XAxis texts={data.map((_, index) => xText(index))} positions={data.map((_, index) => pointAt(index, count, true))} width={width} />
        </div>
      )}
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[xLabel ?? labels.chartCategory, ...series.map((s) => s.label)]}
          rows={data.map((row, index) => [
            xText(index),
            ...series.map((s) => {
              const value = toNumber(row[s.key]);
              return value === null ? labels.noValue : formats.value(value);
            }),
          ])}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DonutChart                                                                 */
/* -------------------------------------------------------------------------- */

export interface DonutDatum {
  /** 区切りを見分けるキー。既定は label。 */
  key?: string;
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps extends ChartBaseProps {
  data: readonly DonutDatum[];
  /** 'donut'（既定。真ん中に合計）か 'pie'。 */
  variant?: 'donut' | 'pie';
  /** 円の直径（px）。既定 180。 */
  size?: number;
  /** 真ん中に出すもの。既定は合計。 */
  center?: ReactNode;
  /** 合計の下の語。既定 labels.total。 */
  centerLabel?: string;
  valueFormat?: ChartFormat;
}

/**
 * ドーナツと円のグラフ。Q-05。
 * 区切りは値の割合で、凡例に名前・値・割合を並べる（凡例を読めば全部わかるので、円そのものは飾り）。
 * 区切りか凡例を指すと、その区切りを強め、真ん中にその値を出す。
 */
export function DonutChart({
  label,
  description,
  table = false,
  data,
  variant = 'donut',
  size = 180,
  center,
  centerLabel,
  valueFormat,
  className,
  ...rest
}: DonutChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const phrase = usePhrase();
  const formats = useFormats(valueFormat);
  const percent = usePercent();
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((sum, datum) => sum + Math.max(0, datum.value), 0);
  const donut = variant === 'donut';
  const radius = donut ? 40 : 25;
  const thickness = donut ? 20 : 50;
  const gap = donut && data.filter((datum) => datum.value > 0).length > 1 ? 0.8 : 0;
  const lengths = arcLengths(data.map((datum) => datum.value), gap);

  let start = 0;
  const arcs = data.map((datum, index) => {
    const length = lengths[index] ?? 0;
    const arc = { datum, index, start, length, color: datum.color ?? `var(--g-chart-${String((index % 8) + 1)})` };
    start += length;
    return arc;
  });
  const keyOf = (datum: DonutDatum): string => datum.key ?? datum.label;
  const ratioOf = (datum: DonutDatum): number => (total > 0 ? Math.max(0, datum.value) / total : 0);
  const focus = active === null ? null : data[active];

  return (
    <div {...domPassthrough(rest, 'DonutChart')} {...groupProps} className={cx('g-viz g-donut', className)} data-variant={donut ? undefined : 'pie'} data-active={focus ? '' : undefined}>
      <div className="g-donut-body">
        <div className="g-donut-figure" style={{ '--g-donut-size': `${String(size)}px` } as CSSProperties}>
          <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle className="g-donut-track" cx="50" cy="50" r={radius} strokeWidth={thickness} />
            {arcs.map((arc) =>
              arc.length - gap <= 0 ? null : (
                <circle
                  key={keyOf(arc.datum)}
                  className="g-donut-segment"
                  cx="50"
                  cy="50"
                  r={radius}
                  strokeWidth={thickness}
                  pathLength={100}
                  strokeDasharray={`${String(arc.length - gap)} ${String(100 - arc.length + gap)}`}
                  strokeDashoffset={-(arc.start + gap / 2)}
                  style={colorStyle(arc.color)}
                  data-active={arc.index === active ? '' : undefined}
                  onPointerEnter={() => setActive(arc.index)}
                  onPointerLeave={() => setActive(null)}
                />
              ),
            )}
          </svg>
          {donut ? (
            <div className="g-donut-center" aria-hidden="true">
              {focus ? (
                <>
                  <span className="g-donut-value">{formats.value(focus.value)}</span>
                  <span className="g-donut-caption">
                    {focus.label}・{percent(ratioOf(focus))}
                  </span>
                </>
              ) : (
                <>
                  <span className="g-donut-value">{center ?? formats.value(total)}</span>
                  <span className="g-donut-caption">{centerLabel ?? labels.total}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
        {data.length === 0 ? (
          <p className="g-viz-empty">{labels.noData}</p>
        ) : (
          <ul className="g-viz-legend g-donut-legend" aria-label={labels.legend}>
            {arcs.map((arc) => (
              <li
                key={keyOf(arc.datum)}
                style={colorStyle(arc.color)}
                data-active={arc.index === active ? '' : undefined}
                onPointerEnter={() => setActive(arc.index)}
                onPointerLeave={() => setActive(null)}
              >
                <span className="g-viz-swatch" aria-hidden="true" />
                <span className="g-donut-name">{phrase(arc.datum.label)}</span>
                <span className="g-donut-amount">{formats.value(arc.datum.value)}</span>
                <span className="g-donut-share">{percent(ratioOf(arc.datum))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[labels.chartCategory, labels.chartValue, labels.chartShare]}
          rows={data.map((datum) => [datum.label, formats.value(datum.value), percent(ratioOf(datum))])}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sparkline                                                                  */
/* -------------------------------------------------------------------------- */

export interface SparklineProps extends DataAttributes {
  /** 何の推移か。読み上げでは、最小・最大・最新を後ろに続ける。 */
  label: string;
  data: readonly (number | null)[];
  /** 'line'（既定）・'area'・'bar'。 */
  type?: 'line' | 'area' | 'bar';
  /** 色の段。既定 'accent'。 */
  tone?: StatusTone;
  valueFormat?: ChartFormat;
  /** 高さ（px）。既定 32。幅は器いっぱい。 */
  height?: number;
  /** 縦の範囲に 0 を含める。既定は棒と面なら true、線なら false（小さな変化を見せる）。 */
  zero?: boolean;
  className?: string;
}

/**
 * 表やカードに添える小さな推移。Q-06。軸も操作も持たず、名前と最小・最大・最新の値を 1 枚の絵として読ませる。
 */
export function Sparkline({ label, data, type = 'line', tone = 'accent', valueFormat, height = 32, zero, className, ...rest }: SparklineProps): ReactNode {
  const labels = useLabels();
  const formats = useFormats(valueFormat);
  const values = data.filter(isNumber);
  const [lo, hi] = valueExtent(values, zero ?? type !== 'line');
  const domain: [number, number] = lo === hi ? [lo - 1, hi + 1] : [lo, hi];
  const count = data.length;
  // 線の太さのぶん、上下に余白を取る（0〜100 のうち 8〜92 に描く）
  const yOf = (value: number): number => 8 + (toTop(value, domain) / 100) * 84;
  const xs = data.map((_, index) => pointAt(index, count, type === 'bar'));
  const last = lastIndexWhere(data, (value) => value !== null);
  const lastValue = last >= 0 ? data[last] : null;
  const summary =
    values.length === 0
      ? labels.noData
      : labels.sparkline({
          min: formats.value(Math.min(...values)),
          max: formats.value(Math.max(...values)),
          last: lastValue === null || lastValue === undefined ? labels.noValue : formats.value(lastValue),
        });
  const segments = segmentsOf(data.map((value, index) => (value === null ? null : ([xs[index] ?? 0, yOf(value)] as Point))));
  const baseY = yOf(Math.min(Math.max(0, domain[0]), domain[1]));

  return (
    <span
      {...domPassthrough(rest, 'Sparkline')}
      className={cx('g-sparkline', className)}
      role="img"
      aria-label={`${label}: ${summary}`}
      data-tone={tone}
      style={{ '--g-spark-height': `${String(height)}px` } as CSSProperties}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {type === 'bar'
          ? data.map((value, index) => {
              if (value === null) return null;
              const top = Math.min(yOf(value), baseY);
              const barWidth = (100 / Math.max(1, count)) * 0.7;
              return (
                <rect
                  key={`s-${String(index)}`}
                  className="g-sparkline-bar"
                  x={(xs[index] ?? 0) - barWidth / 2}
                  y={top}
                  width={barWidth}
                  height={Math.max(0.5, Math.abs(yOf(value) - baseY))}
                />
              );
            })
          : segments.map((segment) => (
              <g key={`s-${String(segment.start)}`}>
                {type === 'area' ? (
                  <path
                    className="g-sparkline-area"
                    d={areaPath(
                      segment.values,
                      segment.values.map((point) => [point[0], baseY] as Point),
                      false,
                    )}
                  />
                ) : null}
                <path className="g-sparkline-line" d={linearPath(segment.values)} />
              </g>
            ))}
      </svg>
      {type !== 'bar' && last >= 0 && lastValue !== null && lastValue !== undefined ? (
        <span className="g-sparkline-dot" style={{ left: `${String(xs[last] ?? 0)}%`, top: `${String(yOf(lastValue))}%` }} aria-hidden="true" />
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* BarList                                                                    */
/* -------------------------------------------------------------------------- */

export interface BarListItem {
  /** 行を見分けるキー。既定は label（文字のとき）か位置。 */
  key?: string;
  label: ReactNode;
  value: number;
  /** 行き先。名前がリンクになる。 */
  href?: string;
  color?: string;
}

export interface BarListProps extends DataAttributes {
  /** 一覧の名前（読み上げ）。 */
  label: string;
  data: readonly BarListItem[];
  valueFormat?: ChartFormat;
  className?: string;
}

/**
 * 順位の棒（よく見られたページ・流入元など）。Q-07。
 * 中身は名前と値の並んだ一覧（ul）で、棒は名前の地に敷く飾り。棒の長さはいちばん大きな値に対する割合。
 */
export function BarList({ label, data, valueFormat, className, ...rest }: BarListProps): ReactNode {
  const phrase = usePhrase();
  const formats = useFormats(valueFormat);
  const max = data.reduce((most, item) => Math.max(most, item.value), 0);
  return (
    <ul {...domPassthrough(rest, 'BarList')} className={cx('g-bar-list', className)} aria-label={label}>
      {data.map((item, index) => (
        <li
          key={item.key ?? (typeof item.label === 'string' ? item.label : `i-${String(index)}`)}
          className="g-bar-list-item"
          style={{ '--g-bar': max > 0 ? Math.max(0, item.value) / max : 0, ...(item.color ? colorStyle(item.color) : null), '--g-viz-x': (index / Math.max(1, data.length)) * 100 } as CSSProperties}
        >
          <span className="g-bar-list-bar" aria-hidden="true" />
          <span className="g-bar-list-label">{item.href ? <a href={item.href}>{phrase(item.label)}</a> : phrase(item.label)}</span>
          <span className="g-bar-list-value">{formats.value(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Gauge                                                                      */
/* -------------------------------------------------------------------------- */

export interface GaugeProps extends DataAttributes {
  /** 何の量か。meter の名前になる（必須）。 */
  label: string;
  value: number;
  /** 既定 0。 */
  min?: number;
  /** 既定 100。 */
  max?: number;
  /** 値の読み上げと表示。既定は割合（labels.locale の Intl で「72%」）。 */
  valueText?: (value: number, min: number, max: number) => string;
  /** 色の段。既定 'accent'。使用量なら、上限が近づいたら 'warning'・超えたら 'error'。 */
  tone?: StatusTone;
  /** 名前を目には出さない（読み上げ名には残す）。 */
  hideLabel?: boolean;
  /** 幅（px）。既定 200。 */
  size?: number;
  className?: string;
}

/** 弧の道のり（中心 50,50・半径 40 の上半分）。pathLength="100" で、割合をそのまま長さにする。 */
const GAUGE_ARC = 'M10 50A40 40 0 0 1 90 50';

/**
 * 半円のメーター（使用率・達成率）。Q-08。role="meter" に値と読める値（aria-valuetext）を持たせる。
 */
export function Gauge({ label, value, min = 0, max = 100, valueText, tone = 'accent', hideLabel = false, size = 200, className, ...rest }: GaugeProps): ReactNode {
  const { locale } = useLabels();
  const phrase = usePhrase();
  const span = max - min;
  const clamped = Math.min(Math.max(value, min), max);
  const ratio = span > 0 ? (clamped - min) / span : 0;
  const text = valueText?.(clamped, min, max) ?? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
  return (
    <div
      {...domPassthrough(rest, 'Gauge')}
      className={cx('g-gauge', className)}
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={text}
      data-tone={tone}
      style={{ '--g-gauge-size': `${String(size)}px` } as CSSProperties}
    >
      <div className="g-gauge-dial">
        <svg viewBox="0 0 100 56" aria-hidden="true" focusable="false">
          <path className="g-gauge-track" d={GAUGE_ARC} pathLength={100} />
          {ratio > 0 ? <path className="g-gauge-fill" d={GAUGE_ARC} pathLength={100} strokeDasharray={`${String(ratio * 100)} 100`} /> : null}
        </svg>
        <span className="g-gauge-value" aria-hidden="true">
          {text}
        </span>
      </div>
      {hideLabel ? null : (
        <span className="g-gauge-label" aria-hidden="true">
          {phrase(label)}
        </span>
      )}
    </div>
  );
}
