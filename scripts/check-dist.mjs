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
 */
const BUDGETS = {
  'dist/index.js': 80 * 1024,
  'dist/index.cjs': 80 * 1024,
  'dist/styles.css': 16 * 1024,
  'dist/templates.css': 4 * 1024,
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
  'Breadcrumbs',
  'Pagination',
  'Steps',
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
  'TagInput',
  'PasswordStrength',
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
