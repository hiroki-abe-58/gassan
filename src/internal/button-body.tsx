import type { ReactNode } from 'react';

import { usePhrase } from '../phrase';

/**
 * ボタンの中身。文字は文節で折る器に、印はその外に置く（印と文節の間に隙間が入らないように）。
 * Button・ButtonLink と、テンプレートのボタンの見た目のリンクが共有する。
 */
export function ButtonBody({ iconStart, iconEnd, children }: { iconStart?: ReactNode; iconEnd?: ReactNode; children: ReactNode }): ReactNode {
  const phrase = usePhrase();
  return (
    <span className="g-btn-body">
      {iconStart}
      <span className="g-btn-label">{phrase(children)}</span>
      {iconEnd}
    </span>
  );
}
