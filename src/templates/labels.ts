import { Fragment, createElement, type ReactNode } from 'react';

/**
 * エラーページが見出し・説明・次の一歩を持つ HTTP の状態コード。IANA に登録された 4xx / 5xx のすべて
 * （RFC 9110 と、その拡張の RFC 2295・2774・4918・5842・6585・7725・8470）。418 は RFC 9110 で使われていないが、登録に残っている。
 */
export const ERROR_STATUSES = [
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429,
  431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
] as const;

/** エラーページが知っている状態。数字は HTTP の状態コード。 */
export type ErrorStatus = (typeof ERROR_STATUSES)[number] | 'offline';

/** 状態ごとの文言の鍵。登録に無い 4xx / 5xx は '4xx' / '5xx' の文言で出す。 */
export type ErrorCopyKey = `${Exclude<ErrorStatus, 'offline'>}` | 'offline' | '4xx' | '5xx';

/**
 * ページのテンプレートの文言。P-02。
 *
 * 日本語（japaneseTemplateLabels）と英語（englishTemplateLabels）を同梱する。既定は GassanProvider の言語
 * （labels.locale が ja で始まれば日本語）で選び、SiteProvider の labels で差し替えられる。既定はまとまりごとの
 * 日本語と英語の組（commonLabels など）に分けてあり、テンプレートは useTemplateLabels で使うまとまりの組だけを読む。
 * 文を組み立てる関数は、差し込む値（メールアドレス・秒数）を受け取る。リンクを差し込む文は ReactNode を受け取る。
 */
export interface TemplateLabels {
  /** 日付と数の書式（Intl）に使う。 */
  locale: string;
  common: {
    skipToContent: string;
    home: string;
    back: string;
    retry: string;
    contactSupport: string;
    statusPage: string;
    /** 402 のページの次の一歩（請求の設定へのリンク）。 */
    billing: string;
    signIn: string;
    signUp: string;
    backToSignIn: string;
    terms: string;
    privacy: string;
    help: string;
    or: string;
    continueWith: (provider: string) => string;
    email: string;
    password: string;
    newPassword: string;
    confirmPassword: string;
    name: string;
    /** 送信したときの、直す所のまとめの見出し。 */
    errorSummary: string;
    requiredField: (field: string) => string;
    invalidEmail: string;
    passwordTooShort: (min: number) => string;
    /** 確認の欄が空のとき。 */
    confirmRequired: string;
    passwordMismatch: string;
    /** onSubmit が理由を返さずに失敗したとき。 */
    submitFailed: string;
    resend: string;
    resendIn: (seconds: number) => string;
    resent: string;
    reference: string;
    copyReference: string;
    /** 探す欄の送るボタン（監査ログ・検索結果）。 */
    search: string;
  };
  signIn: {
    title: string;
    description: string;
    remember: string;
    forgot: string;
    submit: string;
    failed: string;
    noAccount: string;
  };
  signUp: {
    title: string;
    description: string;
    /** 「利用規約とプライバシーポリシーに同意します」。2 つの文書へのリンクを差し込む。 */
    agree: (terms: ReactNode, privacy: ReactNode) => ReactNode;
    agreeRequired: string;
    submit: string;
    hasAccount: string;
  };
  forgotPassword: {
    title: string;
    description: string;
    submit: string;
    sentTitle: string;
    /** 登録の有無を明かさない書き方にする（P-04）。 */
    sentDescription: (email: string) => string;
  };
  resetPassword: {
    title: string;
    description: string;
    submit: string;
    doneTitle: string;
    doneDescription: string;
    expiredTitle: string;
    expiredDescription: string;
    requestAgain: string;
  };
  twoFactor: {
    title: string;
    /** 説明。length はコードの桁数。 */
    app: (length: number) => string;
    sms: (destination: string, length: number) => string;
    email: (destination: string, length: number) => string;
    code: string;
    trust: (days: number) => string;
    submit: string;
    failed: string;
    other: string;
  };
  verifyEmail: {
    title: string;
    description: (email: string) => string;
    change: string;
    verifiedTitle: string;
    verifiedDescription: string;
    continue: string;
    expiredTitle: string;
    expiredDescription: string;
  };
  signOut: {
    confirmTitle: string;
    confirmDescription: string;
    confirm: string;
    cancel: string;
    doneTitle: string;
    doneDescription: string;
    signInAgain: string;
  };
  /** メールアドレスを先に聞くログイン（EmailFirstPage）。P-22。 */
  emailFirst: {
    title: string;
    description: string;
    continue: string;
    changeEmail: string;
    passwordDescription: (email: string) => string;
    newAccountDescription: (email: string) => string;
    ssoTitle: string;
    ssoDescription: (provider: string) => string;
  };
  /** パスワードを使わない、メールのリンクと確認コードのログイン（MagicLinkPage）。P-23。 */
  magicLink: {
    title: string;
    description: string;
    submit: string;
    sentTitle: string;
    sentDescription: (email: string) => string;
    code: string;
    codeSubmit: string;
    failed: string;
    useAnotherEmail: string;
    usePassword: string;
  };
  /** 送ったメールが届かないときの案内。sender は送り主（携帯会社のメールの受信設定に使う）。P-23 / P-24。 */
  notReceived: {
    title: string;
    spam: string;
    wait: string;
    typo: string;
    carrier: (sender: string) => string;
  };
  /** メールアドレスだけの仮登録（QuickSignUpPage）。P-24。 */
  quickSignUp: {
    title: string;
    description: string;
    submit: string;
    sentTitle: string;
    sentDescription: (email: string) => string;
    expires: (period: string) => string;
    nextSteps: string;
  };
  /** 本登録の手順（RegistrationWizardPage）。P-25。 */
  wizard: {
    progress: string;
    back: string;
    next: string;
    skip: string;
    saveAndExit: string;
    saved: string;
    reviewTitle: string;
    reviewDescription: string;
    edit: (step: string) => string;
    backToReview: string;
    submit: string;
    doneTitle: string;
    doneDescription: string;
  };
  /** 電話番号と SMS のコードのログイン（PhoneSignInPage）。確認コードの欄と送信は twoFactor の文言を使う。P-26。 */
  phoneSignIn: {
    title: string;
    description: string;
    phone: string;
    phoneHelp: string;
    notMobile: string;
    invalidPhone: string;
    submit: string;
    codeTitle: string;
    codeDescription: (phone: string, length: number) => string;
    changeNumber: string;
  };
  /** パスキー（ログインのボタンと、作るかを尋ねる画面）。P-27。 */
  passkey: {
    signIn: string;
    promptTitle: string;
    promptDescription: string;
    benefits: readonly string[];
    create: string;
    later: string;
    createdTitle: string;
    createdDescription: string;
    failed: string;
  };
  /** この端末で使ったアカウントから選ぶ（AccountChooserPage）。P-28。 */
  accountChooser: {
    title: string;
    description: string;
    list: string;
    useAnother: string;
    remove: (account: string) => string;
    removed: (account: string) => string;
  };
  /** もう一度のパスワード（大事な操作の前と、ログインの期限切れ。ReauthDialog）。P-29。 */
  reauth: {
    confirmTitle: string;
    confirmDescription: string;
    expiredTitle: string;
    expiredDescription: string;
    confirm: string;
    failed: string;
    signInAnother: string;
  };
  /** 購入の後にアカウントを作る（GuestAccountCard）。P-30。 */
  guestAccount: {
    title: string;
    description: (email: string) => string;
    submit: string;
    later: string;
    doneTitle: string;
    doneDescription: string;
  };
  error: {
    /** 状態コードの前に添える、読み上げ用の語（「エラー 404」）。 */
    code: string;
    titles: Record<ErrorCopyKey, string>;
    descriptions: Record<ErrorCopyKey, string>;
    retryIn: (seconds: number) => string;
  };
  maintenance: {
    title: string;
    description: string;
    schedule: string;
    /** 始まりと終わりをつなぐ（「2:00〜4:00」）。 */
    range: (start: string, end: string) => string;
    until: (end: string) => string;
    updates: string;
    reload: string;
  };
  site: {
    /** ヘッダの案内の nav の名前。 */
    nav: string;
    /** 狭い器で案内を開くボタン。 */
    menu: string;
    /** フッタの nav の名前。 */
    footerNav: string;
  };
  document: {
    toc: string;
    effective: string;
    updated: string;
    /** 'article' の番号（「第 3 条」）。 */
    article: (n: number) => string;
    backToTop: string;
  };
  faq: {
    title: string;
    description: string;
    search: string;
    /** 絞り込んだ件数（読み上げる）。 */
    results: (count: number) => string;
    noResults: string;
    stillNeedHelp: string;
    contact: string;
    other: string;
  };
  pricing: {
    title: string;
    description: string;
    billing: string;
    monthly: string;
    yearly: string;
    perMonth: string;
    /** 年払いのときの、一括の額（「年 ¥14,400 を一括でお支払い」）。 */
    billedYearly: (amount: string) => string;
    /** 値段の読み上げ（「月額 1,200 円」）。 */
    monthlyPrice: (amount: string) => string;
    contactSales: string;
    custom: string;
    recommended: string;
    compare: string;
    feature: string;
    included: string;
    notIncluded: string;
    faq: string;
  };
  contact: {
    title: string;
    description: string;
    company: string;
    topic: string;
    topics: { product: string; billing: string; bug: string; other: string };
    chooseTopic: string;
    message: string;
    /** 「プライバシーポリシーに同意します」。リンクを差し込む。 */
    agree: (privacy: ReactNode) => ReactNode;
    agreeRequired: string;
    submit: string;
    doneTitle: string;
    doneDescription: (email: string) => string;
  };
  changelog: {
    title: string;
    description: string;
    filter: string;
    all: string;
    tags: { new: string; improved: string; fixed: string; security: string; breaking: string };
    subscribe: string;
  };
  /** アプリの枠（AppShell）。P-12。account はアカウントのメニューの起点の名前（見えている名前で始める）。 */
  app: {
    nav: string;
    menu: string;
    account: (name: string) => string;
  };
  /** アカウントの設定（SettingsPage）。P-13。 */
  settings: {
    title: string;
    description: string;
    save: string;
    saved: string;
    profile: { title: string; description: string };
    password: { title: string; description: string; current: string; submit: string; changed: string };
    twoFactor: {
      title: string;
      description: string;
      on: string;
      off: string;
      enable: string;
      disable: string;
      disableTitle: string;
      disableDescription: string;
      disabled: string;
    };
    sessions: {
      title: string;
      description: string;
      current: string;
      lastActive: (time: string) => string;
      revoke: string;
      /** 行のボタンの名前（見えている「ログアウトさせる」を含める）。 */
      revokeFor: (device: string) => string;
      revokeOthers: string;
      revoked: string;
    };
    deleteAccount: {
      title: string;
      description: string;
      open: string;
      confirmTitle: string;
      confirmDescription: string;
      typeToConfirm: (text: string) => string;
      /** 入力が合うまで「削除する」を押せない理由（ゲートの理由。G-07）。 */
      mismatch: (text: string) => string;
      confirm: string;
    };
  };
  /** メンバー（MembersPage）。P-14。 */
  members: {
    title: string;
    description: string;
    invite: string;
    inviteDescription: string;
    emails: string;
    emailsHelp: string;
    emailsRequired: string;
    role: string;
    message: string;
    send: string;
    sent: (count: number) => string;
    search: string;
    name: string;
    status: string;
    lastActive: string;
    statuses: { active: string; invited: string; suspended: string };
    you: string;
    roleFor: (name: string) => string;
    actionsFor: (name: string) => string;
    remove: string;
    removeTitle: (name: string) => string;
    removeManyTitle: (count: number) => string;
    removeDescription: string;
    removed: (count: number) => string;
    roleChanged: (name: string, role: string) => string;
    seats: string;
    seatsValue: (used: number, total: number) => string;
    invitations: string;
    invitedAt: string;
    resend: string;
    resendFor: (email: string) => string;
    resent: (email: string) => string;
    revoke: string;
    revokeFor: (email: string) => string;
    revoked: (email: string) => string;
    noMatch: (query: string) => string;
  };
  /** 料金と請求（BillingPage）。P-15。 */
  billing: {
    title: string;
    description: string;
    plan: string;
    statuses: { active: string; trialing: string; past_due: string; canceled: string };
    /** 値段と期間（「月額 ￥1,500」）。記号の「/ 月」ではなく言葉で読ませる。 */
    price: (amount: string, interval: 'month' | 'year') => string;
    renews: (date: string) => string;
    trialEnds: (date: string) => string;
    endsOn: (date: string) => string;
    changePlan: string;
    cancel: string;
    cancelTitle: string;
    cancelDescription: (date: string) => string;
    cancelConfirm: string;
    keep: string;
    canceled: string;
    pastDue: string;
    usage: string;
    payment: string;
    /** カードの読み上げ（「Visa、末尾 4242」）。見た目は「Visa •••• 4242」。 */
    card: (brand: string, last4: string) => string;
    expires: (month: string, year: string) => string;
    updatePayment: string;
    addPayment: string;
    noPayment: string;
    billingEmail: string;
    invoices: string;
    invoiceNumber: string;
    invoiceDate: string;
    amount: string;
    invoiceStatus: string;
    invoiceStatuses: { paid: string; open: string; void: string; uncollectible: string };
    download: string;
    downloadFor: (number: string) => string;
    noInvoices: string;
  };
  /** はじめの設定（OnboardingPage）。P-16。progress は手順の一覧の名前。 */
  onboarding: { progress: string; back: string; next: string; skip: string; finish: string };
  /** 招待を受ける（InviteAcceptPage）。P-17。 */
  invite: {
    title: (workspace: string) => string;
    description: (inviter: string, workspace: string) => string;
    role: (role: string) => string;
    accept: string;
    decline: string;
    signIn: string;
    signUp: string;
    signedOutHint: string;
    wrongAccount: (email: string) => string;
    switchAccount: string;
    expiredTitle: string;
    expiredDescription: string;
    invalidTitle: string;
    invalidDescription: string;
    declinedTitle: string;
    declinedDescription: string;
  };
  /** チャット（ChatPage）。P-18。 */
  chat: {
    title: string;
    conversations: string;
    channels: string;
    directMessages: string;
    search: string;
    noMatch: (query: string) => string;
    unread: (count: number) => string;
    back: string;
    none: string;
    /** メッセージの列の名前。 */
    messagesIn: (name: string) => string;
    placeholder: (name: string, kind: 'channel' | 'direct') => string;
  };
  /** AI アシスタント（AssistantPage）。P-19。履歴の「今日」「昨日」は GassanLabels の today / yesterday。 */
  assistant: {
    title: string;
    history: string;
    showHistory: string;
    closeHistory: string;
    newThread: string;
    previous7Days: string;
    older: string;
    greeting: string;
    /** メッセージの列の名前。 */
    conversation: string;
    placeholder: string;
    note: string;
  };
  /** メール（MailboxPage）。P-20。一覧の「昨日」は GassanLabels の yesterday。 */
  mail: {
    title: string;
    folders: string;
    compose: string;
    search: string;
    noMatch: (query: string) => string;
    empty: string;
    none: string;
    back: string;
    unread: string;
    unreadCount: (count: number) => string;
    attachment: string;
    selectAll: string;
    select: (subject: string) => string;
    selected: (count: number) => string;
    archive: string;
    delete: string;
    markRead: string;
    markUnread: string;
    star: string;
    starFor: (subject: string) => string;
    reply: string;
    forward: string;
    archived: (count: number) => string;
    deleted: (count: number) => string;
    markedRead: (count: number) => string;
    markedUnread: (count: number) => string;
    to: string;
    cc: string;
    attachments: string;
    download: (name: string) => string;
    newMessage: string;
    subject: string;
    body: string;
    toHelp: string;
    toRequired: string;
    send: string;
    sent: string;
    /** 返信の件名の頭（件名がすでにこれで始まっていれば重ねない）。 */
    replyPrefix: string;
    forwardPrefix: string;
  };
  /**
   * 注文の最終確認（OrderReviewPage）。P-32。見出しは特商法 12 条の 6 の表示事項（分量・代金・支払の時期と方法・
   * 引渡しの時期・申込みの期間・申込みの撤回と解除）にそろえる。description は「まだ注文は確定していない」ことを伝える。
   */
  orderReview: {
    title: string;
    description: string;
    items: string;
    product: string;
    quantity: string;
    /** 数量と単位（「2 点」）。 */
    quantityOf: (count: number, unit: string) => string;
    /** 単位の既定（「点」）。 */
    unit: string;
    /** 単価の読み上げと見た目（「単価 ￥1,200」）。 */
    unitPrice: (price: string) => string;
    lineTotal: string;
    address: string;
    delivery: string;
    payment: string;
    method: string;
    timing: string;
    offerPeriod: string;
    subscription: string;
    interval: string;
    pricePerDelivery: string;
    minimumCount: string;
    minimumCountOf: (count: number) => string;
    noMinimum: string;
    howToCancel: string;
    cancellation: string;
    summary: string;
    subtotal: string;
    shipping: string;
    free: string;
    total: string;
    edit: string;
    /** 「変更」の名前（「お届け先を変更」）。 */
    editFor: (section: string) => string;
    submit: string;
    submitNote: string;
    consentRequired: string;
  };
  /** Cookie と外部送信の同意（CookieConsent）。P-33。categories と descriptions は種類ごとの名前と説明。 */
  cookieConsent: {
    title: string;
    description: string;
    policy: string;
    acceptAll: string;
    rejectAll: string;
    customize: string;
    settingsTitle: string;
    settingsDescription: string;
    save: string;
    alwaysOn: string;
    categories: { necessary: string; functional: string; analytics: string; marketing: string };
    descriptions: { necessary: string; functional: string; analytics: string; marketing: string };
  };
  /** 外部送信の公表（ExternalTransmissionList）。P-34。 */
  externalTransmission: {
    label: string;
    information: string;
    purpose: string;
    category: string;
    /** 送信先のプライバシーポリシーと、送信を止めるページへのリンクの名前（送信先の名前を入れる）。 */
    policyFor: (recipient: string) => string;
    optOutFor: (recipient: string) => string;
  };
  /** 解約の手続き（CancelSubscriptionPage）。P-35。 */
  cancelSubscription: {
    title: string;
    description: (plan: string) => string;
    steps: string;
    stepReason: string;
    stepOffer: string;
    stepConfirm: string;
    reasonTitle: string;
    reasonDescription: string;
    comment: string;
    next: string;
    back: string;
    offerTitle: string;
    offerDescription: string;
    continueCancel: string;
    confirmTitle: string;
    /** 使える最後の日（「2026年11月1日 までは今のプランのまま使えます」）。 */
    until: (date: string) => string;
    afterEnd: string;
    export: string;
    confirm: string;
    keep: string;
    doneTitle: string;
    doneDescription: (date: string) => string;
    keptTitle: string;
    keptDescription: string;
  };
  /** API キー（ApiKeysPage）。P-36。 */
  apiKeys: {
    title: string;
    description: string;
    create: string;
    createDescription: string;
    name: string;
    nameHelp: string;
    scopes: string;
    scopesRequired: string;
    expiry: string;
    /** 有効期限の日数（「90 日」）。 */
    days: (count: number) => string;
    noExpiry: string;
    submit: string;
    createdTitle: string;
    secret: string;
    secretWarning: string;
    copySecret: string;
    done: string;
    /** キーを見せている間に Esc や外を押したとき、閉じずに読み上げる。 */
    closeBlocked: string;
    created: string;
    lastUsed: string;
    neverUsed: string;
    expired: string;
    revoke: string;
    /** 「無効にする」の名前（「本番のサーバー を無効にする」）。 */
    revokeFor: (name: string) => string;
    revokeTitle: (name: string) => string;
    revokeDescription: string;
    revoked: (name: string) => string;
    empty: string;
  };
  /** 監査ログ（AuditLogPage）。P-37。 */
  auditLog: {
    title: string;
    description: string;
    filters: string;
    search: string;
    action: string;
    allActions: string;
    range: string;
    clear: string;
    /** 条件に合う記録の数（「1,234 件」）。 */
    count: (count: number) => string;
    actor: string;
    target: string;
    source: string;
    /** 日時の列の見出し。時間帯の名前（「JST」）を添える。 */
    time: (zone: string) => string;
    export: string;
    exported: string;
    empty: string;
    noMatch: string;
  };
  /** 通知の設定（NotificationSettingsPage）。P-38。 */
  notificationSettings: {
    title: string;
    description: string;
    pause: string;
    pauseSwitch: string;
    pauseDescription: string;
    paused: string;
    topics: string;
    topicsDescription: string;
    topic: string;
    matrix: string;
    /** 既定の受け取る方法の名前。 */
    channels: { email: string; push: string; inApp: string };
    required: string;
    unavailable: string;
    quietHours: string;
    quietHoursDescription: string;
    quietHoursSwitch: string;
    start: string;
    end: string;
    /** おやすみ時間の説明（「毎日 22:00〜翌 7:00」）。nextDay は終わりが翌日のとき。 */
    everyDay: (start: string, end: string, nextDay: boolean) => string;
    save: string;
    saved: string;
  };
  /** 稼働状況（ServiceStatusPage）。P-39。 */
  serviceStatus: {
    title: string;
    description: string;
    /** 全体の状態の文（いちばん重い部分の状態で決める）。 */
    overall: { operational: string; degraded: string; partial: string; major: string; maintenance: string };
    /** 部分ごと・日ごとの状態の語。none は記録の無い日。 */
    statuses: { operational: string; degraded: string; partial: string; major: string; maintenance: string; none: string };
    /** 最終更新（「最終更新 10月26日 12:00」）。 */
    updated: (time: string) => string;
    components: string;
    /** 稼働率（「稼働率 99.98%」）。 */
    uptime: (percent: string) => string;
    /** 稼働の帯の名前（「API の過去 90 日」）。 */
    uptimeOf: (name: string, days: number) => string;
    /** 帯の説明（「90 日のうち、問題があった日は 2 日」）。 */
    issueDays: (count: number, days: number) => string;
    /** 日の升の読み上げ（「10月3日(土) 一部の障害。API の遅延 2 時間 15 分」）。 */
    day: (date: string, status: string, note?: string) => string;
    /** 帯の左端の目盛り（「90 日前」）。 */
    daysAgo: (days: number) => string;
    active: string;
    history: string;
    noIncidents: string;
    /** 障害の対応の段階。 */
    stages: { investigating: string; identified: string; monitoring: string; resolved: string };
    affected: string;
    subscribe: string;
    subscribeDescription: string;
    subscribeSubmit: string;
    /** 登録の確認のメールを送ったとき。 */
    subscribed: (email: string) => string;
  };
  /** 検索結果（SearchPage）。P-40。送るボタンは common.search。 */
  searchResults: {
    title: string;
    /** 探す欄の目印（role="search"）の名前。 */
    label: string;
    input: string;
    results: string;
    /** 件数（「「請求書」の検索結果 12 件」）。query が空なら件数だけ。 */
    count: (count: number, query: string) => string;
    filters: string;
    /** 狭い器の絞り込みのボタン（「絞り込み（2）」）。count は選んでいる数。 */
    filtersCount: (count: number) => string;
    /** 絞り込みの面を閉じるボタン（「12 件の結果を見る」）。 */
    showResults: (count: number) => string;
    clearFilters: string;
    emptyTitle: string;
    emptyDescription: string;
    /** 当てはまらないとき。query が空なら絞り込みに当てはまらない文。 */
    noResultsTitle: (query: string) => string;
    noResultsDescription: string;
  };
}

/** 文言のまとまりの名前（locale のほかのキー）。 */
export type TemplateLabelGroup = Exclude<keyof TemplateLabels, 'locale'>;

/**
 * 1 つのまとまりの、日本語と英語の既定。まとまりごとに別の値にしておき、テンプレートは使うまとまりだけを読む
 * （useTemplateLabels）。使わないテンプレートの文言は、束ねる道具が落とす。
 */
export interface TemplateLabelPair<K extends TemplateLabelGroup> {
  readonly ja: TemplateLabels[K];
  readonly en: TemplateLabels[K];
}

/** 「A と B に同意します」のような、リンクを挟む文を組み立てる。 */
const join = (...parts: ReactNode[]): ReactNode => createElement(Fragment, null, ...parts);

export const commonLabels: TemplateLabelPair<'common'> = {
  ja: {
    skipToContent: '本文へ移動',
    home: 'ホームへ戻る',
    back: '前のページへ戻る',
    retry: 'もう一度試す',
    contactSupport: 'サポートに問い合わせる',
    statusPage: '稼働状況を見る',
    billing: '請求の設定を開く',
    signIn: 'ログイン',
    signUp: 'アカウントを作る',
    backToSignIn: 'ログインに戻る',
    terms: '利用規約',
    privacy: 'プライバシーポリシー',
    help: 'ヘルプ',
    or: 'または',
    continueWith: (provider) => `${provider}で続ける`,
    email: 'メールアドレス',
    password: 'パスワード',
    newPassword: '新しいパスワード',
    confirmPassword: '新しいパスワード（確認）',
    name: 'お名前',
    errorSummary: '入力内容を確認してください',
    requiredField: (field) => `${field}を入力してください`,
    invalidEmail: 'メールアドレスの形で入力してください（例: name@example.com）',
    passwordTooShort: (min) => `${String(min)} 文字以上で入力してください`,
    confirmRequired: '確かめるため、もう一度入力してください',
    passwordMismatch: 'パスワードが一致しません',
    submitFailed: '送信できませんでした。時間をおいて、もう一度お試しください。',
    resend: 'もう一度送る',
    resendIn: (seconds) => `${String(seconds)} 秒後に、もう一度送れます`,
    resent: '送り直しました',
    reference: '問い合わせ番号',
    copyReference: '問い合わせ番号をコピー',
    search: '検索',
  },
  en: {
    skipToContent: 'Skip to content',
    home: 'Back to home',
    back: 'Go back',
    retry: 'Try again',
    contactSupport: 'Contact support',
    statusPage: 'Check system status',
    billing: 'Open billing settings',
    signIn: 'Sign in',
    signUp: 'Create an account',
    backToSignIn: 'Back to sign in',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    help: 'Help',
    or: 'or',
    continueWith: (provider) => `Continue with ${provider}`,
    email: 'Email',
    password: 'Password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    name: 'Name',
    errorSummary: 'Check the following',
    requiredField: (field) => `Enter your ${field.toLowerCase()}`,
    invalidEmail: 'Enter an email address like name@example.com',
    passwordTooShort: (min) => `Use at least ${String(min)} characters`,
    confirmRequired: 'Enter the new password again',
    passwordMismatch: 'The passwords do not match',
    submitFailed: 'We could not send this. Try again in a moment.',
    resend: 'Send again',
    resendIn: (seconds) => `You can send again in ${String(seconds)} s`,
    resent: 'Sent again',
    reference: 'Reference',
    copyReference: 'Copy reference',
    search: 'Search',
  },
};

export const signInLabels: TemplateLabelPair<'signIn'> = {
  ja: {
    title: 'ログイン',
    description: 'メールアドレスとパスワードでログインします。',
    remember: 'ログインしたままにする',
    forgot: 'パスワードを忘れた場合',
    submit: 'ログイン',
    failed: 'メールアドレスかパスワードが違います。',
    noAccount: 'アカウントをお持ちでない方は',
  },
  en: {
    title: 'Sign in',
    description: 'Sign in with your email and password.',
    remember: 'Keep me signed in',
    forgot: 'Forgot your password?',
    submit: 'Sign in',
    failed: 'The email or password is incorrect.',
    noAccount: 'Don’t have an account?',
  },
};

export const signUpLabels: TemplateLabelPair<'signUp'> = {
  ja: {
    title: 'アカウントを作る',
    description: 'メールアドレスで登録します。',
    agree: (terms, privacy) => join(terms, 'と', privacy, 'に同意します'),
    agreeRequired: '登録するには、利用規約とプライバシーポリシーへの同意が必要です',
    submit: 'アカウントを作る',
    hasAccount: 'すでにアカウントをお持ちの方は',
  },
  en: {
    title: 'Create an account',
    description: 'Sign up with your email address.',
    agree: (terms, privacy) => join('I agree to the ', terms, ' and the ', privacy),
    agreeRequired: 'To sign up, agree to the Terms of Service and the Privacy Policy',
    submit: 'Create account',
    hasAccount: 'Already have an account?',
  },
};

export const forgotPasswordLabels: TemplateLabelPair<'forgotPassword'> = {
  ja: {
    title: 'パスワードの再設定',
    description: '登録したメールアドレスを入力してください。再設定の手順をお送りします。',
    submit: '再設定のメールを送る',
    sentTitle: 'メールを確認してください',
    sentDescription: (email) =>
      `${email} が登録されていれば、再設定の手順を送りました。数分たっても届かないときは、迷惑メールのフォルダもご確認ください。`,
  },
  en: {
    title: 'Reset your password',
    description: 'Enter the email address you signed up with, and we will send you instructions.',
    submit: 'Send reset email',
    sentTitle: 'Check your email',
    sentDescription: (email) =>
      `If ${email} has an account, we have sent instructions to reset the password. If nothing arrives in a few minutes, check your spam folder.`,
  },
};

export const resetPasswordLabels: TemplateLabelPair<'resetPassword'> = {
  ja: {
    title: '新しいパスワードを決める',
    description: 'これまでと違うパスワードにしてください。',
    submit: 'パスワードを変える',
    doneTitle: 'パスワードを変えました',
    doneDescription: '新しいパスワードでログインしてください。',
    expiredTitle: 'リンクの有効期限が切れています',
    expiredDescription: '再設定のリンクは、一定の時間がたつと使えなくなります。もう一度メールを送ってください。',
    requestAgain: 'もう一度メールを送る',
  },
  en: {
    title: 'Choose a new password',
    description: 'Use a password you have not used before.',
    submit: 'Change password',
    doneTitle: 'Your password has been changed',
    doneDescription: 'Sign in with your new password.',
    expiredTitle: 'This link has expired',
    expiredDescription: 'Reset links stop working after a while. Request a new email.',
    requestAgain: 'Send a new email',
  },
};

export const twoFactorLabels: TemplateLabelPair<'twoFactor'> = {
  ja: {
    title: '2 段階認証',
    app: (length) => `認証アプリに表示されている ${String(length)} 桁のコードを入力してください。`,
    sms: (destination, length) => `${destination} に送った ${String(length)} 桁のコードを入力してください。`,
    email: (destination, length) => `${destination} に送った ${String(length)} 桁のコードを入力してください。`,
    code: '確認コード',
    trust: (days) => `このデバイスを ${String(days)} 日間信頼する`,
    submit: '確認する',
    failed: 'コードが違います。もう一度入力してください。',
    other: '別の方法で確認する',
  },
  en: {
    title: 'Two-step verification',
    app: (length) => `Enter the ${String(length)}-digit code shown in your authenticator app.`,
    sms: (destination, length) => `Enter the ${String(length)}-digit code we sent to ${destination}.`,
    email: (destination, length) => `Enter the ${String(length)}-digit code we sent to ${destination}.`,
    code: 'Verification code',
    trust: (days) => `Trust this device for ${String(days)} days`,
    submit: 'Verify',
    failed: 'That code is incorrect. Enter it again.',
    other: 'Use another method',
  },
};

export const verifyEmailLabels: TemplateLabelPair<'verifyEmail'> = {
  ja: {
    title: 'メールアドレスを確認してください',
    description: (email) => `${email} に確認のメールを送りました。メールのリンクを開くと、登録が終わります。`,
    change: 'メールアドレスを変える',
    verifiedTitle: 'メールアドレスを確認できました',
    verifiedDescription: 'ご登録ありがとうございます。さっそく始めましょう。',
    continue: '続ける',
    expiredTitle: '確認のリンクの有効期限が切れています',
    expiredDescription: '確認のリンクは、一定の時間がたつと使えなくなります。もう一度メールを送ってください。',
  },
  en: {
    title: 'Verify your email',
    description: (email) => `We sent a verification email to ${email}. Open the link in it to finish signing up.`,
    change: 'Change email address',
    verifiedTitle: 'Your email is verified',
    verifiedDescription: 'Thanks for signing up. Let’s get started.',
    continue: 'Continue',
    expiredTitle: 'This verification link has expired',
    expiredDescription: 'Verification links stop working after a while. Request a new email.',
  },
};

export const signOutLabels: TemplateLabelPair<'signOut'> = {
  ja: {
    confirmTitle: 'ログアウトしますか',
    confirmDescription: 'この端末からログアウトします。保存していない変更は失われます。',
    confirm: 'ログアウト',
    cancel: 'キャンセル',
    doneTitle: 'ログアウトしました',
    doneDescription: 'ご利用ありがとうございました。',
    signInAgain: 'もう一度ログインする',
  },
  en: {
    confirmTitle: 'Sign out?',
    confirmDescription: 'You will be signed out on this device. Unsaved changes will be lost.',
    confirm: 'Sign out',
    cancel: 'Cancel',
    doneTitle: 'You have signed out',
    doneDescription: 'Thanks for using the service.',
    signInAgain: 'Sign in again',
  },
};

export const emailFirstLabels: TemplateLabelPair<'emailFirst'> = {
  ja: {
    title: 'ログインまたは登録',
    description: 'メールアドレスを入力してください。アカウントが無ければ、そのまま作れます。',
    continue: '続ける',
    changeEmail: 'メールアドレスを変える',
    passwordDescription: (email) => `${email} でログインします。`,
    newAccountDescription: (email) => `${email} のアカウントはまだありません。このまま新しく作ります。`,
    ssoTitle: '組織のアカウントでログイン',
    ssoDescription: (provider) => `このメールアドレスは ${provider} でログインします。`,
  },
  en: {
    title: 'Sign in or sign up',
    description: 'Enter your email address. If you don’t have an account yet, you can create one right away.',
    continue: 'Continue',
    changeEmail: 'Use a different email',
    passwordDescription: (email) => `Signing in as ${email}.`,
    newAccountDescription: (email) => `There is no account for ${email} yet. Let’s create one.`,
    ssoTitle: 'Sign in with your organization',
    ssoDescription: (provider) => `This email address signs in with ${provider}.`,
  },
};

export const magicLinkLabels: TemplateLabelPair<'magicLink'> = {
  ja: {
    title: 'メールでログイン',
    description: 'ログイン用のリンクと確認コードをメールで送ります。パスワードは要りません。',
    submit: 'ログイン用のメールを送る',
    sentTitle: 'メールを確認してください',
    sentDescription: (email) => `${email} にログイン用のリンクと確認コードを送りました。リンクを開くか、コードを入力してください。`,
    code: '確認コード',
    codeSubmit: 'ログイン',
    failed: 'コードが違うか、有効期限が切れています。',
    useAnotherEmail: '別のメールアドレスを使う',
    usePassword: 'パスワードでログイン',
  },
  en: {
    title: 'Sign in with email',
    description: 'We’ll email you a sign-in link and a code. No password needed.',
    submit: 'Email me a sign-in link',
    sentTitle: 'Check your email',
    sentDescription: (email) => `We sent a sign-in link and a code to ${email}. Open the link, or enter the code.`,
    code: 'Code',
    codeSubmit: 'Sign in',
    failed: 'That code is incorrect or has expired.',
    useAnotherEmail: 'Use a different email',
    usePassword: 'Sign in with a password',
  },
};

export const notReceivedLabels: TemplateLabelPair<'notReceived'> = {
  ja: {
    title: 'メールが届かないとき',
    spam: '迷惑メールのフォルダに入っていないか確かめてください。',
    wait: '届くまで数分かかることがあります。',
    typo: 'メールアドレスに打ち間違いがないか確かめてください。',
    carrier: (sender) => `携帯会社のメールは、「${sender}」からのメールを受け取れるように設定してください。`,
  },
  en: {
    title: 'Didn’t get the email?',
    spam: 'Check your spam or junk folder.',
    wait: 'It can take a few minutes to arrive.',
    typo: 'Make sure the email address is spelled correctly.',
    carrier: (sender) => `If you use a mobile carrier address, allow email from ${sender}.`,
  },
};

export const quickSignUpLabels: TemplateLabelPair<'quickSignUp'> = {
  ja: {
    title: 'メールアドレスで登録',
    description: 'まずはメールアドレスだけで登録できます。お名前などは、届いたメールのリンクから入力します。',
    submit: '登録する',
    sentTitle: '仮登録が完了しました',
    sentDescription: (email) => `${email} に本登録のご案内を送りました。メールのリンクから、残りの項目を入力してください。`,
    expires: (period) => `リンクの有効期限は ${period} です。`,
    nextSteps: 'このあとの流れ',
  },
  en: {
    title: 'Sign up with your email',
    description: 'Start with just your email address. You’ll add your name and other details from the link we send you.',
    submit: 'Sign up',
    sentTitle: 'Almost there',
    sentDescription: (email) => `We sent the next steps to ${email}. Open the link in the email to finish your registration.`,
    expires: (period) => `The link expires in ${period}.`,
    nextSteps: 'What happens next',
  },
};

export const wizardLabels: TemplateLabelPair<'wizard'> = {
  ja: {
    progress: '登録の手順',
    back: '戻る',
    next: '次へ',
    skip: 'あとで入力する',
    saveAndExit: '保存してあとで続ける',
    saved: '入力した内容を保存しました。',
    reviewTitle: '入力内容の確認',
    reviewDescription: '内容を確かめてから登録してください。',
    edit: (step) => `${step}を修正する`,
    backToReview: '確認に戻る',
    submit: '登録する',
    doneTitle: '登録が完了しました',
    doneDescription: 'ご登録ありがとうございます。',
  },
  en: {
    progress: 'Registration steps',
    back: 'Back',
    next: 'Next',
    skip: 'Do this later',
    saveAndExit: 'Save and continue later',
    saved: 'Your progress has been saved.',
    reviewTitle: 'Review your details',
    reviewDescription: 'Check your details before you register.',
    edit: (step) => `Edit ${step}`,
    backToReview: 'Back to review',
    submit: 'Register',
    doneTitle: 'Registration complete',
    doneDescription: 'Thanks for registering.',
  },
};

export const phoneSignInLabels: TemplateLabelPair<'phoneSignIn'> = {
  ja: {
    title: '電話番号でログイン',
    description: 'SMS で確認コードを送ります。',
    phone: '携帯電話の番号',
    phoneHelp: 'ハイフンは無くても大丈夫です。',
    notMobile: 'SMS を受け取れる携帯電話の番号（070・080・090 など）を入力してください',
    invalidPhone: '電話番号の桁の数を確かめてください',
    submit: '確認コードを送る',
    codeTitle: '確認コードを入力',
    codeDescription: (phone, length) => `${phone} に SMS で送った ${String(length)} 桁のコードを入力してください。`,
    changeNumber: '電話番号を変える',
  },
  en: {
    title: 'Sign in with your phone',
    description: 'We’ll text you a verification code.',
    phone: 'Mobile number',
    phoneHelp: 'Hyphens are optional.',
    notMobile: 'Enter a mobile number that can receive text messages (070, 080, 090 and so on)',
    invalidPhone: 'Check the number of digits',
    submit: 'Send code',
    codeTitle: 'Enter the code',
    codeDescription: (phone, length) => `Enter the ${String(length)}-digit code we texted to ${phone}.`,
    changeNumber: 'Use a different number',
  },
};

export const passkeyLabels: TemplateLabelPair<'passkey'> = {
  ja: {
    signIn: 'パスキーでログイン',
    promptTitle: 'パスキーを作りませんか',
    promptDescription: '次回から、パスワードの代わりに指紋・顔・画面のロックでログインできます。',
    benefits: [
      'パスワードを覚えたり打ったりしなくてよい',
      'にせのサイトでは使えないので、だまされにくい',
      '同じアカウントで同期しているほかの端末でも使える',
    ],
    create: 'パスキーを作る',
    later: 'あとで',
    createdTitle: 'パスキーを作りました',
    createdDescription: '次回から、パスキーでログインできます。',
    failed: 'パスキーを作れませんでした。もう一度試すか、あとで設定から作ってください。',
  },
  en: {
    signIn: 'Sign in with a passkey',
    promptTitle: 'Create a passkey?',
    promptDescription: 'Next time, sign in with your fingerprint, face or screen lock instead of a password.',
    benefits: [
      'No password to remember or type',
      'Harder to phish: passkeys don’t work on fake sites',
      'Works on your other devices that sync with the same account',
    ],
    create: 'Create a passkey',
    later: 'Not now',
    createdTitle: 'Passkey created',
    createdDescription: 'Next time, you can sign in with your passkey.',
    failed: 'We couldn’t create a passkey. Try again, or create one later in settings.',
  },
};

export const accountChooserLabels: TemplateLabelPair<'accountChooser'> = {
  ja: {
    title: 'アカウントを選ぶ',
    description: 'この端末でログインしたことのあるアカウントです。',
    list: 'アカウント',
    useAnother: '別のアカウントを使う',
    remove: (account) => `${account} をこの端末から外す`,
    removed: (account) => `${account} をこの端末から外しました。`,
  },
  en: {
    title: 'Choose an account',
    description: 'Accounts you’ve signed in with on this device.',
    list: 'Accounts',
    useAnother: 'Use another account',
    remove: (account) => `Remove ${account} from this device`,
    removed: (account) => `Removed ${account} from this device.`,
  },
};

export const reauthLabels: TemplateLabelPair<'reauth'> = {
  ja: {
    confirmTitle: '本人確認',
    confirmDescription: 'セキュリティのため、もう一度パスワードを入力してください。',
    expiredTitle: 'もう一度ログインしてください',
    expiredDescription: 'しばらく操作がなかったため、ログインの期限が切れました。入力中の内容はそのまま残っています。',
    confirm: '確認する',
    failed: 'パスワードが違います。',
    signInAnother: '別のアカウントでログイン',
  },
  en: {
    confirmTitle: 'Confirm it’s you',
    confirmDescription: 'For your security, enter your password again.',
    expiredTitle: 'Sign in again',
    expiredDescription: 'You were signed out after a period of inactivity. What you were working on is still here.',
    confirm: 'Confirm',
    failed: 'That password is incorrect.',
    signInAnother: 'Sign in with a different account',
  },
};

export const guestAccountLabels: TemplateLabelPair<'guestAccount'> = {
  ja: {
    title: 'アカウントを作りませんか',
    description: (email) => `パスワードを決めるだけで、${email} のアカウントを作れます。注文の状況をいつでも確かめられ、次からは入力を省けます。`,
    submit: 'アカウントを作る',
    later: 'いまは作らない',
    doneTitle: 'アカウントを作りました',
    doneDescription: '次回から、このメールアドレスとパスワードでログインできます。',
  },
  en: {
    title: 'Create an account?',
    description: (email) => `Just choose a password to create an account for ${email}. You can check your orders anytime and check out faster next time.`,
    submit: 'Create account',
    later: 'Not now',
    doneTitle: 'Account created',
    doneDescription: 'Next time, sign in with this email address and password.',
  },
};

export const errorLabels: TemplateLabelPair<'error'> = {
  ja: {
    code: 'エラー',
    titles: {
      '400': 'リクエストを処理できませんでした',
      '401': 'ログインが必要です',
      '402': 'お支払いの確認が必要です',
      '403': 'このページを見る権限がありません',
      '404': 'ページが見つかりません',
      '405': 'この操作はここではできません',
      '406': '求められた形式で表示できません',
      '407': 'プロキシへのログインが必要です',
      '408': '応答を待ちきれませんでした',
      '409': 'ほかの変更と重なりました',
      '410': 'このページは削除されました',
      '411': 'リクエストの大きさがわかりませんでした',
      '412': '開いた後に内容が変わりました',
      '413': '送る内容が大きすぎます',
      '414': 'アドレスが長すぎます',
      '415': 'この形式には対応していません',
      '416': '求められた範囲を返せませんでした',
      '417': 'リクエストの条件に応えられませんでした',
      '418': 'わたしはティーポットです',
      '421': 'リクエストが違うサーバーに届きました',
      '422': '入力された内容を処理できませんでした',
      '423': 'ロックされています',
      '424': '前の処理が完了しませんでした',
      '425': '早すぎるリクエストでした',
      '426': '新しい通信方式が必要です',
      '428': '最新の内容の確認が必要です',
      '429': 'リクエストが多すぎます',
      '431': 'ブラウザが送った情報が多すぎます',
      '451': '法的な理由で表示できません',
      '500': '問題が起きました',
      '501': 'この操作には対応していません',
      '502': 'サーバーから正しい応答がありませんでした',
      '503': '一時的に利用できません',
      '504': 'サーバーの応答が時間内に返りませんでした',
      '505': 'この通信方式には対応していません',
      '506': 'サーバーの設定に問題があります',
      '507': 'サーバーの容量が足りません',
      '508': 'サーバーの処理が堂々巡りになりました',
      '510': '必要な拡張がありませんでした',
      '511': 'ネットワークへのログインが必要です',
      offline: 'インターネットに接続されていません',
      '4xx': 'リクエストを完了できませんでした',
      '5xx': '問題が起きました',
    },
    descriptions: {
      '400': '送られた内容に不備がありました。前のページに戻って、もう一度お試しください。',
      '401': 'このページを見るには、ログインしてください。',
      '402': 'このページを使うには、お支払いの手続きが必要です。請求の設定で、プランと支払い方法を確かめてください。',
      '403': '見るには権限が要ります。ワークスペースの管理者に、権限を依頼してください。',
      '404': 'アドレスが間違っているか、ページが移動または削除された可能性があります。',
      '405': 'このページは、この方法での操作を受け付けていません。前のページに戻って、もう一度お試しください。',
      '406': 'お使いのブラウザが求める形式では、このページを表示できません。前のページに戻るか、別のブラウザでお試しください。',
      '407': 'お使いのネットワークのプロキシが、ログインを求めています。プロキシにログインしてから、もう一度お試しください。わからないときは、ネットワークの管理者にお問い合わせください。',
      '408': '通信に時間がかかりすぎました。もう一度お試しください。',
      '409': 'そのあいだに、ほかの人か別の画面が同じ内容を変えました。読み込み直して最新の内容を確かめてから、もう一度お試しください。',
      '410': 'お探しのページは、もうありません。',
      '411': 'アプリかブラウザから送られた内容に、大きさの情報が欠けていました。前のページに戻って、もう一度お試しください。',
      '412': '開いた後に、ほかの変更が入りました。読み込み直して最新の内容を確かめてから、もう一度お試しください。',
      '413': 'ファイルか入力した内容が、受け付けられる大きさを超えています。小さくしてから、もう一度お試しください。',
      '414': 'ページのアドレス（URL）が、受け付けられる長さを超えています。ホームから、もう一度たどってください。',
      '415': '送られたファイルやデータの形式は、ここでは扱えません。対応している形式にしてから、もう一度お試しください。',
      '416': 'ダウンロードの途中で、ファイルが変わったか短くなった可能性があります。最初から、もう一度お試しください。',
      '417': 'リクエストに添えられた条件（Expect）を満たせませんでした。もう一度お試しください。',
      '418': 'ティーポットなので、コーヒーは淹れられません。HTTP の冗談から生まれた状態コードで、いまは使われていません。',
      '421': 'このリクエストに応えられないサーバーに届きました。もう一度お試しください。',
      '422': '形式は正しいものの、内容に処理できないところがありました。前のページに戻って、入力を確かめてください。',
      '423': 'ほかの人が編集しているか、いまは変更できない状態です。少し待ってから、もう一度お試しください。',
      '424': 'この操作が頼っている別の処理が、うまくいきませんでした。もう一度お試しください。',
      '425': '接続の準備が整う前に届いたため、受け付けられませんでした。もう一度お試しください。',
      '426': 'このページには、より新しい通信方式が必要です。ブラウザかアプリを最新にしてから、もう一度お試しください。',
      '428': 'ほかの変更を上書きしないよう、最新の内容を確かめてからの操作を求めています。読み込み直してから、もう一度お試しください。',
      '429': '短い時間に多くの操作がありました。少し待ってから、もう一度お試しください。',
      '431': 'ブラウザが送った情報（Cookie など）が大きすぎます。このサイトの Cookie を削除してから、もう一度お試しください。',
      '451': '法令や裁判所の命令などの理由で、このページは表示できません。',
      '500': 'こちら側で問題が起きています。時間をおいて、もう一度お試しください。続くときは、サポートにお問い合わせください。',
      '501': 'サーバーが、この操作にまだ対応していません。ホームから、別の方法をお試しください。',
      '502': '一時的な問題の可能性があります。少し待ってから、もう一度お試しください。',
      '503': 'アクセスが集中しているか、メンテナンス中です。時間をおいて、もう一度お試しください。',
      '504': '時間をおいて、もう一度お試しください。',
      '505': 'お使いのブラウザかアプリの通信方式（HTTP のバージョン）に、サーバーが対応していません。最新にしてから、もう一度お試しください。',
      '506': '表示する内容を選ぶ設定で、問題が起きています。時間をおいて、もう一度お試しください。',
      '507': 'サーバーの容量が足りず、保存できませんでした。時間をおいて、もう一度お試しください。',
      '508': 'サーバーの中で処理が同じところを回り続けたため、止めました。時間をおいて、もう一度お試しください。',
      '510': 'このリクエストには、サーバーが求める拡張の情報が足りませんでした。前のページに戻って、もう一度お試しください。',
      '511': 'お使いの Wi-Fi などのネットワークが、ログインを求めています。ネットワークのログインの画面で手続きしてから、もう一度お試しください。',
      offline: '接続を確かめてから、もう一度お試しください。',
      '4xx': '前のページに戻って、もう一度お試しください。',
      '5xx': 'こちら側で問題が起きています。時間をおいて、もう一度お試しください。',
    },
    retryIn: (seconds) => `${String(seconds)} 秒後に、もう一度試せます`,
  },
  en: {
    code: 'Error',
    titles: {
      '400': 'We couldn’t process the request',
      '401': 'Sign in to continue',
      '402': 'Payment required',
      '403': 'You don’t have access to this page',
      '404': 'Page not found',
      '405': 'This action isn’t allowed here',
      '406': 'We can’t show this page in that format',
      '407': 'Sign in to your network proxy',
      '408': 'The request timed out',
      '409': 'This clashes with another change',
      '410': 'This page has been removed',
      '411': 'The request size was missing',
      '412': 'This changed after you opened it',
      '413': 'That’s too large to send',
      '414': 'The address is too long',
      '415': 'This format isn’t supported',
      '416': 'We couldn’t send that part of the file',
      '417': 'We couldn’t meet the request’s condition',
      '418': 'I’m a teapot',
      '421': 'The request reached the wrong server',
      '422': 'We couldn’t process what you entered',
      '423': 'This is locked',
      '424': 'An earlier step didn’t complete',
      '425': 'That request came too early',
      '426': 'A newer connection is required',
      '428': 'Reload before you make changes',
      '429': 'Too many requests',
      '431': 'Your browser sent too much information',
      '451': 'Unavailable for legal reasons',
      '500': 'Something went wrong',
      '501': 'This isn’t supported',
      '502': 'The server sent an invalid response',
      '503': 'Temporarily unavailable',
      '504': 'The server took too long to respond',
      '505': 'This HTTP version isn’t supported',
      '506': 'The server is misconfigured',
      '507': 'The server is out of storage',
      '508': 'The server got stuck in a loop',
      '510': 'A required extension was missing',
      '511': 'Sign in to the network',
      offline: 'You’re offline',
      '4xx': 'We couldn’t complete the request',
      '5xx': 'Something went wrong',
    },
    descriptions: {
      '400': 'Something in the request was not right. Go back and try again.',
      '401': 'Sign in to see this page.',
      '402': 'You need to complete payment to use this page. Check your plan and payment method in billing settings.',
      '403': 'You need permission to see this. Ask an admin of your workspace for access.',
      '404': 'The address may be wrong, or the page may have moved or been deleted.',
      '405': 'This page doesn’t accept requests made this way. Go back and try again.',
      '406': 'This page can’t be shown in the format your browser asked for. Go back, or try another browser.',
      '407': 'A proxy on your network is asking you to sign in. Sign in to the proxy, then try again. If you’re not sure how, ask your network administrator.',
      '408': 'The connection took too long. Try again.',
      '409': 'Someone else, or another tab, changed this in the meantime. Reload to see the latest version, then try again.',
      '410': 'The page you are looking for no longer exists.',
      '411': 'The request from your app or browser didn’t say how large it was. Go back and try again.',
      '412': 'Another change came in after you opened this. Reload to see the latest version, then try again.',
      '413': 'The file or text you sent is larger than we can accept. Make it smaller, then try again.',
      '414': 'The page address (URL) is longer than we can accept. Start again from the home page.',
      '415': 'We can’t handle the format of the file or data you sent. Convert it to a supported format, then try again.',
      '416': 'The file may have changed or become shorter during the download. Try again from the start.',
      '417': 'We couldn’t meet a condition attached to the request (Expect). Try again.',
      '418': 'Being a teapot, I can’t brew coffee. This status code came from an HTTP joke and is no longer used.',
      '421': 'This request reached a server that can’t answer it. Try again.',
      '422': 'The format is fine, but something in the content can’t be processed. Go back and check what you entered.',
      '423': 'Someone else is editing it, or it can’t be changed right now. Wait a moment and try again.',
      '424': 'Another step that this action depends on didn’t succeed. Try again.',
      '425': 'It arrived before the connection was ready, so we couldn’t accept it. Try again.',
      '426': 'This page needs a newer way of connecting. Update your browser or app, then try again.',
      '428': 'To avoid overwriting other changes, we need you to work from the latest version. Reload, then try again.',
      '429': 'There were many requests in a short time. Wait a moment and try again.',
      '431': 'The information your browser sent, such as cookies, is too large. Clear the cookies for this site, then try again.',
      '451': 'This page can’t be shown for legal reasons, such as a law or a court order.',
      '500': 'Something went wrong on our side. Try again in a moment. If it keeps happening, contact support.',
      '501': 'The server doesn’t support this action yet. Try another way from the home page.',
      '502': 'This may be temporary. Wait a moment and try again.',
      '503': 'We are busy or under maintenance. Try again in a moment.',
      '504': 'Try again in a moment.',
      '505': 'The server doesn’t support the HTTP version your browser or app used. Update it, then try again.',
      '506': 'There’s a problem with how the server chooses what to show. Try again in a moment.',
      '507': 'The server ran out of space and couldn’t save this. Try again in a moment.',
      '508': 'The server found itself going around in circles and stopped. Try again in a moment.',
      '510': 'The request didn’t include an extension the server requires. Go back and try again.',
      '511': 'The Wi-Fi or other network you’re using needs you to sign in. Finish the network’s sign-in page, then try again.',
      offline: 'Check your connection and try again.',
      '4xx': 'Go back and try again.',
      '5xx': 'Something went wrong on our side. Try again in a moment.',
    },
    retryIn: (seconds) => `You can try again in ${String(seconds)} s`,
  },
};

export const maintenanceLabels: TemplateLabelPair<'maintenance'> = {
  ja: {
    title: 'ただいまメンテナンス中です',
    description: 'サービスをより良くするための作業をしています。ご不便をおかけします。',
    schedule: '予定',
    range: (start, end) => `${start}〜${end}`,
    until: (end) => `${end} に終わる予定です`,
    updates: '最新の情報',
    reload: '再読み込み',
  },
  en: {
    title: 'We’re down for maintenance',
    description: 'We are working to make the service better. Sorry for the inconvenience.',
    schedule: 'Schedule',
    range: (start, end) => `${start} – ${end}`,
    until: (end) => `Expected to finish ${end}`,
    updates: 'Latest updates',
    reload: 'Reload',
  },
};

export const siteLabels: TemplateLabelPair<'site'> = {
  ja: {
    nav: 'サイトの案内',
    menu: 'メニュー',
    footerNav: 'サイトの情報',
  },
  en: {
    nav: 'Main',
    menu: 'Menu',
    footerNav: 'Site information',
  },
};

export const documentLabels: TemplateLabelPair<'document'> = {
  ja: {
    toc: '目次',
    effective: '施行日',
    updated: '最終更新日',
    article: (n) => `第 ${String(n)} 条`,
    backToTop: 'ページの先頭へ',
  },
  en: {
    toc: 'Contents',
    effective: 'Effective',
    updated: 'Last updated',
    article: (n) => `Article ${String(n)}`,
    backToTop: 'Back to top',
  },
};

export const faqLabels: TemplateLabelPair<'faq'> = {
  ja: {
    title: 'よくある質問',
    description: 'お問い合わせの前に、よく寄せられる質問をご確認ください。',
    search: '質問を探す',
    results: (count) => `${String(count)} 件の質問が見つかりました`,
    noResults: '当てはまる質問がありませんでした。言葉を変えて探すか、お問い合わせください。',
    stillNeedHelp: '解決しませんでしたか',
    contact: 'お問い合わせ',
    other: 'その他',
  },
  en: {
    title: 'Frequently asked questions',
    description: 'Before contacting us, check the questions we hear most often.',
    search: 'Search questions',
    results: (count) => `${String(count)} ${count === 1 ? 'question' : 'questions'} found`,
    noResults: 'No questions match. Try different words, or contact us.',
    stillNeedHelp: 'Still need help?',
    contact: 'Contact us',
    other: 'Other',
  },
};

export const pricingLabels: TemplateLabelPair<'pricing'> = {
  ja: {
    title: '料金プラン',
    description: 'チームの大きさと使い方に合わせて選べます。いつでも変えられます。',
    billing: 'お支払いの間隔',
    monthly: '月払い',
    yearly: '年払い',
    perMonth: '/ 月',
    billedYearly: (amount) => `年 ${amount} を一括でお支払い`,
    monthlyPrice: (amount) => `月額 ${amount}`,
    contactSales: 'お問い合わせ',
    custom: 'ご相談',
    recommended: 'おすすめ',
    compare: 'プランの比較',
    feature: '機能',
    included: 'あり',
    notIncluded: 'なし',
    faq: '料金についての質問',
  },
  en: {
    title: 'Pricing',
    description: 'Choose the plan that fits your team. You can change it at any time.',
    billing: 'Billing period',
    monthly: 'Monthly',
    yearly: 'Yearly',
    perMonth: '/ month',
    billedYearly: (amount) => `${amount} billed yearly`,
    monthlyPrice: (amount) => `${amount} per month`,
    contactSales: 'Contact sales',
    custom: 'Custom',
    recommended: 'Recommended',
    compare: 'Compare plans',
    feature: 'Feature',
    included: 'Included',
    notIncluded: 'Not included',
    faq: 'Questions about pricing',
  },
};

export const contactLabels: TemplateLabelPair<'contact'> = {
  ja: {
    title: 'お問い合わせ',
    description: '製品・料金・不具合など、お気軽にお問い合わせください。担当者からご連絡します。',
    company: '会社名',
    topic: 'お問い合わせの種類',
    topics: { product: '製品について', billing: '料金・請求について', bug: '不具合の報告', other: 'その他' },
    chooseTopic: '選んでください',
    message: 'お問い合わせの内容',
    agree: (privacy) => join(privacy, 'に同意します'),
    agreeRequired: '送るには、プライバシーポリシーへの同意が必要です',
    submit: '送信する',
    doneTitle: 'お問い合わせを受け付けました',
    doneDescription: (email) => `${email} に受付の控えを送りました。担当者からご連絡します。`,
  },
  en: {
    title: 'Contact us',
    description: 'Questions about the product, pricing or a bug? We will get back to you.',
    company: 'Company',
    topic: 'Topic',
    topics: { product: 'About the product', billing: 'Pricing and billing', bug: 'Report a bug', other: 'Other' },
    chooseTopic: 'Choose a topic',
    message: 'Message',
    agree: (privacy) => join('I agree to the ', privacy),
    agreeRequired: 'To send, agree to the Privacy Policy',
    submit: 'Send',
    doneTitle: 'We have received your message',
    doneDescription: (email) => `We sent a confirmation to ${email}. We will get back to you soon.`,
  },
};

export const changelogLabels: TemplateLabelPair<'changelog'> = {
  ja: {
    title: '更新履歴',
    description: '新しい機能・改善・修正のお知らせです。',
    filter: '種類で絞り込む',
    all: 'すべて',
    tags: { new: '新機能', improved: '改善', fixed: '修正', security: 'セキュリティ', breaking: '重要な変更' },
    subscribe: 'RSS で購読する',
  },
  en: {
    title: 'Changelog',
    description: 'New features, improvements and fixes.',
    filter: 'Filter by type',
    all: 'All',
    tags: { new: 'New', improved: 'Improved', fixed: 'Fixed', security: 'Security', breaking: 'Breaking' },
    subscribe: 'Subscribe via RSS',
  },
};

export const appLabels: TemplateLabelPair<'app'> = {
  ja: {
    nav: 'アプリの案内',
    menu: 'メニュー',
    account: (name) => `${name}のアカウント`,
  },
  en: {
    nav: 'App navigation',
    menu: 'Menu',
    account: (name) => `${name}, account`,
  },
};

export const settingsLabels: TemplateLabelPair<'settings'> = {
  ja: {
    title: '設定',
    description: 'プロフィール・パスワード・ログインの守り・ログインしている端末を管理します。',
    save: '保存する',
    saved: '保存しました',
    profile: { title: 'プロフィール', description: '名前とメールアドレスは、ワークスペースのメンバーに表示されます。' },
    password: {
      title: 'パスワード',
      description: 'ほかのサービスと同じパスワードは使わないでください。',
      current: '今のパスワード',
      submit: 'パスワードを変える',
      changed: 'パスワードを変えました',
    },
    twoFactor: {
      title: '2 段階認証',
      description: 'ログインのときに、パスワードに加えて確認コードを求めます。',
      on: '有効',
      off: '無効',
      enable: '有効にする',
      disable: '無効にする',
      disableTitle: '2 段階認証を無効にしますか',
      disableDescription: '無効にすると、パスワードだけでログインできるようになります。',
      disabled: '2 段階認証を無効にしました',
    },
    sessions: {
      title: 'ログインしている端末',
      description: '心当たりのない端末があれば、ログアウトさせてください。',
      current: 'この端末',
      lastActive: (time) => `最後の利用 ${time}`,
      revoke: 'ログアウトさせる',
      revokeFor: (device) => `${device} をログアウトさせる`,
      revokeOthers: 'ほかの端末をすべてログアウトさせる',
      revoked: 'ログアウトさせました',
    },
    deleteAccount: {
      title: 'アカウントの削除',
      description: 'アカウントと、作ったデータをすべて削除します。取り消せません。',
      open: 'アカウントを削除する',
      confirmTitle: 'アカウントを削除しますか',
      confirmDescription: 'プロフィール・設定・作ったデータがすべて消え、もとに戻せません。',
      typeToConfirm: (text) => `確認のため「${text}」と入力してください`,
      mismatch: (text) => `「${text}」と入力すると削除できます`,
      confirm: '削除する',
    },
  },
  en: {
    title: 'Settings',
    description: 'Manage your profile, password, sign-in security and signed-in devices.',
    save: 'Save',
    saved: 'Saved',
    profile: { title: 'Profile', description: 'Your name and email address are visible to members of your workspace.' },
    password: {
      title: 'Password',
      description: 'Do not reuse a password from another service.',
      current: 'Current password',
      submit: 'Change password',
      changed: 'Password changed',
    },
    twoFactor: {
      title: 'Two-factor authentication',
      description: 'Ask for a verification code in addition to your password when you sign in.',
      on: 'On',
      off: 'Off',
      enable: 'Turn on',
      disable: 'Turn off',
      disableTitle: 'Turn off two-factor authentication?',
      disableDescription: 'Anyone with your password will be able to sign in.',
      disabled: 'Two-factor authentication is off',
    },
    sessions: {
      title: 'Signed-in devices',
      description: 'If you do not recognize a device, sign it out.',
      current: 'This device',
      lastActive: (time) => `Last active ${time}`,
      revoke: 'Sign out',
      revokeFor: (device) => `Sign out ${device}`,
      revokeOthers: 'Sign out all other devices',
      revoked: 'Signed out',
    },
    deleteAccount: {
      title: 'Delete account',
      description: 'Delete your account and everything you created. This cannot be undone.',
      open: 'Delete account',
      confirmTitle: 'Delete your account?',
      confirmDescription: 'Your profile, settings and everything you created will be gone for good.',
      typeToConfirm: (text) => `To confirm, type “${text}”`,
      mismatch: (text) => `Type “${text}” to delete`,
      confirm: 'Delete',
    },
  },
};

export const membersLabels: TemplateLabelPair<'members'> = {
  ja: {
    title: 'メンバー',
    description: 'ワークスペースに参加している人と、招待中の人。',
    invite: 'メンバーを招待',
    inviteDescription: 'メールアドレスを入れると、招待のメールを送ります。',
    emails: 'メールアドレス',
    emailsHelp: 'Enter かカンマで区切ると、何人でもまとめて招待できます。',
    emailsRequired: '招待する人のメールアドレスを入れてください',
    role: '役割',
    message: 'メッセージ',
    send: '招待を送る',
    sent: (count) => `${String(count)} 人に招待を送りました`,
    search: '名前かメールアドレスで探す',
    name: '名前',
    status: '状態',
    lastActive: '最終ログイン',
    statuses: { active: '有効', invited: '招待中', suspended: '停止中' },
    you: 'あなた',
    roleFor: (name) => `${name} の役割`,
    actionsFor: (name) => `${name} の操作`,
    remove: 'ワークスペースから外す',
    removeTitle: (name) => `${name} を外しますか`,
    removeManyTitle: (count) => `${String(count)} 人を外しますか`,
    removeDescription: '外した人は、このワークスペースのデータを見られなくなります。もう一度招待すれば戻せます。',
    removed: (count) => `${String(count)} 人を外しました`,
    roleChanged: (name, role) => `${name} の役割を「${role}」にしました`,
    seats: '使っている席',
    seatsValue: (used, total) => `${String(used)} / ${String(total)} 席`,
    invitations: '招待中',
    invitedAt: '招待した日',
    resend: '送り直す',
    resendFor: (email) => `${email} に招待を送り直す`,
    resent: (email) => `${email} に招待を送り直しました`,
    revoke: '取り消す',
    revokeFor: (email) => `${email} への招待を取り消す`,
    revoked: (email) => `${email} への招待を取り消しました`,
    noMatch: (query) => `「${query}」に当てはまるメンバーはいません`,
  },
  en: {
    title: 'Members',
    description: 'People in this workspace and people you have invited.',
    invite: 'Invite members',
    inviteDescription: 'We will email an invitation to each address.',
    emails: 'Email addresses',
    emailsHelp: 'Separate addresses with Enter or a comma to invite several people at once.',
    emailsRequired: 'Enter the email addresses of the people to invite',
    role: 'Role',
    message: 'Message',
    send: 'Send invitations',
    sent: (count) => (count === 1 ? 'Invitation sent' : `Invitations sent to ${String(count)} people`),
    search: 'Search by name or email',
    name: 'Name',
    status: 'Status',
    lastActive: 'Last sign-in',
    statuses: { active: 'Active', invited: 'Invited', suspended: 'Suspended' },
    you: 'You',
    roleFor: (name) => `Role of ${name}`,
    actionsFor: (name) => `Actions for ${name}`,
    remove: 'Remove from workspace',
    removeTitle: (name) => `Remove ${name}?`,
    removeManyTitle: (count) => `Remove ${String(count)} people?`,
    removeDescription: 'They will lose access to this workspace. You can invite them again later.',
    removed: (count) => (count === 1 ? 'Removed 1 person' : `Removed ${String(count)} people`),
    roleChanged: (name, role) => `${name} is now ${role}`,
    seats: 'Seats used',
    seatsValue: (used, total) => `${String(used)} of ${String(total)} seats`,
    invitations: 'Pending invitations',
    invitedAt: 'Invited',
    resend: 'Resend',
    resendFor: (email) => `Resend the invitation to ${email}`,
    resent: (email) => `Invitation resent to ${email}`,
    revoke: 'Revoke',
    revokeFor: (email) => `Revoke the invitation to ${email}`,
    revoked: (email) => `Invitation to ${email} revoked`,
    noMatch: (query) => `No members match “${query}”`,
  },
};

export const billingLabels: TemplateLabelPair<'billing'> = {
  ja: {
    title: '料金と請求',
    description: 'プラン・使っている量・支払い方法・請求書。',
    plan: '今のプラン',
    statuses: { active: '有効', trialing: '試用中', past_due: '支払いの失敗', canceled: '解約済み' },
    price: (amount, interval) => `${interval === 'month' ? '月額' : '年額'} ${amount}`,
    renews: (date) => `${date} に自動で更新します`,
    trialEnds: (date) => `${date} に試用期間が終わります`,
    endsOn: (date) => `${date} に終わります`,
    changePlan: 'プランを変える',
    cancel: '解約する',
    cancelTitle: '解約しますか',
    cancelDescription: (date) => `${date} までは今のプランのまま使えます。その後は、有料の機能が使えなくなります。`,
    cancelConfirm: '解約する',
    keep: '解約しない',
    canceled: '解約しました。期間の終わりまで、今のプランのまま使えます。',
    pastDue: '支払いに失敗しました。支払い方法を確かめてください。',
    usage: '使っている量',
    payment: '支払い方法',
    card: (brand, last4) => `${brand}、末尾 ${last4}`,
    expires: (month, year) => `有効期限 ${month}/${year}`,
    updatePayment: '支払い方法を変える',
    addPayment: '支払い方法を登録する',
    noPayment: '支払い方法が登録されていません。',
    billingEmail: '請求書の送り先',
    invoices: '請求書',
    invoiceNumber: '番号',
    invoiceDate: '日付',
    amount: '金額',
    invoiceStatus: '状態',
    invoiceStatuses: { paid: '支払い済み', open: '未払い', void: '無効', uncollectible: '回収できない' },
    download: 'PDF',
    downloadFor: (number) => `${number} の PDF を保存`,
    noInvoices: 'まだ請求書はありません',
  },
  en: {
    title: 'Plan and billing',
    description: 'Your plan, usage, payment method and invoices.',
    plan: 'Current plan',
    statuses: { active: 'Active', trialing: 'Trial', past_due: 'Payment failed', canceled: 'Canceled' },
    price: (amount, interval) => `${amount} per ${interval}`,
    renews: (date) => `Renews on ${date}`,
    trialEnds: (date) => `Trial ends on ${date}`,
    endsOn: (date) => `Ends on ${date}`,
    changePlan: 'Change plan',
    cancel: 'Cancel plan',
    cancelTitle: 'Cancel your plan?',
    cancelDescription: (date) => `You can keep using your current plan until ${date}. After that, paid features will no longer be available.`,
    cancelConfirm: 'Cancel plan',
    keep: 'Keep plan',
    canceled: 'Plan canceled. You can use it until the end of the billing period.',
    pastDue: 'Your last payment failed. Please check your payment method.',
    usage: 'Usage',
    payment: 'Payment method',
    card: (brand, last4) => `${brand} ending in ${last4}`,
    expires: (month, year) => `Expires ${month}/${year}`,
    updatePayment: 'Update payment method',
    addPayment: 'Add payment method',
    noPayment: 'No payment method on file.',
    billingEmail: 'Billing email',
    invoices: 'Invoices',
    invoiceNumber: 'Number',
    invoiceDate: 'Date',
    amount: 'Amount',
    invoiceStatus: 'Status',
    invoiceStatuses: { paid: 'Paid', open: 'Open', void: 'Void', uncollectible: 'Uncollectible' },
    download: 'PDF',
    downloadFor: (number) => `Download ${number} as PDF`,
    noInvoices: 'No invoices yet',
  },
};

export const onboardingLabels: TemplateLabelPair<'onboarding'> = {
  ja: { progress: 'はじめの設定', back: '戻る', next: '次へ', skip: 'あとで設定する', finish: '始める' },
  en: { progress: 'Getting started', back: 'Back', next: 'Next', skip: 'Skip for now', finish: 'Get started' },
};

export const inviteLabels: TemplateLabelPair<'invite'> = {
  ja: {
    title: (workspace) => `${workspace} への招待`,
    description: (inviter, workspace) => `${inviter} さんが、あなたを ${workspace} に招待しています。`,
    role: (role) => `役割: ${role}`,
    accept: '招待を受ける',
    decline: '断る',
    signIn: 'ログインして参加する',
    signUp: 'アカウントを作って参加する',
    signedOutHint: '参加するには、ログインするかアカウントを作ってください。',
    wrongAccount: (email) => `この招待は ${email} 宛てです。宛先のアカウントでログインし直してください。`,
    switchAccount: '別のアカウントでログインする',
    expiredTitle: '招待の期限が切れています',
    expiredDescription: '招待した人に、もう一度送ってもらってください。',
    invalidTitle: 'この招待は使えません',
    invalidDescription: 'リンクが正しいか確かめてください。すでに参加しているなら、ログインしてください。',
    declinedTitle: '招待を断りました',
    declinedDescription: 'あとで参加したくなったら、招待した人に、もう一度送ってもらってください。',
  },
  en: {
    title: (workspace) => `Join ${workspace}`,
    description: (inviter, workspace) => `${inviter} has invited you to join ${workspace}.`,
    role: (role) => `Role: ${role}`,
    accept: 'Accept invitation',
    decline: 'Decline',
    signIn: 'Sign in to join',
    signUp: 'Create an account to join',
    signedOutHint: 'Sign in or create an account to join.',
    wrongAccount: (email) => `This invitation was sent to ${email}. Sign in with that account to accept it.`,
    switchAccount: 'Sign in with another account',
    expiredTitle: 'This invitation has expired',
    expiredDescription: 'Ask the person who invited you to send a new one.',
    invalidTitle: 'This invitation is not valid',
    invalidDescription: 'Check that the link is correct. If you have already joined, sign in.',
    declinedTitle: 'Invitation declined',
    declinedDescription: 'If you change your mind, ask the person who invited you to send a new invitation.',
  },
};

export const chatLabels: TemplateLabelPair<'chat'> = {
  ja: {
    title: 'メッセージ',
    conversations: '会話',
    channels: 'チャンネル',
    directMessages: 'ダイレクトメッセージ',
    search: '会話を探す',
    noMatch: (query) => `「${query}」に当てはまる会話はありません`,
    unread: (count) => `未読 ${count}件`,
    back: '会話の一覧へ戻る',
    none: '会話を選んでください',
    messagesIn: (name) => `${name} のメッセージ`,
    placeholder: (name, kind) => (kind === 'channel' ? `#${name} にメッセージを送信` : `${name}さんにメッセージを送信`),
  },
  en: {
    title: 'Messages',
    conversations: 'Conversations',
    channels: 'Channels',
    directMessages: 'Direct messages',
    search: 'Search conversations',
    noMatch: (query) => `No conversations match “${query}”`,
    unread: (count) => `${count} unread`,
    back: 'Back to conversations',
    none: 'Select a conversation',
    messagesIn: (name) => `Messages in ${name}`,
    placeholder: (name, kind) => (kind === 'channel' ? `Message #${name}` : `Message ${name}`),
  },
};

export const assistantLabels: TemplateLabelPair<'assistant'> = {
  ja: {
    title: 'アシスタント',
    history: '履歴',
    showHistory: '履歴を見る',
    closeHistory: '会話へ戻る',
    newThread: '新しい会話',
    previous7Days: '過去 7 日間',
    older: 'それより前',
    greeting: '何をお手伝いしましょうか？',
    conversation: 'アシスタントとの会話',
    placeholder: 'アシスタントに質問する',
    note: 'AI の回答は間違うことがあります。大事なことは確かめてください。',
  },
  en: {
    title: 'Assistant',
    history: 'History',
    showHistory: 'Show history',
    closeHistory: 'Back to the conversation',
    newThread: 'New chat',
    previous7Days: 'Previous 7 days',
    older: 'Older',
    greeting: 'How can I help?',
    conversation: 'Conversation with the assistant',
    placeholder: 'Ask the assistant',
    note: 'AI answers can be wrong. Check anything important.',
  },
};

export const mailLabels: TemplateLabelPair<'mail'> = {
  ja: {
    title: 'メール',
    folders: 'フォルダ',
    compose: '作成',
    search: 'メールを探す',
    noMatch: (query) => `「${query}」に当てはまるメールはありません`,
    empty: 'このフォルダにメールはありません',
    none: 'メールを選んでください',
    back: 'メールの一覧へ戻る',
    unread: '未読',
    unreadCount: (count) => `未読 ${count}件`,
    attachment: '添付あり',
    selectAll: 'すべて選ぶ',
    select: (subject) => `「${subject}」を選ぶ`,
    selected: (count) => `${count}件を選択中`,
    archive: 'アーカイブ',
    delete: '削除',
    markRead: '既読にする',
    markUnread: '未読にする',
    star: 'スター',
    starFor: (subject) => `「${subject}」にスター`,
    reply: '返信',
    forward: '転送',
    archived: (count) => `${count}件をアーカイブしました`,
    deleted: (count) => `${count}件を削除しました`,
    markedRead: (count) => `${count}件を既読にしました`,
    markedUnread: (count) => `${count}件を未読にしました`,
    to: '宛先',
    cc: 'CC',
    attachments: '添付ファイル',
    download: (name) => `${name} をダウンロード`,
    newMessage: '新しいメール',
    subject: '件名',
    body: '本文',
    toHelp: 'Enter かカンマで区切ると、何人でもまとめて入れられます。',
    toRequired: '宛先を入れてください。',
    send: '送信',
    sent: 'メールを送りました',
    replyPrefix: 'Re: ',
    forwardPrefix: 'Fwd: ',
  },
  en: {
    title: 'Mail',
    folders: 'Folders',
    compose: 'Compose',
    search: 'Search mail',
    noMatch: (query) => `No mail matches “${query}”`,
    empty: 'No mail in this folder',
    none: 'Select a message',
    back: 'Back to the message list',
    unread: 'Unread',
    unreadCount: (count) => `${count} unread`,
    attachment: 'Has attachments',
    selectAll: 'Select all',
    select: (subject) => `Select “${subject}”`,
    selected: (count) => `${count} selected`,
    archive: 'Archive',
    delete: 'Delete',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    star: 'Star',
    starFor: (subject) => `Star “${subject}”`,
    reply: 'Reply',
    forward: 'Forward',
    archived: (count) => (count === 1 ? 'Archived 1 message' : `Archived ${count} messages`),
    deleted: (count) => (count === 1 ? 'Deleted 1 message' : `Deleted ${count} messages`),
    markedRead: (count) => (count === 1 ? 'Marked 1 message as read' : `Marked ${count} messages as read`),
    markedUnread: (count) => (count === 1 ? 'Marked 1 message as unread' : `Marked ${count} messages as unread`),
    to: 'To',
    cc: 'Cc',
    attachments: 'Attachments',
    download: (name) => `Download ${name}`,
    newMessage: 'New message',
    subject: 'Subject',
    body: 'Message',
    toHelp: 'Separate addresses with Enter or a comma to add several at once.',
    toRequired: 'Enter at least one recipient.',
    send: 'Send',
    sent: 'Message sent',
    replyPrefix: 'Re: ',
    forwardPrefix: 'Fwd: ',
  },
};

export const orderReviewLabels: TemplateLabelPair<'orderReview'> = {
  ja: {
    title: 'ご注文内容の確認',
    description: 'まだ注文は確定していません。内容を確かめて「注文を確定する」を押してください。',
    items: 'ご注文の商品',
    product: '商品',
    quantity: '数量',
    quantityOf: (count, unit) => (unit ? `${String(count)} ${unit}` : String(count)),
    unit: '点',
    unitPrice: (price) => `単価 ${price}`,
    lineTotal: '金額（税込）',
    address: 'お届け先',
    delivery: 'お届けの方法と時期',
    payment: 'お支払いの方法と時期',
    method: '方法',
    timing: '時期',
    offerPeriod: 'お申し込みの期間',
    subscription: '定期購入の条件',
    interval: 'お届けの間隔',
    pricePerDelivery: '各回の代金（税込）',
    minimumCount: 'お約束の回数',
    minimumCountOf: (count) => `${String(count)} 回以上`,
    noMinimum: 'なし（いつでも解約できます）',
    howToCancel: '解約の方法',
    cancellation: '返品・キャンセル',
    summary: 'お支払い金額',
    subtotal: '小計',
    shipping: '送料',
    free: '無料',
    total: '合計（税込）',
    edit: '変更',
    editFor: (section) => `${section}を変更`,
    submit: '注文を確定する',
    submitNote: '「注文を確定する」を押すと、注文が確定します。',
    consentRequired: '注文の前に、同意の欄にチェックを入れてください',
  },
  en: {
    title: 'Review your order',
    description: 'Your order is not placed yet. Check the details, then select “Place order”.',
    items: 'Items',
    product: 'Item',
    quantity: 'Quantity',
    quantityOf: (count, unit) => (unit ? `${String(count)} ${unit}` : String(count)),
    unit: '',
    unitPrice: (price) => `${price} each`,
    lineTotal: 'Amount (incl. tax)',
    address: 'Delivery address',
    delivery: 'Delivery method and timing',
    payment: 'Payment method and timing',
    method: 'Method',
    timing: 'Timing',
    offerPeriod: 'Offer period',
    subscription: 'Subscription terms',
    interval: 'Delivery interval',
    pricePerDelivery: 'Price per delivery (incl. tax)',
    minimumCount: 'Minimum number of deliveries',
    minimumCountOf: (count) => (count === 1 ? '1 delivery' : `${String(count)} deliveries`),
    noMinimum: 'None (cancel any time)',
    howToCancel: 'How to cancel',
    cancellation: 'Returns and cancellations',
    summary: 'Order total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total (incl. tax)',
    edit: 'Change',
    editFor: (section) => `Change ${section.toLowerCase()}`,
    submit: 'Place order',
    submitNote: 'Selecting “Place order” places your order.',
    consentRequired: 'Check the box to agree before placing your order',
  },
};

export const cookieConsentLabels: TemplateLabelPair<'cookieConsent'> = {
  ja: {
    title: 'Cookie と外部への送信',
    description: 'サイトの改善と広告のために、閲覧の情報を外部の事業者へ送ることがあります。必要なものだけにすることもできます。',
    policy: '送信先の一覧',
    acceptAll: 'すべて許可する',
    rejectAll: '必要なものだけ',
    customize: '設定を選ぶ',
    settingsTitle: 'Cookie と外部送信の設定',
    settingsDescription: '種類ごとに、許可するかを選べます。あとからいつでも変えられます。',
    save: '選んだ設定を保存',
    alwaysOn: '常に有効',
    categories: { necessary: '必要なもの', functional: '機能', analytics: '分析', marketing: '広告' },
    descriptions: {
      necessary: 'ログインの状態や、この設定を覚えておくために使います。止めるとサイトが動かないため、常に有効です。',
      functional: '言語や表示の好みを覚えて、次に来たときに使います。',
      analytics: 'どのページがよく見られているかを集計して、サイトの改善に使います。',
      marketing: 'ほかのサイトでの広告を、関心に合わせて出すために使います。',
    },
  },
  en: {
    title: 'Cookies and data sent to third parties',
    description: 'To improve the site and show ads, we may send information about your visit to other companies. You can allow only what is necessary.',
    policy: 'List of recipients',
    acceptAll: 'Allow all',
    rejectAll: 'Necessary only',
    customize: 'Choose settings',
    settingsTitle: 'Cookie and data-sharing settings',
    settingsDescription: 'Choose which kinds to allow. You can change this at any time.',
    save: 'Save my choices',
    alwaysOn: 'Always on',
    categories: { necessary: 'Necessary', functional: 'Functional', analytics: 'Analytics', marketing: 'Advertising' },
    descriptions: {
      necessary: 'Keeps you signed in and remembers these settings. The site does not work without them, so they are always on.',
      functional: 'Remembers your language and display preferences for your next visit.',
      analytics: 'Counts which pages are viewed most, to improve the site.',
      marketing: 'Shows ads on other sites based on your interests.',
    },
  },
};

export const externalTransmissionLabels: TemplateLabelPair<'externalTransmission'> = {
  ja: {
    label: '外部へ送る情報と送信先',
    information: '送る情報',
    purpose: '使う目的',
    category: '種類',
    policyFor: (recipient) => `${recipient} のプライバシーポリシー`,
    optOutFor: (recipient) => `${recipient} への送信を止める`,
  },
  en: {
    label: 'Information sent to third parties',
    information: 'Information sent',
    purpose: 'Purpose',
    category: 'Kind',
    policyFor: (recipient) => `${recipient} privacy policy`,
    optOutFor: (recipient) => `Stop sending to ${recipient}`,
  },
};

export const cancelSubscriptionLabels: TemplateLabelPair<'cancelSubscription'> = {
  ja: {
    title: '解約の手続き',
    description: (plan) => `${plan} を解約します。最後に確かめてから解約するので、途中でやめられます。`,
    steps: '解約の手順',
    stepReason: '理由',
    stepOffer: 'ご提案',
    stepConfirm: '確認',
    reasonTitle: '解約の理由を教えてください',
    reasonDescription: '答えなくても解約できます。サービスの改善に使います。',
    comment: 'ほかに伝えたいこと',
    next: '次へ',
    back: '戻る',
    offerTitle: '解約の前に、こんな方法もあります',
    offerDescription: '合わなければ、そのまま解約に進めます。',
    continueCancel: '解約に進む',
    confirmTitle: '解約しますか',
    until: (date) => `${date} までは今のプランのまま使えます。`,
    afterEnd: 'その後は、有料の機能が使えなくなります。',
    export: 'データを書き出す',
    confirm: '解約する',
    keep: '解約しない',
    doneTitle: '解約しました',
    doneDescription: (date) => `${date} までは今のプランのまま使えます。確認のメールを送りました。`,
    keptTitle: 'ご提案を受け付けました',
    keptDescription: '解約はしていません。今のプランのまま使えます。',
  },
  en: {
    title: 'Cancel your subscription',
    description: (plan) => `You are canceling ${plan}. You can stop at any point; nothing is canceled until you confirm at the end.`,
    steps: 'Cancellation steps',
    stepReason: 'Reason',
    stepOffer: 'Options',
    stepConfirm: 'Confirm',
    reasonTitle: 'Why are you canceling?',
    reasonDescription: 'Answering is optional. We use it to improve the service.',
    comment: 'Anything else you would like to tell us',
    next: 'Next',
    back: 'Back',
    offerTitle: 'Before you cancel, these might help',
    offerDescription: 'If none of them fit, you can go on to cancel.',
    continueCancel: 'Continue to cancel',
    confirmTitle: 'Cancel your subscription?',
    until: (date) => `You can keep using your current plan until ${date}.`,
    afterEnd: 'After that, paid features will no longer be available.',
    export: 'Export your data',
    confirm: 'Cancel subscription',
    keep: 'Keep subscription',
    doneTitle: 'Your subscription is canceled',
    doneDescription: (date) => `You can keep using your current plan until ${date}. We have sent you a confirmation email.`,
    keptTitle: 'Your choice is saved',
    keptDescription: 'Your subscription has not been canceled. You can keep using your current plan.',
  },
};

export const apiKeysLabels: TemplateLabelPair<'apiKeys'> = {
  ja: {
    title: 'API キー',
    description: 'API を呼ぶためのキーです。使わなくなったキーは無効にしてください。',
    create: 'API キーを作る',
    createDescription: 'キーは作った直後に 1 度だけ表示します。',
    name: '名前',
    nameHelp: '何に使うキーか分かる名前にします（例: 本番のサーバー）。',
    scopes: '権限',
    scopesRequired: '権限を 1 つ以上選んでください',
    expiry: '有効期限',
    days: (count) => `${String(count)} 日`,
    noExpiry: '期限なし',
    submit: '作る',
    createdTitle: 'API キーを作りました',
    secret: '新しい API キー',
    secretWarning: 'このキーは今しか表示できません。閉じる前にコピーして、安全な場所に保存してください。',
    copySecret: 'API キーをコピー',
    done: '完了',
    closeBlocked: 'キーを保存したら「完了」を押してください',
    created: '作った日',
    lastUsed: '最後に使った日時',
    neverUsed: 'まだ使っていません',
    expired: '期限切れ',
    revoke: '無効にする',
    revokeFor: (name) => `${name} を無効にする`,
    revokeTitle: (name) => `${name} を無効にしますか`,
    revokeDescription: 'このキーを使っているアプリやスクリプトは、すぐに API を呼べなくなります。もとに戻せません。',
    revoked: (name) => `${name} を無効にしました`,
    empty: 'まだ API キーはありません',
  },
  en: {
    title: 'API keys',
    description: 'Keys for calling the API. Revoke keys you no longer use.',
    create: 'Create API key',
    createDescription: 'The key is shown once, right after you create it.',
    name: 'Name',
    nameHelp: 'Use a name that says what the key is for (for example, Production server).',
    scopes: 'Permissions',
    scopesRequired: 'Choose at least one permission',
    expiry: 'Expires',
    days: (count) => (count === 1 ? '1 day' : `${String(count)} days`),
    noExpiry: 'Never',
    submit: 'Create',
    createdTitle: 'API key created',
    secret: 'New API key',
    secretWarning: 'This key is shown only now. Copy it and store it somewhere safe before you close this.',
    copySecret: 'Copy API key',
    done: 'Done',
    closeBlocked: 'Save the key, then select “Done”',
    created: 'Created',
    lastUsed: 'Last used',
    neverUsed: 'Never used',
    expired: 'Expired',
    revoke: 'Revoke',
    revokeFor: (name) => `Revoke ${name}`,
    revokeTitle: (name) => `Revoke ${name}?`,
    revokeDescription: 'Apps and scripts that use this key will stop being able to call the API right away. This can’t be undone.',
    revoked: (name) => `${name} was revoked`,
    empty: 'No API keys yet',
  },
};

export const auditLogLabels: TemplateLabelPair<'auditLog'> = {
  ja: {
    title: '監査ログ',
    description: 'ワークスペースで、誰が・いつ・何をしたかの記録です。',
    filters: '記録の絞り込み',
    search: '人・対象・IP アドレスで探す',
    action: '操作',
    allActions: 'すべての操作',
    range: '期間',
    clear: '条件をクリア',
    count: (count) => `${count.toLocaleString('ja-JP')} 件`,
    actor: '操作した人',
    target: '対象',
    source: 'IP アドレスと場所',
    time: (zone) => (zone ? `日時（${zone}）` : '日時'),
    export: 'CSV で書き出す',
    exported: 'CSV の書き出しを始めました',
    empty: 'まだ記録はありません',
    noMatch: '条件に合う記録はありません',
  },
  en: {
    title: 'Audit log',
    description: 'A record of who did what, and when, in this workspace.',
    filters: 'Filter the log',
    search: 'Search by person, target or IP address',
    action: 'Action',
    allActions: 'All actions',
    range: 'Date range',
    clear: 'Clear filters',
    count: (count) => `${count.toLocaleString('en-US')} ${count === 1 ? 'event' : 'events'}`,
    actor: 'Actor',
    target: 'Target',
    source: 'IP address and location',
    time: (zone) => (zone ? `Time (${zone})` : 'Time'),
    export: 'Export CSV',
    exported: 'Started exporting the CSV',
    empty: 'No events yet',
    noMatch: 'No events match these filters',
  },
};

export const notificationSettingsLabels: TemplateLabelPair<'notificationSettings'> = {
  ja: {
    title: '通知',
    description: '知らせの種類ごとに、受け取る方法を選びます。',
    pause: '通知を止める',
    pauseSwitch: 'すべての通知を止める',
    pauseDescription: 'セキュリティと請求の大事な知らせは、止めても届きます。',
    paused: '通知を止めているあいだは、ここでは選べません。',
    topics: '知らせの種類',
    topicsDescription: '受け取りたい方法にチェックを入れてください。',
    topic: '知らせ',
    matrix: '知らせの種類と受け取る方法',
    channels: { email: 'メール', push: 'プッシュ通知', inApp: 'アプリ内' },
    required: '必ず届きます',
    unavailable: 'この方法では届きません',
    quietHours: 'おやすみ時間',
    quietHoursDescription: 'この時間は、プッシュ通知を鳴らしません。',
    quietHoursSwitch: 'おやすみ時間を使う',
    start: '始まり',
    end: '終わり',
    everyDay: (start, end, nextDay) => `毎日 ${start}〜${nextDay ? '翌 ' : ''}${end}`,
    save: '保存する',
    saved: '保存しました',
  },
  en: {
    title: 'Notifications',
    description: 'Choose how you receive each kind of notification.',
    pause: 'Pause notifications',
    pauseSwitch: 'Pause all notifications',
    pauseDescription: 'Important security and billing notices still reach you.',
    paused: 'You can’t change these while notifications are paused.',
    topics: 'Notification types',
    topicsDescription: 'Check the ways you want to be notified.',
    topic: 'Notification',
    matrix: 'Notification types and how you receive them',
    channels: { email: 'Email', push: 'Push', inApp: 'In-app' },
    required: 'Always sent',
    unavailable: 'Not sent this way',
    quietHours: 'Quiet hours',
    quietHoursDescription: 'Push notifications stay silent during these hours.',
    quietHoursSwitch: 'Use quiet hours',
    start: 'Start',
    end: 'End',
    everyDay: (start, end, nextDay) => `Every day, ${start}–${end}${nextDay ? ' the next day' : ''}`,
    save: 'Save',
    saved: 'Saved',
  },
};

export const serviceStatusLabels: TemplateLabelPair<'serviceStatus'> = {
  ja: {
    title: '稼働状況',
    description: 'サービスの今の状態と、障害の記録です。',
    overall: {
      operational: 'すべてのシステムは正常に動いています',
      degraded: '一部のシステムで動作が遅くなっています',
      partial: '一部のシステムで障害が起きています',
      major: '大規模な障害が起きています',
      maintenance: 'メンテナンスをしています',
    },
    statuses: { operational: '正常', degraded: '遅延', partial: '一部の障害', major: '大規模な障害', maintenance: 'メンテナンス', none: '記録なし' },
    updated: (time) => `最終更新 ${time}`,
    components: 'システムの状態',
    uptime: (percent) => `稼働率 ${percent}`,
    uptimeOf: (name, days) => `${name} の過去 ${String(days)} 日`,
    issueDays: (count, days) => (count === 0 ? `${String(days)} 日のあいだ、問題はありませんでした` : `${String(days)} 日のうち、問題があった日は ${String(count)} 日`),
    day: (date, status, note) => (note ? `${date} ${status}。${note}` : `${date} ${status}`),
    daysAgo: (days) => `${String(days)} 日前`,
    active: '対応中の障害',
    history: '過去の障害',
    noIncidents: '障害の記録はありません',
    stages: { investigating: '調査中', identified: '原因を特定', monitoring: '経過を観察中', resolved: '解決済み' },
    affected: '影響を受けた部分',
    subscribe: '更新を受け取る',
    subscribeDescription: '障害が起きたときと解決したときに、メールでお知らせします。',
    subscribeSubmit: '登録する',
    subscribed: (email) => `${email} に確認のメールを送りました。メールのリンクを開くと登録が終わります。`,
  },
  en: {
    title: 'System status',
    description: 'The current state of the service and the record of incidents.',
    overall: {
      operational: 'All systems operational',
      degraded: 'Some systems are running slowly',
      partial: 'Some systems are having an outage',
      major: 'Major outage',
      maintenance: 'Under maintenance',
    },
    statuses: { operational: 'Operational', degraded: 'Degraded', partial: 'Partial outage', major: 'Major outage', maintenance: 'Maintenance', none: 'No data' },
    updated: (time) => `Last updated ${time}`,
    components: 'Systems',
    uptime: (percent) => `${percent} uptime`,
    uptimeOf: (name, days) => `${name}, past ${String(days)} days`,
    issueDays: (count, days) => (count === 0 ? `No issues in the past ${String(days)} days` : `Issues on ${String(count)} of the past ${String(days)} days`),
    day: (date, status, note) => (note ? `${date}: ${status}. ${note}` : `${date}: ${status}`),
    daysAgo: (days) => `${String(days)} days ago`,
    active: 'Ongoing incidents',
    history: 'Past incidents',
    noIncidents: 'No incidents reported',
    stages: { investigating: 'Investigating', identified: 'Identified', monitoring: 'Monitoring', resolved: 'Resolved' },
    affected: 'Affected',
    subscribe: 'Get updates',
    subscribeDescription: 'We’ll email you when an incident starts and when it’s resolved.',
    subscribeSubmit: 'Subscribe',
    subscribed: (email) => `We sent a confirmation email to ${email}. Open the link in it to finish subscribing.`,
  },
};

export const searchResultsLabels: TemplateLabelPair<'searchResults'> = {
  ja: {
    title: '検索',
    label: 'サイト内の検索',
    input: '探す言葉',
    results: '検索結果',
    count: (count, query) => (query ? `「${query}」の検索結果 ${count.toLocaleString('ja-JP')} 件` : `${count.toLocaleString('ja-JP')} 件`),
    filters: '絞り込み',
    filtersCount: (count) => (count > 0 ? `絞り込み（${String(count)}）` : '絞り込み'),
    showResults: (count) => `${count.toLocaleString('ja-JP')} 件の結果を見る`,
    clearFilters: '絞り込みを外す',
    emptyTitle: '探したい言葉を入れてください',
    emptyDescription: 'ページの名前や本文の言葉で探せます。',
    noResultsTitle: (query) => (query ? `「${query}」に当てはまるものはありません` : '条件に当てはまるものはありません'),
    noResultsDescription: '言葉を短くするか、ほかの言い方で探してください。',
  },
  en: {
    title: 'Search',
    label: 'Site search',
    input: 'Search terms',
    results: 'Results',
    count: (count, query) => {
      const text = `${count.toLocaleString('en-US')} ${count === 1 ? 'result' : 'results'}`;
      return query ? `${text} for “${query}”` : text;
    },
    filters: 'Filters',
    filtersCount: (count) => (count > 0 ? `Filters (${String(count)})` : 'Filters'),
    showResults: (count) => `Show ${count.toLocaleString('en-US')} ${count === 1 ? 'result' : 'results'}`,
    clearFilters: 'Clear filters',
    emptyTitle: 'Enter something to search for',
    emptyDescription: 'You can search page titles and their text.',
    noResultsTitle: (query) => (query ? `No results for “${query}”` : 'No results match these filters'),
    noResultsDescription: 'Try fewer words or different wording.',
  },
};

/** 全部のまとまりを 1 つの言語でまとめる（useSite と、文言を丸ごと差し替える利用者のため）。 */
function templateLabelsIn(lang: 'ja' | 'en'): TemplateLabels {
  return {
    locale: lang === 'ja' ? 'ja-JP' : 'en-US',
    common: commonLabels[lang],
    signIn: signInLabels[lang],
    signUp: signUpLabels[lang],
    forgotPassword: forgotPasswordLabels[lang],
    resetPassword: resetPasswordLabels[lang],
    twoFactor: twoFactorLabels[lang],
    verifyEmail: verifyEmailLabels[lang],
    signOut: signOutLabels[lang],
    emailFirst: emailFirstLabels[lang],
    magicLink: magicLinkLabels[lang],
    notReceived: notReceivedLabels[lang],
    quickSignUp: quickSignUpLabels[lang],
    wizard: wizardLabels[lang],
    phoneSignIn: phoneSignInLabels[lang],
    passkey: passkeyLabels[lang],
    accountChooser: accountChooserLabels[lang],
    reauth: reauthLabels[lang],
    guestAccount: guestAccountLabels[lang],
    error: errorLabels[lang],
    maintenance: maintenanceLabels[lang],
    site: siteLabels[lang],
    document: documentLabels[lang],
    faq: faqLabels[lang],
    pricing: pricingLabels[lang],
    contact: contactLabels[lang],
    changelog: changelogLabels[lang],
    app: appLabels[lang],
    settings: settingsLabels[lang],
    members: membersLabels[lang],
    billing: billingLabels[lang],
    onboarding: onboardingLabels[lang],
    invite: inviteLabels[lang],
    chat: chatLabels[lang],
    assistant: assistantLabels[lang],
    mail: mailLabels[lang],
    orderReview: orderReviewLabels[lang],
    cookieConsent: cookieConsentLabels[lang],
    externalTransmission: externalTransmissionLabels[lang],
    cancelSubscription: cancelSubscriptionLabels[lang],
    apiKeys: apiKeysLabels[lang],
    auditLog: auditLogLabels[lang],
    notificationSettings: notificationSettingsLabels[lang],
    serviceStatus: serviceStatusLabels[lang],
    searchResults: searchResultsLabels[lang],
  };
}

export const japaneseTemplateLabels: TemplateLabels = /* @__PURE__ */ templateLabelsIn('ja');
export const englishTemplateLabels: TemplateLabels = /* @__PURE__ */ templateLabelsIn('en');
