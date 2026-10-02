/**
 * サイトが読むデータの形。ビルド時に site/plugins/gassan-data.ts が
 * modal.skill.md / docs/traceability.md / VERIFICATION.md / src の型定義から組み立てる。
 *
 * サイトに数値や表を手で書かないのは、書いた瞬間から古くなるため。
 * 仕様書を直せばサイトも直る、を構造で保証する。
 */

export type Priority = 'M' | 'S' | 'O';

export type EvidenceKind = 'T' | 'S' | 'C' | 'D' | 'B' | 'R' | 'N';

export interface Evidence {
  kind: EvidenceKind;
  value: string;
}

export interface SpecItem {
  id: string;
  letter: string;
  name: string;
  priority: Priority;
  /** 実装の要点（インライン Markdown）。 */
  summary: string;
  /** 追跡表の状態（実装 / 記述 / 委譲 ...）。 */
  status: string;
  evidence: Evidence[];
}

export interface SpecCategory {
  letter: string;
  name: string;
  items: SpecItem[];
}

export interface MdTable {
  header: string[];
  rows: string[][];
}

/** §10 の実装ノート 1 件。 */
export interface SpecNote {
  number: string;
  title: string;
  /** 本文（ブロック Markdown）。 */
  body: string;
}

/** VERIFICATION.md §3 の検品票 1 行。 */
export interface BrowserCheck {
  id: string;
  item: string;
  how: string;
  diagnosis: string;
}

export interface ApiProp {
  name: string;
  type: string;
  optional: boolean;
  doc: string;
  defaultValue?: string;
}

export interface ApiInterface {
  name: string;
  doc: string;
  extends: string[];
  props: ApiProp[];
}

/** src/styles.css の @layer gassan.tokens にあるカスタムプロパティ 1 件。 */
export interface DesignToken {
  name: string;
  light: string;
  /** ダークで上書きされる値。上書きが無ければ undefined。 */
  dark?: string;
}

export interface TokenGroup {
  /** CSS のコメント見出し（scrim / surface / geometry / motion）。 */
  name: string;
  tokens: DesignToken[];
}

export interface SiteMeta {
  packageName: string;
  version: string;
  repository: string;
  specVersion: string;
  specUpdated: string;
  /** tests/ の it() / test() の数。check-trace と同じ数え方。 */
  tests: number;
  testFiles: number;
  /** dist の検品対象になっている公開 API の数。 */
  exports: number;
  items: number;
}

export interface GassanData {
  meta: SiteMeta;
  categories: SpecCategory[];
  /** 仕様書の節。キーは「1-1」「5」「付録A」のような見出し番号。値はブロック Markdown。 */
  sections: Record<string, string>;
  /** 節の中にある最初の表。キーは sections と同じ。 */
  tables: Record<string, MdTable>;
  /** 節の中にあるコードブロック。キーは「7#0」のように節番号と出現順。 */
  code: Record<string, { lang: string; text: string }>;
  notes: SpecNote[];
  browserChecks: BrowserCheck[];
  /** 追跡表の状態の語彙。 */
  statusLegend: MdTable;
  api: Record<string, ApiInterface>;
  tokens: TokenGroup[];
}
