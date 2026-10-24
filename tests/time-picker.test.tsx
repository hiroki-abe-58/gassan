/**
 * 時刻の選択（I-20）。
 *
 * 時・分（12 時間制なら午前・午後も）の列はそれぞれ listbox で、選択はフォーカスに付いて動く。
 * 値はどちらの時計でも 24 時間の 'HH:mm'（ネイティブの input type="time" と同じ形）。
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GassanProvider, Modal, englishLabels } from '../src';

const trigger = (name = '時刻'): HTMLElement => screen.getByRole('button', { name });
const column = (name: string): HTMLElement => screen.getByRole('listbox', { name });
const option = (columnName: string, label: string): HTMLElement =>
  within(column(columnName)).getByRole('option', { name: label });
const selectedIn = (columnName: string): string =>
  within(column(columnName)).getByRole('option', { selected: true }).textContent ?? '';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('時刻の選択 / I-20', () => {
  it('開くと時の列にフォーカスが入り、各列は選んでいる項目を aria-activedescendant で指す', async () => {
    const user = userEvent.setup();
    render(<Modal.TimePicker aria-label="時刻" defaultValue="09:05" />);
    expect(trigger()).toHaveTextContent('09:05');
    await user.click(trigger());
    expect(screen.getByRole('dialog')).toHaveAccessibleName('時刻を選ぶ');
    expect(column('時')).toHaveFocus();
    expect(selectedIn('時')).toBe('09');
    expect(selectedIn('分')).toBe('05');
    expect(column('分')).toHaveAttribute('aria-activedescendant', option('分', '05').id);
    // 24 時間制（日本語の既定）には午前・午後の列が無い
    expect(screen.queryByRole('listbox', { name: '午前・午後' })).toBeNull();
  });

  it('↑↓ で値、→ で次の列。Enter で決めて閉じ、ボタンへ戻る', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" defaultValue="09:05" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}');
    expect(column('分')).toHaveFocus();
    expect(selectedIn('時')).toBe('10');
    expect(selectedIn('分')).toBe('10');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('10:10');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveTextContent('10:10');
  });

  it('列の端を越えると反対の端へ回る。PageUp / PageDown は列の 4 分の 1、Home / End は端', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" defaultValue="23:55" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    expect(selectedIn('時')).toBe('00');
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(selectedIn('分')).toBe('00');
    expect(selectedIn('時')).toBe('00'); // 分が回っても時は動かない（ネイティブの欄と同じ）
    await user.keyboard('{End}');
    expect(selectedIn('分')).toBe('55');
    await user.keyboard('{Home}{PageDown}');
    expect(selectedIn('分')).toBe('15'); // 12 項目の 4 分の 1 = 3 つ = 15 分
    await user.keyboard('{ArrowLeft}{PageUp}');
    expect(selectedIn('時')).toBe('18'); // 24 項目の 4 分の 1 = 6 つ、0 時から戻って回る
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('18:15');
  });

  it('数字を打つとその時刻へ飛ぶ。続けて打つと桁がつながり、上限を越えたら 1 桁からやり直す', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" defaultValue="09:05" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.keyboard('19');
    expect(selectedIn('時')).toBe('19');
    await user.keyboard('25');
    expect(selectedIn('時')).toBe('05'); // 192 → 2 時、25 → 5 時
    await user.keyboard('{ArrowRight}30');
    expect(selectedIn('分')).toBe('30');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('05:30');
  });

  it('step で分を刻み、min / max の外は選べない。刻みに乗らない値は、開くといちばん近い時刻を指す', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Modal.TimePicker
        aria-label="時刻"
        defaultValue="10:07"
        step={15}
        min="09:00"
        max="17:30"
        onValueChange={onValueChange}
      />,
    );
    expect(trigger()).toHaveTextContent('10:07');
    await user.click(trigger());
    expect(selectedIn('時')).toBe('10');
    expect(selectedIn('分')).toBe('00');
    expect(within(column('分')).getAllByRole('option').map((o) => o.textContent)).toEqual(['00', '15', '30', '45']);
    expect(option('時', '08')).toHaveAttribute('aria-disabled', 'true');
    expect(option('時', '18')).toHaveAttribute('aria-disabled', 'true');
    expect(option('時', '09')).not.toHaveAttribute('aria-disabled');

    await user.keyboard('{End}');
    expect(selectedIn('時')).toBe('17');
    await user.keyboard('{ArrowRight}');
    expect(option('分', '45')).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{End}');
    expect(selectedIn('分')).toBe('30');
    await user.keyboard('{ArrowDown}');
    expect(selectedIn('分')).toBe('00'); // 45 は選べないので飛ばして回る
    await user.click(option('分', '45'));
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // 選べない項目を押しても決まらない
    await user.keyboard('{ArrowLeft}{Home}');
    expect(selectedIn('時')).toBe('09');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('09:00');
  });

  it('時を押すと分の列へ進み、分を押すと決めて閉じる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" defaultValue="09:05" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(option('時', '14'));
    expect(column('分')).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(option('分', '30'));
    expect(onValueChange).toHaveBeenCalledWith('14:30');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('12 時間制は午前・午後の列を足す。値は 24 時間のまま、A / P でも切り替わる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <GassanProvider labels={englishLabels}>
        <Modal.TimePicker aria-label="Time" defaultValue="21:05" onValueChange={onValueChange} />
      </GassanProvider>,
    );
    // ICU の版によって、時刻と AM / PM の間は普通の空白か狭い空白（U+202F）
    expect(trigger('Time').textContent).toMatch(/^9:05\sPM$/);
    await user.click(trigger('Time'));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Choose a time');
    expect(within(column('Hour')).getAllByRole('option').map((o) => o.textContent)).toEqual([
      '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    ]);
    expect(selectedIn('Hour')).toBe('9');
    expect(selectedIn('AM/PM')).toBe('PM');
    await user.keyboard('{ArrowRight}{ArrowRight}a');
    expect(column('AM/PM')).toHaveFocus();
    expect(selectedIn('AM/PM')).toBe('AM');
    await user.keyboard('{ArrowLeft}{ArrowLeft}{Home}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('00:05'); // 午前 12 時は 0 時
  });

  it('hourCycle で時計を選べる。日本語の 12 時間制は午前・午後を Intl の名前で出し、最後の列を押すと決まる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" hourCycle="h12" defaultValue="13:40" onValueChange={onValueChange} />);
    expect(trigger()).toHaveTextContent('午後1:40');
    await user.click(trigger());
    expect(within(column('午前・午後')).getAllByRole('option').map((o) => o.textContent)).toEqual(['午前', '午後']);
    await user.click(option('分', '45'));
    expect(column('午前・午後')).toHaveFocus();
    await user.click(option('午前・午後', '午前'));
    expect(onValueChange).toHaveBeenCalledWith('01:45');
  });

  it('値が無いときは今の時刻に近い刻みを指し、「現在時刻」でそこへ戻る', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 22, 14, 32));
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TimePicker aria-label="時刻" onValueChange={onValueChange} />);
    expect(trigger()).toHaveTextContent('選んでください');
    await user.click(trigger());
    expect(selectedIn('時')).toBe('14');
    expect(selectedIn('分')).toBe('30');
    await user.keyboard('{ArrowDown}');
    expect(selectedIn('時')).toBe('15');
    await user.click(screen.getByRole('button', { name: '現在時刻' }));
    expect(selectedIn('時')).toBe('14');
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onValueChange).toHaveBeenCalledWith('14:30');
  });

  it('Esc は決めずに閉じ、モーダルの cancel まで届かせない。name を渡すと隠しフィールドで送る', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Modal.TimePicker aria-label="時刻" name="start" defaultValue="09:05" onValueChange={onValueChange} />
      </form>,
    );
    expect(container.querySelector('input[type="hidden"][name="start"]')).toHaveValue('09:05');
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    const notPrevented = fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(container.querySelector('input[name="start"]')).toHaveValue('09:05');
  });

  it('開いた直後は列をその場で合わせ、値を動かすと滑らせる（列の中だけを動かす）', async () => {
    const scrollTo = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    try {
      const user = userEvent.setup();
      render(<Modal.TimePicker aria-label="時刻" defaultValue="09:05" />);
      await user.click(trigger());
      expect(scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).behavior)).toEqual(['auto', 'auto']);
      scrollTo.mockClear();
      await user.keyboard('{ArrowDown}');
      expect(scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).behavior)).toEqual(['smooth', 'smooth']);
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).scrollTo;
    }
  });
});
