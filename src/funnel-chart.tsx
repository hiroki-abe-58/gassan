import type { CSSProperties, ReactNode } from 'react';

import type { ChartFormat } from './charts';
import { Description, colorStyle, cx, useFormats, usePercent, useShell } from './internal/chart-parts';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { usePhrase } from './phrase';

export interface FunnelStep {
  /** 段を見分けるキー。既定は label。 */
  key?: string;
  label: string;
  value: number;
}

export interface FunnelChartProps extends DataAttributes {
  /** グラフの名前（読み上げ）。 */
  label: string;
  /** 段。上から順に（訪問 → 登録 → 使い始め → 有料など）。 */
  data: readonly FunnelStep[];
  /** 主な傾向を言葉で（「登録から使い始めで最も多く離れる」）。グラフの下に出し、説明として読ませる。 */
  description?: ReactNode;
  valueFormat?: ChartFormat;
  /** 棒の色（CSS の色）。既定は --g-chart-1（アクセント）。 */
  color?: string;
  className?: string;
}

/**
 * ファネル（登録や購入までの段ごとの数）。Q-18。
 * 中身は段の番号つきの一覧（ol）で、段ごとに名前・数・最初の段に対する割合・前の段からの割合を文字で並べる。
 * 真ん中に寄せた棒は、最初の段に対する割合の幅の飾り。
 */
export function FunnelChart({ label, data, description, valueFormat, color, className, ...rest }: FunnelChartProps): ReactNode {
  const { labels, descriptionId, groupProps } = useShell(label, description);
  const phrase = usePhrase();
  const formats = useFormats(valueFormat);
  const percent = usePercent();
  const first = data[0]?.value ?? 0;
  const ratio = (value: number, base: number): number => (base > 0 ? Math.max(0, value) / base : 0);

  return (
    <div {...domPassthrough(rest, 'FunnelChart')} {...groupProps} className={cx('g-viz g-funnel', className)} style={color ? colorStyle(color) : undefined}>
      {data.length === 0 ? (
        <p className="g-viz-none">{labels.noData}</p>
      ) : (
        <ol className="g-funnel-steps">
          {data.map((step, index) => {
            const previous = data[index - 1];
            return (
              <li
                key={step.key ?? step.label}
                className="g-funnel-step"
                style={{ '--g-funnel': Math.min(1, ratio(step.value, first)), '--g-viz-x': (index / data.length) * 100 } as CSSProperties}
              >
                <span className="g-funnel-label">{phrase(step.label)}</span>
                <span className="g-funnel-value">{formats.value(step.value)}</span>
                {previous ? (
                  <>
                    <span className="g-funnel-share">{labels.funnelOfFirst(percent(ratio(step.value, first)))}</span>
                    <span className="g-funnel-rate">
                      <Icon name="arrowDown" className="g-funnel-arrow" />
                      {labels.funnelFromPrevious(percent(ratio(step.value, previous.value)))}
                    </span>
                  </>
                ) : null}
                <span className="g-funnel-bar" aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      )}
      <Description id={descriptionId}>{description}</Description>
    </div>
  );
}
