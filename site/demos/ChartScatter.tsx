import type { ReactNode } from 'react';

import { ScatterChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartScatter(): ReactNode {
  const t = useDemoText('chartScatter');

  return (
    <ScatterChart
      label={t.label}
      description={t.description}
      xLabel={t.adoption}
      yLabel={t.satisfaction}
      // t:size
      sizeLabel={t.users}
      xFormat={{ style: 'percent' }}
      yFormat={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      series={[
        {
          key: 'core',
          label: t.core,
          data: [
            { label: t.features.search, x: 0.92, y: 4.4, size: 18400 },
            { label: t.features.sharing, x: 0.78, y: 4.1, size: 15600 },
            { label: t.features.export, x: 0.64, y: 3.6, size: 12800 },
            { label: t.features.notifications, x: 0.85, y: 3.2, size: 17000 },
            { label: t.features.permissions, x: 0.41, y: 3.9, size: 8200 },
          ],
        },
        {
          key: 'new',
          label: t.added,
          data: [
            { label: t.features.automation, x: 0.23, y: 4.6, size: 4600 },
            { label: t.features.summary, x: 0.35, y: 4.2, size: 7000 },
            { label: t.features.integrations, x: 0.18, y: 3.4, size: 3600 },
          ],
        },
      ]}
      table
    />
  );
}
