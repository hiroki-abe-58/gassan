/**
 * 配布物の検品。
 *
 *   node scripts/check-dist.mjs
 *
 * CI の品質ゲートとして使う。
 *  - "use client" が両フォーマットの先頭にあるか（App Router で必須）
 *  - 公開 API が期待どおり生えているか
 *  - gzip 後のサイズが予算内か
 *
 * サイズ予算は「気づかないうちに膨らむ」ことを防ぐためのもので、
 * 超えたら即悪ではない。超えたときに理由を説明できる状態を保つのが目的。
 */
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

/*
 * 2026-10-18 に 22 / 22 / 6 KB から引き上げた。入力部品 18 個（I-01〜I-15）を本体に入れたため
 * （利用者の判断。別の入口に分けない）。増えた分は JS が約 11 KB・CSS が約 3 KB（どちらも gzip、未圧縮の dist）。
 * 名前つき import でモーダルの部品だけを使うアプリには、入力部品は tree shaking で載らない。
 * Modal 名前空間は全部品を参照するので、Modal.* で書くアプリには全部載る。
 * 同日、JS を 34 → 35 KB に引き上げた。折り返しの崩れの洗い出し（§10-33）で、Phrase に要素の境目の扱い・
 * keep-all が残す改行の糊・長い文節の切れ目を足したため（約 2 KB）。Phrase は全部品が使うので tree shaking では落ちない。
 * 2026-10-22、JS を 35 → 36 KB に引き上げた。動きの段（V-01〜V-08）で、ポップアップの退出を待つ処理・
 * セグメントの板を測るフック・Provider の器を足したため（約 0.8 KB）。Popup は一覧とカレンダーが共有するので、
 * 入力部品を使うアプリには載る。
 * 同日、JS を 36 → 43 KB、CSS を 9 → 11 KB に引き上げた。カレンダー（I-16〜I-19）で、日本の祝日の計算と
 * 名前の表（日本語・英語）・共有の月の表（月と年の一覧・期間・印）・DateRangePicker・Calendar・RangeCalendar を
 * 足したため（JS 約 6 KB・CSS 約 1.2 KB）。日本語の既定の文言（japaneseLabels）が祝日を引くので、
 * 祝日の計算は labels を使う全部品に載る（名前の表のうち英語の分も一緒に載る。分けると API が割れるので分けない）。
 * 同日、JS を 43 → 45 KB に引き上げた。時刻の選択（I-20）で、時・分・午前午後の列とキー操作を足したため（約 2.8 KB）。
 * 2026-10-23、JS を 45 → 49 KB、CSS を 11 → 12 KB に引き上げた。トースト（N-01〜N-08）で、store とホスト・
 * 残り時間のメーター・払って閉じる操作・モーダルの中への移動・出入りの動きを足したため（JS 約 3.4 KB・CSS 約 1.1 KB）。
 * トーストは名前つき import（toast / ToastHost）でだけ使うので、使わないアプリには tree shaking で載らない。
 * 同日、JS を 49 → 53 KB、CSS を 12 → 14 KB に引き上げた。ページの部品 18 個（U-01〜U-16）と、フォーム部品の
 * 中立の名前を足したため（JS 約 4.2 KB・CSS 約 2.2 KB）。部品は Modal 名前空間に入れていないので、使わない部品の JS は載らない。
 * 同日、JS を 53 → 60 KB、CSS を 14 → 16 KB に引き上げた。ページの部品の 2 段目（U-17〜U-24）とタグの入力・パスワードの強さ
 * （I-21 / I-22）を足したため（JS 約 7.2 KB・CSS 約 2.4 KB）。タブ・アコーディオン・ツールチップ・ポップオーバー・メニュー・
 * パンくず・ページ送り・ステップは Modal 名前空間に入れていないので、使わないアプリの JS には載らない。
 * 同日、JS を 60 → 80 KB に引き上げ、templates.css に 4 KB の予算を置いた。ページのテンプレート（P-01〜P-11）の
 * 14 ページ・外枠・送信の流れ・日本語と英語の文言を足したため（JS 約 19 KB）。テンプレートは名前つき import でだけ使い、
 * Modal 名前空間からも参照しないので、使わないアプリの JS には載らない（minify した束で、Modal だけを使うアプリに
 * テンプレートの文言が 1 つも無いことを確かめた）。見た目は templates.css に分けたので、読み込まない限り CSS も増えない。
 * 同日、JS を 80 → 84 KB、CSS を 16 → 18 KB、templates.css を 4 → 5 KB に引き上げた。横から出る面（C-13）・ページの見出しの帯
 * （U-25）・データの表（U-26。並べ替え・行の選択・選んだ行への操作・骨組み）・アプリの枠（P-12）を足したため（JS 約 3.9 KB・
 * CSS 約 0.8 KB・templates.css 約 0.6 KB）。表とアプリの枠は名前つき import でだけ使うので、使わないアプリの JS には載らない。
 * 同日、JS を 84 → 93 KB に引き上げた。アプリの中のページ（P-13〜P-17。設定・メンバー・料金と請求・はじめの設定・
 * 招待を受ける）の 5 ページと、その日本語と英語の文言を足したため（JS 約 11 KB）。これも名前つき import でだけ使う。
 * 同日、JS を 93 → 96 KB に引き上げた。コマンドパレット（U-27。絞り込み・並べ方・開くキー・読み上げ）と文言を足したため
 * （JS 約 2.3 KB・CSS 約 0.4 KB）。使わないアプリの JS には載らない。
 * 2026-10-24、JS を 96 → 106 KB、CSS を 18 → 21 KB に引き上げた。グラフ（Q-01〜Q-12。折れ線と面・棒・ドーナツ・
 * 小さな推移・順位の棒・メーターと、目盛り・線の形の計算）を足したため（JS 約 9.3 KB・CSS 約 2.3 KB）。グラフは名前つき import
 * でだけ使うので、使わないアプリの JS には載らない（minify した束で、Modal だけを使うアプリにグラフのコードが無いことを確かめた）。
 * 同日、JS を 106 → 110 KB に引き上げた。カルーセル（U-28 / U-29。前へ・次へ・点・自動再生と、モーダルのギャラリーと共有にした
 * scroll-snap の位置の読み取り）を足したため（JS 約 2.3 KB・CSS 約 0.6 KB）。使わないアプリの JS には載らない。
 * 同日、JS を 110 → 114 KB、CSS を 21 → 22 KB に引き上げた。会話（E-01〜E-08。メッセージの列・入力欄・入力中の印・
 * 質問の例と、日本語と英語の文言）を足したため（JS 約 3.5 KB・CSS 約 1.3 KB）。使わないアプリの JS には載らない。
 * 同日、JS を 114 → 118 KB、templates.css を 5 → 6 KB に引き上げた。会話のページ（P-18 / P-19。チャット・AI アシスタントと、
 * 一覧と中身の切り替え・日本語と英語の文言）を足したため（JS 約 3.6 KB・templates.css 約 0.75 KB）。名前つき import でだけ使う。
 * 同日、JS を 118 → 120 KB、templates.css を 6 → 7 KB に引き上げた。メール（P-20。フォルダ・一覧・読む面・まとめての操作・
 * 作成と返信のモーダル・日本語と英語の文言）を足したため（JS 約 4.6 KB・templates.css 約 0.7 KB）。メールだけが使う印は
 * 共有の ICONS に入れずにページの中に置いた（Modal だけを使う束は 17 B 減った）。
 * 同日、JS を 120 → 124 KB、CSS を 22 → 23 KB に引き上げた。コードの塊・ツリー・通知の一覧・はじめのチェックリスト
 * （U-30〜U-33）と、その日本語と英語の文言を足したため（JS 約 3.5 KB・CSS 約 1 KB）。使わないアプリの JS には載らない。
 * 同日、JS を 124 → 127 KB に引き上げた。右クリックのメニュー（U-34）と色の選択（I-23）を足したため（JS 約 3 KB・CSS 約 0.5 KB）。
 * 色の選択は入力部品なので Modal 名前空間にも入る（Modal.ColorPicker。時刻の選択と同じ扱い）。
 * 同日、JS を 127 → 130 KB に引き上げた。エラーのページ（P-05）が IANA に登録された 4xx / 5xx の 40 個すべてに見出しと説明を
 * 持つようにしたため（29 個ぶんの日本語と英語の文言。JS 約 3.5 KB）。文言はテンプレートからだけ引くので、使わないアプリの JS には載らない。
 * 2026-10-25、CSS を 23 → 24 KB に引き上げた。浮くラベル（I-24。ラベルを入力欄に重ね、フォーカスと値で浮かせる規則）を
 * 足したため（CSS 約 0.4 KB・JS 約 0.2 KB）。浮くかどうかは CSS だけで決めるので、JS はほとんど増えない。
 * 同日、JS を 130 → 134 KB、CSS を 24 → 25 KB に引き上げた。スクロールバー（U-35。ScrollArea・PageScrollbar と、ライブラリの中の
 * スクロールする所すべてに付けた自前のバー）を足したため（JS 約 3 KB・CSS 約 1 KB）。モーダルの本文と一覧も同じバーで描くので、
 * Modal だけを使う束にも載る（minify した束で 38,901 → 40,475 B）。
 * 2026-10-26、JS を 134 → 145 KB、CSS を 25 → 26 KB に引き上げた。日本の入力（I-25〜I-31。揺れをそろえる関数・ネイティブの select・
 * メール・住所・姓名・生年月日・口座の束と、日本語と英語の文言）を足したため（JS 約 11 KB・CSS 約 0.3 KB）。住所・姓名・生年月日・口座の束は
 * 名前つき export だけにして Modal 名前空間に入れず、forwardRef と先頭で作る値には @__PURE__ の注釈を付けたので、使わないアプリの JS には
 * 載らない（minify した束で、LineChart だけの束に関数と表が無いことを確かめた）。NativeSelect と EmailInput は入力部品なので
 * Modal 名前空間に入れた（Modal だけを使う束は 40,475 → 43,330 B）。
 * 同日、JS を 145 → 154 KB に引き上げた。ログインと登録の形を変えたもの（P-21〜P-30。窓のログインと登録・メールを先に聞くログイン・
 * メールのリンクとコード・仮登録と本登録の手順・SMS・パスキー・アカウントの選択・本人確認・購入の後のアカウント作成と、日本語と英語の
 * 文言）を足したため（JS 約 9 KB・templates.css 約 0.4 KB）。名前つき import でだけ使うので、Modal だけ・グラフだけの束は変わらない。
 * テンプレートの文言は 1 つの表なので、ほかのテンプレートを使う束には文言のぶん載る（MailboxPage だけの束で 46,021 → 48,771 B）。
 * 同日、JS を 154 → 181 KB、templates.css を 7 → 8 KB に引き上げた。業種ごとの登録（P-31。15 業種の手順・根拠の法令と出典・確認の画面）と
 * 欄の部品（I-32〜I-37。チェックボックスの束・職業と取引の目的・届出と表明・番号・本人確認の方法・保護者と広告メールの同意）、その日本語と
 * 英語の文言を足したため（JS 約 27 KB・templates.css 約 0.2 KB）。増えた分の大半は文言（選択肢と、なぜ聞くかの文。minify して約 50 KB）。
 * 文言は別の表（RegistrationLabels）にし、出典の URL も素の文字列にしたので、登録の部品を使わないアプリの束には載らない
 * （minify した束で LineChart だけ 25,614 B・MailboxPage だけ 48,765 B と G と同じ。Modal だけは CheckboxGroup のぶん 43,485 B）。
 * 同日、JS を 181 → 190 KB、styles.css を 26 → 29 KB に引き上げた。分析のグラフと図（Q-13〜Q-20。散布図・レーダー・ヒートマップ・
 * ウォーターフォール・パレート図・ファネル・特性要因図・ガントチャート）と、その文言を足したため（JS 約 9 KB・styles.css 約 2.7 KB）。
 * 図はどれも名前つき import なので、使わないアプリの束には載らない。GassanLabels に足した図の語（22）のぶん、どの束も約 0.37 KB 増える
 * （minify した束で Modal だけ 43,852 B・LineChart だけ 26,018 B・MailboxPage だけ 49,132 B）。
 */
const BUDGETS = {
  'dist/index.js': 190 * 1024,
  'dist/index.cjs': 190 * 1024,
  'dist/styles.css': 29 * 1024,
  'dist/templates.css': 8 * 1024,
};

const REQUIRED_EXPORTS = [
  'ModalRoot',
  'ModalHeader',
  'ModalControls',
  'ModalBack',
  'ModalClose',
  'ModalIndicator',
  'ModalTitle',
  'ModalDescription',
  'ModalBody',
  'ModalSection',
  'ModalFooter',
  'ModalButton',
  'ModalGate',
  'ModalConsent',
  'ModalGateStatus',
  'ModalMedia',
  'ModalGallery',
  'ModalField',
  'ModalFieldset',
  // 入力部品。I-01〜I-15。
  'ModalInput',
  'ModalPasswordInput',
  'ModalSearchInput',
  'ModalTextarea',
  'ModalNumberField',
  'ModalCodeInput',
  'ModalCheckbox',
  'ModalCheckboxGroup',
  'ModalRadioGroup',
  'ModalSegmented',
  'ModalRating',
  'ModalSlider',
  'ModalRangeSlider',
  'ModalSelect',
  'ModalCombobox',
  'ModalDatePicker',
  'ModalFileDrop',
  'ModalChips',
  'ModalSwitch',
  'ModalTable',
  'ModalChart',
  'ModalHandle',
  'resolveDetents',
  'snapToDetent',
  'ModalAlert',
  'ModalHost',
  'useModals',
  'confirm',
  'Modal',
  'GassanProvider',
  // fail-closed の契約そのもの。dist から消えたら G-12 が黙って壊れる。
  'selectBlockers',
  'DEFAULT_UNRESOLVED_GATE_MESSAGE',
  // 日本語の文節折り返しを gassan の外の UI にも効かせる入口。W-05。
  'Phrase',
  'splitPhrases',
  // 動きの段の名前（none / subtle / standard / expressive）。選ぶ UI を作る側が並べるのに使う。V-01。
  'MOTION_PRESETS',
  // カレンダー。期間・ページの上のカレンダー・日本の祝日。I-16〜I-19。
  'ModalCalendar',
  'ModalRangeCalendar',
  'ModalDateRangePicker',
  'commonDateRanges',
  'DATE_RANGE_PRESETS',
  'japaneseHoliday',
  'japaneseHolidays',
  'japaneseHolidayNames',
  'japaneseHolidayResolver',
  // 時刻の選択。I-20。
  'ModalTimePicker',
  // 色の選択。I-23。
  'ModalColorPicker',
  // タグの入力・パスワードの強さ。I-21 / I-22。
  'ModalTagInput',
  'ModalPasswordStrength',
  // トースト。N-01〜N-08。
  'toast',
  'ToastHost',
  'resetToasts',
  // ページの上の部品。U-01〜U-16。
  'Button',
  'ButtonLink',
  'IconButton',
  'CopyButton',
  'Badge',
  'Avatar',
  'AvatarGroup',
  'Kbd',
  'Divider',
  'Card',
  'Stat',
  'EmptyState',
  'DescriptionList',
  'Timeline',
  'Progress',
  'Spinner',
  'Skeleton',
  'Banner',
  // ページの上の部品の 2 段目。U-17〜U-24。
  'Tabs',
  'Accordion',
  'Tooltip',
  'Popover',
  'Menu',
  'ContextMenu',
  'Breadcrumbs',
  'Pagination',
  'Steps',
  // ページの見出しの帯とデータの表。U-25 / U-26。
  'PageHeader',
  'DataTable',
  'CommandPalette',
  // グラフ。Q-01〜Q-12。
  'LineChart',
  'BarChart',
  'DonutChart',
  'Sparkline',
  'BarList',
  'Gauge',
  // 分析のグラフと図。Q-13〜Q-20。
  'ScatterChart',
  'RadarChart',
  'Heatmap',
  'WaterfallChart',
  'ParetoChart',
  'FunnelChart',
  'FishboneDiagram',
  'GanttChart',
  // カルーセル。U-28 / U-29。
  'Carousel',
  // 会話。E-01〜E-08。
  'ChatThread',
  'ChatComposer',
  'TypingIndicator',
  'ChatSuggestions',
  // コードの塊・ツリー・通知の一覧・はじめのチェックリスト。U-30〜U-33。
  'CodeBlock',
  'TreeView',
  'NotificationCenter',
  'Checklist',
  // スクロールバー。U-35。
  'ScrollArea',
  'PageScrollbar',
  'SCROLLBAR_VISIBILITIES',
  // チャットのウィジェット。E-09。
  'ChatWidget',
  // 日本の入力。I-25〜I-31。束（住所・姓名・生年月日・口座）は Modal 名前空間に入れないので、中立の名前だけ。
  'ModalNativeSelect',
  'ModalEmailInput',
  'NameFields',
  'AddressFields',
  'BirthDateInput',
  'BankAccountFields',
  'toHalfWidth',
  'toFullWidth',
  'normalizeText',
  'normalizeAddress',
  'toKatakana',
  'toHiragana',
  'isKana',
  'toZenginKana',
  'digitsOf',
  'formatPostalCode',
  'isPostalCode',
  'normalizePhone',
  'isPhoneNumber',
  'isMobilePhone',
  'isCorporateNumber',
  'normalizeInvoiceNumber',
  'isInvoiceNumber',
  'isMyNumber',
  'YUCHO_BANK_CODE',
  'yuchoToBranch',
  'COMMON_EMAIL_DOMAINS',
  'CARRIER_EMAIL_DOMAINS',
  'normalizeEmail',
  'suggestEmail',
  'isCarrierEmail',
  'ageOn',
  'japaneseEra',
  'PREFECTURES',
  // フォーム部品の中立の名前（ModalInput などと同じもの）。
  'Field',
  'Fieldset',
  'Input',
  'PasswordInput',
  'SearchInput',
  'Textarea',
  'NumberField',
  'CodeInput',
  'Checkbox',
  'CheckboxGroup',
  'RadioGroup',
  'Segmented',
  'Rating',
  'Slider',
  'RangeSlider',
  'Select',
  'Combobox',
  'DatePicker',
  'DateRangePicker',
  'Calendar',
  'RangeCalendar',
  'TimePicker',
  'ColorPicker',
  'TagInput',
  'PasswordStrength',
  'NativeSelect',
  'EmailInput',
  'FileDrop',
  'Chips',
  'Switch',
  'Table',
  'Alert',
  'Chart',
  // ページのテンプレート。P-01〜P-11。
  'SiteProvider',
  'SiteLink',
  'useSite',
  'AuthLayout',
  'StatusLayout',
  'SignInPage',
  'SignUpPage',
  'ForgotPasswordPage',
  'ResetPasswordPage',
  'TwoFactorPage',
  'VerifyEmailPage',
  'SignOutPage',
  'ErrorPage',
  'MaintenancePage',
  'SiteLayout',
  'DocumentPage',
  'FaqPage',
  'PricingPage',
  'ContactPage',
  'ChangelogPage',
  'japaneseTemplateLabels',
  'englishTemplateLabels',
  'ERROR_STATUSES',
  // アプリの枠。P-12。
  'AppShell',
  // アプリの中のページ。P-13〜P-17。
  'SettingsPage',
  'SettingsSection',
  'MembersPage',
  'BillingPage',
  'OnboardingPage',
  'InviteAcceptPage',
  // 会話のページ。P-18 / P-19。
  'ChatPage',
  'AssistantPage',
  // メール。P-20。
  'MailboxPage',
  // ログインと登録の形を変えたもの。P-21〜P-30。
  'AuthDialog',
  'EmailFirstPage',
  'MagicLinkPage',
  'PhoneSignInPage',
  'QuickSignUpPage',
  'RegistrationWizardPage',
  'GuestAccountCard',
  'PasskeyPromptPage',
  'AccountChooserPage',
  'ReauthDialog',
  // 登録の欄（I-33〜I-37）と業種ごとの登録（P-31）。
  'OccupationField',
  'PurposeField',
  'PepsField',
  'UsPersonField',
  'TaxResidencyField',
  'DeclarationField',
  'MyNumberField',
  'CompanyFields',
  'IdentityMethodField',
  'identityMethods',
  'GuardianFields',
  'MarketingConsentField',
  'RegistrationPresetPage',
  'emptyRegistrationValues',
  'REGISTRATION_PRESETS',
  'REGISTRATION_PRESET_IDS',
  'OCCUPATIONS',
  'PURPOSES',
  'japaneseRegistrationLabels',
  'englishRegistrationLabels',
  'useRegistrationLabels',
];

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`  FAIL  ${message}`);
};

console.log('checking dist/');

for (const file of Object.keys(BUDGETS)) {
  if (!existsSync(file)) {
    fail(`${file} is missing. run: npm run build`);
    continue;
  }
  const raw = readFileSync(file);
  const gzipped = gzipSync(raw).length;
  const budget = BUDGETS[file];
  const ok = gzipped <= budget;
  const line = `${file.padEnd(18)} raw ${String(raw.length).padStart(6)} B   gzip ${String(
    gzipped,
  ).padStart(6)} B   budget ${budget} B`;
  if (ok) console.log(`  ok    ${line}`);
  else fail(`${line} (over budget)`);
}

// "use client" は Next.js App Router でクライアント境界を作るために要る。
// rollup が黙って落とすことがあるので、毎回ここで確かめる。
for (const file of ['dist/index.js', 'dist/index.cjs']) {
  if (!existsSync(file)) continue;
  const head = readFileSync(file, 'utf8').slice(0, 20);
  if (head.startsWith('"use client";')) console.log(`  ok    ${file} has "use client"`);
  else fail(`${file} lost the "use client" directive`);
}

if (existsSync('dist/index.js')) {
  const source = readFileSync('dist/index.js', 'utf8');
  const match = source.match(/export\s*\{([\s\S]*?)\}/);
  if (!match) {
    fail('no export block found in dist/index.js');
  } else {
    const exported = new Set(
      match[1]
        .split(',')
        .map((part) => part.trim().split(/\s+as\s+/).pop())
        .filter(Boolean),
    );
    const missing = REQUIRED_EXPORTS.filter((name) => !exported.has(name));
    if (missing.length > 0) fail(`missing exports: ${missing.join(', ')}`);
    else console.log(`  ok    ${REQUIRED_EXPORTS.length} public exports present`);
  }
}

if (existsSync('dist/styles.css')) {
  const css = readFileSync('dist/styles.css', 'utf8');
  const required = [
    '@layer gassan.reset',
    '@starting-style',
    'allow-discrete',
    'overlay',
    'prefers-reduced-motion',
    'prefers-reduced-transparency',
    'forced-colors',
    // L-07。overlay 非対応環境の退出 fallback。落ちると退出が一瞬で消える。
    '[data-exiting]',
    '.g-chart',
  ];
  const missing = required.filter((token) => !css.includes(token));
  if (missing.length > 0) fail(`styles.css is missing: ${missing.join(', ')}`);
  else console.log('  ok    styles.css keeps the required at-rules');
}

// テンプレートの形は器の幅（@container）で決まり、層の順の宣言が先頭にないと読み込む順で崩れる。P-01。
if (existsSync('dist/templates.css')) {
  const css = readFileSync('dist/templates.css', 'utf8');
  const required = ['@layer gassan.reset', '@container', 'forced-colors', '@media print'];
  const missing = required.filter((token) => !css.includes(token));
  if (missing.length > 0) fail(`templates.css is missing: ${missing.join(', ')}`);
  else console.log('  ok    templates.css keeps the required at-rules');
}

/*
 * 文書が名指ししている実測バイト数が、いま出た値と一致するか。
 *
 * テスト件数・公開 API 数は check-trace が見ているが、サイズだけは誰も見ていなかった。
 * 実際 ROADMAP の gzip 値は 1 ビルドぶん古いまま残っていた。
 * 「文書の数値は機械が照合する」をサイズにも広げて、手で書いた数字が腐らないようにする。
 */
{
  const claims = [
    { file: 'VERIFICATION.md', dist: 'dist/index.js', label: '`dist/index.js` (ESM)' },
    { file: 'VERIFICATION.md', dist: 'dist/index.cjs', label: '`dist/index.cjs`' },
    { file: 'VERIFICATION.md', dist: 'dist/styles.css', label: '`dist/styles.css`' },
    { file: 'VERIFICATION.md', dist: 'dist/templates.css', label: '`dist/templates.css`' },
  ];
  const group = (n) => n.toLocaleString('en-US');
  let checked = 0;
  for (const claim of claims) {
    if (!existsSync(claim.file) || !existsSync(claim.dist)) continue;
    const doc = readFileSync(claim.file, 'utf8');
    const row = doc.split('\n').find((line) => line.startsWith(`| ${claim.label} |`));
    if (!row) {
      fail(`${claim.file}: ${claim.label} の実測行が見つからない`);
      continue;
    }
    const buf = readFileSync(claim.dist);
    const raw = group(buf.byteLength);
    const gz = group(gzipSync(buf).byteLength);
    if (!row.includes(`${raw} B`) || !row.includes(`${gz} B`)) {
      fail(`${claim.file}: ${claim.label} の実測が古い（いまは raw ${raw} B / gzip ${gz} B）`);
    } else {
      checked += 1;
    }
  }

  // ROADMAP は受け入れ条件として index.js と styles.css の gzip を名指ししている。
  if (existsSync('ROADMAP.md') && existsSync('dist/index.js') && existsSync('dist/styles.css')) {
    const roadmap = readFileSync('ROADMAP.md', 'utf8');
    const js = group(gzipSync(readFileSync('dist/index.js')).byteLength);
    const css = group(gzipSync(readFileSync('dist/styles.css')).byteLength);
    if (!roadmap.includes(`実測 ${js} B / ${css} B`)) {
      fail(`ROADMAP.md: 受け入れ条件の実測が古い（いまは ${js} B / ${css} B）`);
    } else {
      checked += 1;
    }
  }
  if (checked > 0) console.log(`  ok    文書の実測サイズ ${checked} 箇所が今回のビルドと一致`);
}

if (failed) {
  console.error('\ndist check failed.');
  process.exit(1);
}
console.log('\ndist check passed.');
