export default {
  lead: '日本のフォームで人が離れる理由を、入力の部品の側で消す。全角と半角・ハイフンの有無・ひらがなとカタカナは、打った人に直させずに受け取った側でそろえる（「全角で入力してください」と言わない）。郵便番号から住所、名前の読みからフリガナのように分かることは先に入れ、打った値とブラウザの自動入力が入れた値は上書きしない。',
  principles: {
    title: '離れさせないための約束',
    rows: [
      '**そろえられる違いをエラーにしない。** 全角と半角・ハイフンの種類・ひらがなとカタカナ・電話番号の書き方は、受け取った側で直す。',
      '**分かることは先に入れる。** ただし、利用者とブラウザの自動入力が入れた値は上書きしない。',
      '**フォーカスを勝手に動かさない。** 動かすのは、候補のボタンを押したときのように、利用者が選んだときだけ。',
      '**ブラウザの自動入力を効かせる。** 欄に `autocomplete` の名前を付け、都道府県と生年月日はネイティブの select にする。',
      '**直すかどうかは利用者が決める。** メールアドレスの打ち間違いは候補を出すだけで、勝手には直さない。読みは推測なので、フリガナはいつでも直せる。',
    ],
  },
  normalize: {
    title: '打った文字をそろえる',
    intro: '`Input` に `normalize` を渡すと、打つたびに文字をそろえる。IME の変換中は触らず、確定・貼り付け・自動入力のときにそろえ、入力位置も保つ。`onChange` はそろえた後の値を受け取る。関数はどれも、打ち途中の文字列に当てても崩れない。',
    exampleTitle: '6 つの欄',
    exampleDescription: '全角の数字・ハイフンの種類・ひらがなを混ぜて打ってみる。下に、アプリが受け取る値が出る。',
  },
  address: {
    title: '住所（郵便番号から自動で入れる）',
    intro: '郵便番号・都道府県・市区町村・町名番地・建物名を、ブラウザの自動入力が効く名前で並べる。郵便番号の 7 桁がそろうと `lookup` で住所を引き、空の欄だけを埋める。結果は欄の下に出して読み上げにも知らせ、フォーカスは動かさない。ライブラリは住所のデータを持たず、どこにも送らない。',
    exampleTitle: 'お届け先の住所',
    exampleDescription: '郵便番号を打つと、0.4 秒後に住所が入る（見本のデータ）。町名番地に番地を足してから郵便番号を直すと、町域だけが入れ替わる。',
  },
  name: {
    title: '名前とフリガナ',
    intro: '姓と名を分けて聞き（自動入力が効く）、名前を IME で打ったときの変換前のかなから、フリガナを入れる。フリガナを自分で直したら、そこから先は触らない。ふりがなをひらがなで聞くなら `kana="hiragana"`、聞かないなら `kana={false}`。',
    exampleTitle: 'お名前',
    exampleDescription: 'IME をオンにして、姓と名を打って変換してみる。',
  },
  birthDate: {
    title: '生年月日',
    intro: '年・月・日の 3 つのネイティブの select（自動入力とスマートフォンのピッカーが効く）。何十年も前の日付をカレンダーで送らせない。年には和暦を添え、そろうと満年齢を出す。年齢の条件は `ageOn` で確かめる。',
    exampleTitle: '20 歳以上の条件',
    exampleDescription: '20 歳未満の日付を選ぶとエラーになる。2 月を選ぶと、29 日より後の日は選べない。',
  },
  email: {
    title: 'メールアドレス',
    intro: '全角や IME のまま打った「。」「ー」を直し、欄を離れたときに、よく使われるドメインの打ち間違いに候補を出す。携帯会社のメールには、確認のメールが迷惑メールの設定で届かないことへの注意を出す。',
    exampleTitle: '確認のメールを送る欄',
    exampleDescription: '「taro@gmial.com」と打って欄を離れてみる。',
  },
  bank: {
    title: '振込先の口座',
    intro: '金融機関と支店は、かなでもコードでも探せる候補の一覧。口座名義はひらがなや半角カナで打っても全角のカタカナにそろえ、送るときに `toZenginKana` で全銀の形にする。ゆうちょ銀行は、通帳の記号・番号から振込用の店名と口座番号を作る。',
    exampleTitle: '売上の振込先',
    exampleDescription: '金融機関に「みつびし」や「0005」と打ってみる。ゆうちょ銀行も選べる。',
  },
  recipes: {
    title: '欄ごとの選び方',
    intro: '束の部品が無い欄も、`Input` の `normalize` と見分ける関数で同じように扱える。',
    tableCaption: '欄ごとの部品とそろえ方',
    head: { field: '欄', use: '使うもの', value: '受け取る値' },
    rows: [
      { field: '郵便番号だけ（送料の見積もりなど）', use: '`Input` + `normalize={formatPostalCode}`', value: '`123-4567`' },
      { field: '住所', use: '`AddressFields`（`lookup` を渡す）', value: '`{ postalCode, prefecture, city, line1, line2 }`' },
      { field: '電話番号', use: '`Input type="tel"` + `normalize={normalizePhone}`', value: '`09012345678`（数字だけ）' },
      { field: 'SMS を送る番号', use: '上と同じ + `isMobilePhone` で確かめる', value: '060・070・080・090 の 11 桁' },
      { field: 'メールアドレス', use: '`EmailInput`', value: '`taro@gmail.com`' },
      { field: '名前とフリガナ', use: '`NameFields`', value: '`{ familyName, givenName, familyNameKana, givenNameKana }`' },
      { field: '生年月日', use: '`BirthDateInput` + `ageOn`', value: '`1990-04-01`' },
      { field: '会社名・屋号', use: '`Input` + `normalize={normalizeText}`', value: '英数字は半角、カナは全角' },
      { field: '法人番号', use: '`Input` + `normalize={digitsOf}` + `isCorporateNumber`', value: '13 桁の数字（検査用数字まで確かめる）' },
      { field: '適格請求書の登録番号', use: '`Input` + `normalize={normalizeInvoiceNumber}` + `isInvoiceNumber`', value: '`T` と 13 桁の数字' },
      { field: 'マイナンバー', use: '`Input` + `normalize={digitsOf}` + `isMyNumber`', value: '12 桁（集める目的と保管の仕方は番号法に従う）' },
      { field: '振込先の口座', use: '`BankAccountFields`（送るときに `toZenginKana`）', value: '金融機関・支店・種目・口座番号・名義' },
      { field: '全角が要る仕組みへ送る欄', use: '`Input` + `normalize={toFullWidth}`', value: '全角の文字' },
    ],
  },
  functions: {
    title: 'そろえる関数と見分ける関数',
    intro: 'どれも純粋な関数で、サーバーの側の検証にも同じものを使える。見分ける関数は書き方（全角・ハイフン・空白・〒）を問わず、英字やかなが混ざった値だけを弾く。',
    tableCaption: '関数と、例と結果',
    head: { name: '関数', input: '例', output: '結果' },
  },
  lookup: {
    title: '住所の検索をつなぐ',
    intro: '`lookup` は 7 桁の数字を受けて、候補（都道府県・市区町村・町域）の配列を返す。Promise でもよい。日本郵便の郵便番号データを自分のサーバーに置いて引くのが確実。外部の API を使うなら、利用規約と、郵便番号を外へ送ってよいかを確かめる。古い郵便番号の結果は部品が捨てる。',
    code: `import { AddressFields, type PostalAddress } from '@genelab/gassan';

// 自分のサーバーに置いた日本郵便の郵便番号データから引く
async function lookup(postalCode: string): Promise<PostalAddress[]> {
  const response = await fetch(\`/api/postal-codes/\${postalCode}\`);
  if (!response.ok) return [];
  return response.json(); // [{ prefecture: '東京都', city: '千代田区', town: '千代田' }]
}

export function ShippingAddress() {
  return <AddressFields label="お届け先の住所" required lookup={lookup} autoCompleteSection="shipping" />;
}`,
  },
  a11yCaption: '日本の入力の振る舞い',
};
