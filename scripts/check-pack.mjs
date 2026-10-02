/**
 * 公開前の検品。「npm publish した瞬間に気づく」類の事故を、publish する前に落とす。
 *
 *   node scripts/check-pack.mjs
 *
 * check-dist.mjs が「ビルド成果物の中身」を見るのに対し、
 * こちらは「npm レジストリに何が載るか」を見る。責務が違うので分けてある。
 *
 * 見ているもの:
 *  - スコープ付きパッケージなのに publishConfig.access が無い（publish が 402 で落ちる）
 *  - LICENSE が入っていない（license フィールドだけ書いて実体が無い状態）
 *  - 同梱文書どうしの相対リンクが切れている（npm のパッケージページで 404 になる）
 *  - exports マップの参照先が実在しない（インストール後に import が失敗する）
 *  - src/ や tests/ の混入
 *  - runtime dependencies の混入（依存ゼロという約束の担保）
 *  - CHANGELOG に今のバージョンの節があるか
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`  FAIL  ${message}`);
};
const pass = (message) => console.log(`  ok    ${message}`);

console.log('checking publishable package');

// --- 1. tarball に何が入るかを npm 自身に聞く -------------------------------
// --dry-run なので実際には publish も pack もしない。
// --ignore-scripts: dist は verify の前段（npm run build）で作ってある。見たいのは同梱物だけである。
// ただし npm 10 は --ignore-scripts を付けても pack で prepare（tsup）を走らせ、そのログが
// 標準出力の先頭に混ざる（npm 11 では起きない。CI の Node 20 / 22 は npm 10）。
// JSON は出力の末尾にあるので、行頭の '[' から読む。
let files = [];
try {
  const raw = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const start = raw.search(/^\[/m);
  const report = JSON.parse(start >= 0 ? raw.slice(start) : raw);
  files = (report[0]?.files ?? []).map((entry) => entry.path);
} catch (error) {
  fail(`npm pack --dry-run failed: ${error.message}`);
}

if (files.length === 0) {
  fail('tarball is empty');
} else {
  const REQUIRED = [
    'package.json',
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'ROADMAP.md',
    'VERIFICATION.md',
    'modal.skill.md',
    'docs/requirements-audit.md',
    'docs/control-recipes.md',
    'docs/library-landscape.md',
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/index.d.cts',
    'dist/styles.css',
    'dist/styles.source.css',
  ];
  const missing = REQUIRED.filter((name) => !files.includes(name));
  if (missing.length > 0) fail(`tarball is missing: ${missing.join(', ')}`);
  else pass(`${REQUIRED.length} required files are in the tarball`);

  // 出荷物にソースやテストが混ざっていないこと。
  const leaked = files.filter(
    (name) =>
      name.startsWith('src/') ||
      name.startsWith('tests/') ||
      name.startsWith('examples/') ||
      name.startsWith('scripts/') ||
      name.startsWith('.github/'),
  );
  if (leaked.length > 0) fail(`these should not ship: ${leaked.join(', ')}`);
  else pass('no src / tests / examples / scripts leaked');
}

// --- 2. スコープ付きは access: public を明示しないと publish できない -------
if (pkg.name.startsWith('@')) {
  if (pkg.publishConfig?.access === 'public') {
    pass('publishConfig.access is "public" (scoped package)');
  } else {
    fail(
      'scoped package without publishConfig.access="public". ' +
        'npm publish will fail with 402 Payment Required.',
    );
  }
}

// --- 3. license フィールドと LICENSE の実体 ---------------------------------
if (!pkg.license) fail('no license field');
else if (!existsSync('LICENSE')) fail(`license is "${pkg.license}" but LICENSE file is missing`);
else pass(`license ${pkg.license} with LICENSE file`);

// --- 4. npm 上でのリンク切れ -----------------------------------------------
// 相対リンクは npm のパッケージページでもそのまま解決されるため、
// 同梱していない文書を指していると 404 になる。README だけでなく、
// 同梱するすべての Markdown を対象にする（CHANGELOG → ROADMAP のような連鎖があるため）。
const shippedMarkdown = files.filter((name) => name.endsWith('.md'));
const brokenLinks = [];
for (const doc of shippedMarkdown) {
  const text = readFileSync(doc, 'utf8');
  // 画像・アンカー・外部 URL は対象外。同梱物への相対リンク（./ と ../）だけを見る。
  // 解決は「その文書のあるディレクトリ」基準。docs/ の中の ./x.md は docs/x.md を指す。
  for (const match of text.matchAll(/(?<!!)\]\((\.{1,2}\/[^)#\s]+)/g)) {
    const raw = match[1];
    const target = posix.normalize(posix.join(posix.dirname(doc), raw));
    if (target.startsWith('../') || !files.includes(target)) brokenLinks.push(`${doc} -> ${raw}`);
  }
}
if (brokenLinks.length > 0) {
  fail(`relative links point outside the tarball:\n          ${brokenLinks.join('\n          ')}`);
} else {
  pass(`relative links in ${shippedMarkdown.length} shipped markdown files all resolve`);
}

// --- 5. exports マップの参照先が実在するか ----------------------------------
const targets = [];
const collect = (value) => {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
collect(pkg.exports);
const deadTargets = [...new Set(targets)].filter(
  (target) => !existsSync(target.replace(/^\.\//, '')),
);
if (deadTargets.length > 0) fail(`exports point at missing files: ${deadTargets.join(', ')}`);
else pass(`${new Set(targets).size} export targets exist on disk`);

// --- 5b. dual-package の型解決 ------------------------------------------
// exports の "types" を import/require の外側に1つだけ置くと、
// require 解決でも ESM 用の .d.ts が返る。package.json が type:module のとき、
// moduleResolution: node16 / nodenext の CJS 利用者は TS1479 で落ちる。
// 条件ごとに .d.ts / .d.cts を出し分けているかを毎回確かめる。
const rootExport = pkg.exports?.['.'];
if (!rootExport || typeof rootExport !== 'object') {
  fail('exports["."] is not a conditions object');
} else if ('types' in rootExport) {
  fail('exports["."].types is hoisted; move it inside import/require (breaks node16 CJS consumers)');
} else {
  const importTypes = rootExport.import?.types;
  const requireTypes = rootExport.require?.types;
  if (importTypes !== './dist/index.d.ts') fail(`exports["."].import.types is ${importTypes}`);
  else if (requireTypes !== './dist/index.d.cts') fail(`exports["."].require.types is ${requireTypes}`);
  else pass('types are split per condition (.d.ts for import / .d.cts for require)');
}

// --- 6. 依存ゼロの約束 ------------------------------------------------------
const deps = Object.keys(pkg.dependencies ?? {});
if (deps.length > 0) fail(`runtime dependencies found: ${deps.join(', ')}`);
else pass('zero runtime dependencies');

if (!pkg.peerDependencies?.react) fail('react is not declared as a peer dependency');
else pass(`react peer range ${pkg.peerDependencies.react}`);

// --- 7. CHANGELOG に今のバージョンがあるか ----------------------------------
if (!existsSync('CHANGELOG.md')) {
  fail('CHANGELOG.md is missing');
} else {
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  if (changelog.includes(`[${pkg.version}]`)) pass(`CHANGELOG has an entry for ${pkg.version}`);
  else fail(`CHANGELOG has no entry for ${pkg.version}`);
}

// --- 8. メタ情報 ------------------------------------------------------------
const missingMeta = ['description', 'repository', 'homepage', 'bugs', 'author'].filter(
  (field) => !pkg[field],
);
if (missingMeta.length > 0) fail(`package.json has no: ${missingMeta.join(', ')}`);
else pass('metadata present (description / repository / homepage / bugs / author)');

if (failed) {
  console.error('\npack check failed.');
  process.exit(1);
}
console.log('\npack check passed.');
