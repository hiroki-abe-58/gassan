import type { ReactNode } from 'react';

import { BarList, Card, DonutChart, Gauge, Sparkline, Stat } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

// t:dailyData
const DAILY = [
  420000, 380000, 450000, 510000, 470000, 390000, 360000, 440000, 490000, 530000, 580000, 540000, 470000, 450000, 520000,
  570000, 610000, 590000, 550000, 490000, 510000, 580000, 630000, 660000, 620000, 570000, 600000, 670000, 710000, 740000,
];

export default function ChartWidgets(): ReactNode {
  const t = useDemoText('chartWidgets');

  return (
    <div className="s-chart-widgets">
      <Card title={t.sales}>
        <Stat label={t.thisMonth} value="¥16,100,000" delta="+18%" trend="up" description={t.vsLastMonth} />
        {/* t:sparkline */}
        <Sparkline label={t.daily} data={DAILY} type="area" valueFormat={{ style: 'currency', currency: 'JPY', notation: 'compact' }} />
      </Card>

      <Card title={t.storage}>
        {/* t:gauge */}
        <Gauge label={t.storageUsed} value={17.2} max={20} tone="warning" valueText={(value, min, max) => fmt(t.gb, String(value - min), String(max))} />
      </Card>

      <Card title={t.plans}>
        <DonutChart
          label={t.plans}
          data={[
            { label: t.free, value: 1284 },
            { label: t.pro, value: 642 },
            { label: t.business, value: 96 },
            { label: t.enterprise, value: 12 },
          ]}
          centerLabel={t.workspaces}
          size={160}
        />
      </Card>

      <Card title={t.pages}>
        <BarList
          label={t.pages}
          data={[
            { label: '/dashboard', value: 12400 },
            { label: '/reports', value: 8210 },
            { label: '/settings', value: 3120 },
            { label: '/billing', value: 1980 },
            { label: '/members', value: 1240 },
          ]}
        />
      </Card>
    </div>
  );
}
