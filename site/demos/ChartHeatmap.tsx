import type { ReactNode } from 'react';

import { Heatmap } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const HOURS = Array.from({ length: 18 }, (_, index) => index + 6);
const DAY_LOAD = [1, 0.96, 0.93, 0.9, 0.82, 0.38, 0.3];
const HOUR_LOAD = [0.05, 0.14, 0.42, 0.82, 1, 0.92, 0.62, 0.78, 0.96, 0.88, 0.72, 0.5, 0.36, 0.3, 0.26, 0.2, 0.14, 0.08];
const SESSIONS = DAY_LOAD.map((day) => HOUR_LOAD.map((hour) => Math.round(140 * day * hour)));

export default function ChartHeatmap(): ReactNode {
  const t = useDemoText('chartHeatmap');
  // t:intl
  const weekday = new Intl.DateTimeFormat(t.locale, { weekday: 'short', timeZone: 'UTC' });
  const hour = new Intl.DateTimeFormat(t.locale, { hour: 'numeric', timeZone: 'UTC' });

  return (
    <Heatmap
      label={t.label}
      description={t.description}
      // t:monday
      rows={DAY_LOAD.map((_, index) => weekday.format(new Date(Date.UTC(2026, 9, 5 + index))))}
      columns={HOURS.map((h) => hour.format(new Date(Date.UTC(2026, 9, 5, h))))}
      values={SESSIONS}
      valueLabel={t.sessions}
    />
  );
}
