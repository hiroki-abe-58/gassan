import type { ReactNode } from 'react';

import { RadarChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartRadar(): ReactNode {
  const t = useDemoText('chartRadar');

  return (
    <RadarChart
      label={t.label}
      description={t.description}
      data={[
        { axis: t.axes.features, ours: 4, rival: 5 },
        { axis: t.axes.ease, ours: 5, rival: 3 },
        { axis: t.axes.price, ours: 4, rival: 3 },
        { axis: t.axes.support, ours: 5, rival: 4 },
        { axis: t.axes.integrations, ours: 3, rival: 5 },
        { axis: t.axes.security, ours: 4, rival: 4 },
      ]}
      x="axis"
      xLabel={t.axis}
      series={[
        { key: 'ours', label: t.ours },
        { key: 'rival', label: t.rival },
      ]}
      // t:max
      max={5}
      table
    />
  );
}
