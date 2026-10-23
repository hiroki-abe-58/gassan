import { Fragment, createElement, type ReactNode } from 'react';

/** エラーページが知っている状態。数字は HTTP の状態コード。 */
export type ErrorStatus = 400 | 401 | 403 | 404 | 408 | 410 | 429 | 500 | 502 | 503 | 504 | 'offline';

/** 状態ごとの文言の鍵。知らない 4xx / 5xx は '4xx' / '5xx' の文言で出す。 */
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
      '403': 'このページを見る権限がありません',
      '404': 'ページが見つかりません',
      '408': '応答を待ちきれませんでした',
      '410': 'このページは削除されました',
      '429': 'リクエストが多すぎます',
      '500': '問題が起きました',
      '502': 'サーバーから正しい応答がありませんでした',
      '503': '一時的に利用できません',
      '504': 'サーバーの応答が時間内に返りませんでした',
      offline: 'インターネットに接続されていません',
      '4xx': 'リクエストを完了できませんでした',
      '5xx': '問題が起きました',
    },
    descriptions: {
      '400': '送られた内容に不備がありました。前のページに戻って、もう一度お試しください。',
      '401': 'このページを見るには、ログインしてください。',
      '403': '見るには権限が要ります。ワークスペースの管理者に、権限を依頼してください。',
      '404': 'アドレスが間違っているか、ページが移動または削除された可能性があります。',
      '408': '通信に時間がかかりすぎました。もう一度お試しください。',
      '410': 'お探しのページは、もうありません。',
      '429': '短い時間に多くの操作がありました。少し待ってから、もう一度お試しください。',
      '500': 'こちら側で問題が起きています。時間をおいて、もう一度お試しください。続くときは、サポートにお問い合わせください。',
      '502': '一時的な問題の可能性があります。少し待ってから、もう一度お試しください。',
      '503': 'アクセスが集中しているか、メンテナンス中です。時間をおいて、もう一度お試しください。',
      '504': '時間をおいて、もう一度お試しください。',
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
      '403': 'You don’t have access to this page',
      '404': 'Page not found',
      '408': 'The request timed out',
      '410': 'This page has been removed',
      '429': 'Too many requests',
      '500': 'Something went wrong',
      '502': 'The server sent an invalid response',
      '503': 'Temporarily unavailable',
      '504': 'The server took too long to respond',
      offline: 'You’re offline',
      '4xx': 'We couldn’t complete the request',
      '5xx': 'Something went wrong',
    },
    descriptions: {
      '400': 'Something in the request was not right. Go back and try again.',
      '401': 'Sign in to see this page.',
      '403': 'You need permission to see this. Ask an admin of your workspace for access.',
      '404': 'The address may be wrong, or the page may have moved or been deleted.',
      '408': 'The connection took too long. Try again.',
      '410': 'The page you are looking for no longer exists.',
      '429': 'There were many requests in a short time. Wait a moment and try again.',
      '500': 'Something went wrong on our side. Try again in a moment. If it keeps happening, contact support.',
      '502': 'This may be temporary. Wait a moment and try again.',
      '503': 'We are busy or under maintenance. Try again in a moment.',
      '504': 'Try again in a moment.',
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
};
