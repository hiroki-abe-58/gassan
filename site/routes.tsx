import type { ComponentType } from 'react';

import type { Messages } from './i18n';
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
import { LineBreak } from './pages/styles/LineBreak';
import { Motion } from './pages/styles/Motion';
import { Scrim } from './pages/styles/Scrim';
import { Theme } from './pages/styles/Theme';
import { BodyPage } from './pages/components/BodyPage';
import { ButtonPage } from './pages/components/ButtonPage';
import { ChartPage } from './pages/components/ChartPage';
import { ChoicePage } from './pages/components/ChoicePage';
import { DatePickerPage } from './pages/components/DatePickerPage';
import { FieldPage } from './pages/components/FieldPage';
import { FileDropPage } from './pages/components/FileDropPage';
import { FooterPage } from './pages/components/FooterPage';
import { GatePage } from './pages/components/GatePage';
import { HeaderPage } from './pages/components/HeaderPage';
import { ImperativePage } from './pages/components/ImperativePage';
import { ToastPage } from './pages/components/ToastPage';
import { UiBadgesPage } from './pages/ui/BadgesPage';
import { UiButtonsPage } from './pages/ui/ButtonsPage';
import { UiCommandPage } from './pages/ui/CommandPage';
import { UiChartsPage } from './pages/ui/ChartsPage';
import { UiCarouselPage } from './pages/ui/CarouselPage';
import { UiChatPage } from './pages/ui/ChatPage';
import { UiDataPage } from './pages/ui/DataPage';
import { UiFeedbackPage } from './pages/ui/FeedbackPage';
import { UiLayoutPage } from './pages/ui/LayoutPage';
import { UiNavigationPage } from './pages/ui/NavigationPage';
import { UiOverlaysPage } from './pages/ui/OverlaysPage';
import { MediaPage } from './pages/components/MediaPage';
import { ProviderPage } from './pages/components/ProviderPage';
import { RootPage } from './pages/components/RootPage';
import { SelectPage } from './pages/components/SelectPage';
import { SheetPage } from './pages/components/SheetPage';
import { SliderPage } from './pages/components/SliderPage';
import { TextInputPage } from './pages/components/TextInputPage';
import { TitlePage } from './pages/components/TitlePage';
import { Spec } from './pages/reference/Spec';
import { Verification } from './pages/reference/Verification';
import { AppPagesTemplatesPage } from './pages/templates/AppPagesTemplatesPage';
import { ConversationTemplatesPage } from './pages/templates/ConversationTemplatesPage';
import { AppTemplatesPage } from './pages/templates/AppTemplatesPage';
import { AuthTemplatesPage } from './pages/templates/AuthTemplatesPage';
import { PublicTemplatesPage } from './pages/templates/PublicTemplatesPage';
import { StatusTemplatesPage } from './pages/templates/StatusTemplatesPage';

export interface PageProps {
  /** ページのパスより後ろのセグメント（タブ名・項目 ID など）。 */
  rest: readonly string[];
}

export type SectionId = keyof Messages['nav']['sections'];

/** 題名は言語ごとに i18n/<lang>/nav.ts の pages[key] から引く。 */
export type PageKey = keyof Messages['nav']['pages'];

export interface PageDef {
  path: string;
  key: PageKey;
  section: SectionId;
  Component: ComponentType<PageProps>;
}

export const SECTIONS: readonly SectionId[] = ['start', 'foundations', 'styles', 'components', 'ui', 'forms', 'templates', 'reference'];

/** ナビの並び順がそのまま「前へ / 次へ」の順になる。 */
export const PAGES: readonly PageDef[] = [
  { path: '/', key: 'home', section: 'start', Component: Home },
  { path: '/start', key: 'start', section: 'start', Component: GetStarted },

  { path: '/foundations/purpose', key: 'purpose', section: 'foundations', Component: Purpose },
  { path: '/foundations/layers', key: 'layers', section: 'foundations', Component: Layers },
  { path: '/foundations/kinds', key: 'kinds', section: 'foundations', Component: Kinds },
  { path: '/foundations/accessibility', key: 'accessibility', section: 'foundations', Component: Accessibility },
  { path: '/foundations/rules', key: 'rules', section: 'foundations', Component: Rules },
  { path: '/foundations/notes', key: 'notes', section: 'foundations', Component: Notes },

  { path: '/styles/scrim', key: 'scrim', section: 'styles', Component: Scrim },
  { path: '/styles/color', key: 'color', section: 'styles', Component: Color },
  { path: '/styles/theme', key: 'theme', section: 'styles', Component: Theme },
  { path: '/styles/layout', key: 'layout', section: 'styles', Component: Layout },
  { path: '/styles/line-break', key: 'lineBreak', section: 'styles', Component: LineBreak },
  { path: '/styles/motion', key: 'motion', section: 'styles', Component: Motion },

  { path: '/components/root', key: 'root', section: 'components', Component: RootPage },
  { path: '/components/header', key: 'header', section: 'components', Component: HeaderPage },
  { path: '/components/title', key: 'title', section: 'components', Component: TitlePage },
  { path: '/components/body', key: 'body', section: 'components', Component: BodyPage },
  { path: '/components/footer', key: 'footer', section: 'components', Component: FooterPage },
  { path: '/components/button', key: 'button', section: 'components', Component: ButtonPage },
  { path: '/components/gate', key: 'gate', section: 'components', Component: GatePage },
  { path: '/components/media', key: 'media', section: 'components', Component: MediaPage },
  { path: '/components/chart', key: 'chart', section: 'components', Component: ChartPage },
  { path: '/components/sheet', key: 'sheet', section: 'components', Component: SheetPage },
  { path: '/components/imperative', key: 'imperative', section: 'components', Component: ImperativePage },
  { path: '/components/toast', key: 'toast', section: 'components', Component: ToastPage },

  { path: '/ui/buttons', key: 'uiButtons', section: 'ui', Component: UiButtonsPage },
  { path: '/ui/badges', key: 'uiBadges', section: 'ui', Component: UiBadgesPage },
  { path: '/ui/feedback', key: 'uiFeedback', section: 'ui', Component: UiFeedbackPage },
  { path: '/ui/layout', key: 'uiLayout', section: 'ui', Component: UiLayoutPage },
  { path: '/ui/navigation', key: 'uiNavigation', section: 'ui', Component: UiNavigationPage },
  { path: '/ui/overlays', key: 'uiOverlays', section: 'ui', Component: UiOverlaysPage },
  { path: '/ui/data', key: 'uiData', section: 'ui', Component: UiDataPage },
  { path: '/ui/command', key: 'uiCommand', section: 'ui', Component: UiCommandPage },
  { path: '/ui/charts', key: 'uiCharts', section: 'ui', Component: UiChartsPage },
  { path: '/ui/carousel', key: 'uiCarousel', section: 'ui', Component: UiCarouselPage },
  { path: '/ui/chat', key: 'uiChat', section: 'ui', Component: UiChatPage },
  { path: '/components/provider', key: 'provider', section: 'components', Component: ProviderPage },

  // 公開済みのリンクを壊さないよう、パスは /components の下のまま。ナビの節だけを分ける。
  { path: '/components/field', key: 'field', section: 'forms', Component: FieldPage },
  { path: '/components/text-input', key: 'textInput', section: 'forms', Component: TextInputPage },
  { path: '/components/choice', key: 'choice', section: 'forms', Component: ChoicePage },
  { path: '/components/select', key: 'select', section: 'forms', Component: SelectPage },
  { path: '/components/slider', key: 'slider', section: 'forms', Component: SliderPage },
  { path: '/components/date-picker', key: 'datePicker', section: 'forms', Component: DatePickerPage },
  { path: '/components/file-drop', key: 'fileDrop', section: 'forms', Component: FileDropPage },

  { path: '/templates/auth', key: 'templatesAuth', section: 'templates', Component: AuthTemplatesPage },
  { path: '/templates/status', key: 'templatesStatus', section: 'templates', Component: StatusTemplatesPage },
  { path: '/templates/public', key: 'templatesPublic', section: 'templates', Component: PublicTemplatesPage },
  { path: '/templates/app', key: 'templatesApp', section: 'templates', Component: AppTemplatesPage },
  { path: '/templates/app-pages', key: 'templatesAppPages', section: 'templates', Component: AppPagesTemplatesPage },
  { path: '/templates/conversations', key: 'templatesConversations', section: 'templates', Component: ConversationTemplatesPage },

  { path: '/spec', key: 'spec', section: 'reference', Component: Spec },
  { path: '/verification', key: 'verification', section: 'reference', Component: Verification },
];

const NOT_FOUND: PageDef = { path: '/404', key: 'notFound', section: 'start', Component: NotFound };

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
