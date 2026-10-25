import type { ReactNode } from 'react';

import { ScrollArea } from '@genelab/gassan';

/**
 * 横に送れる表の器。狭い画面では表だけを横に送り、バーはライブラリの ScrollArea（U-35）で描く。
 * 窓は名前のあるまとまりで Tab で止まる（B-13）。余白は器が持つ（窓に付けると、バーが余白ぶん下にずれる）。
 */
export function TableScroll({ label, children }: { label: string; children: ReactNode }): ReactNode {
  return (
    <ScrollArea orientation="horizontal" label={label} className="s-table-scroll" viewportClassName="s-table-wrap">
      {children}
    </ScrollArea>
  );
}
