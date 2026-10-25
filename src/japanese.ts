/**
 * 日本の入力の揺れをそろえる関数。I-25。
 *
 * 全角と半角・ハイフンの種類・ひらがなとカタカナ・電話番号の書き方の違いを、エラーにせず決まった形にそろえる。
 * 「全角で入力してください」「半角で入力してください」と利用者に直させるのではなく、受け取った側で直す。
 * どれも純粋な関数で、Input の normalize に渡せる（打つたびに当てても、打ち途中の文字列を壊さない）。
 * 入力欄の部品（AddressFields・NameFields など）も同じものを使う。
 */

/* -------------------------------------------------------------------------- */
/* 全角と半角                                                                  */
/* -------------------------------------------------------------------------- */

const HALF_KANA = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ';
const FULL_KANA = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜';
/*
 * 先頭で値を作る関数の呼び出しは、副作用があるかもしれないと見なされ、使わないアプリの束にも残る。
 * 表は初めて使うときに作り、符号から作る文字には /* @__PURE__ *\/ を付ける。
 */
let kanaTables: { halfToFull: Map<string, string>; fullToHalf: Map<string, string> } | null = null;
function kanaTable(direction: 'halfToFull' | 'fullToHalf'): Map<string, string> {
  kanaTables ??= {
    halfToFull: new Map([...HALF_KANA].map((ch, index) => [ch, FULL_KANA[index] ?? ch])),
    fullToHalf: new Map([...FULL_KANA].map((ch, index) => [ch, HALF_KANA[index] ?? ch])),
  };
  return kanaTables[direction];
}

/* 見えない文字はソースに書かず、符号から作る（全角の空白、結合用の濁点と半濁点）。 */
const IDEOGRAPHIC_SPACE = /* @__PURE__ */ String.fromCharCode(0x3000);
const COMBINING_DAKUTEN = /* @__PURE__ */ String.fromCharCode(0x3099);
const COMBINING_HANDAKUTEN = /* @__PURE__ */ String.fromCharCode(0x309a);

/** 濁点（゛）・半濁点（゜）を前のかなと 1 文字に合わせる（カ゛ → ガ）。合わせられない組はそのまま。 */
function composeKana(value: string): string {
  return value.normalize('NFC').replace(/([ぁ-ゖァ-ヺ])([゛゜])/g, (pair, base: string, mark: string) => {
    const combined = (base + (mark === '゛' ? COMBINING_DAKUTEN : COMBINING_HANDAKUTEN)).normalize('NFC');
    return combined.length === 1 ? combined : pair;
  });
}

/** 半角カタカナ（ｱ〜ﾝ と句読点）を全角に。濁点・半濁点は前の文字と合わせる（ｶﾞ → ガ、ｳﾞ → ヴ）。 */
function halfKanaToFull(value: string): string {
  const table = kanaTable('halfToFull');
  return composeKana([...value].map((ch) => table.get(ch) ?? ch).join(''));
}

/** 全角の英数字と記号（！〜～）・全角の空白を半角に。かなと漢字はそのまま。 */
export function toHalfWidth(value: string): string {
  return value
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .split(IDEOGRAPHIC_SPACE)
    .join(' ');
}

/** 半角の英数字と記号・半角の空白を全角に、半角カタカナを全角カタカナに。漢字はそのまま。 */
export function toFullWidth(value: string): string {
  return halfKanaToFull(value.replace(/[!-~]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0xfee0)).replace(/ /g, IDEOGRAPHIC_SPACE));
}

/**
 * 文字の幅を、日本で一般的な形にそろえる。英数字・記号・空白は半角に、半角カタカナは全角に。
 * 名前・会社名など、決まった書き方の無い文の欄に使う。
 */
export function normalizeText(value: string): string {
  return toHalfWidth(halfKanaToFull(value));
}

/** ハイフンに見える文字（‐ ‑ ‒ – — ― − ﹣。全角の － は toHalfWidth が「-」にする）。 */
const HYPHENS = /[‐-―−﹣]/g;

/**
 * 住所の書き方をそろえる。normalizeText に加えて、ハイフンの仲間を「-」に（番地の「1−2−3」「１ー２ー３」→「1-2-3」）。
 * 長音（ー ｰ）は数字に挟まれたときだけハイフンとみなし、カタカナの長音（メゾンドール）は残す。
 */
export function normalizeAddress(value: string): string {
  return normalizeText(value)
    .replace(HYPHENS, '-')
    .replace(/(\d)[ーｰ](?=\d)/g, '$1-');
}

/* -------------------------------------------------------------------------- */
/* ひらがなとカタカナ                                                          */
/* -------------------------------------------------------------------------- */

/** ひらがな・半角カタカナを全角カタカナに（フリガナの欄）。ゝゞ も ヽヾ に。 */
export function toKatakana(value: string): string {
  return halfKanaToFull(value).replace(/[ぁ-ゖゝゞ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

/** カタカナ・半角カタカナをひらがなに（ふりがなの欄）。ひらがなの無い文字（ヷ ヸ ヹ ヺ）はそのまま。 */
export function toHiragana(value: string): string {
  return halfKanaToFull(value).replace(/[ァ-ヶヽヾ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** かな（ひらがな・カタカナ・長音・中黒・空白）だけか。フリガナの欄で、漢字やローマ字が残ったときだけ知らせるため。 */
export function isKana(value: string): boolean {
  return /^[ぁ-ゖゝゞァ-ヺーヽヾ・\s]*$/.test(halfKanaToFull(value));
}

const SMALL_KANA: Record<string, string> = {
  ァ: 'ア', ィ: 'イ', ゥ: 'ウ', ェ: 'エ', ォ: 'オ', ッ: 'ツ', ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ', ヮ: 'ワ', ヵ: 'カ', ヶ: 'ケ',
};

/**
 * 銀行の口座名義の形（全銀の文字）にそろえる。かなを半角カタカナに、濁点を分け（ガ → ｶﾞ）、
 * 小さいかなを大きく（ャ → ﾔ。全銀の文字に小書きは無い）、英字を大文字に、長音を「-」に、中黒と全角の空白を半角の空白に。
 * 画面には全角で見せ、送るときに通すことを勧める（半角カタカナは読みにくい）。
 */
export function toZenginKana(value: string): string {
  const katakana = toKatakana(toHalfWidth(value)).toUpperCase();
  const table = kanaTable('fullToHalf');
  return [...katakana.normalize('NFD')]
    .map((ch) => {
      if (ch === COMBINING_DAKUTEN) return 'ﾞ';
      if (ch === COMBINING_HANDAKUTEN) return 'ﾟ';
      if (ch === 'ー' || ch === 'ｰ') return '-';
      if (ch === '・' || ch === '･') return ' ';
      const large = SMALL_KANA[ch] ?? ch;
      return table.get(large) ?? large;
    })
    .join('');
}

/* -------------------------------------------------------------------------- */
/* 番号                                                                        */
/* -------------------------------------------------------------------------- */

/** 数字だけを取り出す（全角の数字も）。 */
export function digitsOf(value: string): string {
  return toHalfWidth(value).replace(/\D/g, '');
}

/**
 * 番号の書き方として許す文字（数字・空白・ハイフンの仲間・長音・括弧・+・〒。全角も）。
 * 見分ける関数（is〜）は書き方を問わないが、英字・かな・漢字が混ざった値は番号とみなさない。
 */
const NUMBERISH = /^[\d０-９\s\-‐-―−－﹣ーｰ()（）+＋〒]*$/;

/**
 * 郵便番号を「123-4567」にそろえる。7 桁に足りない間は打った分だけ（3 桁を超えたらハイフンを入れる）。
 * 〒・空白・全角・ハイフンの種類を問わず、住所ごと貼り付けても先頭の 7 桁を拾う。
 */
export function formatPostalCode(value: string): string {
  const digits = digitsOf(value).slice(0, 7);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

/** 郵便番号の 7 桁がそろっているか（書き方は問わない）。 */
export function isPostalCode(value: string): boolean {
  return NUMBERISH.test(value) && /^\d{7}$/.test(digitsOf(value));
}

/**
 * 日本の電話番号を数字だけにそろえる（「090-1234-5678」「（03）1234−5678」「+81 90 1234 5678」→ 数字だけ）。
 * 全角・ハイフンの種類・空白・括弧を問わない。国番号の +81 は 0 に直す。
 * 打っている途中の「+」「+8」「+81」はそのまま残し、続けて数字を打ったところで 0 から始まる形に直す。
 */
export function normalizePhone(value: string): string {
  const compact = toHalfWidth(value).replace(/[^\d+]/g, '');
  if (compact.startsWith('+') && '+81'.startsWith(compact)) return compact;
  if (compact.startsWith('+81')) {
    const rest = compact.slice(3).replace(/\+/g, '');
    return rest.startsWith('0') ? rest : `0${rest}`;
  }
  return compact.replace(/\+/g, '');
}

/**
 * 日本の電話番号の桁の数として正しいか。0X0（携帯・IP 電話など）と 0800 は 11 桁、ほか（固定・0120・0570）は 10 桁。
 * 書き方は問わない。市外局番の区切りは見ない。
 */
export function isPhoneNumber(value: string): boolean {
  const digits = normalizePhone(value);
  if (!NUMBERISH.test(value) || !/^0\d+$/.test(digits)) return false;
  return /^0(?:[2-9]0|800)/.test(digits) ? digits.length === 11 : digits.length === 10;
}

/** 携帯電話の番号（060・070・080・090 の 11 桁）か。SMS で確認コードを送れる番号かを見分けるため。 */
export function isMobilePhone(value: string): boolean {
  return isPhoneNumber(value) && /^0[6-9]0/.test(normalizePhone(value));
}

/**
 * 法人番号（13 桁）の検査用数字が合っているか。
 * 先頭の 1 桁が検査用数字で、9 −（下から n 桁目の数 × (n が奇数なら 1、偶数なら 2) の和 ÷ 9 の余り）。
 */
export function isCorporateNumber(value: string): boolean {
  const digits = digitsOf(value);
  if (!NUMBERISH.test(value) || !/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let n = 1; n <= 12; n += 1) sum += Number(digits[13 - n]) * (n % 2 === 1 ? 1 : 2);
  return Number(digits[0]) === 9 - (sum % 9);
}

/**
 * 適格請求書発行事業者の登録番号を「T1234567890123」にそろえる（t・全角・空白・ハイフンを問わない）。
 * 数字から打ち始めても頭に T を付ける。
 */
export function normalizeInvoiceNumber(value: string): string {
  const compact = toHalfWidth(value).toUpperCase().replace(/[^\dT]/g, '');
  const digits = compact.replace(/T/g, '').slice(0, 13);
  return compact.length > 0 ? `T${digits}` : '';
}

/**
 * 適格請求書発行事業者の登録番号の形か（T と 13 桁の数字）。
 * 個人の事業者の番号は法人番号と別の番号なので、検査用数字までは見ない（正しい番号を弾かない）。
 */
export function isInvoiceNumber(value: string): boolean {
  return NUMBERISH.test(value.replace(/^\s*[TtＴｔ]/, '')) && /^T\d{13}$/.test(normalizeInvoiceNumber(value));
}

/**
 * 個人番号（マイナンバー、12 桁）の検査用数字が合っているか。打ち間違いを見つけるだけで、番号が実在するかは分からない。
 * 末尾の 1 桁が検査用数字で、11 −（下から n 桁目の数 × (n ≤ 6 なら n + 1、それより上は n − 5) の和 ÷ 11 の余り）。余りが 1 以下なら 0。
 * 番号を集めてよい目的と保管の仕方は番号法に従うこと。
 */
export function isMyNumber(value: string): boolean {
  const digits = digitsOf(value);
  if (!NUMBERISH.test(value) || !/^\d{12}$/.test(digits)) return false;
  let sum = 0;
  for (let n = 1; n <= 11; n += 1) sum += Number(digits[11 - n]) * (n <= 6 ? n + 1 : n - 5);
  const rest = sum % 11;
  return Number(digits[11]) === (rest <= 1 ? 0 : 11 - rest);
}

/* -------------------------------------------------------------------------- */
/* ゆうちょ銀行                                                                */
/* -------------------------------------------------------------------------- */

/** ゆうちょ銀行の全銀の金融機関コード。 */
export const YUCHO_BANK_CODE = '9900';

export interface YuchoTransferAccount {
  /** 店番（3 桁）。 */
  branchCode: string;
  /** 店名（「〇一八」。店番を漢数字にしたもの）。 */
  branchName: string;
  accountType: 'ordinary' | 'checking';
  /** 口座番号（7 桁）。 */
  accountNumber: string;
}

const KANJI_DIGITS = '〇一二三四五六七八九';

/**
 * ゆうちょ銀行の記号・番号を、ほかの銀行から振り込むときの店名・口座番号に直す。形が違えば null。
 * - 通常貯金（記号が 1 で始まる 5 桁、番号は末尾が 1 の 8 桁まで）: 店番は記号の 2〜3 桁目に 8 を付けた 3 桁、種目は普通、
 *   口座番号は番号の末尾の 1 を除いた 7 桁（足りない分は頭に 0）
 * - 振替口座（記号が 0 で始まる 5 桁、番号は 7 桁まで）: 店番は記号の 2〜3 桁目に 9 を付けた 3 桁、種目は当座、口座番号は番号を 7 桁に
 */
export function yuchoToBranch(symbol: string, number: string): YuchoTransferAccount | null {
  const s = digitsOf(symbol);
  const n = digitsOf(number);
  if (!/^\d{5}$/.test(s) || n.length === 0) return null;
  const account = (code: string, accountType: 'ordinary' | 'checking', accountNumber: string): YuchoTransferAccount => ({
    branchCode: code,
    branchName: [...code].map((digit) => KANJI_DIGITS[Number(digit)]).join(''),
    accountType,
    accountNumber,
  });
  if (s.startsWith('1')) {
    if (n.length > 8 || !n.endsWith('1')) return null;
    return account(`${s.slice(1, 3)}8`, 'ordinary', n.slice(0, -1).padStart(7, '0'));
  }
  if (s.startsWith('0')) {
    if (n.length > 7) return null;
    return account(`${s.slice(1, 3)}9`, 'checking', n.padStart(7, '0'));
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* メールアドレス                                                              */
/* -------------------------------------------------------------------------- */

/** よく使われるドメイン。打ち間違いの候補（suggestEmail）を出すため。 */
export const COMMON_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com', 'yahoo.co.jp', 'ymail.ne.jp', 'icloud.com', 'me.com', 'outlook.jp', 'outlook.com', 'hotmail.com', 'hotmail.co.jp', 'live.jp',
  'docomo.ne.jp', 'ezweb.ne.jp', 'au.com', 'softbank.ne.jp', 'i.softbank.jp', 'ymobile.ne.jp', 'rakumail.jp', 'uqmobile.jp', 'nifty.com', 'biglobe.ne.jp', 'ocn.ne.jp',
];

/** 携帯会社のメール。迷惑メールの設定で、知らない送り主のメールを受け取らないことが多い。 */
export const CARRIER_EMAIL_DOMAINS: readonly string[] = ['docomo.ne.jp', 'ezweb.ne.jp', 'au.com', 'softbank.ne.jp', 'i.softbank.jp', 'ymobile.ne.jp', 'rakumail.jp', 'uqmobile.jp'];

/**
 * メールアドレスを打ち間違いの少ない形に。全角を半角に、IME のまま打った「。」「ー」を「.」「-」に、空白を落とし、
 * ドメイン（@ の後ろ）を小文字に。@ の前の大文字と小文字は変えない。
 */
export function normalizeEmail(value: string): string {
  const half = toHalfWidth(value).replace(/。/g, '.').replace(/[ーｰ]/g, '-').replace(HYPHENS, '-').replace(/\s+/g, '');
  const at = half.lastIndexOf('@');
  return at < 0 ? half : half.slice(0, at + 1) + half.slice(at + 1).toLowerCase();
}

/** 2 つの文字列の距離（隣どうしの入れ替えも 1 回と数える）。 */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  const at = (i: number, j: number): number => d[i]?.[j] ?? 0;
  for (let i = 1; i <= a.length; i += 1) {
    const row = d[i] ?? [];
    for (let j = 1; j <= b.length; j += 1) {
      let best = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) best = Math.min(best, at(i - 2, j - 2) + 1);
      row[j] = best;
    }
  }
  return at(a.length, b.length);
}

/**
 * メールアドレスのドメインの打ち間違いらしきものに、正しい候補を返す（「gmial.com」→「…@gmail.com」）。
 * 知っているドメインそのものか、近いもの（2 文字以内の違い）が無ければ null。直すかどうかは利用者が決める（勝手に直さない）。
 */
export function suggestEmail(value: string, domains: readonly string[] = COMMON_EMAIL_DOMAINS): string | null {
  const email = normalizeEmail(value);
  const at = email.lastIndexOf('@');
  if (at <= 0) return null;
  const domain = email.slice(at + 1);
  if (!domain.includes('.') || domains.includes(domain)) return null;
  let best: { domain: string; score: number } | null = null;
  for (const candidate of domains) {
    const score = editDistance(domain, candidate);
    if (score <= 2 && (!best || score < best.score)) best = { domain: candidate, score };
  }
  return best ? `${email.slice(0, at)}@${best.domain}` : null;
}

/** 携帯会社のメールか。 */
export function isCarrierEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return CARRIER_EMAIL_DOMAINS.includes(email.slice(email.lastIndexOf('@') + 1));
}

/* -------------------------------------------------------------------------- */
/* 生年月日と住所                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 満年齢。誕生日の 0 時に 1 つ増える（年齢計算ニ関スル法律で、誕生日の前日の終わりに歳を取るのと同じ）。
 * 2 月 29 日生まれは、うるう年でない年は 3 月 1 日に歳を取る。月は 1〜12。
 */
export function ageOn(birth: { year: number; month: number; day: number }, on: Date = new Date()): number {
  const month = on.getMonth() + 1;
  const beforeBirthday = month < birth.month || (month === birth.month && on.getDate() < birth.day);
  return on.getFullYear() - birth.year - (beforeBirthday ? 1 : 0);
}

let eraFormat: Intl.DateTimeFormat | null = null;

/** 和暦の年（「令和7年」「平成元年」）。Intl の日本の暦を使う。日付は UTC の暦日として読む。 */
export function japaneseEra(date: Date): string {
  eraFormat ??= new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric', timeZone: 'UTC' });
  return eraFormat.format(date);
}

/** 都道府県（JIS X 0401 の順。北海道が 01、沖縄県が 47）。 */
export const PREFECTURES: readonly string[] = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
  '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
