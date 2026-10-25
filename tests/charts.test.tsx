/**
 * グラフ（Q-01〜Q-12）。
 *
 * 形の計算（目盛り・曲線・間引き）は純粋関数を直接呼んで確かめ、部品は役割・名前・キー操作・状態を見る。
 * 描いた見た目（線の描き込み・棒の伸び・色）はヘッドレス Chrome で確かめる。ここでは CSS の不変条件だけを見る。
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { BarChart, BarList, DonutChart, Gauge, LineChart, Sparkline } from '../src';
import { arcLengths, estimateTextWidth, labelStride, monotonePath, niceTicks, placeAxisLabels } from '../src/internal/chart-scale';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const MONTHLY = [
  { month: '1月', revenue: 1180000, cost: 820000 },
  { month: '2月', revenue: 1240000, cost: 850000 },
  { month: '3月', revenue: 1520000, cost: 900000 },
];
const SERIES = [
  { key: 'revenue', label: '売上' },
  { key: 'cost', label: '費用' },
];

/** 点（当たりの領域）。グラフの group の中の role="img"。 */
const pointsIn = (group: HTMLElement): HTMLElement[] => within(group).getAllByRole('img');

describe('グラフの目盛りと線の形 / Q-03 Q-10', () => {
  it('Q-10 目盛りは 1・2・2.5・5 × 10^n の刻みで、範囲の両端も刻みに乗り、目盛りの間は count 個以下', () => {
    expect(niceTicks(0, 123)).toEqual([0, 25, 50, 75, 100, 125]);
    expect(niceTicks(0, 2360000)).toEqual([0, 500000, 1000000, 1500000, 2000000, 2500000]);
    expect(niceTicks(-30, 80)).toEqual([-50, 0, 50, 100]);
    expect(niceTicks(0, 0.84)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(0, 746, 3)).toEqual([0, 250, 500, 750]);
  });

  it('Q-10 値がどれも整数なら端数の刻みを使わない。値が 1 つなら上下に 1 割の余白を取る', () => {
    expect(niceTicks(0, 3)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(0, 12)).toEqual([0, 5, 10, 15]);
    expect(niceTicks(100, 100)).toEqual([90, 95, 100, 105, 110]);
    expect(niceTicks(0, 0)).toEqual([0, 1]);
  });

  it('Q-03 曲線は点と点の間で行き過ぎない（単調な 3 次補間。制御点が両端の値の間に収まる）', () => {
    const points = [
      [0, 50],
      [25, 10],
      [50, 10],
      [75, 60],
      [100, 55],
    ] as const;
    const path = monotonePath(points);
    const curves = [...path.matchAll(/C([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)/g)];
    expect(curves).toHaveLength(points.length - 1);
    curves.forEach((curve, i) => {
      const from = points[i]?.[1] ?? 0;
      const to = points[i + 1]?.[1] ?? 0;
      const [lo, hi] = [Math.min(from, to), Math.max(from, to)];
      for (const y of [Number(curve[2]), Number(curve[4])]) {
        expect(y).toBeGreaterThanOrEqual(lo - 1e-9);
        expect(y).toBeLessThanOrEqual(hi + 1e-9);
      }
    });
  });

  it('Q-10 横の目盛りの文字は、いちばん長い文字が隣と重ならない本数おきに出し、線のグラフでは端の文字を内側へ寄せる', () => {
    expect(estimateTextWidth('ダッシュボード', 12)).toBe(84);
    expect(labelStride([20, 84, 30], 40)).toBe(3);
    expect(labelStride([20], 40)).toBe(1);
    // 端の文字は器の内側へ寄せ、寄せた後に重なる間の文字は落とす（最後の文字は残す）
    expect(placeAxisLabels([30, 30, 30], [0, 50, 100], 200)).toEqual([{ index: 0, edge: 'start' }, { index: 1 }, { index: 2, edge: 'end' }]);
    expect(placeAxisLabels([30, 30, 30], [0, 50, 100], 80)).toEqual([{ index: 0, edge: 'start' }, { index: 2, edge: 'end' }]);

    // 31 日の線を、測れない間の幅（600px）で描く。1 日あたり 20px なので、「10月31日」（約 64px）は 4 本おき
    const days = Array.from({ length: 31 }, (_, i) => ({ day: `10月${String(i + 1)}日`, value: i }));
    const { container } = render(<LineChart label="日ごとの利用" data={days} x="day" series={[{ key: 'value', label: '利用' }]} />);
    const labels = [...container.querySelectorAll('.g-viz-x > span')];
    expect(labels.length).toBeGreaterThan(1);
    expect(labels.length).toBeLessThan(days.length);
    expect(labels[0]).toHaveTextContent('10月1日');
    expect(labels[0]).toHaveAttribute('data-edge', 'start');
  });
});

describe('LineChart / Q-01 Q-02 Q-03 Q-11', () => {
  it('Q-01 グラフは名前と「グラフ」という役割の説明を持つ group で、要約を説明として読ませ、table で元データを開ける', () => {
    render(<LineChart label="月ごとの売上" description="3月が最大" data={MONTHLY} x="month" series={SERIES} table xLabel="月" data-section="sales" />);
    const group = screen.getByRole('group', { name: '月ごとの売上' });
    expect(group).toHaveAttribute('aria-roledescription', 'グラフ');
    expect(group).toHaveAttribute('data-section', 'sales');
    expect(group).toHaveAccessibleDescription('3月が最大');
    expect(within(group).getByText('元データを表示')).toBeInTheDocument();
    // 表の器はグラフと別の名前（入れ子の group を同じ名前にしない）
    expect(within(group).getByRole('group', { name: '月ごとの売上の元データ' })).toBeInTheDocument();
    const table = within(group).getByRole('table');
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['月', '売上', '費用']);
    expect(within(table).getByRole('rowheader', { name: '3月' })).toBeInTheDocument();
    expect(within(table).getByText('1,520,000')).toBeInTheDocument();
  });

  it('Q-02 点は 1 つだけが Tab で止まり、矢印・Home・End で移ると、項目と系列の値をまとめて読み上げる', () => {
    const { container } = render(<LineChart label="月ごとの売上" data={MONTHLY} x="month" series={SERIES} />);
    const points = pointsIn(screen.getByRole('group', { name: '月ごとの売上' }));
    expect(points.map((point) => point.getAttribute('aria-label'))).toEqual([
      '1月: 売上 1,180,000、費用 820,000',
      '2月: 売上 1,240,000、費用 850,000',
      '3月: 売上 1,520,000、費用 900,000',
    ]);
    expect(points.map((point) => point.tabIndex)).toEqual([0, -1, -1]);

    points[0]?.focus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(points[1]);
    expect(points.map((point) => point.tabIndex)).toEqual([-1, 0, -1]);
    // 指した点のツールチップ（同じ値を目に見せるだけなので読ませない）
    const tooltip = container.querySelector('.g-viz-tooltip');
    expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    expect(tooltip).toHaveTextContent('2月');

    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(document.activeElement).toBe(points[2]);
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(points[2]);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(document.activeElement).toBe(points[0]);
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(points[0]);
  });

  it('Q-02 欠けた値は「なし」と読み、線はそこで切る', () => {
    const data = [
      { month: '1月', revenue: 10 },
      { month: '2月', revenue: null },
      { month: '3月', revenue: 30 },
      { month: '4月', revenue: 20 },
    ];
    const { container } = render(<LineChart label="売上" data={data} x="month" series={[{ key: 'revenue', label: '売上' }]} />);
    expect(pointsIn(screen.getByRole('group', { name: '売上' }))[1]).toHaveAttribute('aria-label', '2月: 売上 なし');
    const line = container.querySelector('.g-viz-line')?.getAttribute('d') ?? '';
    expect(line.match(/M/g)).toHaveLength(2);
  });

  it('Q-11 系列が 2 つ以上なら、凡例は押して出し入れするボタンで、最後の 1 つは隠さない', () => {
    const { container } = render(<LineChart label="月ごとの売上" data={MONTHLY} x="month" series={SERIES} />);
    const legend = screen.getByRole('list', { name: '凡例' });
    const revenue = within(legend).getByRole('button', { name: '売上' });
    const cost = within(legend).getByRole('button', { name: '費用' });
    expect(revenue).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(cost);
    expect(cost).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('.g-viz-line')).toHaveLength(1);
    expect(pointsIn(screen.getByRole('group', { name: '月ごとの売上' }))[0]).toHaveAttribute('aria-label', '1月: 売上 1,180,000');

    fireEvent.click(revenue);
    expect(revenue).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(cost);
    expect(cost).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('.g-viz-line')).toHaveLength(2);
  });

  it('Q-03 縦の範囲は既定で 0 を含み、zero={false} なら値の範囲に寄せる', () => {
    const data = [
      { day: 'a', ms: 101 },
      { day: 'b', ms: 118 },
    ];
    const ticksOf = (container: HTMLElement): string[] => [...container.querySelectorAll('.g-viz-y > span')].map((span) => span.textContent ?? '');
    const zero = render(<LineChart label="応答時間" data={data} x="day" series={[{ key: 'ms', label: '応答時間' }]} />);
    expect(ticksOf(zero.container).at(-1)).toBe('0');
    zero.unmount();
    const fitted = render(<LineChart label="応答時間" data={data} x="day" series={[{ key: 'ms', label: '応答時間' }]} zero={false} />);
    expect(ticksOf(fitted.container)).toEqual(['120', '115', '110', '105', '100']);
  });
});

describe('BarChart / Q-04', () => {
  it('Q-04 積み上げは正と負を別々に積み、0 から最も遠い片だけ端を丸める', () => {
    const { container } = render(
      <BarChart
        label="内訳"
        data={[{ item: 'a', x: 10, y: 20, z: -5 }]}
        x="item"
        series={[
          { key: 'x', label: 'X' },
          { key: 'y', label: 'Y' },
          { key: 'z', label: 'Z' },
        ]}
        stacked
      />,
    );
    // 目盛りは -10〜30（0 の線は上から 75%）
    const bars = [...container.querySelectorAll<HTMLElement>('.g-viz-band .g-viz-bar')];
    expect(bars.map((bar) => [bar.style.top, bar.style.height, bar.getAttribute('data-end')])).toEqual([
      ['50%', '25%', null],
      ['0%', '50%', 'top'],
      ['75%', '12.5%', 'bottom'],
    ]);
    expect(container.querySelectorAll('.g-viz-band .g-viz-slot')).toHaveLength(1);
  });

  it('Q-04 並べた棒は系列ごとの溝に 1 本ずつ置き、負の値は 0 の線から下へ伸ばす', () => {
    const { container } = render(
      <BarChart
        label="増減"
        data={[{ item: 'a', up: 10, down: -10 }]}
        x="item"
        series={[
          { key: 'up', label: '増' },
          { key: 'down', label: '減' },
        ]}
      />,
    );
    expect(container.querySelectorAll('.g-viz-band .g-viz-slot')).toHaveLength(2);
    const bars = [...container.querySelectorAll<HTMLElement>('.g-viz-bar')];
    expect(bars.map((bar) => bar.getAttribute('data-end'))).toEqual(['top', 'bottom']);
    expect(bars[1]?.style.top).toBe('50%');
  });

  it('Q-04 layout="horizontal" では横の棒にし、項目の名前の列を置き、↑↓ で点をたどる', () => {
    const { container } = render(
      <BarChart
        label="機能ごとの利用回数"
        layout="horizontal"
        data={[
          { feature: 'ダッシュボード', uses: 200 },
          { feature: 'API の呼び出し', uses: 100 },
        ]}
        x="feature"
        series={[{ key: 'uses', label: '回数' }]}
      />,
    );
    expect([...container.querySelectorAll('.g-viz-hlabels > span')].map((span) => span.textContent)).toEqual(['ダッシュボード', 'API の呼び出し']);
    const bars = [...container.querySelectorAll<HTMLElement>('.g-viz-bar')];
    expect(bars.map((bar) => [bar.style.left, bar.style.width, bar.getAttribute('data-end')])).toEqual([
      ['0%', '100%', 'end'],
      ['0%', '50%', 'end'],
    ]);
    const points = pointsIn(screen.getByRole('group', { name: '機能ごとの利用回数' }));
    expect(points[1]).toHaveAttribute('aria-label', 'API の呼び出し: 回数 100');
    points[0]?.focus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(points[1]);
  });
});

describe('DonutChart / Q-05', () => {
  it('Q-05 凡例に名前・値・割合を並べ、真ん中は合計。区切りか凡例を指すと、真ん中にその値と割合を出す', () => {
    const { container } = render(
      <DonutChart
        label="プラン"
        data={[
          { label: 'Pro', value: 30 },
          { label: 'Free', value: 10 },
        ]}
        table
      />,
    );
    const group = screen.getByRole('group', { name: 'プラン' });
    const items = within(within(group).getByRole('list', { name: '凡例' })).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Pro3075%', 'Free1025%']);
    const center = container.querySelector('.g-donut-center');
    expect(center).toHaveAttribute('aria-hidden', 'true');
    expect(center).toHaveTextContent('40合計');

    fireEvent.pointerEnter(items[1] as HTMLElement);
    expect(center).toHaveTextContent('10Free・25%');
    expect(container.querySelectorAll('.g-donut-segment[data-active]')).toHaveLength(1);
    fireEvent.pointerLeave(items[1] as HTMLElement);
    expect(center).toHaveTextContent('40合計');

    expect(within(within(group).getByRole('table')).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['項目', '値', '割合']);
  });

  it('Q-05 隙間より小さな区切りも円から消さない。底上げした分は大きな区切りから引き、凡例の割合は元のまま', () => {
    // 1,284 / 642 / 96 / 12。12 は 0.59% で、隙間（0.8）より短いため、以前は円に描かれなかった
    const { container } = render(
      <DonutChart
        label="プランごとのワークスペース"
        data={[
          { label: 'Free', value: 1284 },
          { label: 'Pro', value: 642 },
          { label: 'Max', value: 96 },
          { label: 'Enterprise', value: 12 },
        ]}
      />,
    );
    const segments = [...container.querySelectorAll('.g-donut-segment')];
    expect(segments).toHaveLength(4);
    const dash = segments.map((segment) => (segment.getAttribute('stroke-dasharray') ?? '').split(' ').map(Number));
    // 円周を 100 とした長さ（見える長さ + 隙間）の合計は 100 のまま
    expect(dash.reduce((sum, [visible = 0, rest = 0]) => sum + visible + rest, 0)).toBeCloseTo(400);
    expect(dash.reduce((sum, [visible = 0]) => sum + visible + 0.8, 0)).toBeCloseTo(100);
    expect(dash[3]?.[0]).toBeCloseTo(1.5);
    expect(within(screen.getByRole('list', { name: '凡例' })).getAllByRole('listitem').map((item) => item.lastChild?.textContent)).toEqual([
      '63.1%',
      '31.6%',
      '4.7%',
      '0.6%',
    ]);
  });

  it('Q-05 区切りの長さ: 底上げは元の順位を崩さず、0 は描かず、区切りが多すぎるときは割合のまま', () => {
    const lengths = arcLengths([1284, 642, 96, 12], 0.8);
    expect(lengths.reduce((sum, length) => sum + length, 0)).toBeCloseTo(100);
    expect(lengths[3]).toBeCloseTo(2.3);
    expect(lengths[0]).toBeGreaterThan(lengths[1] as number);
    expect(lengths[1]).toBeGreaterThan(lengths[2] as number);
    expect(lengths[2]).toBeGreaterThan(lengths[3] as number);
    // 0 と負の値は長さ 0（描かない）。円（隙間 0）でも底は MIN_ARC
    expect(arcLengths([99.5, 0.5, 0, -3], 0)).toEqual([expect.closeTo(98.5), expect.closeTo(1.5), 0, 0]);
    // 底上げしきれない（50 個の同じ値）ときは割合のまま
    expect(arcLengths(Array.from({ length: 50 }, () => 1), 0.8).every((length) => length === 2)).toBe(true);
    expect(arcLengths([0, 0], 0.8)).toEqual([0, 0]);
  });

  it('Q-05 凡例が円の下に回ったときは、円を真ん中に置く', () => {
    expect(css).toMatch(/\.g-donut-body \{[^}]*flex-wrap: wrap;[^}]*justify-content: center;/);
  });

  it('Q-05 合計が 0 なら区切りを描かず、データが無ければ「データがありません」と出す', () => {
    const empty = render(<DonutChart label="空" data={[{ label: 'A', value: 0 }]} />);
    expect(empty.container.querySelectorAll('.g-donut-segment')).toHaveLength(0);
    empty.unmount();
    render(<DonutChart label="無し" data={[]} />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });
});

describe('Sparkline・BarList・Gauge / Q-06 Q-07 Q-08', () => {
  it('Q-06 小さな推移は 1 枚の絵で、名前に最小・最大・最新の値を添えて読ませる', () => {
    const { container } = render(<Sparkline label="売上" data={[3, 1, 9, null, 4]} />);
    expect(screen.getByRole('img', { name: '売上: 最小 1、最大 9、最新 4' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.g-sparkline-line')).toHaveLength(2);
    render(<Sparkline label="空" data={[null, null]} />);
    expect(screen.getByRole('img', { name: '空: データがありません' })).toBeInTheDocument();
  });

  it('Q-07 順位の棒は名前と値の一覧で、棒の長さはいちばん大きな値に対する割合。href で名前をリンクにする', () => {
    render(
      <BarList
        label="よく見られたページ"
        data={[
          { label: '/dashboard', value: 200, href: '/dashboard' },
          { label: '/reports', value: 100 },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: 'よく見られたページ' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.style.getPropertyValue('--g-bar'))).toEqual(['1', '0.5']);
    expect(within(items[0] as HTMLElement).getByRole('link', { name: '/dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(items[1]).toHaveTextContent('100');
  });

  it('Q-08 メーターは role="meter" に値と読める値を持たせ、範囲の外の値は端へ寄せる', () => {
    render(<Gauge label="ストレージ" value={86} />);
    const meter = screen.getByRole('meter', { name: 'ストレージ' });
    expect(meter).toHaveAttribute('aria-valuenow', '86');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-valuetext', '86%');

    render(<Gauge label="席" value={140} max={20} valueText={(value, _min, max) => `${String(value)} / ${String(max)} 席`} />);
    const seats = screen.getByRole('meter', { name: '席' });
    expect(seats).toHaveAttribute('aria-valuenow', '20');
    expect(seats).toHaveAttribute('aria-valuetext', '20 / 20 席');
  });
});

describe('グラフの色と動き / Q-09 Q-12', () => {
  it('Q-09 系列の色は 1 がアクセントに従い、2〜8 は明暗とも面と 3:1 以上', () => {
    const contrast = (a: string, b: string): number => {
      const lum = (hex: string): number => {
        const [r, g, bl] = [1, 3, 5]
          .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
          .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
        return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (bl ?? 0);
      };
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
    };
    const tokens = css.slice(css.indexOf('@layer gassan.tokens {'), css.indexOf('@layer gassan.reset {'));
    const dark = tokens.slice(tokens.indexOf('@media (prefers-color-scheme: dark)'));
    const light = tokens.slice(0, tokens.indexOf('@media (prefers-color-scheme: dark)'));
    const read = (block: string, name: string): string => new RegExp(`${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim() ?? '';

    expect(read(light, '--g-chart-1')).toBe('var(--g-accent)');
    const failures = [2, 3, 4, 5, 6, 7, 8].flatMap((n) =>
      [
        ['light', read(light, `--g-chart-${String(n)}`), read(light, '--g-surface')],
        ['dark', read(dark, `--g-chart-${String(n)}`), read(dark, '--g-surface')],
      ]
        .filter(([, color, surface]) => contrast(color ?? '', surface ?? '') < 3)
        .map(([scheme, color]) => `${scheme ?? ''} --g-chart-${String(n)} ${color ?? ''}`),
    );
    expect(failures).toEqual([]);
  });

  it('Q-12 描き込みの時間は動きの段のトークンから取り、動きを減らす設定では止める', () => {
    expect(css).toMatch(/\.g-viz-svg\s*\{[^}]*animation:\s*g-viz-reveal calc\(var\(--g-dur-slow\) \* 3\)/);
    expect(css).toMatch(/\.g-viz-slot\s*\{[^}]*animation:\s*g-viz-grow calc\(var\(--g-dur-slow\) \* 2\)/);
    const reduced = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {2}\}/g)].map((m) => m[1] ?? '').join('\n');
    for (const part of ['.g-viz-svg', '.g-viz-dot', '.g-viz-slot', '.g-donut-segment', '.g-gauge-fill', '.g-bar-list-bar']) {
      expect(reduced).toContain(part);
    }
    expect(reduced).toMatch(/\.g-bar-list-bar\)\s*\{\s*animation:\s*none;/);
  });
});
