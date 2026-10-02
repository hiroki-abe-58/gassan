/**
 * Modal.Chart — グラフのテキスト代替（B-14）。
 * 視覚チャートは描かない。名前・要約・元データの配線だけを確かめる。
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GassanProvider, Modal, englishLabels } from '../src';
import { resetWarnings } from '../src/internal/dom';
import { renderModal } from './utils';

const bars = (
  <svg viewBox="0 0 30 10" role="img" aria-label="棒グラフ">
    <rect x="0" y="4" width="8" height="6" />
    <rect x="11" y="0" width="8" height="10" />
    <rect x="22" y="5" width="8" height="5" />
  </svg>
);

const table = (
  <table>
    <thead>
      <tr>
        <th scope="col">月</th>
        <th scope="col">売上</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>3月</td>
        <td>120</td>
      </tr>
    </tbody>
  </table>
);

function renderChart(props: Partial<Parameters<typeof Modal.Chart>[0]> = {}): void {
  renderModal({
    label: 'レポート',
    children: (
      <Modal.Body>
        <Modal.Chart label="月別の売上" summary="3月が最大で、以降は横ばい。" {...props}>
          {bars}
        </Modal.Chart>
      </Modal.Body>
    ),
  });
}

describe('chart / B-14', () => {
  beforeEach(() => {
    resetWarnings();
  });

  it('label が図の名前に、summary が説明になる', () => {
    renderChart();
    const figure = screen.getByRole('figure', { name: '月別の売上' });
    expect(figure).toHaveAccessibleDescription('3月が最大で、以降は横ばい。');
    // 要約は読み上げ専用ではなく、画面にも出ている。
    expect(screen.getByText('3月が最大で、以降は横ばい。')).toBeVisible();
  });

  it('既定では視覚チャートを支援技術から隠す', () => {
    renderChart();
    const visual = document.querySelector('.g-chart-visual');
    expect(visual).toHaveAttribute('aria-hidden', 'true');
    // 「path path path…」を読ませない。
    expect(screen.queryByRole('img', { name: '棒グラフ' })).toBeNull();
  });

  it('visualAccessible で視覚チャートを開放する', () => {
    renderChart({ visualAccessible: true });
    expect(document.querySelector('.g-chart-visual')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('img', { name: '棒グラフ' })).toBeInTheDocument();
  });

  it('data は details で開閉でき、既定の文言は「元データを表示」', async () => {
    const user = userEvent.setup();
    renderChart({ data: table });
    const details = document.querySelector<HTMLDetailsElement>('details.g-chart-data');
    if (!details) throw new Error('details missing');
    expect(details.open).toBe(false);
    const summary = screen.getByText('元データを表示');
    expect(summary.tagName).toBe('SUMMARY');
    expect(details.querySelector('table')).not.toBeNull();

    await user.click(summary);
    expect(details.open).toBe(true);
    expect(screen.getByRole('columnheader', { name: '売上' })).toBeInTheDocument();
  });

  it('dataLabel で文言を差し替えられ、Provider の英語文言にも従う', () => {
    renderChart({ data: table, dataLabel: '表で見る' });
    expect(screen.getByText('表で見る').tagName).toBe('SUMMARY');

    render(
      <GassanProvider labels={englishLabels}>
        <Modal.Chart label="Sales" summary="Peaks in March." data={table}>
          {bars}
        </Modal.Chart>
      </GassanProvider>,
    );
    expect(screen.getByText('Show data').tagName).toBe('SUMMARY');
  });

  it('data が無ければ details を出さない', () => {
    renderChart();
    expect(document.querySelector('details')).toBeNull();
  });

  it('隠した視覚チャートの中にフォーカス可能な要素があれば開発者に警告する', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Modal.Chart label="操作できる図" summary="要約">
        <button type="button">系列を切り替え</button>
      </Modal.Chart>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('visualAccessible'));
    warn.mockClear();
    render(
      <Modal.Chart label="開放した図" summary="要約" visualAccessible>
        <button type="button">系列を切り替え</button>
      </Modal.Chart>,
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
