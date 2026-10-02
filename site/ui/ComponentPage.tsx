import type { ReactNode } from 'react';

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
  return (
    <>
      <PageHeader eyebrow="コンポーネント" title={title} lead={lead} ids={ids} />
      <Tabs
        label="このページの内容"
        basePath={path}
        current={rest[0]}
        tabs={[
          { id: 'overview', label: '概要', render: overview },
          { id: 'api', label: 'API', render: api },
          { id: 'a11y', label: 'アクセシビリティ', render: a11y },
        ]}
      />
    </>
  );
}
