import { useRef, type CSSProperties, type ReactNode } from 'react';

import type { ChartBaseProps, ChartFormat } from './charts';
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
  useFormats,
  useRoving,
  useShell,
} from './internal/chart-parts';
import { niceTicks, pointAt, toTop, valueExtent } from './internal/chart-scale';
import { domPassthrough } from './internal/passthrough';
import { useWidth } from './internal/use-width';

export interface WaterfallDatum {
  /** 棒を見分けるキー。既定は label。 */
  key?: string;
  label: string;
  /** 増減（kind が 'delta'）か、その時点の合計（'total'。省略すると、そこまでの合計）。 */
  value?: number;
  /** 'delta'（既定。前の合計から上下に浮く棒）か 'total'（0 から立つ合計の棒。期首・小計・期末）。 */
  kind?: 'delta' | 'total';
}

export interface WaterfallChartProps extends ChartBaseProps {
  data: readonly WaterfallDatum[];
  /** 値の書式（ツールチップ・読み上げ・表）。 */
  valueFormat?: ChartFormat;
  /** 目盛りの書式。既定は valueFormat を短く。 */
  axisFormat?: ChartFormat;
  /** 描く領域の高さ（px）。既定 240。 */
  height?: number;
  /** 元データの表の、項目の列の見出し。既定 labels.chartCategory。 */
  xLabel?: string;
}

type Kind = 'increase' | 'decrease' | 'total';

interface Step {
  datum: WaterfallDatum;
  kind: Kind;
  from: number;
  to: number;
  /** 増減（合計の棒は null）。 */
  change: number | null;
}

/** 増減を積み、棒ごとの下端と上端を決める。合計の棒は 0 から立ち、値があればそこから積み直す。 */
function stepsOf(data: readonly WaterfallDatum[]): Step[] {
  let running = 0;
  return data.map((datum) => {
    if (datum.kind === 'total') {
      running = datum.value ?? running;
      return { datum, kind: 'total', from: 0, to: running, change: null };
    }
    const change = datum.value ?? 0;
    const from = running;
    running += change;
    return { datum, kind: change < 0 ? 'decrease' : 'increase', from, to: running, change };
  });
}

/**
 * ウォーターフォール（期首から期末までの増減の内訳）。Q-16。
 * 増減の棒は前の合計から浮かせ、合計の棒は 0 から立てる。色（増加・減少・合計）は凡例と、読み上げの「増減 +500、累計 1,500」でも伝える。
 * 棒と棒は累計の高さの点線でつなぐ。キー操作は棒のグラフと同じ（Q-02）。
 */
export function WaterfallChart({
  label,
  description,
  table = false,
  data,
  valueFormat,
  axisFormat,
  height = 240,
  xLabel,
  className,
  ...rest
}: WaterfallChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef, 600);
  const formats = useFormats(valueFormat, axisFormat);
  const count = data.length;
  const roving = useRoving(count);
  const active = roving.active;
  const steps = stepsOf(data);
  const ticks = niceTicks(...valueExtent(steps.flatMap((step) => [step.from, step.to]), true), height < 180 ? 3 : 5);
  const domain: [number, number] = [ticks[0] ?? 0, ticks.at(-1) ?? 1];
  const signed = (value: number): string => (value > 0 ? `+${formats.value(value)}` : formats.value(value));
  const colorOf = (kind: Kind): string => `var(--g-viz-${kind})`;
  const nameOf: Record<Kind, string> = { increase: labels.waterfallIncrease, decrease: labels.waterfallDecrease, total: labels.total };

  const entriesOf = (step: Step): (readonly [string, string])[] =>
    step.change === null
      ? [[labels.total, formats.value(step.to)]]
      : [
          [labels.waterfallChange, signed(step.change)],
          [labels.waterfallRunning, formats.value(step.to)],
        ];
  const pointLabel = (index: number): string => {
    const step = steps[index];
    return step ? labels.chartPoint(step.datum.label, entriesOf(step)) : '';
  };
  const kinds = (['increase', 'decrease', 'total'] as const).filter((kind) => steps.some((step) => step.kind === kind));

  return (
    <div {...domPassthrough(rest, 'WaterfallChart')} {...groupProps} className={cx('g-viz g-waterfall', className)}>
      {kinds.length > 0 ? (
        <Legend series={kinds.map((kind) => ({ key: kind, label: nameOf[kind], color: colorOf(kind) }))} shape="square" interactive={false} />
      ) : null}
      <div className="g-viz-frame" style={{ '--g-viz-height': `${String(height)}px` } as CSSProperties}>
        <YAxis ticks={ticks} format={formats.axis} />
        <div ref={plotRef} className="g-viz-plot" onPointerMove={bandPointer(count, roving)} onPointerLeave={() => roving.setHovered(null)}>
          <Grid ticks={ticks} domain={domain} />
          {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
          {steps.slice(0, -1).map((step, index) => (
            <span
              key={`c-${String(index)}`}
              className="g-waterfall-connector"
              style={{ left: `${String(pointAt(index, count, true))}%`, width: `${String(100 / count)}%`, top: `${String(toTop(step.to, domain))}%` }}
              aria-hidden="true"
            />
          ))}
          {steps.map((step, index) => {
            const a = toTop(step.from, domain);
            const b = toTop(step.to, domain);
            return (
              <div
                key={step.datum.key ?? step.datum.label}
                className="g-viz-band"
                style={{ left: `${String((index / count) * 100)}%`, width: `${String(100 / count)}%`, '--g-viz-zero': `${String(a)}%`, '--g-viz-x': pointAt(index, count, true) } as CSSProperties}
                data-active={index === active ? '' : undefined}
              >
                <span className="g-viz-group">
                  <span className="g-viz-slot">
                    <span
                      className="g-viz-bar"
                      style={{ ...colorStyle(colorOf(step.kind)), top: `${String(Math.min(a, b))}%`, height: `${String(Math.max(0.5, Math.abs(b - a)))}%` }}
                      data-kind={step.kind}
                    />
                  </span>
                </span>
              </div>
            );
          })}
          <BandHits count={count} roving={roving} labelOf={pointLabel} />
          {active !== null && steps[active] ? (
            <Tooltip
              title={steps[active].datum.label}
              style={besideStyle(pointAt(active, count, true))}
              rows={entriesOf(steps[active]).map(([name, value]) => ({ key: name, label: name, value, color: colorOf(steps[active]?.kind ?? 'total') }))}
            />
          ) : null}
        </div>
        <XAxis texts={data.map((datum) => datum.label)} positions={data.map((_, index) => pointAt(index, count, true))} width={width} />
      </div>
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[xLabel ?? labels.chartCategory, labels.waterfallChange, labels.waterfallRunning]}
          rows={steps.map((step) => [step.datum.label, step.change === null ? labels.total : signed(step.change), formats.value(step.to)])}
        />
      ) : null}
    </div>
  );
}
