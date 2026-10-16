import { useSyncExternalStore } from 'react';

import { data } from '../data';
import { CUSTOM_PRESET_ID, PRESETS, buildTheme, type Scheme, type Theme } from './engine';

/**
 * サイトのテーマの状態と、その適用。
 *
 * 色の値はすべてここ（engine の SITE_NEUTRALS と gassan の styles.css）から documentElement に書く。
 * site.css は色の値を持たない。値の出どころを 1 つにして、表示と検証（tests/theme.test.ts）を同じ計算に揃える。
 */

export type SchemeChoice = Scheme | 'system';

export interface ThemeState {
  scheme: SchemeChoice;
  /** PRESETS の id か 'custom' */
  preset: string;
  /** 任意の色（#rrggbb） */
  custom: string;
}

const STORAGE_KEY = 'gassan-site-theme';
const INITIAL: ThemeState = { scheme: 'system', preset: 'default', custom: '#0b6bcb' };
const HEX = /^#[0-9a-f]{6}$/i;

function load(): ThemeState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    const scheme = parsed.scheme === 'light' || parsed.scheme === 'dark' ? parsed.scheme : 'system';
    const preset =
      parsed.preset === CUSTOM_PRESET_ID || PRESETS.some((p) => p.id === parsed.preset)
        ? (parsed.preset as string)
        : INITIAL.preset;
    const custom = typeof parsed.custom === 'string' && HEX.test(parsed.custom) ? parsed.custom : INITIAL.custom;
    return { scheme, preset, custom };
  } catch {
    // 保存領域が使えない環境（プライベートブラウズ、無効化など）でも、既定のテーマで動く。
    return INITIAL;
  }
}

function save(next: ThemeState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 保存できなくても、この画面の中では切り替わる */
  }
}

const darkQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

export function resolveScheme(choice: SchemeChoice): Scheme {
  if (choice !== 'system') return choice;
  return darkQuery?.matches ? 'dark' : 'light';
}

/** gassan の色のトークン（その表示の値）。styles.css からビルド時に読んだもの。 */
export function gassanTokens(scheme: Scheme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of data.tokens) {
    if (group.name !== 'surface' && !group.tokens.some((t) => t.dark !== undefined)) continue;
    for (const token of group.tokens) {
      if (group.name !== 'surface' && token.dark === undefined) continue;
      out[token.name] = scheme === 'dark' ? (token.dark ?? token.light) : token.light;
    }
  }
  return out;
}

/** 状態からテーマを組み立てる。プリセット一覧の見本にも使う。 */
export function themeFor(state: ThemeState, scheme: Scheme = resolveScheme(state.scheme)): Theme {
  const preset = PRESETS.find((p) => p.id === state.preset);
  const custom = state.preset === CUSTOM_PRESET_ID;
  const seed = custom ? state.custom : (preset?.seed ?? PRESETS[0]?.seed ?? '#3346d3');
  const themesGassan = custom ? true : (preset?.themesGassan ?? false);
  return buildTheme(seed, scheme, gassanTokens(scheme), themesGassan);
}

interface Snapshot {
  state: ThemeState;
  theme: Theme;
}

let snapshot: Snapshot = { state: INITIAL, theme: themeFor(INITIAL, 'light') };
const listeners = new Set<() => void>();

function apply(state: ThemeState): void {
  const theme = themeFor(state);
  const root = document.documentElement;
  for (const [name, value] of Object.entries(theme.vars)) root.style.setProperty(name, value);
  root.style.colorScheme = theme.scheme;
  root.dataset.theme = theme.scheme;
  snapshot = { state, theme };
  for (const listener of listeners) listener();
}

/** 起動時に 1 度だけ呼ぶ。保存されたテーマを読み、描画前に適用する。 */
export function initTheme(): void {
  apply(load());
  darkQuery?.addEventListener('change', () => {
    if (snapshot.state.scheme === 'system') apply(snapshot.state);
  });
}

export function setTheme(patch: Partial<ThemeState>): void {
  const next = { ...snapshot.state, ...patch };
  save(next);
  apply(next);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
