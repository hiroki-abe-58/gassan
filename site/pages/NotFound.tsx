import type { ReactNode } from 'react';

import { useT } from '../i18n';
import { to } from '../router';
import { PageHeader } from '../ui/Page';

export function NotFound(): ReactNode {
  const t = useT().common.notFound;
  return (
    <>
      <PageHeader eyebrow="404" title={t.title} lead={t.lead} />
      <p>
        <a className="s-btn" href={to('/')}>
          {t.back}
        </a>
      </p>
    </>
  );
}
