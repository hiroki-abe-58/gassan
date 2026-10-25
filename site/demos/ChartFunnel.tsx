import type { ReactNode } from 'react';

import { FunnelChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartFunnel(): ReactNode {
  const t = useDemoText('chartFunnel');

  return (
    <FunnelChart
      label={t.label}
      description={t.description}
      data={[
        { label: t.visit, value: 48200 },
        { label: t.signUp, value: 6120 },
        { label: t.firstProject, value: 3980 },
        { label: t.invite, value: 1730 },
        { label: t.paid, value: 690 },
      ]}
    />
  );
}
