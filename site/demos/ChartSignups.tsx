import type { ReactNode } from 'react';

import { BarChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const SIGNUPS = [
  { month: '2026-05', free: 320, pro: 140, business: 24 },
  { month: '2026-06', free: 352, pro: 151, business: 31 },
  { month: '2026-07', free: 298, pro: 166, business: 29 },
  { month: '2026-08', free: 410, pro: 182, business: 36 },
  { month: '2026-09', free: 436, pro: 205, business: 41 },
  { month: '2026-10', free: 471, pro: 228, business: 47 },
];

export default function ChartSignups(): ReactNode {
  const t = useDemoText('chartSignups');
  const month = new Intl.DateTimeFormat(t.locale, { month: 'short', timeZone: 'UTC' });

  return (
    <BarChart
      label={t.label}
      description={t.description}
      data={SIGNUPS}
      x="month"
      xFormat={(value) => month.format(new Date(`${String(value)}-01`))}
      xLabel={t.month}
      series={[
        { key: 'free', label: t.free },
        { key: 'pro', label: t.pro },
        { key: 'business', label: t.business },
      ]}
      stacked
      table
    />
  );
}
