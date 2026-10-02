import { data } from 'virtual:gassan-data';

import type { SpecItem } from './schema';

export { data };
export type * from './schema';

const byId = new Map<string, SpecItem>();
for (const category of data.categories) {
  for (const item of category.items) byId.set(item.id, item);
}

/** 仕様の項目を ID で引く。存在しない ID を渡したら開発時に落とす（ページ側の書き間違いを残さない）。 */
export function specItem(id: string): SpecItem | undefined {
  const item = byId.get(id);
  if (!item && import.meta.env.DEV) throw new Error(`仕様に ${id} が無い`);
  return item;
}

export const allItems: readonly SpecItem[] = [...byId.values()];

/** GitHub 上のファイルへのリンク。 */
export function repoFile(path: string): string {
  return `${data.meta.repository}/blob/main/${path.replace(/^\.\//, '')}`;
}
