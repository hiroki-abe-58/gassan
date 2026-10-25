import { describe, expect, it } from 'vitest';

import {
  ageOn,
  digitsOf,
  formatPostalCode,
  isCarrierEmail,
  isCorporateNumber,
  isInvoiceNumber,
  isKana,
  isMobilePhone,
  isMyNumber,
  isPhoneNumber,
  isPostalCode,
  japaneseEra,
  normalizeAddress,
  normalizeEmail,
  normalizeInvoiceNumber,
  normalizePhone,
  normalizeText,
  PREFECTURES,
  suggestEmail,
  toFullWidth,
  toHalfWidth,
  toHiragana,
  toKatakana,
  toZenginKana,
  yuchoToBranch,
} from '../src/japanese';

/** 打った順に 1 文字ずつ当てたとき（Input の normalize と同じ）の最後の値。 */
function typed(text: string, normalize: (value: string) => string): string {
  let value = '';
  for (const ch of text) value = normalize(value + ch);
  return value;
}

describe('I-25 全角と半角', () => {
  it('全角の英数字・記号・空白を半角に、かなと漢字はそのまま', () => {
    expect(toHalfWidth('ＡＢＣ１２３！＠　東京タワー')).toBe('ABC123!@ 東京タワー');
  });

  it('全角へ: 英数字・記号・空白と半角カタカナ（濁点は前の文字と合わせる）', () => {
    expect(toFullWidth('Abc 12-3')).toBe('Ａｂｃ　１２－３');
    expect(toFullWidth('ｶﾞｯｺｳ ﾊﾟﾝ ｳﾞｧ')).toBe('ガッコウ　パン　ヴァ');
  });

  it('文の欄: 英数字・記号・空白は半角、半角カタカナは全角に', () => {
    expect(normalizeText('ｶﾌﾞｼｷｶﾞｲｼｬ　ＧｅｎｅＬａｂ')).toBe('カブシキガイシャ GeneLab');
  });

  it('住所: ハイフンの仲間と数字の間の長音を「-」に、カタカナの長音は残す', () => {
    expect(normalizeAddress('１－２‐３−４―５ー６ｰ7')).toBe('1-2-3-4-5-6-7');
    expect(normalizeAddress('メゾンドール１０１')).toBe('メゾンドール101');
    expect(normalizeAddress('ｺｰﾎﾟ1ー2')).toBe('コーポ1-2');
  });
});

describe('I-25 ひらがなとカタカナ', () => {
  it('ひらがな・半角カタカナをカタカナに', () => {
    expect(toKatakana('やまだ たろう')).toBe('ヤマダ タロウ');
    expect(toKatakana('ﾔﾏﾀﾞ ﾀﾛｳ')).toBe('ヤマダ タロウ');
    expect(toKatakana('いすゞ')).toBe('イスヾ');
  });

  it('カタカナ・半角カタカナをひらがなに（ひらがなの無い文字はそのまま）', () => {
    expect(toHiragana('ヤマダ ﾀﾛｳ')).toBe('やまだ たろう');
    expect(toHiragana('ヴィ')).toBe('ゔぃ');
    expect(toHiragana('ヷ')).toBe('ヷ');
  });

  it('かなだけか（長音・中黒・空白は許す。漢字とローマ字は false）', () => {
    expect(isKana('ジョン・スミス')).toBe(true);
    expect(isKana('やまだ　たろう')).toBe(true);
    expect(isKana('ﾔﾏﾀﾞ')).toBe(true);
    expect(isKana('山田')).toBe(false);
    expect(isKana('yamada')).toBe(false);
  });

  it('口座名義の形（全銀）: 半角カタカナ、濁点を分け、小書きを大きく、長音は -、英字は大文字', () => {
    expect(toZenginKana('ヤマダ　タロウ')).toBe('ﾔﾏﾀﾞ ﾀﾛｳ');
    expect(toZenginKana('きょうこ')).toBe('ｷﾖｳｺ');
    expect(toZenginKana('ガッツ')).toBe('ｶﾞﾂﾂ');
    expect(toZenginKana('パーク')).toBe('ﾊﾟ-ｸ');
    expect(toZenginKana('ヴィオラ')).toBe('ｳﾞｲｵﾗ');
    expect(toZenginKana('ジョン・スミス')).toBe('ｼﾞﾖﾝ ｽﾐｽ');
    expect(toZenginKana('カ）ｇｅｎｅｌａｂ')).toBe('ｶ)GENELAB');
  });
});

describe('I-25 郵便番号と電話番号', () => {
  it('郵便番号: 書き方を問わず「123-4567」。打ち途中は 3 桁を超えたらハイフン、住所ごと貼っても 7 桁を拾う', () => {
    expect(formatPostalCode('〒１００ー０００１')).toBe('100-0001');
    expect(formatPostalCode('1000001')).toBe('100-0001');
    expect(formatPostalCode('1000')).toBe('100-0');
    expect(formatPostalCode('100')).toBe('100');
    expect(formatPostalCode('〒100-0001 東京都千代田区千代田1-1')).toBe('100-0001');
    expect(typed('１００ー０００１', formatPostalCode)).toBe('100-0001');
  });

  it('郵便番号の 7 桁がそろっているか。英字やかなが混ざれば false', () => {
    expect(isPostalCode('100-0001')).toBe(true);
    expect(isPostalCode('〒１００ー０００１')).toBe(true);
    expect(isPostalCode('100-000')).toBe(false);
    expect(isPostalCode('abc1000001')).toBe(false);
  });

  it('電話番号: 数字だけに。全角・ハイフン・括弧・空白・+81 を問わない', () => {
    expect(normalizePhone('090-1234-5678')).toBe('09012345678');
    expect(normalizePhone('０９０ー１２３４ー５６７８')).toBe('09012345678');
    expect(normalizePhone('（03）1234−5678')).toBe('0312345678');
    expect(normalizePhone('+81 90 1234 5678')).toBe('09012345678');
    expect(normalizePhone('+81 (0)3-1234-5678')).toBe('0312345678');
  });

  it('電話番号: 1 文字ずつ打っても +81 が崩れない（「+」「+8」「+81」は途中の形として残す）', () => {
    expect(normalizePhone('+')).toBe('+');
    expect(normalizePhone('+8')).toBe('+8');
    expect(normalizePhone('+81')).toBe('+81');
    expect(typed('+81 90-1234-5678', normalizePhone)).toBe('09012345678');
    expect(typed('０９０－１２３４－５６７８', normalizePhone)).toBe('09012345678');
  });

  it('電話番号の桁: 0X0 と 0800 は 11 桁、ほかは 10 桁。携帯は 060〜090', () => {
    expect(isPhoneNumber('090-1234-5678')).toBe(true);
    expect(isPhoneNumber('03-1234-5678')).toBe(true);
    expect(isPhoneNumber('0120-123-456')).toBe(true);
    expect(isPhoneNumber('0800-123-4567')).toBe(true);
    expect(isPhoneNumber('050-1234-5678')).toBe(true);
    expect(isPhoneNumber('090-1234-567')).toBe(false);
    expect(isPhoneNumber('03-1234-56789')).toBe(false);
    expect(isPhoneNumber('tel:0312345678')).toBe(false);
    expect(isMobilePhone('080 1234 5678')).toBe(true);
    expect(isMobilePhone('050-1234-5678')).toBe(false);
    expect(isMobilePhone('03-1234-5678')).toBe(false);
  });
});

describe('I-25 番号の検査用数字', () => {
  it('法人番号（13 桁）の検査用数字', () => {
    expect(isCorporateNumber('7000012050002')).toBe(true);
    expect(isCorporateNumber('1180301018771')).toBe(true);
    expect(isCorporateNumber('7-0000-1205-0002')).toBe(true);
    expect(isCorporateNumber('8000012050002')).toBe(false);
    expect(isCorporateNumber('700001205000')).toBe(false);
  });

  it('適格請求書の登録番号: T を補って「T＋13 桁」にそろえ、形を見る', () => {
    expect(normalizeInvoiceNumber('t-7000012050002')).toBe('T7000012050002');
    expect(normalizeInvoiceNumber('７０００')).toBe('T7000');
    expect(normalizeInvoiceNumber('')).toBe('');
    expect(typed('7000012050002', normalizeInvoiceNumber)).toBe('T7000012050002');
    expect(isInvoiceNumber('T7000012050002')).toBe(true);
    expect(isInvoiceNumber('Ｔ７０００ー０１２０ー５０００２')).toBe(true);
    expect(isInvoiceNumber('T700001205000')).toBe(false);
    expect(isInvoiceNumber('TX7000012050002')).toBe(false);
  });

  it('個人番号（12 桁）の検査用数字', () => {
    expect(isMyNumber('123456789018')).toBe(true);
    expect(isMyNumber('1234 5678 9018')).toBe(true);
    expect(isMyNumber('123456789011')).toBe(false);
    expect(isMyNumber('12345678901')).toBe(false);
  });

  it('数字だけを取り出す', () => {
    expect(digitsOf('口座 １２３-4567')).toBe('1234567');
  });
});

describe('I-25 ゆうちょ銀行', () => {
  it('通常貯金: 店番は記号の 2〜3 桁目＋8、口座番号は番号の末尾の 1 を除いて 7 桁', () => {
    expect(yuchoToBranch('10180', '12345671')).toEqual({ branchCode: '018', branchName: '〇一八', accountType: 'ordinary', accountNumber: '1234567' });
    expect(yuchoToBranch('12340', '5671')).toEqual({ branchCode: '238', branchName: '二三八', accountType: 'ordinary', accountNumber: '0000567' });
  });

  it('振替口座: 店番は記号の 2〜3 桁目＋9、種目は当座、口座番号は 7 桁に', () => {
    expect(yuchoToBranch('00120', '123456')).toEqual({ branchCode: '019', branchName: '〇一九', accountType: 'checking', accountNumber: '0123456' });
  });

  it('形が違えば null（記号が 5 桁でない・通常貯金の番号の末尾が 1 でない）', () => {
    expect(yuchoToBranch('1018', '12345671')).toBeNull();
    expect(yuchoToBranch('10180', '12345678')).toBeNull();
    expect(yuchoToBranch('20180', '1')).toBeNull();
  });
});

describe('I-25 メールアドレス', () => {
  it('全角・IME の「。」「ー」・空白を直し、ドメインだけ小文字に', () => {
    expect(normalizeEmail('Ｔａｒｏ＠Ｇｍａｉｌ。ｃｏｍ')).toBe('Taro@gmail.com');
    expect(normalizeEmail(' taroーyamada@example.co.jp ')).toBe('taro-yamada@example.co.jp');
  });

  it('よく使うドメインの打ち間違いに候補を出す。知っているドメインと遠いドメインには出さない', () => {
    expect(suggestEmail('taro@gmial.com')).toBe('taro@gmail.com');
    expect(suggestEmail('taro@gmail.co')).toBe('taro@gmail.com');
    expect(suggestEmail('taro@docomo.ne.pj')).toBe('taro@docomo.ne.jp');
    expect(suggestEmail('taro@yahoo.co.jo')).toBe('taro@yahoo.co.jp');
    expect(suggestEmail('taro@gmail.com')).toBeNull();
    expect(suggestEmail('taro@genelab.jp')).toBeNull();
    expect(suggestEmail('taro@gmai')).toBeNull();
    expect(suggestEmail('taro@acme.co.jp', ['acne.co.jp'])).toBe('taro@acne.co.jp');
  });

  it('携帯会社のメールか', () => {
    expect(isCarrierEmail('taro@docomo.ne.jp')).toBe(true);
    expect(isCarrierEmail('TARO@EZWEB.NE.JP')).toBe(true);
    expect(isCarrierEmail('taro@gmail.com')).toBe(false);
  });
});

describe('I-25 生年月日と都道府県', () => {
  it('満年齢は誕生日に 1 つ増える。2 月 29 日生まれはうるう年でない年は 3 月 1 日', () => {
    const birth = { year: 2000, month: 4, day: 2 };
    expect(ageOn(birth, new Date(2020, 3, 1))).toBe(19);
    expect(ageOn(birth, new Date(2020, 3, 2))).toBe(20);
    const leap = { year: 2004, month: 2, day: 29 };
    expect(ageOn(leap, new Date(2022, 1, 28))).toBe(17);
    expect(ageOn(leap, new Date(2022, 2, 1))).toBe(18);
  });

  it('和暦の年（元年も）', () => {
    expect(japaneseEra(new Date(Date.UTC(2019, 4, 1)))).toBe('令和元年');
    expect(japaneseEra(new Date(Date.UTC(1989, 0, 7)))).toBe('昭和64年');
    expect(japaneseEra(new Date(Date.UTC(1990, 0, 1)))).toBe('平成2年');
  });

  it('都道府県は 47、JIS の順', () => {
    expect(PREFECTURES).toHaveLength(47);
    expect(PREFECTURES[0]).toBe('北海道');
    expect(PREFECTURES[12]).toBe('東京都');
    expect(PREFECTURES[46]).toBe('沖縄県');
  });
});
