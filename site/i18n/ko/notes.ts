import type ja from '../ja/notes';

export default {
  lead: (count: number): string =>
    `설계 단계에서는 보이지 않고, 실제로 움직여 보고서야 드러난 함정 ${String(count)}건. 종이 위에서는 옳지만 코드로 옮기면 깨지는 부류라서 여기에 고정해 두었다.`,
} satisfies typeof ja;
