export default {
  auth: {
    lead: 'ログイン・アカウントの作成・パスワードの再設定・2 段階認証・メールの確認・ログアウト。部品を 1 つ置くだけで、自動入力の属性・直す所のまとめ・送信の間の二度押しの防止・画面が切り替わったときのフォーカスまで揃ったページになる。',
    setup: {
      title: '使い方',
      intro: 'アプリのルートに SiteProvider を 1 つ置き、製品の名前・ロゴ・行き先を渡す。テンプレートの見た目は templates.css にある（styles.css の後に読み込む）。Next.js の Link などは linkComponent に渡す。',
      code: "import '@genelab/gassan/styles.css';\nimport '@genelab/gassan/templates.css';\nimport { SiteProvider, SignInPage } from '@genelab/gassan';\n\n<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' }}\n  linkComponent={Link}\n>\n  <SignInPage\n    onSubmit={async ({ email, password, remember }) => {\n      const ok = await signIn(email, password, remember);\n      // 失敗なら既定の文（どちらが違うかを明かさない）を出す\n      if (!ok) return { error: true };\n    }}\n  />\n</SiteProvider>",
    },
    signIn: {
      title: 'ログイン',
      intro: 'メールアドレス（autocomplete="username"）とパスワード（current-password）で、パスワード管理ソフトの自動入力が効く。失敗の理由はどちらが違うかを明かさず、入力は消さない。外部の ID のボタンも並べられる。見本では、パスワードに「gassan」と入れると 2 段階認証へ進む。',
    },
    signUp: {
      title: 'アカウントの作成',
      intro: 'パスワードは打ちながら強さと条件が分かり、入力欄の説明として読まれる。規約とプライバシーポリシーへの同意を求める。送信するまでは責めない。',
    },
    reset: {
      title: 'パスワードの再設定',
      intro: '再設定のメールは、登録の有無にかかわらず同じ画面に進む（アカウントの有無を明かさない）。送った後は待ち時間の後に送り直せる。リンクの期限が切れていれば、送り直す案内だけを出す。',
      forgot: 'メールを送る',
      reset: '新しいパスワード',
      expired: 'リンクの期限切れ',
    },
    twoFactor: {
      title: '2 段階認証',
      intro: '入力欄は 1 つ（autocomplete="one-time-code"）で、SMS の自動入力と貼り付けが効く。桁がそろうと自動で送り、違えばコードを消して欄へ戻す。見本の確認コードは「123456」。',
    },
    verifyEmail: {
      title: 'メールアドレスの確認',
      intro: '送った先を示し、送り直し・アドレスの変更・確認できた後の続きを案内する。',
    },
    signOut: {
      title: 'ログアウト',
      intro: 'ログアウトしてよいかを尋ねる画面と、ログアウトした後の画面。',
      confirm: '確認',
      done: 'ログアウトした後',
    },
    a11yCaption: 'ログインと登録のテンプレートが満たす仕様',
  },
  status: {
    lead: '4xx / 5xx・オフライン・メンテナンス。何が起きたか・なぜか・次に何ができるかを、利用者を責めない言葉で書き、次の一歩を状態ごとに変える。',
    error: {
      title: 'エラーのページ',
      intro: '401 はログイン、403 は権限の依頼、404 はホームと前のページ、429・5xx・オフラインはもう一度試す。状態コードは大きく見せ、読み上げでは「エラー 404」と読ませる。5xx の問い合わせ番号は写せる。429 は待ち時間の間、「もう一度試す」を押せない。',
      variants: {
        notFound: '404 見つからない',
        server: '500 サーバーの問題',
        forbidden: '403 権限が無い',
        unauthorized: '401 ログインが必要',
        tooMany: '429 多すぎる',
        offline: 'オフライン',
      },
    },
    maintenance: {
      title: 'メンテナンス',
      intro: '予定は見ている人の時間帯で、時間帯の名前を添えて出す（同じ日なら日付は 1 度だけ）。稼働状況のページがあれば先に案内し、経過の知らせを時刻つきで並べる。',
    },
    code: "import { ErrorPage, MaintenancePage } from '@genelab/gassan';\n\n// Next.js の app/not-found.tsx\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />",
    codeCaption: '使い方',
    a11yCaption: 'エラーとメンテナンスのテンプレートが満たす仕様',
  },
  public: {
    lead: '料金・よくある質問・お問い合わせ・規約とプライバシーポリシー・更新履歴。ヘッダとフッタ（SiteLayout）ごと 1 つの部品で出す。案内とフッタの列は SiteProvider に 1 度書けば、全部のページに効く。',
    site: {
      title: '外枠',
      intro: '本文へ飛ぶリンク・ヘッダの案内（いまのページに aria-current）・フッタのリンクの列・規約のリンク。器が狭いときは、案内を「メニュー」のボタンの下に畳む。自分の外枠の中に置くときは layout={false}。',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: '料金', href: '/pricing' },\n    { label: 'よくある質問', href: '/faq' },\n  ]}\n  footer={[{ title: '会社', links: [{ label: '会社概要', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"2 か月分お得\" />\n</SiteProvider>",
    },
    pricing: {
      title: '料金プラン',
      intro: '月払いと年払いを切り替え、値段は通貨の書式で出す。読み上げは「月額 ¥1,500」と期間を言葉にする。推すプランは「おすすめ」の言葉と外側の輪で示し、比べる表は列と行の見出しを持つ。',
    },
    faq: {
      title: 'よくある質問',
      intro: '質問と言葉で絞り込み（かなと全角半角を区別しない）、件数を読み上げる。まとまりごとに見出しで分け、アドレスの #id の質問は開いた状態で出す。最後に問い合わせの道を置く。',
    },
    contact: {
      title: 'お問い合わせ',
      intro: '日本の問い合わせフォームの慣習どおり、必須と任意の印を出す。種類はセレクト、内容は文字数を表示し、プライバシーポリシーへの同意を求める。送ったら受付の画面へ切り替える。',
    },
    document: {
      title: '規約と文書',
      intro: '施行日と更新日（time 要素）・目次（名前のある nav）・番号つきの節（「第 1 条」）。器が広いときは目次を横に置いて付いてこさせ、印刷では目次と外枠を省く。特定商取引法に基づく表記は、名前と値の一覧で書ける。',
      variants: { terms: '利用規約', privacy: 'プライバシーポリシー', legal: '特定商取引法に基づく表記' },
    },
    changelog: {
      title: '更新履歴',
      intro: '更新ごとに見出し・日付（time 要素）・版・種類の言葉の印を持ち、使われている種類だけで絞り込める。器が広いときは日付と版を横の列に置く。',
    },
    a11yCaption: '公開ページのテンプレートが満たす仕様',
  },
  app: {
    lead: 'ログインした後の画面の外枠。左の案内の帯・上の帯（検索・通知・アカウント）・本文。器が狭いときは、上の帯の「メニュー」から横の面で案内を開く。中身はページの見出しの帯・数の要約・データの表で組む。',
    setup: {
      title: '使い方',
      intro: '案内はまとまりごとに渡し、いまのページの行き先を current に渡す。製品の名前とロゴ、リンクを描く部品（Next.js の Link など）は SiteProvider から引く。',
      code: "import { AppShell, PageHeader, DataTable } from '@genelab/gassan';\n\n<AppShell\n  current={pathname}\n  nav={[\n    { items: [{ label: 'ホーム', href: '/app', icon: <HomeIcon /> }] },\n    { title: 'ワークスペース', items: [{ label: 'メンバー', href: '/app/members' }] },\n  ]}\n  actions={<IconButton label=\"検索\"><SearchIcon /></IconButton>}\n  account={{ name: '佐藤 葵', menu: [{ value: 'sign-out', label: 'ログアウト', onSelect: signOut }] }}\n>\n  <PageHeader title=\"メンバー\" actions={<Button variant=\"primary\">招待する</Button>} />\n  <DataTable label=\"メンバー\" rows={members} columns={columns} getRowId={(m) => m.id} selectable />\n</AppShell>",
    },
    shell: {
      title: 'アプリの枠',
      intro: '器が広いときは左に案内の帯を置き、いまのページを地の色と太字で示す。「スマートフォン」に切り替えると案内は畳まれ、「メニュー」から横の面で開く（Esc か外を押すと閉じ、案内のリンクを押しても閉じる）。メンバーの画面では、行の「…」から詳細を横の面で開ける。',
      variants: { dashboard: 'ホーム（ダッシュボード）', members: 'メンバー（データの表）' },
    },
    a11yCaption: 'アプリの枠が満たす仕様',
  },
};
