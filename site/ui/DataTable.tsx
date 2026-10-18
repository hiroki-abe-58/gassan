import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

/**
 * 1 列目を行見出しにした表。横に溢れたらスクロールできる領域（名前つき・フォーカス可）に入れる（B-13 と同じ形）。
 */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}): ReactNode {
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption}>
      <table className="s-table">
        <caption className="s-sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Phrase>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, column) =>
                  column === 0 ? (
                    <th key={column} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={column}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </Phrase>
        </tbody>
      </table>
    </div>
  );
}
