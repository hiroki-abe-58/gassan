import type { ReactNode } from 'react';

import { CodeBlock as GassanCodeBlock } from '@genelab/gassan';

/**
 * 依存を足さない、軽いシンタックスハイライト。
 * 正確な構文解析はしない。読む助けになる程度の色分けだけを担う。
 */

type Rule = readonly [kind: string, pattern: RegExp];

const TSX_RULES: readonly Rule[] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\/|\{\/\*[\s\S]*?\*\/\}/],
  ['string', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/],
  ['tag', /<\/?[A-Za-z][\w.]*|(?<!=)\/?>/],
  [
    'keyword',
    /\b(?:import|from|export|default|function|return|const|let|var|if|else|await|async|new|type|interface|extends|as|typeof|void|for|of|in|switch|case|break)\b/,
  ],
  ['literal', /\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/],
  ['attr', /\b[A-Za-z][\w-]*(?==[{"'])/],
];

const CSS_RULES: readonly Rule[] = [
  ['comment', /\/\*[\s\S]*?\*\//],
  ['string', /'[^'\n]*'|"[^"\n]*"/],
  ['keyword', /@[\w-]+/],
  ['attr', /--[\w-]+|(?<=^|[\s{;])[a-z-]+(?=\s*:)/m],
  ['literal', /\b\d+(?:\.\d+)?(?:px|ms|s|%|dvh|vh|deg|fr)?\b/],
];

const SHELL_RULES: readonly Rule[] = [
  ['comment', /#[^\n]*/],
  ['string', /'[^'\n]*'|"[^"\n]*"/],
  ['keyword', /^(?:npm|npx|git|gh|open|node)\b/m],
];

function rulesFor(lang: string): readonly Rule[] {
  if (lang === 'css') return CSS_RULES;
  if (lang === 'bash' || lang === 'sh' || lang === 'shell') return SHELL_RULES;
  if (lang === 'tsx' || lang === 'ts' || lang === 'jsx' || lang === 'js') return TSX_RULES;
  return [];
}

export function highlight(code: string, lang: string): ReactNode[] {
  const rules = rulesFor(lang);
  if (rules.length === 0) return [code];
  const combined = new RegExp(rules.map(([, re]) => `(${re.source})`).join('|'), 'gm');
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(combined)) {
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const group = m.slice(1).findIndex((g) => g !== undefined);
    const kind = rules[group]?.[0] ?? 'plain';
    out.push(
      <span key={at} className={`s-tok-${kind}`}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export interface CodeBlockProps {
  code: string;
  lang?: string;
  /** コードの上に出す小見出し（ファイル名など）。 */
  caption?: string;
  /** コードの中の文（コメントなど）の言語。仕様書から読んだコード（原文のまま出す）に SPEC_LANG を渡す。 */
  textLang?: string;
}

/** gassan の CodeBlock（U-30）に、このサイトの色分けを渡す。暗い地は .s-code がトークンを差し替えて作る。 */
export function CodeBlock({ code, lang = 'tsx', caption, textLang }: CodeBlockProps): ReactNode {
  return (
    <GassanCodeBlock className="s-code" code={code} language={lang} title={caption} textLang={textLang}>
      {highlight(code, lang)}
    </GassanCodeBlock>
  );
}
