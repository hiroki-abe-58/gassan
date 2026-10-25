/**
 * 日本の入力の見本のデータ（郵便番号と金融機関）。どの言語でも日本の住所と金融機関の名前のまま出す。
 *
 * 郵便番号は実在するものの一部（町域まで。番地は含まない）。000-0000 だけは実在しない番号で、候補が複数あるときの見本。
 * 金融機関のコードは実在のもの、支店は見本。実際のアプリでは、日本郵便の郵便番号データや全銀協の金融機関の
 * データを自分のサーバーに置いて引くか、外部の API を呼ぶ。
 */
import type { PostalAddress, SelectOption } from '@genelab/gassan';

export const POSTAL_SAMPLES: Readonly<Record<string, readonly PostalAddress[]>> = {
  '0000000': [
    { prefecture: '東京都', city: '千代田区', town: '丸の内' },
    { prefecture: '東京都', city: '千代田区', town: '大手町' },
  ],
  '0600001': [{ prefecture: '北海道', city: '札幌市中央区', town: '北一条西' }],
  '9800811': [{ prefecture: '宮城県', city: '仙台市青葉区', town: '一番町' }],
  '1000001': [{ prefecture: '東京都', city: '千代田区', town: '千代田' }],
  '1000005': [{ prefecture: '東京都', city: '千代田区', town: '丸の内' }],
  '1000014': [{ prefecture: '東京都', city: '千代田区', town: '永田町' }],
  '1040061': [{ prefecture: '東京都', city: '中央区', town: '銀座' }],
  '1060032': [{ prefecture: '東京都', city: '港区', town: '六本木' }],
  '1500002': [{ prefecture: '東京都', city: '渋谷区', town: '渋谷' }],
  '1600022': [{ prefecture: '東京都', city: '新宿区', town: '新宿' }],
  '2200012': [{ prefecture: '神奈川県', city: '横浜市西区', town: 'みなとみらい' }],
  '4500002': [{ prefecture: '愛知県', city: '名古屋市中村区', town: '名駅' }],
  '5300001': [{ prefecture: '大阪府', city: '大阪市北区', town: '梅田' }],
  '5420076': [{ prefecture: '大阪府', city: '大阪市中央区', town: '難波' }],
  '6008216': [{ prefecture: '京都府', city: '京都市下京区', town: '東塩小路町' }],
  '6500001': [{ prefecture: '兵庫県', city: '神戸市中央区', town: '加納町' }],
  '7300011': [{ prefecture: '広島県', city: '広島市中区', town: '基町' }],
  '7600019': [{ prefecture: '香川県', city: '高松市', town: 'サンポート' }],
  '8100001': [{ prefecture: '福岡県', city: '福岡市中央区', town: '天神' }],
  '9000015': [{ prefecture: '沖縄県', city: '那覇市', town: '久茂地' }],
};

/** 金融機関（value は全銀の金融機関コード）。keywords に読みがなとコードを入れ、かなでもコードでも探せるようにする。 */
export const BANK_SAMPLES: readonly SelectOption[] = [
  { value: '0001', label: 'みずほ銀行', keywords: ['みずほ', '0001'] },
  { value: '0005', label: '三菱UFJ銀行', keywords: ['みつびしゆーえふじぇい', '0005'] },
  { value: '0009', label: '三井住友銀行', keywords: ['みついすみとも', '0009'] },
  { value: '0010', label: 'りそな銀行', keywords: ['りそな', '0010'] },
  { value: '0033', label: 'PayPay銀行', keywords: ['ぺいぺい', '0033'] },
  { value: '0036', label: '楽天銀行', keywords: ['らくてん', '0036'] },
  { value: '0038', label: '住信SBIネット銀行', keywords: ['すみしんえすびーあいねっと', '0038'] },
  { value: '9900', label: 'ゆうちょ銀行', keywords: ['ゆうちょ', '9900'] },
];

/**
 * 法人番号から引く会社名（見本）。7000012050002 は国税庁自身の法人番号（国税庁のサイトのヘッダに載っている）。
 * 実際のアプリでは、国税庁の法人番号システム Web-API を自分のサーバーから呼ぶ。
 */
export const COMPANY_SAMPLES: Readonly<Record<string, string>> = {
  '7000012050002': '国税庁',
};

/** 支店（見本。どの金融機関でも同じものを出す）。 */
export const BRANCH_SAMPLES: readonly SelectOption[] = [
  { value: '100', label: '東京営業部', keywords: ['とうきょう', '100'] },
  { value: '200', label: '大阪支店', keywords: ['おおさか', '200'] },
  { value: '300', label: '名古屋支店', keywords: ['なごや', '300'] },
  { value: '400', label: '福岡支店', keywords: ['ふくおか', '400'] },
  { value: '500', label: '札幌支店', keywords: ['さっぽろ', '500'] },
];
