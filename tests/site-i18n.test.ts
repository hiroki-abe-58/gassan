/**
 * ドキュメントサイトの多言語化（site/i18n）。
 *
 * 文言の形（キーの欠け・余り）は型チェックが落とす。ここで確かめるのは、型では見えない 2 つ。
 *   - デモのソースを、どの言語でも「文字列を地に書いたコード」に戻せるか（表示するコードの壊れ）
 *   - 日本語以外の文言に、訳し忘れの日本語が残っていないか
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Fragment, createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { fillDemoText, fmt, type DemoText } from '../site/i18n/demo-text';
import en from '../site/i18n/en';
import ja from '../site/i18n/ja';
import ko from '../site/i18n/ko';
import th from '../site/i18n/th';
import zhHans from '../site/i18n/zh-Hans';
import zhHant from '../site/i18n/zh-Hant';

const MESSAGES = { ja, en, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ko, th };

describe('site/i18n / デモのコード', () => {
  const texts: DemoText = {
    open: '開く',
    title: '「保存」を押す',
    seats: '{0} 席',
    quote: 'It\'s "ok"',
    comments: { why: '常時マウントする', multi: '1 行目\n2 行目' },
  };

  it('JSX の子・属性・JS の文字列・fmt・コメントを、その言語の文字列に戻す', () => {
    const source = [
      "import { fmt, useDemoText } from '../i18n';",
      "const t = useDemoText('x');",
      '<button>{t.open}</button>',
      '<Modal.Title label={t.title} />',
      "options={[{ value: 'a', label: t.quote }]}",
      'help={fmt(t.seats, String(Math.max(0, n)))}',
      '{/* t:why */}',
      '  // t:multi',
      '<p label={t.quote} />',
    ].join('\n');
    expect(fillDemoText(source, texts)).toBe(
      [
        '<button>開く</button>',
        '<Modal.Title label="「保存」を押す" />',
        "options={[{ value: 'a', label: 'It\\'s \"ok\"' }]}",
        'help={`${String(Math.max(0, n))} 席`}',
        '{/* 常時マウントする */}',
        '  // 1 行目',
        '  // 2 行目',
        `<p label={'It\\'s "ok"'} />`,
      ].join('\n'),
    );
  });

  it('fmt は {0} {1} を引数で埋める', () => {
    expect(fmt('{1} / {0}', 'a', 'b')).toBe('b / a');
  });

  it('すべてのデモのソースを、すべての言語で文字列に戻せる（参照する文言が欠けていない）', () => {
    const dir = resolve(process.cwd(), 'site/demos');
    const demos = readdirSync(dir)
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => readFileSync(resolve(dir, file), 'utf8'))
      .map((code) => ({ code, key: /useDemoText\('(\w+)'\)/.exec(code)?.[1] }));
    for (const [lang, messages] of Object.entries(MESSAGES)) {
      for (const { code, key } of demos) {
        if (!key) continue;
        const filled = fillDemoText(code, (messages.demos as Record<string, DemoText>)[key] ?? {});
        expect(filled, `${lang} ${key}`).not.toMatch(/\bt\.\w|useDemoText|\bt:\w/);
      }
    }
  });
});

/**
 * 関数の文言を見本の引数で呼ぶ。数を受ける関数・文字列の配列を受ける関数（並べて読ませる文）・
 * 文字列を受ける関数（テンプレートの「〜を入力してください」）がある。
 * リンクを挟む文（ReactNode を返す関数）は、描いた文字で調べる（String() では中身が見えない）。
 */
function call(fn: (...args: unknown[]) => unknown): string {
  for (const args of [[1, 2, 3], [['a', 'b']], ['a', 'b', 'c']]) {
    try {
      const value = fn(...args);
      return typeof value === 'string' ? value : renderToStaticMarkup(createElement(Fragment, null, value as ReactNode)).replace(/<[^>]+>/g, '');
    } catch {
      // 次の見本の引数で試す
    }
  }
  throw new Error('どの見本の引数でも呼べない');
}

/** 文言の木から文字列を集める。関数（数を差し込む文）は見本の引数で呼ぶ。 */
function strings(node: unknown, path: string): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (typeof node === 'function') return [[path, call(node as (...args: unknown[]) => unknown)]];
  if (Array.isArray(node)) return node.flatMap((child, i) => strings(child, `${path}[${String(i)}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, child]) => strings(child, path ? `${path}.${key}` : key));
  }
  return [];
}

/** 引用（「」『』“”"" と `code`）の中は言語の見本なので、訳し忘れとして数えない。 */
const QUOTED = /「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"|`[^`]*`/g;
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
/**
 * 中身そのものが日本語の見本の文言。英語・タイ語は gassan が手を出さない言語なので、
 * 折り返しのデモはその言語に訳すと違いが見えない。日本語の見本のまま出す。
 */
const JAPANESE_SAMPLES = ['demos.lineBreakModal.'];

describe('site/i18n / 訳し忘れ', () => {
  it('日本語以外の文言には、引用の外にかなが残っていない', () => {
    const leftovers = Object.entries(MESSAGES)
      .filter(([lang]) => lang !== 'ja')
      .flatMap(([lang, messages]) =>
        strings(messages, '')
          .filter(([path]) => !JAPANESE_SAMPLES.some((prefix) => path.startsWith(prefix)))
          .filter(([, text]) => KANA.test(text.replace(QUOTED, '')))
          .map(([path, text]) => `${lang} ${path}: ${text.slice(0, 40)}`),
      );
    expect(leftovers).toEqual([]);
  });
});
