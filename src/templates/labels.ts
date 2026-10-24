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
 * （labels.locale が ja で始まれば日本語）で選び、SiteProvider の labels で差し替えられる。
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
}

/** 「A と B に同意します」のような、リンクを挟む文を組み立てる。 */
const join = (...parts: ReactNode[]): ReactNode => createElement(Fragment, null, ...parts);

export const japaneseTemplateLabels: TemplateLabels = {
  locale: 'ja-JP',
  common: {
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
  },
  signIn: {
    title: 'ログイン',
    description: 'メールアドレスとパスワードでログインします。',
    remember: 'ログインしたままにする',
    forgot: 'パスワードを忘れた場合',
    submit: 'ログイン',
    failed: 'メールアドレスかパスワードが違います。',
    noAccount: 'アカウントをお持ちでない方は',
  },
  signUp: {
    title: 'アカウントを作る',
    description: 'メールアドレスで登録します。',
    agree: (terms, privacy) => join(terms, 'と', privacy, 'に同意します'),
    agreeRequired: '登録するには、利用規約とプライバシーポリシーへの同意が必要です',
    submit: 'アカウントを作る',
    hasAccount: 'すでにアカウントをお持ちの方は',
  },
  forgotPassword: {
    title: 'パスワードの再設定',
    description: '登録したメールアドレスを入力してください。再設定の手順をお送りします。',
    submit: '再設定のメールを送る',
    sentTitle: 'メールを確認してください',
    sentDescription: (email) =>
      `${email} が登録されていれば、再設定の手順を送りました。数分たっても届かないときは、迷惑メールのフォルダもご確認ください。`,
  },
  resetPassword: {
    title: '新しいパスワードを決める',
    description: 'これまでと違うパスワードにしてください。',
    submit: 'パスワードを変える',
    doneTitle: 'パスワードを変えました',
    doneDescription: '新しいパスワードでログインしてください。',
    expiredTitle: 'リンクの有効期限が切れています',
    expiredDescription: '再設定のリンクは、一定の時間がたつと使えなくなります。もう一度メールを送ってください。',
    requestAgain: 'もう一度メールを送る',
  },
  twoFactor: {
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
  verifyEmail: {
    title: 'メールアドレスを確認してください',
    description: (email) => `${email} に確認のメールを送りました。メールのリンクを開くと、登録が終わります。`,
    change: 'メールアドレスを変える',
    verifiedTitle: 'メールアドレスを確認できました',
    verifiedDescription: 'ご登録ありがとうございます。さっそく始めましょう。',
    continue: '続ける',
    expiredTitle: '確認のリンクの有効期限が切れています',
    expiredDescription: '確認のリンクは、一定の時間がたつと使えなくなります。もう一度メールを送ってください。',
  },
  signOut: {
    confirmTitle: 'ログアウトしますか',
    confirmDescription: 'この端末からログアウトします。保存していない変更は失われます。',
    confirm: 'ログアウト',
    cancel: 'キャンセル',
    doneTitle: 'ログアウトしました',
    doneDescription: 'ご利用ありがとうございました。',
    signInAgain: 'もう一度ログインする',
  },
  error: {
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
  maintenance: {
    title: 'ただいまメンテナンス中です',
    description: 'サービスをより良くするための作業をしています。ご不便をおかけします。',
    schedule: '予定',
    range: (start, end) => `${start}〜${end}`,
    until: (end) => `${end} に終わる予定です`,
    updates: '最新の情報',
    reload: '再読み込み',
  },
  site: {
    nav: 'サイトの案内',
    menu: 'メニュー',
    footerNav: 'サイトの情報',
  },
  document: {
    toc: '目次',
    effective: '施行日',
    updated: '最終更新日',
    article: (n) => `第 ${String(n)} 条`,
    backToTop: 'ページの先頭へ',
  },
  faq: {
    title: 'よくある質問',
    description: 'お問い合わせの前に、よく寄せられる質問をご確認ください。',
    search: '質問を探す',
    results: (count) => `${String(count)} 件の質問が見つかりました`,
    noResults: '当てはまる質問がありませんでした。言葉を変えて探すか、お問い合わせください。',
    stillNeedHelp: '解決しませんでしたか',
    contact: 'お問い合わせ',
    other: 'その他',
  },
  pricing: {
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
  contact: {
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
  changelog: {
    title: '更新履歴',
    description: '新しい機能・改善・修正のお知らせです。',
    filter: '種類で絞り込む',
    all: 'すべて',
    tags: { new: '新機能', improved: '改善', fixed: '修正', security: 'セキュリティ', breaking: '重要な変更' },
    subscribe: 'RSS で購読する',
  },
  app: {
    nav: 'アプリの案内',
    menu: 'メニュー',
    account: (name) => `${name}のアカウント`,
  },
  settings: {
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
  members: {
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
  billing: {
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
  onboarding: { progress: 'はじめの設定', back: '戻る', next: '次へ', skip: 'あとで設定する', finish: '始める' },
  invite: {
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
  chat: {
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
  assistant: {
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
  mail: {
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
};

export const englishTemplateLabels: TemplateLabels = {
  locale: 'en-US',
  common: {
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
  },
  signIn: {
    title: 'Sign in',
    description: 'Sign in with your email and password.',
    remember: 'Keep me signed in',
    forgot: 'Forgot your password?',
    submit: 'Sign in',
    failed: 'The email or password is incorrect.',
    noAccount: 'Don’t have an account?',
  },
  signUp: {
    title: 'Create an account',
    description: 'Sign up with your email address.',
    agree: (terms, privacy) => join('I agree to the ', terms, ' and the ', privacy),
    agreeRequired: 'To sign up, agree to the Terms of Service and the Privacy Policy',
    submit: 'Create account',
    hasAccount: 'Already have an account?',
  },
  forgotPassword: {
    title: 'Reset your password',
    description: 'Enter the email address you signed up with, and we will send you instructions.',
    submit: 'Send reset email',
    sentTitle: 'Check your email',
    sentDescription: (email) =>
      `If ${email} has an account, we have sent instructions to reset the password. If nothing arrives in a few minutes, check your spam folder.`,
  },
  resetPassword: {
    title: 'Choose a new password',
    description: 'Use a password you have not used before.',
    submit: 'Change password',
    doneTitle: 'Your password has been changed',
    doneDescription: 'Sign in with your new password.',
    expiredTitle: 'This link has expired',
    expiredDescription: 'Reset links stop working after a while. Request a new email.',
    requestAgain: 'Send a new email',
  },
  twoFactor: {
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
  verifyEmail: {
    title: 'Verify your email',
    description: (email) => `We sent a verification email to ${email}. Open the link in it to finish signing up.`,
    change: 'Change email address',
    verifiedTitle: 'Your email is verified',
    verifiedDescription: 'Thanks for signing up. Let’s get started.',
    continue: 'Continue',
    expiredTitle: 'This verification link has expired',
    expiredDescription: 'Verification links stop working after a while. Request a new email.',
  },
  signOut: {
    confirmTitle: 'Sign out?',
    confirmDescription: 'You will be signed out on this device. Unsaved changes will be lost.',
    confirm: 'Sign out',
    cancel: 'Cancel',
    doneTitle: 'You have signed out',
    doneDescription: 'Thanks for using the service.',
    signInAgain: 'Sign in again',
  },
  error: {
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
  maintenance: {
    title: 'We’re down for maintenance',
    description: 'We are working to make the service better. Sorry for the inconvenience.',
    schedule: 'Schedule',
    range: (start, end) => `${start} – ${end}`,
    until: (end) => `Expected to finish ${end}`,
    updates: 'Latest updates',
    reload: 'Reload',
  },
  site: {
    nav: 'Main',
    menu: 'Menu',
    footerNav: 'Site information',
  },
  document: {
    toc: 'Contents',
    effective: 'Effective',
    updated: 'Last updated',
    article: (n) => `Article ${String(n)}`,
    backToTop: 'Back to top',
  },
  faq: {
    title: 'Frequently asked questions',
    description: 'Before contacting us, check the questions we hear most often.',
    search: 'Search questions',
    results: (count) => `${String(count)} ${count === 1 ? 'question' : 'questions'} found`,
    noResults: 'No questions match. Try different words, or contact us.',
    stillNeedHelp: 'Still need help?',
    contact: 'Contact us',
    other: 'Other',
  },
  pricing: {
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
  contact: {
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
  changelog: {
    title: 'Changelog',
    description: 'New features, improvements and fixes.',
    filter: 'Filter by type',
    all: 'All',
    tags: { new: 'New', improved: 'Improved', fixed: 'Fixed', security: 'Security', breaking: 'Breaking' },
    subscribe: 'Subscribe via RSS',
  },
  app: {
    nav: 'App navigation',
    menu: 'Menu',
    account: (name) => `${name}, account`,
  },
  settings: {
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
  members: {
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
  billing: {
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
  onboarding: { progress: 'Getting started', back: 'Back', next: 'Next', skip: 'Skip for now', finish: 'Get started' },
  invite: {
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
  chat: {
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
  assistant: {
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
  mail: {
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
