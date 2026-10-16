import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { useDemoText } from '../i18n';

interface MonthlyRow {
  month: string;
  value: number;
}

/** t:bars */
function Bars({ rows }: { rows: readonly MonthlyRow[] }): ReactNode {
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <svg className="s-demo-bars" viewBox="0 0 250 140" preserveAspectRatio="xMidYMax meet">
      {rows.map((row, i) => {
        const height = Math.round((row.value / max) * 104);
        return (
          <g key={row.month}>
            <rect x={i * 50 + 9} y={118 - height} width={32} height={height} rx={4} />
            <text x={i * 50 + 25} y={134} textAnchor="middle">
              {row.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ChartReport(): ReactNode {
  const t = useDemoText('chartReport');
  const [open, setOpen] = useState(false);

  const MONTHLY: readonly MonthlyRow[] = [
    { month: t.jan, value: 62 },
    { month: t.feb, value: 88 },
    { month: t.mar, value: 120 },
    { month: t.apr, value: 104 },
    { month: t.may, value: 101 },
  ];

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root kind="view" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* t:chart */}
          <Modal.Chart
            label={t.label}
            summary={t.summary}
            data={
              <Modal.Table label={t.tableLabel}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{t.month}</th>
                      <th scope="col">{t.sales}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHLY.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Modal.Table>
            }
          >
            <Bars rows={MONTHLY} />
          </Modal.Chart>
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
