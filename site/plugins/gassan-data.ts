/**
 * `virtual:gassan-data` を提供する Vite プラグイン。
 *
 * 仕様書（modal.skill.md）・追跡表（docs/traceability.md）・検証レポート（VERIFICATION.md）・
 * 公開型（src/*.ts）を読み、サイトが描く表とデータを組み立てる。
 * 読み方は scripts/check-trace.mjs と揃えてある。あちらが検査し、こちらが見せる。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import type { Plugin } from 'vite';

import type {
  ApiInterface,
  ApiProp,
  BrowserCheck,
  Evidence,
  EvidenceKind,
  GassanData,
  MdTable,
  Priority,
  SpecCategory,
  SpecNote,
  TokenGroup,
} from '../data/schema';

const VIRTUAL_ID = 'virtual:gassan-data';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (path: string): string => readFileSync(join(root, path), 'utf8');

/* -------------------------------------------------------------------------- */
/* Markdown                                                                   */
/* -------------------------------------------------------------------------- */

interface Heading {
  level: number;
  key: string;
  title: string;
  /** 見出し行の次の行 */
  start: number;
  /** 次の同格以上の見出し行（含まない） */
  end: number;
}

/**
 * 見出しで節に割る。コードブロックの中の「## 」は見出しとして数えない
 * （§9 の圧縮ルールは ```text の中に ## を持つ）。
 */
function headings(lines: readonly string[]): Heading[] {
  const found: Omit<Heading, 'end'>[] = [];
  let fenced = false;
  lines.forEach((line, index) => {
    if (line.startsWith('```')) fenced = !fenced;
    if (fenced) return;
    const m = /^(#{2,3}) (.+)$/.exec(line);
    if (!m?.[1] || !m[2]) return;
    const title = m[2].trim();
    const key = /^(付録[A-Z]|\d+(?:-\d+)?|[A-Z])\./.exec(title)?.[1] ?? title;
    found.push({ level: m[1].length, key, title, start: index + 1 });
  });
  return found.map((h, i) => {
    const next = found.slice(i + 1).find((other) => other.level <= h.level);
    return { ...h, end: next ? next.start - 1 : lines.length };
  });
}

/** 表の 1 行をセルに割る。 */
function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** テキスト中の最初の表。 */
function firstTable(text: string): MdTable | undefined {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.startsWith('|'));
  if (start < 0) return undefined;
  const block: string[] = [];
  for (let i = start; i < lines.length && lines[i]?.startsWith('|'); i += 1) {
    block.push(lines[i] ?? '');
  }
  const [head, , ...rows] = block;
  if (!head) return undefined;
  return { header: cells(head), rows: rows.map(cells) };
}

/** テキスト中のコードブロックを出現順に。 */
function codeBlocks(text: string): { lang: string; text: string }[] {
  return [...text.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)].map((m) => ({
    lang: m[1] ?? '',
    text: (m[2] ?? '').replace(/\n$/, ''),
  }));
}

/* -------------------------------------------------------------------------- */
/* 仕様書                                                                     */
/* -------------------------------------------------------------------------- */

function parseSkill(): Pick<GassanData, 'sections' | 'tables' | 'code' | 'notes'> & {
  categories: Omit<SpecCategory, 'items'>[];
  items: Map<string, { letter: string; name: string; priority: Priority; summary: string }>;
  frontMatter: Record<string, string>;
} {
  const md = read('modal.skill.md');
  const lines = md.split('\n');

  const frontMatter: Record<string, string> = {};
  const fm = /^---\n([\s\S]*?)\n---/.exec(md);
  for (const line of fm?.[1]?.split('\n') ?? []) {
    const m = /^(\w+): (.*)$/.exec(line);
    if (m?.[1] && m[2] !== undefined) frontMatter[m[1]] = m[2];
  }

  const sections: Record<string, string> = {};
  const tables: Record<string, MdTable> = {};
  const code: Record<string, { lang: string; text: string }> = {};
  const notes: SpecNote[] = [];
  const categories: Omit<SpecCategory, 'items'>[] = [];
  const items = new Map<string, { letter: string; name: string; priority: Priority; summary: string }>();

  for (const h of headings(lines)) {
    const body = lines.slice(h.start, h.end).join('\n').trim();
    sections[h.key] = body;
    const table = firstTable(body);
    if (table) tables[h.key] = table;
    codeBlocks(body).forEach((block, index) => {
      code[`${h.key}#${String(index)}`] = block;
    });

    const note = /^10-(\d+)\. (.+)$/.exec(h.title);
    if (note?.[1] && note[2]) {
      notes.push({ number: `10-${note[1]}`, title: note[2], body: body.replace(/\n---\s*$/, '').trim() });
    }

    const category = /^([A-Z])\. *([^（(]+)/.exec(h.title);
    if (h.level === 3 && category?.[1] && category[2] && table) {
      categories.push({ letter: category[1], name: category[2].trim() });
      for (const row of table.rows) {
        const [id, name, priority, summary] = row;
        if (!id || !name || !priority) continue;
        items.set(id, {
          letter: category[1],
          name,
          priority: priority as Priority,
          summary: summary ?? '',
        });
      }
    }
  }

  return { sections, tables, code, notes, categories, items, frontMatter };
}

/* -------------------------------------------------------------------------- */
/* 追跡表・検証レポート                                                       */
/* -------------------------------------------------------------------------- */

function parseTrace(): { rows: Map<string, { status: string; evidence: Evidence[] }>; legend: MdTable } {
  const md = read('docs/traceability.md');
  const rows = new Map<string, { status: string; evidence: Evidence[] }>();
  for (const m of md.matchAll(/^\| *([A-Z]-\d{2}) *\| *[MSO] *\| *([^|]*?) *\| *([^|]*?) *\|/gm)) {
    const [, id, status, cell] = m;
    if (!id || status === undefined || cell === undefined) continue;
    const evidence = [...cell.matchAll(/`([A-Z]):([^`]*)`/g)].map((e) => ({
      kind: e[1] as EvidenceKind,
      value: (e[2] ?? '').trim(),
    }));
    rows.set(id, { status, evidence });
  }
  const legendStart = md.indexOf('## 状態の語彙');
  const legend = firstTable(md.slice(legendStart)) ?? { header: [], rows: [] };
  return { rows, legend };
}

function parseBrowserChecks(): BrowserCheck[] {
  const md = read('VERIFICATION.md');
  const start = md.indexOf('## 3. jsdom では検証できないもの');
  const end = md.indexOf('## 4. ', start + 1);
  const sec = md.slice(start, end);
  return [...sec.matchAll(/^\| *(B-\d+) *\| *([^|]*?) *\| *([^|]*?) *\| *([^|]*?) *\|$/gm)].map((m) => ({
    id: m[1] ?? '',
    item: m[2] ?? '',
    how: m[3] ?? '',
    diagnosis: m[4] ?? '',
  }));
}

function countTests(): { tests: number; files: number } {
  const dir = join(root, 'tests');
  const files = readdirSync(dir).filter((f) => /\.test\.tsx?$/.test(f));
  let tests = 0;
  for (const f of files) {
    tests += [...readFileSync(join(dir, f), 'utf8').matchAll(/^\s*(?:it|test)\(\s*['"`]/gm)].length;
  }
  return { tests, files: files.length };
}

function countExports(): number {
  const block = /const REQUIRED_EXPORTS = \[([\s\S]*?)\];/.exec(read('scripts/check-dist.mjs'));
  return block?.[1] ? [...block[1].matchAll(/'[^']+'/g)].length : 0;
}

/* -------------------------------------------------------------------------- */
/* 公開型                                                                     */
/* -------------------------------------------------------------------------- */

/** API 表に載せる型。Props で終わるもの以外に、利用者が手で組み立てる型も載せる。 */
const EXTRA_INTERFACES = new Set([
  'ConfirmOptions',
  'GassanLabels',
  'ModalGalleryItem',
  'ChipOption',
  'FieldControlProps',
  'DismissPolicy',
  'GateEntry',
  'ModalsApi',
]);

/** Props 型 → 既定値を読む関数名。名前から機械的に決まらないものだけ書く。 */
const COMPONENT_OF: Record<string, string> = {
  ModalIconButtonProps: 'ModalClose',
};

function docOf(checker: ts.TypeChecker, node: ts.Node & { name?: ts.Node }): string {
  const symbol = node.name ? checker.getSymbolAtLocation(node.name) : undefined;
  return symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim() : '';
}

/** 関数本体の分割代入から「prop 名 → 既定値の式」を集める。 */
function defaultsIn(fn: ts.Node): Map<string, string> {
  const out = new Map<string, string>();
  const visit = (node: ts.Node): void => {
    if (ts.isObjectBindingPattern(node)) {
      for (const el of node.elements) {
        if (!el.initializer) continue;
        const key = (el.propertyName ?? el.name).getText().replace(/^['"]|['"]$/g, '');
        out.set(key, el.initializer.getText());
      }
    }
    // 入れ子の関数（コールバック）の中の分割代入は拾わない。
    if (node !== fn && (ts.isArrowFunction(node) || ts.isFunctionExpression(node))) return;
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(fn, visit);
  return out;
}

function findComponent(sources: readonly ts.SourceFile[], name: string): ts.Node | undefined {
  for (const sf of sources) {
    let found: ts.Node | undefined;
    const visit = (node: ts.Node): void => {
      if (found) return;
      if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name?.text === name) {
        found = node;
        return;
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    if (found) return found;
  }
  return undefined;
}

function parseApi(): Record<string, ApiInterface> {
  const program = ts.createProgram([join(root, 'src/index.ts')], {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const sources = program.getSourceFiles().filter((sf) => sf.fileName.startsWith(join(root, 'src')));

  const api: Record<string, ApiInterface> = {};
  for (const sf of sources) {
    ts.forEachChild(sf, (node) => {
      if (!ts.isInterfaceDeclaration(node)) return;
      const name = node.name.text;
      const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported || !(name.endsWith('Props') || EXTRA_INTERFACES.has(name))) return;

      const component = COMPONENT_OF[name] ?? name.replace(/Props$/, '');
      const fn = name.endsWith('Props') ? findComponent(sources, component) : undefined;
      const defaults = fn ? defaultsIn(fn) : new Map<string, string>();

      const props: ApiProp[] = [];
      for (const member of node.members) {
        if (!(ts.isPropertySignature(member) || ts.isMethodSignature(member)) || !member.name) continue;
        const propName = member.name.getText(sf).replace(/^['"]|['"]$/g, '');
        const type = ts.isPropertySignature(member)
          ? (member.type?.getText(sf) ?? 'unknown')
          : member.getText(sf).replace(/^[^(]*/, '').replace(/;$/, '');
        const defaultValue = defaults.get(propName);
        props.push({
          name: propName,
          type: type.replace(/\s+/g, ' '),
          optional: Boolean(member.questionToken),
          doc: docOf(checker, member),
          ...(defaultValue !== undefined ? { defaultValue } : {}),
        });
      }

      api[name] = {
        name,
        doc: docOf(checker, node),
        extends: (node.heritageClauses ?? []).flatMap((clause) => clause.types.map((t) => t.getText(sf))),
        props,
      };
    });
  }
  return api;
}

/* -------------------------------------------------------------------------- */
/* デザイントークン                                                           */
/* -------------------------------------------------------------------------- */

/** `--g-x: value;` を、直前の「/* --- 見出し」で束ねて読む。値は複数行でもよい（影など）。 */
function tokenDeclarations(block: string): Map<string, { group: string; value: string }> {
  const out = new Map<string, { group: string; value: string }>();
  const marks = [...block.matchAll(/\/\* --- (\w+)/g)].map((m) => ({ at: m.index ?? 0, name: m[1] ?? '' }));
  for (const m of block.matchAll(/(--g-[\w-]+):\s*([^;]+);/g)) {
    const at = m.index ?? 0;
    const group = marks.filter((mark) => mark.at < at).pop()?.name ?? 'other';
    out.set(m[1] ?? '', { group, value: (m[2] ?? '').replace(/\s+/g, ' ').trim() });
  }
  return out;
}

function parseTokens(): TokenGroup[] {
  const css = read('src/styles.css');
  const start = css.indexOf('@layer gassan.tokens {');
  const dark = css.indexOf('@media (prefers-color-scheme: dark)', start);
  const end = css.indexOf('@layer gassan.reset {', dark);
  const light = tokenDeclarations(css.slice(start, dark));
  const darkValues = tokenDeclarations(css.slice(dark, end));

  const groups: TokenGroup[] = [];
  for (const [name, { group, value }] of light) {
    let target = groups.find((g) => g.name === group);
    if (!target) {
      target = { name: group, tokens: [] };
      groups.push(target);
    }
    const darkValue = darkValues.get(name)?.value;
    target.tokens.push({ name, light: value, ...(darkValue !== undefined ? { dark: darkValue } : {}) });
  }
  return groups;
}

/* -------------------------------------------------------------------------- */
/* 組み立て                                                                   */
/* -------------------------------------------------------------------------- */

export function buildData(): GassanData {
  const skill = parseSkill();
  const trace = parseTrace();
  const pkg = JSON.parse(read('package.json')) as {
    name: string;
    version: string;
    repository?: { url?: string };
  };
  const { tests, files } = countTests();

  const categories: SpecCategory[] = skill.categories.map((c) => ({
    ...c,
    items: [...skill.items.entries()]
      .filter(([, item]) => item.letter === c.letter)
      .map(([id, item]) => ({
        id,
        ...item,
        status: trace.rows.get(id)?.status ?? '—',
        evidence: trace.rows.get(id)?.evidence ?? [],
      })),
  }));

  return {
    meta: {
      packageName: pkg.name,
      version: pkg.version,
      repository: (pkg.repository?.url ?? '').replace(/^git\+/, '').replace(/\.git$/, ''),
      specVersion: skill.frontMatter.version ?? '',
      specUpdated: skill.frontMatter.updated ?? '',
      tests,
      testFiles: files,
      exports: countExports(),
      items: skill.items.size,
    },
    categories,
    sections: skill.sections,
    tables: skill.tables,
    code: skill.code,
    notes: skill.notes,
    browserChecks: parseBrowserChecks(),
    statusLegend: trace.legend,
    api: parseApi(),
    tokens: parseTokens(),
  };
}

/** 変わったらデータを作り直すファイル。 */
const WATCHED = ['modal.skill.md', 'docs/traceability.md', 'VERIFICATION.md', 'package.json', 'src/styles.css'];

export function gassanData(): Plugin {
  return {
    name: 'gassan-data',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      for (const file of WATCHED) this.addWatchFile(join(root, file));
      return `export const data = ${JSON.stringify(buildData())};`;
    },
    handleHotUpdate({ file, server }) {
      const relevant =
        WATCHED.some((w) => file === join(root, w)) ||
        file.startsWith(join(root, 'src')) ||
        file.startsWith(join(root, 'tests'));
      if (!relevant) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
    },
  };
}
