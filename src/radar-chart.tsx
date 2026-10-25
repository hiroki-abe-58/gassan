import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import type { ChartBaseProps, ChartFormat, ChartRow, ChartSeries, ChartValue } from './charts';
import {
  ChartData,
  Description,
  Legend,
  Tooltip,
  besideStyle,
  colorStyle,
  cx,
  seriesColor,
  toNumber,
  useFormats,
  useRoving,
  useShell,
  useVisibleSeries,
} from './internal/chart-parts';
import { estimateTextWidth, niceTicks } from './internal/chart-scale';
import { domPassthrough } from './internal/passthrough';
import { splitPhrases } from './internal/phrase';
import { useWidth } from './internal/use-width';
import { usePhrase } from './phrase';

export interface RadarChartProps extends ChartBaseProps {
  /** 軸ごとの行。x で決めたキーが軸の名前、series の key が値。 */
  data: readonly ChartRow[];
  /** 軸（項目）のキー。 */
  x: string;
  series: readonly ChartSeries[];
  /** 軸の名前の見せ方。既定は値をそのまま文字にする。 */
  xFormat?: (value: ChartValue, index: number) => string;
  /** 値の書式（ツールチップ・読み上げ・表）。 */
  valueFormat?: ChartFormat;
  /** 輪の目盛りの書式。既定は valueFormat を短く。 */
  axisFormat?: ChartFormat;
  /** 外周の値。既定は値の最大を目盛りに乗せた値。5 段階の評価なら 5。 */
  max?: number;
  /** 図の幅（px）。既定 400（器が狭ければ器の幅）。 */
  size?: number;
  /** 凡例を出す。既定は系列が 2 つ以上のとき。 */
  legend?: boolean;
  /** 元データの表の、軸の列の見出し。既定 labels.chartCategory。 */
  xLabel?: string;
}

/** 図の中心（viewBox の 0〜100 に対して）。 */
const CENTER = 50;
/** 軸の名前を置く半径の上限と下限。外周はこれより 4 内側。 */
const LABEL_RADIUS_MAX = 32;
const LABEL_RADIUS_MIN = 18;
/** 横に置く軸の名前に残す幅の上限（px）。これより長い文節は、安全弁で折れる。 */
const LABEL_WIDTH_MAX = 72;

/** 名前の中でいちばん長い、途中で折らない区切り（日本語・中国語は文節、ほかは空白で区切った語）の幅（px）。 */
const longestPiece = (text: string): number =>
  Math.max(0, ...splitPhrases(text).flatMap((piece) => piece.split(/\s+/)).map((piece) => estimateTextWidth(piece, 12)));

/**
 * レーダーチャート（いくつかの軸での評価を形で比べる）。Q-14。
 * 軸は真上から時計回りに置き、系列ごとの多角形を重ねる。軸の名前が当たりの領域で、1 つだけが Tab で止まり、
 * 矢印でたどると軸の名前と系列ごとの値を読む。ポインタは向きの近い軸を指す。
 */
export function RadarChart({
  label,
  description,
  table = false,
  data,
  x,
  series,
  xFormat,
  valueFormat,
  axisFormat,
  max,
  size = 400,
  legend,
  xLabel,
  className,
  ...rest
}: RadarChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const phrase = usePhrase();
  const figureRef = useRef<HTMLDivElement>(null);
  const width = useWidth(figureRef, size);
  const formats = useFormats(valueFormat, axisFormat);
  const { visible, hidden, toggle } = useVisibleSeries(series);
  const count = data.length;
  const roving = useRoving(count);
  const active = roving.active;
  const colors = new Map(series.map((s, index) => [s.key, seriesColor(s, index)]));
  const colorOf = (s: ChartSeries): string => colors.get(s.key) ?? 'currentColor';

  const xText = (index: number): string => {
    const raw = data[index]?.[x];
    return xFormat ? xFormat(raw, index) : String(raw ?? '');
  };
  const valueAt = (index: number, s: ChartSeries): number | null => toNumber(data[index]?.[s.key]);
  const largest = Math.max(0, ...series.flatMap((s) => data.map((_, index) => valueAt(index, s) ?? 0)));
  const ticks = niceTicks(0, max ?? (largest || 1), 5).filter((tick) => tick > 0 && (max === undefined || tick <= max));
  const outer = max ?? ticks.at(-1) ?? 1;
  const rings = ticks.at(-1) === outer ? ticks : [...ticks, outer];
  /** 軸の向き（真上から時計回り）。 */
  const angleOf = (index: number): number => (index / Math.max(1, count)) * 2 * Math.PI;
  // 横に置く軸の名前が図の端までに入るよう、外周の大きさを図の幅で決める（測るのは文字を収めるためだけ。狭い図ほど外周が小さい）
  const sides = data.map((_, index) => ({ index, sin: Math.abs(Math.sin(angleOf(index))) })).filter(({ sin }) => sin >= 0.2);
  const need = Math.max(0, ...sides.map(({ index }) => Math.min(longestPiece(xText(index)), LABEL_WIDTH_MAX) + 10));
  const steepest = Math.max(0.2, ...sides.map(({ sin }) => sin));
  const labelRadius = Math.min(LABEL_RADIUS_MAX, Math.max(LABEL_RADIUS_MIN, (50 - (need / Math.max(1, width)) * 100) / steepest));
  const outerRadius = labelRadius - 4;
  const at = (index: number, value: number, radius = outerRadius): readonly [number, number] => {
    const r = (Math.max(0, value) / outer) * radius;
    return [CENTER + r * Math.sin(angleOf(index)), CENTER - r * Math.cos(angleOf(index))];
  };
  const polygon = (value: (index: number) => number): string =>
    data.map((_, index) => at(index, value(index)).map((n) => n.toFixed(2)).join(',')).join(' ');

  const pointLabel = (index: number): string =>
    labels.chartPoint(
      xText(index),
      visible.map((s) => {
        const value = valueAt(index, s);
        return [s.label, value === null ? labels.noValue : formats.value(value)] as const;
      }),
    );

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || count === 0) return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
    roving.setHovered(Math.round(angle / ((2 * Math.PI) / count)) % count);
  };

  /** 軸の名前の置き方。右半分は左端を、左半分は右端を外周に寄せ、使える幅（図の端まで）を上限にする。 */
  const labelStyle = (index: number): CSSProperties => {
    const [left, top] = at(index, outer, labelRadius);
    const sin = Math.sin(angleOf(index));
    const cos = Math.cos(angleOf(index));
    const horizontal = Math.abs(sin) < 0.2 ? 'center' : sin > 0 ? 'start' : 'end';
    return {
      left: `${String(left)}%`,
      top: `${String(top)}%`,
      maxInlineSize: horizontal === 'center' ? '44%' : horizontal === 'start' ? `${String(100 - left)}%` : `${String(left)}%`,
      translate: `${horizontal === 'center' ? '-50%' : horizontal === 'start' ? '0' : '-100%'} ${Math.abs(cos) < 0.2 ? '-50%' : cos > 0 ? '-100%' : '0'}`,
      textAlign: horizontal === 'center' ? 'center' : horizontal === 'start' ? 'left' : 'right',
    };
  };

  return (
    <div {...domPassthrough(rest, 'RadarChart')} {...groupProps} className={cx('g-viz g-radar', className)}>
      {(legend ?? series.length > 1) ? <Legend series={series} hidden={hidden} onToggle={toggle} shape="square" /> : null}
      <div
        ref={figureRef}
        className="g-radar-figure"
        style={{ '--g-radar-size': `${String(size)}px` } as CSSProperties}
        onPointerMove={onPointerMove}
        onPointerLeave={() => roving.setHovered(null)}
      >
        {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
        <svg className="g-radar-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          {rings.map((ring) => (
            <polygon key={`ring-${String(ring)}`} className="g-radar-ring" points={polygon(() => ring)} />
          ))}
          {data.map((_, index) => {
            const [x2, y2] = at(index, outer);
            return <line key={`spoke-${String(index)}`} className="g-radar-spoke" x1={CENTER} y1={CENTER} x2={x2} y2={y2} data-active={index === active ? '' : undefined} />;
          })}
          {visible.map((s) => (
            <polygon key={`area-${s.key}`} className="g-radar-area" points={polygon((index) => valueAt(index, s) ?? 0)} style={colorStyle(colorOf(s))} />
          ))}
        </svg>
        <div className="g-radar-ticks" aria-hidden="true">
          {rings.map((ring) => (
            <span key={`tick-${String(ring)}`} style={{ top: `${String(at(0, ring)[1])}%` }}>
              {formats.axis(ring)}
            </span>
          ))}
        </div>
        {active !== null
          ? visible.map((s) => {
              const [left, top] = at(active, valueAt(active, s) ?? 0);
              return (
                <span
                  key={`dot-${s.key}`}
                  className="g-viz-dot"
                  data-active=""
                  style={{ ...colorStyle(colorOf(s)), left: `${String(left)}%`, top: `${String(top)}%` }}
                  aria-hidden="true"
                />
              );
            })
          : null}
        {data.map((_, index) => (
          <span
            key={`axis-${String(index)}`}
            role="img"
            aria-label={pointLabel(index)}
            className="g-radar-axis"
            style={labelStyle(index)}
            data-active={index === active ? '' : undefined}
            {...roving.hitProps(index)}
          >
            <span aria-hidden="true">{phrase(xText(index))}</span>
          </span>
        ))}
        {active !== null ? (
          <Tooltip
            title={xText(active)}
            style={besideStyle(at(active, outer, labelRadius)[0])}
            rows={visible.map((s) => {
              const value = valueAt(active, s);
              return { key: s.key, label: s.label, value: value === null ? labels.noValue : formats.value(value), color: colorOf(s) };
            })}
          />
        ) : null}
      </div>
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[xLabel ?? labels.chartCategory, ...series.map((s) => s.label)]}
          rows={data.map((_, index) => [
            xText(index),
            ...series.map((s) => {
              const value = valueAt(index, s);
              return value === null ? labels.noValue : formats.value(value);
            }),
          ])}
        />
      ) : null}
    </div>
  );
}
