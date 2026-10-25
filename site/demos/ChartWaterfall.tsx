import type { ReactNode } from 'react';

import { WaterfallChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartWaterfall(): ReactNode {
  const t = useDemoText('chartWaterfall');

  return (
    <WaterfallChart
      label={t.label}
      description={t.description}
      data={[
        { label: t.start, value: 4820000, kind: 'total' },
        { label: t.newBusiness, value: 640000 },
        { label: t.expansion, value: 310000 },
        { label: t.contraction, value: -120000 },
        { label: t.churn, value: -260000 },
        // t:total
        { label: t.end, kind: 'total' },
      ]}
      valueFormat={{ style: 'currency', currency: 'JPY' }}
      table
    />
  );
}
