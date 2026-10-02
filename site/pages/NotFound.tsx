import type { ReactNode } from 'react';

import { to } from '../router';
import { PageHeader } from '../ui/Page';

export function NotFound(): ReactNode {
  return (
    <>
      <PageHeader eyebrow="404" title="ページが見つからない" lead="リンクが古いか、アドレスが違っている。" />
      <p>
        <a className="s-btn" href={to('/')}>
          ホームへ戻る
        </a>
      </p>
    </>
  );
}
