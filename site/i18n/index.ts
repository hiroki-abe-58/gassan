import { useSyncExternalStore } from 'react';

import type { Messages } from './ja';
import { DEFAULT_LANG, type Lang } from './langs';

export { fmt } from './demo-text';
export { DEFAULT_LANG, LANGS, LANG_NAMES, isLang, type Lang } from './langs';
export type { Messages } from './ja';

/**
 * サイトの文言。言語ごとに別のチャンクにして、選ばれた言語だけを読む。
 *
 * 原本は ja/ で、型（Messages）も ja/ から取る。ほかの言語は `satisfies` で同じ形を強制するので、
 * 訳し漏れ（キーの欠け）と余計なキーは型チェックで落ちる。
 */
const LOADERS: Record<Lang, () => Promise<{ default: Messages }>> = {
  ja: () => import('./ja'),
  en: () => import('./en'),
  'zh-Hans': () => import('./zh-Hans'),
  'zh-Hant': () => import('./zh-Hant'),
  ko: () => import('./ko'),
  th: () => import('./th'),
};

interface I18nState {
  lang: Lang;
  t: Messages;
}

let state: I18nState | undefined;
let requested: Lang | undefined;
const listeners = new Set<() => void>();

/**
 * 言語を切り替える。読み終えるまでは前の言語のまま描く（白い画面を挟まない）。
 * 読んでいる間に別の言語が選ばれたら、古い方の結果は捨てる。
 */
export async function loadLang(lang: Lang): Promise<void> {
  if (state?.lang === lang) return;
  requested = lang;
  const { default: t } = await LOADERS[lang]();
  if (requested !== lang) return;
  state = { lang, t };
  document.documentElement.lang = lang;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = (): I18nState | undefined => state;

export function useI18n(): I18nState {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  if (!current) throw new Error('描画より先に loadLang() を呼ぶ（site/main.tsx）');
  return current;
}

export const useT = (): Messages => useI18n().t;

export const useLang = (): Lang => useI18n().lang;

/** 仕様書の原文の言語。仕様から読み込んだ文（条文・実装ノート・API の説明）に付ける。 */
export const SPEC_LANG: Lang = DEFAULT_LANG;

type DemoKey = keyof Messages['demos'];

/** デモの文言。表示用のソースでは、ここで読んだ参照が文字列に戻る（demo-text.ts）。 */
export function useDemoText<K extends DemoKey>(key: K): Messages['demos'][K] {
  return useT().demos[key];
}
