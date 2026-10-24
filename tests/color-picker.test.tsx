/**
 * 色の選択（I-23）。
 *
 * 値は '#rrggbb'（ネイティブの input type="color" と同じ形）。彩度と明るさの面（2 次元のスライダー）・色相・
 * 16 進数の欄・よく使う色で選ぶ。面の位置と見た目はヘッドレス Chrome で確かめる。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import { hexToHsv, hsvToHex, normalizeHex } from '../src/internal/color';

const trigger = (name: string | RegExp = '色'): HTMLElement => screen.getByRole('button', { name });
const area = (): HTMLElement => screen.getByRole('slider', { name: '彩度と明るさ' });
const hexField = (): HTMLElement => screen.getByRole('textbox', { name: '16 進数のカラーコード' });

describe('色の計算 / I-23', () => {
  it('I-23 16 進数は # の有無・3 桁・大文字を小文字の 6 桁にそろえ、読めない値は null。灰色は色相を保ったまま HSV にする', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex(' 3346D3 ')).toBe('#3346d3');
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('blue')).toBeNull();
    expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 });
    expect(hexToHsv('#00ff00')).toEqual({ h: 120, s: 100, v: 100 });
    expect(hexToHsv('#3346d3')).toEqual({ h: 233, s: 76, v: 83 });
    expect(hexToHsv('#808080', 210)).toEqual({ h: 210, s: 0, v: 50 });
    expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe('#0000ff');
    expect(hsvToHex({ h: 30, s: 0, v: 0 })).toBe('#000000');
  });
});

describe('色の選択 / I-23', () => {
  it('I-23 ボタンは色の見本と値を出し、値を説明として読む。開くと面の摘み（2 次元のスライダー）へフォーカスが入る', async () => {
    const user = userEvent.setup();
    render(
      <Modal.Field label="ブランドの色" help="ロゴとボタンに使う">
        {(control) => <Modal.ColorPicker {...control} defaultValue="#3346D3" data-testid="picker" />}
      </Modal.Field>,
    );
    expect(trigger(/ブランドの色/)).toHaveAccessibleDescription('#3346d3 ロゴとボタンに使う');
    expect(screen.getByTestId('picker')).toContainElement(trigger(/ブランドの色/));
    await user.click(trigger(/ブランドの色/));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('色を選ぶ');
    expect(area()).toHaveFocus();
    expect(area()).toHaveAttribute('aria-roledescription', '2 次元のスライダー');
    expect(area()).toHaveAttribute('aria-valuetext', '彩度 76%、明るさ 83%');
    expect(screen.getByRole('slider', { name: '色相' })).toHaveAttribute('aria-valuetext', '233 度');
    expect(hexField()).toHaveValue('#3346d3');
  });

  it('I-23 面は ←→ で彩度、↑↓ で明るさ、Shift で 10 ずつ、Home / End で彩度の端へ動き、動かすたびに値が変わる。Esc で閉じてボタンへ戻る', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.ColorPicker aria-label="色" defaultValue="#ff0000" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.keyboard('{ArrowLeft}');
    expect(area()).toHaveAttribute('aria-valuetext', '彩度 99%、明るさ 100%');
    expect(onValueChange).toHaveBeenLastCalledWith(hsvToHex({ h: 0, s: 99, v: 100 }));
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(area()).toHaveAttribute('aria-valuetext', '彩度 99%、明るさ 90%');
    await user.keyboard('{Home}');
    expect(area()).toHaveAttribute('aria-valuenow', '0');
    expect(onValueChange).toHaveBeenLastCalledWith(hsvToHex({ h: 0, s: 0, v: 90 }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it('I-23 灰色では色相を動かしても色は変わらず、面を動かすとその色相で色が付く。16 進数の欄は 6 桁を打ち終えたとき、3 桁は Enter で色を変える', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.ColorPicker aria-label="色" defaultValue="#808080" onValueChange={onValueChange} />);
    await user.click(trigger());
    const hue = screen.getByRole('slider', { name: '色相' });
    fireEvent.change(hue, { target: { value: '200' } });
    expect(hue).toHaveAttribute('aria-valuetext', '200 度');
    expect(onValueChange).not.toHaveBeenCalled();
    area().focus();
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith(hsvToHex({ h: 200, s: 100, v: 50 }));
    await user.clear(hexField());
    await user.type(hexField(), '#abc');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('#aabbcc');
    expect(hexField()).toHaveValue('#aabbcc');
    await user.clear(hexField());
    await user.type(hexField(), '00FF00');
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00');
  });

  it('I-23 よく使う色はラジオの並びで、今の色と同じ見本が選ばれている。押すとその値のまま変わり、name を渡すと hidden input に入る', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactNode {
      const [color, setColor] = useState('#3346d3');
      return (
        <form aria-label="設定">
          <Modal.ColorPicker
            aria-label="色"
            name="accent"
            value={color}
            onValueChange={setColor}
            swatches={[
              { value: '#3346d3', label: '青' },
              { value: '#E5484D', label: '赤' },
            ]}
          />
        </form>
      );
    }
    render(<Controlled />);
    await user.click(trigger());
    const group = screen.getByRole('radiogroup', { name: 'よく使う色' });
    expect(within(group).getByRole('radio', { name: '青' })).toBeChecked();
    await user.click(within(group).getByRole('radio', { name: '赤' }));
    expect(within(group).getByRole('radio', { name: '赤' })).toBeChecked();
    expect(screen.getByRole('form', { name: '設定' })).toHaveFormValues({ accent: '#e5484d' });
    expect(trigger()).toHaveAccessibleDescription('#e5484d');
  });

  it('I-23 窓の列は minmax(0, 1fr) で、16 進数の欄の固有の幅で窓より広がらない', () => {
    // 文字の小さい器（サイトのテーマの窓）に置くと、欄の固有の幅（size の 20 文字ぶん）が列の最小幅に入り、右が切れていた
    const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
    expect(css).toMatch(/\.g-popup\.g-color\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  });
});
