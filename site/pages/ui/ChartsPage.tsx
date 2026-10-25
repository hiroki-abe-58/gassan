import type { CSSProperties, ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ChartFeatures from '../../demos/ChartFeatures';
import chartFeaturesSource from '../../demos/ChartFeatures.tsx?raw';
import ChartFishbone from '../../demos/ChartFishbone';
import chartFishboneSource from '../../demos/ChartFishbone.tsx?raw';
import ChartFunnel from '../../demos/ChartFunnel';
import chartFunnelSource from '../../demos/ChartFunnel.tsx?raw';
import ChartGantt from '../../demos/ChartGantt';
import chartGanttSource from '../../demos/ChartGantt.tsx?raw';
import ChartHeatmap from '../../demos/ChartHeatmap';
import chartHeatmapSource from '../../demos/ChartHeatmap.tsx?raw';
import ChartPareto from '../../demos/ChartPareto';
import chartParetoSource from '../../demos/ChartPareto.tsx?raw';
import ChartRadar from '../../demos/ChartRadar';
import chartRadarSource from '../../demos/ChartRadar.tsx?raw';
import ChartRevenue from '../../demos/ChartRevenue';
import chartRevenueSource from '../../demos/ChartRevenue.tsx?raw';
import ChartScatter from '../../demos/ChartScatter';
import chartScatterSource from '../../demos/ChartScatter.tsx?raw';
import ChartSignups from '../../demos/ChartSignups';
import chartSignupsSource from '../../demos/ChartSignups.tsx?raw';
import ChartWaterfall from '../../demos/ChartWaterfall';
import chartWaterfallSource from '../../demos/ChartWaterfall.tsx?raw';
import ChartWidgets from '../../demos/ChartWidgets';
import chartWidgetsSource from '../../demos/ChartWidgets.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = [
  'Q-01',
  'Q-02',
  'Q-03',
  'Q-04',
  'Q-05',
  'Q-06',
  'Q-07',
  'Q-08',
  'Q-09',
  'Q-10',
  'Q-11',
  'Q-12',
  'Q-13',
  'Q-14',
  'Q-15',
  'Q-16',
  'Q-17',
  'Q-18',
  'Q-19',
  'Q-20',
];
const PALETTE = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `--g-chart-${String(n)}`);

export function UiChartsPage({ rest }: PageProps): ReactNode {
  const { nav, uiCharts: t } = useT();
  return (
    <ComponentPage
      path="/ui/charts"
      rest={rest}
      title={nav.pages.uiCharts}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="line" title={t.line.title} intro={t.line.intro}>
            <Example title={t.line.exampleTitle} description={t.line.exampleDescription} code={chartRevenueSource} demo="chartRevenue">
              <ChartRevenue />
            </Example>
          </Section>

          <Section id="bar" title={t.bar.title} intro={t.bar.intro}>
            <Example title={t.bar.stackedTitle} description={t.bar.stackedDescription} code={chartSignupsSource} demo="chartSignups">
              <ChartSignups />
            </Example>
            <Example title={t.bar.horizontalTitle} description={t.bar.horizontalDescription} code={chartFeaturesSource} demo="chartFeatures">
              <ChartFeatures />
            </Example>
          </Section>

          <Section id="widgets" title={t.widgets.title} intro={t.widgets.intro}>
            <Example title={t.widgets.exampleTitle} description={t.widgets.exampleDescription} code={chartWidgetsSource} demo="chartWidgets">
              <ChartWidgets />
            </Example>
          </Section>

          <Section id="scatter" title={t.scatter.title} intro={t.scatter.intro}>
            <Example title={t.scatter.exampleTitle} description={t.scatter.exampleDescription} code={chartScatterSource} demo="chartScatter">
              <ChartScatter />
            </Example>
          </Section>

          <Section id="radar" title={t.radar.title} intro={t.radar.intro}>
            <Example title={t.radar.exampleTitle} description={t.radar.exampleDescription} code={chartRadarSource} demo="chartRadar">
              <ChartRadar />
            </Example>
          </Section>

          <Section id="heatmap" title={t.heatmap.title} intro={t.heatmap.intro}>
            <Example title={t.heatmap.exampleTitle} description={t.heatmap.exampleDescription} code={chartHeatmapSource} demo="chartHeatmap">
              <ChartHeatmap />
            </Example>
          </Section>

          <Section id="waterfall" title={t.waterfall.title} intro={t.waterfall.intro}>
            <Example title={t.waterfall.exampleTitle} description={t.waterfall.exampleDescription} code={chartWaterfallSource} demo="chartWaterfall">
              <ChartWaterfall />
            </Example>
          </Section>

          <Section id="pareto" title={t.pareto.title} intro={t.pareto.intro}>
            <Example title={t.pareto.exampleTitle} description={t.pareto.exampleDescription} code={chartParetoSource} demo="chartPareto">
              <ChartPareto />
            </Example>
          </Section>

          <Section id="funnel" title={t.funnel.title} intro={t.funnel.intro}>
            <Example title={t.funnel.exampleTitle} description={t.funnel.exampleDescription} code={chartFunnelSource} demo="chartFunnel">
              <ChartFunnel />
            </Example>
          </Section>

          <Section id="fishbone" title={t.fishbone.title} intro={t.fishbone.intro}>
            <Example title={t.fishbone.exampleTitle} description={t.fishbone.exampleDescription} code={chartFishboneSource} demo="chartFishbone">
              <ChartFishbone />
            </Example>
          </Section>

          <Section id="gantt" title={t.gantt.title} intro={t.gantt.intro}>
            <Example title={t.gantt.exampleTitle} description={t.gantt.exampleDescription} code={chartGanttSource} demo="chartGantt">
              <ChartGantt />
            </Example>
          </Section>

          <Section id="choose" title={t.choose.title} intro={t.choose.intro}>
            <DataTable
              caption={t.choose.tableCaption}
              head={[t.choose.head.chart, t.choose.head.when, t.choose.head.avoid]}
              rows={t.choose.rows.map((row) => [row.chart, row.when, row.avoid])}
            />
          </Section>

          <Section id="access" title={t.access.title} intro={t.access.intro}>
            <DataTable
              caption={t.access.tableCaption}
              head={[t.access.head.key, t.access.head.action]}
              rows={t.access.rows.map((row) => [row.key, row.action])}
            />
          </Section>

          <Section id="colors" title={t.colors.title} intro={t.colors.intro}>
            <ul className="s-chart-palette" aria-label={t.colors.listLabel}>
              {PALETTE.map((name) => (
                <li key={name}>
                  <span className="s-swatch" style={{ '--s-swatch': `var(${name})` } as CSSProperties} aria-hidden="true" />
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ChartBaseProps" />
          <ApiTable name="CartesianChartProps" />
          <ApiTable name="LineChartProps" title="LineChart" />
          <ApiTable name="BarChartProps" title="BarChart" />
          <ApiTable name="ChartSeries" />
          <ApiTable name="DonutChartProps" title="DonutChart" />
          <ApiTable name="DonutDatum" />
          <ApiTable name="SparklineProps" title="Sparkline" />
          <ApiTable name="BarListProps" title="BarList" />
          <ApiTable name="BarListItem" />
          <ApiTable name="GaugeProps" title="Gauge" />
          <ApiTable name="ScatterChartProps" title="ScatterChart" />
          <ApiTable name="ScatterSeries" />
          <ApiTable name="ScatterPoint" />
          <ApiTable name="RadarChartProps" title="RadarChart" />
          <ApiTable name="HeatmapProps" title="Heatmap" />
          <ApiTable name="WaterfallChartProps" title="WaterfallChart" />
          <ApiTable name="WaterfallDatum" />
          <ApiTable name="ParetoChartProps" title="ParetoChart" />
          <ApiTable name="ParetoDatum" />
          <ApiTable name="FunnelChartProps" title="FunnelChart" />
          <ApiTable name="FunnelStep" />
          <ApiTable name="FishboneDiagramProps" title="FishboneDiagram" />
          <ApiTable name="FishboneCategory" />
          <ApiTable name="FishboneCause" />
          <ApiTable name="GanttChartProps" title="GanttChart" />
          <ApiTable name="GanttTask" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
