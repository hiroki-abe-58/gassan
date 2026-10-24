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
      intro: 'IANA に登録された 4xx と 5xx の 40 個とオフラインに、それぞれの見出し・説明・次の一歩を持つ（登録に無い状態は 4xx / 5xx の文で出す）。次の一歩は状態で変える。401 はログイン、402 は請求の設定、403 と 451 は問い合わせ、ページや機能にたどり着けないとき（404・410 など）はホーム、送った内容に問題があるときは前のページ、時間をおくか読み込み直せば直るときはもう一度試す（サーバー側の問題には稼働状況も添える）。状態コードは大きく見せ、読み上げでは「エラー 404」と読ませる。5xx の問い合わせ番号は写せる。429 は待ち時間の間、「もう一度試す」を押せない。',
      offline: 'オフライン',
      tableCaption: 'エラーのページが持つ状態',
      head: { code: 'コード', title: '見出し', description: '説明' },
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
      intro: '器が広いときは左に案内の帯を置き、いまのページを地の色と太字で示す。「スマートフォン」に切り替えると案内は畳まれ、「メニュー」から横の面で開く（Esc か外を押すと閉じ、案内のリンクを押しても閉じる）。案内からは、メンバー・料金と請求・設定の見本へ移れる。',
      variants: { dashboard: 'ホーム（ダッシュボード）', members: 'メンバー（データの表）' },
    },
    a11yCaption: 'アプリの枠が満たす仕様',
  },
  appPages: {
    lead: 'ログインした後の、どの SaaS にもある画面。アカウントの設定・メンバーと招待・料金と請求・はじめの設定・招待を受けるページ。アプリの枠の中に置き、データと処理を渡すだけで、送信の流れ・確かめるモーダル・結果の読み上げまで揃う。',
    setup: {
      title: '使い方',
      intro: '中身はアプリの枠（AppShell）の中に置く。渡すのはデータと処理（保存・招待・解約など）だけで、処理が失敗なら { error } を返すと、その文を割り込ませて読み上げる。渡さなかった節や操作は出さない。',
      code: "import { AppShell, MembersPage, SettingsPage } from '@genelab/gassan';\n\n<AppShell current=\"/settings\" nav={nav} account={account}>\n  <SettingsPage\n    profile={{ name: user.name, email: user.email, onSubmit: saveProfile }}\n    password={{ onSubmit: changePassword }}\n    sessions={{ items: sessions, onRevoke: revokeSession, onRevokeOthers: revokeOtherSessions }}\n    deleteAccount={{ confirmText: user.email, onDelete: deleteAccount }}\n  />\n</AppShell>\n\n<MembersPage\n  members={members}\n  roles={[{ value: 'admin', label: '管理者' }, { value: 'editor', label: '編集者' }]}\n  currentUserId={user.id}\n  onInvite={({ emails, role }) => invite(emails, role)}\n  onRemove={(ids) => removeMembers(ids)}\n/>",
    },
    settings: {
      title: 'アカウントの設定',
      intro: 'プロフィール・パスワード・2 段階認証・ログイン中の端末・アカウントの削除を、見出しのある節に分けて並べる。器が広いときは、節の見出しと説明を左の列に置く。端末のログアウトは端末の名前つきのボタンで、いま使っている端末には置かない。削除は確かめるモーダルで、決めた文字（メールアドレスなど）を打つまで押せない。',
    },
    members: {
      title: 'メンバー',
      intro: '使っている席・名前とメールアドレスでの絞り込み（かなと全角半角を区別しない）・メンバーの表・招待中の一覧。招待はモーダルで、メールアドレスをタグとしてまとめて入れる。自分の行は選べず、外せず、役割も変えられない。外すときは確かめるモーダルを挟む。',
    },
    billing: {
      title: '料金と請求',
      intro: '今のプランと次の更新日・支払い方法（カードは下 4 桁だけ）・使っている量・請求書の表。量は 8 割で注意、上限で失敗の色になり、数でも示す。支払いに失敗していれば、ページの上の知らせの帯で伝える。見本で解約すると、使える最後の日の表示に変わる。',
    },
    onboarding: {
      title: 'はじめの設定',
      intro: '登録した直後の手順。カードの上に進み具合を置き、手順が変わると見出しへフォーカスを移す。次へ進めない理由は、中身の上に出して読み上げる。飛ばせる手順には「あとで設定する」を出す。見本では、ワークスペースの名前を入れないと次へ進めない。',
    },
    invite: {
      title: '招待を受ける',
      intro: '誰が・どのワークスペースに・どの役割で招待したかを示し、受ける / 断るを置く。ログインしていなければログインとアカウントの作成へ、期限切れなら次にすることだけを案内する。断ったら、その画面に切り替えて見出しへフォーカスを移す。',
      variants: { pending: '招待', signedOut: 'ログインしていない', expired: '期限切れ' },
    },
    a11yCaption: 'アプリの中のページのテンプレートが満たす仕様',
  },
  conversations: {
    lead: 'チャットと AI アシスタントの画面。アプリの枠の中に置き、会話とメッセージと送る処理を渡すだけで、一覧と会話の切り替え・未読の数・会話ごとの書きかけ・回答を止めるボタンまで揃う。',
    setup: {
      title: '使い方',
      intro: '開いている会話と、そのメッセージは利用側が持つ。会話を選ぶと onConversationChange が、履歴の会話を選ぶと onThreadChange が呼ばれる。器が狭いときは、一覧と会話を切り替えて見せる。',
      code: "import { AssistantPage, ChatPage } from '@genelab/gassan';\n\n<ChatPage\n  conversations={conversations}\n  current={currentId}\n  onConversationChange={setCurrentId}\n  messages={messagesOf(currentId)}\n  currentUserId={user.id}\n  onSend={(text) => send(currentId, text)}\n/>\n\n<AssistantPage\n  messages={messages}\n  currentUserId={user.id}\n  onSend={ask}\n  generating={generating}\n  onStop={stop}\n  suggestions={suggestions}\n  history={threads}\n  currentThreadId={threadId}\n  onThreadChange={openThread}\n  onNewThread={startThread}\n/>",
    },
    chat: {
      title: 'チャット',
      intro: '左に会話の一覧（チャンネルと相手との会話・未読の数・最後のメッセージ）、右に開いている会話。会話を開くと未読が消え、新着の線から読み始める。送ると「送信中」から変わり、相手との会話では入力中の印のあとに返事が届く。「スマートフォン」に切り替えると一覧と会話を切り替え、見出しの前の「戻る」で一覧へ戻る。',
    },
    assistant: {
      title: 'AI アシスタント',
      intro: '何も話していなければ問いかけと質問の例を出し、話し始めたら回答を流しながら書く。書いている間は、送信のボタンが「止める」になる。左の履歴は今日・昨日・過去 7 日間・それより前に分け、「新しい会話」で質問の例の画面に戻る。「スマートフォン」では、見出しの前の時計のボタンで履歴を開く。',
    },
    a11yCaption: '会話のページのテンプレートが満たす仕様',
  },
  mail: {
    lead: 'メールの画面。フォルダ・メールの一覧・読む面を、器の幅に合わせて 3 列・2 列・切り替えで出す。行を選んでまとめてアーカイブ・削除・既読にでき、作成・返信・転送はモーダルで書く。',
    setup: {
      title: '使い方',
      intro: 'フォルダと開いているメールは利用側が持つ。メールを開くと onOpen が呼ばれる（既読にするのも利用側）。まとめての操作と送信は処理を渡すだけで、失敗なら { error } を返すと、その文を割り込ませて読み上げる。渡さなかった操作は出さない。',
      code: "import { MailboxPage } from '@genelab/gassan';\n\n<MailboxPage\n  folders={folders}\n  currentFolder={folderId}\n  onFolderChange={setFolderId}\n  messages={messagesIn(folderId)}\n  current={messageId}\n  onOpen={openMessage}\n  onArchive={(ids) => archive(ids)}\n  onDelete={(ids) => moveToTrash(ids)}\n  onMarkRead={(ids, read) => markRead(ids, read)}\n  onStar={(id, starred) => star(id, starred)}\n  onSend={(values) => send(values)}\n/>",
    },
    preview: {
      title: 'メール',
      intro: '広い器ではフォルダ・一覧・読む面を並べる。行を選ぶと上に「n件を選択中」とまとめての操作が出て、アーカイブや削除の結果を読み上げる。メールを開くと既読になり、返信は宛先と件名を入れた書く画面を開く。「スマートフォン」に切り替えると、フォルダは一覧の上のセレクトになり、一覧と読む面を切り替える。',
    },
    a11yCaption: 'メールのテンプレートが満たす仕様',
  },
};
