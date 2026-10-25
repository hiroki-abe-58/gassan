import type { ReactNode } from 'react';

import { ParetoChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartPareto(): ReactNode {
  const t = useDemoText('chartPareto');

  return (
    <ParetoChart
      label={t.label}
      description={t.description}
      valueLabel={t.count}
      data={[
        { label: t.login, value: 412 },
        { label: t.billing, value: 268 },
        { label: t.howTo, value: 185 },
        { label: t.bug, value: 74 },
        { label: t.cancel, value: 41 },
        // t:other
        { label: t.other, value: 63, other: true },
      ]}
      table
    />
  );
}
