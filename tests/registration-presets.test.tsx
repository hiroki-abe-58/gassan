/**
 * 業種ごとの登録（P-31）と、その欄（I-33〜I-37）。
 *
 * 欄の部品は、法令が求める項目の選択肢・理由の文・読み上げの形と、値の受け渡しを見る。業種ごとの手順は、進み具合と
 * 根拠の説明・送ろうとした後の直す所・未成年の保護者の同意・年齢の下限・本人確認・保存と登録への値の渡し方を見る。
 * 形は templates.css。
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CompanyFields,
  DeclarationField,
  GassanProvider,
  GuardianFields,
  IdentityMethodField,
  MarketingConsentField,
  MyNumberField,
  OccupationField,
  PepsField,
  PurposeField,
  REGISTRATION_PRESETS,
  REGISTRATION_PRESET_IDS,
  RegistrationPresetPage,
  TaxResidencyField,
  UsPersonField,
  emptyRegistrationValues,
  englishLabels,
  identityMethods,
  type Answer,
  type CompanyInfo,
  type GuardianConsent,
  type IdentityMethod,
  type Occupation,
  type TaxResidency,
  type UsPerson,
} from '../src';
import { japaneseRegistrationLabels } from '../src/templates/registration-labels';

afterEach(() => {
  vi.restoreAllMocks();
});

const thisYear = new Date().getFullYear();
const ADULT = `${String(thisYear - 30)}-04-01`;
const NAME = { familyName: '佐藤', givenName: '花', familyNameKana: 'サトウ', givenNameKana: 'ハナ' };
const ADDRESS = { postalCode: '100-0001', prefecture: '東京都', city: '千代田区', line1: '千代田1-1', line2: '' };

describe('職業と取引の目的 / I-33', () => {
  it('OccupationField は金融庁の類型をネイティブの select で出し、選んだキーを渡す', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Occupation() {
      const [value, setValue] = useState<Occupation | ''>('');
      return (
        <OccupationField
          required
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Occupation />);
    const select = screen.getByRole('combobox', { name: /ご職業/ });
    // 空の選択肢と、類型の 9 つ
    expect(within(select).getAllByRole('option')).toHaveLength(10);
    await user.selectOptions(select, '会社員・団体職員');
    expect(onValueChange).toHaveBeenCalledWith('employee');
  });

  it('PurposeField は業態の組の選択肢をチェックボックスの束で出し、束に名前と説明を付ける', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PurposeField kind="deposit" required value={[]} onValueChange={onValueChange} />);
    const group = screen.getByRole('group', { name: /お取引の目的/ });
    expect(group).toHaveAccessibleDescription('当てはまるものをすべて選んでください。');
    expect(within(group).getAllByRole('checkbox')).toHaveLength(7);
    await user.click(within(group).getByRole('checkbox', { name: '給与・年金の受け取り' }));
    expect(onValueChange).toHaveBeenCalledWith(['salary']);
  });
});

describe('届出と表明 / I-34', () => {
  it('PepsField は当たる人の範囲を説明に置いた二択で、答えを渡す', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PepsField value={null} onValueChange={onValueChange} />);
    const group = screen.getByRole('group', { name: /外国の重要な公人/ });
    expect(group).toHaveAccessibleDescription(/外国の元首・大臣・中央銀行の役員/);
    await user.click(within(group).getByRole('radio', { name: '当たらない' }));
    expect(onValueChange).toHaveBeenCalledWith('no');
  });

  it('UsPersonField は「ある」と答えた人にだけ、納税者番号と報告への同意の欄を出す', async () => {
    const user = userEvent.setup();
    function UsPersonSample() {
      const [value, setValue] = useState<UsPerson>({ answer: null, tin: '', consent: false });
      return <UsPersonField value={value} onValueChange={setValue} errors={{ consent: value.answer === 'yes' && !value.consent ? '同意が必要です' : undefined }} />;
    }
    render(<UsPersonSample />);
    expect(screen.queryByLabelText(/米国の納税者番号/)).toBeNull();
    await user.click(screen.getByRole('radio', { name: 'ある' }));
    expect(screen.getByLabelText(/米国の納税者番号/)).toBeInTheDocument();
    const consent = screen.getByRole('checkbox', { name: /IRS/ });
    expect(consent).toHaveAttribute('aria-invalid', 'true');
    expect(consent).toHaveAccessibleDescription('同意が必要です');
    await user.click(screen.getByRole('radio', { name: 'ない' }));
    expect(screen.queryByRole('checkbox', { name: /IRS/ })).toBeNull();
  });

  it('TaxResidencyField は「日本のほかの国にもある」で国と納税者番号の欄を出し、国を足し外せる（名前に何番目か）', async () => {
    const user = userEvent.setup();
    function Residency() {
      const [value, setValue] = useState<TaxResidency>({ residency: null, countries: [] });
      return <TaxResidencyField value={value} onValueChange={setValue} />;
    }
    render(<Residency />);
    expect(screen.queryByLabelText(/^国/)).toBeNull();
    await user.click(screen.getByRole('radio', { name: '日本のほかの国にもある' }));
    expect(screen.getByRole('group', { name: '1つ目の国' })).toBeInTheDocument();
    // 1 つだけのときは外すボタンを出さない
    expect(screen.queryByRole('button', { name: /国を外す/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: '国を足す' }));
    const second = screen.getByRole('group', { name: '2つ目の国' });
    await user.type(within(second).getByRole('textbox', { name: /^国/ }), 'シンガポール');
    expect(within(second).getByRole('textbox', { name: /^国/ })).toHaveValue('シンガポール');
    await user.click(screen.getByRole('button', { name: '2つ目の国を外す' }));
    expect(screen.queryByRole('group', { name: '2つ目の国' })).toBeNull();
    await user.click(screen.getByRole('radio', { name: '日本だけ' }));
    expect(screen.queryByRole('group', { name: '1つ目の国' })).toBeNull();
  });

  it('DeclarationField は表明のチェックボックスと、開け閉めできる範囲の説明を持ち、エラーを欄に結ぶ', () => {
    const r = japaneseRegistrationLabels;
    render(
      <DeclarationField checked={false} onCheckedChange={vi.fn()} detailsTitle={r.antiSocial.definitionTitle} details={r.antiSocial.definition} error={r.antiSocial.required}>
        {r.antiSocial.label}
      </DeclarationField>,
    );
    const box = screen.getByRole('checkbox', { name: /反社会的勢力ではないことを表明/ });
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(r.antiSocial.required);
    const details = screen.getByText('反社会的勢力とは').closest('details');
    expect(details).not.toHaveAttribute('open');
    expect(details).toHaveTextContent('暴力団');
  });
});

describe('番号 / I-35', () => {
  it('MyNumberField は全角・ハイフン入りでも数字だけにそろえ、自動入力とスペルの確認を切る', async () => {
    const user = userEvent.setup();
    function MyNumber() {
      const [value, setValue] = useState('');
      return <MyNumberField value={value} onValueChange={setValue} />;
    }
    render(<MyNumber />);
    const input = screen.getByRole('textbox', { name: /マイナンバー/ });
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('spellcheck', 'false');
    await user.type(input, '１２３４-５６７８ ９０１２');
    expect(input).toHaveValue('123456789012');
  });

  it('CompanyFields は正しい法人番号で会社名を引き、空の欄か補ったままの欄だけを埋めて知らせる', async () => {
    const user = userEvent.setup();
    const lookup = vi.fn((number: string) => Promise.resolve(number === '8700110005901' ? { name: '国税庁' } : { name: '別の会社' }));
    function Company() {
      const [value, setValue] = useState<CompanyInfo>({ name: '', corporateNumber: '', department: '', position: '', employees: '' });
      return <CompanyFields value={value} onValueChange={setValue} lookup={lookup} />;
    }
    render(<Company />);
    const number = screen.getByRole('textbox', { name: /法人番号/ });
    const name = screen.getByRole('textbox', { name: /会社名/ });
    // 12 桁の途中では引かない
    await user.type(number, '870011000590');
    expect(lookup).not.toHaveBeenCalled();
    await user.type(number, '1');
    await vi.waitFor(() => expect(name).toHaveValue('国税庁'));
    expect(screen.getByRole('status')).toHaveTextContent('「国税庁」を見つけました。');
    // 打ち直した会社名は、別の番号で引いても上書きしない（3000012010001 は検査用数字の合う別の番号）
    await user.clear(name);
    await user.type(name, '自分で打った会社');
    await user.clear(number);
    await user.type(number, '3000012010001');
    await vi.waitFor(() => expect(lookup).toHaveBeenLastCalledWith('3000012010001'));
    expect(name).toHaveValue('自分で打った会社');
  });
});

describe('本人確認の方法 / I-36', () => {
  it('identityMethods は根拠の法令で使える方法を返し、犯罪収益移転防止法の書類と顔の撮影は 2027-04-01 から出さない', () => {
    expect(identityMethods('aml', new Date(2027, 2, 31))).toContain('imageSelfie');
    expect(identityMethods('aml', new Date(2027, 3, 1))).not.toContain('imageSelfie');
    expect(identityMethods('aml', new Date(2027, 3, 1))).toEqual(expect.arrayContaining(['icSelfie', 'smartphoneCard', 'jpki', 'restrictedMail']));
    // 携帯電話は 2026-04-01 から書類の画像の方式が無い。古物は画像の方式が残る
    expect(identityMethods('telecom', new Date(2026, 9, 26))).not.toContain('imageSelfie');
    expect(identityMethods('reuse', new Date(2030, 0, 1))).toContain('imageSelfie');
    expect(identityMethods('matching', new Date(2026, 9, 26))).toEqual(['cardPin', 'jpki', 'ageDocument', 'creditCard']);
  });

  it('IdentityMethodField は方法ごとに手元に要るものを説明に置き、methods で自社が対応する方法に絞る', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<IdentityMethodField regime="aml" methods={['jpki', 'icSelfie', 'creditCard']} value={null} onValueChange={onValueChange} on={new Date(2026, 9, 26)} />);
    const group = screen.getByRole('group', { name: /ご本人確認の方法/ });
    // regime で使えない方法（クレジットカード）は、渡しても出さない。並びは methods の順（勧める方法を先に置ける）
    expect(within(group).getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual(['jpki', 'icSelfie']);
    const jpki = within(group).getByRole('radio', { name: 'マイナンバーカードの電子証明書' });
    expect(jpki).toHaveAccessibleDescription(/署名用のパスワード（英数字 6〜16 桁）/);
    await user.click(jpki);
    expect(onValueChange).toHaveBeenCalledWith('jpki');
  });
});

describe('保護者の同意と広告メールの同意 / I-37', () => {
  it('GuardianFields は保護者の名前・続柄・メールと同意を聞き、ご本人の自動入力を切る', async () => {
    const user = userEvent.setup();
    function Guardian() {
      const [value, setValue] = useState<GuardianConsent>({ name: '', relationship: '', email: '', consent: false });
      return <GuardianFields value={value} onValueChange={setValue} />;
    }
    render(<Guardian />);
    expect(screen.getByRole('textbox', { name: /保護者のお名前/ })).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByRole('textbox', { name: /保護者のメールアドレス/ })).toHaveAttribute('autocomplete', 'off');
    await user.selectOptions(screen.getByRole('combobox', { name: /続柄/ }), '母');
    expect(screen.getByRole('combobox', { name: /続柄/ })).toHaveValue('mother');
    await user.click(screen.getByRole('checkbox', { name: '保護者の同意を得ています' }));
    expect(screen.getByRole('checkbox', { name: '保護者の同意を得ています' })).toBeChecked();
  });

  it('MarketingConsentField は初めにチェックを入れない任意の同意で、止められることを説明に置く', () => {
    render(<MarketingConsentField checked={false} onCheckedChange={vi.fn()} />);
    const box = screen.getByRole('checkbox', { name: 'お知らせやキャンペーンのメールを受け取る' });
    expect(box).not.toBeChecked();
    expect(box).not.toBeRequired();
    expect(box).toHaveAccessibleDescription('いつでも受け取りを止められます。');
  });
});

describe('業種ごとの登録 / P-31', () => {
  it('REGISTRATION_PRESETS はどの業種も根拠の法令と出典を持ち、本人確認と取引の目的の組が欄とそろっている', () => {
    for (const id of REGISTRATION_PRESET_IDS) {
      const preset = REGISTRATION_PRESETS[id];
      expect(preset.id).toBe(id);
      expect(preset.laws.length).toBeGreaterThan(0);
      for (const law of preset.laws) expect(law.url).toMatch(/^https:\/\//);
      const fields = preset.steps.flatMap((step) => step.fields);
      expect(fields.includes('identity')).toBe(preset.identity !== undefined);
      expect(fields.includes('purposes')).toBe(preset.purposes !== undefined);
      // 年齢の決まりは、生年月日を聞く業種にだけ
      if (preset.minAge !== undefined || preset.guardianUnder !== undefined) expect(fields).toContain('birthDate');
      for (const step of preset.steps) for (const key of step.optional ?? []) expect(step.fields).toContain(key);
    }
  });

  it('どの業種も最初の手順を描き、手順の名前を進み具合に並べる', () => {
    for (const id of REGISTRATION_PRESET_IDS) {
      const { unmount } = render(<RegistrationPresetPage preset={id} onSubmit={vi.fn()} />);
      const first = REGISTRATION_PRESETS[id].steps[0];
      expect(screen.getByRole('heading', { level: 1, name: japaneseRegistrationLabels.steps[first?.id ?? 'profile'].title })).toBeInTheDocument();
      expect(within(screen.getByRole('list', { name: '登録の手順' })).getAllByRole('listitem')).toHaveLength(REGISTRATION_PRESETS[id].steps.length + 1);
      unmount();
    }
  });

  it('手順の説明に根拠の法令を書き、送ろうとしたときに直す所を欄の下に出す。直すと消え、進めたら値を onSave に渡す', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onSubmit = vi.fn();
    render(<RegistrationPresetPage preset="ticket" onSave={onSave} onSubmit={onSubmit} />);
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('転売防止のため');
    expect(screen.getByText(/興行主の同意のない有償での譲渡/)).toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: /入場される方のお名前/ });
    // 打つ前は責めない
    expect(name).not.toHaveAttribute('aria-invalid');
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('入場される方のお名前を入力してください');
    await user.type(name, '佐藤 花');
    expect(name).not.toHaveAttribute('aria-invalid');
    await user.type(screen.getByRole('textbox', { name: /ご連絡先のメールアドレス/ }), 'hana@example.com');
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ attendee: { name: '佐藤 花', email: 'hana@example.com' } }), 'attendee');
    expect(await screen.findByRole('heading', { level: 1, name: '入力内容の確認' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '登録する' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ attendee: { name: '佐藤 花', email: 'hana@example.com' } })));
  });

  it('未成年なら生年月日の手順の後に保護者の同意の手順を足し、年齢の下限に届かなければ進めない', async () => {
    const user = userEvent.setup();
    const minor = `${String(thisYear - 12)}-04-01`;
    const { unmount } = render(<RegistrationPresetPage preset="telecom" defaultValues={{ name: NAME, birthDate: minor }} onSubmit={vi.fn()} />);
    const steps = within(screen.getByRole('list', { name: '登録の手順' })).getAllByRole('listitem');
    expect(steps.map((step) => step.textContent)).toEqual(expect.arrayContaining([expect.stringContaining('保護者の同意')]));
    expect(steps[1]).toHaveTextContent('保護者の同意');
    unmount();

    render(<RegistrationPresetPage preset="matching" defaultValues={{ nickname: 'はな', birthDate: `${String(thisYear - 15)}-04-01`, gender: 'female', prefecture: '東京都' }} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(screen.getByRole('heading', { level: 1, name: 'プロフィール' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('18歳未満の方はご利用いただけません');
  });

  it('本人確認は onVerifyIdentity で確かめてから進め、方法を変えたら確かめ直す', async () => {
    const user = userEvent.setup();
    const onVerifyIdentity = vi.fn((_method: IdentityMethod) => Promise.resolve());
    render(
      <RegistrationPresetPage
        preset="telecom"
        defaultStep="identity"
        defaultValues={{ name: NAME, birthDate: ADULT, address: ADDRESS }}
        onVerifyIdentity={onVerifyIdentity}
        onSubmit={vi.fn()}
      />,
    );
    expect(document.querySelector('.g-auth-description')).toHaveTextContent('携帯電話不正利用防止法');
    const start = screen.getByRole('button', { name: 'この方法で本人確認をする' });
    expect(start).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'IC チップと顔の撮影' }));
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(screen.getByRole('alert')).toHaveTextContent('本人確認を済ませてください');
    await user.click(screen.getByRole('button', { name: 'この方法で本人確認をする' }));
    await vi.waitFor(() => expect(document.querySelector('.g-registration-verify')).toHaveTextContent('本人確認ができました。'));
    expect(onVerifyIdentity).toHaveBeenCalledWith('icSelfie', expect.objectContaining({ identity: 'icSelfie' }));
    // 方法を変えたら、確かめ直す
    await user.click(screen.getByRole('radio', { name: 'スマートフォンのマイナンバーカード' }));
    expect(document.querySelector('.g-registration-verify')).not.toHaveTextContent('本人確認ができました。');
    await user.click(screen.getByRole('button', { name: 'この方法で本人確認をする' }));
    await vi.waitFor(() => expect(document.querySelector('.g-registration-verify')).toHaveTextContent('本人確認ができました。'));
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(await screen.findByRole('heading', { level: 1, name: '入力内容の確認' })).toBeInTheDocument();
  });

  const SECURITIES = {
    ...emptyRegistrationValues(),
    name: NAME,
    birthDate: ADULT,
    phone: '09012345678',
    address: ADDRESS,
    occupation: 'employee' as const,
    purposes: ['longTerm'],
    investment: { experience: { stocks: 'gte5' as const, funds: '1to5' as const, bonds: 'none' as const, derivatives: 'none' as const, crypto: 'lt1' as const }, objective: 'balanced' as const, income: '5to7' as const, assets: '10to30' as const },
    peps: 'no' as Answer,
    taxResidency: { residency: 'japan' as const, countries: [] },
    usPerson: { answer: 'no' as Answer, tin: '', consent: false },
    insider: { answer: 'no' as Answer, company: '' },
    antiSocial: true,
    myNumber: '123456789018',
    identity: 'jpki' as const,
  };

  it('証券の確認の画面は、マイナンバーを下 4 桁だけ見せ、答えを選んだ言葉で並べる', async () => {
    const user = userEvent.setup();
    // 前に保存した最後の手順から続け、そのまま確認の画面へ
    render(<RegistrationPresetPage preset="securities" defaultStep="identity" defaultValues={SECURITIES} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '次へ' }));
    await screen.findByRole('heading', { level: 1, name: '入力内容の確認' });
    const review = document.querySelector('.g-wizard')?.textContent ?? '';
    expect(review).toContain('••••••••9018');
    expect(review).not.toContain('123456789018');
    expect(review).toContain('佐藤 花（サトウ ハナ）');
    expect(review).toContain(`${String(thisYear - 30)}年4月1日`);
    expect(review).toContain('株式 5 年以上、投資信託 1〜5 年');
    expect(review).toContain('中長期の資産運用');
    expect(review).toContain('安定と値上がりの両方をねらいたい');
    expect(review).toContain('マイナンバーカードの電子証明書');
  });

  it('英語の文言では、直す所の文がラベル（固有名詞）を崩さず、確認の画面の補足と並びも英語の書き方になる', async () => {
    const user = userEvent.setup();
    render(
      <GassanProvider labels={englishLabels}>
        <RegistrationPresetPage preset="securities" defaultStep="myNumber" defaultValues={{ ...SECURITIES, myNumber: '' }} onSubmit={vi.fn()} />
      </GassanProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Fill in “My Number (Individual Number)”');
    await user.type(screen.getByRole('textbox', { name: /My Number/ }), '123456789018');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { level: 1, name: 'Review your details' });
    const review = document.querySelector('.g-wizard')?.textContent ?? '';
    expect(review).toContain('佐藤 花 (サトウ ハナ)');
    expect(review).toContain(`April 1, ${String(thisYear - 30)}`);
    expect(review).toContain('Stocks 5 years or more, Mutual funds 1–5 years');
  });
});

describe('D-11 登録の欄と業種ごとの登録の data-*', () => {
  it('欄の部品と業種ごとの登録は、data-* を外側の要素へ渡す', () => {
    const noop = vi.fn();
    const cases = [
      <OccupationField key="a" data-testid="t" value="" onValueChange={noop} />,
      <PurposeField key="b" data-testid="t" kind="card" value={[]} onValueChange={noop} />,
      <PepsField key="c" data-testid="t" value={null} onValueChange={noop} />,
      <UsPersonField key="d" data-testid="t" value={{ answer: null, tin: '', consent: false }} onValueChange={noop} />,
      <TaxResidencyField key="e" data-testid="t" value={{ residency: null, countries: [] }} onValueChange={noop} />,
      <DeclarationField key="f" data-testid="t" checked={false} onCheckedChange={noop}>
        確約します
      </DeclarationField>,
      <MyNumberField key="g" data-testid="t" value="" onValueChange={noop} />,
      <CompanyFields key="h" data-testid="t" value={{ name: '', corporateNumber: '', department: '', position: '', employees: '' }} onValueChange={noop} />,
      <IdentityMethodField key="i" data-testid="t" regime="aml" value={null} onValueChange={noop} />,
      <GuardianFields key="j" data-testid="t" value={{ name: '', relationship: '', email: '', consent: false }} onValueChange={noop} />,
      <MarketingConsentField key="k" data-testid="t" checked={false} onCheckedChange={noop} />,
      <RegistrationPresetPage key="l" data-testid="t" preset="ec" onSubmit={noop} />,
    ];
    for (const node of cases) {
      const { unmount } = render(node);
      expect(screen.getAllByTestId('t')).toHaveLength(1);
      unmount();
    }
  });
});
