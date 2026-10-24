/**
 * カレンダー（I-16〜I-19）と日本の祝日。
 *
 * 祝日は内閣府の「国民の祝日について」が公表した一覧と、法の改正の変わり目（振替休日の始まり・
 * 2007 年の改正・国民の休日・東京 2020 大会の特例・令和の即位）で確かめる。
 * カレンダーは共有の表（internal/calendar-view.tsx）を、Calendar・RangeCalendar・DateRangePicker から触る。
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  GassanProvider,
  Modal,
  commonDateRanges,
  englishLabels,
  japaneseHoliday,
  japaneseHolidayNames,
  japaneseHolidays,
  japaneseLabels,
} from '../src';

const day = (name: string | RegExp): HTMLElement => screen.getByRole('button', { name });
const list = (year: number): string[] => japaneseHolidays(year).map((h) => `${h.date.slice(5)} ${h.name}`);

/* ========================================================================== */
/* I-16 祝日と週末                                                             */
/* ========================================================================== */

describe('日本の祝日 / I-16', () => {
  it('2026 年は内閣府の公表どおり 18 日（振替休日と、敬老の日と秋分の日に挟まれた国民の休日を含む）', () => {
    expect(list(2026)).toEqual([
      '01-01 元日',
      '01-12 成人の日',
      '02-11 建国記念の日',
      '02-23 天皇誕生日',
      '03-20 春分の日',
      '04-29 昭和の日',
      '05-03 憲法記念日',
      '05-04 みどりの日',
      '05-05 こどもの日',
      '05-06 振替休日',
      '07-20 海の日',
      '08-11 山の日',
      '09-21 敬老の日',
      '09-22 国民の休日',
      '09-23 秋分の日',
      '10-12 スポーツの日',
      '11-03 文化の日',
      '11-23 勤労感謝の日',
    ]);
  });

  it('2019 年は即位の日と前後の国民の休日・即位礼正殿の儀があり、天皇誕生日が無い', () => {
    const y2019 = list(2019);
    expect(y2019).toEqual(expect.arrayContaining(['04-30 国民の休日', '05-01 天皇の即位の日', '05-02 国民の休日', '05-06 振替休日', '10-22 即位礼正殿の儀']));
    expect(y2019.some((entry) => entry.includes('天皇誕生日'))).toBe(false);
    expect(list(2018)).toContain('12-23 天皇誕生日');
    expect(list(2020)).toContain('02-23 天皇誕生日');
  });

  it('東京 2020 大会の特例で、海の日・スポーツの日・山の日が移った（2020 年と 2021 年）', () => {
    expect(list(2020)).toEqual(expect.arrayContaining(['07-23 海の日', '07-24 スポーツの日', '08-10 山の日']));
    expect(list(2021)).toEqual(expect.arrayContaining(['07-22 海の日', '07-23 スポーツの日', '08-08 山の日', '08-09 振替休日']));
    expect(list(2019)).toEqual(expect.arrayContaining(['07-15 海の日', '10-14 体育の日']));
  });

  it('振替休日は 1973 年に始まり、2007 年からは後ろの最初の休日でない日へ移る', () => {
    expect(japaneseHoliday('1973-04-30')?.name).toBe('振替休日');
    expect(japaneseHoliday('1973-09-24')?.name).toBe('振替休日');
    expect(japaneseHoliday('1972-01-16')).toBeNull(); // 1972-01-15（成人の日）は土曜。日曜の祝日でも 1973 年より前は振替が無い
    expect(japaneseHoliday('1992-05-04')?.name).toBe('振替休日'); // 旧法: 日曜の憲法記念日の翌日
    expect(japaneseHoliday('2008-05-06')?.name).toBe('振替休日'); // 新法: 日曜のみどりの日の後ろの、こどもの日の次
    expect(japaneseHoliday('1988-05-04')?.name).toBe('国民の休日');
  });

  it('春分・秋分は近似式で求め、1979 年までの補正を 0 の側へ切り捨てる（1973 年の秋分は 9 月 23 日）', () => {
    expect(japaneseHoliday('1973-09-23')?.name).toBe('秋分の日');
    expect(japaneseHoliday('1973-03-21')?.name).toBe('春分の日');
    expect(japaneseHoliday('2024-09-22')?.name).toBe('秋分の日');
    expect(japaneseHoliday('2033-03-20')?.name).toBe('春分の日');
  });

  it('法の施行より前と 2150 年より後は祝日が無いものとして扱い、日付でない文字列にも例外を投げない', () => {
    expect(japaneseHolidays(1948)).toEqual([]);
    expect(japaneseHolidays(2151)).toEqual([]);
    expect(japaneseHolidays(1949).length).toBeGreaterThan(0);
    expect(japaneseHoliday('abcd-01-01')).toBeNull();
    expect(japaneseLabels.holidays?.('')).toBeNull();
  });

  it('名前は既定で日本語、英語の表に差し替えられる。labels.holidays は日本語で日本の祝日、英語で null', () => {
    expect(japaneseHoliday('2026-01-01', japaneseHolidayNames.en)?.name).toBe("New Year's Day");
    expect(japaneseLabels.holidays?.('2026-11-23')).toBe('勤労感謝の日');
    expect(englishLabels.holidays).toBeNull();
  });

  it('日の読み上げ名に祝日の名前が入り、日曜・土曜・祝日に印が付く（色だけで伝えない）', () => {
    render(<Modal.Calendar aria-label="予約日" defaultValue="2026-01-07" />);
    const holiday = day('2026年1月12日月曜日、成人の日');
    expect(holiday).toHaveAttribute('data-holiday');
    expect(day('2026年1月11日日曜日')).toHaveAttribute('data-weekday', '0');
    expect(day('2026年1月10日土曜日')).toHaveAttribute('data-weekday', '6');
    expect(day('2026年1月13日火曜日')).not.toHaveAttribute('data-holiday');
  });

  it('holidays={null} では祝日を出さず、英語の既定（labels.holidays: null）でも出さない', () => {
    const { unmount } = render(<Modal.Calendar aria-label="d" defaultValue="2026-01-07" holidays={null} />);
    expect(day('2026年1月12日月曜日')).not.toHaveAttribute('data-holiday');
    unmount();
    render(
      <GassanProvider labels={englishLabels}>
        <Modal.Calendar aria-label="d" defaultValue="2026-01-07" />
      </GassanProvider>,
    );
    expect(day('Monday, January 12, 2026')).not.toHaveAttribute('data-holiday');
  });

  it('大きな枠（lg）は日の下に祝日の名前を書き、読み上げは日の名前の側に任せる（二重に読ませない）', () => {
    render(<Modal.Calendar aria-label="d" defaultValue="2026-05-01" size="lg" />);
    const note = within(day('2026年5月5日火曜日、こどもの日')).getByText('こどもの日');
    expect(note).toHaveAttribute('aria-hidden', 'true');
  });
});

/* ========================================================================== */
/* I-17 期間                                                                   */
/* ========================================================================== */

describe('期間の選択 / I-17', () => {
  it('開始日 → 終了日の 2 回で決まり、逆順に押しても入れ替える', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.RangeCalendar aria-label="期間" defaultValue={null} onValueChange={onValueChange} min="2026-10-01" max="2026-10-31" />);
    await user.click(day(/^2026年10月20日火曜日/));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(day(/^2026年10月15日木曜日/));
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-15', end: '2026-10-20' });
    expect(day('2026年10月15日木曜日、開始日').closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(day('2026年10月17日土曜日').closest('td')).toHaveAttribute('data-range', 'middle');
    expect(day('2026年10月20日火曜日、終了日').closest('td')).toHaveAttribute('data-range', 'end');
  });

  it('終了日を選ぶ前は、指している日までを仮の帯で見せ、どちらを選ぶ番かを role="status" で伝える', async () => {
    const user = userEvent.setup();
    render(<Modal.RangeCalendar aria-label="期間" defaultValue={{ start: '2026-10-05', end: '2026-10-06' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('開始日を選んでください');
    await user.click(day(/^2026年10月12日月曜日/));
    expect(screen.getByRole('status')).toHaveTextContent('終了日を選んでください');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    const preview = day(/^2026年10月14日水曜日/).closest('td');
    expect(preview).toHaveAttribute('data-preview');
    expect(preview).toHaveAttribute('data-range', 'end');
    // 仮の期間はまだ選んでいないので aria-selected にしない
    expect(preview).toHaveAttribute('aria-selected', 'false');
  });

  it('期間を選んでいる途中の Esc は開始日を取り消す（インライン）', async () => {
    const user = userEvent.setup();
    render(<Modal.RangeCalendar aria-label="期間" defaultValue={null} min="2026-10-01" max="2026-10-31" />);
    await user.click(day(/^2026年10月9日金曜日/));
    expect(screen.getByRole('status')).toHaveTextContent('終了日を選んでください');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('status')).toHaveTextContent('開始日を選んでください');
  });

  it('DateRangePicker は終了日を選ぶと閉じ、よく使う期間は 1 回で決まる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Modal.DateRangePicker
        aria-label="集計期間"
        months={1}
        defaultValue={{ start: '2026-10-01', end: '2026-10-07' }}
        presets={commonDateRanges(japaneseLabels, '2026-10-22')}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: '集計期間' });
    await user.click(trigger);
    expect(day(/^2026年10月1日木曜日、開始日/)).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '過去7日間' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-16', end: '2026-10-22' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(day(/^2026年10月20日火曜日/));
    await user.click(day(/^2026年10月27日火曜日/));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-20', end: '2026-10-27' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('よく使う期間は今日を基準に 6 つ作り、今月と先月は月の頭から末まで', () => {
    const ranges = commonDateRanges(japaneseLabels, '2026-03-15');
    expect(ranges.map((r) => r.label)).toEqual(['今日', '昨日', '過去7日間', '過去30日間', '今月', '先月']);
    expect(ranges.map((r) => `${r.value.start}/${r.value.end}`)).toEqual([
      '2026-03-15/2026-03-15',
      '2026-03-14/2026-03-14',
      '2026-03-09/2026-03-15',
      '2026-02-14/2026-03-15',
      '2026-03-01/2026-03-31',
      '2026-02-01/2026-02-28',
    ]);
  });
});

/* ========================================================================== */
/* I-18 月と年の移動                                                           */
/* ========================================================================== */

describe('月と年の移動 / I-18', () => {
  it('見出しで月の一覧、もう一度で年の一覧。選ぶと 1 段ずつ降り、Esc で 1 段戻る（ポップアップは閉じない）', async () => {
    const user = userEvent.setup();
    render(<Modal.DatePicker aria-label="日付" defaultValue="2026-10-18" />);
    await user.click(screen.getByRole('button', { name: '日付' }));
    await user.click(screen.getByRole('button', { name: '2026年10月。月を選ぶ' }));
    expect(screen.getByRole('button', { name: '2026年10月' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '2026年。年を選ぶ' }));
    expect(screen.getByRole('button', { name: '2026年' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Enter}');
    // 2022 年の月の一覧に降り、10 月を指す
    expect(screen.getByRole('button', { name: '2022年10月' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(day('2022年9月18日日曜日')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '2022年9月。月を選ぶ' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(day('2022年9月18日日曜日')).toHaveFocus();
  });

  it('「今日」で今日へ移る', async () => {
    const user = userEvent.setup();
    render(<Modal.Calendar aria-label="d" defaultValue="2001-01-01" />);
    await user.click(screen.getByRole('button', { name: '今日' }));
    const today = new Date();
    expect(document.activeElement).toHaveAttribute('aria-current', 'date');
    expect(document.activeElement?.textContent).toContain(String(today.getDate()));
  });

  it('2 か月並べると月の外の日は描かず（同じ日が 2 つにならない）、PageDown で 1 か月ずつ送る', async () => {
    const user = userEvent.setup();
    render(<Modal.Calendar aria-label="d" defaultValue="2026-10-30" months={2} />);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^2026年11月1日日曜日/ })).toHaveLength(1);
    day(/^2026年10月30日金曜日/).focus();
    await user.keyboard('{PageDown}');
    expect(day(/^2026年11月30日月曜日/)).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(day(/^2026年12月30日水曜日/)).toHaveFocus();
    const titles = screen.getAllByRole('grid').map((grid) => grid.getAttribute('aria-labelledby'));
    expect(titles.map((id) => document.getElementById(id ?? '')?.textContent)).toEqual(['2026年11月', '2026年12月']);
  });
});

/* ========================================================================== */
/* I-19 選べない日と印                                                         */
/* ========================================================================== */

describe('選べない日と印 / I-19', () => {
  it('isDateDisabled の日は移れても選べない', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // 水曜定休
    render(<Modal.Calendar aria-label="d" defaultValue="2026-10-20" isDateDisabled={(iso) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 3} onValueChange={onValueChange} />);
    day(/^2026年10月20日火曜日/).focus();
    await user.keyboard('{ArrowRight}');
    const wednesday = day(/^2026年10月21日水曜日/);
    expect(wednesday).toHaveFocus();
    expect(wednesday).toHaveAttribute('aria-disabled', 'true');
    // 規則で選べない日には線を引く印（data-blocked）が付く。範囲の外の日とは見た目を分ける
    expect(wednesday).toHaveAttribute('data-blocked');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('marks の日には点を付け、読み上げ名に「予定あり」を添える', () => {
    render(<Modal.Calendar aria-label="d" defaultValue="2026-10-01" marks={(iso) => iso === '2026-10-08'} />);
    const marked = day('2026年10月8日木曜日、予定あり');
    expect(marked.querySelector('.g-day-mark')).toHaveAttribute('aria-hidden', 'true');
  });
});
