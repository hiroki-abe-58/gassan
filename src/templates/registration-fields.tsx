import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { Button, IconButton } from '../button';
import { ModalCheckbox, ModalCheckboxGroup, ModalRadioGroup } from '../choices';
import { ModalEmailInput } from '../email-input';
import { ModalField, ModalFieldset } from '../fields';
import { ModalInput } from '../inputs';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { digitsOf, isCorporateNumber } from '../japanese';
import { ModalNativeSelect } from '../native-select';
import { usePhrase } from '../phrase';
import { ConsentField } from './form';
import {
  EMPLOYEE_BANDS,
  GUARDIAN_RELATIONSHIPS,
  OCCUPATIONS,
  PURPOSES,
  useRegistrationLabels,
  type EmployeeBand,
  type GuardianRelationship,
  type IdentityMethod,
  type IdentityRegime,
  type Occupation,
  type PurposeKind,
} from './registration-labels';

/*
 * 登録の欄の部品（I-33〜I-37）。法令が求める項目を、理由の文・選択肢・読み上げの形まで含めて部品にする。
 * どれも値は利用側が持つ（制御）。エラーは送ろうとした後に利用側が渡す（打っている途中では責めない）。
 * 業種ごとの手順（RegistrationPresetPage）もこれで組んでいる。
 */

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 「当たる / 当たらない」のような二択の答え。 */
export type Answer = 'yes' | 'no';

/* -------------------------------------------------------------------------- */
/* 職業と取引の目的（I-33）                                                    */
/* -------------------------------------------------------------------------- */

export interface OccupationFieldProps extends DataAttributes {
  value: Occupation | '';
  onValueChange: (value: Occupation | '') => void;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** 出す選択肢とその順。既定は金融庁の類型のすべて。 */
  options?: readonly Occupation[];
  className?: string;
}

/**
 * 職業。I-33。犯罪収益移転防止法の取引時確認（4 条 1 項 3 号）と古物営業法の確認（15 条）で聞く項目。
 * 選択肢は金融庁の「犯罪収益移転防止法に関する留意事項について」の類型。自由記述にしないので、打ち方の揺れが出ない。
 */
export function OccupationField({ value, onValueChange, label, help, error, required, options = OCCUPATIONS, className, ...rest }: OccupationFieldProps): ReactNode {
  const r = useRegistrationLabels();
  return (
    <ModalField {...domPassthrough(rest, 'OccupationField')} className={className} label={label ?? r.occupation.label} help={help} error={error} required={required}>
      {(control) => (
        <ModalNativeSelect
          {...control}
          name="occupation"
          placeholder={r.choose}
          options={options.map((key) => ({ value: key, label: r.occupation.options[key] }))}
          value={value}
          onChange={(event) => onValueChange(event.target.value as Occupation | '')}
        />
      )}
    </ModalField>
  );
}

export interface PurposeFieldProps extends DataAttributes {
  /** 選択肢の組（預金・証券・暗号資産・送金・カード）。 */
  kind: PurposeKind;
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * 取引を行う目的。I-33。犯罪収益移転防止法の取引時確認（4 条 1 項 2 号）で聞く項目。いくつでも選べる（チェックボックスの束）。
 * 預金の組は金融庁の類型。ほかの組は業態に合わせた言い方。
 */
export function PurposeField({ kind, value, onValueChange, label, help, error, required, className, ...rest }: PurposeFieldProps): ReactNode {
  const r = useRegistrationLabels();
  const names = r.purposes[kind] as Record<string, string>;
  return (
    <ModalFieldset {...domPassthrough(rest, 'PurposeField')} className={className} label={label ?? r.purposes.label} help={help ?? r.purposes.help} error={error} required={required}>
      <ModalCheckboxGroup name="purposes" value={value} onValueChange={onValueChange} options={PURPOSES[kind].map((key) => ({ value: key, label: names[key] ?? key }))} />
    </ModalFieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* 届出と表明（I-34）                                                          */
/* -------------------------------------------------------------------------- */

/** 二択の問い（束の名前が問い、説明が当たる人の範囲）。RegistrationPresetPage も使う（index.ts からは出さない）。 */
export function AnswerField({
  legend,
  help,
  options,
  value,
  onValueChange,
  error,
  required,
  name,
  className,
  data,
}: {
  legend: ReactNode;
  help: ReactNode;
  options: { no: string; yes: string };
  value: Answer | null;
  onValueChange: (value: Answer) => void;
  error?: ReactNode;
  required?: boolean;
  name: string;
  className?: string;
  data?: DataAttributes;
}): ReactNode {
  return (
    <ModalFieldset {...data} className={className} label={legend} help={help} error={error} required={required}>
      <ModalRadioGroup
        name={name}
        orientation="horizontal"
        value={value}
        onValueChange={(next) => onValueChange(next === 'yes' ? 'yes' : 'no')}
        options={[
          { value: 'no', label: options.no },
          { value: 'yes', label: options.yes },
        ]}
      />
    </ModalFieldset>
  );
}

export interface PepsFieldProps extends DataAttributes {
  value: Answer | null;
  onValueChange: (value: Answer) => void;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * 外国 PEPs（外国の重要な公人）に当たるか。I-34。犯罪収益移転防止法 4 条 2 項 3 号・施行令 12 条 3 項。
 * 当たる人の範囲（元首・大臣・中央銀行の役員など、元職と家族を含む。国内の公職は当たらない）を説明に置く。
 */
export function PepsField({ value, onValueChange, error, required = true, className, ...rest }: PepsFieldProps): ReactNode {
  const r = useRegistrationLabels();
  return (
    <AnswerField
      data={domPassthrough(rest, 'PepsField')}
      className={className}
      name="peps"
      legend={r.peps.label}
      help={r.peps.help}
      options={r.peps.options}
      value={value}
      onValueChange={onValueChange}
      error={error}
      required={required}
    />
  );
}

/** 米国の納税義務（FATCA）。 */
export interface UsPerson {
  answer: Answer | null;
  /** 米国の納税者番号（answer が yes のとき）。 */
  tin: string;
  /** 米国の税務当局への報告の同意（answer が yes のとき）。 */
  consent: boolean;
}

export interface UsPersonFieldProps extends DataAttributes {
  value: UsPerson;
  onValueChange: (value: UsPerson) => void;
  errors?: Partial<Record<keyof UsPerson, ReactNode>>;
  required?: boolean;
  className?: string;
}

/**
 * 米国の納税義務があるか（FATCA）。I-34。日本の法令ではなく、日米の当局の声明にもとづく実務。
 * 「ある」と答えた人にだけ、米国の納税者番号と報告への同意の欄を出す（当たらない人には聞かない）。
 */
export function UsPersonField({ value, onValueChange, errors, required = true, className, ...rest }: UsPersonFieldProps): ReactNode {
  const r = useRegistrationLabels();
  const consentId = `${useId()}-consent`;
  return (
    <div {...domPassthrough(rest, 'UsPersonField')} className={cx('g-registration-group', className)}>
      <AnswerField
        name="us-person"
        legend={r.usPerson.label}
        help={r.usPerson.help}
        options={r.usPerson.options}
        value={value.answer}
        onValueChange={(answer) => onValueChange({ ...value, answer })}
        error={errors?.answer}
        required={required}
      />
      {value.answer === 'yes' ? (
        <>
          <ModalField label={r.usPerson.tin} required error={errors?.tin}>
            {(control) => (
              <ModalInput {...control} name="us-tin" inputMode="numeric" autoComplete="off" normalize={digitsOf} value={value.tin} onChange={(event) => onValueChange({ ...value, tin: event.target.value })} />
            )}
          </ModalField>
          <ConsentField id={consentId} name="us-consent" checked={value.consent} onCheckedChange={(consent) => onValueChange({ ...value, consent })} error={errors?.consent}>
            {r.usPerson.consent}
          </ConsentField>
        </>
      ) : null}
    </div>
  );
}

/** 税務上の居住地国（CRS・CARF）。 */
export interface TaxResidency {
  residency: 'japan' | 'other' | null;
  /** 日本のほかの居住地国と納税者番号（residency が other のとき）。 */
  countries: { country: string; tin: string }[];
}

export interface TaxResidencyFieldProps extends DataAttributes {
  value: TaxResidency;
  onValueChange: (value: TaxResidency) => void;
  /** residency は答え、countries は 1 つ目の国の欄に出す。 */
  errors?: { residency?: ReactNode; countries?: ReactNode };
  required?: boolean;
  className?: string;
}

/**
 * 税務上の居住地国（CRS。暗号資産は 2026 年から CARF）。I-34。租税条約等実施特例法 10 条の 5・10 条の 9。
 * 「日本だけ」なら 1 回押すだけで済み、ほかの国がある人にだけ、国と納税者番号の欄を出す（国はいくつでも足せる）。
 */
export function TaxResidencyField({ value, onValueChange, errors, required = true, className, ...rest }: TaxResidencyFieldProps): ReactNode {
  const r = useRegistrationLabels();
  const t = r.taxResidency;
  const setCountry = (index: number, patch: Partial<{ country: string; tin: string }>): void =>
    onValueChange({ ...value, countries: value.countries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)) });
  return (
    <div {...domPassthrough(rest, 'TaxResidencyField')} className={cx('g-registration-group', className)}>
      <ModalFieldset label={t.label} help={t.help} error={errors?.residency} required={required}>
        <ModalRadioGroup
          name="tax-residency"
          value={value.residency}
          onValueChange={(residency) => {
            const next = residency === 'other' ? 'other' : 'japan';
            onValueChange({ residency: next, countries: next === 'other' && value.countries.length === 0 ? [{ country: '', tin: '' }] : value.countries });
          }}
          options={[
            { value: 'japan', label: t.japan },
            { value: 'other', label: t.other },
          ]}
        />
      </ModalFieldset>
      {value.residency === 'other' ? (
        <div className="g-registration-rows">
          {value.countries.map((entry, index) => (
            <ModalFieldset key={index} label={t.row(index + 1)} required requiredBadge={false} className="g-registration-row">
              <ModalField label={t.country} required requiredBadge={false} error={index === 0 ? errors?.countries : undefined}>
                {(control) => <ModalInput {...control} autoComplete="country-name" value={entry.country} onChange={(event) => setCountry(index, { country: event.target.value })} />}
              </ModalField>
              <ModalField label={t.tin}>
                {(control) => <ModalInput {...control} autoComplete="off" value={entry.tin} onChange={(event) => setCountry(index, { tin: event.target.value })} />}
              </ModalField>
              {value.countries.length > 1 ? (
                <IconButton label={t.remove(index + 1)} onClick={() => onValueChange({ ...value, countries: value.countries.filter((_, i) => i !== index) })}>
                  <Icon name="close" />
                </IconButton>
              ) : null}
            </ModalFieldset>
          ))}
          <Button size="sm" iconStart={<Icon name="plus" />} onClick={() => onValueChange({ ...value, countries: [...value.countries, { country: '', tin: '' }] })}>
            {t.add}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export interface DeclarationFieldProps extends DataAttributes {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 表明の文（チェックボックスのラベル）。 */
  children: ReactNode;
  /** 開け閉めできる補足の見出しと中身（「反社会的勢力とは」と、その範囲）。 */
  detailsTitle?: ReactNode;
  details?: ReactNode;
  error?: ReactNode;
  /** チェックボックスの name。既定 "declaration"。 */
  name?: string;
  id?: string;
  className?: string;
}

/**
 * 表明・確約・申告のチェックボックス（反社会的勢力の排除・独身であることの申告など）。I-34。
 * 範囲の長い説明は、開け閉めできる details にして、文そのものは短く保つ。エラーは送ろうとした後に出す。
 */
export function DeclarationField({ checked, onCheckedChange, children, detailsTitle, details, error, name = 'declaration', id, className, ...rest }: DeclarationFieldProps): ReactNode {
  const phrase = usePhrase();
  const autoId = `${useId()}-declaration`;
  return (
    <div {...domPassthrough(rest, 'DeclarationField')} className={cx('g-registration-group', className)}>
      <ConsentField id={id ?? autoId} name={name} checked={checked} onCheckedChange={onCheckedChange} error={error}>
        {children}
      </ConsentField>
      {details ? (
        <details className="g-registration-details">
          <summary>{phrase(detailsTitle)}</summary>
          <p>{phrase(details)}</p>
        </details>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 番号（I-35）                                                                */
/* -------------------------------------------------------------------------- */

export interface MyNumberFieldProps extends DataAttributes {
  value: string;
  onValueChange: (value: string) => void;
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * マイナンバー（個人番号）。I-35。数字だけにそろえ（全角・空白・ハイフンも受け付ける）、自動入力とスペルの確認を切る。
 * 桁の数と検査用数字は送ろうとした後に isMyNumber で確かめる（打っている途中では責めない）。
 */
export function MyNumberField({ value, onValueChange, label, help, error, required, className, ...rest }: MyNumberFieldProps): ReactNode {
  const r = useRegistrationLabels();
  return (
    <ModalField {...domPassthrough(rest, 'MyNumberField')} className={className} label={label ?? r.myNumber.label} help={help ?? r.myNumber.help} error={error} required={required}>
      {(control) => (
        <ModalInput
          {...control}
          name="my-number"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          normalize={digitsOf}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </ModalField>
  );
}

/** 会社の情報。 */
export interface CompanyInfo {
  name: string;
  /** 法人番号（13 桁）。 */
  corporateNumber: string;
  department: string;
  position: string;
  employees: EmployeeBand | '';
}

export interface CompanyFieldsProps extends DataAttributes {
  value: CompanyInfo;
  onValueChange: (value: CompanyInfo) => void;
  /** 法人番号から会社名を引く（国税庁の法人番号 Web-API など、利用側がつなぐ）。見つからなければ null。 */
  lookup?: (corporateNumber: string) => Promise<{ name: string } | null>;
  errors?: Partial<Record<keyof CompanyInfo, ReactNode>>;
  /** 必須にする欄。既定は会社名だけ。 */
  required?: readonly (keyof CompanyInfo)[];
  className?: string;
}

/**
 * 会社の情報（会社名・法人番号・部署・役職・従業員数）。I-35。
 * 法人番号は数字だけにそろえ、検査用数字まで正しい 13 桁になったら lookup で会社名を引き、空の欄か前に補ったままの欄だけを埋める
 * （打った会社名は上書きしない）。補ったことは role="status" で知らせ、フォーカスは動かさない。
 */
export function CompanyFields({ value, onValueChange, lookup, errors, required = ['name'], className, ...rest }: CompanyFieldsProps): ReactNode {
  const r = useRegistrationLabels();
  const phrase = usePhrase();
  const t = r.company;
  const [found, setFound] = useState('');
  // 法人番号から補った会社名。打ち直されていなければ、別の番号のときに差し替えてよい
  const filled = useRef('');
  // 番号が変わったときだけ引く。値・渡された関数・文言は最新を ref から読む（変わるたびに引き直さない）
  const latest = useRef({ value, onValueChange, found: t.found });
  latest.current = { value, onValueChange, found: t.found };
  const number = digitsOf(value.corporateNumber);
  useEffect(() => {
    if (!lookup || !isCorporateNumber(number)) return;
    let live = true;
    void lookup(number).then((result) => {
      if (!live || !result) return;
      const { value: current, onValueChange: change, found: foundText } = latest.current;
      if (current.name !== '' && current.name !== filled.current) return;
      filled.current = result.name;
      setFound(foundText(result.name));
      change({ ...current, name: result.name });
    });
    return () => {
      live = false;
    };
  }, [number, lookup]);
  const set = (patch: Partial<CompanyInfo>): void => onValueChange({ ...value, ...patch });
  const isRequired = (key: keyof CompanyInfo): boolean => required.includes(key);
  return (
    <div {...domPassthrough(rest, 'CompanyFields')} className={cx('g-registration-group', className)}>
      <ModalField label={t.corporateNumber} help={lookup ? t.corporateNumberHelp : undefined} required={isRequired('corporateNumber')} error={errors?.corporateNumber}>
        {(control) => (
          <ModalInput {...control} name="corporate-number" inputMode="numeric" autoComplete="off" normalize={digitsOf} value={value.corporateNumber} onChange={(event) => set({ corporateNumber: event.target.value })} />
        )}
      </ModalField>
      <ModalField label={t.name} required={isRequired('name')} error={errors?.name}>
        {(control) => <ModalInput {...control} name="organization" autoComplete="organization" value={value.name} onChange={(event) => set({ name: event.target.value })} />}
      </ModalField>
      <p className="g-live g-registration-found" role="status">
        {found ? phrase(found) : null}
      </p>
      <div className="g-registration-pair">
        <ModalField label={t.department} required={isRequired('department')} error={errors?.department}>
          {(control) => <ModalInput {...control} name="department" value={value.department} onChange={(event) => set({ department: event.target.value })} />}
        </ModalField>
        <ModalField label={t.position} required={isRequired('position')} error={errors?.position}>
          {(control) => <ModalInput {...control} name="organization-title" autoComplete="organization-title" value={value.position} onChange={(event) => set({ position: event.target.value })} />}
        </ModalField>
      </div>
      <ModalField label={t.employees} required={isRequired('employees')} error={errors?.employees}>
        {(control) => (
          <ModalNativeSelect
            {...control}
            name="employees"
            placeholder={r.choose}
            options={EMPLOYEE_BANDS.map((band) => ({ value: band, label: t.employeeBands[band] }))}
            value={value.employees}
            onChange={(event) => set({ employees: event.target.value as EmployeeBand | '' })}
          />
        )}
      </ModalField>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 本人確認の方法（I-36）                                                      */
/* -------------------------------------------------------------------------- */

/** 根拠の法令ごとに、オンラインで使える方法と、使える最後の日（あれば）。 */
const IDENTITY_METHODS: Record<IdentityRegime, readonly { method: IdentityMethod; until?: string }[]> = {
  // 犯罪収益移転防止法施行規則 6 条 1 項 1 号。書類と顔の撮影（いわゆるホ方式）は 2027-03-31 まで
  aml: [{ method: 'icSelfie' }, { method: 'smartphoneCard' }, { method: 'jpki' }, { method: 'imageSelfie', until: '2027-03-31' }, { method: 'residentRecordMail' }, { method: 'restrictedMail' }],
  // 携帯電話不正利用防止法施行規則 3 条 1 項 1 号（2026-04-01 から書類の画像の方式は無い）
  telecom: [{ method: 'icSelfie' }, { method: 'smartphoneCard' }, { method: 'jpki' }, { method: 'residentRecordMail' }, { method: 'restrictedMail' }],
  // 古物営業法施行規則 15 条 3 項（画像の方式は残る）
  reuse: [{ method: 'icSelfie' }, { method: 'jpki' }, { method: 'imageSelfie' }, { method: 'residentRecordMail' }, { method: 'restrictedMail' }],
  // 出会い系サイト規制法施行規則 5 条 1 項（マイナンバーカードの方式は 2026-04-16 から）
  matching: [{ method: 'cardPin' }, { method: 'jpki' }, { method: 'ageDocument' }, { method: 'creditCard' }],
};

/** その日の日付（現地時間の YYYY-MM-DD）。 */
function localDay(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 根拠の法令（regime）でオンラインで使える本人確認の方法。I-36。
 * on の日にもう使えない方法は除く（犯罪収益移転防止法の書類と顔の撮影は 2027-04-01 から使えない）。
 */
export function identityMethods(regime: IdentityRegime, on: Date = new Date()): IdentityMethod[] {
  const day = localDay(on);
  return IDENTITY_METHODS[regime].filter((entry) => !entry.until || day <= entry.until).map((entry) => entry.method);
}

export interface IdentityMethodFieldProps extends DataAttributes {
  /** 根拠の法令（犯罪収益移転防止法・携帯電話不正利用防止法・古物営業法・出会い系サイト規制法）。 */
  regime: IdentityRegime;
  value: IdentityMethod | null;
  onValueChange: (value: IdentityMethod) => void;
  /** 出す方法とその順（既定は regime で使えるすべて）。自社の本人確認のサービスが対応するものに絞り、勧める方法を先に置く。 */
  methods?: readonly IdentityMethod[];
  /** 使えるかを決める日（既定は今日）。 */
  on?: Date;
  error?: ReactNode;
  className?: string;
}

/**
 * 本人確認の方法を選ぶ。I-36。方法ごとに、手元に要るもの（カード・パスワードの種類・届くまでの日数）を説明に置き、
 * 使えない方法を出さない。方法は条の記号ではなく名前で持つ（記号は改正のたびにずれる）。
 * 本人確認そのもの（IC の読み取り・撮影・電子署名の検証）は、利用側の本人確認のサービスが行う。
 */
export function IdentityMethodField({ regime, value, onValueChange, methods, on, error, className, ...rest }: IdentityMethodFieldProps): ReactNode {
  const r = useRegistrationLabels();
  const available = identityMethods(regime, on);
  const shown = methods ? methods.filter((method) => available.includes(method)) : available;
  return (
    <ModalFieldset {...domPassthrough(rest, 'IdentityMethodField')} className={className} label={r.identity.label} error={error} required>
      <ModalRadioGroup
        name="identity-method"
        value={value}
        onValueChange={(next) => onValueChange(next as IdentityMethod)}
        options={shown.map((method) => ({ value: method, label: r.identity.methods[method].label, description: r.identity.methods[method].description }))}
      />
    </ModalFieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* 保護者の同意と広告メールの同意（I-37）                                       */
/* -------------------------------------------------------------------------- */

/** 保護者（法定代理人）の同意。 */
export interface GuardianConsent {
  name: string;
  relationship: GuardianRelationship | '';
  /** 確認のメールを送る先。 */
  email: string;
  consent: boolean;
}

export interface GuardianFieldsProps extends DataAttributes {
  value: GuardianConsent;
  onValueChange: (value: GuardianConsent) => void;
  errors?: Partial<Record<keyof GuardianConsent, ReactNode>>;
  className?: string;
}

/**
 * 保護者（法定代理人）の同意。I-37。未成年の契約は同意が無いと取り消せる（民法 5 条）。
 * 保護者の名前・続柄・メールアドレス（確認のメールを送る）と、同意を得ていることのチェック。
 * 欄はご本人のものではないので、ブラウザの自動入力を切る（ご本人の名前とアドレスが入らないように）。
 */
export function GuardianFields({ value, onValueChange, errors, className, ...rest }: GuardianFieldsProps): ReactNode {
  const r = useRegistrationLabels();
  const t = r.guardian;
  const consentId = `${useId()}-guardian-consent`;
  const set = (patch: Partial<GuardianConsent>): void => onValueChange({ ...value, ...patch });
  return (
    <div {...domPassthrough(rest, 'GuardianFields')} className={cx('g-registration-group', className)}>
      <ModalField label={t.name} required error={errors?.name}>
        {(control) => <ModalInput {...control} name="guardian-name" autoComplete="off" value={value.name} onChange={(event) => set({ name: event.target.value })} />}
      </ModalField>
      <ModalField label={t.relationship} required error={errors?.relationship}>
        {(control) => (
          <ModalNativeSelect
            {...control}
            name="guardian-relationship"
            placeholder={r.choose}
            options={GUARDIAN_RELATIONSHIPS.map((key) => ({ value: key, label: t.relationships[key] }))}
            value={value.relationship}
            onChange={(event) => set({ relationship: event.target.value as GuardianRelationship | '' })}
          />
        )}
      </ModalField>
      <ModalField label={t.email} help={t.emailHelp} required error={errors?.email}>
        {(control) => (
          <ModalEmailInput {...control} name="guardian-email" autoComplete="off" carrierNotice={false} value={value.email} onChange={(event) => set({ email: event.target.value })} />
        )}
      </ModalField>
      <ConsentField id={consentId} name="guardian-consent" checked={value.consent} onCheckedChange={(consent) => set({ consent })} error={errors?.consent}>
        {t.consent}
      </ConsentField>
    </div>
  );
}

export interface MarketingConsentFieldProps extends DataAttributes {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/**
 * 広告メールの受け取りの同意。I-37。特定電子メール法 3 条（事前の同意と記録）。
 * 規約への同意とは分けた、任意のチェックボックス。初めはチェックを入れない（総務省のガイドラインの推奨）。
 */
export function MarketingConsentField({ checked, onCheckedChange, label, description, className, ...rest }: MarketingConsentFieldProps): ReactNode {
  const r = useRegistrationLabels();
  return (
    <ModalCheckbox {...domPassthrough(rest, 'MarketingConsentField')} className={className} name="marketing" checked={checked} onCheckedChange={onCheckedChange} description={description ?? r.marketing.description}>
      {label ?? r.marketing.label}
    </ModalCheckbox>
  );
}
