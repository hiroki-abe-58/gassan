import type ja from '../ja/spec';

export default {
  title: (page: string, count: number): string => `${page}（${String(count)} 项）`,
  lead: '把理想的模态框应满足的行为分为 12 个类别，逐行列出。每一行都关联着满足它的测试和 CSS。',
  source: (version: string, updated: string): string =>
    `原文是 [modal.skill.md](modal.skill.md) §4（v${version}，${updated}），状态与依据见 [docs/traceability.md](docs/traceability.md)。两者都由 \`npm run check:trace\` 机器校验，如果把不存在的测试名写作依据，CI 就会失败。本页在构建时由这两者生成。`,
  filters: {
    label: '筛选规范',
    keyword: '关键词',
    keywordPlaceholder: '例：焦点、G-03、line-clamp',
    category: '类别',
    status: '状态',
    all: '全部',
    priority: '级别',
    priorityOption: (letter: string, label: string): string => `${letter}（${label}）`,
    count: (shown: number, total: number): string => `显示 ${String(shown)} / ${String(total)} 项`,
  },
  categoryItems: (name: string): string => `${name} 的条目`,
  statusAndEvidence: '状态与依据',
  evidence: {
    count: (n: number): string => `依据 ${String(n)} 条`,
    kinds: {
      T: '测试',
      C: 'CSS',
      S: '文件',
      D: '文档',
      B: '真机检查',
      R: '路线图',
      N: '委托对象',
    },
  },
  empty: '没有符合条件的条目。请放宽筛选条件。',
  legend: {
    title: '状态的含义',
    intro: '按保证强度由强到弱排列。不把“已实现”与“已记述”混为一谈，是这张表的要点。',
    tableCaption: '状态的词汇',
  },
} satisfies typeof ja;
