import { useLabels } from '../labels';
import { useSiteConfig } from './site';

/*
 * 業種ごとの登録（P-31）と、その欄の部品（I-33〜I-37）の文言と選択肢。
 *
 * テンプレートの文言（TemplateLabels）とは別の表にする。職業・取引の目的・年収の帯などの選択肢と、法令にもとづく
 * 理由の文で数百の文字列があり、ほかのテンプレートだけを使うアプリの束に載せないため（この表は登録の部品だけが読む）。
 * 選択肢の値（キー）はコードで決め、ここには見せる文字だけを置く。
 */

/** 業種のプリセット。 */
export const REGISTRATION_PRESET_IDS = [
  'bank',
  'securities',
  'crypto',
  'wallet',
  'card',
  'ec',
  'liquor',
  'b2b',
  'reuse',
  'healthcare',
  'matching',
  'recruiting',
  'rental',
  'ticket',
  'telecom',
] as const;
export type RegistrationPresetId = (typeof REGISTRATION_PRESET_IDS)[number];

/** 本登録の手順の種類。 */
export type RegistrationStepId =
  | 'profile'
  | 'contact'
  | 'address'
  | 'delivery'
  | 'work'
  | 'investment'
  | 'declarations'
  | 'myNumber'
  | 'employment'
  | 'identity'
  | 'company'
  | 'payout'
  | 'age'
  | 'medical'
  | 'emergency'
  | 'matchingProfile'
  | 'career'
  | 'occupancy'
  | 'attendee'
  | 'guardian';

/** 根拠の法令（名前は文言の表に、条文と出典は REGISTRATION_PRESETS に）。 */
export type LawId =
  | 'aml'
  | 'taxTreaty'
  | 'fatca'
  | 'depositMyNumber'
  | 'incomeTax'
  | 'specialTaxation'
  | 'fiea'
  | 'jsda'
  | 'installment'
  | 'paymentServices'
  | 'commerce'
  | 'underageDrinking'
  | 'liquorBusiness'
  | 'mail'
  | 'privacy'
  | 'civil'
  | 'secondhand'
  | 'onlineMedical'
  | 'datingSites'
  | 'employmentSecurity'
  | 'ticketResale'
  | 'mobilePhone'
  | 'consumptionTax';

/** 職業。金融庁の「犯罪収益移転防止法に関する留意事項について」の類型。 */
export const OCCUPATIONS = ['executive', 'employee', 'publicServant', 'selfEmployed', 'partTime', 'homemaker', 'student', 'retired', 'other'] as const;
export type Occupation = (typeof OCCUPATIONS)[number];

/** 取引を行う目的の選択肢の組。deposit は金融庁の預金の目的の類型。 */
export const PURPOSES = {
  deposit: ['living', 'business', 'salary', 'savings', 'loan', 'forex', 'other'],
  securities: ['longTerm', 'shortTerm', 'income', 'other'],
  crypto: ['investment', 'payment', 'remittance', 'business', 'other'],
  remittance: ['living', 'personal', 'business', 'overseas', 'other'],
  card: ['living', 'business', 'other'],
} as const;
export type PurposeKind = keyof typeof PURPOSES;

/** 本人確認の方法。条の記号は改正のたびにずれるので、方式の名前で持つ。 */
export type IdentityMethod =
  | 'icSelfie'
  | 'smartphoneCard'
  | 'jpki'
  | 'imageSelfie'
  | 'restrictedMail'
  | 'residentRecordMail'
  | 'ageDocument'
  | 'cardPin'
  | 'creditCard';

/** 本人確認の根拠（犯罪収益移転防止法・携帯電話不正利用防止法・古物営業法・出会い系サイト規制法）。 */
export type IdentityRegime = 'aml' | 'telecom' | 'reuse' | 'matching';

export const INCOME_BANDS = ['lt3', '3to5', '5to7', '7to10', '10to20', 'gte20'] as const;
export const ASSET_BANDS = ['lt1', '1to5', '5to10', '10to30', '30to100', 'gte100'] as const;
export const BORROWING_BANDS = ['none', 'lt50', '50to100', '100to300', 'gte300'] as const;
export const TENURE_BANDS = ['lt1', '1to3', '3to5', '5to10', 'gte10'] as const;
export const EMPLOYEE_BANDS = ['1to10', '11to50', '51to300', '301to1000', 'gt1000'] as const;
export const EXPERIENCE_LEVELS = ['none', 'lt1', '1to5', 'gte5'] as const;
export const INVESTMENT_PRODUCTS = ['stocks', 'funds', 'bonds', 'derivatives', 'crypto'] as const;
export const INVESTMENT_OBJECTIVES = ['stable', 'balanced', 'growth', 'speculative'] as const;
export const EMPLOYMENT_TYPES = ['regular', 'contract', 'partTime', 'selfEmployed', 'executive', 'publicServant', 'other'] as const;
export const OCCUPANT_COUNTS = ['1', '2', '3', '4', '5plus'] as const;
export const RELATIONSHIPS = ['parent', 'spouse', 'child', 'sibling', 'relative', 'other'] as const;
export const GUARDIAN_RELATIONSHIPS = ['father', 'mother', 'other'] as const;
export const GENDERS = ['male', 'female', 'other', 'unanswered'] as const;

export type IncomeBand = (typeof INCOME_BANDS)[number];
export type AssetBand = (typeof ASSET_BANDS)[number];
export type BorrowingBand = (typeof BORROWING_BANDS)[number];
export type TenureBand = (typeof TENURE_BANDS)[number];
export type EmployeeBand = (typeof EMPLOYEE_BANDS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type InvestmentProduct = (typeof INVESTMENT_PRODUCTS)[number];
export type InvestmentObjective = (typeof INVESTMENT_OBJECTIVES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type OccupantCount = (typeof OCCUPANT_COUNTS)[number];
export type Relationship = (typeof RELATIONSHIPS)[number];
export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];
export type Gender = (typeof GENDERS)[number];

type Answer = { no: string; yes: string };

export interface RegistrationLabels {
  /** 'ja-JP' など。 */
  locale: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  email: string;
  gender: string;
  genders: Record<Gender, string>;
  nickname: string;
  prefecture: string;
  /** セレクトの空の選択肢。 */
  choose: string;
  /** 確認の画面で、答えていない欄。 */
  notAnswered: string;
  /** 確認の画面で、チェックボックスの答え。 */
  yes: string;
  no: string;
  /** 確認の画面で、いくつかの答えを 1 行に並べる（「株式、投資信託」）。 */
  list: (items: readonly string[]) => string;
  /** 確認の画面で、答えに補足を添える（「山田 太郎（ヤマダ タロウ）」）。 */
  note: (text: string, note: string) => string;
  /** 欄のラベルを入れた、入力を促す文。ラベルは問いの形や固有名詞もあるので、言い換えずにそのまま入れる。 */
  required: (label: string) => string;
  chooseRequired: (label: string) => string;
  /** 二択の問い（PEPs など）に答えていないとき。 */
  answerRequired: string;
  /** 年齢の下限に届かないとき。 */
  underAge: (age: number) => string;
  occupation: { label: string; options: Record<Occupation, string> };
  employer: string;
  purposes: {
    label: string;
    help: string;
    deposit: Record<(typeof PURPOSES.deposit)[number], string>;
    securities: Record<(typeof PURPOSES.securities)[number], string>;
    crypto: Record<(typeof PURPOSES.crypto)[number], string>;
    remittance: Record<(typeof PURPOSES.remittance)[number], string>;
    card: Record<(typeof PURPOSES.card)[number], string>;
  };
  peps: { label: string; help: string; options: Answer };
  taxResidency: {
    label: string;
    help: string;
    japan: string;
    other: string;
    country: string;
    tin: string;
    /** 国ごとの欄の束の名前（何番目か）。同じ名前の欄を並べない。 */
    row: (index: number) => string;
    add: string;
    /** 何番目かを入れて、同じ名前のボタンを並べない。 */
    remove: (index: number) => string;
    countryRequired: string;
  };
  usPerson: { label: string; help: string; options: Answer; tin: string; consent: string; consentRequired: string };
  insider: { label: string; help: string; options: Answer; company: string };
  antiSocial: { label: string; definitionTitle: string; definition: string; required: string };
  myNumber: { label: string; help: string; invalid: string };
  myNumberAccount: { label: string; help: string; options: Answer };
  company: {
    name: string;
    corporateNumber: string;
    corporateNumberHelp: string;
    invalidCorporateNumber: string;
    /** 法人番号から会社名を補ったとき（読み上げにも知らせる）。 */
    found: (name: string) => string;
    department: string;
    position: string;
    employees: string;
    employeeBands: Record<EmployeeBand, string>;
  };
  identity: {
    label: string;
    methods: Record<IdentityMethod, { label: string; description: string }>;
    /** 本人確認の手順の説明（根拠の法令ごと）。 */
    regimes: Record<IdentityRegime, string>;
    /** 年齢の確認の画面に出す「18 歳未満は使えない」旨（出会い系サイト規制法施行規則 4 条の表示）。 */
    minorsNotice: string;
    /** 利用側の本人確認のサービスを呼ぶボタン。 */
    start: string;
    verified: string;
    verifyRequired: string;
  };
  guardian: {
    name: string;
    relationship: string;
    relationships: Record<GuardianRelationship, string>;
    email: string;
    emailHelp: string;
    consent: string;
    consentRequired: string;
  };
  marketing: { label: string; description: string };
  investment: {
    experience: string;
    experienceHelp: string;
    products: Record<InvestmentProduct, string>;
    levels: Record<ExperienceLevel, string>;
    objective: string;
    objectives: Record<InvestmentObjective, string>;
    income: string;
    incomeBands: Record<IncomeBand, string>;
    assets: string;
    assetsHelp: string;
    assetBands: Record<AssetBand, string>;
  };
  employment: {
    employerName: string;
    employerPhone: string;
    type: string;
    types: Record<EmploymentType, string>;
    tenure: string;
    tenureBands: Record<TenureBand, string>;
    borrowings: string;
    borrowingsHelp: string;
    borrowingBands: Record<BorrowingBand, string>;
  };
  occupancy: {
    occupants: string;
    occupantCounts: Record<OccupantCount, string>;
    guarantee: string;
    guaranteeOptions: { company: string; person: string };
    guaranteeNote: string;
    guarantorName: string;
    guarantorRelationship: string;
    guarantorPhone: string;
  };
  relationships: Record<Relationship, string>;
  emergency: { name: string; relationship: string; phone: string };
  medical: { history: string; medications: string; allergies: string };
  matching: { single: string; singleRequired: string };
  recruiting: { education: string; workHistory: string; licenses: string; gender: string; scout: string; scoutDescription: string };
  ticket: { attendee: string; contact: string; transferNotice: string };
  bankAccount: string;
  steps: Record<RegistrationStepId, { title: string; description: string }>;
  presets: Record<RegistrationPresetId, { title: string; description: string; steps?: Partial<Record<RegistrationStepId, string>> }>;
  laws: Record<LawId, string>;
}

export const japaneseRegistrationLabels: RegistrationLabels = {
  locale: 'ja-JP',
  name: 'お名前',
  birthDate: '生年月日',
  phone: '電話番号',
  address: 'ご住所',
  email: 'メールアドレス',
  gender: '性別',
  genders: { male: '男性', female: '女性', other: 'その他', unanswered: '回答しない' },
  nickname: 'ニックネーム',
  prefecture: 'お住まいの都道府県',
  choose: '選んでください',
  notAnswered: '未回答',
  yes: 'はい',
  no: 'いいえ',
  list: (items) => items.join('、'),
  note: (text, note) => `${text}（${note}）`,
  required: (label) => `${label}を入力してください`,
  chooseRequired: (label) => `${label}を選んでください`,
  answerRequired: '答えを選んでください',
  underAge: (age) => `${String(age)}歳未満の方はご利用いただけません`,
  occupation: {
    label: 'ご職業',
    options: {
      executive: '会社役員・団体役員',
      employee: '会社員・団体職員',
      publicServant: '公務員',
      selfEmployed: '個人事業主・自営業',
      partTime: 'パート・アルバイト・派遣社員・契約社員',
      homemaker: '主婦・主夫',
      student: '学生',
      retired: '退職された方・無職の方',
      other: 'その他',
    },
  },
  employer: 'お勤め先',
  purposes: {
    label: 'お取引の目的',
    help: '当てはまるものをすべて選んでください。',
    deposit: {
      living: '生計費の決済',
      business: '事業費の決済',
      salary: '給与・年金の受け取り',
      savings: '貯蓄・資産運用',
      loan: '融資',
      forex: '外国為替取引',
      other: 'その他',
    },
    securities: { longTerm: '中長期の資産運用', shortTerm: '短期の売買', income: '配当・利息の受け取り', other: 'その他' },
    crypto: { investment: '投資・資産運用', payment: '商品やサービスの支払い', remittance: '送金', business: '事業での利用', other: 'その他' },
    remittance: { living: '生活費の支払い', personal: '個人の間の送金', business: '事業の支払い・受け取り', overseas: '海外への送金', other: 'その他' },
    card: { living: '生計費の決済', business: '事業費の決済', other: 'その他' },
  },
  peps: {
    label: '外国の重要な公人（外国 PEPs）に当たりますか',
    help: '外国の元首・大臣・中央銀行の役員など、外国で重要な公的地位にある方（過去にあった方を含む）と、そのご家族が当たります。日本の公職は当たりません。',
    options: { no: '当たらない', yes: '当たる' },
  },
  taxResidency: {
    label: '税務上の居住地国',
    help: '税金を納める国です。日本のほかにもある方は、その国と納税者番号を入力してください。',
    japan: '日本だけ',
    other: '日本のほかの国にもある',
    country: '国',
    tin: '納税者番号',
    row: (index) => `${String(index)}つ目の国`,
    add: '国を足す',
    remove: (index) => `${String(index)}つ目の国を外す`,
    countryRequired: '居住地国を入力してください',
  },
  usPerson: {
    label: '米国の納税義務がありますか',
    help: '米国の市民権や永住権（グリーンカード）をお持ちの方、米国に住んでいる方が当たります。',
    options: { no: 'ない', yes: 'ある' },
    tin: '米国の納税者番号',
    consent: '米国の税務当局（IRS）への口座の報告に同意します',
    consentRequired: '米国の納税義務がある方は、報告への同意が必要です',
  },
  insider: {
    label: '上場会社の役員や大株主に当たりますか',
    help: 'ご本人かご家族が上場会社の役員・大株主の場合は、その会社をお知らせください。上場株式を初めて売買する前までの届け出です。',
    options: { no: '当たらない', yes: '当たる' },
    company: '会社名',
  },
  antiSocial: {
    label: '反社会的勢力ではないことを表明し、将来も当たらないことを確約します',
    definitionTitle: '反社会的勢力とは',
    definition:
      '暴力団、暴力団員、暴力団員でなくなった時から 5 年を経過しない者、暴力団準構成員、暴力団関係企業、総会屋等、社会運動等標ぼうゴロ、特殊知能暴力集団等、その他これらに準ずる者をいいます。',
    required: 'お取引には、反社会的勢力ではないことの表明と確約が必要です',
  },
  myNumber: {
    label: 'マイナンバー（個人番号）',
    help: '12 桁の数字です。マイナンバーカードの裏面に書かれています。',
    invalid: 'マイナンバーの桁の数か、番号を確かめてください',
  },
  myNumberAccount: {
    label: 'マイナンバーで預金口座を管理することに同意しますか',
    help: '法律（預貯金口座管理法）にもとづく確認です。同意するかは自由に選べ、どちらでも口座は開けます。',
    options: { yes: '同意する', no: '同意しない' },
  },
  company: {
    name: '会社名',
    corporateNumber: '法人番号',
    corporateNumberHelp: '13 桁の数字です。入れると、会社名を補います。',
    invalidCorporateNumber: '法人番号の桁の数か、番号を確かめてください',
    found: (name) => `「${name}」を見つけました。`,
    department: '部署',
    position: '役職',
    employees: '従業員数',
    employeeBands: { '1to10': '1〜10 人', '11to50': '11〜50 人', '51to300': '51〜300 人', '301to1000': '301〜1,000 人', gt1000: '1,001 人以上' },
  },
  identity: {
    label: 'ご本人確認の方法',
    methods: {
      icSelfie: {
        label: 'IC チップと顔の撮影',
        description: 'マイナンバーカード・運転免許証などの IC チップをスマートフォンで読み取り、顔を撮影します。',
      },
      smartphoneCard: {
        label: 'スマートフォンのマイナンバーカード',
        description: 'スマートフォンに入れたマイナンバーカードで確かめます。顔の撮影は要りません。',
      },
      jpki: {
        label: 'マイナンバーカードの電子証明書',
        description: 'マイナンバーカードを読み取り、署名用のパスワード（英数字 6〜16 桁）を入力します。',
      },
      imageSelfie: { label: '書類と顔の撮影', description: '写真付きの本人確認書類と、ご自身の顔を撮影します。' },
      restrictedMail: { label: '本人限定受取郵便', description: 'ご本人だけが受け取れる郵便を送ります。届くまで数日かかります。' },
      residentRecordMail: {
        label: '住民票の写しの送付と郵便',
        description: '住民票の写しなどを送っていただき、ご住所に郵便を送ります。届くまで数日かかります。',
      },
      ageDocument: {
        label: '書類の撮影（年齢の部分だけ）',
        description: '運転免許証などの、生年月日・書類の名前・発行者の部分だけを撮影します。ほかの部分は隠してかまいません。',
      },
      cardPin: {
        label: 'マイナンバーカードと暗証番号',
        description: 'マイナンバーカードを読み取り、数字 4 桁の暗証番号を入力します。受け取るのは生年月日だけです。',
      },
      creditCard: { label: 'クレジットカードでのお支払い', description: '18 歳未満の方が通常は使えないお支払い方法で、年齢を確かめます。' },
    },
    regimes: {
      aml: '犯罪収益移転防止法により、口座を開く前にご本人確認が必要です。お手元の書類で使える方法を選んでください。',
      telecom: '携帯電話不正利用防止法により、契約の前にご本人確認が必要です。オンラインでは IC チップの読み取りなどで確かめます。',
      reuse: '古物営業法により、買取の前に住所・氏名・ご職業・年齢の確認が必要です。',
      matching: '法律（出会い系サイト規制法）により、メッセージの前に 18 歳以上であることの確認が必要です。確認には生年月日だけを使います。',
    },
    minorsNotice: '18 歳未満の方はご利用いただけません。',
    start: 'この方法で本人確認をする',
    verified: '本人確認ができました。',
    verifyRequired: '本人確認を済ませてください',
  },
  guardian: {
    name: '保護者のお名前',
    relationship: '続柄',
    relationships: { father: '父', mother: '母', other: 'その他の法定代理人' },
    email: '保護者のメールアドレス',
    emailHelp: '保護者の方にも確認のメールを送ります。',
    consent: '保護者の同意を得ています',
    consentRequired: '保護者の同意が必要です',
  },
  marketing: { label: 'お知らせやキャンペーンのメールを受け取る', description: 'いつでも受け取りを止められます。' },
  investment: {
    experience: '投資のご経験',
    experienceHelp: '商品ごとに、取引をしてきた年数を選んでください。',
    products: { stocks: '株式', funds: '投資信託', bonds: '債券', derivatives: 'FX・先物・オプション', crypto: '暗号資産' },
    levels: { none: 'なし', lt1: '1 年未満', '1to5': '1〜5 年', gte5: '5 年以上' },
    objective: '投資の方針',
    objectives: {
      stable: '元本をなるべく守りたい',
      balanced: '安定と値上がりの両方をねらいたい',
      growth: '値上がり益を重視したい',
      speculative: '短期の売買で利益をねらいたい',
    },
    income: '年収',
    incomeBands: {
      lt3: '300 万円未満',
      '3to5': '300〜500 万円',
      '5to7': '500〜700 万円',
      '7to10': '700〜1,000 万円',
      '10to20': '1,000〜2,000 万円',
      gte20: '2,000 万円以上',
    },
    assets: '金融資産',
    assetsHelp: '預貯金・株式・投資信託などの合計です。',
    assetBands: {
      lt1: '100 万円未満',
      '1to5': '100〜500 万円',
      '5to10': '500〜1,000 万円',
      '10to30': '1,000〜3,000 万円',
      '30to100': '3,000 万〜1 億円',
      gte100: '1 億円以上',
    },
  },
  employment: {
    employerName: 'お勤め先の名前',
    employerPhone: 'お勤め先の電話番号',
    type: '雇用形態',
    types: {
      regular: '正社員',
      contract: '契約社員・派遣社員',
      partTime: 'パート・アルバイト',
      selfEmployed: '自営業',
      executive: '会社役員',
      publicServant: '公務員',
      other: 'その他',
    },
    tenure: '勤続年数',
    tenureBands: { lt1: '1 年未満', '1to3': '1〜3 年', '3to5': '3〜5 年', '5to10': '5〜10 年', gte10: '10 年以上' },
    borrowings: '他社からの借り入れ',
    borrowingsHelp: 'カードローンなどの残高です。住宅ローンは含めません。',
    borrowingBands: { none: 'なし', lt50: '50 万円未満', '50to100': '50〜100 万円', '100to300': '100〜300 万円', gte300: '300 万円以上' },
  },
  occupancy: {
    occupants: '入居される人数',
    occupantCounts: { '1': '1 人', '2': '2 人', '3': '3 人', '4': '4 人', '5plus': '5 人以上' },
    guarantee: '保証の方法',
    guaranteeOptions: { company: '家賃保証会社を使う', person: '連帯保証人を立てる' },
    guaranteeNote: '個人の連帯保証人には、保証する上限の額（極度額）を契約書に定めます。',
    guarantorName: '連帯保証人のお名前',
    guarantorRelationship: '連帯保証人との続柄',
    guarantorPhone: '連帯保証人の電話番号',
  },
  relationships: { parent: '親', spouse: '配偶者', child: '子', sibling: 'きょうだい', relative: '親族', other: 'その他' },
  emergency: { name: '緊急連絡先のお名前', relationship: '続柄', phone: '緊急連絡先の電話番号' },
  medical: { history: 'これまでにかかった病気', medications: '飲んでいるお薬', allergies: 'アレルギー' },
  matching: { single: '独身です（結婚していません）', singleRequired: '独身の方だけがご利用いただけます' },
  recruiting: {
    education: '最終学歴',
    workHistory: '職歴',
    licenses: '資格',
    gender: '性別',
    scout: '企業からのスカウトを受け取る',
    scoutDescription: '経歴を企業に公開します。応募の条件ではなく、いつでも止められます。',
  },
  ticket: {
    attendee: '入場される方のお名前',
    contact: 'ご連絡先のメールアドレス',
    transferNotice: '興行主の同意のない有償での譲渡（転売）は禁止されています。',
  },
  bankAccount: 'お振込先の口座',
  steps: {
    profile: { title: 'お客様情報', description: '本人確認の書類と同じ書き方で入力してください。' },
    contact: { title: 'お名前とご連絡先', description: 'ご予約やご連絡に使います。' },
    address: { title: 'ご住所', description: '本人確認の書類と同じご住所を入力してください。郵便番号を入れると、住所の一部が入ります。' },
    delivery: { title: 'お届け先', description: 'ご注文の品のお届けに使います。あとから変えられます。' },
    work: { title: 'ご職業とお取引の目的', description: '犯罪収益移転防止法により伺います。' },
    investment: {
      title: '投資のご経験と資産',
      description: '金融商品取引法（適合性の原則）にもとづき、お客様に合った商品をご案内するために伺います。',
    },
    declarations: { title: '確認事項', description: '税法と犯罪収益移転防止法にもとづく確認です。' },
    myNumber: { title: 'マイナンバー', description: '税法により、特定口座を開くときにマイナンバーのお届けが必要です。' },
    employment: { title: 'お勤め先と収入', description: 'お支払いの見込みを確かめるために伺います。' },
    identity: { title: 'ご本人確認', description: 'お手元の書類で使える方法を選んでください。' },
    company: { title: '会社の情報', description: 'ご請求書の宛名やご案内に使います。' },
    payout: { title: 'お振込先', description: '買取の代金をお振り込みする口座です。' },
    age: {
      title: '年齢の確認',
      description: '20 歳未満の者の飲酒は法律で禁止されています。20 歳未満の方には酒類を販売しません。',
    },
    medical: { title: '問診', description: '診察のために伺います。診療のほかには使いません。' },
    emergency: { title: '緊急連絡先', description: 'ご本人と連絡がつかないときに使います。' },
    matchingProfile: { title: 'プロフィール', description: 'ほかの方に見えるのは、ニックネーム・年齢・都道府県です。' },
    career: { title: '学歴と職歴', description: '選考に必要な範囲で伺います。本籍やご家族のことは伺いません。' },
    occupancy: { title: '入居と保証', description: '入居される方の人数と、家賃の保証の方法を伺います。' },
    attendee: { title: '入場される方', description: '転売防止のため、入場される方のお名前とご連絡先を確かめます。' },
    guardian: {
      title: '保護者の同意',
      description: '18 歳未満の方は、保護者の同意が必要です。保護者の方にも確認のメールを送ります。',
    },
  },
  presets: {
    bank: {
      title: '銀行口座',
      description:
        '口座を開く前に、ご本人確認と、ご職業・お取引の目的を確かめます。税法による居住地国の届け出と、マイナンバーで口座を管理するかのご確認もあります。',
    },
    securities: {
      title: '証券口座',
      description:
        '口座を開く前に、ご本人確認・ご職業・お取引の目的に加えて、投資のご経験と資産を伺います。特定口座にはマイナンバーのお届けが必要です。',
    },
    crypto: {
      title: '暗号資産の口座',
      description: '口座を開く前に、ご本人確認と、ご職業・お取引の目的を確かめます。暗号資産の取引にも、居住地国の届け出が必要です。',
    },
    wallet: {
      title: '送金・電子マネー',
      description: '送金や、高い額の残高の移し替えを使う前に、ご本人確認が必要です。支払いだけなら、メールアドレスだけで使い始められます。',
    },
    card: {
      title: 'クレジットカード',
      description: 'カードを発行する前に、ご本人確認と、お支払いの見込み（年収・借り入れ）を確かめます。',
      steps: { employment: '割賦販売法により、カードを発行する前にお支払いの見込みを確かめます。' },
    },
    ec: { title: '通販', description: '登録はメールアドレスだけで済みます。お届け先は、初めてのご注文の前までに伺います。' },
    liquor: { title: '酒類の通販', description: 'お酒のご注文には、生年月日の入力が必要です。' },
    b2b: { title: '法人向けのサービス', description: '会社のメールアドレスは必須にしません。法人番号を入れると、会社名を補います。' },
    reuse: {
      title: '買取（古物）',
      description:
        '査定の申し込みまでは、メールアドレスだけで進めます。買取の前に、住所・氏名・ご職業・年齢と、ご本人確認が必要です。1 万円未満でも、ゲーム・CD・DVD・書籍などは確認が必要です。',
    },
    healthcare: {
      title: 'オンライン診療',
      description: 'ご予約には、お名前・生年月日・ご連絡先を伺います。初めての診察では、顔写真付きの本人確認書類を画面越しに確かめます。',
      steps: { address: 'お薬の配送に使います。配送が要らなければ飛ばせます。' },
    },
    matching: {
      title: 'マッチング',
      description: 'プロフィールを公開したり、メッセージを送ったりする前に、18 歳以上であることを確かめます。',
      steps: { declarations: '安心して使っていただくための確認です。' },
    },
    recruiting: {
      title: '求人・転職',
      description: '応募に必要な範囲だけを伺います。性別は任意で、本籍・ご家族・宗教などは伺いません。',
      steps: { contact: '応募先からのご連絡に使います。' },
    },
    rental: {
      title: '賃貸の入居申込み',
      description: '入居の審査のために、お勤め先・年収・保証の方法・緊急連絡先を伺います。',
      steps: { address: '今お住まいのご住所を入力してください。', employment: '入居の審査のために伺います。' },
    },
    ticket: { title: 'チケット', description: '購入のときに、入場される方のお名前とご連絡先を確かめます（転売防止）。' },
    telecom: { title: '携帯電話・SIM', description: '契約の前にご本人確認が必要です。オンラインでは、IC チップの読み取りなどで確かめます。' },
  },
  laws: {
    aml: '犯罪収益移転防止法',
    taxTreaty: '租税条約等実施特例法',
    fatca: 'FATCA（米国の法律）',
    depositMyNumber: '預貯金口座管理法',
    incomeTax: '所得税法',
    specialTaxation: '租税特別措置法',
    fiea: '金融商品取引法',
    jsda: '日本証券業協会の規則',
    installment: '割賦販売法',
    paymentServices: '資金決済法',
    commerce: '特定商取引法',
    underageDrinking: '二十歳未満の者の飲酒の禁止に関する法律',
    liquorBusiness: '酒類業組合法',
    mail: '特定電子メール法',
    privacy: '個人情報保護法',
    civil: '民法',
    secondhand: '古物営業法',
    onlineMedical: 'オンライン診療の適切な実施に関する指針',
    datingSites: '出会い系サイト規制法',
    employmentSecurity: '職業安定法',
    ticketResale: 'チケット不正転売禁止法',
    mobilePhone: '携帯電話不正利用防止法',
    consumptionTax: '消費税法',
  },
};

export const englishRegistrationLabels: RegistrationLabels = {
  locale: 'en-US',
  name: 'Name',
  birthDate: 'Date of birth',
  phone: 'Phone number',
  address: 'Address',
  email: 'Email address',
  gender: 'Gender',
  genders: { male: 'Male', female: 'Female', other: 'Other', unanswered: 'Prefer not to say' },
  nickname: 'Nickname',
  prefecture: 'Prefecture you live in',
  choose: 'Select',
  notAnswered: 'Not answered',
  yes: 'Yes',
  no: 'No',
  list: (items) => items.join(', '),
  note: (text, note) => `${text} (${note})`,
  required: (label) => `Fill in “${label}”`,
  chooseRequired: (label) => `Choose an option for “${label}”`,
  answerRequired: 'Choose an answer',
  underAge: (age) => `You must be ${String(age)} or older to use this service`,
  occupation: {
    label: 'Occupation',
    options: {
      executive: 'Company or organization executive',
      employee: 'Company or organization employee',
      publicServant: 'Public servant',
      selfEmployed: 'Self-employed',
      partTime: 'Part-time, temporary or contract worker',
      homemaker: 'Homemaker',
      student: 'Student',
      retired: 'Retired or not employed',
      other: 'Other',
    },
  },
  employer: 'Employer',
  purposes: {
    label: 'Purpose of your transactions',
    help: 'Select all that apply.',
    deposit: {
      living: 'Living expenses',
      business: 'Business expenses',
      salary: 'Receiving salary or pension',
      savings: 'Savings and investment',
      loan: 'Loans',
      forex: 'Foreign exchange',
      other: 'Other',
    },
    securities: { longTerm: 'Medium- to long-term investment', shortTerm: 'Short-term trading', income: 'Dividends and interest', other: 'Other' },
    crypto: { investment: 'Investment', payment: 'Paying for goods and services', remittance: 'Sending money', business: 'Business use', other: 'Other' },
    remittance: { living: 'Paying living expenses', personal: 'Sending money to people', business: 'Business payments', overseas: 'Sending money abroad', other: 'Other' },
    card: { living: 'Living expenses', business: 'Business expenses', other: 'Other' },
  },
  peps: {
    label: 'Are you a foreign politically exposed person (PEP)?',
    help: 'This includes heads of state, ministers, central bank executives and others who hold or have held a prominent public position in a foreign country, and their families. Public offices in Japan do not count.',
    options: { no: 'No', yes: 'Yes' },
  },
  taxResidency: {
    label: 'Country of tax residence',
    help: 'The country where you pay taxes. If you are a tax resident of other countries as well, add each country and your taxpayer identification number.',
    japan: 'Japan only',
    other: 'Japan and other countries',
    country: 'Country',
    tin: 'Taxpayer identification number',
    row: (index) => `Country ${String(index)}`,
    add: 'Add a country',
    remove: (index) => `Remove country ${String(index)}`,
    countryRequired: 'Enter your country of tax residence',
  },
  usPerson: {
    label: 'Are you a U.S. taxpayer?',
    help: 'This includes U.S. citizens, green card holders and people who live in the United States.',
    options: { no: 'No', yes: 'Yes' },
    tin: 'U.S. taxpayer identification number',
    consent: 'I agree that my account may be reported to the U.S. Internal Revenue Service (IRS)',
    consentRequired: 'U.S. taxpayers must agree to the reporting',
  },
  insider: {
    label: 'Are you an executive or major shareholder of a listed company?',
    help: 'If you or a family member is an executive or major shareholder of a listed company, tell us the company. You need to report this before you first trade listed shares.',
    options: { no: 'No', yes: 'Yes' },
    company: 'Company name',
  },
  antiSocial: {
    label: 'I declare that I am not, and will not become, a member of an anti-social force',
    definitionTitle: 'What counts as an anti-social force',
    definition:
      'Organized crime groups, their members, people who left such a group less than five years ago, associate members, companies related to organized crime, corporate racketeers, groups using social or political movements as a front for crime, special intelligence violence groups, and anyone similar to these.',
    required: 'You need to make this declaration to do business with us',
  },
  myNumber: {
    label: 'My Number (Individual Number)',
    help: 'The 12-digit number printed on the back of your My Number Card.',
    invalid: 'Check the number of digits and the number itself',
  },
  myNumberAccount: {
    label: 'Do you agree to link this deposit account to your My Number?',
    help: 'We are required to ask this by law (the Act on the Management of Deposit Accounts with Individual Numbers). You are free to choose, and either way you can open the account.',
    options: { yes: 'I agree', no: 'I do not agree' },
  },
  company: {
    name: 'Company name',
    corporateNumber: 'Corporate number',
    corporateNumberHelp: 'A 13-digit number. Enter it and we will fill in the company name.',
    invalidCorporateNumber: 'Check the number of digits and the number itself',
    found: (name) => `Found “${name}”.`,
    department: 'Department',
    position: 'Job title',
    employees: 'Number of employees',
    employeeBands: { '1to10': '1–10', '11to50': '11–50', '51to300': '51–300', '301to1000': '301–1,000', gt1000: '1,001 or more' },
  },
  identity: {
    label: 'How to verify your identity',
    methods: {
      icSelfie: { label: 'IC chip and a selfie', description: 'Scan the IC chip of your My Number Card or driver’s license with your phone, then take a photo of your face.' },
      smartphoneCard: { label: 'My Number Card on your phone', description: 'Verify with the My Number Card stored on your smartphone. No selfie needed.' },
      jpki: { label: 'My Number Card certificate', description: 'Scan your My Number Card and enter your signature password (6–16 letters and numbers).' },
      imageSelfie: { label: 'Photos of your ID and your face', description: 'Take a photo of your photo ID and a photo of your face.' },
      restrictedMail: { label: 'Restricted delivery mail', description: 'We send mail that only you can receive. It takes a few days to arrive.' },
      residentRecordMail: {
        label: 'Resident record and mail',
        description: 'Send us a copy of your resident record, and we will send mail to your address. It takes a few days to arrive.',
      },
      ageDocument: {
        label: 'Photo of your ID (age only)',
        description: 'Take a photo of only the date of birth, document name and issuer on your driver’s license or other ID. You may cover the rest.',
      },
      cardPin: { label: 'My Number Card and PIN', description: 'Scan your My Number Card and enter your 4-digit PIN. We receive only your date of birth.' },
      creditCard: { label: 'Paying by credit card', description: 'We confirm your age with a payment method that people under 18 usually cannot use.' },
    },
    regimes: {
      aml: 'Japanese anti-money-laundering law requires us to verify your identity before you open an account. Choose a method that works with the documents you have.',
      telecom: 'Japanese law requires us to verify your identity before you sign a mobile contract. Online, we verify you by reading an IC chip or a similar method.',
      reuse: 'Japanese secondhand goods law requires us to confirm your address, name, occupation and age before we buy your items.',
      matching: 'Japanese law requires us to confirm that you are 18 or older before you can send messages. We use only your date of birth.',
    },
    minorsNotice: 'People under 18 cannot use this service.',
    start: 'Verify with this method',
    verified: 'Your identity has been verified.',
    verifyRequired: 'Complete identity verification',
  },
  guardian: {
    name: 'Parent or guardian’s name',
    relationship: 'Relationship',
    relationships: { father: 'Father', mother: 'Mother', other: 'Other legal guardian' },
    email: 'Parent or guardian’s email address',
    emailHelp: 'We will also send them a confirmation email.',
    consent: 'My parent or guardian has agreed',
    consentRequired: 'You need consent from a parent or guardian',
  },
  marketing: { label: 'Send me news and offers by email', description: 'You can unsubscribe at any time.' },
  investment: {
    experience: 'Investment experience',
    experienceHelp: 'For each product, choose how long you have been trading it.',
    products: { stocks: 'Stocks', funds: 'Mutual funds', bonds: 'Bonds', derivatives: 'FX, futures and options', crypto: 'Crypto assets' },
    levels: { none: 'None', lt1: 'Less than a year', '1to5': '1–5 years', gte5: '5 years or more' },
    objective: 'Investment approach',
    objectives: {
      stable: 'Protect my principal',
      balanced: 'Balance stability and growth',
      growth: 'Focus on capital gains',
      speculative: 'Profit from short-term trading',
    },
    income: 'Annual income',
    incomeBands: {
      lt3: 'Under ¥3 million',
      '3to5': '¥3–5 million',
      '5to7': '¥5–7 million',
      '7to10': '¥7–10 million',
      '10to20': '¥10–20 million',
      gte20: '¥20 million or more',
    },
    assets: 'Financial assets',
    assetsHelp: 'The total of your savings, stocks, mutual funds and similar assets.',
    assetBands: {
      lt1: 'Under ¥1 million',
      '1to5': '¥1–5 million',
      '5to10': '¥5–10 million',
      '10to30': '¥10–30 million',
      '30to100': '¥30–100 million',
      gte100: '¥100 million or more',
    },
  },
  employment: {
    employerName: 'Employer name',
    employerPhone: 'Employer phone number',
    type: 'Employment type',
    types: {
      regular: 'Full-time employee',
      contract: 'Contract or temporary employee',
      partTime: 'Part-time',
      selfEmployed: 'Self-employed',
      executive: 'Company executive',
      publicServant: 'Public servant',
      other: 'Other',
    },
    tenure: 'Years at current job',
    tenureBands: { lt1: 'Less than a year', '1to3': '1–3 years', '3to5': '3–5 years', '5to10': '5–10 years', gte10: '10 years or more' },
    borrowings: 'Borrowing from other lenders',
    borrowingsHelp: 'Balances of card loans and similar. Do not include your mortgage.',
    borrowingBands: { none: 'None', lt50: 'Under ¥500,000', '50to100': '¥500,000–1 million', '100to300': '¥1–3 million', gte300: '¥3 million or more' },
  },
  occupancy: {
    occupants: 'Number of people moving in',
    occupantCounts: { '1': '1', '2': '2', '3': '3', '4': '4', '5plus': '5 or more' },
    guarantee: 'Rent guarantee',
    guaranteeOptions: { company: 'Use a rent guarantee company', person: 'Name a joint guarantor' },
    guaranteeNote: 'For an individual guarantor, the lease sets the maximum amount they guarantee.',
    guarantorName: 'Guarantor’s name',
    guarantorRelationship: 'Your relationship to the guarantor',
    guarantorPhone: 'Guarantor’s phone number',
  },
  relationships: { parent: 'Parent', spouse: 'Spouse', child: 'Child', sibling: 'Sibling', relative: 'Relative', other: 'Other' },
  emergency: { name: 'Emergency contact name', relationship: 'Relationship', phone: 'Emergency contact phone number' },
  medical: { history: 'Past illnesses', medications: 'Medications you take', allergies: 'Allergies' },
  matching: { single: 'I am single (not married)', singleRequired: 'This service is only for people who are single' },
  recruiting: {
    education: 'Highest level of education',
    workHistory: 'Work history',
    licenses: 'Qualifications',
    gender: 'Gender',
    scout: 'Receive offers from companies',
    scoutDescription: 'Your profile will be visible to companies. This is not required to apply, and you can stop at any time.',
  },
  ticket: {
    attendee: 'Name of the person attending',
    contact: 'Contact email address',
    transferNotice: 'Reselling tickets for profit without the organizer’s permission is prohibited.',
  },
  bankAccount: 'Bank account for payment',
  steps: {
    profile: { title: 'Your details', description: 'Enter them exactly as they appear on your ID.' },
    contact: { title: 'Name and contact details', description: 'We use these for bookings and to contact you.' },
    address: { title: 'Address', description: 'Enter the address on your ID. Enter your postal code and we will fill in part of the address.' },
    delivery: { title: 'Delivery address', description: 'We use this to deliver your orders. You can change it later.' },
    work: { title: 'Occupation and purpose', description: 'Japanese anti-money-laundering law requires us to ask.' },
    investment: {
      title: 'Investment experience and assets',
      description: 'Japanese securities law (the suitability rule) asks us to recommend only products that suit you.',
    },
    declarations: { title: 'Declarations', description: 'Required by tax law and anti-money-laundering law.' },
    myNumber: { title: 'My Number', description: 'Tax law requires your My Number when you open a specified account.' },
    employment: { title: 'Employment and income', description: 'We ask to check that you will be able to pay.' },
    identity: { title: 'Identity verification', description: 'Choose a method that works with the documents you have.' },
    company: { title: 'Company details', description: 'We use these for your invoices and to contact you.' },
    payout: { title: 'Payment account', description: 'The bank account we pay you for your items.' },
    age: {
      title: 'Age verification',
      description: 'Drinking under the age of 20 is prohibited by law. We do not sell alcohol to people under 20.',
    },
    medical: { title: 'Medical questionnaire', description: 'We ask for your consultation and use it only for your care.' },
    emergency: { title: 'Emergency contact', description: 'We use this only if we cannot reach you.' },
    matchingProfile: { title: 'Profile', description: 'Others can see your nickname, age and prefecture.' },
    career: { title: 'Education and work history', description: 'We ask only what is needed for screening. We never ask about your registered domicile or family.' },
    occupancy: { title: 'Occupants and guarantee', description: 'How many people will move in, and how the rent is guaranteed.' },
    attendee: { title: 'Attendee', description: 'To prevent resale, we confirm the name and contact details of the person attending.' },
    guardian: { title: 'Parental consent', description: 'If you are under 18, you need consent from a parent or guardian. We will also email them.' },
  },
  presets: {
    bank: {
      title: 'Bank account',
      description:
        'Before you open an account, we verify your identity and confirm your occupation and purpose. You also declare your country of tax residence and whether to link your My Number.',
    },
    securities: {
      title: 'Brokerage account',
      description:
        'Before you open an account, we verify your identity, occupation and purpose, and ask about your investment experience and assets. A specified account requires your My Number.',
    },
    crypto: {
      title: 'Crypto account',
      description: 'Before you open an account, we verify your identity and confirm your occupation and purpose. Crypto trading also requires a tax residence declaration.',
    },
    wallet: {
      title: 'Money transfer and e-money',
      description: 'You need to verify your identity before sending money or moving large balances. To only pay, an email address is enough to start.',
    },
    card: {
      title: 'Credit card',
      description: 'Before we issue a card, we verify your identity and check that you will be able to pay (income and borrowing).',
      steps: { employment: 'Japanese installment sales law requires us to check that you can pay before we issue a card.' },
    },
    ec: { title: 'Online shop', description: 'An email address is all you need to sign up. We ask for a delivery address before your first order.' },
    liquor: { title: 'Alcohol shop', description: 'Ordering alcohol requires your date of birth.' },
    b2b: { title: 'Business service', description: 'A company email address is not required. Enter your corporate number and we will fill in the company name.' },
    reuse: {
      title: 'Buyback (secondhand goods)',
      description:
        'You can request a quote with just your email address. Before we buy your items, we confirm your address, name, occupation and age and verify your identity. Games, CDs, DVDs and books need this check even under ¥10,000.',
    },
    healthcare: {
      title: 'Online consultation',
      description: 'To book, we ask for your name, date of birth and contact details. At your first consultation, the doctor checks your photo ID on screen.',
      steps: { address: 'We use this to deliver your medication. You can skip it if you do not need delivery.' },
    },
    matching: {
      title: 'Matching app',
      description: 'Before you publish a profile or send messages, we confirm that you are 18 or older.',
      steps: { declarations: 'These help keep the service safe.' },
    },
    recruiting: {
      title: 'Jobs',
      description: 'We ask only what is needed to apply. Gender is optional, and we never ask about your registered domicile, family or religion.',
      steps: { contact: 'Companies you apply to use these to contact you.' },
    },
    rental: {
      title: 'Rental application',
      description: 'For screening, we ask about your employer, income, rent guarantee and emergency contact.',
      steps: { address: 'Enter your current address.', employment: 'We ask for the tenant screening.' },
    },
    ticket: { title: 'Tickets', description: 'When you buy, we confirm the name and contact details of the person attending (to prevent resale).' },
    telecom: { title: 'Mobile phone and SIM', description: 'You need to verify your identity before you sign the contract. Online, we read an IC chip or use a similar method.' },
  },
  laws: {
    aml: 'Act on Prevention of Transfer of Criminal Proceeds',
    taxTreaty: 'Act on Special Provisions for the Implementation of Tax Treaties',
    fatca: 'FATCA (U.S. law)',
    depositMyNumber: 'Act on the Management of Deposit Accounts with Individual Numbers',
    incomeTax: 'Income Tax Act',
    specialTaxation: 'Act on Special Measures Concerning Taxation',
    fiea: 'Financial Instruments and Exchange Act',
    jsda: 'Japan Securities Dealers Association rules',
    installment: 'Installment Sales Act',
    paymentServices: 'Payment Services Act',
    commerce: 'Act on Specified Commercial Transactions',
    underageDrinking: 'Act on Prohibition of Drinking by Persons under 20',
    liquorBusiness: 'Act on Securing of Liquor Tax and on Liquor Business Associations',
    mail: 'Act on Regulation of Transmission of Specified Electronic Mail',
    privacy: 'Act on the Protection of Personal Information',
    civil: 'Civil Code',
    secondhand: 'Secondhand Articles Dealer Act',
    onlineMedical: 'Guidelines for the Appropriate Practice of Online Medical Care',
    datingSites: 'Act on Regulation of Soliciting Children by Using Opposite Sex Introducing Service on Internet',
    employmentSecurity: 'Employment Security Act',
    ticketResale: 'Act on Prohibition of Unauthorized Resale of Specified Performance Entrance Tickets',
    mobilePhone: 'Act on Identification by Mobile Phone Carriers and Prevention of Improper Use',
    consumptionTax: 'Consumption Tax Act',
  },
};

/** 登録の文言。SiteProvider の registrationLabels か、無ければ GassanProvider の言語（ja で始まれば日本語、ほかは英語）。 */
export function useRegistrationLabels(): RegistrationLabels {
  const { registrationLabels } = useSiteConfig();
  const { locale } = useLabels();
  return registrationLabels ?? (locale.toLowerCase().startsWith('ja') ? japaneseRegistrationLabels : englishRegistrationLabels);
}
