import type { EvidenceKind } from '../../data/schema';

export default {
  /** 題名に項目数を添える。page は nav.pages.spec。 */
  title: (page: string, count: number): string => `${page}（${String(count)} 項目）`,
  lead: '理想のモーダルが満たすべき振る舞いを、12 のカテゴリに分けて 1 行ずつ列挙したもの。各行には、それをどのテスト・どの CSS で満たしているかが結び付いている。',
  source: (version: string, updated: string): string =>
    `原本は [modal.skill.md](modal.skill.md) §4（v${version}、${updated}）、状態と根拠は [docs/traceability.md](docs/traceability.md)。どちらも \`npm run check:trace\` が機械検証していて、存在しないテスト名を根拠に書くと CI が落ちる。このページはその 2 つからビルド時に作っている。`,
  filters: {
    label: '仕様の絞り込み',
    keyword: 'キーワード',
    keywordPlaceholder: '例: フォーカス、G-03、line-clamp',
    category: 'カテゴリ',
    status: '状態',
    all: 'すべて',
    priority: '必須度',
    /** 必須度の選択肢。letter は M / S / O、label は common.priority の呼び名。 */
    priorityOption: (letter: string, label: string): string => `${letter}（${label}）`,
    count: (shown: number, total: number): string => `${String(shown)} / ${String(total)} 項目を表示`,
  },
  /** カテゴリの表の名前。name は仕様書のカテゴリ名（原文）。 */
  categoryItems: (name: string): string => `${name}の項目`,
  /** 表の最後の列。ほかの列は common.specTable を使う。 */
  statusAndEvidence: '状態と根拠',
  evidence: {
    count: (n: number): string => `根拠 ${String(n)} 件`,
    kinds: {
      T: 'テスト',
      C: 'CSS',
      S: 'ファイル',
      D: '文書',
      B: '実機検品',
      R: 'ロードマップ',
      N: '委譲先',
    } satisfies Record<EvidenceKind, string>,
  },
  empty: '条件に合う項目は無い。絞り込みを緩めてほしい。',
  legend: {
    title: '状態の読み方',
    intro: '保証の強い順。「実装」と「記述」を混ぜないことが、この表の要点である。',
    tableCaption: '状態の語彙',
  },
};
