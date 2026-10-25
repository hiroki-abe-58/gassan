/**
 * ドキュメントサイトの API の表（site/ui/ApiTable）。
 *
 * 表のもとは site/plugins/gassan-data.ts が src の型から作るデータ。集めるのは、名前が Props で終わる interface と、
 * 一覧（EXTRA_INTERFACES）に挙げた interface だけなので、ページが求める名前が漏れると、開発中は例外になり、
 * 本番のビルドでは表が黙って消える（日本の入力・ログインと登録の形・業種ごとの登録の API の表で起きていた）。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildData } from '../site/plugins/gassan-data';

const pageFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? pageFiles(join(dir, entry.name)) : entry.name.endsWith('.tsx') ? [join(dir, entry.name)] : [],
  );

describe('site / API の表', () => {
  it('ページが求める API の表は、どれもサイトのデータに型がある（漏れると本番では表が黙って消える）', () => {
    const { api } = buildData();
    const wanted = pageFiles('site/pages').flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/<ApiTable name="([A-Za-z0-9]+)"/g)].map((match) => match[1] ?? ''),
    );
    expect(wanted.length).toBeGreaterThan(100);
    expect(wanted.filter((name) => !(name in api))).toEqual([]);
    // サイトのデータは src の型を TypeScript で読んで作るので、数秒かかる
  }, 60_000);
});
