/**
 * デモの文言を、言語ごとに差し替えるための約束。
 *
 * デモは「動く見本」と「そのソース」を並べて見せる（見本とコードをずらさない）。
 * 文言を言語ごとに持つと、ソースには `t.title` のような参照が残り、写して使うコードとしては読みにくい。
 * そこで、見せるときにだけ参照を文字列に戻す。動いている見本と表示するコードは同じファイルのまま。
 *
 * デモの書き方:
 *
 *   import { fmt, useDemoText } from '../i18n';        ← 表示では消える
 *   const t = useDemoText('kindForm');                  ← 表示では消える
 *   <Modal.Title>{t.title}</Modal.Title>                → <Modal.Title>プロフィールを編集</Modal.Title>
 *   <Modal.Field label={t.name}>                        → <Modal.Field label="表示名">
 *   options={[{ value: 'a', label: t.optionA }]}       → options={[{ value: 'a', label: 'デザイン' }]}
 *   help={fmt(t.seats, String(seats))}                  → help={`${String(seats)} 席`}（文言は '{0} 席'）
 *   // t:leaveGuard                                     → // 書きかけなら引き止める。…（comments.leaveGuard）
 */

export interface DemoText {
  /** コードのコメント。`// t:key` と `{/* t:key *\/}` が、ここの文に置き換わる。 */
  comments?: Record<string, string>;
  [key: string]: string | Record<string, string> | undefined;
}

/** `{0}` `{1}` … を引数で埋める。デモの中で、数を含む文言を組み立てるのに使う。 */
export function fmt(template: string, ...args: readonly string[]): string {
  return template.replace(/\{(\d+)\}/g, (whole, index: string) => args[Number(index)] ?? whole);
}

function lookup(texts: DemoText, path: string): string {
  const value = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], texts);
  if (typeof value !== 'string') throw new Error(`デモの文言 t.${path} が無い`);
  return value;
}

const quote = (text: string): string => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** 呼び出しの引数を、括弧の深さを見ながら区切る（`String(Math.max(0, n))` の中のカンマで割らない）。 */
function splitArgs(source: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
    else if (ch === ',' && depth === 0) {
      args.push(source.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(source.slice(start).trim());
  return args;
}

/** `fmt(t.key, a, b)` を、文言を地にしたテンプレートリテラルに戻す。結果は hold で印にする。 */
function replaceFmt(code: string, texts: DemoText, hold: (text: string) => string): string {
  let out = '';
  let rest = code;
  for (;;) {
    const at = rest.search(/\bfmt\(t\./);
    if (at < 0) return out + rest;
    // 対応する閉じ括弧を探す
    let depth = 0;
    let end = at + 3;
    for (; end < rest.length; end += 1) {
      if (rest[end] === '(') depth += 1;
      else if (rest[end] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const [first, ...args] = splitArgs(rest.slice(at + 4, end));
    const template = lookup(texts, (first ?? '').replace(/^t\./, ''))
      .replace(/[`\\]/g, (ch) => `\\${ch}`)
      .replace(/\$\{/g, '\\${')
      .replace(/\{(\d+)\}/g, (whole, index: string) => (args[Number(index)] ? `\${${args[Number(index)] ?? ''}}` : whole));
    out += `${rest.slice(0, at)}${hold(`\`${template}\``)}`;
    rest = rest.slice(end + 1);
  }
}

/** 表示用のソースを作る。`texts` はその言語のデモの文言。 */
export function fillDemoText(code: string, texts: DemoText): string {
  const comment = (key: string): string => {
    const text = texts.comments?.[key];
    if (text === undefined) throw new Error(`デモのコメント t:${key} が無い`);
    return text;
  };
  // 置き換えた文字列は印（私用領域の 番号）にして最後に戻す。文言の中に「t.x」のような並びがあっても、
  // 後の置き換えが文言の中まで書き換えないように。
  const parts: string[] = [];
  const hold = (text: string): string => `${String(parts.push(text) - 1)}`;
  const held = replaceFmt(
    code
      .replace(/^import \{[^}]*\buseDemoText\b[^}]*\} from '[^']+';\n/m, '')
      .replace(/^[ \t]*const t = useDemoText\('[\w-]+'\);\n/m, '')
      // コメント。行コメントは複数行の文を同じ字下げの行コメントに分ける
      .replace(/^([ \t]*)\/\/ t:(\w+)$/gm, (_, indent: string, key: string) =>
        hold(
          comment(key)
            .split('\n')
            .map((line) => `${indent}// ${line}`)
            .join('\n'),
        ),
      )
      .replace(/\{\/\* t:(\w+) \*\/\}/g, (_, key: string) => hold(`{/* ${comment(key)} */}`))
      .replace(/\/\*\* t:(\w+) \*\//g, (_, key: string) => hold(`/** ${comment(key)} */`)),
    texts,
    hold,
  )
    .replace(/=\{t\.([\w.]+)\}/g, (_, path: string) => {
      const text = lookup(texts, path);
      return hold(/["\n]/.test(text) ? `={${quote(text)}}` : `="${text}"`);
    })
    .replace(/\{t\.([\w.]+)\}/g, (_, path: string) => {
      const text = lookup(texts, path);
      return hold(/[{}<>\n]/.test(text) ? `{${quote(text)}}` : text);
    })
    .replace(/\bt\.([\w.]+)/g, (_, path: string) => hold(quote(lookup(texts, path))));
  return held.replace(/(\d+)/g, (_, index: string) => parts[Number(index)] ?? '');
}
