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
 *   {t.items.map((item) => <li>{item}</li>)}            → {['受信トレイ', '下書き'].map((item) => <li>{item}</li>)}
 *   t.answer.slice(0, shown)                            → '先月の売上は…'.slice(0, shown)（文言の後ろのメソッドは残す）
 */

export interface DemoText {
  /** コードのコメント。`// t:key` と `{/* t:key *\/}` が、ここの文に置き換わる。 */
  comments?: Record<string, string>;
  [key: string]: string | readonly string[] | Record<string, string> | undefined;
}

/** `{0}` `{1}` … を引数で埋める。デモの中で、数を含む文言を組み立てるのに使う。 */
export function fmt(template: string, ...args: readonly string[]): string {
  return template.replace(/\{(\d+)\}/g, (whole, index: string) => args[Number(index)] ?? whole);
}

const valueAt = (texts: DemoText, path: string): unknown =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], texts);

function lookup(texts: DemoText, path: string): string {
  const value = valueAt(texts, path);
  if (typeof value !== 'string') throw new Error(`デモの文言 t.${path} が無い`);
  return value;
}

/** 参照が文言（文字列）そのものなら、その文字列。並び・メソッドの付いた参照・無い参照は null。 */
function stringAt(texts: DemoText, path: string): string | null {
  const value = valueAt(texts, path);
  return typeof value === 'string' ? value : null;
}

const quote = (text: string): string => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/**
 * `t.a.b.c` の参照を、文言（文字列か文字列の並び）に届くところまでたどる。残り（`.map` `.slice` などのメソッド）は
 * コードとして残す。文言に届かなければ投げる（参照の書き間違いを、表示する前に見つける）。
 */
function resolveRef(texts: DemoText, path: string): { code: string; rest: string } {
  const keys = path.split('.');
  let node: unknown = texts;
  for (let i = 0; i < keys.length; i += 1) {
    node = (node as Record<string, unknown> | undefined)?.[keys[i] as string];
    const rest = keys.slice(i + 1).map((key) => `.${key}`).join('');
    if (typeof node === 'string') return { code: quote(node), rest };
    if (Array.isArray(node) && node.every((item) => typeof item === 'string')) return { code: `[${node.map((item: string) => quote(item)).join(', ')}]`, rest };
    if (node === null || typeof node !== 'object') break;
  }
  throw new Error(`デモの文言 t.${path} が無い`);
}

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
    // 属性と中身に文言だけを置いた所は、文字列のまま書く。並びやメソッドの付いた参照は、後の置き換えに任せる
    .replace(/=\{t\.([\w.]+)\}/g, (whole, path: string) => {
      const text = stringAt(texts, path);
      if (text === null) return whole;
      return hold(/["\n]/.test(text) ? `={${quote(text)}}` : `="${text}"`);
    })
    .replace(/\{t\.([\w.]+)\}/g, (whole, path: string) => {
      const text = stringAt(texts, path);
      if (text === null) return whole;
      return hold(/[{}<>\n]/.test(text) ? `{${quote(text)}}` : text);
    })
    .replace(/\bt\.([\w.]+)/g, (_, path: string) => {
      const { code: text, rest } = resolveRef(texts, path);
      return `${hold(text)}${rest}`;
    });
  return held.replace(/(\d+)/g, (_, index: string) => parts[Number(index)] ?? '');
}
