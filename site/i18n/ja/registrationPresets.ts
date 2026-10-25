export default {
  lead: '金融・通販・医療・マッチングのように、法令が聞くことを決めている業種の本登録。入口はメールアドレスだけにして、取引の前までに聞く項目を、業種ごとの手順と順番でそろえた。手順ごとに、なぜ聞くかを根拠の法令で書き、未成年の保護者の同意・年齢の下限・本人確認の方法も業種に合わせて組む。',
  law: {
    title: '法令について',
    body: '手順と根拠は、2026 年 10 月 26 日の時点の条文（e-Gov 法令検索）と官公庁の資料から組んだ目安で、法的な助言ではない。登録や届出の種類で聞くことは変わり、改正も多い。サービスを始める前に、自社に当たる法令と最新の改正を専門家に確かめてほしい。出典は下の表のリンク先。',
  },
  presets: {
    title: '業種を選ぶ',
    intro: '`preset` に業種を渡すと、その業種の手順と欄で本登録を組む。この表は `REGISTRATION_PRESETS` から作っているので、ライブラリの中身と同じ。',
    tableCaption: '業種ごとの本登録の手順と根拠',
    head: { preset: '業種', steps: '本登録の手順', age: '年齢', laws: '根拠' },
    minAge: (age: number) => `${String(age)} 歳以上`,
    guardianUnder: (age: number) => `${String(age)} 歳未満は保護者の同意`,
    noAge: '決まりなし',
  },
  sample: {
    title: '見本',
    intro: '業種を選んで、本登録の手順を歩ける。「次へ」で直す所を欄の下に出し、手順を進めるたびに保存する。郵便番号は 100-0001 などで住所が入り、法人番号は 7000012050002 で会社名が入る（見本のデータ）。本人確認は見本なので、方法を選んで押すと確かめたことになる。',
  },
  flow: {
    title: '入口から本登録まで',
    intro: '入口の `QuickSignUpPage` はメールアドレスだけを聞き、送ると仮登録が済む。確かめる義務は契約や取引の時点に掛かる書き方なので、入口で本人確認まで求めなくてよいと読める（そう明言した公式の資料は見当たらない）。メールのリンクから `RegistrationPresetPage` を開き、手順ごとに `onSave` で保存して、離れても続きから再開できるようにする。',
    code: `import { QuickSignUpPage, RegistrationPresetPage } from '@genelab/gassan';

// 1. 入口: メールアドレスだけ。送ると仮登録が済み、本登録のリンクをメールで送る
export function Entry() {
  return (
    <QuickSignUpPage
      onSubmit={({ email }) => api.preRegister(email)}
      expiresIn="24 時間"
      steps={['メールのリンクを開く', 'お客様情報を入力する', '本人確認']}
    />
  );
}

// 2. メールのリンクから: 業種ごとの本登録
export function Registration({ draft }: { draft: Draft }) {
  return (
    <RegistrationPresetPage
      preset="securities"
      defaultValues={draft.values}
      defaultStep={draft.stepId}
      onSave={(values, stepId) => api.saveDraft(values, stepId)}
      onSaveAndExit={() => navigate('/home')}
      lookupAddress={(postalCode) => api.postalCode(postalCode)}
      onVerifyIdentity={(method, values) => ekyc.start(method, values)}
      onSubmit={(values) => api.register(values)}
    />
  );
}`,
  },
  timing: {
    title: 'いつ聞くか',
    intro: '入口で聞くことを減らすほど、人は離れにくい。法令が求める時点まで聞くのを遅らせ、聞くときは手順の説明に理由を書く。',
    tableCaption: '聞く時点と項目',
    head: { stage: '時点', items: '聞くこと', how: '部品' },
    rows: [
      {
        stage: '入口（仮登録）',
        items: 'メールアドレスと規約への同意だけ。個人情報の利用目的は送る前に示す（個人情報保護法 21 条 2 項）。広告メールの同意は別の任意のチェックボックスにし、初めはチェックを入れない（特定電子メール法 3 条）。',
        how: '`QuickSignUpPage`',
      },
      {
        stage: '本登録（取引の前）',
        items: '氏名・住所・生年月日と、業種ごとの項目。金融なら職業・取引の目的・外国 PEPs・居住地国・反社会的勢力ではないことの表明と、本人確認。',
        how: '`RegistrationPresetPage`',
      },
      {
        stage: 'その取引の直前',
        items: '上場会社の役員かどうか（初めて上場株式を売買する前まで）、通販のお届け先（初めての注文の前まで）、買取の本人確認（買い取る前まで）。',
        how: '手順を分けるか、`optional` にして後で聞く',
      },
      {
        stage: '聞かないもの',
        items: '法令が求めない項目は必須にしない。勤務先や電話番号を聞くなら理由を添える。求人では本籍・家族・宗教などを聞かない（厚生労働省の公正な採用選考の考え方）。',
        how: '`optional`',
      },
    ],
  },
  fields: {
    title: '欄の部品',
    intro: '本登録の手順は、法令が求める項目を部品にしたもので組んでいる。部品だけを自分の画面に置いてもよい。文言は `SiteProvider` の `registrationLabels` で差し替えられる（既定は日本語と英語）。',
    work: {
      title: '職業と取引の目的',
      intro: '犯罪収益移転防止法の取引時確認で聞く項目。自由記述にせず、金融庁の類型を選択肢にする。取引の目的はいくつでも選べ、選択肢の組は業態で変わる。',
      exampleTitle: '職業と取引の目的',
      exampleDescription: '業態を変えると、取引の目的の選択肢が変わる。値はキーで受け取る。',
    },
    declarations: {
      title: '届出と表明',
      intro: '外国 PEPs・居住地国（CRS・CARF）・米国の納税義務（FATCA）は、問いを束の名前に、当たる人の範囲を説明に置いた二択。当たる人にだけ追加の欄を出す。反社会的勢力の排除の表明は、範囲の説明を開け閉めできるようにする。',
      exampleTitle: '届出と表明',
      exampleDescription: '「日本のほかの国にもある」「ある」を選ぶと、国と納税者番号の欄、米国の納税者番号と同意の欄が出る。',
    },
    numbers: {
      title: 'マイナンバーと法人番号',
      intro: 'マイナンバーは数字だけにそろえ、自動入力とスペルの確認を切る。確認の画面では下 4 桁だけを見せる。法人番号は、検査用数字まで正しい 13 桁になったら会社名を引いて補う（打った会社名は上書きしない）。',
      exampleTitle: 'マイナンバーと法人番号',
      exampleDescription: '「１２３４-５６７８ ９０１８」のように打っても数字だけになる。法人番号に 7000012050002 と入れると会社名が入る。',
    },
    identity: {
      title: '本人確認の方法',
      intro: '使える方法は根拠の法令で決まり、改正で変わる。方法は条の記号ではなく名前で持ち、日付を渡すとその日にもう使えない方法を出さない。本人確認そのもの（IC チップの読み取りや撮影）は、利用側の本人確認のサービスが行う。',
      exampleTitle: '本人確認の方法',
      exampleDescription: '「銀行・証券など」で「2027 年 4 月 1 日から」を選ぶと、書類と顔の撮影が消える（犯罪収益移転防止法の改正）。',
    },
    guardian: {
      title: '保護者の同意と広告メールの同意',
      intro: '未成年の契約は、保護者の同意が無いと取り消せる。生年月日から未成年と分かったら、保護者の名前・続柄・メールアドレスと同意を聞く。広告メールの同意は、規約への同意とは別の任意のチェックボックスにする。',
      exampleTitle: '保護者の同意と広告メールの同意',
      exampleDescription: '保護者の欄には、ご本人の名前やアドレスが自動入力で入らない。',
    },
  },
  amendments: {
    title: '改正の予定',
    intro: '本人確認と個人情報の決まりは、ここ数年で続けて変わる。日付で切り替わるものは部品が日付を見て切り替える。',
    tableCaption: '施行日と、gassan の対応',
    head: { date: '施行日', change: '変わること', gassan: 'gassan' },
    rows: [
      {
        date: '2026-01-01',
        change: '暗号資産の取引に、税務上の居住地国の届出が要る（CARF。租税条約等実施特例法 10 条の 9）。前からの利用者は 2026 年の末まで。',
        gassan: '`crypto` の確認事項に居住地国を置いた',
      },
      {
        date: '2026-04-01',
        change: '携帯電話の契約のオンラインの本人確認は、IC チップの読み取りが原則になり、書類の画像を送る方式は無くなった。',
        gassan: '`identityMethods("telecom")` は書類と顔の撮影を出さない',
      },
      {
        date: '2026-04-16',
        change: '出会い系サイトの年齢確認に、マイナンバーカードを使う方式が加わった。',
        gassan: '`identityMethods("matching")` にマイナンバーカードの暗証番号と電子証明書の方式がある',
      },
      {
        date: '2027-04-01',
        change: '犯罪収益移転防止法のオンラインの本人確認から、書類と顔の撮影の方式が無くなる。',
        gassan: '`identityMethods("aml")` はこの日から書類と顔の撮影を出さない（日付で切り替わる）',
      },
      {
        date: '政令の日（2027 年 7 月まで）',
        change: '暗号資産交換業が、金融商品取引法の暗号資産取引業になる。',
        gassan: '`crypto` は投資のご経験と資産（適合性）を聞く手順を持っている',
      },
      {
        date: '政令の日（2028 年 7 月まで）',
        change: '個人情報保護法の改正で、16 歳未満の個人情報は、同意と通知を法定代理人に対して行う。',
        gassan: '16 歳未満を受け入れる業種は `guardianUnder` を足す（次の節）',
      },
    ],
  },
  customize: {
    title: '手順を足し引きする',
    intro: '`preset` には自分で組んだプリセットも渡せる。`REGISTRATION_PRESETS` の業種を広げて、手順・必須と任意・年齢の決まりを足し引きする。手順の説明の文は `registrationLabels` の `presets` で差し替える。',
    code: `import { REGISTRATION_PRESETS, RegistrationPresetPage, type RegistrationPreset } from '@genelab/gassan';

// 通販に生年月日を足し、16 歳未満には保護者の同意を求める
const shop: RegistrationPreset = {
  ...REGISTRATION_PRESETS.ec,
  guardianUnder: 16,
  steps: [{ id: 'delivery', fields: ['name', 'birthDate', 'address', 'phone', 'marketing'], optional: ['marketing'] }],
};

export function ShopRegistration() {
  return <RegistrationPresetPage preset={shop} onSubmit={(values) => api.register(values)} />;
}`,
  },
  samples: {
    savedExit: '保存しました。メールのリンクから、いつでも続きを入力できます。',
    doneNext: 'ホームへ進む',
  },
  a11yCaption: '業種ごとの登録が満たす仕様',
};
