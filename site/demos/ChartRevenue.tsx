import type { ReactNode } from 'react';

import { LineChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const MONTHLY = [
  { month: '2026-01', revenue: 1180000, cost: 820000 },
  { month: '2026-02', revenue: 1240000, cost: 850000 },
  { month: '2026-03', revenue: 1520000, cost: 900000 },
  { month: '2026-04', revenue: 1460000, cost: 940000 },
  { month: '2026-05', revenue: 1610000, cost: 960000 },
  { month: '2026-06', revenue: 1730000, cost: 1010000 },
  { month: '2026-07', revenue: 1690000, cost: 1040000 },
  { month: '2026-08', revenue: 1820000, cost: 1060000 },
  { month: '2026-09', revenue: 1980000, cost: 1100000 },
  { month: '2026-10', revenue: 2140000, cost: 1150000 },
  { month: '2026-11', revenue: 2090000, cost: 1180000 },
  { month: '2026-12', revenue: 2360000, cost: 1220000 },
];

export default function ChartRevenue(): ReactNode {
  const t = useDemoText('chartRevenue');
  // t:intl
  const month = new Intl.DateTimeFormat(t.locale, { month: 'short', timeZone: 'UTC' });

  return (
    <LineChart
      label={t.label}
      description={t.description}
      data={MONTHLY}
      x="month"
      xFormat={(value) => month.format(new Date(`${String(value)}-01`))}
      xLabel={t.month}
      series={[
        { key: 'revenue', label: t.revenue },
        { key: 'cost', label: t.cost },
      ]}
      valueFormat={{ style: 'currency', currency: 'JPY' }}
      area
      table
    />
  );
}
