import { Fragment, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { repoFile } from '../data';
import { SPEC_LANG, useT } from '../i18n';
import { to } from '../router';
import { CodeBlock } from './Code';

/**
 * 仕様書の Markdown をそのまま描くための、最小の描画器。
 *
 * 汎用の Markdown 処理系ではない。modal.skill.md と追跡表が実際に使っている書式
 * （段落・コードブロック・表・箇条書き・強調・コード・リンク）だけを扱う。
 * 仕様書を唯一の原本にしておき、サイトはそれを読むだけ、を保つための部品である。
 *
 * サイトの文言（i18n/<lang>/*.ts）も同じインライン書式で書き、md() で描く。
 * 仕様書から読んだもの（InlineMd / MdTable / BlockMd）は原文の言語のまま出すので、lang を付けて
 * 読み上げと字形（漢字の字体）を原文の言語に合わせる。
 */

/* -------------------------------------------------------------------------- */
/* インライン                                                                 */
/* -------------------------------------------------------------------------- */

const INLINE = new RegExp(
  [
    /`([^`]+)`/.source, // 1: code
    /\*\*(.+?)\*\*/.source, // 2: strong
    /\[([^\]]+)\]\(([^)\s]+)\)/.source, // 3,4: link
    /(?<![A-Za-z0-9-])([LSCHTBFGKAMDW]-\d{2})(?![0-9])/.source, // 5: 仕様の ID
    /§(10-\d+)/.source, // 6: 実装ノート
  ].join('|'),
  'g',
);

function linkTarget(href: string): { href: string; external: boolean } {
  if (/^https?:\/\//.test(href)) return { href, external: true };
  // サイト内のページ（#/path）には、いまの言語の頭を付ける
  if (href.startsWith('#/')) return { href: to(href.slice(1)), external: false };
  if (href.startsWith('#')) return { href, external: false };
  // 仕様書の相対リンク（./docs/x.md など）は GitHub 上のファイルへ。
  return { href: repoFile(href.replace(/^\.\.\//, '')), external: true };
}

export function inline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${keyPrefix}-${String(at)}`;
    if (m[1] !== undefined) {
      out.push(<code key={key}>{m[1]}</code>);
    } else if (m[2] !== undefined) {
      out.push(<strong key={key}>{inline(m[2], key)}</strong>);
    } else if (m[3] !== undefined && m[4] !== undefined) {
      const { href, external } = linkTarget(m[4]);
      out.push(
        <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {inline(m[3], key)}
        </a>,
      );
    } else if (m[5] !== undefined) {
      out.push(
        <a key={key} className="s-idref" href={to(`/spec/${m[5]}`)}>
          {m[5]}
        </a>,
      );
    } else if (m[6] !== undefined) {
      out.push(
        <a key={key} href={to(`/foundations/notes/${m[6]}`)}>
          §{m[6]}
        </a>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** 文字コードの範囲を、正規表現の文字クラスの 1 区間にする。 */
const span = (from: number, to: number): string => `${String.fromCharCode(from)}-${String.fromCharCode(to)}`;
/** 和文（記号・かな・漢字・全角形）。 */
const CJK = new RegExp(`[${span(0x3000, 0x30ff)}${span(0x3400, 0x9fff)}${span(0xff00, 0xffef)}]`);

/**
 * 改行で折り返した段落を 1 行に戻す。日本語どうしの境目には空白を入れない
 * （「〜を\nする」が「〜を する」にならないように）。
 */
export function joinLines(lines: readonly string[]): string {
  return lines.reduce((acc, line) => {
    const next = line.trim();
    if (!acc) return next;
    const glue = CJK.test(acc.slice(-1)) || CJK.test(next.charAt(0)) ? '' : ' ';
    return `${acc}${glue}${next}`;
  }, '');
}

/** サイトの文言（インライン Markdown）を描く。折り返しは呼ぶ側の Phrase（Prose・Section など）に任せる。 */
export function md(text: string, keyPrefix = 'm'): ReactNode[] {
  return inline(text, keyPrefix);
}

/**
 * 段落の並び。文言の配列を 1 つずつ <p> にする。
 * 折り返し（Phrase）はここで掛ける。Prose の Phrase はコンポーネントの中まで潜らないので、
 * Prose の中に置いても、この段落には届かない。
 */
export function Paras({ items }: { items: readonly string[] }): ReactNode {
  return (
    <>
      {items.map((text, i) => (
        <p key={i}>
          <Phrase>{inline(text, `p${String(i)}`)}</Phrase>
        </p>
      ))}
    </>
  );
}

/** 仕様書から読んだ 1 文（条文の要点・API の説明）。原文の言語のまま出す。 */
export function InlineMd({ text }: { text: string }): ReactNode {
  // 仕様の文はセルや段落の中で折り返すので、日本語は文節で折る（W-05）
  return (
    <span lang={SPEC_LANG}>
      <Phrase>{inline(joinLines(text.split('\n')))}</Phrase>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 表                                                                         */
/* -------------------------------------------------------------------------- */

export interface TableData {
  header: readonly string[];
  rows: readonly (readonly string[])[];
}

function alignOf(separator: string | undefined): ('left' | 'center' | 'right' | undefined)[] {
  if (!separator) return [];
  return separator
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => {
      const c = cell.trim();
      if (c.startsWith(':') && c.endsWith(':')) return 'center';
      if (c.endsWith(':')) return 'right';
      return undefined;
    });
}

export function MdTable({
  table,
  caption,
  align = [],
}: {
  table: TableData;
  caption?: string;
  align?: readonly ('left' | 'center' | 'right' | undefined)[];
}): ReactNode {
  const t = useT();
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption ?? t.common.table}>
      <table className="s-table">
        {caption ? <caption className="s-sr-only">{caption}</caption> : null}
        <thead lang={SPEC_LANG}>
          <tr>
            {table.header.map((cell, i) => (
              <th key={i} scope="col" style={align[i] ? { textAlign: align[i] } : undefined}>
                {inline(cell, `h${String(i)}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody lang={SPEC_LANG}>
          <Phrase>
            {table.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} style={align[c] ? { textAlign: align[c] } : undefined}>
                    {inline(cell, `c${String(r)}-${String(c)}`)}
                  </td>
                ))}
              </tr>
            ))}
          </Phrase>
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ブロック                                                                   */
/* -------------------------------------------------------------------------- */

type Block =
  | { type: 'p'; text: string }
  | { type: 'code'; lang: string; text: string }
  | { type: 'table'; lines: string[] }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'h'; level: number; text: string };

function blocks(md: string): Block[] {
  const lines = md.split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        body.push(lines[i] ?? '');
        i += 1;
      }
      out.push({ type: 'code', lang, text: body.join('\n') });
      i += 1;
      continue;
    }
    if (line.startsWith('|')) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        body.push(lines[i] ?? '');
        i += 1;
      }
      out.push({ type: 'table', lines: body });
      continue;
    }
    const heading = /^(#{3,5}) (.+)$/.exec(line);
    if (heading?.[1] && heading[2]) {
      out.push({ type: 'h', level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }
    const listKind = /^\s*- /.test(line) ? 'ul' : /^\s*\d+\. /.test(line) ? 'ol' : null;
    if (listKind) {
      const items: string[][] = [];
      while (i < lines.length && (lines[i] ?? '').trim() !== '') {
        const current = lines[i] ?? '';
        const start = listKind === 'ul' ? /^\s*- (.*)$/.exec(current) : /^\s*\d+\. (.*)$/.exec(current);
        if (start) items.push([start[1] ?? '']);
        else items[items.length - 1]?.push(current);
        i += 1;
      }
      out.push({ type: listKind, items: items.map((item) => joinLines(item)) });
      continue;
    }
    if (line.trim() === '' || /^-{3,}$/.test(line.trim())) {
      i += 1;
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !/^(```|\||#{3,5} |\s*- |\s*\d+\. )/.test(lines[i] ?? '')
    ) {
      para.push(lines[i] ?? '');
      i += 1;
    }
    out.push({ type: 'p', text: joinLines(para) });
  }
  return out;
}

export function BlockMd({ text, tableCaption }: { text: string; tableCaption?: string }): ReactNode {
  return (
    <div className="s-prose" lang={SPEC_LANG}>
      {/* 段落・箇条書き・見出しの日本語を文節で折る。コードと表（MdTable）は Phrase が素通りする */}
      <Phrase>
      {blocks(text).map((block, index) => {
        const key = `b${String(index)}`;
        switch (block.type) {
          case 'p':
            return <p key={key}>{inline(block.text, key)}</p>;
          case 'code':
            return <CodeBlock key={key} code={block.text} lang={block.lang || 'text'} />;
          case 'table': {
            const [head, separator, ...rows] = block.lines;
            const split = (l: string): string[] =>
              l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
            return (
              <MdTable
                key={key}
                table={{ header: split(head ?? ''), rows: rows.map(split) }}
                align={alignOf(separator)}
                {...(tableCaption ? { caption: tableCaption } : {})}
              />
            );
          }
          case 'ul':
            return (
              <ul key={key}>
                {block.items.map((item, i) => (
                  <li key={i}>{inline(item, `${key}-${String(i)}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key}>
                {block.items.map((item, i) => (
                  <li key={i}>{inline(item, `${key}-${String(i)}`)}</li>
                ))}
              </ol>
            );
          case 'h': {
            const Tag = block.level <= 3 ? 'h3' : 'h4';
            return <Tag key={key}>{inline(block.text, key)}</Tag>;
          }
          default:
            return <Fragment key={key} />;
        }
      })}
      </Phrase>
    </div>
  );
}
