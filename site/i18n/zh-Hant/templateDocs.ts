import type ja from '../ja/templateDocs';

export default {
  auth: {
    lead: '登入、建立帳號、重設密碼、兩步驟驗證、驗證電子郵件、登出。只要放一個元件，就能得到完整的頁面：自動填入的屬性、需要修正之處的摘要、傳送期間防止重複送出，連畫面切換時的焦點也都處理好了。',
    setup: {
      title: '用法',
      intro: '在應用程式的根部放一個 SiteProvider，傳入產品的名稱、標誌與各個連結目的地。範本的外觀在 templates.css 中（在 styles.css 之後載入）。Next.js 的 Link 等元件則傳給 linkComponent。',
      code: "import '@genelab/gassan/styles.css';\nimport '@genelab/gassan/templates.css';\nimport { SiteProvider, SignInPage } from '@genelab/gassan';\n\n<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' }}\n  linkComponent={Link}\n>\n  <SignInPage\n    onSubmit={async ({ email, password, remember }) => {\n      const ok = await signIn(email, password, remember);\n      // 失敗時顯示預設的訊息（不透露是哪一項錯誤）\n      if (!ok) return { error: true };\n    }}\n  />\n</SiteProvider>",
    },
    signIn: {
      title: '登入',
      intro: '電子郵件地址（autocomplete="username"）與密碼（current-password）能讓密碼管理工具自動填入。失敗時不透露是哪一項錯誤，也不清除已輸入的內容。也可以並列外部身分提供者的按鈕。在範例中，密碼輸入「gassan」就會進入兩步驟驗證。',
    },
    signUp: {
      title: '建立帳號',
      intro: '輸入密碼時會顯示強度與要符合的條件，並作為輸入欄位的說明被朗讀。要求同意服務條款與隱私權政策。在送出之前不會顯示錯誤。',
    },
    reset: {
      title: '重設密碼',
      intro: '無論電子郵件地址是否已註冊，寄送重設郵件後都會進入同一個畫面（不透露帳號是否存在）。寄出後，等待一段時間即可重新寄送。若連結已過期，只顯示重新寄送的指引。',
      forgot: '寄送郵件',
      reset: '新密碼',
      expired: '連結已過期',
    },
    twoFactor: {
      title: '兩步驟驗證',
      intro: '只有一個輸入欄位（autocomplete="one-time-code"），支援簡訊自動填入與貼上。位數到齊就自動送出，錯誤時清除驗證碼並回到欄位。範例中的驗證碼是「123456」。',
    },
    verifyEmail: {
      title: '驗證電子郵件地址',
      intro: '顯示郵件寄往何處，並引導重新寄送、變更地址，以及驗證完成後的下一步。',
    },
    signOut: {
      title: '登出',
      intro: '詢問是否確定登出的畫面，以及登出之後的畫面。',
      confirm: '確認',
      done: '登出後',
    },
    a11yCaption: '登入與註冊範本滿足的規格',
  },
  status: {
    lead: '4xx / 5xx、離線、維護。用不責怪使用者的措辭寫出發生了什麼、為什麼、接下來能做什麼，並依狀態改變下一步。',
    error: {
      title: '錯誤頁面',
      intro: '401 引導登入，403 引導申請權限，404 引導回到首頁與上一頁，429、5xx 與離線則引導再試一次。狀態碼顯示得很大，朗讀時讀作「錯誤 404」。5xx 的參考編號可以複製。429 在等候期間無法按下「再試一次」。',
      variants: {
        notFound: '404 找不到',
        server: '500 伺服器問題',
        forbidden: '403 沒有權限',
        unauthorized: '401 需要登入',
        tooMany: '429 請求過多',
        offline: '離線',
      },
    },
    maintenance: {
      title: '維護',
      intro: '預定時間以瀏覽者所在的時區顯示，並附上時區名稱（同一天時日期只顯示一次）。若有服務狀態頁面，會優先引導前往，並依時間列出進度通知。',
    },
    code: "import { ErrorPage, MaintenancePage } from '@genelab/gassan';\n\n// Next.js 的 app/not-found.tsx\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />",
    codeCaption: '用法',
    a11yCaption: '錯誤與維護範本滿足的規格',
  },
  public: {
    lead: '價格、常見問題、聯絡我們、服務條款與隱私權政策、更新紀錄。連同頁首與頁尾（SiteLayout）一起由一個元件輸出。導覽與頁尾的各欄只要在 SiteProvider 寫一次，就會套用到所有頁面。',
    site: {
      title: '頁面外框',
      intro: '跳到主要內容的連結、頁首的導覽（目前頁面帶有 aria-current）、頁尾的連結欄，以及條款的連結。容器較窄時，導覽會收進「選單」按鈕底下。放進自己的外框時，使用 layout={false}。',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: '價格', href: '/pricing' },\n    { label: '常見問題', href: '/faq' },\n  ]}\n  footer={[{ title: '公司', links: [{ label: '關於我們', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"省下 2 個月費用\" />\n</SiteProvider>",
    },
    pricing: {
      title: '方案與價格',
      intro: '可切換月繳與年繳，價格以貨幣的格式顯示。朗讀時會把週期讀成文字，例如「每月 ¥1,500」。推薦的方案以「推薦」字樣與外圍的框線標示，比較表具備欄標題與列標題。',
    },
    faq: {
      title: '常見問題',
      intro: '可依詞語篩選問題（不區分平假名與片假名、全形與半形），並朗讀結果數量。依類別以標題分組，網址中 #id 指定的問題會以展開狀態顯示。最後放上聯絡我們的入口。',
    },
    contact: {
      title: '聯絡我們',
      intro: '依照日本聯絡表單的慣例，標示必填與選填。類型使用下拉選單，內容顯示字數，並要求同意隱私權政策。送出後切換到受理完成的畫面。',
    },
    document: {
      title: '條款與文件',
      intro: '生效日期與更新日期（time 元素）、目錄（帶名稱的 nav）、帶編號的條文（「第 1 條」）。容器較寬時，目錄放在側邊並跟隨捲動；列印時省略目錄與外框。依據《特定商業交易法》的標示，可以寫成名稱與值的清單。',
      variants: { terms: '服務條款', privacy: '隱私權政策', legal: '依據《特定商業交易法》的標示' },
    },
    changelog: {
      title: '更新紀錄',
      intro: '每次更新都有標題、日期（time 元素）、版本與以文字表示類型的標籤，可以只依實際用到的類型篩選。容器較寬時，日期與版本放在側邊的一欄。',
    },
    a11yCaption: '公開頁面範本滿足的規格',
  },
  app: {
    lead: '登入之後的畫面外框。左側的導覽列、頂端列（搜尋、通知、帳戶）與主要內容。容器較窄時，從頂端列的「選單」以側邊面板開啟導覽。內容由頁面標題列、數值摘要與資料表格組成。',
    setup: {
      title: '用法',
      intro: '導覽依分組傳入，並把目前頁面的連結目的地傳給 current。產品的名稱與標誌，以及繪製連結的元件（Next.js 的 Link 等），都從 SiteProvider 取得。',
      code: "import { AppShell, PageHeader, DataTable } from '@genelab/gassan';\n\n<AppShell\n  current={pathname}\n  nav={[\n    { items: [{ label: '首頁', href: '/app', icon: <HomeIcon /> }] },\n    { title: '工作區', items: [{ label: '成員', href: '/app/members' }] },\n  ]}\n  actions={<IconButton label=\"搜尋\"><SearchIcon /></IconButton>}\n  account={{ name: '陳怡君', menu: [{ value: 'sign-out', label: '登出', onSelect: signOut }] }}\n>\n  <PageHeader title=\"成員\" actions={<Button variant=\"primary\">邀請</Button>} />\n  <DataTable label=\"成員\" rows={members} columns={columns} getRowId={(m) => m.id} selectable />\n</AppShell>",
    },
    shell: {
      title: '應用程式外框',
      intro: '容器較寬時，在左側放置導覽列，並以底色與粗體標示目前的頁面。切換到「手機」後，導覽會收合，可以從「選單」以側邊面板開啟（按 Esc 或點擊外側即可關閉，點擊導覽中的連結也會關閉）。從導覽可以前往成員、方案與帳單、設定的範例。',
      variants: { dashboard: '首頁（儀表板）', members: '成員（資料表格）' },
    },
    a11yCaption: '應用程式外框滿足的規格',
  },
  appPages: {
    lead: '登入之後、每個 SaaS 都有的畫面：帳號設定、成員與邀請、方案與帳單、初始設定、接受邀請的頁面。放在應用程式外框中，只要傳入資料與處理函式，送出流程、確認用的模態視窗，連結果的朗讀也都處理好了。',
    setup: {
      title: '用法',
      intro: '內容放在應用程式外框（AppShell）中。傳入的只有資料與處理函式（儲存、邀請、取消訂閱等）。處理失敗時回傳 { error }，這段訊息就會插入朗讀。沒有傳入的區塊與操作不會顯示。',
      code: "import { AppShell, MembersPage, SettingsPage } from '@genelab/gassan';\n\n<AppShell current=\"/settings\" nav={nav} account={account}>\n  <SettingsPage\n    profile={{ name: user.name, email: user.email, onSubmit: saveProfile }}\n    password={{ onSubmit: changePassword }}\n    sessions={{ items: sessions, onRevoke: revokeSession, onRevokeOthers: revokeOtherSessions }}\n    deleteAccount={{ confirmText: user.email, onDelete: deleteAccount }}\n  />\n</AppShell>\n\n<MembersPage\n  members={members}\n  roles={[{ value: 'admin', label: '管理員' }, { value: 'editor', label: '編輯者' }]}\n  currentUserId={user.id}\n  onInvite={({ emails, role }) => invite(emails, role)}\n  onRemove={(ids) => removeMembers(ids)}\n/>",
    },
    settings: {
      title: '帳號設定',
      intro: '個人資料、密碼、兩步驟驗證、已登入的裝置、刪除帳號，分成帶有標題的區塊依序排列。容器較寬時，區塊的標題與說明放在左側一欄。將裝置登出的按鈕帶有裝置的名稱，目前正在使用的裝置則沒有這個按鈕。刪除要在確認用的模態視窗中進行，輸入指定的文字（如電子郵件地址）之前無法按下。',
    },
    members: {
      title: '成員',
      intro: '已使用的席次、依姓名與電子郵件地址篩選（不區分平假名與片假名、全形與半形）、成員表格、邀請中的清單。邀請在模態視窗中進行，把電子郵件地址當作標籤一次輸入。自己的那一列無法選取、無法移除，也無法變更角色。移除時會先經過確認用的模態視窗。',
    },
    billing: {
      title: '方案與帳單',
      intro: '目前的方案與下次續約日、付款方式（信用卡只顯示末四碼）、用量、發票表格。用量達到 80% 時顯示警告色，達到上限時顯示錯誤色，也會以數字標示。付款失敗時，會以頁面頂端的通知橫幅告知。在範例中取消訂閱後，會改為顯示可使用的最後一天。',
    },
    onboarding: {
      title: '初始設定',
      intro: '註冊後緊接著的步驟。在卡片上方放置進度，步驟切換時把焦點移到標題。無法進到下一步的原因會顯示在內容上方並朗讀。可以略過的步驟會顯示「稍後再設定」。在範例中，沒有輸入工作區名稱就無法進到下一步。',
    },
    invite: {
      title: '接受邀請',
      intro: '標示是誰、邀請你加入哪個工作區、擔任什麼角色，並放上接受 / 拒絕。尚未登入時引導前往登入與建立帳號；邀請過期時只引導接下來該做的事。拒絕後，切換到已拒絕的畫面，並把焦點移到標題。',
      variants: { pending: '邀請', signedOut: '未登入', expired: '已過期' },
    },
    a11yCaption: '應用程式內頁面範本滿足的規格',
  },
} satisfies typeof ja;
