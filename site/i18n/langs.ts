/**
 * サイトが対応する言語。gassan の折り返し（W-04）を確かめた言語と揃えてある。
 *
 * 値は BCP 47 の言語タグで、そのまま <html lang> と URL の頭（#/en/...）に使う。
 * 中国語を地域（zh-CN / zh-TW）ではなく文字（zh-Hans / zh-Hant）で分けるのは、
 * 違いが字形と語彙にあり、地域では決まらないから。
 */
export const LANGS = ['ja', 'en', 'zh-Hans', 'zh-Hant', 'ko', 'th'] as const;

export type Lang = (typeof LANGS)[number];

/** URL に言語を書かないときの言語。仕様書の原文の言語で、既存のリンクはすべてこれを指している。 */
export const DEFAULT_LANG: Lang = 'ja';

/** 言語の名前は、その言語自身で書く。読めない言語の並びの中から、自分の言語を見つけられるように。 */
export const LANG_NAMES: Record<Lang, string> = {
  ja: '日本語',
  en: 'English',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ko: '한국어',
  th: 'ไทย',
};

export function isLang(value: string | undefined): value is Lang {
  return (LANGS as readonly (string | undefined)[]).includes(value);
}
