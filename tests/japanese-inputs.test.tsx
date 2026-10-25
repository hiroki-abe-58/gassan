import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AddressFields,
  BankAccountFields,
  BirthDateInput,
  EmailInput,
  Field,
  Fieldset,
  formatPostalCode,
  Input,
  NameFields,
  NativeSelect,
  normalizePhone,
  type BankAccount,
  type JapaneseAddress,
  type PersonName,
  type PostalAddress,
} from '../src';

/** React の外から値と入力位置を置き、input イベントを起こす（打った直後の状態）。 */
function typeAt(input: HTMLInputElement, value: string, caret: number, init: InputEventInit = {}): void {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
  input.setSelectionRange(caret, caret);
  input.dispatchEvent(new InputEvent('input', { bubbles: true, ...init }));
}

/** IME で打って確定する（変換中の input は isComposing、確定の文字列は compositionend の data）。 */
function compose(input: HTMLInputElement, steps: readonly string[], committed: string): void {
  const before = input.value;
  fireEvent.compositionStart(input, { data: '' });
  for (const step of steps) {
    fireEvent.compositionUpdate(input, { data: step });
    typeAt(input, before + step, (before + step).length, { isComposing: true });
  }
  fireEvent.compositionUpdate(input, { data: committed });
  typeAt(input, before + committed, (before + committed).length, { isComposing: true });
  fireEvent.compositionEnd(input, { data: committed });
}

describe('I-25 Input の normalize', () => {
  it('打つたびにそろえ、利用側の onChange はそろえた後の値を受け取る', () => {
    const seen: string[] = [];
    render(<Input aria-label="郵便番号" normalize={formatPostalCode} onChange={(event) => seen.push(event.target.value)} />);
    const input = screen.getByRole('textbox', { name: '郵便番号' }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '１００００' } });
    expect(input.value).toBe('100-00');
    expect(seen).toEqual(['100-00']);
  });

  it('入力位置を保つ（そろえる前の位置より前の文字列をそろえた長さ）', () => {
    render(<Input aria-label="郵便番号" normalize={formatPostalCode} defaultValue="123-4567" />);
    const input = screen.getByRole('textbox', { name: '郵便番号' }) as HTMLInputElement;
    input.focus();
    typeAt(input, '123-94567', 5);
    expect(input.value).toBe('123-9456');
    expect(input.selectionStart).toBe(5);
  });

  it('IME の変換中は触らず、確定したときにそろえて onChange を呼ぶ', () => {
    const seen: string[] = [];
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <Input
          aria-label="電話番号"
          value={value}
          normalize={normalizePhone}
          onChange={(event) => {
            seen.push(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole('textbox', { name: '電話番号' }) as HTMLInputElement;
    fireEvent.compositionStart(input, { data: '' });
    typeAt(input, '０９０ー', 4, { isComposing: true });
    expect(input.value).toBe('０９０ー');
    fireEvent.compositionEnd(input, { data: '０９０ー' });
    expect(input.value).toBe('090');
    expect(seen.at(-1)).toBe('090');
  });

  it('1 文字ずつ打っても、貼り付けても同じ形になる（userEvent）', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="電話番号" normalize={normalizePhone} />);
    const input = screen.getByRole('textbox', { name: '電話番号' }) as HTMLInputElement;
    await user.type(input, '+81 90-1234-5678');
    expect(input.value).toBe('09012345678');
    await user.clear(input);
    await user.click(input);
    await user.paste('（03）1234−5678');
    expect(input.value).toBe('0312345678');
  });
});

describe('I-26 NativeSelect', () => {
  it('ネイティブの select を Input と同じ枠に入れ、ラベル・空の選択肢・onChange・className（枠）が効く', () => {
    const onChange = vi.fn();
    render(
      <Field label="都道府県">
        {(control) => (
          <NativeSelect
            {...control}
            className="extra"
            autoComplete="address-level1"
            placeholder="選択してください"
            options={[
              { value: '東京都', label: '東京都' },
              { value: '大阪府', label: '大阪府', disabled: true },
            ]}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </Field>,
    );
    const select = screen.getByRole('combobox', { name: /都道府県/ }) as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('autocomplete', 'address-level1');
    expect(select.closest('.g-input')).toHaveClass('g-native-select', 'extra');
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual(['選択してください', '東京都', '大阪府']);
    expect(within(select).getByRole('option', { name: '大阪府' })).toBeDisabled();
    fireEvent.change(select, { target: { value: '東京都' } });
    expect(onChange).toHaveBeenCalledWith('東京都');
    // 浮くラベル（I-24）は枠の先頭の .g-bare を探す。select を先頭に置かない
    expect(select.closest('.g-input')?.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  });
});

describe('I-30 EmailInput', () => {
  it('全角・IME の「。」・ドメインの大文字を打つたびに直す', () => {
    render(<EmailInput aria-label="メールアドレス" />);
    const input = screen.getByRole('textbox', { name: 'メールアドレス' }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ｔａｒｏ＠Ｇｍａｉｌ。ｃｏｍ' } });
    expect(input.value).toBe('Taro@gmail.com');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('離れたときに打ち間違いの候補を出して読み上げにも知らせ、ボタンで直してフォーカスを戻す', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EmailInput aria-label="メールアドレス" onChange={(event) => onChange(event.target.value)} />);
    const input = screen.getByRole('textbox', { name: 'メールアドレス' }) as HTMLInputElement;
    await user.type(input, 'taro@gmial.com');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await user.tab();
    expect(screen.getByRole('status')).toHaveTextContent('もしかして taro@gmail.com ですか？');
    await user.click(screen.getByRole('button', { name: 'これに直す' }));
    expect(input.value).toBe('taro@gmail.com');
    expect(onChange).toHaveBeenLastCalledWith('taro@gmail.com');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'これに直す' })).toBeNull();
  });

  it('携帯会社のメールには、送り主を入れた注意を欄の説明として出す（エラーにしない）', () => {
    render(<EmailInput aria-label="メールアドレス" sender="example.com" defaultValue="taro@docomo.ne.jp" />);
    const input = screen.getByRole('textbox', { name: 'メールアドレス' });
    expect(input).toHaveAccessibleDescription(/「example.com」からのメールを受け取れるように/);
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});

describe('I-28 NameFields', () => {
  it('姓・名・セイ・メイを束の見出しの下に並べ、自動入力の名前を付ける。必須は見出しにだけ出す', () => {
    render(<NameFields label="お名前" required />);
    const group = screen.getByRole('group', { name: /お名前/ });
    expect(within(group).getByText('必須')).toBeInTheDocument();
    expect(within(group).getAllByText('必須')).toHaveLength(1);
    expect(within(group).getByRole('textbox', { name: '姓' })).toHaveAttribute('autocomplete', 'family-name');
    expect(within(group).getByRole('textbox', { name: '名' })).toHaveAttribute('autocomplete', 'given-name');
    expect(within(group).getByRole('textbox', { name: 'セイ' })).toBeRequired();
    expect(within(group).getByRole('textbox', { name: 'メイ' })).toBeInTheDocument();
  });

  it('kana="hiragana" は「せい」「めい」、false はフリガナの欄を出さない', () => {
    const { rerender } = render(<NameFields label="お名前" kana="hiragana" />);
    expect(screen.getByRole('textbox', { name: 'せい' })).toBeInTheDocument();
    rerender(<NameFields label="お名前" kana={false} />);
    expect(screen.queryByRole('textbox', { name: 'せい' })).toBeNull();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('名前を IME で打つと、変換前のかなをフリガナに入れる（ローマ字の打ちかけと変換後の漢字は読みにしない）', () => {
    const values: PersonName[] = [];
    render(<NameFields label="お名前" onValueChange={(value) => values.push(value)} />);
    const family = screen.getByRole('textbox', { name: '姓' }) as HTMLInputElement;
    const given = screen.getByRole('textbox', { name: '名' }) as HTMLInputElement;
    compose(family, ['y', 'や', 'やm', 'やま', 'やまd', 'やまだ'], '山田');
    compose(given, ['た', 'たろ', 'たろう'], '太郎');
    expect(screen.getByRole('textbox', { name: 'セイ' })).toHaveValue('ヤマダ');
    expect(screen.getByRole('textbox', { name: 'メイ' })).toHaveValue('タロウ');
    expect(values.at(-1)).toEqual({ familyName: '山田', givenName: '太郎', familyNameKana: 'ヤマダ', givenNameKana: 'タロウ' });
  });

  it('続けて打てば読みを足し、全体を選んで打ち直せば置き換え、名前を空にすればフリガナも消す', () => {
    render(<NameFields label="お名前" />);
    const family = screen.getByRole('textbox', { name: '姓' }) as HTMLInputElement;
    const kana = screen.getByRole('textbox', { name: 'セイ' });
    compose(family, ['やま'], '山');
    compose(family, ['だ'], '田');
    expect(kana).toHaveValue('ヤマダ');
    family.setSelectionRange(0, family.value.length);
    fireEvent.compositionStart(family, { data: '' });
    fireEvent.compositionUpdate(family, { data: 'すずき' });
    typeAt(family, '鈴木', 2, { isComposing: true });
    fireEvent.compositionEnd(family, { data: '鈴木' });
    expect(kana).toHaveValue('スズキ');
    fireEvent.change(family, { target: { value: '' } });
    expect(kana).toHaveValue('');
  });

  it('フリガナを自分で直したら、そこから先は名前の読みで書き換えない。打ったかなはカタカナにそろえる', () => {
    render(<NameFields label="お名前" />);
    const family = screen.getByRole('textbox', { name: '姓' }) as HTMLInputElement;
    const kana = screen.getByRole('textbox', { name: 'セイ' });
    fireEvent.change(kana, { target: { value: 'やまざき' } });
    expect(kana).toHaveValue('ヤマザキ');
    compose(family, ['やまさき'], '山崎');
    expect(kana).toHaveValue('ヤマザキ');
  });

  it('名前は半角カナを全角に、全角の英字を半角にそろえる。欄ごとのエラーと name の頭', () => {
    const { container } = render(<NameFields label="お名前" name="customer" errors={{ givenName: '名を入力してください' }} />);
    const family = screen.getByRole('textbox', { name: '姓' });
    fireEvent.change(family, { target: { value: 'ﾔﾏﾀﾞ Ｊｏｈｎ' } });
    expect(family).toHaveValue('ヤマダ John');
    expect(screen.getByRole('textbox', { name: '名' })).toHaveAccessibleDescription('名を入力してください');
    expect(container.querySelector('input[name="customer.familyNameKana"]')).not.toBeNull();
  });
});

describe('I-27 AddressFields', () => {
  const chiyoda: PostalAddress = { prefecture: '東京都', city: '千代田区', town: '千代田' };
  const marunouchi: PostalAddress = { prefecture: '東京', city: '千代田区', town: '丸の内' };

  async function settle(): Promise<void> {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it('郵便番号を「123-4567」にそろえ、7 桁で lookup（数字だけを渡す）を引いて空の欄を埋め、読み上げに知らせる', async () => {
    const lookup = vi.fn(() => [chiyoda]);
    const values: JapaneseAddress[] = [];
    render(<AddressFields label="住所" lookup={lookup} onValueChange={(value) => values.push(value)} />);
    fireEvent.change(screen.getByRole('textbox', { name: '郵便番号' }), { target: { value: '〒１００ー０００１' } });
    expect(screen.getByRole('textbox', { name: '郵便番号' })).toHaveValue('100-0001');
    await settle();
    expect(lookup).toHaveBeenCalledWith('1000001');
    expect(screen.getByRole('combobox', { name: '都道府県' })).toHaveValue('東京都');
    expect(screen.getByRole('textbox', { name: '市区町村' })).toHaveValue('千代田区');
    expect(screen.getByRole('textbox', { name: '町名・番地' })).toHaveValue('千代田');
    expect(screen.getByRole('status')).toHaveTextContent('東京都千代田区千代田 を入力しました。続けて番地を入力してください。');
    expect(values.at(-1)).toEqual({ postalCode: '100-0001', prefecture: '東京都', city: '千代田区', line1: '千代田', line2: '' });
  });

  it('利用者（や自動入力）が入れた値は上書きせず、フォーカスも動かさない', async () => {
    render(<AddressFields label="住所" lookup={() => [chiyoda]} defaultValue={{ city: '港区' }} />);
    const postal = screen.getByRole('textbox', { name: '郵便番号' });
    postal.focus();
    fireEvent.change(postal, { target: { value: '1000001' } });
    await settle();
    expect(screen.getByRole('textbox', { name: '市区町村' })).toHaveValue('港区');
    expect(screen.getByRole('combobox', { name: '都道府県' })).toHaveValue('東京都');
    expect(postal).toHaveFocus();
  });

  it('郵便番号を直すと、自動で入れた町域を差し替え、後ろに打った番地は残す', async () => {
    const lookup = vi.fn((code: string) => (code === '1000001' ? [chiyoda] : [marunouchi]));
    render(<AddressFields label="住所" lookup={lookup} />);
    const postal = screen.getByRole('textbox', { name: '郵便番号' });
    fireEvent.change(postal, { target: { value: '1000001' } });
    await settle();
    const line1 = screen.getByRole('textbox', { name: '町名・番地' });
    fireEvent.change(line1, { target: { value: '千代田１ー１' } });
    expect(line1).toHaveValue('千代田1-1');
    fireEvent.change(postal, { target: { value: '1000005' } });
    await settle();
    expect(line1).toHaveValue('丸の内1-1');
    expect(screen.getByRole('combobox', { name: '都道府県' })).toHaveValue('東京都');
  });

  it('候補が複数ならボタンで選ばせ、選んだら町名番地へフォーカスを移す', async () => {
    const user = userEvent.setup();
    render(<AddressFields label="住所" lookup={() => Promise.resolve([chiyoda, marunouchi])} />);
    fireEvent.change(screen.getByRole('textbox', { name: '郵便番号' }), { target: { value: '1000000' } });
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent('この郵便番号には住所が複数あります。選んでください。');
    await user.click(screen.getByRole('button', { name: '東京都千代田区丸の内' }));
    expect(screen.getByRole('textbox', { name: '町名・番地' })).toHaveValue('丸の内');
    expect(screen.getByRole('textbox', { name: '町名・番地' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: '東京都千代田区千代田' })).toBeNull();
  });

  it('見つからない・失敗はエラーにせず知らせる', async () => {
    const { unmount } = render(<AddressFields label="住所" lookup={() => []} />);
    fireEvent.change(screen.getByRole('textbox', { name: '郵便番号' }), { target: { value: '9999999' } });
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent('この郵便番号の住所は見つかりませんでした。');
    expect(screen.getByRole('textbox', { name: '郵便番号' })).not.toHaveAttribute('aria-invalid');
    unmount();
    render(<AddressFields label="住所" lookup={() => Promise.reject(new Error('offline'))} />);
    fireEvent.change(screen.getByRole('textbox', { name: '郵便番号' }), { target: { value: '1000001' } });
    await settle();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('住所を自動で入力できませんでした。'));
  });

  it('autocomplete の名前（届け先・請求先の頭）、住所の書き方、必須の中の任意の建物名', () => {
    render(<AddressFields label="お届け先" required autoCompleteSection="shipping" name="ship" />);
    expect(screen.getByRole('textbox', { name: '郵便番号' })).toHaveAttribute('autocomplete', 'shipping postal-code');
    expect(screen.getByRole('combobox', { name: '都道府県' })).toHaveAttribute('autocomplete', 'shipping address-level1');
    expect(screen.getByRole('textbox', { name: /建物名・部屋番号/ })).toHaveAttribute('autocomplete', 'shipping address-line2');
    expect(screen.getByRole('textbox', { name: /建物名・部屋番号/ })).toHaveAttribute('name', 'ship.line2');
    const group = screen.getByRole('group', { name: /お届け先/ });
    expect(within(group).getAllByText('必須')).toHaveLength(1);
    expect(within(group).getByText('任意')).toBeInTheDocument();
    const line1 = screen.getByRole('textbox', { name: '町名・番地' });
    fireEvent.change(line1, { target: { value: '１−２‐３ ﾒｿﾞﾝ' } });
    expect(line1).toHaveValue('1-2-3 メゾン');
  });
});

describe('I-29 BirthDateInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 9, 25, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('年・月・日のネイティブの select（自動入力の名前）。年は新しい順で和暦を添え、改元の年は両方', () => {
    render(<BirthDateInput label="生年月日" />);
    const year = screen.getByRole('combobox', { name: '年' }) as HTMLSelectElement;
    expect(year).toHaveAttribute('autocomplete', 'bday-year');
    expect(screen.getByRole('combobox', { name: '月' })).toHaveAttribute('autocomplete', 'bday-month');
    expect(screen.getByRole('combobox', { name: '日' })).toHaveAttribute('autocomplete', 'bday-day');
    const options = within(year).getAllByRole('option');
    expect(options[1]).toHaveTextContent('2026年（令和8年）');
    expect(within(year).getByRole('option', { name: '1989年（昭和64年・平成元年）' })).toBeInTheDocument();
    expect(options.at(-1)).toHaveTextContent('1906年');
  });

  it('そろうと YYYY-MM-DD と満年齢。無い日付になったら日を空に戻して null', () => {
    const onValueChange = vi.fn();
    const { container } = render(<BirthDateInput label="生年月日" name="birthday" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: '年' }), { target: { value: '2000' } });
    fireEvent.change(screen.getByRole('combobox', { name: '月' }), { target: { value: '1' } });
    fireEvent.change(screen.getByRole('combobox', { name: '日' }), { target: { value: '31' } });
    expect(onValueChange).toHaveBeenLastCalledWith('2000-01-31');
    expect(screen.getByRole('status')).toHaveTextContent('満 26 歳');
    expect(container.querySelector('input[type="hidden"][name="birthday"]')).toHaveValue('2000-01-31');
    fireEvent.change(screen.getByRole('combobox', { name: '月' }), { target: { value: '2' } });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('combobox', { name: '日' })).toHaveValue('');
    expect(within(screen.getByRole('combobox', { name: '日' })).getAllByRole('option')).toHaveLength(30);
  });

  it('制御: 外から日付を渡せば合わせ、自分が送った null（選びかけ）では選んだ年を消さない', () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('1990-05-03');
      return (
        <>
          <BirthDateInput label="生年月日" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(null)}>
            消す
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('combobox', { name: '年' })).toHaveValue('1990');
    fireEvent.change(screen.getByRole('combobox', { name: '日' }), { target: { value: '' } });
    expect(screen.getByRole('combobox', { name: '年' })).toHaveValue('1990');
    fireEvent.change(screen.getByRole('combobox', { name: '日' }), { target: { value: '4' } });
    expect(screen.getByRole('status')).toHaveTextContent('満 36 歳');
    fireEvent.click(screen.getByRole('button', { name: '消す' }));
    expect(screen.getByRole('combobox', { name: '年' })).toHaveValue('');
  });
});

describe('I-31 BankAccountFields', () => {
  const banks = [
    { value: '0005', label: '三菱UFJ銀行', keywords: ['みつびしゆーえふじぇい'] },
    { value: '0009', label: '三井住友銀行', keywords: ['みついすみとも'] },
    { value: '9900', label: 'ゆうちょ銀行', keywords: ['ゆうちょ'] },
  ];
  const branches = [{ value: '001', label: '本店' }];

  it('金融機関は読みがなでも探せ、支店は金融機関を選ぶまで押せない。番号は数字だけ 7 桁、名義は全角カタカナ', async () => {
    const user = userEvent.setup();
    const values: BankAccount[] = [];
    render(<BankAccountFields label="振込先" banks={banks} branches={branches} onValueChange={(value) => values.push(value)} />);
    expect(screen.getByRole('combobox', { name: '支店' })).toBeDisabled();
    await user.type(screen.getByRole('combobox', { name: '金融機関' }), 'みつびし');
    await user.click(screen.getByRole('option', { name: '三菱UFJ銀行' }));
    expect(screen.getByRole('combobox', { name: '支店' })).toBeEnabled();
    fireEvent.change(screen.getByRole('textbox', { name: '口座番号' }), { target: { value: '１２３－４５６７８' } });
    expect(screen.getByRole('textbox', { name: '口座番号' })).toHaveValue('1234567');
    fireEvent.change(screen.getByRole('textbox', { name: '口座名義（カナ）' }), { target: { value: 'やまだ ﾀﾛｳ' } });
    expect(screen.getByRole('textbox', { name: '口座名義（カナ）' })).toHaveValue('ヤマダ タロウ');
    expect(values.at(-1)).toMatchObject({ bankCode: '0005', accountType: 'ordinary', accountNumber: '1234567', accountHolder: 'ヤマダ タロウ' });
    expect(screen.getByRole('radio', { name: '普通' })).toBeChecked();
  });

  it('ゆうちょ銀行は記号・番号を聞き、振込用の店名・種目・口座番号に直して見せ、値にも入れる', () => {
    const values: BankAccount[] = [];
    render(<BankAccountFields label="振込先" banks={banks} branches={[]} defaultValue={{ bankCode: '9900' }} onValueChange={(value) => values.push(value)} />);
    expect(screen.queryByRole('combobox', { name: '支店' })).toBeNull();
    fireEvent.change(screen.getByRole('textbox', { name: '記号' }), { target: { value: '１０１８０' } });
    fireEvent.change(screen.getByRole('textbox', { name: '番号' }), { target: { value: '12345671' } });
    expect(screen.getByRole('status')).toHaveTextContent('振込用の店名・口座番号: 〇一八（018）・普通・1234567');
    expect(values.at(-1)).toMatchObject({ bankCode: '9900', branchCode: '018', accountType: 'ordinary', accountNumber: '1234567', yuchoSymbol: '10180' });
  });
});

describe('D-11 日本の入力の束の data-*', () => {
  it('住所・名前・生年月日・口座の束は、data-* を束（fieldset）に渡す', () => {
    render(
      <>
        <AddressFields label="住所" data-testid="address" />
        <NameFields label="お名前" data-testid="name" />
        <BirthDateInput label="生年月日" data-testid="birth" />
        <BankAccountFields label="口座" banks={[]} branches={[]} data-testid="bank" />
      </>,
    );
    for (const id of ['address', 'name', 'birth', 'bank']) expect(screen.getByTestId(id).tagName).toBe('FIELDSET');
  });
});

describe('B-08 束の見出しと必須の表示', () => {
  it('見出しが「必須」なら中の必須の欄は繰り返さず、任意の欄にだけ「任意」を出す。束の外は今までどおり', () => {
    render(
      <>
        <Fieldset label="連絡先" required>
          <Field label="電話" required>
            {(control) => <Input {...control} />}
          </Field>
          <Field label="FAX">{(control) => <Input {...control} />}</Field>
        </Fieldset>
        <Field label="会社名" required>
          {(control) => <Input {...control} />}
        </Field>
      </>,
    );
    const group = screen.getByRole('group', { name: /連絡先/ });
    expect(within(group).getAllByText('必須')).toHaveLength(1);
    expect(within(group).getByText('任意')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /電話/ })).toBeRequired();
    expect(screen.getAllByText('必須')).toHaveLength(2);
  });
});
