import type { IdentityRegime, LawId, PurposeKind, RegistrationPresetId, RegistrationStepId } from './registration-labels';

/*
 * 業種ごとの本登録の手順（P-31）。2026-10-26 時点の法令と官公庁の資料から組んだ目安で、法的な助言ではない。
 * サービスを始める前に、自社の業態に当たる法令と最新の改正を専門家に確かめること。
 *
 * 入口（仮登録）はメールアドレスだけにする。確かめる義務は契約・取引の時点に掛かる書き方なので、入口で本人確認まで
 * 求めなくてよいと読める（そう明言した公式の資料は見当たらない）。ここに並べるのは、その後の本登録で、取引の前までに
 * 聞く項目と順番。
 */

/** 本登録の手順に置ける欄（いくつかは欄の束）。 */
export type RegistrationFieldKey =
  | 'name'
  | 'birthDate'
  | 'phone'
  | 'address'
  | 'gender'
  | 'nickname'
  | 'prefecture'
  | 'occupation'
  | 'employer'
  | 'purposes'
  | 'peps'
  | 'taxResidency'
  | 'usPerson'
  | 'insider'
  | 'antiSocial'
  | 'myNumber'
  | 'myNumberAccount'
  | 'investment'
  | 'employment'
  | 'borrowings'
  | 'occupancy'
  | 'emergency'
  | 'medical'
  | 'single'
  | 'career'
  | 'scout'
  | 'attendee'
  | 'company'
  | 'bankAccount'
  | 'identity'
  | 'guardian'
  | 'marketing';

export interface RegistrationPresetStep {
  id: RegistrationStepId;
  /** 並べる欄（この順に描く）。 */
  fields: readonly RegistrationFieldKey[];
  /** fields のうち任意の欄。すべて任意なら、手順ごと「あとで入力する」で飛ばせる。 */
  optional?: readonly RegistrationFieldKey[];
}

/** 根拠の法令（名前は RegistrationLabels.laws）。 */
export interface LawReference {
  law: LawId;
  /** 条など（日本の法令の表記のまま）。 */
  article: string;
  /** 出典（e-Gov 法令検索・官公庁の資料）。 */
  url: string;
}

export interface RegistrationPreset {
  id: RegistrationPresetId;
  steps: readonly RegistrationPresetStep[];
  /** 取引の目的の選択肢の組。 */
  purposes?: PurposeKind;
  /** 本人確認の根拠。 */
  identity?: IdentityRegime;
  /** これより若い人は進めない（酒類 20・マッチング 18 など）。 */
  minAge?: number;
  /** これより若い人には、生年月日の手順の後に保護者の同意の手順を足す（民法 5 条）。 */
  guardianUnder?: number;
  laws: readonly LawReference[];
}

// 出典（e-Gov 法令検索と官公庁の資料）。どれも素の文字列にする。表の中でプロパティを読んだり（`URL.civil`）、
// テンプレート文字列でつないだり（`${E_GOV}…`）すると、束ねる道具がそれを副作用とみなして残す（使わないアプリの束にも載る）。
const AML = 'https://laws.e-gov.go.jp/law/419AC0000000022';
const AML_ORDER = 'https://laws.e-gov.go.jp/law/420CO0000000020';
const TAX_TREATY = 'https://laws.e-gov.go.jp/law/344AC0000000046';
const FATCA = 'https://www.fsa.go.jp/inter/etc/20130611.html';
const DEPOSIT_MY_NUMBER = 'https://laws.e-gov.go.jp/law/503AC0000000039';
const INCOME_TAX = 'https://laws.e-gov.go.jp/law/340AC0000000033';
const SPECIAL_TAXATION = 'https://laws.e-gov.go.jp/law/332AC0000000026';
const FIEA = 'https://laws.e-gov.go.jp/law/323AC0000000025';
const JSDA = 'https://www.jsda.or.jp/about/kisoku/200616_toushikanyu.pdf';
const INSTALLMENT = 'https://laws.e-gov.go.jp/law/336AC0000000159';
const PAYMENT_SERVICES = 'https://laws.e-gov.go.jp/law/421AC0000000059';
const COMMERCE = 'https://laws.e-gov.go.jp/law/351AC0000000057';
const UNDERAGE_DRINKING = 'https://laws.e-gov.go.jp/law/211AC1000000020';
const LIQUOR_NOTICE = 'https://www.nta.go.jp/taxes/sake/hyoji/miseinen/kokuji891122/01.htm';
const MAIL = 'https://laws.e-gov.go.jp/law/414AC0100000026';
const PRIVACY = 'https://laws.e-gov.go.jp/law/415AC0000000057';
const CIVIL = 'https://laws.e-gov.go.jp/law/129AC0000000089';
const SECONDHAND = 'https://laws.e-gov.go.jp/law/324AC0000000108';
const ONLINE_MEDICAL = 'https://www.mhlw.go.jp/content/001685701.pdf';
const DATING_SITES = 'https://laws.e-gov.go.jp/law/415AC0000000083';
const EMPLOYMENT_SECURITY = 'https://laws.e-gov.go.jp/law/322AC0000000141';
const TICKET_RESALE = 'https://laws.e-gov.go.jp/law/430AC1000000103';
const MOBILE_PHONE = 'https://laws.e-gov.go.jp/law/417AC1000000031';
const CONSUMPTION_TAX = 'https://laws.e-gov.go.jp/law/363AC0000000108';

const profile: RegistrationPresetStep = { id: 'profile', fields: ['name', 'birthDate', 'phone'] };
const address: RegistrationPresetStep = { id: 'address', fields: ['address'] };
const identity: RegistrationPresetStep = { id: 'identity', fields: ['identity'] };
const minors: LawReference = { law: 'civil', article: '4 条・5 条', url: CIVIL };

/** 業種ごとの本登録の手順。 */
export const REGISTRATION_PRESETS: Record<RegistrationPresetId, RegistrationPreset> = {
  bank: {
    id: 'bank',
    steps: [
      profile,
      address,
      { id: 'work', fields: ['occupation', 'employer', 'purposes'], optional: ['employer'] },
      { id: 'declarations', fields: ['peps', 'taxResidency', 'usPerson', 'antiSocial', 'myNumberAccount'] },
      identity,
    ],
    purposes: 'deposit',
    identity: 'aml',
    guardianUnder: 18,
    laws: [
      { law: 'aml', article: '4 条', url: AML },
      { law: 'taxTreaty', article: '10 条の 5', url: TAX_TREATY },
      { law: 'fatca', article: '日米当局の声明（2013-06-11）', url: FATCA },
      { law: 'depositMyNumber', article: '3 条', url: DEPOSIT_MY_NUMBER },
      minors,
    ],
  },
  securities: {
    id: 'securities',
    steps: [
      profile,
      address,
      { id: 'work', fields: ['occupation', 'employer', 'purposes'], optional: ['employer'] },
      { id: 'investment', fields: ['investment'] },
      { id: 'declarations', fields: ['peps', 'taxResidency', 'usPerson', 'insider', 'antiSocial'] },
      { id: 'myNumber', fields: ['myNumber'] },
      identity,
    ],
    purposes: 'securities',
    identity: 'aml',
    guardianUnder: 18,
    laws: [
      { law: 'aml', article: '4 条', url: AML },
      { law: 'fiea', article: '40 条', url: FIEA },
      { law: 'jsda', article: '投資勧誘規則 5 条・15 条', url: JSDA },
      { law: 'incomeTax', article: '224 条・224 条の 3', url: INCOME_TAX },
      { law: 'specialTaxation', article: '37 条の 11 の 3（特定口座）', url: SPECIAL_TAXATION },
      { law: 'taxTreaty', article: '10 条の 5', url: TAX_TREATY },
      { law: 'fatca', article: '日米当局の声明（2013-06-11）', url: FATCA },
      minors,
    ],
  },
  crypto: {
    id: 'crypto',
    steps: [
      profile,
      address,
      { id: 'work', fields: ['occupation', 'purposes'] },
      { id: 'investment', fields: ['investment'] },
      { id: 'declarations', fields: ['peps', 'taxResidency', 'antiSocial'] },
      identity,
    ],
    purposes: 'crypto',
    identity: 'aml',
    minAge: 18,
    laws: [
      { law: 'aml', article: '2 条 2 項 32 号・4 条', url: AML },
      { law: 'taxTreaty', article: '10 条の 9', url: TAX_TREATY },
    ],
  },
  wallet: {
    id: 'wallet',
    steps: [profile, address, { id: 'work', fields: ['occupation', 'purposes'] }, { id: 'declarations', fields: ['peps', 'antiSocial'] }, identity],
    purposes: 'remittance',
    identity: 'aml',
    guardianUnder: 18,
    laws: [
      { law: 'aml', article: '施行令 7 条 1 項 1 号 コ・ヨ', url: AML_ORDER },
      { law: 'paymentServices', article: '3 条 8 項・9 項', url: PAYMENT_SERVICES },
      minors,
    ],
  },
  card: {
    id: 'card',
    steps: [
      profile,
      address,
      { id: 'employment', fields: ['employment', 'borrowings'] },
      { id: 'work', fields: ['occupation', 'purposes'] },
      { id: 'declarations', fields: ['peps', 'antiSocial'] },
      identity,
    ],
    purposes: 'card',
    identity: 'aml',
    minAge: 18,
    laws: [
      { law: 'aml', article: '施行令 7 条 1 項 3 号', url: AML_ORDER },
      { law: 'installment', article: '30 条の 2', url: INSTALLMENT },
    ],
  },
  ec: {
    id: 'ec',
    steps: [{ id: 'delivery', fields: ['name', 'address', 'phone', 'marketing'], optional: ['marketing'] }],
    laws: [
      { law: 'commerce', article: '12 条の 6', url: COMMERCE },
      { law: 'mail', article: '3 条', url: MAIL },
      minors,
    ],
  },
  liquor: {
    id: 'liquor',
    steps: [
      { id: 'delivery', fields: ['name', 'address', 'phone', 'marketing'], optional: ['marketing'] },
      { id: 'age', fields: ['birthDate'] },
    ],
    minAge: 20,
    laws: [
      { law: 'underageDrinking', article: '1 条 4 項', url: UNDERAGE_DRINKING },
      { law: 'liquorBusiness', article: '86 条の 6（国税庁告示の年齢記載欄）', url: LIQUOR_NOTICE },
      { law: 'commerce', article: '12 条の 6', url: COMMERCE },
      { law: 'mail', article: '3 条', url: MAIL },
    ],
  },
  b2b: {
    id: 'b2b',
    steps: [
      { id: 'company', fields: ['company'] },
      { id: 'contact', fields: ['name', 'phone', 'marketing'], optional: ['phone', 'marketing'] },
    ],
    laws: [
      { law: 'consumptionTax', article: '57 条の 4', url: CONSUMPTION_TAX },
      { law: 'mail', article: '3 条', url: MAIL },
      { law: 'privacy', article: '21 条', url: PRIVACY },
    ],
  },
  reuse: {
    id: 'reuse',
    steps: [{ id: 'profile', fields: ['name', 'birthDate', 'occupation', 'phone'] }, address, { id: 'payout', fields: ['bankAccount'] }, identity],
    identity: 'reuse',
    guardianUnder: 18,
    laws: [
      { law: 'secondhand', article: '15 条・16 条', url: SECONDHAND },
      minors,
    ],
  },
  healthcare: {
    id: 'healthcare',
    steps: [
      { id: 'contact', fields: ['name', 'birthDate', 'gender', 'phone'], optional: ['gender'] },
      { id: 'address', fields: ['address'], optional: ['address'] },
      { id: 'medical', fields: ['medical'], optional: ['medical'] },
      { id: 'emergency', fields: ['emergency'], optional: ['emergency'] },
    ],
    laws: [
      { law: 'privacy', article: '20 条 2 項・21 条 2 項', url: PRIVACY },
      { law: 'onlineMedical', article: 'Ⅴ 1 (4)', url: ONLINE_MEDICAL },
    ],
  },
  matching: {
    id: 'matching',
    steps: [{ id: 'matchingProfile', fields: ['nickname', 'birthDate', 'gender', 'prefecture'] }, { id: 'declarations', fields: ['single'] }, identity],
    identity: 'matching',
    minAge: 18,
    laws: [{ law: 'datingSites', article: '11 条・施行規則 5 条', url: DATING_SITES }],
  },
  recruiting: {
    id: 'recruiting',
    steps: [
      { id: 'contact', fields: ['name', 'birthDate', 'phone', 'prefecture'], optional: ['birthDate', 'prefecture'] },
      { id: 'career', fields: ['career', 'scout', 'marketing'], optional: ['scout', 'marketing'] },
    ],
    laws: [
      { law: 'employmentSecurity', article: '5 条の 5', url: EMPLOYMENT_SECURITY },
      { law: 'privacy', article: '21 条', url: PRIVACY },
    ],
  },
  rental: {
    id: 'rental',
    steps: [profile, address, { id: 'employment', fields: ['employment'] }, { id: 'occupancy', fields: ['occupancy'] }, { id: 'emergency', fields: ['emergency'] }],
    laws: [
      { law: 'civil', article: '465 条の 2', url: CIVIL },
      { law: 'privacy', article: '21 条', url: PRIVACY },
    ],
  },
  ticket: {
    id: 'ticket',
    steps: [{ id: 'attendee', fields: ['attendee'] }],
    laws: [{ law: 'ticketResale', article: '2 条 3 項', url: TICKET_RESALE }],
  },
  telecom: {
    id: 'telecom',
    steps: [{ id: 'profile', fields: ['name', 'birthDate'] }, address, identity],
    identity: 'telecom',
    guardianUnder: 18,
    laws: [
      { law: 'mobilePhone', article: '3 条', url: MOBILE_PHONE },
      minors,
    ],
  },
};
