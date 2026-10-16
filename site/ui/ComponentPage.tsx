import type { ReactNode } from 'react';

import { useT } from '../i18n';
import { PageHeader } from './Page';
import { Tabs } from './Tabs';

export interface ComponentPageProps {
  path: string;
  rest: readonly string[];
  title: ReactNode;
  lead: ReactNode;
  ids: readonly string[];
  overview: () => ReactNode;
  api: () => ReactNode;
  a11y: () => ReactNode;
}

/** 部品ページの共通の骨格。「概要 / API / アクセシビリティ」の 3 タブ。 */
export function ComponentPage({ path, rest, title, lead, ids, overview, api, a11y }: ComponentPageProps): ReactNode {
  const t = useT().common.component;
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={title} lead={lead} ids={ids} />
      <Tabs
        label={t.tabs}
        basePath={path}
        current={rest[0]}
        tabs={[
          { id: 'overview', label: t.overview, render: overview },
          { id: 'api', label: t.api, render: api },
          { id: 'a11y', label: t.a11y, render: a11y },
        ]}
      />
    </>
  );
}
