/**
 * 入力部品（I-01〜I-15）。
 *
 * 中身はネイティブの要素なので、ここで固定するのは gassan が足した約束だけ:
 * 配線（名前・説明・エラー）、値の持ち方（制御／非制御）、キー操作、ポップアップの閉じ方。
 * top layer への描画と見た目は jsdom では確かめられない（実機は VERIFICATION.md）。
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { GassanProvider, Modal, englishLabels } from '../src';
import { addMonths, monthGrid } from '../src/date-picker';
import { acceptsFile } from '../src/file-drop';
import { clampToStep } from '../src/internal/controllable';
import { normalizeForMatch } from '../src/select';
import { renderModal } from './utils';

const FRUITS = [
  { value: 'apple', label: 'りんご' },
  { value: 'banana', label: 'バナナ', disabled: true },
  { value: 'cherry', label: 'さくらんぼ' },
  { value: 'grape', label: 'ぶどう' },
];

const listbox = (): HTMLElement | null => screen.queryByRole('listbox');

/* ========================================================================== */
/* I-01 配線の受け口                                                           */
/* ========================================================================== */

describe('配線 / I-01', () => {
  it('Field の配線を広げて渡すと、名前・説明・エラーの状態が部品に届く', () => {
    render(
      <Modal.Field label="果物" help="1 つ選ぶ" error="選んでください" required>
        {(control) => <Modal.Select {...control} options={FRUITS} />}
      </Modal.Field>,
    );
    const select = screen.getByRole('combobox', { name: /果物/ });
    expect(select).toHaveAccessibleDescription('1 つ選ぶ 選んでください');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-required', 'true');
  });

  it('ボタンで開く部品（日付・期間・時刻）は、いまの値をボタンの説明として読む（ラベルで名前を付けると、ボタンの中の文字は名前にならないため）', () => {
    render(
      <>
        <Modal.Field label="期限" help="締め切りの日">
          {(control) => <Modal.DatePicker {...control} defaultValue="2026-10-24" />}
        </Modal.Field>
        <Modal.Field label="対象の期間">{(control) => <Modal.DateRangePicker {...control} />}</Modal.Field>
        <Modal.Field label="開始時刻">{(control) => <Modal.TimePicker {...control} defaultValue="09:05" />}</Modal.Field>
      </>,
    );
    expect(screen.getByRole('button', { name: /期限/ })).toHaveAccessibleDescription('2026年10月24日(土) 締め切りの日');
    expect(screen.getByRole('button', { name: /対象の期間/ })).toHaveAccessibleDescription('期間を選ぶ');
    expect(screen.getByRole('button', { name: /開始時刻/ })).toHaveAccessibleDescription('09:05');
  });

  it('value を渡さなければ部品が自分で値を持つ（非制御）', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.NumberField aria-label="人数" defaultValue={2} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: '増やす' }));
    expect(screen.getByRole('spinbutton', { name: '人数' })).toHaveValue(3);
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it('value を渡すと外の値に従う（制御）', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.NumberField aria-label="人数" value={2} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: '増やす' }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('spinbutton', { name: '人数' })).toHaveValue(2);
  });
});

/* ========================================================================== */
/* I-02 ポップアップ                                                           */
/* ========================================================================== */

describe('ポップアップ / I-02', () => {
  it('一覧は開いている間だけ描き、popover="manual" で出す', async () => {
    const user = userEvent.setup();
    render(<Modal.Select aria-label="果物" options={FRUITS} />);
    expect(listbox()).toBeNull();
    await user.click(screen.getByRole('combobox', { name: '果物' }));
    const popup = listbox()?.closest('.g-popup');
    expect(popup).toHaveAttribute('popover', 'manual');
  });

  it('Esc はポップアップだけを閉じ、keydown を止めてモーダルを閉じさせない', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal({
      children: (
        <Modal.Body>
          <Modal.Select aria-label="果物" options={FRUITS} />
        </Modal.Body>
      ),
    });
    const select = screen.getByRole('combobox', { name: '果物' });
    await user.click(select);
    expect(listbox()).not.toBeNull();
    const notPrevented = fireEvent.keyDown(select, { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(listbox()).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('外を押すと閉じる', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p>外</p>
        <Modal.Select aria-label="果物" options={FRUITS} />
      </>,
    );
    await user.click(screen.getByRole('combobox', { name: '果物' }));
    fireEvent.pointerDown(screen.getByText('外'));
    expect(listbox()).toBeNull();
  });
});

/* ========================================================================== */
/* I-03〜I-08 テキスト系                                                        */
/* ========================================================================== */

describe('テキスト入力 / I-03', () => {
  it('枠の前後に飾りを置き、input の属性と ref はそのまま input に届く', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Modal.Input
        aria-label="金額"
        start="¥"
        end="円"
        inputMode="numeric"
        className="extra"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    const input = screen.getByRole('textbox', { name: '金額' });
    expect(node).toBe(input);
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input.closest('.g-input')).toHaveClass('extra');
    expect(input.closest('.g-input')).toHaveTextContent('¥円');
  });
});

describe('パスワード / I-04', () => {
  it('表示の切り替えは aria-pressed で状態を伝え、type を入れ替える', async () => {
    const user = userEvent.setup();
    render(<Modal.PasswordInput aria-label="パスワード" defaultValue="secret" />);
    const input = screen.getByLabelText('パスワード');
    const toggle = screen.getByRole('button', { name: 'パスワードを表示' });
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('検索 / I-05', () => {
  it('消すボタンで値が空になり、利用側の onChange が呼ばれ、フォーカスが入力欄に戻る', async () => {
    const user = userEvent.setup();
    function Search(): ReactNode {
      const [query, setQuery] = useState('東京');
      return <Modal.SearchInput aria-label="検索" value={query} onChange={(event) => setQuery(event.target.value)} />;
    }
    render(<Search />);
    await user.click(screen.getByRole('button', { name: '入力を消す' }));
    const input = screen.getByRole('searchbox', { name: '検索' });
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });
});

describe('テキストエリア / I-06', () => {
  it('maxLength を渡すと文字数を出し、aria-describedby に足す', async () => {
    const user = userEvent.setup();
    render(<Modal.Textarea aria-label="メモ" aria-describedby="help" maxLength={10} />);
    const textarea = screen.getByRole('textbox', { name: 'メモ' });
    await user.type(textarea, 'こんにちは');
    const counter = document.querySelector('.g-counter');
    expect(counter).toHaveTextContent('5 / 10');
    expect(textarea.getAttribute('aria-describedby')).toBe(`help ${counter?.id ?? ''}`);
    expect(counter).not.toHaveAttribute('aria-live');
  });
});

describe('数値ステッパー / I-07', () => {
  it('− と + は step の桁で丸め、範囲の端で押せなくなる', async () => {
    const user = userEvent.setup();
    render(<Modal.NumberField aria-label="濃度" defaultValue={0.2} step={0.1} min={0} max={0.3} />);
    await user.click(screen.getByRole('button', { name: '増やす' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(0.3);
    expect(screen.getByRole('button', { name: '増やす' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '減らす' })).toHaveAttribute('tabindex', '-1');
  });

  it('離れたときに範囲の外なら端へ戻す', async () => {
    const user = userEvent.setup();
    render(<Modal.NumberField aria-label="人数" min={1} max={10} />);
    const input = screen.getByRole('spinbutton', { name: '人数' });
    await user.type(input, '42');
    await user.tab();
    expect(input).toHaveValue(10);
  });

  it('clampToStep は min を起点に格子へ乗せ、浮動小数の誤差を残さない', () => {
    expect(clampToStep(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
    expect(clampToStep(7, 1, 10, 3)).toBe(7);
    expect(clampToStep(8, 1, 10, 3)).toBe(7);
    expect(clampToStep(5, -Infinity, Infinity, 2)).toBe(6);
  });
});

describe('確認コード / I-08', () => {
  it('入力欄は 1 つで、桁の箱は読み上げに出さない', () => {
    render(<Modal.CodeInput aria-label="確認コード" />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'one-time-code');
    expect(document.querySelector('.g-code-cells')).toHaveAttribute('aria-hidden', 'true');
  });

  it('全角数字は半角に直し、数字以外は落とす', () => {
    render(<Modal.CodeInput aria-label="確認コード" />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '１２a３' } });
    expect(input).toHaveValue('123');
  });

  it('全桁そろうと onComplete を呼ぶ', () => {
    const onComplete = vi.fn();
    render(<Modal.CodeInput aria-label="確認コード" length={4} onComplete={onComplete} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4821' } });
    expect(onComplete).toHaveBeenCalledWith('4821');
  });

  it('貼り付けは全体の置き換え（埋まった後でも新しいコードが入る）', () => {
    render(<Modal.CodeInput aria-label="確認コード" length={4} defaultValue="1111" />);
    const input = screen.getByRole('textbox');
    fireEvent.paste(input, { clipboardData: { getData: () => '98-76' } });
    expect(input).toHaveValue('9876');
  });
});

/* ========================================================================== */
/* I-09 選択肢の束                                                             */
/* ========================================================================== */

describe('選択肢の束 / I-09', () => {
  it('Fieldset は legend で束に名前を付け、ヘルプとエラーを束の説明にする', () => {
    render(
      <Modal.Fieldset label="プラン" help="あとで変えられる" error="選んでください" required>
        <Modal.RadioGroup options={[{ value: 'free', label: '無料' }]} />
      </Modal.Fieldset>,
    );
    const group = screen.getByRole('group', { name: /プラン/ });
    expect(group).toHaveAccessibleDescription('あとで変えられる 選んでください');
    expect(group).toHaveAttribute('data-invalid');
  });

  it('ラジオは同じ name で並び、選ぶと onValueChange が呼ばれる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Modal.RadioGroup
        aria-label="プラン"
        onValueChange={onValueChange}
        options={[
          { value: 'free', label: '無料', description: '3 人まで' },
          { value: 'pro', label: 'Pro' },
        ]}
      />,
    );
    const radios = within(screen.getByRole('radiogroup', { name: 'プラン' })).getAllByRole('radio');
    expect(new Set(radios.map((radio) => radio.getAttribute('name'))).size).toBe(1);
    // 補足は名前に混ざらず、説明になる
    expect(radios[0]).toHaveAccessibleName('無料');
    expect(radios[0]).toHaveAccessibleDescription('3 人まで');
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(onValueChange).toHaveBeenCalledWith('pro');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  it('チェックボックスの束は同じ name で並び、選んだ値を options の順の配列で渡す。補足は説明になる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Purposes() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Modal.Fieldset label="取引を行う目的" required>
          <Modal.CheckboxGroup
            value={value}
            onValueChange={(next) => {
              setValue(next);
              onValueChange(next);
            }}
            options={[
              { value: 'living', label: '生計費の決済' },
              { value: 'savings', label: '貯蓄・資産運用', description: '投資信託・株式など' },
              { value: 'salary', label: '給与・年金の受け取り' },
            ]}
          />
        </Modal.Fieldset>
      );
    }
    render(<Purposes />);
    const group = screen.getByRole('group', { name: /取引を行う目的/ });
    const boxes = within(group).getAllByRole('checkbox');
    expect(new Set(boxes.map((box) => box.getAttribute('name'))).size).toBe(1);
    expect(boxes[1]).toHaveAccessibleName('貯蓄・資産運用');
    expect(boxes[1]).toHaveAccessibleDescription('投資信託・株式など');
    // 押した順ではなく options の順で渡す
    await user.click(screen.getByRole('checkbox', { name: '給与・年金の受け取り' }));
    await user.click(screen.getByRole('checkbox', { name: '生計費の決済' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['living', 'salary']);
    await user.click(screen.getByRole('checkbox', { name: '生計費の決済' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['salary']);
    expect(screen.getByRole('checkbox', { name: '給与・年金の受け取り' })).toBeChecked();
  });

  it('チェックボックスの束は aria-label を渡したときだけ group の役割で名前を持つ', () => {
    const { rerender } = render(<Modal.CheckboxGroup aria-label="関心のある分野" options={[{ value: 'a', label: 'A' }]} />);
    expect(screen.getByRole('group', { name: '関心のある分野' })).toBeInTheDocument();
    rerender(<Modal.CheckboxGroup options={[{ value: 'a', label: 'A' }]} />);
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('名前を渡さなければ radiogroup の役割を重ねない（Fieldset の中で名前の無い束を作らない）', () => {
    render(<Modal.Segmented options={[{ value: 'a', label: 'A' }]} />);
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('チェックボックスの indeterminate は mixed として伝わり、補足は説明になる', () => {
    render(
      <Modal.Checkbox indeterminate description="一部だけ選択中">
        すべて選択
      </Modal.Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'すべて選択' });
    expect((box as HTMLInputElement).indeterminate).toBe(true);
    expect(box).toHaveAccessibleDescription('一部だけ選択中');
  });

  it('セグメントはラジオで、選んだものだけが checked になる', async () => {
    const user = userEvent.setup();
    render(
      <Modal.Segmented
        aria-label="表示"
        defaultValue="list"
        options={[
          { value: 'list', label: '一覧' },
          { value: 'grid', label: 'タイル' },
        ]}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'タイル' }));
    expect(screen.getByRole('radio', { name: 'タイル' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '一覧' })).not.toBeChecked();
  });

  it('評価の各星は「5段階中3」の名前を持ち、選んだ星までが点く', async () => {
    const user = userEvent.setup();
    render(<Modal.Rating aria-label="満足度" />);
    await user.click(screen.getByRole('radio', { name: '5段階中3' }));
    expect(document.querySelectorAll('.g-star[data-on]')).toHaveLength(3);
  });
});

/* ========================================================================== */
/* I-10 スライダー                                                             */
/* ========================================================================== */

describe('スライダー / I-10', () => {
  it('塗りは値の位置まで（--g-fill-end）で、formatValue は aria-valuetext にも使う', () => {
    render(<Modal.Slider aria-label="席数" min={0} max={20} defaultValue={5} formatValue={(v) => `${String(v)} 席`} showValue />);
    const slider = screen.getByRole('slider', { name: '席数' });
    expect(slider).toHaveAttribute('aria-valuetext', '5 席');
    expect(document.querySelector<HTMLElement>('.g-slider-track')?.style.getPropertyValue('--g-fill-end')).toBe('25%');
    fireEvent.change(slider, { target: { value: '10' } });
    expect(document.querySelector<HTMLElement>('.g-slider-track')?.style.getPropertyValue('--g-fill-end')).toBe('50%');
  });

  it('2 つ摘みの名前は下限・上限で、下限は上限を越えない', () => {
    const onValueChange = vi.fn();
    render(<Modal.RangeSlider aria-label="価格" defaultValue={[20, 60]} onValueChange={onValueChange} />);
    const low = screen.getByRole('slider', { name: '下限' });
    fireEvent.change(low, { target: { value: '80' } });
    expect(onValueChange).toHaveBeenLastCalledWith([60, 60]);
    expect(screen.getByRole('group', { name: '価格' })).toBeInTheDocument();
  });

  it('摘みと塗りはテーマのアクセント色（--g-accent）で描く', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    const thumb = css.slice(css.indexOf('.g-range::-webkit-slider-thumb {'));
    expect(thumb.slice(0, thumb.indexOf('}'))).toContain('background: var(--g-accent)');
    const track = css.slice(css.indexOf('.g-slider-track::before {'));
    expect(track.slice(0, track.indexOf('}'))).toContain('var(--g-accent) var(--g-fill-start) var(--g-fill-end)');
  });
});

/* ========================================================================== */
/* I-11 セレクト                                                               */
/* ========================================================================== */

describe('セレクト / I-11', () => {
  it('<label for> で名前が付く（起点がボタンなので）', () => {
    render(
      <>
        <label htmlFor="fruit">果物</label>
        <Modal.Select id="fruit" options={FRUITS} />
      </>,
    );
    expect(screen.getByRole('combobox', { name: '果物' })).toBeInTheDocument();
  });

  it('↓で開き、↓↑で動き（無効な選択肢は飛ばす）、Enter で決めて閉じる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Select aria-label="果物" options={FRUITS} onValueChange={onValueChange} />);
    const select = screen.getByRole('combobox', { name: '果物' });
    select.focus();
    await user.keyboard('{ArrowDown}');
    expect(select).toHaveAttribute('aria-expanded', 'true');
    const active = () => document.getElementById(select.getAttribute('aria-activedescendant') ?? '');
    expect(active()).toHaveTextContent('りんご');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveTextContent('さくらんぼ');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('cherry');
    expect(select).toHaveAttribute('aria-expanded', 'false');
    expect(select).toHaveTextContent('さくらんぼ');
    expect(select).toHaveFocus();
  });

  it('文字を打つと、その文字で始まる選択肢へ飛ぶ', async () => {
    const user = userEvent.setup();
    render(
      <Modal.Select
        aria-label="都市"
        options={[
          { value: 'osaka', label: 'Osaka' },
          { value: 'tokyo', label: 'Tokyo' },
          { value: 'toyama', label: 'Toyama' },
        ]}
      />,
    );
    const select = screen.getByRole('combobox', { name: '都市' });
    select.focus();
    await user.keyboard('toy');
    expect(document.getElementById(select.getAttribute('aria-activedescendant') ?? '')).toHaveTextContent('Toyama');
  });

  it('Tab は指している選択肢を決めて閉じる', async () => {
    const user = userEvent.setup();
    render(<Modal.Select aria-label="果物" options={FRUITS} defaultValue="apple" />);
    const select = screen.getByRole('combobox', { name: '果物' });
    select.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    expect(select).toHaveTextContent('さくらんぼ');
    expect(listbox()).toBeNull();
  });

  it('選んでいる選択肢は aria-selected で、name を渡すと hidden input に値を載せる', async () => {
    const user = userEvent.setup();
    render(<Modal.Select aria-label="果物" name="fruit" options={FRUITS} defaultValue="grape" />);
    expect(document.querySelector('input[type="hidden"][name="fruit"]')).toHaveValue('grape');
    await user.click(screen.getByRole('combobox', { name: '果物' }));
    expect(screen.getByRole('option', { name: 'ぶどう' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'バナナ' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('未選択のときは labels.choose を出す', () => {
    render(
      <GassanProvider labels={englishLabels}>
        <Modal.Select aria-label="Fruit" options={FRUITS} />
      </GassanProvider>,
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Choose…');
  });
});

/* ========================================================================== */
/* I-12 コンボボックス                                                         */
/* ========================================================================== */

describe('コンボボックス / I-12', () => {
  const PREFS = [
    { value: 'tokyo', label: 'トウキョウ' },
    { value: 'kyoto', label: 'キョウト' },
    { value: 'osaka', label: 'オオサカ' },
  ];

  it('打つと絞り込み、最初の候補を指して Enter で決まる', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: '都道府県' });
    await user.type(input, 'きょう');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['トウキョウ', 'キョウト']);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('kyoto');
    expect(input).toHaveValue('キョウト');
  });

  it('カタカナとひらがな、全角と半角、大文字と小文字を区別せずに当てる', () => {
    expect(normalizeForMatch('ＴｏｋｙＯ')).toBe('tokyo');
    expect(normalizeForMatch('トウキョウ')).toBe(normalizeForMatch('とうきょう'));
  });

  it('候補の keywords（読みがな・コード）にも当てる', async () => {
    const user = userEvent.setup();
    const banks = [
      { value: '0005', label: '三菱UFJ銀行', keywords: ['みつびしゆーえふじぇい', '0005'] },
      { value: '0009', label: '三井住友銀行', keywords: ['みついすみとも', '0009'] },
    ];
    render(<Modal.Combobox aria-label="金融機関" options={banks} />);
    const input = screen.getByRole('combobox', { name: '金融機関' });
    await user.type(input, 'ミツイ');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['三井住友銀行']);
    await user.clear(input);
    await user.type(input, '０００５');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['三菱UFJ銀行']);
  });

  it('一覧にない文字列は値にせず、離れると選んでいた名前に戻す', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} defaultValue="osaka" onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: '都道府県' });
    await user.clear(input);
    await user.type(input, 'ほっかいどう');
    await user.tab();
    expect(input).toHaveValue('オオサカ');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ちょうど一致する文字列で離れると、その候補を選ぶ', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} onValueChange={onValueChange} />);
    await user.type(screen.getByRole('combobox', { name: '都道府県' }), 'きょうと');
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith('kyoto');
  });

  it('空にして離れると選択を解く（null）', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} defaultValue="tokyo" onValueChange={onValueChange} />);
    await user.clear(screen.getByRole('combobox', { name: '都道府県' }));
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('候補が無いと「一致する候補がありません」を出す', async () => {
    const user = userEvent.setup();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} />);
    await user.type(screen.getByRole('combobox', { name: '都道府県' }), 'ふくおか');
    expect(screen.getByRole('status')).toHaveTextContent('一致する候補がありません');
  });

  it('IME の変換中の Enter では決めない', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.Combobox aria-label="都道府県" options={PREFS} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: '都道府県' });
    await user.type(input, 'お');
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();
  });
});

/* ========================================================================== */
/* I-13 カレンダー                                                             */
/* ========================================================================== */

describe('カレンダー / I-13', () => {
  const dayButton = (name: string) => screen.getByRole('button', { name });

  it('開くと選んでいる日にフォーカスが入り、月名は labels.locale で出す', async () => {
    const user = userEvent.setup();
    render(<Modal.DatePicker aria-label="日付" defaultValue="2026-10-18" />);
    await user.click(screen.getByRole('button', { name: '日付' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('2026年10月');
    expect(dayButton('2026年10月18日日曜日')).toHaveFocus();
    expect(dayButton('2026年10月18日日曜日').closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('←→↑↓ で日と週、PageDown で月、Shift+PageDown で年を動かす', async () => {
    const user = userEvent.setup();
    render(<Modal.DatePicker aria-label="日付" defaultValue="2026-01-31" />);
    await user.click(screen.getByRole('button', { name: '日付' }));
    await user.keyboard('{ArrowRight}');
    expect(dayButton('2026年2月1日日曜日')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(dayButton('2026年1月25日日曜日')).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(dayButton('2026年2月25日水曜日')).toHaveFocus();
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(dayButton('2027年2月25日木曜日')).toHaveFocus();
  });

  it('Enter で決めて閉じ、ボタンへ戻る。Esc は決めずに閉じ、モーダルに届かせない', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.DatePicker aria-label="日付" defaultValue="2026-10-18" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: '日付' });
    await user.click(trigger);
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('2026-10-19');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('2026年10月19日(月)');

    await user.click(trigger);
    const notPrevented = fireEvent.keyDown(document.activeElement ?? trigger, { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('min / max の外へは動けず、外の日は選べない', async () => {
    const user = userEvent.setup();
    render(<Modal.DatePicker aria-label="日付" defaultValue="2026-10-30" max="2026-10-31" />);
    await user.click(screen.getByRole('button', { name: '日付' }));
    await user.keyboard('{ArrowDown}');
    expect(dayButton('2026年10月31日土曜日')).toHaveFocus();
    expect(dayButton('2026年11月1日日曜日')).toHaveAttribute('aria-disabled', 'true');
  });

  it('月を足すと月末は寄せ、表は週の始まりから 42 日', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-03-31', -1)).toBe('2024-02-29');
    const grid = monthGrid('2026-10-18', 1);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-09-28');
  });
});

/* ========================================================================== */
/* I-14 ファイル                                                               */
/* ========================================================================== */

describe('ファイル / I-14', () => {
  const png = new File(['x'], 'photo.png', { type: 'image/png' });
  const pdf = new File(['y'], 'memo.pdf', { type: 'application/pdf' });

  it('accept の規則（拡張子・ワイルドカード・型）', () => {
    expect(acceptsFile(png, 'image/*')).toBe(true);
    expect(acceptsFile(pdf, 'image/*')).toBe(false);
    expect(acceptsFile(pdf, '.PDF, image/png')).toBe(true);
    expect(acceptsFile(pdf, undefined)).toBe(true);
  });

  it('ドロップにも accept を当て、合わないものは onReject へ回す', () => {
    const onValueChange = vi.fn();
    const onReject = vi.fn();
    render(
      <Modal.FileDrop aria-label="写真" accept="image/*" multiple onValueChange={onValueChange} onReject={onReject} />,
    );
    fireEvent.drop(document.querySelector('.g-dropzone') as Element, { dataTransfer: { files: [png, pdf] } });
    expect(onValueChange).toHaveBeenCalledWith([png]);
    expect(onReject).toHaveBeenCalledWith([pdf]);
  });

  it('選んだファイルは名前と大きさの一覧に出し、名前付きのボタンで取り除ける', async () => {
    const user = userEvent.setup();
    render(<Modal.FileDrop aria-label="写真" />);
    await user.upload(screen.getByLabelText('写真'), png);
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'photo.png を取り除く' }));
    expect(screen.queryByText('photo.png')).toBeNull();
  });

  it('multiple でなければ 1 つに置き換える', () => {
    const onValueChange = vi.fn();
    render(<Modal.FileDrop aria-label="写真" defaultValue={[png]} onValueChange={onValueChange} />);
    fireEvent.drop(document.querySelector('.g-dropzone') as Element, { dataTransfer: { files: [pdf] } });
    expect(onValueChange).toHaveBeenLastCalledWith([pdf]);
  });
});

/* ========================================================================== */
/* I-15 ネイティブ入力の明暗                                                    */
/* ========================================================================== */

describe('ネイティブ入力の明暗 / I-15', () => {
  it('日付・時刻・色の入力は枠に収め、--g-color-scheme で明暗を面に合わせる', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toContain('--g-color-scheme: light;');
    expect(css).toContain('--g-color-scheme: dark;');
    expect(css).toContain('.g-bare::-webkit-calendar-picker-indicator');
    const frame = css.slice(css.indexOf('  .g-input {'));
    expect(frame.slice(0, frame.indexOf('}'))).toContain('color-scheme: var(--g-color-scheme)');
    render(<Modal.Input aria-label="日付" type="date" />);
    expect(screen.getByLabelText('日付').closest('.g-input')).not.toBeNull();
  });
});

/* ========================================================================== */
/* I-21 タグ                                                                   */
/* ========================================================================== */

describe('タグ / I-21', () => {
  /** 付いているタグ（× の名前から読む）。 */
  const tags = (): string[] => [...document.querySelectorAll('.g-tag-label')].map((tag) => tag.textContent ?? '');

  it('Enter で付けて読み上げ、空の Enter は止めない（フォームを送れる）', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Modal.TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: 'タグ' });
    await user.type(input, '  請求   書 {Enter}');
    expect(tags()).toEqual(['請求 書']);
    expect(onValueChange).toHaveBeenLastCalledWith(['請求 書']);
    expect(screen.getByRole('status')).toHaveTextContent('請求 書 を追加しました');
    expect(input).toHaveValue('');
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true);
  });

  it('区切り（カンマ・読点）を打つと手前を付け、貼り付けは全部に分ける。同じタグは 2 度付けない', async () => {
    const user = userEvent.setup();
    render(<Modal.TagInput aria-label="タグ" />);
    const input = screen.getByRole('textbox', { name: 'タグ' });
    await user.type(input, 'design、');
    expect(tags()).toEqual(['design']);
    await user.type(input, 'api,doc');
    expect(tags()).toEqual(['design', 'api']);
    expect(input).toHaveValue('doc');
    await user.clear(input);
    await user.paste('ops, design\nqa\tsales');
    expect(tags()).toEqual(['design', 'api', 'ops', 'qa', 'sales']);
  });

  it('上限と validate で弾いたタグは付けずに入力欄へ残す', async () => {
    const user = userEvent.setup();
    render(<Modal.TagInput aria-label="タグ" max={2} validate={(tag) => tag.length <= 8} defaultValue={['a']} />);
    const input = screen.getByRole('textbox', { name: 'タグ' });
    await user.type(input, 'とても長いタグの名前です{Enter}');
    expect(tags()).toEqual(['a']);
    expect(input).toHaveValue('とても長いタグの名前です');
    await user.clear(input);
    await user.type(input, 'b{Enter}c{Enter}');
    expect(tags()).toEqual(['a', 'b']);
    expect(input).toHaveValue('c');
  });

  it('空の入力欄の Backspace は最後のタグを入力欄へ戻し、× は名前付きで外して入力欄へ戻る', async () => {
    const user = userEvent.setup();
    render(<Modal.TagInput aria-label="タグ" defaultValue={['営業', '開発']} name="tags" />);
    const input = screen.getByRole('textbox', { name: 'タグ' });
    expect([...document.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="tags"]')].map((hidden) => hidden.value)).toEqual(['営業', '開発']);
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(tags()).toEqual(['営業']);
    expect(input).toHaveValue('開発');
    await user.click(screen.getByRole('button', { name: '営業 を取り除く' }));
    expect(screen.getByRole('status')).toHaveTextContent('営業 を取り除きました');
    expect(input).toHaveFocus();
  });

  it('IME の変換中の Enter と読点では付けない（確定してから分ける）', () => {
    render(<Modal.TagInput aria-label="タグ" />);
    const input = screen.getByRole('textbox', { name: 'タグ' });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'せいきゅう、' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(tags()).toEqual([]);
    fireEvent.compositionEnd(input);
    expect(tags()).toEqual(['せいきゅう']);
  });
});

/* ========================================================================== */
/* I-22 パスワードの強さ                                                        */
/* ========================================================================== */

describe('パスワードの強さ / I-22', () => {
  it('既定の 4 つの条件の満ち方から強さを決め、条件ごとの状態を言葉でも添える', () => {
    const { rerender } = render(<Modal.PasswordStrength id="strength" value="" />);
    const root = document.getElementById('strength')!;
    expect(root).not.toHaveAttribute('role');
    expect(within(root).getAllByRole('listitem')).toHaveLength(4);
    expect(root).toHaveTextContent('8 文字以上');
    expect(root.querySelector('.g-strength-label')).toBeNull();
    rerender(<Modal.PasswordStrength id="strength" value="abcdefgh" />);
    expect(root).toHaveTextContent('弱い');
    expect(root).toHaveAttribute('data-tone', 'error');
    rerender(<Modal.PasswordStrength id="strength" value="Abcdefg1!" />);
    expect(root).toHaveTextContent('とても強い');
    expect(root).toHaveAttribute('data-tone', 'success');
    expect(root.querySelectorAll('[data-filled]')).toHaveLength(4);
    expect(within(root).getAllByRole('listitem')[0]).toHaveTextContent('満たしています');
  });

  it('条件は差し替えられ、強さは score で外から渡せる（長さを重く見る推定を使うとき）', () => {
    render(
      <Modal.PasswordStrength
        value="correct horse battery staple"
        rules={[{ id: 'long', label: '15 文字以上', test: (password) => password.length >= 15 }]}
        score={4}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem')).toHaveTextContent('15 文字以上満たしています');
    expect(document.querySelector('.g-strength-label')).toHaveTextContent('とても強い');
  });
});
