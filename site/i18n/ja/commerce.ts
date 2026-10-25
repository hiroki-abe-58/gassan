export default {
  lead: '買い物の最終確認、Cookie と外部送信の同意、送信先の一覧、解約の手続き。日本の法令が画面に求めること（特定商取引法の最終確認画面と、電気通信事業法の外部送信の規律）を、そのまま節と文言にした。',
  law: {
    title: '法令について',
    body: '表示事項は 2026 年 10 月時点の条文（e-Gov 法令検索）から組んだ目安で、法的な助言ではない。売る物・サービス・送る情報によって要る表示は変わるので、始める前に専門家に確かめる。',
  },
  orderReview: {
    title: '注文の最終確認',
    intro: '特定商取引法 12 条の 6 は、ネットの注文の最後の画面に、分量・代金・支払の時期と方法・引渡しの時期・申込みの期間・申込みの撤回と解除を表示することを求め、注文になることや表示事項を誤認させる表示を禁じている。`OrderReviewPage` はこれらを見出しのある節に並べ、まだ確定していないことを伝え、「注文を確定する」で確定する。',
    tableCaption: '最終確認画面の表示事項と props',
    head: { item: '表示事項', prop: 'props' },
    rows: [
      { item: '分量（12 条の 6 第 1 項 1 号）', prop: '`items` の `quantity` と `unit`' },
      { item: '販売価格と送料（11 条 1 号）', prop: '`items` の `price`・`shippingFee`・`fees`・`discounts`（合計は部品が計算する）' },
      { item: '支払の時期と方法（11 条 2 号）', prop: '`payment` の `method` と `timing`' },
      { item: '引渡しの時期（11 条 3 号）', prop: '`delivery` の `method` と `timing`' },
      { item: '申込みの期間（11 条 4 号）', prop: '`offerPeriod`（期限のある販売のとき）' },
      { item: '申込みの撤回と解除（11 条 5 号）', prop: '`cancellationPolicy`（リンクだけにせず、条件を書く）' },
      { item: '定期購入の条件', prop: '`subscription`（各回の代金・間隔・約束の回数・解約の方法）' },
    ],
  },
  cookieConsent: {
    title: 'Cookie と外部送信の同意',
    intro: '電気通信事業法 27 条の 12（外部送信の規律）は、利用者の情報を外部へ送る前に、送る情報や送信先などを通知するか、容易に知り得る状態に置くことを求める（同意を得たものや、止められるようにしたものは例外）。`CookieConsent` はまだ選んでいない人に帯を出し、「すべて許可する」と「必要なものだけ」を同じ重さで並べ、種類ごとに選べる窓を開く。保存は `onChange` で利用側が行う。',
  },
  externalTransmission: {
    title: '外部送信の公表',
    intro: '`ExternalTransmissionList` は、送信先ごとに送る情報・目的・種類と、送信先のプライバシーポリシーと送信を止めるページへのリンクを並べる。帯の「送信先の一覧」のリンク先（プライバシーポリシーの中の節など）に置く。',
  },
  cancel: {
    title: '解約の手続き',
    intro: '理由（任意）→ 提案（任意・1 度だけ）→ 確認、の 3 段まで。どの画面からも「解約しない」で抜けられ、提案の画面では「解約に進む」を提案と同じかそれ以上の重さにする。確認の画面で、使える最後の日・データの扱い・書き出しを示してから解約する。',
  },
  setup: {
    title: '同意の帯を置く',
    intro: '帯はページの最後に置き、許可を Cookie か localStorage に保存する。サーバーで描くページでは、保存した許可を描いた後（`useEffect`）に読み、読み終えるまでは帯を描かない（先に `null` を渡すと、選び終えた人にも帯が一瞬出る）。ページの下の「Cookie の設定」から `settingsOpen` で窓を開き直せる。',
    code: `import { useEffect, useState } from 'react';
import { CookieConsent, type CookieConsentValue } from '@genelab/gassan';

const KEY = 'cookie-consent';

type Props = { settingsOpen: boolean; onSettingsOpenChange: (open: boolean) => void };

export function Consent({ settingsOpen, onSettingsOpenChange }: Props) {
  const [value, setValue] = useState<CookieConsentValue | null | undefined>(undefined);
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setValue(saved ? (JSON.parse(saved) as CookieConsentValue) : null);
  }, []);
  if (value === undefined) return null;
  return (
    <CookieConsent
      value={value}
      onChange={(next) => {
        localStorage.setItem(KEY, JSON.stringify(next));
        setValue(next);
        // 許可した種類のタグだけを読み込む
      }}
      settingsOpen={settingsOpen}
      onSettingsOpenChange={onSettingsOpenChange}
      policyHref="/privacy#external"
    />
  );
}`,
  },
  samples: {
    coffee: 'コーヒー豆 200g',
    coffeeOption: '中煎り・豆のまま',
    bag: '袋',
    dripper: 'ドリッパー',
    coupon: 'はじめてのクーポン',
    address: ['佐藤 花', '〒100-0001 東京都千代田区千代田 1-1', '090-1234-5678'],
    deliveryMethod: '宅配便',
    deliveryTiming: 'ご注文から 2〜4 日でお届け（日時を指定できます）',
    paymentMethod: 'クレジットカード（Visa 末尾 4242）',
    paymentTiming: 'ご注文の確定のとき',
    offerPeriod: '2026年11月30日 23:59 まで（この組み合わせの販売期間）',
    cancellationPolicy: '商品の到着から 8 日以内なら、未開封のものに限り返品できます。返品の送料はお客様の負担です。不良品は当社の負担で交換します。',
    interval: '毎月',
    priceNote: '2 回目からは 1 回 ￥2,160（1 割引き）',
    howToCancel: '次のお届けの 7 日前までに、マイページの「定期購入」から。電話でも受け付けます。',
    consent: '利用規約と定期購入の条件に同意する',
    edit: '前の画面へ戻ります（見本）',
    shopTitle: '週末のコーヒー便',
    shopText: '焙煎したての豆を、毎月お届けします。この見本では、画面の下に Cookie の帯が出ます。',
    openSettings: 'Cookie の設定',
    consentSaved: 'Cookie の設定を保存しました（見本）',
    policyTitle: '外部へ送る情報と送信先',
    policyText: 'このサイトでは、次の事業者へ利用者の情報を送ることがあります。止めたいときは、各事業者のページから止められます。',
    recipientsTitle: '送信先と送る情報',
    transmissions: [
      {
        recipient: 'Google LLC',
        service: 'Google Analytics',
        information: '閲覧したページの URL、参照元、端末と閲覧ソフトの種類、Cookie の識別子',
        purpose: 'ページの閲覧数と使われ方を集計し、サイトの改善に使います。',
        category: 'analytics' as const,
        policyHref: 'https://policies.google.com/privacy',
        optOutHref: 'https://tools.google.com/dlpage/gaoptout',
      },
      {
        recipient: 'Meta Platforms, Inc.',
        service: 'Meta ピクセル',
        information: '閲覧したページの URL、購入の有無、端末の情報、Cookie の識別子',
        purpose: '広告の効果を測り、関心に合った広告を出します。',
        category: 'marketing' as const,
        policyHref: 'https://www.facebook.com/privacy/policy/',
      },
      {
        recipient: 'Atlas 株式会社',
        service: 'ログインの状態の保持',
        information: 'ログインの状態を表す識別子',
        purpose: 'ログインしたままにするために使います。',
        category: 'necessary' as const,
      },
    ],
    plan: 'Pro',
    reasons: { price: '料金が高い', unused: 'あまり使っていない', missing: '必要な機能が無い', switching: 'ほかのサービスに移る', other: 'その他' },
    pauseTitle: '1 か月だけ止める',
    pauseDescription: '止めているあいだは料金がかからず、データはそのまま残ります。',
    pauseAction: '1 か月止める',
    downgradeTitle: '無料のプランに変える',
    downgradeDescription: 'メンバーは 3 人まで、保存は 1 GB まで。データはそのまま使えます。',
    downgradeAction: 'Free に変える',
    dataNotice: '解約から 30 日後に、ワークスペースのデータを削除します。それまでは書き出せます。',
  },
  a11yCaption: '購入と同意のテンプレートの振る舞い',
};
