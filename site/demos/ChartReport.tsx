import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const MONTHLY = [
  { month: '1月', value: 62 },
  { month: '2月', value: 88 },
  { month: '3月', value: 120 },
  { month: '4月', value: 104 },
  { month: '5月', value: 101 },
] as const;

/** 図は何で描いてもよい。gassan は描画しない。 */
function Bars(): ReactNode {
  const max = Math.max(...MONTHLY.map((row) => row.value));
  return (
    <svg className="s-demo-bars" viewBox="0 0 250 140" preserveAspectRatio="xMidYMax meet">
      {MONTHLY.map((row, i) => {
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        月次レポート
      </button>

      <Modal.Root kind="view" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>月次レポート（1〜5月）</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 名前（label）と傾向の要約（summary）は必須。図そのものは既定で aria-hidden（B-14） */}
          <Modal.Chart
            label="月別の売上（万円）"
            summary="3月が最大の120万円。4月以降は100万円前後で横ばい。"
            data={
              <Modal.Table label="月別の売上の元データ">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">月</th>
                      <th scope="col">売上（万円）</th>
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
            <Bars />
          </Modal.Chart>
        </Modal.Body>
      </Modal.Root>
    </>
  );
}
