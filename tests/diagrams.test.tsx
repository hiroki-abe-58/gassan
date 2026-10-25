/**
 * 分析のグラフと図（Q-13〜Q-20）。
 *
 * 部品は役割・名前・キー操作と、位置や割合の計算（style に渡す値）を見る。描いた見た目（骨の線・泡の重なり・
 * 棒の伸び）はヘッドレス Chrome で確かめる。
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FishboneDiagram, FunnelChart, GanttChart, Heatmap, ParetoChart, RadarChart, ScatterChart, WaterfallChart } from '../src';

/** 当たりの領域（点・軸・棒）。グラフの group の中の role="img"。 */
const pointsIn = (group: HTMLElement): HTMLElement[] => within(group).getAllByRole('img');
const styleOf = (element: Element | null | undefined, name: string): string => (element instanceof HTMLElement ? element.style.getPropertyValue(name) : '');

describe('ScatterChart / Q-13', () => {
  const SERIES = [
    {
      key: 'maker',
      label: '製造業',
      data: [
        { label: 'A 社', x: 120, y: 8, size: 400 },
        { label: 'B 社', x: 40, y: 12, size: 100 },
      ],
    },
    { key: 'retail', label: '小売業', data: [{ label: 'C 社', x: 80, y: 3, size: 25 }] },
  ];

  it('Q-13 点は名前と横・縦・大きさの値を読み、横の値の順に 1 つだけが Tab で止まって矢印でたどる', () => {
    render(<ScatterChart label="売上と利益率" series={SERIES} xLabel="売上" yLabel="利益率" sizeLabel="社員数" table />);
    const group = screen.getByRole('group', { name: '売上と利益率' });
    const points = pointsIn(group);
    expect(points.map((point) => point.getAttribute('aria-label'))).toEqual([
      'B 社（製造業）: 売上 40、利益率 12、社員数 100',
      'C 社（小売業）: 売上 80、利益率 3、社員数 25',
      'A 社（製造業）: 売上 120、利益率 8、社員数 400',
    ]);
    expect(points.map((point) => point.tabIndex)).toEqual([0, -1, -1]);
    points[0]?.focus();
    fireEvent.keyDown(points[0] as HTMLElement, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(points[1]);
    fireEvent.keyDown(points[1] as HTMLElement, { key: 'End' });
    expect(document.activeElement).toBe(points[2]);
    // 軸の名前は目に見せる（読み上げは点の名前に含めているので飾り）
    expect(within(group).getByText('利益率', { selector: '.g-viz-axis-title' })).toHaveAttribute('aria-hidden', 'true');
    const table = within(group).getByRole('table');
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['項目', '売上', '利益率', '社員数']);
  });

  it('Q-13 泡の半径は大きさの平方根に比べ（面積が値に比べる）、凡例で系列を隠しても変わらない', () => {
    render(<ScatterChart label="売上と利益率" series={SERIES} xLabel="売上" yLabel="利益率" sizeLabel="社員数" />);
    const group = screen.getByRole('group', { name: '売上と利益率' });
    const radius = (name: RegExp): string => styleOf(within(group).getByRole('img', { name }), '--g-scatter-r');
    // 最大（400）が 20px、その 1/4（100）は 4 + 16 × √0.25 = 12px
    expect(radius(/^A 社/)).toBe('20px');
    expect(radius(/^B 社/)).toBe('12px');
    fireEvent.click(within(group).getByRole('button', { name: '製造業' }));
    expect(within(group).queryByRole('img', { name: /^A 社/ })).toBeNull();
    // C 社（25）は 4 + 16 × √(25 / 400) = 8px。隠した A 社（400）に比べたまま
    expect(radius(/^C 社/)).toBe('8px');
  });
});

describe('RadarChart / Q-14', () => {
  const SKILLS = [
    { skill: '速さ', a: 4, b: 3 },
    { skill: '正確さ', a: 5, b: 2 },
    { skill: '伝える力', a: 3, b: 4 },
    { skill: '粘り強さ', a: 2, b: 5 },
  ];
  const SERIES = [
    { key: 'a', label: '佐藤' },
    { key: 'b', label: '鈴木' },
  ];

  it('Q-14 軸は真上から時計回りに置き、軸の名前で系列ごとの値を読む。1 つだけが Tab で止まる', () => {
    const { container } = render(<RadarChart label="評価" data={SKILLS} x="skill" series={SERIES} max={5} />);
    const group = screen.getByRole('group', { name: '評価' });
    const axes = pointsIn(group);
    expect(axes.map((axis) => axis.getAttribute('aria-label'))).toEqual([
      '速さ: 佐藤 4、鈴木 3',
      '正確さ: 佐藤 5、鈴木 2',
      '伝える力: 佐藤 3、鈴木 4',
      '粘り強さ: 佐藤 2、鈴木 5',
    ]);
    expect(axes.map((axis) => axis.tabIndex)).toEqual([0, -1, -1, -1]);
    axes[0]?.focus();
    fireEvent.keyDown(axes[0] as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(axes[0]);
    fireEvent.keyDown(axes[0] as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(axes[1]);
    // 最初の軸は真上、2 本目は右（外周の外に置く名前）
    expect(axes[0]?.style.left).toBe('50%');
    expect(Number.parseFloat(axes[1]?.style.left ?? '0')).toBeGreaterThan(80);
    // 輪は 1〜5（5 段階の評価）、多角形は系列ごと
    expect(container.querySelectorAll('.g-radar-ring')).toHaveLength(5);
    expect(container.querySelectorAll('.g-radar-area')).toHaveLength(2);
  });
});

describe('Heatmap / Q-15', () => {
  const ROWS = ['月', '火', '水'];
  const COLUMNS = ['9時', '10時', '11時', '12時'];
  const VALUES = [
    [0, 10, 20, 40],
    [5, null, 30, 15],
    [40, 35, 25, 10],
  ];

  it('Q-15 行と列の見出しを持つ grid で、升は 1 つだけが Tab で止まり、矢印・Home・End・Ctrl+Home / End で移る', () => {
    render(<Heatmap label="曜日と時刻ごとの問い合わせ" rows={ROWS} columns={COLUMNS} values={VALUES} valueLabel="件数" description="月曜の 12 時が最多" />);
    const grid = screen.getByRole('grid', { name: '曜日と時刻ごとの問い合わせ' });
    expect(grid).toHaveAccessibleDescription('月曜の 12 時が最多');
    expect(within(grid).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['件数', '9時', '10時', '11時', '12時']);
    expect(within(grid).getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(ROWS);
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells.map((cell) => cell.textContent)).toEqual(['0', '10', '20', '40', '5', 'なし', '30', '15', '40', '35', '25', '10']);
    expect(cells.filter((cell) => cell.tabIndex === 0)).toEqual([cells[0]]);
    const at = (r: number, c: number): HTMLElement => cells[r * 4 + c] as HTMLElement;
    at(0, 0).focus();
    fireEvent.keyDown(at(0, 0), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(at(0, 1));
    fireEvent.keyDown(at(0, 1), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(at(1, 1));
    fireEvent.keyDown(at(1, 1), { key: 'End' });
    expect(document.activeElement).toBe(at(1, 3));
    fireEvent.keyDown(at(1, 3), { key: 'Home' });
    expect(document.activeElement).toBe(at(1, 0));
    fireEvent.keyDown(at(1, 0), { key: 'End', ctrlKey: true });
    expect(document.activeElement).toBe(at(2, 3));
    fireEvent.keyDown(at(2, 3), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(at(2, 3));
    expect(at(2, 3).tabIndex).toBe(0);
    // 指した升の行・列・値を下に出す（同じ値は升の読み上げにあるので飾り）
    expect(screen.getByText('水・12時: 件数 10')).toHaveAttribute('class', 'g-heatmap-readout');
  });

  it('Q-15 色は値の範囲を段に分けて濃くし、値の無い升は段を持たない', () => {
    render(<Heatmap label="問い合わせ" rows={ROWS} columns={COLUMNS} values={VALUES} steps={4} />);
    const cells = within(screen.getByRole('grid')).getAllByRole('gridcell');
    // 0〜40 を 4 段に。0 は 1 段目（いちばん薄い 0.14）、40 は 4 段目（1）
    expect(cells.map((cell) => cell.getAttribute('data-step'))).toEqual(['1', '2', '3', '4', '1', null, '4', '2', '4', '4', '3', '2']);
    expect(styleOf(cells[0], '--g-heat')).toBe('0.14');
    expect(styleOf(cells[3], '--g-heat')).toBe('1');
    expect(cells[5]).not.toHaveAttribute('style');
  });
});

describe('WaterfallChart / Q-16', () => {
  const DATA = [
    { label: '期首', value: 1000, kind: 'total' as const },
    { label: '売上', value: 500 },
    { label: '原価', value: -300 },
    { label: '期末', kind: 'total' as const },
  ];

  it('Q-16 増減の棒は前の累計から浮かせ、合計の棒は 0 から立てる。読み上げは増減と累計、色の意味は凡例で', () => {
    const { container } = render(<WaterfallChart label="営業利益の内訳" data={DATA} table />);
    const group = screen.getByRole('group', { name: '営業利益の内訳' });
    expect(pointsIn(group).map((point) => point.getAttribute('aria-label'))).toEqual([
      '期首: 合計 1,000',
      '売上: 増減 +500、累計 1,500',
      '原価: 増減 -300、累計 1,200',
      '期末: 合計 1,200',
    ]);
    // 凡例は色の意味（押して隠すボタンではない）
    const legend = within(group).getByRole('list', { name: '凡例' });
    expect(within(legend).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['増加', '減少', '合計']);
    expect(within(legend).queryByRole('button')).toBeNull();
    const bars = [...container.querySelectorAll<HTMLElement>('.g-viz-bar')];
    expect(bars.map((bar) => bar.dataset.kind)).toEqual(['total', 'increase', 'decrease', 'total']);
    // 0〜1,500 の目盛り（0・500・1,000・1,500）。売上の棒は 1,000 から 1,500（上から 0〜33.3%）
    expect(bars[1]?.style.top).toBe('0%');
    expect(Number.parseFloat(bars[1]?.style.height ?? '0')).toBeCloseTo(33.33, 1);
    // 棒と棒を累計の高さでつなぐ線は、棒の数より 1 本少ない
    expect(container.querySelectorAll('.g-waterfall-connector')).toHaveLength(3);
    expect(within(within(group).getByRole('table')).getAllByRole('row')[3]?.textContent).toBe('原価-3001,200');
  });
});

describe('ParetoChart / Q-17', () => {
  const DATA = [
    { label: '傷', value: 10 },
    { label: 'その他', value: 5, other: true },
    { label: '寸法', value: 50 },
    { label: '欠け', value: 30 },
    { label: '汚れ', value: 5 },
  ];

  it('Q-17 大きい順に並べ（その他は最後）、累積比率を読み、目安に届く上位の項目の数を説明に書く', () => {
    const { container } = render(<ParetoChart label="不良の内訳" data={DATA} valueLabel="件数" description="寸法と欠けで 8 割" />);
    const group = screen.getByRole('group', { name: '不良の内訳' });
    expect(pointsIn(group).map((point) => point.getAttribute('aria-label'))).toEqual([
      '寸法: 件数 50、累積比率 50%',
      '欠け: 件数 30、累積比率 80%',
      '傷: 件数 10、累積比率 90%',
      '汚れ: 件数 5、累積比率 95%',
      'その他: 件数 5、累積比率 100%',
    ]);
    expect(group).toHaveAccessibleDescription('寸法と欠けで 8 割 上位 2 項目で全体の 80%');
    // 目安に届いた後の棒は薄くする
    expect([...container.querySelectorAll<HTMLElement>('.g-viz-bar')].map((bar) => bar.hasAttribute('data-muted'))).toEqual([false, false, true, true, true]);
    // 右の目盛りは 0〜100%
    expect(container.querySelector('.g-viz-y[data-side="end"]')?.textContent).toBe('100%80%60%40%20%0%');
  });

  it('Q-17 threshold={null} なら目安の線と文を出さない', () => {
    const { container } = render(<ParetoChart label="不良の内訳" data={DATA} threshold={null} />);
    expect(container.querySelector('.g-pareto-threshold')).toBeNull();
    expect(container.querySelector('.g-pareto-note')).toBeNull();
    expect(container.querySelector('[data-muted]')).toBeNull();
  });
});

describe('FunnelChart / Q-18', () => {
  it('Q-18 段の番号つきの一覧で、段ごとに数・最初の段に対する割合・前の段からの割合を文字で持つ', () => {
    const { container } = render(
      <FunnelChart
        label="登録までの流れ"
        data={[
          { label: '訪問', value: 12000 },
          { label: '登録', value: 3000 },
          { label: '使い始め', value: 1800 },
        ]}
      />,
    );
    const group = screen.getByRole('group', { name: '登録までの流れ' });
    const steps = within(within(group).getByRole('list')).getAllByRole('listitem');
    expect(within(group).getByRole('list').tagName).toBe('OL');
    expect(steps.map((step) => step.textContent)).toEqual(['訪問12,000', '登録3,000最初の段の 25%前の段から 25%', '使い始め1,800最初の段の 15%前の段から 60%']);
    expect([...container.querySelectorAll('.g-funnel-step')].map((step) => styleOf(step, '--g-funnel'))).toEqual(['1', '0.25', '0.15']);
  });
});

describe('FishboneDiagram / Q-19', () => {
  it('Q-19 特性の段落と、大骨・小骨・孫骨の入れ子の一覧。大骨は上と下に振り分け、行ごとに骨の通る位置を渡す', () => {
    const { container } = render(
      <FishboneDiagram
        label="不良率の要因"
        effect="不良率が 3% を超える"
        categories={[
          { label: '人', causes: ['経験が浅い', { label: '手順を守らない', causes: ['手順書が古い'] }] },
          { label: '機械', causes: ['刃の摩耗'] },
          { label: '材料', causes: ['ロットのばらつき'] },
        ]}
      />,
    );
    const group = screen.getByRole('group', { name: '不良率の要因' });
    expect(group).toHaveAttribute('aria-roledescription', '特性要因図');
    // 特性は最初に読む（目には魚の頭として右に置く）
    expect(group.querySelector('p')?.textContent).toBe('特性: 不良率が 3% を超える');
    const bones = within(group).getByRole('list', { name: '要因' });
    const categories = [...bones.children] as HTMLElement[];
    expect(categories.map((bone) => bone.dataset.side)).toEqual(['top', 'bottom', 'top']);
    expect(categories.map((bone) => styleOf(bone, '--g-fish-column'))).toEqual(['1', '1', '2']);
    expect(within(categories[0] as HTMLElement).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      '経験が浅い',
      '手順を守らない手順書が古い',
      '手順書が古い',
    ]);
    // 上の骨は 3 行（小骨 2・孫骨 1）。行の真ん中で骨が通る位置は 0.55 + 0.45 × (行 + 0.5) / 3
    const xs = [...(categories[0] as HTMLElement).querySelectorAll('[style*="--g-fish-x"]')].map((node) => Number(styleOf(node, '--g-fish-x')));
    expect(xs.map((x) => x.toFixed(3))).toEqual(['0.625', '0.775', '0.925']);
    // 下の骨は背骨（上）から名前（下）へ。1 行なら 1 − 0.45 × 0.5
    expect(Number(styleOf(categories[1]?.querySelector('[style*="--g-fish-x"]'), '--g-fish-x'))).toBeCloseTo(0.775, 5);
    expect(container.querySelectorAll('.g-fishbone-line')).toHaveLength(3);
  });
});

describe('GanttChart / Q-20', () => {
  const TASKS = [
    { label: '要件定義', start: '2026-10-05', end: '2026-10-09', progress: 1, group: '設計' },
    { label: '画面設計', start: '2026-10-12', end: '2026-10-23', progress: 0.4, group: '設計' },
    { label: '実装', start: '2026-10-19', end: '2026-11-06', group: '開発' },
    { label: 'リリース', start: '2026-11-09', milestone: true },
  ];

  it('Q-20 タスクの一覧で、行ごとに名前・期間・日数・進み具合を 1 つの文で読む。区切りは入れ子の一覧にする', () => {
    render(<GanttChart label="開発の予定" tasks={TASKS} today="2026-10-20" />);
    const group = screen.getByRole('group', { name: '開発の予定' });
    expect(group).toHaveAttribute('aria-roledescription', 'ガントチャート');
    const top = within(group).getAllByRole('list')[0] as HTMLElement;
    expect(top.tagName).toBe('OL');
    const sections = [...top.children] as HTMLElement[];
    expect(sections.map((item) => item.className)).toEqual(['g-gantt-group', 'g-gantt-group', 'g-gantt-row']);
    expect(within(sections[0] as HTMLElement).getAllByRole('listitem').map((item) => item.querySelector('.g-sr-only')?.textContent)).toEqual([
      '要件定義、2026年10月5日〜2026年10月9日（5日間）、進み具合 100%',
      '画面設計、2026年10月12日〜2026年10月23日（12日間）、進み具合 40%',
    ]);
    expect(sections[2]?.querySelector('.g-sr-only')?.textContent).toBe('リリース、2026年11月9日（マイルストーン）');
    // 見えている名前と割合は飾り（同じことを 1 つの文で読む）
    expect(sections[2]?.querySelector('.g-gantt-name')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Q-20 描く期間は週の始まり（既定は月曜）にそろえ、棒・今日の線・休み（土日と祝日）の地を期間に対する % で置く', () => {
    const { container } = render(<GanttChart label="開発の予定" tasks={TASKS} today="2026-10-20" />);
    // 10/5（月）〜 11/15（日）の 42 日。1 日は 100 / 42 %
    const day = 100 / 42;
    const bars = [...container.querySelectorAll<HTMLElement>('.g-gantt-bar')];
    expect(Number.parseFloat(bars[1]?.style.left ?? '')).toBeCloseTo(7 * day, 5);
    expect(Number.parseFloat(bars[1]?.style.width ?? '')).toBeCloseTo(12 * day, 5);
    expect(styleOf(bars[1], '--g-gantt-progress')).toBe('0.4');
    expect(Number.parseFloat(container.querySelector<HTMLElement>('.g-gantt-milestone')?.style.left ?? '')).toBeCloseTo(35.5 * day, 5);
    expect(Number.parseFloat(container.querySelector<HTMLElement>('.g-gantt-now > span')?.style.left ?? '')).toBeCloseTo(15.5 * day, 5);
    // 土日 12 日と、平日の祝日 2 日（10/12 スポーツの日・11/3 文化の日）
    expect(container.querySelectorAll('.g-gantt-off > span')).toHaveLength(14);
    expect([...container.querySelectorAll('.g-gantt-months > span')].map((month) => month.textContent)).toEqual(['2026年10月', '11月']);
  });

  it('Q-20 today={null} なら今日の線を引かず、週の始まりを日曜にできる', () => {
    const { container } = render(<GanttChart label="開発の予定" tasks={TASKS} today={null} firstDayOfWeek={0} holidays={null} />);
    expect(container.querySelector('.g-gantt-now')).toBeNull();
    // 10/4（日）〜 11/14（土）。土日だけを敷く
    expect(Number.parseFloat(container.querySelector<HTMLElement>('.g-gantt-bar')?.style.left ?? '')).toBeCloseTo((1 * 100) / 42, 5);
    expect(container.querySelectorAll('.g-gantt-off > span')).toHaveLength(12);
  });
});

describe('分析のグラフと図の data-* / D-11', () => {
  it('どの部品も data-* を外側の要素へ渡す', () => {
    const { container } = render(
      <>
        <ScatterChart label="s" series={[]} xLabel="x" yLabel="y" data-probe="scatter" />
        <RadarChart label="r" data={[]} x="k" series={[]} data-probe="radar" />
        <Heatmap label="h" rows={[]} columns={[]} values={[]} data-probe="heatmap" />
        <WaterfallChart label="w" data={[]} data-probe="waterfall" />
        <ParetoChart label="p" data={[]} data-probe="pareto" />
        <FunnelChart label="f" data={[]} data-probe="funnel" />
        <FishboneDiagram label="b" effect="e" categories={[]} data-probe="fishbone" />
        <GanttChart label="g" tasks={[]} today={null} data-probe="gantt" />
      </>,
    );
    expect([...container.querySelectorAll('[data-probe]')].map((node) => [node.getAttribute('data-probe'), node.parentElement === container])).toEqual([
      ['scatter', true],
      ['radar', true],
      ['heatmap', true],
      ['waterfall', true],
      ['pareto', true],
      ['funnel', true],
      ['fishbone', true],
      ['gantt', true],
    ]);
    expect(screen.getAllByText('データがありません')).toHaveLength(7);
  });
});
