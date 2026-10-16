import { useSyncExternalStore } from 'react';

import { DEFAULT_LANG, isLang, type Lang } from './i18n/langs';

/**
 * ハッシュだけで動く最小のルーター。
 *
 * GitHub Pages のような静的ホスティングでは、/gassan/components/root のような
 * パスを直接開くとサーバーが 404 を返す。ハッシュならサーバーに届かないので、
 * どのページを直接開いても、再読み込みしても壊れない。
 *
 * 言語はハッシュの頭に置く（#/en/components/root）。日本語だけは頭に何も付けない。
 * 公開済みのリンク（#/components/root）が、そのまま日本語のページを指し続けるように。
 */

export interface Route {
  lang: Lang;
  /** `#/en/components/root/api` → `['components', 'root', 'api']` */
  segments: string[];
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const getHash = (): string => window.location.hash;

export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
  const [first, ...rest] = parts;
  return isLang(first) ? { lang: first, segments: rest } : { lang: DEFAULT_LANG, segments: parts };
}

export function useRoute(): Route {
  return parseHash(useSyncExternalStore(subscribe, getHash, () => ''));
}

/** いま URL が指している言語。 */
export function currentLang(): Lang {
  return parseHash(getHash()).lang;
}

/** サイト内リンクの href。`to('/spec')` → `#/spec`（日本語）/ `#/en/spec`（英語） */
export function to(path: string, lang: Lang = currentLang()): string {
  if (lang === DEFAULT_LANG) return `#${path}`;
  return `#/${lang}${path === '/' ? '' : path}`;
}

export function navigate(path: string): void {
  window.location.hash = to(path).slice(1);
}
