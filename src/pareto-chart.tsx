import { useId, useRef, type CSSProperties, type ReactNode } from 'react';

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
  usePercent,
  useRoving,
  useShell,
} from './internal/chart-parts';
import { linearPath, niceTicks, pointAt, toTop, type Point } from './internal/chart-scale';
import { domPassthrough } from './internal/passthrough';
import { useWidth } from './internal/use-width';

export interface ParetoDatum {
  /** 項目を見分けるキー。既定は label。 */
  key?: string;
  label: string;
  value: number;
  /** 「その他」。大きさで並べ替えず、いちばん後ろに置く。 */
  other?: boolean;
}

export interface ParetoChartProps extends ChartBaseProps {
  /** 項目。大きい順に並べ替える（other は最後）。 */
  data: readonly ParetoDatum[];
  /** 値の書式（ツールチップ・読み上げ・表）。 */
  valueFormat?: ChartFormat;
  /** 左の目盛りの書式。既定は valueFormat を短く。 */
  axisFormat?: ChartFormat;
  /** 描く領域の高さ（px）。既定 240。 */
  height?: number;
  /** 棒の値の名前（凡例・読み上げ・表。「件数」）。既定 labels.chartValue。 */
  valueLabel?: string;
  /** 累積比率の目安（0〜1）。点線を引き、そこに届く上位の項目の数を書く。既定 0.8。null で出さない。 */
  threshold?: number | null;
  /** 元データの表の、項目の列の見出し。既定 labels.chartCategory。 */
  xLabel?: string;
}

/** 右の目盛り（累積比率）。0〜100% を 20% おき。 */
const SHARE_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const SHARE_DOMAIN: [number, number] = [0, 1];

/**
 * パレート図（どの項目が全体の大半を占めるか）。Q-17。
 * 棒を大きい順に並べ（「その他」は最後）、累積比率の折れ線を右の目盛り（0〜100%）で重ねる。目安（既定 80%）に
 * 届く上位の項目の数を図の下に書き、説明として読ませる。キー操作は棒のグラフと同じ（Q-02）。
 */
export function ParetoChart({
  label,
  description,
  table = false,
  data,
  valueFormat,
  axisFormat,
  height = 240,
  valueLabel,
  threshold = 0.8,
  xLabel,
  className,
  ...rest
}: ParetoChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const noteId = `${useId()}-note`;
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useWidth(plotRef, 600);
  const formats = useFormats(valueFormat, axisFormat);
  const percent = usePercent();
  const items = data
    .filter((datum) => !datum.other)
    .sort((a, b) => b.value - a.value)
    .concat(data.filter((datum) => datum.other));
  const count = items.length;
  const roving = useRoving(count);
  const active = roving.active;
  const total = items.reduce((sum, datum) => sum + Math.max(0, datum.value), 0);
  let sum = 0;
  const cumulative = items.map((datum) => {
    sum += Math.max(0, datum.value);
    return total > 0 ? sum / total : 0;
  });
  const vital = threshold === null || total === 0 ? -1 : cumulative.findIndex((share) => share >= threshold - 1e-9);
  const ticks = niceTicks(0, Math.max(0, ...items.map((datum) => datum.value)), height < 180 ? 3 : 5);
  const domain: [number, number] = [ticks[0] ?? 0, ticks.at(-1) ?? 1];
  const name = valueLabel ?? labels.chartValue;
  const barColor = 'var(--g-chart-1)';
  const lineColor = 'var(--g-chart-2)';
  const xs = items.map((_, index) => pointAt(index, count, true));
  const line = linearPath(cumulative.map((share, index) => [xs[index] ?? 0, toTop(share, SHARE_DOMAIN)] as Point));

  const entriesOf = (index: number): (readonly [string, string])[] => [
    [name, formats.value(items[index]?.value ?? 0)],
    [labels.paretoCumulative, percent(cumulative[index] ?? 0)],
  ];
  const pointLabel = (index: number): string => labels.chartPoint(items[index]?.label ?? '', entriesOf(index));
  const describedBy = [groupProps['aria-describedby'], vital >= 0 ? noteId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div {...domPassthrough(rest, 'ParetoChart')} {...groupProps} aria-describedby={describedBy} className={cx('g-viz g-pareto', className)}>
      <Legend
        series={[
          { key: 'value', label: name, color: barColor, shape: 'square' },
          { key: 'cumulative', label: labels.paretoCumulative, color: lineColor, shape: 'line' },
        ]}
        shape="square"
        interactive={false}
      />
      <div className="g-viz-frame" data-axes="2" style={{ '--g-viz-height': `${String(height)}px` } as CSSProperties}>
        <YAxis ticks={ticks} format={formats.axis} />
        <div ref={plotRef} className="g-viz-plot" onPointerMove={bandPointer(count, roving)} onPointerLeave={() => roving.setHovered(null)}>
          <Grid ticks={ticks} domain={domain} />
          {count === 0 ? <p className="g-viz-empty">{labels.noData}</p> : null}
          {threshold !== null && count > 0 ? (
            <span className="g-pareto-threshold" style={{ top: `${String(toTop(threshold, SHARE_DOMAIN))}%` }} aria-hidden="true" />
          ) : null}
          {items.map((datum, index) => {
            const zero = toTop(0, domain);
            const top = toTop(Math.max(0, datum.value), domain);
            return (
              <div
                key={datum.key ?? datum.label}
                className="g-viz-band"
                style={{ left: `${String((index / count) * 100)}%`, width: `${String(100 / count)}%`, '--g-viz-zero': `${String(zero)}%`, '--g-viz-x': xs[index] ?? 0 } as CSSProperties}
                data-active={index === active ? '' : undefined}
              >
                <span className="g-viz-group">
                  <span className="g-viz-slot">
                    <span
                      className="g-viz-bar"
                      style={{ ...colorStyle(barColor), top: `${String(top)}%`, height: `${String(zero - top)}%` }}
                      data-end="top"
                      // 目安に届いた後の項目は薄くする（届くまでの項目の数は、図の下の文でも伝える）
                      data-muted={vital >= 0 && index > vital ? '' : undefined}
                    />
                  </span>
                </span>
              </div>
            );
          })}
          <svg className="g-viz-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="g-viz-line" d={line} style={colorStyle(lineColor)} />
          </svg>
          {cumulative.map((share, index) => (
            <span
              key={`p-${String(index)}`}
              className="g-viz-dot"
              style={{ ...colorStyle(lineColor), left: `${String(xs[index] ?? 0)}%`, top: `${String(toTop(share, SHARE_DOMAIN))}%`, '--g-viz-x': xs[index] ?? 0 } as CSSProperties}
              data-active={index === active ? '' : undefined}
              aria-hidden="true"
            />
          ))}
          <BandHits count={count} roving={roving} labelOf={pointLabel} />
          {active !== null ? (
            <Tooltip
              title={items[active]?.label ?? ''}
              style={besideStyle(xs[active] ?? 0)}
              rows={entriesOf(active).map(([key, value], k) => ({ key, label: key, value, color: k === 0 ? barColor : lineColor }))}
            />
          ) : null}
        </div>
        <YAxis ticks={SHARE_TICKS} format={percent} side="end" />
        <XAxis texts={items.map((datum) => datum.label)} positions={xs} width={width} />
      </div>
      {vital >= 0 ? (
        <p id={noteId} className="g-viz-description g-pareto-note">
          {labels.paretoVital(vital + 1, percent(cumulative[vital] ?? 0))}
        </p>
      ) : null}
      <Description id={descriptionId}>{description}</Description>
      {table ? (
        <ChartData
          label={label}
          head={[xLabel ?? labels.chartCategory, name, labels.chartShare, labels.paretoCumulative]}
          rows={items.map((datum, index) => [
            datum.label,
            formats.value(datum.value),
            percent(total > 0 ? Math.max(0, datum.value) / total : 0),
            percent(cumulative[index] ?? 0),
          ])}
        />
      ) : null}
    </div>
  );
}
