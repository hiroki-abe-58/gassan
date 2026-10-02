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
  GassanProvider,
  Modal,
  ModalHost,
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

if (failed) {
  console.error('\nssr smoke test failed.');
  process.exit(1);
}
console.log('\nssr smoke test passed.');
