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

const BUDGETS = {
  'dist/index.js': 22 * 1024,
  'dist/index.cjs': 22 * 1024,
  'dist/styles.css': 6 * 1024,
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
  'KasaneProvider',
  // fail-closed の契約そのもの。dist から消えたら G-12 が黙って壊れる。
  'selectBlockers',
  'DEFAULT_UNRESOLVED_GATE_MESSAGE',
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
    '@layer kasane.reset',
    '@starting-style',
    'allow-discrete',
    'overlay',
    'prefers-reduced-motion',
    'prefers-reduced-transparency',
    'forced-colors',
    // L-07。overlay 非対応環境の退出 fallback。落ちると退出が一瞬で消える。
    '[data-exiting]',
    '.k-chart',
  ];
  const missing = required.filter((token) => !css.includes(token));
  if (missing.length > 0) fail(`styles.css is missing: ${missing.join(', ')}`);
  else console.log('  ok    styles.css keeps the required at-rules');
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
