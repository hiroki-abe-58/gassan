import { useRef, useState, type ReactNode } from 'react';

import { AddressFields, type JapaneseAddress, type PostalAddress } from '../address-fields';
import { BankAccountFields, type BankAccount } from '../bank-account-fields';
import { BirthDateInput } from '../birth-date-input';
import { Button } from '../button';
import { ModalCheckbox, ModalRadioGroup } from '../choices';
import { ModalEmailInput } from '../email-input';
import { ModalField, ModalFieldset } from '../fields';
import { ModalInput, ModalTextarea } from '../inputs';
import { useControllable } from '../internal/controllable';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { ageOn, isCorporateNumber, isMyNumber, isPhoneNumber, normalizePhone, PREFECTURES, YUCHO_BANK_CODE } from '../japanese';
import { NameFields, type PersonName } from '../name-fields';
import { ModalNativeSelect } from '../native-select';
import { usePhrase } from '../phrase';
import type { SelectOption } from '../select';
import { FormError, formatDate, looksLikeEmail, runAction, type SubmitResult } from './form';
import { RegistrationWizardPage, type RegistrationStep } from './registration';
import {
  AnswerField,
  CompanyFields,
  DeclarationField,
  GuardianFields,
  IdentityMethodField,
  MarketingConsentField,
  MyNumberField,
  OccupationField,
  PepsField,
  PurposeField,
  TaxResidencyField,
  UsPersonField,
  type Answer,
  type CompanyInfo,
  type GuardianConsent,
  type TaxResidency,
  type UsPerson,
} from './registration-fields';
import {
  ASSET_BANDS,
  BORROWING_BANDS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  GENDERS,
  INCOME_BANDS,
  INVESTMENT_OBJECTIVES,
  INVESTMENT_PRODUCTS,
  OCCUPANT_COUNTS,
  RELATIONSHIPS,
  TENURE_BANDS,
  useRegistrationLabels,
  type AssetBand,
  type BorrowingBand,
  type EmploymentType,
  type ExperienceLevel,
  type Gender,
  type IdentityMethod,
  type IncomeBand,
  type InvestmentObjective,
  type InvestmentProduct,
  type Occupation,
  type OccupantCount,
  type RegistrationLabels,
  type RegistrationPresetId,
  type RegistrationStepId,
  type Relationship,
  type TenureBand,
} from './registration-labels';
import { REGISTRATION_PRESETS, type RegistrationFieldKey, type RegistrationPreset, type RegistrationPresetStep } from './registration-presets';
import { useSite } from './site';

/* -------------------------------------------------------------------------- */
/* 値                                                                          */
/* -------------------------------------------------------------------------- */

export interface InvestmentProfile {
  experience: Partial<Record<InvestmentProduct, ExperienceLevel>>;
  objective: InvestmentObjective | '';
  income: IncomeBand | '';
  assets: AssetBand | '';
}

export interface Employment {
  employerName: string;
  employerPhone: string;
  type: EmploymentType | '';
  tenure: TenureBand | '';
  income: IncomeBand | '';
}

export interface Occupancy {
  occupants: OccupantCount | '';
  guarantee: 'company' | 'person' | null;
  guarantorName: string;
  guarantorRelationship: Relationship | '';
  guarantorPhone: string;
}

export interface EmergencyContact {
  name: string;
  relationship: Relationship | '';
  phone: string;
}

/** 業種ごとの登録の値。プリセットが使わない欄は、初めの値のまま残る。 */
export interface RegistrationValues {
  name: PersonName;
  /** YYYY-MM-DD。 */
  birthDate: string | null;
  /** 数字だけ。 */
  phone: string;
  address: JapaneseAddress;
  gender: Gender | '';
  nickname: string;
  prefecture: string;
  occupation: Occupation | '';
  employer: string;
  purposes: string[];
  peps: Answer | null;
  taxResidency: TaxResidency;
  usPerson: UsPerson;
  insider: { answer: Answer | null; company: string };
  antiSocial: boolean;
  myNumber: string;
  myNumberAccount: Answer | null;
  investment: InvestmentProfile;
  employment: Employment;
  borrowings: BorrowingBand | '';
  occupancy: Occupancy;
  emergency: EmergencyContact;
  medical: { history: string; medications: string; allergies: string };
  single: boolean;
  career: { education: string; workHistory: string; licenses: string; gender: string };
  scout: boolean;
  attendee: { name: string; email: string };
  company: CompanyInfo;
  bankAccount: BankAccount;
  identity: IdentityMethod | null;
  /** 本人確認が済んだか（onVerifyIdentity が error を返さなかった）。 */
  identityVerified: boolean;
  guardian: GuardianConsent;
  marketing: boolean;
}

/** 空の値。defaultValues で一部を上書きできる。 */
export function emptyRegistrationValues(): RegistrationValues {
  return {
    name: { familyName: '', givenName: '', familyNameKana: '', givenNameKana: '' },
    birthDate: null,
    phone: '',
    address: { postalCode: '', prefecture: '', city: '', line1: '', line2: '' },
    gender: '',
    nickname: '',
    prefecture: '',
    occupation: '',
    employer: '',
    purposes: [],
    peps: null,
    taxResidency: { residency: null, countries: [] },
    usPerson: { answer: null, tin: '', consent: false },
    insider: { answer: null, company: '' },
    antiSocial: false,
    myNumber: '',
    myNumberAccount: null,
    investment: { experience: {}, objective: '', income: '', assets: '' },
    employment: { employerName: '', employerPhone: '', type: '', tenure: '', income: '' },
    borrowings: '',
    occupancy: { occupants: '', guarantee: null, guarantorName: '', guarantorRelationship: '', guarantorPhone: '' },
    emergency: { name: '', relationship: '', phone: '' },
    medical: { history: '', medications: '', allergies: '' },
    single: false,
    career: { education: '', workHistory: '', licenses: '', gender: '' },
    scout: false,
    attendee: { name: '', email: '' },
    company: { name: '', corporateNumber: '', department: '', position: '', employees: '' },
    bankAccount: { bankCode: '', branchCode: '', accountType: 'ordinary', accountNumber: '', accountHolder: '', yuchoSymbol: '', yuchoNumber: '' },
    identity: null,
    identityVerified: false,
    guardian: { name: '', relationship: '', email: '', consent: false },
    marketing: false,
  };
}

/** 生年月日（YYYY-MM-DD）から満年齢。無ければ null。 */
function ageOf(birthDate: string | null, on?: Date): number | null {
  const match = birthDate ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate) : null;
  if (!match) return null;
  return ageOn({ year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }, on);
}

/** 未成年なら、生年月日のある手順の後に保護者の同意の手順を足す。 */
function stepsFor(preset: RegistrationPreset, age: number | null): readonly RegistrationPresetStep[] {
  if (preset.guardianUnder === undefined || age === null || age >= preset.guardianUnder) return preset.steps;
  const at = preset.steps.findIndex((step) => step.fields.includes('birthDate'));
  const guardian: RegistrationPresetStep = { id: 'guardian', fields: ['guardian'] };
  return [...preset.steps.slice(0, at + 1), guardian, ...preset.steps.slice(at + 1)];
}

/* -------------------------------------------------------------------------- */
/* 確かめる                                                                    */
/* -------------------------------------------------------------------------- */

type Errors = Record<string, string>;

/** 欄ごとの直す所。キーは欄（'name'）か、欄の中の部分（'usPerson.tin'）。 */
function check(key: RegistrationFieldKey, v: RegistrationValues, required: boolean, preset: RegistrationPreset, r: RegistrationLabels, invalidPhone: string, invalidEmail: string, verify: boolean): Errors {
  const e: Errors = {};
  const phone = (value: string, at: string, label: string, needed: boolean): void => {
    if (!value) {
      if (needed) e[at] = r.required(label);
    } else if (!isPhoneNumber(value)) e[at] = invalidPhone;
  };
  switch (key) {
    case 'name':
      if (!required) break;
      if (!v.name.familyName.trim()) e['name.familyName'] = r.required(r.name);
      if (!v.name.givenName.trim()) e['name.givenName'] = r.required(r.name);
      break;
    case 'birthDate': {
      if (!v.birthDate) {
        if (required) e.birthDate = r.chooseRequired(r.birthDate);
        break;
      }
      const age = ageOf(v.birthDate);
      if (preset.minAge !== undefined && age !== null && age < preset.minAge) e.birthDate = r.underAge(preset.minAge);
      break;
    }
    case 'phone':
      phone(v.phone, 'phone', r.phone, required);
      break;
    case 'address':
      if (!required) break;
      if (!v.address.postalCode) e['address.postalCode'] = r.required(r.address);
      if (!v.address.prefecture) e['address.prefecture'] = r.required(r.address);
      if (!v.address.city.trim()) e['address.city'] = r.required(r.address);
      if (!v.address.line1.trim()) e['address.line1'] = r.required(r.address);
      break;
    case 'gender':
      if (required && !v.gender) e.gender = r.chooseRequired(r.gender);
      break;
    case 'nickname':
      if (required && !v.nickname.trim()) e.nickname = r.required(r.nickname);
      break;
    case 'prefecture':
      if (required && !v.prefecture) e.prefecture = r.chooseRequired(r.prefecture);
      break;
    case 'occupation':
      if (required && !v.occupation) e.occupation = r.chooseRequired(r.occupation.label);
      break;
    case 'employer':
      if (required && !v.employer.trim()) e.employer = r.required(r.employer);
      break;
    case 'purposes':
      if (required && v.purposes.length === 0) e.purposes = r.chooseRequired(r.purposes.label);
      break;
    case 'peps':
      if (required && !v.peps) e.peps = r.answerRequired;
      break;
    case 'taxResidency':
      if (!v.taxResidency.residency) {
        if (required) e['taxResidency.residency'] = r.answerRequired;
      } else if (v.taxResidency.residency === 'other' && !v.taxResidency.countries.some((entry) => entry.country.trim())) {
        e['taxResidency.countries'] = r.taxResidency.countryRequired;
      }
      break;
    case 'usPerson':
      if (!v.usPerson.answer) {
        if (required) e['usPerson.answer'] = r.answerRequired;
      } else if (v.usPerson.answer === 'yes') {
        if (!v.usPerson.tin) e['usPerson.tin'] = r.required(r.usPerson.tin);
        if (!v.usPerson.consent) e['usPerson.consent'] = r.usPerson.consentRequired;
      }
      break;
    case 'insider':
      if (!v.insider.answer) {
        if (required) e['insider.answer'] = r.answerRequired;
      } else if (v.insider.answer === 'yes' && !v.insider.company.trim()) e['insider.company'] = r.required(r.insider.company);
      break;
    case 'antiSocial':
      if (required && !v.antiSocial) e.antiSocial = r.antiSocial.required;
      break;
    case 'myNumber':
      if (!v.myNumber) {
        if (required) e.myNumber = r.required(r.myNumber.label);
      } else if (!isMyNumber(v.myNumber)) e.myNumber = r.myNumber.invalid;
      break;
    case 'myNumberAccount':
      if (required && !v.myNumberAccount) e.myNumberAccount = r.answerRequired;
      break;
    case 'investment':
      if (!required) break;
      for (const product of INVESTMENT_PRODUCTS) {
        if (!v.investment.experience[product]) e[`investment.${product}`] = r.chooseRequired(r.investment.products[product]);
      }
      if (!v.investment.objective) e['investment.objective'] = r.chooseRequired(r.investment.objective);
      if (!v.investment.income) e['investment.income'] = r.chooseRequired(r.investment.income);
      if (!v.investment.assets) e['investment.assets'] = r.chooseRequired(r.investment.assets);
      break;
    case 'employment':
      if (!required) break;
      if (!v.employment.employerName.trim()) e['employment.employerName'] = r.required(r.employment.employerName);
      phone(v.employment.employerPhone, 'employment.employerPhone', r.employment.employerPhone, false);
      if (!v.employment.type) e['employment.type'] = r.chooseRequired(r.employment.type);
      if (!v.employment.tenure) e['employment.tenure'] = r.chooseRequired(r.employment.tenure);
      if (!v.employment.income) e['employment.income'] = r.chooseRequired(r.investment.income);
      break;
    case 'borrowings':
      if (required && !v.borrowings) e.borrowings = r.chooseRequired(r.employment.borrowings);
      break;
    case 'occupancy':
      if (!required) break;
      if (!v.occupancy.occupants) e['occupancy.occupants'] = r.chooseRequired(r.occupancy.occupants);
      if (!v.occupancy.guarantee) e['occupancy.guarantee'] = r.chooseRequired(r.occupancy.guarantee);
      if (v.occupancy.guarantee === 'person') {
        if (!v.occupancy.guarantorName.trim()) e['occupancy.guarantorName'] = r.required(r.occupancy.guarantorName);
        if (!v.occupancy.guarantorRelationship) e['occupancy.guarantorRelationship'] = r.chooseRequired(r.occupancy.guarantorRelationship);
        phone(v.occupancy.guarantorPhone, 'occupancy.guarantorPhone', r.occupancy.guarantorPhone, true);
      }
      break;
    case 'emergency':
      if (!required) break;
      if (!v.emergency.name.trim()) e['emergency.name'] = r.required(r.emergency.name);
      if (!v.emergency.relationship) e['emergency.relationship'] = r.chooseRequired(r.emergency.relationship);
      phone(v.emergency.phone, 'emergency.phone', r.emergency.phone, true);
      break;
    case 'single':
      if (required && !v.single) e.single = r.matching.singleRequired;
      break;
    case 'career':
      if (required && !v.career.education.trim()) e['career.education'] = r.required(r.recruiting.education);
      break;
    case 'attendee':
      if (!required) break;
      if (!v.attendee.name.trim()) e['attendee.name'] = r.required(r.ticket.attendee);
      if (!v.attendee.email.trim()) e['attendee.email'] = r.required(r.ticket.contact);
      else if (!looksLikeEmail(v.attendee.email)) e['attendee.email'] = invalidEmail;
      break;
    case 'company':
      if (required && !v.company.name.trim()) e['company.name'] = r.required(r.company.name);
      if (v.company.corporateNumber && !isCorporateNumber(v.company.corporateNumber)) e['company.corporateNumber'] = r.company.invalidCorporateNumber;
      break;
    case 'bankAccount': {
      if (!required) break;
      const account = v.bankAccount;
      const missing = r.required(r.bankAccount);
      if (!account.bankCode) e['bankAccount.bank'] = missing;
      else if (account.bankCode === YUCHO_BANK_CODE) {
        if (!account.yuchoSymbol) e['bankAccount.yuchoSymbol'] = missing;
        if (!account.yuchoNumber) e['bankAccount.yuchoNumber'] = missing;
      } else {
        if (!account.branchCode) e['bankAccount.branch'] = missing;
        if (account.accountNumber.length !== 7) e['bankAccount.accountNumber'] = missing;
      }
      if (account.bankCode && !account.accountHolder.trim()) e['bankAccount.accountHolder'] = missing;
      break;
    }
    case 'identity':
      if (!v.identity) e.identity = r.chooseRequired(r.identity.label);
      else if (verify && !v.identityVerified) e.identity = r.identity.verifyRequired;
      break;
    case 'guardian':
      if (!v.guardian.name.trim()) e['guardian.name'] = r.required(r.guardian.name);
      if (!v.guardian.relationship) e['guardian.relationship'] = r.chooseRequired(r.guardian.relationship);
      if (!v.guardian.email.trim()) e['guardian.email'] = r.required(r.guardian.email);
      else if (!looksLikeEmail(v.guardian.email)) e['guardian.email'] = invalidEmail;
      if (!v.guardian.consent) e['guardian.consent'] = r.guardian.consentRequired;
      break;
    case 'medical':
    case 'scout':
    case 'marketing':
      break;
  }
  return e;
}

/** e の中の、prefix（'usPerson'）で始まる部分を、部分の名前（'tin'）のキーで返す。 */
function partsOf(e: Errors, prefix: string): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const [key, message] of Object.entries(e)) {
    if (key.startsWith(`${prefix}.`)) parts[key.slice(prefix.length + 1)] = message;
  }
  return parts;
}

/** 選択肢のキーと、その名前の表から、select の選択肢。 */
function optionsOf<T extends string>(keys: readonly T[], names: Record<T, string>): { value: T; label: string }[] {
  return keys.map((key) => ({ value: key, label: names[key] }));
}

interface FieldOptions {
  required?: boolean;
  error?: string;
  help?: string;
  autoComplete?: string;
}

/* -------------------------------------------------------------------------- */
/* RegistrationPresetPage                                                      */
/* -------------------------------------------------------------------------- */

export interface RegistrationPresetPageProps extends DataAttributes {
  /** 業種（REGISTRATION_PRESETS のキー）か、手順を自分で組んだプリセット。 */
  preset: RegistrationPresetId | RegistrationPreset;
  /** 値（渡すと制御になる）。 */
  values?: RegistrationValues;
  /** 初めの値（前に保存した所から続けるときなど）。 */
  defaultValues?: Partial<RegistrationValues>;
  onValuesChange?: (values: RegistrationValues) => void;
  /** 確認の画面で「登録する」を押したとき。失敗なら { error }。 */
  onSubmit: (values: RegistrationValues) => SubmitResult | Promise<SubmitResult>;
  /** 手順を動かすたびに保存する。失敗なら { error }（手順を動かさずに理由を読む）。 */
  onSave?: (values: RegistrationValues, stepId: string) => SubmitResult | Promise<SubmitResult>;
  /** 渡すと「保存してあとで続ける」を出す（保存した後に呼ぶ）。 */
  onSaveAndExit?: (stepId: string) => void;
  onStepChange?: (stepId: string) => void;
  defaultStep?: string;
  /**
   * 本人確認を始める（利用側の本人確認のサービスを呼ぶ）。error を返さなければ確認済みにする。
   * 渡さなければ、本人確認の手順は方法を選ぶだけ（確かめるのは登録の後）。
   */
  onVerifyIdentity?: (method: IdentityMethod, values: RegistrationValues) => SubmitResult | Promise<SubmitResult>;
  /** 本人確認で出す方法（自社の本人確認のサービスが対応するもの）。 */
  identityMethods?: readonly IdentityMethod[];
  /** 郵便番号から住所を引く（AddressFields の lookup）。 */
  lookupAddress?: (postalCode: string) => Promise<readonly PostalAddress[]>;
  /** 法人番号から会社名を引く（CompanyFields の lookup）。 */
  lookupCompany?: (corporateNumber: string) => Promise<{ name: string } | null>;
  /** お振込先の金融機関の候補と、金融機関ごとの支店の候補（買取）。 */
  banks?: readonly SelectOption[];
  branchesOf?: (bankCode: string) => readonly SelectOption[];
  /** 送る前に確認の画面を出す。既定 true。 */
  review?: boolean;
  /** 登録が済んだ画面に置くもの。 */
  done?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/**
 * 業種ごとの本登録の手順。P-31。
 *
 * 仮登録（メールアドレスだけ。QuickSignUpPage）の後、取引の前までに法令が求める項目を、業種ごとの手順と順番で聞く
 * （REGISTRATION_PRESETS。銀行・証券・暗号資産・送金・カード・通販・酒類・法人向け・買取・オンライン診療・マッチング・
 * 求人・賃貸・チケット・携帯電話）。手順の説明に、なぜ聞くか（根拠の法令）を書く。未成年なら保護者の同意の手順を足し、
 * 年齢の下限に届かなければ進めない。値はここで持ち、保存（onSave）と登録（onSubmit）に丸ごと渡す。
 * 手順・保存・続き・確認の画面は RegistrationWizardPage（P-25）と同じ。法令の要件は 2026-10 時点の目安。
 */
export function RegistrationPresetPage({
  preset: presetProp,
  values: valuesProp,
  defaultValues,
  onValuesChange,
  onSubmit,
  onSave,
  onSaveAndExit,
  onStepChange,
  defaultStep,
  onVerifyIdentity,
  identityMethods: methods,
  lookupAddress,
  lookupCompany,
  banks = [],
  branchesOf,
  review = true,
  done,
  aside,
  className,
  ...rest
}: RegistrationPresetPageProps): ReactNode {
  const r = useRegistrationLabels();
  const { labels: t } = useSite();
  const phrase = usePhrase();
  const preset = typeof presetProp === 'string' ? REGISTRATION_PRESETS[presetProp] : presetProp;
  const [initial] = useState<RegistrationValues>(() => ({ ...emptyRegistrationValues(), ...defaultValues }));
  const [values, setValues] = useControllable<RegistrationValues>(valuesProp, initial, onValuesChange);
  // 送ろうとして止まった手順。そこから先は、直す所を欄の下に出し続ける（直したら消える）
  const [shown, setShown] = useState<ReadonlySet<string>>(() => new Set());
  const [verifyError, setVerifyError] = useState<ReactNode>(null);
  // 非同期の結果（本人確認・会社名の補い）を、その間に変わった値に重ねるため
  const latest = useRef(values);
  latest.current = values;
  const update = (patch: Partial<RegistrationValues>): void => {
    latest.current = { ...latest.current, ...patch };
    setValues(latest.current);
  };

  const verify = onVerifyIdentity !== undefined;
  const errorsOf = (step: RegistrationPresetStep): Errors => {
    const optional = new Set(step.optional ?? []);
    return Object.assign(
      {},
      ...step.fields.map((key) => check(key, values, !optional.has(key), preset, r, t.phoneSignIn.invalidPhone, t.common.invalidEmail, verify)),
    ) as Errors;
  };

  /** 選んだ答えの名前。選んでいなければ「未回答」。 */
  const nameOf = <T extends string>(value: T | '' | null | undefined, names: Record<T, string>): string => (value ? names[value] : r.notAnswered);
  const orNot = (text: string): string => text.trim() || r.notAnswered;
  /** 補足（続柄・フリガナなど）があれば添える。 */
  const withNote = (text: string, note: string): string => (note ? r.note(text, note) : text);

  /** 選ぶ欄（ネイティブの select）。name は欄の name と React の key を兼ねる。 */
  const choice = <T extends string>(
    name: string,
    label: string,
    options: readonly { value: T; label: string }[],
    value: T | '',
    onChange: (value: T | '') => void,
    { required, error, help, autoComplete }: FieldOptions = {},
  ): ReactNode => (
    <ModalField key={name} label={label} help={help} required={required} error={error}>
      {(control) => (
        <ModalNativeSelect
          {...control}
          name={name}
          autoComplete={autoComplete}
          placeholder={r.choose}
          options={options}
          value={value}
          onChange={(event) => onChange(event.target.value as T | '')}
        />
      )}
    </ModalField>
  );

  /** 1 行の欄。tel は数字だけにそろえる。name は欄の name と React の key を兼ねる。 */
  const text = (name: string, label: string, value: string, onChange: (value: string) => void, { required, error, autoComplete, type }: FieldOptions & { type?: 'tel' } = {}): ReactNode => (
    <ModalField key={name} label={label} required={required} error={error}>
      {(control) => (
        <ModalInput {...control} type={type} name={name} autoComplete={autoComplete} normalize={type === 'tel' ? normalizePhone : undefined} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </ModalField>
  );

  /** 何行か書ける任意の欄（これまでの病気・職歴など）。 */
  const notes = (name: string, label: string, value: string, onChange: (value: string) => void, rows = 3): ReactNode => (
    <ModalField key={name} label={label}>
      {(control) => <ModalTextarea {...control} name={name} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />}
    </ModalField>
  );

  /** 欄を描く。e はこの手順の直す所（出すときだけ中身がある）。 */
  const field = (key: RegistrationFieldKey, required: boolean, e: Errors): ReactNode => {
    const v = values;
    switch (key) {
      case 'name':
        return <NameFields key={key} label={r.name} required={required} value={v.name} onValueChange={(name) => update({ name })} errors={partsOf(e, 'name')} />;
      case 'birthDate':
        return (
          <BirthDateInput
            key={key}
            label={r.birthDate}
            required={required}
            minAge={preset.minAge}
            value={v.birthDate}
            onValueChange={(birthDate) => update({ birthDate })}
            error={e.birthDate}
          />
        );
      case 'phone':
        return text('tel', r.phone, v.phone, (phone) => update({ phone }), { required, error: e.phone, autoComplete: 'tel', type: 'tel' });
      case 'address':
        return <AddressFields key={key} label={r.address} required={required} lookup={lookupAddress} value={v.address} onValueChange={(address) => update({ address })} errors={partsOf(e, 'address')} />;
      case 'gender': {
        // 必須なら「回答しない」は出さない
        const genders = required ? GENDERS.filter((gender) => gender !== 'unanswered') : GENDERS;
        return choice('sex', r.gender, optionsOf(genders, r.genders), v.gender, (gender) => update({ gender }), { required, error: e.gender, autoComplete: 'sex' });
      }
      case 'nickname':
        return text('nickname', r.nickname, v.nickname, (nickname) => update({ nickname }), { required, error: e.nickname, autoComplete: 'nickname' });
      case 'prefecture':
        return choice(
          'address-level1',
          r.prefecture,
          PREFECTURES.map((name) => ({ value: name, label: name })),
          v.prefecture,
          (prefecture) => update({ prefecture }),
          { required, error: e.prefecture, autoComplete: 'address-level1' },
        );
      case 'occupation':
        return <OccupationField key={key} required={required} value={v.occupation} onValueChange={(occupation) => update({ occupation })} error={e.occupation} />;
      case 'employer':
        return text('organization', r.employer, v.employer, (employer) => update({ employer }), { required, error: e.employer, autoComplete: 'organization' });
      case 'purposes':
        return <PurposeField key={key} kind={preset.purposes ?? 'deposit'} required={required} value={v.purposes} onValueChange={(purposes) => update({ purposes })} error={e.purposes} />;
      case 'peps':
        return <PepsField key={key} required={required} value={v.peps} onValueChange={(peps) => update({ peps })} error={e.peps} />;
      case 'taxResidency': {
        const parts = partsOf(e, 'taxResidency');
        return <TaxResidencyField key={key} required={required} value={v.taxResidency} onValueChange={(taxResidency) => update({ taxResidency })} errors={{ residency: parts.residency, countries: parts.countries }} />;
      }
      case 'usPerson':
        return <UsPersonField key={key} required={required} value={v.usPerson} onValueChange={(usPerson) => update({ usPerson })} errors={partsOf(e, 'usPerson')} />;
      case 'insider':
        return (
          <div key={key} className="g-registration-group">
            <AnswerField
              name="insider"
              legend={r.insider.label}
              help={r.insider.help}
              options={r.insider.options}
              value={v.insider.answer}
              onValueChange={(answer) => update({ insider: { ...v.insider, answer } })}
              error={e['insider.answer']}
              required={required}
            />
            {v.insider.answer === 'yes'
              ? text('insider-company', r.insider.company, v.insider.company, (company) => update({ insider: { ...v.insider, company } }), { required: true, error: e['insider.company'] })
              : null}
          </div>
        );
      case 'antiSocial':
        return (
          <DeclarationField
            key={key}
            name="anti-social"
            checked={v.antiSocial}
            onCheckedChange={(antiSocial) => update({ antiSocial })}
            detailsTitle={r.antiSocial.definitionTitle}
            details={r.antiSocial.definition}
            error={e.antiSocial}
          >
            {r.antiSocial.label}
          </DeclarationField>
        );
      case 'myNumber':
        return <MyNumberField key={key} required={required} value={v.myNumber} onValueChange={(myNumber) => update({ myNumber })} error={e.myNumber} />;
      case 'myNumberAccount':
        return (
          <AnswerField
            key={key}
            name="my-number-account"
            legend={r.myNumberAccount.label}
            help={r.myNumberAccount.help}
            options={r.myNumberAccount.options}
            value={v.myNumberAccount}
            onValueChange={(myNumberAccount) => update({ myNumberAccount })}
            error={e.myNumberAccount}
            required={required}
          />
        );
      case 'investment': {
        const i = v.investment;
        const set = (patch: Partial<InvestmentProfile>): void => update({ investment: { ...i, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            <ModalFieldset label={r.investment.experience} help={r.investment.experienceHelp} required={required}>
              <div className="g-registration-grid">
                {INVESTMENT_PRODUCTS.map((product) =>
                  choice(
                    `experience-${product}`,
                    r.investment.products[product],
                    optionsOf(EXPERIENCE_LEVELS, r.investment.levels),
                    i.experience[product] ?? '',
                    (level) => set({ experience: { ...i.experience, [product]: level || undefined } }),
                    { required, error: e[`investment.${product}`] },
                  ),
                )}
              </div>
            </ModalFieldset>
            <ModalFieldset label={r.investment.objective} required={required} error={e['investment.objective']}>
              <ModalRadioGroup
                name="objective"
                value={i.objective || null}
                onValueChange={(objective) => set({ objective: objective as InvestmentObjective })}
                options={optionsOf(INVESTMENT_OBJECTIVES, r.investment.objectives)}
              />
            </ModalFieldset>
            <div className="g-registration-pair">
              {choice('income', r.investment.income, optionsOf(INCOME_BANDS, r.investment.incomeBands), i.income, (income) => set({ income }), { required, error: e['investment.income'] })}
              {choice('assets', r.investment.assets, optionsOf(ASSET_BANDS, r.investment.assetBands), i.assets, (assets) => set({ assets }), {
                required,
                error: e['investment.assets'],
                help: r.investment.assetsHelp,
              })}
            </div>
          </div>
        );
      }
      case 'employment': {
        const w = v.employment;
        const set = (patch: Partial<Employment>): void => update({ employment: { ...w, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {text('organization', r.employment.employerName, w.employerName, (employerName) => set({ employerName }), {
              required,
              error: e['employment.employerName'],
              autoComplete: 'organization',
            })}
            {text('employer-tel', r.employment.employerPhone, w.employerPhone, (employerPhone) => set({ employerPhone }), {
              error: e['employment.employerPhone'],
              autoComplete: 'off',
              type: 'tel',
            })}
            <div className="g-registration-pair">
              {choice('employment-type', r.employment.type, optionsOf(EMPLOYMENT_TYPES, r.employment.types), w.type, (type) => set({ type }), { required, error: e['employment.type'] })}
              {choice('tenure', r.employment.tenure, optionsOf(TENURE_BANDS, r.employment.tenureBands), w.tenure, (tenure) => set({ tenure }), { required, error: e['employment.tenure'] })}
            </div>
            {choice('income', r.investment.income, optionsOf(INCOME_BANDS, r.investment.incomeBands), w.income, (income) => set({ income }), { required, error: e['employment.income'] })}
          </div>
        );
      }
      case 'borrowings':
        return choice('borrowings', r.employment.borrowings, optionsOf(BORROWING_BANDS, r.employment.borrowingBands), v.borrowings, (borrowings) => update({ borrowings }), {
          required,
          error: e.borrowings,
          help: r.employment.borrowingsHelp,
        });
      case 'occupancy': {
        const o = v.occupancy;
        const set = (patch: Partial<Occupancy>): void => update({ occupancy: { ...o, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {choice('occupants', r.occupancy.occupants, optionsOf(OCCUPANT_COUNTS, r.occupancy.occupantCounts), o.occupants, (occupants) => set({ occupants }), {
              required,
              error: e['occupancy.occupants'],
            })}
            <ModalFieldset label={r.occupancy.guarantee} required={required} error={e['occupancy.guarantee']}>
              <ModalRadioGroup
                name="guarantee"
                value={o.guarantee}
                onValueChange={(guarantee) => set({ guarantee: guarantee === 'person' ? 'person' : 'company' })}
                options={[
                  { value: 'company', label: r.occupancy.guaranteeOptions.company },
                  { value: 'person', label: r.occupancy.guaranteeOptions.person, description: r.occupancy.guaranteeNote },
                ]}
              />
            </ModalFieldset>
            {o.guarantee === 'person' ? (
              <>
                {text('guarantor-name', r.occupancy.guarantorName, o.guarantorName, (guarantorName) => set({ guarantorName }), {
                  required: true,
                  error: e['occupancy.guarantorName'],
                  autoComplete: 'off',
                })}
                <div className="g-registration-pair">
                  {choice(
                    'guarantor-relationship',
                    r.occupancy.guarantorRelationship,
                    optionsOf(RELATIONSHIPS, r.relationships),
                    o.guarantorRelationship,
                    (guarantorRelationship) => set({ guarantorRelationship }),
                    { required: true, error: e['occupancy.guarantorRelationship'] },
                  )}
                  {text('guarantor-tel', r.occupancy.guarantorPhone, o.guarantorPhone, (guarantorPhone) => set({ guarantorPhone }), {
                    required: true,
                    error: e['occupancy.guarantorPhone'],
                    autoComplete: 'off',
                    type: 'tel',
                  })}
                </div>
              </>
            ) : null}
          </div>
        );
      }
      case 'emergency': {
        const c = v.emergency;
        const set = (patch: Partial<EmergencyContact>): void => update({ emergency: { ...c, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {text('emergency-name', r.emergency.name, c.name, (name) => set({ name }), { required, error: e['emergency.name'], autoComplete: 'off' })}
            <div className="g-registration-pair">
              {choice('emergency-relationship', r.emergency.relationship, optionsOf(RELATIONSHIPS, r.relationships), c.relationship, (relationship) => set({ relationship }), {
                required,
                error: e['emergency.relationship'],
              })}
              {text('emergency-tel', r.emergency.phone, c.phone, (phone) => set({ phone }), { required, error: e['emergency.phone'], autoComplete: 'off', type: 'tel' })}
            </div>
          </div>
        );
      }
      case 'medical': {
        const m = v.medical;
        const set = (patch: Partial<RegistrationValues['medical']>): void => update({ medical: { ...m, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {notes('history', r.medical.history, m.history, (history) => set({ history }))}
            {notes('medications', r.medical.medications, m.medications, (medications) => set({ medications }))}
            {text('allergies', r.medical.allergies, m.allergies, (allergies) => set({ allergies }))}
          </div>
        );
      }
      case 'single':
        return (
          <DeclarationField key={key} name="single" checked={v.single} onCheckedChange={(single) => update({ single })} error={e.single}>
            {r.matching.single}
          </DeclarationField>
        );
      case 'career': {
        const c = v.career;
        const set = (patch: Partial<RegistrationValues['career']>): void => update({ career: { ...c, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {text('education', r.recruiting.education, c.education, (education) => set({ education }), { required, error: e['career.education'] })}
            {notes('work-history', r.recruiting.workHistory, c.workHistory, (workHistory) => set({ workHistory }), 4)}
            {text('licenses', r.recruiting.licenses, c.licenses, (licenses) => set({ licenses }))}
            {text('gender', r.recruiting.gender, c.gender, (gender) => set({ gender }), { autoComplete: 'off' })}
          </div>
        );
      }
      case 'scout':
        return (
          <ModalCheckbox key={key} name="scout" checked={v.scout} onCheckedChange={(scout) => update({ scout })} description={r.recruiting.scoutDescription}>
            {r.recruiting.scout}
          </ModalCheckbox>
        );
      case 'attendee': {
        const a = v.attendee;
        const set = (patch: Partial<RegistrationValues['attendee']>): void => update({ attendee: { ...a, ...patch } });
        return (
          <div key={key} className="g-registration-group">
            {text('name', r.ticket.attendee, a.name, (name) => set({ name }), { required, error: e['attendee.name'], autoComplete: 'name' })}
            <ModalField label={r.ticket.contact} required={required} error={e['attendee.email']}>
              {(control) => <ModalEmailInput {...control} name="email" carrierNotice={false} value={a.email} onChange={(event) => set({ email: event.target.value })} />}
            </ModalField>
            <p className="g-registration-note">{phrase(r.ticket.transferNotice)}</p>
          </div>
        );
      }
      case 'company':
        return (
          <CompanyFields
            key={key}
            value={v.company}
            onValueChange={(company) => update({ company })}
            lookup={lookupCompany}
            required={required ? ['name'] : []}
            errors={partsOf(e, 'company')}
          />
        );
      case 'bankAccount':
        return (
          <BankAccountFields
            key={key}
            label={r.bankAccount}
            required={required}
            banks={banks}
            branches={branchesOf ? branchesOf(v.bankAccount.bankCode) : []}
            value={v.bankAccount}
            onValueChange={(bankAccount) => update({ bankAccount })}
            errors={partsOf(e, 'bankAccount')}
          />
        );
      case 'identity':
        return (
          <div key={key} className="g-registration-group">
            {preset.identity === 'matching' ? <p className="g-registration-note">{phrase(r.identity.minorsNotice)}</p> : null}
            <IdentityMethodField
              regime={preset.identity ?? 'aml'}
              methods={methods}
              value={v.identity}
              onValueChange={(identity) => update({ identity, identityVerified: false })}
              error={e.identity}
            />
            {onVerifyIdentity ? (
              <div className="g-registration-verify">
                <FormError>{verifyError}</FormError>
                <Button
                  disabled={v.identity === null}
                  onAction={async () => {
                    const method = latest.current.identity;
                    if (!method) return;
                    setVerifyError(null);
                    const failure = await runAction(() => onVerifyIdentity(method, latest.current), t.common.submitFailed);
                    if (failure) setVerifyError(failure);
                    else update({ identityVerified: true });
                  }}
                >
                  {r.identity.start}
                </Button>
                <p className="g-live" role="status">
                  {v.identityVerified ? phrase(r.identity.verified) : null}
                </p>
              </div>
            ) : null}
          </div>
        );
      case 'guardian':
        return <GuardianFields key={key} value={v.guardian} onValueChange={(guardian) => update({ guardian })} errors={partsOf(e, 'guardian')} />;
      case 'marketing':
        return <MarketingConsentField key={key} checked={v.marketing} onCheckedChange={(marketing) => update({ marketing })} />;
    }
  };

  /** 確認の画面の行。 */
  const summary = (key: RegistrationFieldKey): { label: ReactNode; value: ReactNode }[] => {
    const v = values;
    switch (key) {
      case 'name': {
        const name = [v.name.familyName, v.name.givenName].filter(Boolean).join(' ');
        const kana = [v.name.familyNameKana, v.name.givenNameKana].filter(Boolean).join(' ');
        return [{ label: r.name, value: name ? withNote(name, kana) : r.notAnswered }];
      }
      case 'birthDate':
        return [{ label: r.birthDate, value: v.birthDate ? formatDate(v.birthDate, r.locale).text : r.notAnswered }];
      case 'phone':
        return [{ label: r.phone, value: orNot(v.phone) }];
      case 'address': {
        const a = v.address;
        const text = [a.postalCode ? `〒${a.postalCode}` : '', `${a.prefecture}${a.city}${a.line1}`, a.line2].filter(Boolean).join(' ');
        return [{ label: r.address, value: orNot(text) }];
      }
      case 'gender':
        return [{ label: r.gender, value: nameOf(v.gender, r.genders) }];
      case 'nickname':
        return [{ label: r.nickname, value: orNot(v.nickname) }];
      case 'prefecture':
        return [{ label: r.prefecture, value: orNot(v.prefecture) }];
      case 'occupation':
        return [{ label: r.occupation.label, value: nameOf(v.occupation, r.occupation.options) }];
      case 'employer':
        return [{ label: r.employer, value: orNot(v.employer) }];
      case 'purposes': {
        const names = r.purposes[preset.purposes ?? 'deposit'] as Record<string, string>;
        return [{ label: r.purposes.label, value: v.purposes.length > 0 ? r.list(v.purposes.map((purpose) => names[purpose] ?? purpose)) : r.notAnswered }];
      }
      case 'peps':
        return [{ label: r.peps.label, value: nameOf(v.peps, r.peps.options) }];
      case 'taxResidency': {
        const tax = v.taxResidency;
        const value =
          tax.residency === null
            ? r.notAnswered
            : tax.residency === 'japan'
              ? r.taxResidency.japan
              : r.list(tax.countries.filter((entry) => entry.country.trim()).map((entry) => withNote(entry.country, entry.tin)));
        return [{ label: r.taxResidency.label, value }];
      }
      case 'usPerson':
        return [{ label: r.usPerson.label, value: nameOf(v.usPerson.answer, r.usPerson.options) }];
      case 'insider':
        return [{ label: r.insider.label, value: v.insider.answer === 'yes' ? withNote(r.insider.options.yes, v.insider.company) : nameOf(v.insider.answer, r.insider.options) }];
      case 'antiSocial':
        return [{ label: r.antiSocial.definitionTitle, value: v.antiSocial ? r.yes : r.no }];
      case 'myNumber':
        // 確認の画面でも、下 4 桁だけを見せる
        return [{ label: r.myNumber.label, value: v.myNumber ? `${'•'.repeat(Math.max(v.myNumber.length - 4, 0))}${v.myNumber.slice(-4)}` : r.notAnswered }];
      case 'myNumberAccount':
        return [{ label: r.myNumberAccount.label, value: nameOf(v.myNumberAccount, r.myNumberAccount.options) }];
      case 'investment': {
        const i = v.investment;
        return [
          {
            label: r.investment.experience,
            value: r.list(INVESTMENT_PRODUCTS.map((product) => `${r.investment.products[product]} ${nameOf(i.experience[product], r.investment.levels)}`)),
          },
          { label: r.investment.objective, value: nameOf(i.objective, r.investment.objectives) },
          { label: r.investment.income, value: nameOf(i.income, r.investment.incomeBands) },
          { label: r.investment.assets, value: nameOf(i.assets, r.investment.assetBands) },
        ];
      }
      case 'employment': {
        const w = v.employment;
        return [
          { label: r.employment.employerName, value: orNot(w.employerName) },
          { label: r.employment.employerPhone, value: orNot(w.employerPhone) },
          { label: r.employment.type, value: nameOf(w.type, r.employment.types) },
          { label: r.employment.tenure, value: nameOf(w.tenure, r.employment.tenureBands) },
          { label: r.investment.income, value: nameOf(w.income, r.investment.incomeBands) },
        ];
      }
      case 'borrowings':
        return [{ label: r.employment.borrowings, value: nameOf(v.borrowings, r.employment.borrowingBands) }];
      case 'occupancy': {
        const o = v.occupancy;
        const rows = [
          { label: r.occupancy.occupants, value: nameOf(o.occupants, r.occupancy.occupantCounts) },
          { label: r.occupancy.guarantee, value: nameOf(o.guarantee, r.occupancy.guaranteeOptions) },
        ];
        if (o.guarantee === 'person') {
          const relationship = o.guarantorRelationship ? r.relationships[o.guarantorRelationship] : '';
          rows.push({ label: r.occupancy.guarantorName, value: orNot(`${withNote(o.guarantorName, relationship)} ${o.guarantorPhone}`) });
        }
        return rows;
      }
      case 'emergency': {
        const c = v.emergency;
        const relationship = c.relationship ? r.relationships[c.relationship] : '';
        return [{ label: r.steps.emergency.title, value: orNot(`${withNote(c.name, relationship)} ${c.phone}`) }];
      }
      case 'medical':
        return [
          { label: r.medical.history, value: orNot(v.medical.history) },
          { label: r.medical.medications, value: orNot(v.medical.medications) },
          { label: r.medical.allergies, value: orNot(v.medical.allergies) },
        ];
      case 'single':
        return [{ label: r.matching.single, value: v.single ? r.yes : r.no }];
      case 'career':
        return [
          { label: r.recruiting.education, value: orNot(v.career.education) },
          { label: r.recruiting.workHistory, value: orNot(v.career.workHistory) },
          { label: r.recruiting.licenses, value: orNot(v.career.licenses) },
          { label: r.recruiting.gender, value: orNot(v.career.gender) },
        ];
      case 'scout':
        return [{ label: r.recruiting.scout, value: v.scout ? r.yes : r.no }];
      case 'attendee':
        return [
          { label: r.ticket.attendee, value: orNot(v.attendee.name) },
          { label: r.ticket.contact, value: orNot(v.attendee.email) },
        ];
      case 'company': {
        const c = v.company;
        return [
          { label: r.company.name, value: orNot(c.name) },
          { label: r.company.corporateNumber, value: orNot(c.corporateNumber) },
          { label: r.company.department, value: orNot([c.department, c.position].filter(Boolean).join(' ')) },
          { label: r.company.employees, value: nameOf(c.employees, r.company.employeeBands) },
        ];
      }
      case 'bankAccount': {
        const b = v.bankAccount;
        const bank = banks.find((option) => option.value === b.bankCode)?.label ?? b.bankCode;
        const branch = branchesOf?.(b.bankCode).find((option) => option.value === b.branchCode)?.label ?? b.branchCode;
        const number = b.bankCode === YUCHO_BANK_CODE ? `${b.yuchoSymbol}-${b.yuchoNumber}` : b.accountNumber;
        return [{ label: r.bankAccount, value: b.bankCode ? `${String(bank)} ${String(branch)} ${number} ${b.accountHolder}`.trim() : r.notAnswered }];
      }
      case 'identity':
        return [{ label: r.identity.label, value: v.identity ? r.identity.methods[v.identity].label : r.notAnswered }];
      case 'guardian': {
        const g = v.guardian;
        const relationship = g.relationship ? r.guardian.relationships[g.relationship] : '';
        return [{ label: r.guardian.name, value: orNot(`${withNote(g.name, relationship)} ${g.email}`) }];
      }
      case 'marketing':
        return [{ label: r.marketing.label, value: v.marketing ? r.yes : r.no }];
    }
  };

  const describe = (id: RegistrationStepId): string =>
    r.presets[preset.id]?.steps?.[id] ?? (id === 'identity' && preset.identity ? r.identity.regimes[preset.identity] : r.steps[id].description);

  const steps: RegistrationStep[] = stepsFor(preset, ageOf(values.birthDate)).map((step) => {
    const optional = new Set(step.optional ?? []);
    const e = shown.has(step.id) ? errorsOf(step) : {};
    return {
      id: step.id,
      title: r.steps[step.id].title,
      description: describe(step.id),
      content: <div className="g-registration-step">{step.fields.map((key) => field(key, !optional.has(key), e))}</div>,
      validate: () => {
        const first = Object.values(errorsOf(step))[0];
        if (!first) return null;
        setShown((before) => new Set(before).add(step.id));
        return first;
      },
      optional: step.fields.every((key) => optional.has(key)),
      summary: step.fields.flatMap(summary),
    };
  });

  return (
    <RegistrationWizardPage
      {...domPassthrough(rest, 'RegistrationPresetPage')}
      className={className}
      aside={aside}
      steps={steps}
      onSubmit={() => onSubmit(latest.current)}
      onSave={onSave ? (stepId) => onSave(latest.current, stepId) : undefined}
      onSaveAndExit={onSaveAndExit}
      onStepChange={onStepChange}
      defaultStep={defaultStep}
      review={review}
      done={done}
    />
  );
}
