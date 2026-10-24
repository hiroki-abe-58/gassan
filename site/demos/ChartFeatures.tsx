import type { ReactNode } from 'react';

import { BarChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartFeatures(): ReactNode {
  const t = useDemoText('chartFeatures');

  return (
    // t:layout
    <BarChart
      label={t.label}
      layout="horizontal"
      data={[
        { feature: t.dashboard, uses: 18420 },
        { feature: t.api, uses: 12880 },
        { feature: t.reports, uses: 9310 },
        { feature: t.invites, uses: 4120 },
        { feature: t.invoices, uses: 2310 },
      ]}
      x="feature"
      series={[{ key: 'uses', label: t.uses }]}
    />
  );
}
