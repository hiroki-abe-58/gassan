import type ja from '../ja/notes';

export default {
  lead: (count: number): string =>
    `设计阶段看不见、实际运行后才冒出来的 ${String(count)} 个陷阱。这类问题在纸面上是对的，一写成代码就会出错，所以固定记录在这里。`,
} satisfies typeof ja;
