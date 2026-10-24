/**
 * SSR スモークテスト。
 *
 *   node scripts/ssr-smoke.mjs
 *
 * ビルド済みの dist を Node 上で renderToString する。
 * Next.js App Router では、クライアントコンポーネントであっても
 * サーバー側で一度レンダーされる。レンダー本体で window / document に触れていると
 * ここで落ちる。jsdom のテストは window がある環境なので、この穴は見つけられない。
 */
import { Fragment, createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

import {
  Accordion,
  AppShell,
  BillingPage,
  Breadcrumbs,
  CommandPalette,
  DataTable,
  BarChart,
  BarList,
  DonutChart,
  Gauge,
  LineChart,
  Sparkline,
  ChangelogPage,
  ContactPage,
  DocumentPage,
  ErrorPage,
  FaqPage,
  GassanProvider,
  InviteAcceptPage,
  MaintenancePage,
  MembersPage,
  Menu,
  Modal,
  ModalHost,
  OnboardingPage,
  PageHeader,
  Pagination,
  PasswordStrength,
  Phrase,
  Popover,
  PricingPage,
  SettingsPage,
  SignInPage,
  SiteProvider,
  Steps,
  Tabs,
  TagInput,
  ToastHost,
  Tooltip,
  englishLabels,
} from '../dist/index.js';

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`  FAIL  ${message}`);
};
const ok = (message) => console.log(`  ok    ${message}`);

const noop = () => {};

function buildTree(open) {
  return h(
    Fragment,
    null,
    h(
      Modal.Root,
      { open, onOpenChange: noop, kind: 'form', size: 'md', placement: 'auto' },
      h(
        Modal.Header,
        null,
        h(Modal.Controls, {
          start: h(Modal.Back, { onClick: noop }),
          center: h(Modal.Indicator, { current: 2, total: 5 }),
          end: h(Modal.Close),
        }),
        h(Modal.Title, null, 'サーバーでも描ける長めのタイトル'),
      ),
      h(
        Modal.Body,
        { readGate: 'read' },
        h(Modal.Description, null, '説明文'),
        h(Modal.Section, { title: '節' }, '中身'),
        h(Modal.Media, { src: '/example.png', alt: '例' }),
        h(Modal.Gallery, {
          label: 'ギャラリー',
          items: [
            { id: 'a', content: 'A' },
            { id: 'b', content: 'B' },
          ],
        }),
        h(Modal.Field, { label: '表示名', required: true, help: 'ヘルプ' }, (control) =>
          h('input', { ...control, type: 'text', readOnly: true }),
        ),
        h(Modal.Chips, {
          label: 'ジャンル',
          options: [{ value: 'x', label: 'X' }],
          value: [],
          onChange: noop,
        }),
        h(Modal.Switch, { checked: false, onCheckedChange: noop }, '通知'),
        // 入力部品（I-01〜I-15）。ポップアップは閉じている間は描かないので、サーバーでは起点だけが出る。
        h(Modal.Field, { label: '金額' }, (control) => h(Modal.Input, { ...control, start: '¥', end: '円' })),
        h(Modal.PasswordInput, { 'aria-label': 'パスワード' }),
        h(Modal.SearchInput, { 'aria-label': '検索' }),
        h(Modal.Textarea, { 'aria-label': 'メモ', maxLength: 140, defaultValue: 'こんにちは' }),
        h(Modal.NumberField, { 'aria-label': '人数', defaultValue: 2, min: 1, unit: '名' }),
        h(Modal.CodeInput, { 'aria-label': '確認コード', defaultValue: '12' }),
        h(
          Modal.Fieldset,
          { label: 'プラン', help: 'あとで変えられる' },
          h(Modal.Checkbox, { defaultChecked: true, description: '補足' }, '同意する'),
          h(Modal.RadioGroup, { options: [{ value: 'a', label: 'A' }], defaultValue: 'a' }),
          h(Modal.Segmented, { options: [{ value: 'a', label: 'A' }], defaultValue: 'a' }),
          h(Modal.Rating, { defaultValue: 3 }),
        ),
        h(Modal.Slider, { 'aria-label': '音量', defaultValue: 40 }),
        h(Modal.RangeSlider, { 'aria-label': '価格', defaultValue: [20, 60] }),
        h(Modal.Select, { 'aria-label': 'サイズ', options: [{ value: 'md', label: '中' }], defaultValue: 'md' }),
        h(Modal.Combobox, { 'aria-label': '国', options: [{ value: 'jp', label: '日本' }] }),
        h(Modal.DatePicker, { 'aria-label': '日付', defaultValue: '2026-10-18' }),
        h(Modal.FileDrop, { 'aria-label': '書類', accept: '.pdf' }),
        h(Modal.Table, { label: '表' }, h('table', null, h('tbody', null, h('tr', null, h('td', null, '1'))))),
        h(
          Modal.Chart,
          {
            label: '月別の売上',
            summary: '3月が最大で、以降は横ばい。',
            data: h('table', null, h('tbody', null, h('tr', null, h('td', null, '3月'), h('td', null, '120')))),
          },
          h('svg', { viewBox: '0 0 10 10', role: 'img' }, h('rect', { width: 10, height: 6 })),
        ),
        h(Modal.Alert, null, 'エラーのまとめ'),
        h(Modal.Consent, { gate: 'terms' }, '同意します'),
        h(Modal.GateStatus),
        h(Modal.Gate, { name: 'custom', satisfied: false, reason: '条件があります' }),
      ),
      h(
        Modal.Footer,
        { note: '注記' },
        h(Modal.Button, { variant: 'tertiary', 'data-probe': 'ungated' }, 'やめる'),
        h(Modal.Button, { variant: 'primary', gate: true, 'data-probe': 'gated' }, '続ける'),
      ),
    ),
    h(ModalHost),
  );
}

console.log('ssr smoke test');

let html = '';
try {
  html = renderToString(buildTree(false));
  ok('renders with open=false');
} catch (error) {
  fail(`threw with open=false: ${error.message}`);
}

try {
  renderToString(buildTree(true));
  ok('renders with open=true');
} catch (error) {
  fail(`threw with open=true: ${error.message}`);
}

try {
  renderToString(h(GassanProvider, { labels: englishLabels }, buildTree(false)));
  ok('renders inside GassanProvider (english labels)');
} catch (error) {
  fail(`threw inside GassanProvider: ${error.message}`);
}

const expectations = [
  ['<dialog', 'dialog element'],
  ['class="g-panel"', 'panel'],
  ['class="g-scrim"', 'scrim'],
  ['role="status"', 'live region'],
  ['aria-labelledby=', 'accessible name wiring'],
  ['aria-describedby=', 'description wiring'],
  ['data-placement="center"', 'placement resolved without matchMedia'],
  ['class="g-chart"', 'chart figure'],
  ['class="g-chart-visual" aria-hidden="true"', 'chart visual hidden by default'],
  ['<details class="g-chart-data">', 'chart data disclosure'],
  ['class="g-select-trigger" role="combobox"', 'select trigger'],
  ['aria-autocomplete="list"', 'combobox input'],
  ['2026年10月18日(日)', 'date formatted with Intl on the server'],
  ['autoComplete="one-time-code"', 'one-time-code input'],
  ['--g-fill-end:40%', 'slider fill'],
  ['class="g-file-input"', 'file input'],
  ['<fieldset', 'fieldset for choice groups'],
];

for (const [needle, label] of expectations) {
  if (html.includes(needle)) ok(`markup contains ${label}`);
  else fail(`markup is missing ${label} (${needle})`);
}

// ---------------------------------------------------------------------------
// ゲートの fail-closed（G-12）。
//
// 以前はここで html 全体に対して aria-disabled="true" を探していた。
// それだと Modal.Gallery の「前へ」（1 枚目なので正しく無効）に一致してしまい、
// ゲートが完全に壊れていても緑のままだった。空振りするアサーションは無いより悪い。
// data-probe で当該のボタンだけを名指しし、ゲート無しの側が巻き込まれていないことも見る。
// ---------------------------------------------------------------------------
const buttonByProbe = (markup, probe) => {
  const found = markup.match(new RegExp(`<button[^>]*data-probe="${probe}"[^>]*>`));
  return found ? found[0] : null;
};

for (const [open, label] of [[false, 'open=false'], [true, 'open=true']]) {
  const markup = renderToString(buildTree(open));
  const gated = buttonByProbe(markup, 'gated');
  const ungated = buttonByProbe(markup, 'ungated');

  if (!gated) fail(`gated button not found in markup (${label})`);
  else if (gated.includes('aria-disabled="true"') && gated.includes('data-gated=""')) {
    ok(`gated button is closed on the server (${label})`);
  } else {
    fail(`gated button was open during SSR (${label}): ${gated}`);
  }

  if (!ungated) fail(`ungated button not found in markup (${label})`);
  else if (!ungated.includes('aria-disabled') && !ungated.includes('data-gated')) {
    ok(`ungated button stays open on the server (${label})`);
  } else {
    fail(`ungated button was blocked during SSR (${label}): ${ungated}`);
  }
}

// 理由テキストはサーバーでも出ていること。aria-describedby の参照先が空だと、
// 「押せないが理由は読めない」という G-07 の失敗になる。
if (html.includes('この操作にはまだ満たしていない条件があります。')) {
  ok('server markup carries the unresolved reason text');
} else {
  fail('gated button references a reason that is not in the markup');
}

// 文言は GassanLabels を通ること。英語ラベル下で日本語が出ないことを確かめる。
const englishHtml = renderToString(
  h(GassanProvider, { labels: englishLabels }, buildTree(true)),
);
if (
  englishHtml.includes('This action still has conditions that are not met.') &&
  !englishHtml.includes('この操作にはまだ満たしていない条件があります。')
) {
  ok('unresolved reason follows GassanLabels');
} else {
  fail('unresolved reason ignored GassanLabels and fell back to Japanese');
}

// 命令的ホストはサーバーでは何も出さない。
if (!html.includes('gassan-confirm')) ok('ModalHost renders nothing on the server');

// ---------------------------------------------------------------------------
// data-* の受け渡し（D-11）を、ビルド済みの dist で確かめる。
//
// 単体テストは src/ を import するので、tsup の変換や .d.ts の出力で
// 受け渡しが壊れても気づけない。消費者が触るのは dist のほうであり、
// v0.4.0 の Playwright は data-testid でしか要素を掴めない。
// 「型は通るのに実行時に消える」という D-11 の事故を、出荷物の側で封じる。
// ---------------------------------------------------------------------------
const warnings = [];
const realWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.join(' '));
};

let passthroughHtml = '';
try {
  passthroughHtml = renderToString(
    h(
      Modal.Root,
      {
        open: false,
        onOpenChange: noop,
        'data-testid': 'root',
        // 予約名。消費者の値で内部状態が壊れないことを確認する。
        'data-kind': 'spoofed-by-consumer',
      },
      h(
        Modal.Header,
        { 'data-testid': 'header' },
        h(Modal.Title, { 'data-testid': 'title' }, 'タイトル'),
      ),
      h(Modal.Body, { 'data-testid': 'body' }, '本文'),
      h(
        Modal.Footer,
        { 'data-testid': 'footer' },
        h(Modal.Button, { variant: 'primary', 'data-testid': 'primary' }, 'OK'),
      ),
    ),
  );
} catch (error) {
  fail(`passthrough tree threw: ${error.message}`);
} finally {
  console.warn = realWarn;
}

for (const id of ['root', 'header', 'title', 'body', 'footer', 'primary']) {
  if (passthroughHtml.includes(`data-testid="${id}"`)) ok(`dist forwards data-testid on ${id}`);
  else fail(`dist dropped data-testid on ${id}`);
}

// 予約名は消費者の値で上書きされない。kind の既定は "form"。
if (
  passthroughHtml.includes('data-kind="form"') &&
  !passthroughHtml.includes('spoofed-by-consumer')
) {
  ok('dist keeps reserved data-kind (consumer value ignored)');
} else {
  fail('reserved data-kind was overwritten by the consumer value');
}

// 黙って捨てないこと自体が D-11 の要件なので、警告の有無も確認する。
if (warnings.some((line) => line.includes('data-kind'))) {
  ok('dist warns when a reserved data-* is passed');
} else {
  fail('reserved data-* was ignored without a warning');
}

// --- 日本語の文節折り返し（W-01 / W-03 / W-04）-----------------------------
// サーバーでも文節の切れ目に <wbr aria-hidden="true"> を置く。クライアントと同じ位置でなければ
// hydration がずれる。Intl.Segmenter を持つ Node（full-icu が既定）で、dist 経由で確かめる。
const phraseHtml = renderToString(h(Phrase, null, 'プロフィールを編集'));
if (phraseHtml === '<span class="g-phrase">プロフィールを<wbr aria-hidden="true"/>編集</span>') {
  ok('dist breaks Japanese at phrase boundaries on the server (<wbr aria-hidden>)');
} else {
  fail(`unexpected phrase markup on the server: ${phraseHtml}`);
}
const phraseOff = renderToString(h(GassanProvider, { lineBreak: 'browser' }, h(Phrase, null, 'プロフィールを編集')));
if (phraseOff === 'プロフィールを編集') ok('lineBreak="browser" leaves the text untouched on the server');
else fail(`lineBreak="browser" still changed the markup: ${phraseOff}`);

// カレンダー（I-16〜I-19）。祝日の計算と Intl の書式はサーバーでも同じ結果になる。
const calendarHtml = renderToString(h(Modal.Calendar, { 'aria-label': 'c', defaultValue: '2026-01-07', size: 'lg' }));
if (calendarHtml.includes('成人の日') && calendarHtml.includes('data-holiday')) ok('Calendar renders Japanese holiday names on the server');
else fail('Calendar did not render the holiday name on the server');
const rangeHtml = renderToString(h(Modal.DateRangePicker, { 'aria-label': 'r' }));
if (rangeHtml.includes('期間を選ぶ')) ok('DateRangePicker renders its placeholder on the server');
else fail('DateRangePicker did not render its placeholder on the server');
const englishCalendar = renderToString(h(GassanProvider, { labels: englishLabels }, h(Modal.Calendar, { 'aria-label': 'c', defaultValue: '2026-01-07' })));
if (!englishCalendar.includes('data-holiday')) ok('English labels show no holidays by default on the server');
else fail('English labels still marked holidays on the server');

// 時刻の選択（I-20）。時計の慣習（24 時間 / 12 時間）は言語の Intl から決まる。
const timeHtml = renderToString(h(Modal.TimePicker, { 'aria-label': 't', defaultValue: '09:05' }));
if (timeHtml.includes('09:05')) ok('TimePicker renders the 24-hour value for Japanese labels on the server');
else fail(`TimePicker did not render 09:05 on the server: ${timeHtml}`);
const englishTime = renderToString(h(GassanProvider, { labels: englishLabels }, h(Modal.TimePicker, { 'aria-label': 't', defaultValue: '21:05' })));
// ICU の版によって、時刻と AM / PM の間は普通の空白か狭い空白（U+202F）。
if (/9:05\sPM/.test(englishTime)) ok('TimePicker renders a 12-hour value for English labels on the server');
else fail(`TimePicker did not render 9:05 PM on the server: ${englishTime}`);

// トースト（N-01）。領域は popover で、置き場所（最前面の dialog か body）はクライアントでしか決まらない。
const toastHtml = renderToString(h(ToastHost));
if (toastHtml === '') ok('ToastHost renders nothing on the server (the region mounts on the client)');
else fail(`ToastHost rendered markup on the server: ${toastHtml}`);

// ページの部品の 2 段目（U-17〜U-24）と、タグ・パスワードの強さ（I-21 / I-22）。
// 起点の脇に出る部品は、閉じている間は起点だけを描く（ツールチップの文は説明として DOM に置く）。
const button = (label) => h('button', { type: 'button' }, label);
const partsHtml = renderToString(
  h(
    Fragment,
    null,
    h(Tabs, { label: 'タブ', items: [{ value: 'a', label: '概要', content: 'A' }, { value: 'b', label: '設定', content: 'B' }] }),
    h(Accordion, { items: [{ value: 'q', title: 'Q', content: 'A' }], defaultValue: ['q'] }),
    h(Tooltip, { content: '補足の文' }, button('起点')),
    h(Popover, { trigger: button('開く'), title: '窓' }, '中身'),
    h(Menu, { trigger: button('操作'), items: [{ value: 'x', label: '項目' }] }),
    h(Breadcrumbs, { items: [{ label: 'ホーム', href: '/' }, { label: '今' }] }),
    h(Pagination, { count: 10, defaultPage: 5 }),
    h(Steps, { items: [{ label: '一' }, { label: '二' }], current: 1 }),
    h(TagInput, { 'aria-label': 'タグ', defaultValue: ['営業'] }),
    h(PasswordStrength, { value: 'Abcdefg1!' }),
  ),
);
for (const [label, passed] of [
  ['Tabs renders the tablist and the selected tab on the server', partsHtml.includes('role="tablist"') && partsHtml.includes('aria-selected="true"')],
  ['Accordion renders native details (open by defaultValue) on the server', /<details[^>]*open=""/.test(partsHtml)],
  ['Tooltip renders only the description on the server (no bubble)', partsHtml.includes('>補足の文</span>') && !partsHtml.includes('g-tooltip')],
  ['Popover renders a collapsed trigger on the server', partsHtml.includes('aria-haspopup="dialog"') && partsHtml.includes('aria-expanded="false"')],
  ['Menu renders a collapsed menu button on the server', partsHtml.includes('aria-haspopup="menu"') && !partsHtml.includes('role="menu"')],
  ['Breadcrumbs marks the current page on the server', partsHtml.includes('aria-current="page"')],
  ['Pagination names each page on the server', partsHtml.includes('aria-label="5ページ目"')],
  ['Steps marks the current step on the server', partsHtml.includes('aria-current="step"')],
  ['TagInput renders named remove buttons on the server', partsHtml.includes('aria-label="営業 を取り除く"')],
  ['PasswordStrength renders the strength word on the server', partsHtml.includes('とても強い')],
]) {
  if (passed) ok(label);
  else fail(label);
}

// ページのテンプレート（P-01〜P-11）。Next.js ではページごとサーバーで描かれる。
// 残り時間（Retry-After）は初めの描画では渡した秒数ちょうどになるので、サーバーとクライアントで食い違わない。
// React は autoComplete・dateTime を書いたままの綴りで出す（HTML の属性名は大文字と小文字を区別しない）。
const site = (...pages) =>
  h(
    SiteProvider,
    {
      name: 'Atlas',
      links: { home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy', contact: '/contact' },
      nav: [{ href: '/pricing', label: '料金' }],
    },
    ...pages,
  );
const render = (page) => renderToString(site(page));
const textOf = (markup) => markup.replace(/<[^>]+>/g, '');
const signInHtml = render(h(SignInPage, { onSubmit: noop }));
const notFoundHtml = render(h(ErrorPage, { status: 404 }));
const unavailableHtml = render(h(ErrorPage, { status: 503, retryAfter: 30 }));
const maintenanceHtml = render(h(MaintenancePage, { start: '2026-10-24T02:00:00+09:00', end: '2026-10-24T04:00:00+09:00', timeZone: 'Asia/Tokyo' }));
const pricingHtml = render(
  h(PricingPage, {
    plans: [
      { id: 'free', name: 'Free', monthly: 0, features: ['3 人まで'], cta: { label: '始める', href: '/signup' } },
      { id: 'pro', name: 'Pro', monthly: 1500, features: ['無制限'], cta: { label: '選ぶ', href: '/signup' }, recommended: true },
    ],
  }),
);
const documentHtml = render(
  h(DocumentPage, {
    title: '利用規約',
    effective: '2026-04-01',
    numbering: 'article',
    sections: ['目的', '定義', '禁止事項'].map((title, index) => ({ id: `s${String(index)}`, title, content: h('p', null, '本文') })),
  }),
);
const faqHtml = render(h(FaqPage, { search: true, items: [{ id: 'q1', question: '解約できますか', answer: 'できます', category: '契約' }] }));
const contactHtml = render(h(ContactPage, { onSubmit: noop }));
const changelogHtml = render(
  h(ChangelogPage, { entries: [{ version: '1.2.0', date: '2026-10-01', title: '検索を速くしました', tags: ['improved'], content: h('p', null, '本文') }] }),
);
for (const [label, passed] of [
  ['SignInPage renders the autofill attributes on the server', /autocomplete="username"/i.test(signInHtml) && /autocomplete="current-password"/i.test(signInHtml)],
  ['ErrorPage renders the status code and the way home on the server', notFoundHtml.includes('404') && notFoundHtml.includes('href="/"')],
  ['ErrorPage starts the Retry-After countdown at the given seconds on the server', textOf(unavailableHtml).includes('30 秒後') && /<button[^>]*aria-disabled="true"/.test(unavailableHtml)],
  ['MaintenancePage writes the schedule in the given time zone on the server', textOf(maintenanceHtml).includes('10月24日(土) 2:00〜4:00 (JST)')],
  ['PricingPage formats prices and marks the recommended plan on the server', pricingHtml.includes('1,500') && pricingHtml.includes('data-recommended')],
  ['DocumentPage renders the table of contents and the effective date on the server', documentHtml.includes('data-toc') && /datetime="2026-04-01"/i.test(documentHtml)],
  ['FaqPage renders the search box and the questions on the server', faqHtml.includes('type="search"') && textOf(faqHtml).includes('解約できますか')],
  ['ContactPage renders the form with autofill attributes on the server', /autocomplete="email"/i.test(contactHtml)],
  ['ChangelogPage renders the entries with their dates on the server', changelogHtml.includes('1.2.0') && /datetime="2026-10-01"/i.test(changelogHtml)],
  ['SiteLayout renders the skip link and a collapsed menu button on the server', pricingHtml.includes('g-skip') && pricingHtml.includes('aria-expanded="false"')],
]) {
  if (passed) ok(label);
  else fail(label);
}

// ページの見出しの帯・データの表（U-25 / U-26）とアプリの枠（P-12）。
// 表はサーバーでも並べ替えた順で描く（並べ替えはクライアントの状態ではなく、初めの描画から決まる）。
const invoices = [
  { id: 'INV-2', amount: 18000 },
  { id: 'INV-1', amount: 15000 },
];
const tableHtml = renderToString(
  h(
    Fragment,
    null,
    h(PageHeader, { title: '請求', breadcrumbs: [{ label: '設定', href: '/settings' }, { label: '請求' }], actions: button('プランを変える') }),
    h(DataTable, {
      label: '請求書',
      rows: invoices,
      getRowId: (row) => row.id,
      columns: [
        { key: 'id', header: '番号', cell: (row) => row.id },
        { key: 'amount', header: '金額', cell: (row) => String(row.amount), sortValue: (row) => row.amount, align: 'end' },
      ],
      defaultSort: { key: 'amount', direction: 'ascending' },
      selectable: true,
    }),
  ),
);
const appHtml = renderToString(
  site(h(AppShell, { nav: [{ title: '設定', items: [{ label: 'メンバー', href: '/app/members' }] }], current: '/app/members', account: { name: '佐藤 葵', menu: [] } }, h('p', null, '本文'))),
);
// コマンドパレット（U-27）。開くキーは effect で付けるので、サーバーでは閉じたダイアログと検索欄だけを描く。
const paletteHtml = renderToString(h(CommandPalette, { items: [{ id: 'members', label: 'メンバー', group: 'ページ' }] }));
for (const [label, passed] of [
  ['PageHeader renders the breadcrumbs, the h1 and the actions on the server', /<nav[^>]*aria-label="パンくずリスト"/.test(tableHtml) && tableHtml.includes('<h1')],
  ['DataTable renders the sorted order and aria-sort on the server', /aria-sort="ascending"/.test(tableHtml) && tableHtml.indexOf('INV-1') < tableHtml.indexOf('INV-2')],
  ['DataTable names the row checkboxes by the row headers on the server', /aria-label="すべて選択"/.test(tableHtml) && /aria-labelledby="[^"]+-row-0"/.test(tableHtml)],
  ['AppShell renders the navigation with the current page and a closed drawer on the server', appHtml.includes('aria-current="page"') && /class="g-app-menu"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*class="g-app-menu"/.test(appHtml)],
  ['CommandPalette renders a closed dialog with its combobox on the server', /<dialog[^>]*class="[^"]*g-command/.test(paletteHtml) && !/<dialog[^>]*\sopen/.test(paletteHtml) && /role="combobox"/.test(paletteHtml)],
]) {
  if (passed) ok(label);
  else fail(label);
}

// グラフ（Q-01〜Q-12）。形は大きさを測らずに決まるので、サーバーで描いた時点で線・棒・弧が最後の形で出ている。
// 器の幅は測れないので 600px とみなして目盛りの文字を間引く（ブラウザで測り直す）。
const ROWS = [
  { month: '1月', revenue: 120, cost: 80 },
  { month: '2月', revenue: 150, cost: 90 },
];
const SERIES = [
  { key: 'revenue', label: '売上' },
  { key: 'cost', label: '費用' },
];
const lineHtml = renderToString(h(LineChart, { label: '月ごとの売上', description: '2月が最大', data: ROWS, x: 'month', series: SERIES, area: true, table: true }));
const barHtml = renderToString(h(BarChart, { label: '内訳', data: ROWS, x: 'month', series: SERIES, stacked: true, layout: 'horizontal' }));
const donutHtml = renderToString(h(DonutChart, { label: 'プラン', data: [{ label: 'Pro', value: 3 }, { label: 'Free', value: 1 }] }));
const widgetsHtml = renderToString(
  h(Fragment, null, h(Sparkline, { label: '売上', data: [1, 3, 2] }), h(BarList, { label: 'ページ', data: [{ label: '/a', value: 2 }] }), h(Gauge, { label: '使用量', value: 72 })),
);
for (const [label, passed] of [
  ['LineChart renders the named group, the lines, the points and the raw-data table on the server', /role="group"[^>]*aria-roledescription="グラフ"|aria-roledescription="グラフ"[^>]*role="group"/.test(lineHtml) && /class="g-viz-line" d="M/.test(lineHtml) && /aria-label="1月: 売上 120、費用 80"/.test(lineHtml) && lineHtml.includes('<table')],
  ['BarChart renders the stacked bars at their final size on the server', /class="g-viz-bar" style="[^"]*width:/.test(barHtml) && barHtml.includes('g-viz-hlabels')],
  ['DonutChart renders the segments, the total and the legend with shares on the server', /class="g-donut-segment"/.test(donutHtml) && donutHtml.includes('75%') && donutHtml.includes('合計')],
  ['Sparkline, BarList and Gauge render their names and values on the server', /role="img" aria-label="売上: 最小 1、最大 3、最新 2"/.test(widgetsHtml) && /aria-label="ページ"/.test(widgetsHtml) && /role="meter"[^>]*aria-valuenow="72"/.test(widgetsHtml)],
]) {
  if (passed) ok(label);
  else fail(label);
}

// アプリの中のページ（P-13〜P-17）。見ている人の時間帯はサーバーでは分からないので、SiteProvider の timeZone が無ければ
// 日時は UTC で描く（hydration を終えてから見ている人の時間帯で描き直す。サーバーとブラウザで文字が食い違わない）。
const settingsHtml = render(
  h(SettingsPage, {
    profile: { name: '佐藤 葵', email: 'aoi@example.com', onSubmit: noop },
    sessions: { items: [{ id: 's1', device: 'MacBook', lastActive: '2026-10-23T00:30:00Z', current: true }], onRevoke: noop },
  }),
);
const membersHtml = render(
  h(MembersPage, {
    members: [
      { id: 'u1', name: '佐藤 葵', email: 'aoi@example.com', role: 'admin' },
      { id: 'u2', name: '鈴木 蓮', email: 'ren@example.com', role: 'editor' },
    ],
    roles: [
      { value: 'admin', label: '管理者' },
      { value: 'editor', label: '編集者' },
    ],
    currentUserId: 'u1',
    onRemove: noop,
  }),
);
const billingHtml = render(
  h(BillingPage, {
    plan: { name: 'Pro', price: 9000, periodEnd: '2026-11-01' },
    invoices: [{ id: '1', number: 'INV-1', date: '2026-10-01', amount: 9000, status: 'paid', href: '/invoices/1.pdf' }],
  }),
);
const onboardingHtml = render(
  h(OnboardingPage, {
    steps: [
      { id: 'workspace', title: 'ワークスペースを作る', content: h('p', null, '本文') },
      { id: 'invite', title: 'メンバーを招待する', content: h('p', null, '本文') },
    ],
    onComplete: noop,
  }),
);
const inviteHtml = render(h(InviteAcceptPage, { workspace: 'Mirai Design', inviter: '佐藤 葵', role: '編集者', signedIn: false }));
for (const [label, passed] of [
  ['SettingsPage renders the sections and writes times in UTC until hydration on the server', /autocomplete="email"/i.test(settingsHtml) && textOf(settingsHtml).includes('2026/10/23 0:30')],
  ['MembersPage leaves the current user without a checkbox on the server', (membersHtml.match(/type="checkbox"/g) ?? []).length === 2 && textOf(membersHtml).includes('鈴木 蓮')],
  ['BillingPage renders the price, the renewal date and the invoices on the server', textOf(billingHtml).includes('月額 ￥9,000') && /datetime="2026-11-01"/i.test(billingHtml) && billingHtml.includes('href="/invoices/1.pdf"')],
  ['OnboardingPage renders the progress with the current step on the server', onboardingHtml.includes('aria-current="step"') && textOf(onboardingHtml).includes('メンバーを招待する')],
  ['InviteAcceptPage sends signed-out visitors to sign in or sign up on the server', inviteHtml.includes('href="/login"') && inviteHtml.includes('href="/signup"')],
]) {
  if (passed) ok(label);
  else fail(label);
}

if (failed) {
  console.error('\nssr smoke test failed.');
  process.exit(1);
}
console.log('\nssr smoke test passed.');
