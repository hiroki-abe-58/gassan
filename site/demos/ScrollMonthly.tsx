import type { ReactNode } from 'react';

import { ScrollArea } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ScrollMonthly(): ReactNode {
  const t = useDemoText('scrollMonthly');
  const month = new Intl.DateTimeFormat(t.locale, { month: 'short', timeZone: 'UTC' });
  const months = Array.from({ length: 12 }, (_, index) => month.format(new Date(Date.UTC(2026, index, 1))));
  // t:sales
  const rows = [
    { plan: t.plans.free, sales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { plan: t.plans.pro, sales: [182, 190, 205, 214, 228, 236, 241, 255, 262, 270, 281, 296] },
    { plan: t.plans.max, sales: [24, 31, 29, 36, 41, 47, 52, 58, 61, 66, 72, 80] },
    { plan: t.plans.enterprise, sales: [310, 310, 325, 325, 340, 340, 355, 355, 370, 370, 385, 400] },
  ];

  return (
    <ScrollArea orientation="horizontal" label={t.label} viewportClassName="s-scroll-table">
      <table className="s-table">
        <caption className="s-sr-only">{t.label}</caption>
        <thead>
          <tr>
            <th scope="col">{t.plan}</th>
            {months.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.plan}>
              <th scope="row">{row.plan}</th>
              {row.sales.map((value, index) => (
                <td key={months[index]}>{value.toLocaleString(t.locale)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
