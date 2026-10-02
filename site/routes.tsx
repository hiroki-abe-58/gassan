import type { ComponentType } from 'react';

import { Home } from './pages/Home';
import { GetStarted } from './pages/GetStarted';
import { NotFound } from './pages/NotFound';
import { Accessibility } from './pages/foundations/Accessibility';
import { Kinds } from './pages/foundations/Kinds';
import { Layers } from './pages/foundations/Layers';
import { Notes } from './pages/foundations/Notes';
import { Purpose } from './pages/foundations/Purpose';
import { Rules } from './pages/foundations/Rules';
import { Color } from './pages/styles/Color';
import { Layout } from './pages/styles/Layout';
import { Motion } from './pages/styles/Motion';
import { Scrim } from './pages/styles/Scrim';
import { BodyPage } from './pages/components/BodyPage';
import { ChartPage } from './pages/components/ChartPage';
import { FieldPage } from './pages/components/FieldPage';
import { FooterPage } from './pages/components/FooterPage';
import { GatePage } from './pages/components/GatePage';
import { HeaderPage } from './pages/components/HeaderPage';
import { ImperativePage } from './pages/components/ImperativePage';
import { MediaPage } from './pages/components/MediaPage';
import { ProviderPage } from './pages/components/ProviderPage';
import { RootPage } from './pages/components/RootPage';
import { SheetPage } from './pages/components/SheetPage';
import { TitlePage } from './pages/components/TitlePage';
import { Spec } from './pages/reference/Spec';
import { Verification } from './pages/reference/Verification';

export interface PageProps {
  /** ページのパスより後ろのセグメント（タブ名・項目 ID など）。 */
  rest: readonly string[];
}

export type SectionId = 'start' | 'foundations' | 'styles' | 'components' | 'reference';

export interface PageDef {
  path: string;
  title: string;
  /** ナビに出す短い名前。省略時は title。 */
  nav?: string;
  section: SectionId;
  Component: ComponentType<PageProps>;
}

export const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: 'start', label: 'はじめに' },
  { id: 'foundations', label: '設計思想' },
  { id: 'styles', label: 'スタイル' },
  { id: 'components', label: 'コンポーネント' },
  { id: 'reference', label: '仕様と検証' },
];

/** ナビの並び順がそのまま「前へ / 次へ」の順になる。 */
export const PAGES: readonly PageDef[] = [
  { path: '/', title: 'ホーム', section: 'start', Component: Home },
  { path: '/start', title: 'はじめる', section: 'start', Component: GetStarted },

  { path: '/foundations/purpose', title: 'モーダルの存在理由', section: 'foundations', Component: Purpose },
  { path: '/foundations/layers', title: '4 層モデル', section: 'foundations', Component: Layers },
  { path: '/foundations/kinds', title: '5 つの類型と決め方', section: 'foundations', Component: Kinds },
  { path: '/foundations/accessibility', title: 'アクセシビリティ', section: 'foundations', Component: Accessibility },
  { path: '/foundations/rules', title: '禁止事項と品質基準', section: 'foundations', Component: Rules },
  { path: '/foundations/notes', title: '実装ノート', section: 'foundations', Component: Notes },

  { path: '/styles/scrim', title: 'スクリム', section: 'styles', Component: Scrim },
  { path: '/styles/color', title: '色とコントラスト', section: 'styles', Component: Color },
  { path: '/styles/layout', title: '寸法と配置', section: 'styles', Component: Layout },
  { path: '/styles/motion', title: 'モーション', section: 'styles', Component: Motion },

  { path: '/components/root', title: 'Modal.Root', section: 'components', Component: RootPage },
  { path: '/components/header', title: 'Header と Controls', section: 'components', Component: HeaderPage },
  { path: '/components/title', title: 'Title と Description', section: 'components', Component: TitlePage },
  { path: '/components/body', title: 'Body と Section', section: 'components', Component: BodyPage },
  { path: '/components/footer', title: 'Footer と Button', section: 'components', Component: FooterPage },
  { path: '/components/gate', title: '活性化ゲート', section: 'components', Component: GatePage },
  { path: '/components/field', title: 'フォーム部品', section: 'components', Component: FieldPage },
  { path: '/components/media', title: 'Media と Gallery', section: 'components', Component: MediaPage },
  { path: '/components/chart', title: 'Modal.Chart', section: 'components', Component: ChartPage },
  { path: '/components/sheet', title: 'シートと Handle', section: 'components', Component: SheetPage },
  { path: '/components/imperative', title: '命令的 API', section: 'components', Component: ImperativePage },
  { path: '/components/provider', title: 'GassanProvider', section: 'components', Component: ProviderPage },

  { path: '/spec', title: '振る舞い仕様', section: 'reference', Component: Spec },
  { path: '/verification', title: '検証', section: 'reference', Component: Verification },
];

const NOT_FOUND: PageDef = { path: '/404', title: 'ページが見つからない', section: 'start', Component: NotFound };

/** セグメントに最も長く前方一致するページを選び、残りを rest として渡す。 */
export function resolve(segments: readonly string[]): { page: PageDef; rest: string[] } {
  if (segments.length === 0) return { page: PAGES[0] ?? NOT_FOUND, rest: [] };
  let best: PageDef | undefined;
  let bestLength = 0;
  for (const page of PAGES) {
    const parts = page.path.split('/').filter(Boolean);
    if (parts.length === 0 || parts.length < bestLength) continue;
    if (parts.every((part, i) => segments[i] === part)) {
      best = page;
      bestLength = parts.length;
    }
  }
  return best ? { page: best, rest: segments.slice(bestLength) } : { page: NOT_FOUND, rest: [] };
}

export function neighbours(page: PageDef): { prev?: PageDef; next?: PageDef } {
  const index = PAGES.indexOf(page);
  if (index < 0) return {};
  const prev = index > 1 ? PAGES[index - 1] : undefined;
  const next = PAGES[index + 1];
  return { ...(prev ? { prev } : {}), ...(next ? { next } : {}) };
}
