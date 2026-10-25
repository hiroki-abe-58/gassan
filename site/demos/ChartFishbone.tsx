import type { ReactNode } from 'react';

import { FishboneDiagram } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChartFishbone(): ReactNode {
  const t = useDemoText('chartFishbone');

  return (
    <FishboneDiagram
      label={t.label}
      effect={t.effect}
      description={t.description}
      // t:sixM
      categories={[
        { label: t.man, causes: [t.causes.skill, { label: t.causes.procedure, causes: [t.causes.manual] }, t.causes.fatigue] },
        { label: t.machine, causes: [t.causes.wear, t.causes.sensor] },
        { label: t.method, causes: [t.causes.order, t.causes.inspection] },
        { label: t.material, causes: [t.causes.lot, { label: t.causes.storage, causes: [t.causes.humidity] }] },
        { label: t.measurement, causes: [t.causes.gauge, t.causes.sampling] },
        { label: t.environment, causes: [t.causes.temperature, t.causes.dust] },
      ]}
    />
  );
}
