import { useSyncExternalStore } from 'react';

/**
 * ハッシュだけで動く最小のルーター。
 *
 * GitHub Pages のような静的ホスティングでは、/gassan/components/root のような
 * パスを直接開くとサーバーが 404 を返す。ハッシュならサーバーに届かないので、
 * どのページを直接開いても、再読み込みしても壊れない。
 */

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const getHash = (): string => window.location.hash;

/** `#/components/root/api` → `['components', 'root', 'api']` */
export function useSegments(): string[] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  return hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

/** サイト内リンクの href。`to('/spec')` → `#/spec` */
export function to(path: string): string {
  return `#${path}`;
}

export function navigate(path: string): void {
  window.location.hash = path;
}
