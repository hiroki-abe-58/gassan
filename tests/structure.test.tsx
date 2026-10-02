/**
 * 要件監査（2026-09-29）で「実装はあるが自動テストが無い」と判明した箇所を埋める。
 *
 * 対象: T-02 / A-08（見出し構造）、H-01 / H-02（コントロールのスロット）、
 *       H-06（ページインジケータ）、B-13（テーブルの横スクロール）。
 *
 * これらは docs/traceability.md で「未検証」だった行であり、
 * ここにテストを置くことで「実装」に格上げされる。
 */

import { render, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Modal } from '../src';
import { renderModal } from './utils';

/* ========================================================================== */
/* 見出し構造 / T-02, A-08                                                    */
/* ========================================================================== */

describe('heading structure / T-02, A-08', () => {
  it('タイトルは h2、セクション見出しは h3（レベルを飛ばさない）', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>配送の設定</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Section title="お届け先">住所を入力します</Modal.Section>
          </Modal.Body>
        </>
      ),
    });

    const scope = within(dialog());
    expect(scope.getByRole('heading', { level: 2 })).toHaveTextContent('配送の設定');
    expect(scope.getByRole('heading', { level: 3 })).toHaveTextContent('お届け先');
    // ダイアログの中に h1 を作らない（ページ側の見出し階層を壊さない）
    expect(scope.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('タイトルが無くても、セクションは h3 のままで h2 に繰り上がらない', () => {
    const { dialog } = renderModal({
      label: 'クイック検索',
      children: (
        <Modal.Body>
          <Modal.Section title="最近開いたもの">履歴</Modal.Section>
        </Modal.Body>
      ),
    });

    const scope = within(dialog());
    expect(scope.getByRole('heading', { level: 3 })).toHaveTextContent('最近開いたもの');
    expect(scope.queryByRole('heading', { level: 2 })).toBeNull();
  });
});

/* ========================================================================== */
/* コントロールのスロット / H-01, H-02                                        */
/* ========================================================================== */

describe('controls slots / H-01, H-02', () => {
  it('位置はスロット名で決まり、書いた順に依存しない', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            {/* わざと end → center → start の順に書く */}
            <Modal.Controls
              end={<Modal.Close />}
              center={<Modal.Indicator current={2} total={5} />}
              start={<Modal.Back />}
            />
            <Modal.Title>設定</Modal.Title>
          </Modal.Header>
          <Modal.Body>本文</Modal.Body>
        </>
      ),
    });

    const controls = dialog().querySelector<HTMLElement>('.k-controls');
    expect(controls).not.toBeNull();

    // DOM 順は常に start → center → end。視覚順と Tab 順が一致する
    const slots = Array.from(controls!.children).map((child) => child.getAttribute('data-slot'));
    expect(slots).toEqual(['start', 'center', 'end']);

    const startSlot = controls!.querySelector<HTMLElement>('[data-slot="start"]')!;
    const endSlot = controls!.querySelector<HTMLElement>('[data-slot="end"]')!;
    expect(within(startSlot).getByRole('button')).toHaveAccessibleName('戻る');
    expect(within(endSlot).getByRole('button')).toHaveAccessibleName('閉じる');
  });

  it('戻るが無くても3スロットは維持される（中央がズレない）', () => {
    const { dialog } = renderModal();
    const controls = dialog().querySelector<HTMLElement>('.k-controls')!;
    expect(Array.from(controls.children).map((c) => c.getAttribute('data-slot'))).toEqual([
      'start',
      'center',
      'end',
    ]);
  });

  it('タイトルはコントロール行の外に出る（長文でも干渉しない）', () => {
    const { dialog } = renderModal();
    const controls = dialog().querySelector<HTMLElement>('.k-controls')!;
    const title = dialog().querySelector<HTMLElement>('.k-title')!;
    expect(controls.contains(title)).toBe(false);
  });
});

/* ========================================================================== */
/* ページインジケータ / H-06                                                  */
/* ========================================================================== */

describe('indicator / H-06', () => {
  function IndicatorHarness({ current }: { current: number }): ReactNode {
    return (
      <Modal.Root open onOpenChange={() => undefined}>
        <Modal.Header>
          <Modal.Controls
            center={<Modal.Indicator current={current} total={5} />}
            end={<Modal.Close />}
          />
          <Modal.Title>手順</Modal.Title>
        </Modal.Header>
        <Modal.Body>本文</Modal.Body>
      </Modal.Root>
    );
  }

  it('視覚は「2 / 5」、読み上げは文章に分かれている', () => {
    render(<IndicatorHarness current={2} />);
    const indicator = document.querySelector<HTMLElement>('.k-indicator')!;

    // 「2スラッシュ5」と読まれないよう、視覚表現は支援技術から隠す
    const visual = indicator.querySelector<HTMLElement>('[aria-hidden="true"]')!;
    expect(visual).toHaveTextContent('2 / 5');
    expect(indicator).toHaveTextContent('5ステップ中2ステップ目');
  });

  it('ステップが変わると読み上げる', async () => {
    const { rerender } = render(<IndicatorHarness current={1} />);
    const live = () => document.querySelector<HTMLElement>('p[role="status"]')!;
    expect(live()).toHaveTextContent('');

    rerender(<IndicatorHarness current={2} />);
    await waitFor(() => {
      expect(live()).toHaveTextContent('5ステップ中2ステップ目');
    });
  });
});

/* ========================================================================== */
/* テーブル / B-13                                                            */
/* ========================================================================== */

describe('table / B-13', () => {
  it('横スクロールするテーブルは、名前を持つフォーカス可能な領域になる', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>実績</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Table label="月別の実績">
              <table>
                <tbody>
                  <tr>
                    <td>1月</td>
                  </tr>
                </tbody>
              </table>
            </Modal.Table>
          </Modal.Body>
        </>
      ),
    });

    // 名前のないフォーカサブル要素を作らない。B-02 と同じ理由
    const group = within(dialog()).getByRole('group', { name: '月別の実績' });
    expect(group).toHaveAttribute('tabindex', '0');
    expect(group.querySelector('table')).not.toBeNull();
  });
});
