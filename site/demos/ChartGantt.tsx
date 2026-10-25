import type { ReactNode } from 'react';

import { GanttChart } from '@genelab/gassan';
import { useDemoText } from '../i18n';

// t:relative
function day(offset: number): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset)).toISOString().slice(0, 10);
}

export default function ChartGantt(): ReactNode {
  const t = useDemoText('chartGantt');

  return (
    <GanttChart
      label={t.label}
      description={t.description}
      tasks={[
        { label: t.requirements, start: day(-14), end: day(-10), progress: 1, group: t.design },
        { label: t.screens, start: day(-7), end: day(4), progress: 0.7, group: t.design },
        { label: t.review, start: day(4), milestone: true, group: t.design },
        { label: t.api, start: day(0), end: day(18), progress: 0.25, group: t.build },
        { label: t.frontend, start: day(7), end: day(25), progress: 0, group: t.build },
        { label: t.testing, start: day(21), end: day(32), group: t.qa },
        { label: t.release, start: day(35), milestone: true, group: t.qa },
      ]}
    />
  );
}
