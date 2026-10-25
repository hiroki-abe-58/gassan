export default {
  lead: 'ログインと登録は、サービスの入口で人が離れやすい所。ログインと登録のページと同じフォームと送信の流れのまま、出し方と順番を変えた形をそろえた。ヘッダから開く窓、メールアドレスを先に聞いて振り分けるログイン、パスワードを使わないメールのリンクと SMS、メールアドレスだけの仮登録と本登録の手順、パスキー、アカウントの選択、本人確認とログインの期限切れ、購入の後のアカウント作成。',
  choose: {
    title: 'サービスに合わせて選ぶ',
    intro: 'どれも組み合わせられる。たとえば金融のサービスなら、ヘッダの窓から仮登録に入り、メールのリンクから本登録の手順へ進め、終わったらパスキーを作るかを尋ねる。',
    tableCaption: 'サービスと、向いている形',
    head: { service: 'サービス', pattern: '形', why: '理由' },
    rows: [
      { service: '一般の Web サービス・SaaS', pattern: '`AuthDialog`（窓）', why: 'いま見ているページを離れずにログインと登録ができ、済んだら元の作業に戻れる' },
      { service: '法人向けの SaaS', pattern: '`EmailFirstPage`（メールアドレスを先に）', why: '会社のドメインを組織の ID（SSO）へ振り分け、ログインと登録の入口を 1 つにできる' },
      { service: '金融・保険・不動産・人材', pattern: '`QuickSignUpPage` → `RegistrationWizardPage`', why: '聞くことが多いので、入口ではメールアドレスだけにして、本登録は保存しながら少しずつ進める' },
      { service: 'たまにしか使わないサービス', pattern: '`MagicLinkPage`（メールのリンク）', why: 'パスワードを忘れる人が多い。メールのリンクとコードでログインでき、再設定の手間がない' },
      { service: 'スマートフォンが主のサービス', pattern: '`PhoneSignInPage`（SMS）・パスキー', why: '打つことを減らせる。コードは SMS から自動で入り、2 回目からは指紋や顔でログインできる' },
      { service: '家族や仕事で使い分けるサービス', pattern: '`AccountChooserPage`', why: 'この端末で使ったアカウントを選ぶだけで、メールアドレスを打ち直さずに済む' },
      { service: '支払い・退会・パスワードの変更がある画面', pattern: '`ReauthDialog`', why: 'ページを離れずにもう一度パスワードを聞く。ログインの期限が切れても入力中の内容を失わない' },
      { service: 'EC・予約', pattern: '`GuestAccountCard`', why: '買う前に会員登録を求めない。買い終えた画面で、パスワードを決めるだけでアカウントを作れる' },
    ],
  },
  setup: {
    title: 'ヘッダから窓で開く',
    intro: '`AuthDialog` をヘッダのボタンと一緒に置き、開く画面（`mode`）を選ぶ。窓の中でログイン・登録・パスワードの再設定を行き来でき、済んだら閉じて押したボタンへフォーカスを戻す。',
    code: `import { useState } from 'react';
import { AuthDialog, Button, type AuthDialogMode } from '@genelab/gassan';

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>('signIn');
  const openAs = (next: AuthDialogMode) => {
    setMode(next);
    setOpen(true);
  };
  return (
    <>
      <Button variant="tertiary" onClick={() => openAs('signIn')}>ログイン</Button>
      <Button variant="primary" onClick={() => openAs('signUp')}>無料で始める</Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        onSignIn={async ({ email, password }) => {
          // 失敗なら既定の文（どちらが違うかを明かさない）を出す
          if (!(await signIn(email, password))) return { error: true };
        }}
        onSignUp={(values) => signUp(values)}
        onForgotPassword={({ email }) => sendResetEmail(email)}
      />
    </>
  );
}`,
  },
  dialog: {
    title: '窓のログインと登録',
    intro: 'ヘッダの「ログイン」「無料で始める」から、いまのページを離れずに開く。外を押しても閉じず（打った内容を消さない）、Esc と閉じるボタンで閉じる。打ったメールアドレスは、ログインと登録を切り替えても残る。見本では、パスワードに「gassan」と入れるとログインできる。',
  },
  emailFirst: {
    title: 'メールアドレスを先に聞くログイン',
    intro: '最初はメールアドレスだけ。答えによって、パスワード・登録・組織の ID・メールのリンクへ振り分ける。パスワードの画面ではアドレスを変えられない形で示し、パスワード管理ソフトにはどのアカウントかを渡す。アカウントの有無を明かしたくなければ、無いアカウントにもパスワードかリンクを返す。',
  },
  magicLink: {
    title: 'メールのリンクと確認コード',
    intro: 'パスワードを使わないログイン。メールアドレスだけを聞いて、ログインのリンクと確認コードを送る。メールはスマートフォン、ログインはパソコンのように、リンクを開けない端末でもコードで入れる。見本の確認コードは「123456」。',
  },
  quickSignUp: {
    title: 'メールアドレスだけの仮登録と本登録',
    intro: '入口で聞くのはメールアドレスだけ。送ると仮登録は済み、本登録のリンクをメールで送る。本登録の手順は、進むたびに保存し、「保存してあとで続ける」で離れても続きから始められ、最後の確認の画面から各手順を直せる。住所・名前・生年月日は日本の入力の部品で組んでいる。',
    quick: '仮登録',
    wizard: '本登録の手順',
  },
  phone: {
    title: '電話番号と SMS',
    intro: '番号は書き方を問わず数字だけにそろえ、SMS を受け取れる携帯電話の番号かを確かめる。固定電話の番号には、直し方の分かる文で知らせる。コードは SMS から自動で入り、桁がそろうと送る。見本の確認コードは「123456」。',
  },
  passkey: {
    title: 'パスキー',
    intro: 'ログインのページに「パスキーでログイン」を置き、メールアドレスの欄からもパスキーを選べるようにする。ログインの直後に 1 度だけ、パスキーを作るかを尋ねる（「あとで」も同じ重さで選べる）。WebAuthn の呼び出しは利用側が渡す。',
    prompt: '作るかを尋ねる',
    signIn: 'ログインのボタン',
  },
  accountChooser: {
    title: 'アカウントの選択',
    intro: 'この端末でログインしたことのあるアカウントを並べ、選ぶだけでそのアカウントのログインへ進む。「別のアカウントを使う」をいつも出し、使わなくなったアカウントはこの端末から外せる。',
  },
  reauth: {
    title: '本人確認とログインの期限切れ',
    intro: 'ページを離れずに、もう一度パスワードを聞く窓。大事な操作の前の本人確認と、ログインの期限切れの 2 つの使い方がある。期限切れの窓は閉じられず、入力中の内容を残したままログインし直せる。見本のパスワードは「gassan」。',
    confirm: '大事な操作の前',
    expired: 'ログインの期限切れ',
  },
  guestAccount: {
    title: '購入の後のアカウント作成',
    intro: '買う前に会員登録を求めない（ゲストで買える）。買い終えた画面に、パスワードを決めるだけでアカウントを作れるカードを置く。メールアドレスは注文のものを使う。',
  },
  a11yCaption: 'ログインと登録の形を変えたものの振る舞い',
  samples: {
    signIn: 'ログイン',
    startFree: '無料で始める',
    heroTitle: 'チームの仕事を、1 つの場所に',
    heroDescription: '右上の「ログイン」か「無料で始める」を押すと、このページの上に窓が開きます（見本）。',
    signedUp: 'アカウントを作りました（見本）',
    passkeyNotice: '見本なので、パスキーは呼び出しません。',
    emailFirstHint: '見本: 「new」で始まるアドレスは登録へ、「@corp.example.com」は組織の ID へ、「link」で始まるアドレスはメールのリンクへ進みます。それ以外はパスワード（gassan）です。',
    expiresIn: '24 時間',
    quickSteps: ['メールのリンクを開く', 'お客様情報と住所を入力する', '内容を確かめて登録する'],
    useEmail: 'メールアドレスでログイン',
    accounts: [
      { id: 'hana', name: '佐藤 花', email: 'hana@example.com' },
      { id: 'aoi', name: '佐藤 葵', email: 'aoi@corp.example.com' },
      { id: 'ren', name: '山本 蓮', email: 'ren@example.jp' },
    ],
    securityTitle: 'セキュリティ',
    securityDescription: 'パスワードを変える前に、もう一度パスワードを確かめます。見本のパスワードは「gassan」です。',
    changePassword: 'パスワードを変える',
    securityDone: '本人確認ができました（見本）',
    expiredTitle: '週の報告',
    expiredDescription: '「期限切れを試す」を押すと、ログインの期限が切れたときの窓が開きます。書きかけの報告は残ったままです。見本のパスワードは「gassan」です。',
    expiredLabel: '今週やったこと',
    expiredDraft: '新しい料金のページを公開した。問い合わせのフォームから届く件数が 2 割増えた。',
    expiredDone: 'ログインし直しました。書きかけの内容はそのままです（見本）',
    expire: '期限切れを試す',
    orderTitle: 'ご注文を承りました',
    orderDescription: '注文の確認のメールを hana@example.com に送りました。',
    orderRows: [
      { term: '注文番号', details: 'A-20261026-0042' },
      { term: 'お届けの予定', details: '10月29日（木）' },
      { term: 'お支払い', details: '4,180 円（クレジットカード）' },
    ],
    guestLater: 'アカウントはあとからでも作れます（見本）',
    wizard: {
      profileTitle: 'お客様情報',
      profileDescription: '本人確認のため、公的な書類と同じ書き方で入力してください。',
      name: 'お名前',
      birth: '生年月日',
      profileRequired: 'お名前と生年月日を入力してください',
      addressTitle: 'ご住所と連絡先',
      addressDescription: '郵便番号を入れると、住所の一部が入ります。',
      address: 'ご住所',
      phone: '電話番号',
      addressRequired: 'ご住所と電話番号を入力してください',
      purposeTitle: 'ご利用の目的',
      purposeDescription: 'サービスの改善に使います。あとで入力することもできます。',
      purpose: '主な目的',
      choose: '選んでください',
      purposes: ['資産の運用', '生活費の管理', '事業の資金', 'その他'],
      notAnswered: '未回答',
      savedExit: '保存しました。メールのリンクから続きを入力できます（見本）',
      doneNext: '続ける',
    },
  },
};
