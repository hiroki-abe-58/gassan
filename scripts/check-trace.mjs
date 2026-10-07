#!/usr/bin/env node
/**
 * modal.skill.md §4 の全項目の追跡可能性を機械検証する。
 *
 * 実行: node scripts/check-trace.mjs
 *
 * 「全項目を満たした」は、書いただけでは主張にすぎない。
 * このスクリプトは modal.skill.md §4 の全 ID が docs/traceability.md に
 * 過不足なく現れ、かつ各行が挙げた根拠が実在することを検査する。
 *
 * 検査するもの:
 *   1. §4 の見出しが宣言した件数（例「L. レイヤ／ライフサイクル（14）」）と実際の行数が一致する
 *   2. 合計が TOTAL（下の定数）である
 *   3. traceability.md の ID 集合が §4 の ID 集合と完全一致する（欠落も余剰も不可）
 *   4. 必須度（M/S/O）が 2 つの文書で一致する
 *   5. 根拠トークンが実在する
 *        T:<テスト名>  → tests/ に it('<テスト名>' がある
 *        S:<パス>      → ファイルが存在する
 *        C:<部分文字列> → src/styles.css に含まれる
 *        D:<パス>      → ファイルが存在する
 *        B:<見出し>    → VERIFICATION.md に含まれる
 *        R:<版>        → ROADMAP.md に含まれる
 *        N:<注記>      → 自由記述（ネイティブ委譲）
 *   6. 状態ごとに必要な根拠の種類が揃っている
 *   7. 必須（M）項目がロードマップ送りになっていない
 *   8. tests/ の it() が 1 件も traceability から参照されない、ということがない
 *   9. VERIFICATION.md §3 の検品票（B-1..）と examples/css-check.html のチェックボックスが
 *      ID・順序・件数・項目名・「落ちていたら」の文言まで一致する
 *  10. チェックボックスのラベル配線（aria-labelledby ↔ label[for]）が双方向に閉じている
 *  11. 文書が書いている件数（テスト数・公開 API 数・項目数）が実測と一致する
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = 'modal.skill.md';
const TRACE = 'docs/traceability.md';

const problems = [];
const notes = [];
const fail = (m) => problems.push(m);
const ok = (m) => notes.push(`  ok    ${m}`);

const read = (p) => readFileSync(join(root, p), 'utf8');

/* ------------------------------------------------------------------ *
 * 1. modal.skill.md §4 を読む
 * ------------------------------------------------------------------ */

const skill = read(SKILL);

// §4 の本体だけを切り出す（§5 の手前まで）
const sec4Start = skill.indexOf('## 4. 振る舞いの全列挙');
const sec5Start = skill.indexOf('## 5. ', sec4Start + 1);
if (sec4Start < 0 || sec5Start < 0) {
  fail(`${SKILL}: §4 / §5 の見出しが見つからない`);
}
const sec4 = skill.slice(sec4Start, sec5Start);

/** カテゴリ見出し「### L. レイヤ／ライフサイクル（14）」 */
const headingRe = /^### ([A-Z])\. *([^（(]+)[（(](\d+)[）)]/gm;
/** 表の行「| L-01 | ... | M | ... |」 */
const rowRe = /^\| *([A-Z])-(\d{2}) *\| *([^|]*?) *\| *([MSO]) *\|/gm;

const declared = new Map(); // letter -> { name, count }
for (const m of sec4.matchAll(headingRe)) {
  declared.set(m[1], { name: m[2].trim(), count: Number(m[3]) });
}

const skillItems = new Map(); // "L-01" -> { letter, name, priority }
for (const m of sec4.matchAll(rowRe)) {
  const id = `${m[1]}-${m[2]}`;
  if (skillItems.has(id)) fail(`${SKILL}: ${id} が §4 に重複している`);
  skillItems.set(id, { letter: m[1], name: m[3].trim(), priority: m[4] });
}

// 1-a. 宣言件数と実件数
for (const [letter, { name, count }] of declared) {
  const actual = [...skillItems.values()].filter((i) => i.letter === letter).length;
  if (actual !== count) {
    fail(`${SKILL}: 「${letter}. ${name}（${count}）」の宣言は ${count} 件だが表は ${actual} 行`);
  }
}

// 1-b. 見出しの無いカテゴリが表にないか
for (const { letter } of skillItems.values()) {
  if (!declared.has(letter)) fail(`${SKILL}: カテゴリ ${letter} の見出しが §4 にない`);
}

// 1-c. 合計
const TOTAL = 135;
if (skillItems.size !== TOTAL) {
  fail(`${SKILL}: §4 の項目数が ${skillItems.size} 件（${TOTAL} 件であるべき）`);
} else {
  ok(`${SKILL} §4 に ${TOTAL} 項目、カテゴリ宣言と件数が一致`);
}

/* ------------------------------------------------------------------ *
 * 2. docs/traceability.md を読む
 * ------------------------------------------------------------------ */

if (!existsSync(join(root, TRACE))) {
  fail(`${TRACE} が無い`);
  report();
}

const trace = read(TRACE);

/**
 * 状態の語彙。「実装した」と「書いてあるだけ」を混ぜないために分けてある。
 *
 *   実装        コードがあり、自動テストが挙動を証明している（最も強い）
 *   実機        CSS に実体があり、実ブラウザで実測した
 *   記述        CSS に実体があり、約束した値まで機械検証している。
 *               ただし描画結果は実機でしか確かめられていない（まだ弱い）
 *   未検証      コードはあるが自動テストが無い（弱い。ここが素直な穴）
 *   委譲        ネイティブ側が担う。こちらは何も書かないのが正解
 *   合成        利用側が組み立てる。レシピを示す
 *   ロードマップ 未実装
 */
const STATUSES = new Set(['実装', '実機', '記述', '未検証', '委譲', '合成', 'ロードマップ']);
/** 保証が弱い状態。必須（M）がここに落ちている数を「穴」として報告する */
const WEAK = new Set(['記述', '未検証']);
/** 「| L-01 | M | 実装 | `S:...` `T:...` |」 */
const traceRowRe = /^\| *([A-Z]-\d{2}) *\| *([MSO]) *\| *([^|]*?) *\| *([^|]*?) *\|/gm;

const traceItems = new Map();
for (const m of trace.matchAll(traceRowRe)) {
  const [, id, priority, status, evidenceCell] = m;
  if (traceItems.has(id)) fail(`${TRACE}: ${id} が重複している`);
  const evidence = [...evidenceCell.matchAll(/`([A-Z]):([^`]*)`/g)].map((e) => ({
    kind: e[1],
    value: e[2].trim(),
  }));
  traceItems.set(id, { priority, status, evidence, raw: evidenceCell });
}

// 2-a. ID 集合の一致
const missing = [...skillItems.keys()].filter((id) => !traceItems.has(id));
const extra = [...traceItems.keys()].filter((id) => !skillItems.has(id));
if (missing.length) fail(`${TRACE}: ${missing.length} 件が未記載 → ${missing.join(', ')}`);
if (extra.length) fail(`${TRACE}: §4 に無い ID がある → ${extra.join(', ')}`);
if (!missing.length && !extra.length) ok(`${TRACE} が ${traceItems.size} 項目すべてを覆っている`);

// 2-b. 必須度の一致
for (const [id, item] of traceItems) {
  const s = skillItems.get(id);
  if (s && s.priority !== item.priority) {
    fail(`${id}: 必須度が食い違う（${SKILL}=${s.priority} / ${TRACE}=${item.priority}）`);
  }
}

/* ------------------------------------------------------------------ *
 * 3. 根拠の実在検査
 * ------------------------------------------------------------------ */

// tests/ の it() / test() タイトルを集める
const testDir = join(root, 'tests');
const testTitles = new Set();
for (const f of readdirSync(testDir)) {
  if (!/\.test\.tsx?$/.test(f)) continue;
  const src = readFileSync(join(testDir, f), 'utf8');
  for (const m of src.matchAll(/^\s*(?:it|test)\(\s*(['"`])([\s\S]*?)\1/gm)) {
    testTitles.add(m[2]);
  }
}
if (testTitles.size === 0) fail('tests/ から it() のタイトルを 1 件も取れなかった');

const css = read('src/styles.css');
const verification = existsSync(join(root, 'VERIFICATION.md')) ? read('VERIFICATION.md') : '';
const roadmap = existsSync(join(root, 'ROADMAP.md')) ? read('ROADMAP.md') : '';

const citedTests = new Set();
const statusCount = new Map();

for (const [id, item] of traceItems) {
  if (!STATUSES.has(item.status)) {
    fail(`${id}: 状態「${item.status}」は語彙外（${[...STATUSES].join(' / ')}）`);
  }
  statusCount.set(item.status, (statusCount.get(item.status) ?? 0) + 1);

  if (item.evidence.length === 0) {
    fail(`${id}: 根拠が 1 つも無い（セル: ${item.raw || '空'}）`);
    continue;
  }

  const kinds = new Set(item.evidence.map((e) => e.kind));

  for (const { kind, value } of item.evidence) {
    switch (kind) {
      case 'T':
        if (!testTitles.has(value)) {
          fail(`${id}: テスト "${value}" が tests/ に無い`);
        } else {
          citedTests.add(value);
        }
        break;
      case 'S':
      case 'D':
        if (!existsSync(join(root, value))) fail(`${id}: ファイル ${value} が無い`);
        break;
      case 'C':
        if (!css.includes(value)) fail(`${id}: src/styles.css に "${value}" が無い`);
        break;
      case 'B':
        if (!verification.includes(value)) fail(`${id}: VERIFICATION.md に "${value}" が無い`);
        break;
      case 'R':
        if (!roadmap.includes(value)) fail(`${id}: ROADMAP.md に "${value}" が無い`);
        break;
      case 'N':
        if (!value) fail(`${id}: N: の注記が空`);
        break;
      default:
        fail(`${id}: 未知の根拠種別 "${kind}:"`);
    }
  }

  // 3-a. 状態ごとに要求する根拠
  const need = (k, why) => {
    if (!kinds.has(k)) fail(`${id}: 状態「${item.status}」には ${k}: が要る（${why}）`);
  };
  switch (item.status) {
    case '実装':
      need('T', '自動テストで証明されていない実装は「実装済み」と書かない');
      break;
    case '実機':
      need('C', 'CSS の実体を示す');
      need('B', '実機で何を確認したかを VERIFICATION.md に置く');
      break;
    case '記述':
      need('C', 'CSS のどこに書いたのかを示す');
      need('T', '値そのものは機械検証できる。文字列の存在だけで「書いた」と言わない');
      break;
    case '未検証':
      need('S', 'どのファイルに実装があるのかを示す');
      break;
    case '委譲':
      need('N', '何に委譲したのかを書く');
      break;
    case '合成':
      need('D', '組み立て方のレシピを示す');
      break;
    case 'ロードマップ':
      need('R', 'どの版で入れるかを示す');
      break;
  }

  // 3-b. 必須項目をロードマップ送りにしない
  if (item.priority === 'M' && item.status === 'ロードマップ') {
    fail(`${id}: 必須（M）なのにロードマップ送りになっている`);
  }
}

// 3-c. 必須（M）なのに保証が弱い項目を集める
const weakMust = [...traceItems.entries()]
  .filter(([, i]) => i.priority === 'M' && WEAK.has(i.status))
  .map(([id, i]) => `${id}（${i.status}）`);

// 3-d. どの項目からも参照されないテストを洗い出す（警告ではなく情報）
const orphanTests = [...testTitles].filter((t) => !citedTests.has(t));

/* ------------------------------------------------------------------ *
 * 4. ブラウザ検品票の同期（VERIFICATION.md §3 ↔ examples/css-check.html）
 *
 * 実機でしか確かめられない項目は、文書に書くだけでは消化されない。
 * 検品ページのチェックボックスが原本の写しであることを保証して、
 * 「文書だけ直してページが古い」「ページだけ増やして文書に無い」を防ぐ。
 * ------------------------------------------------------------------ */

const CHECK_PAGE = 'examples/css-check.html';

/** markdown / HTML の装飾を落として比較可能な平文にする */
const plain = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const sec3Start = verification.indexOf('## 3. jsdom では検証できないもの');
const sec3End = verification.indexOf('## 4. ', sec3Start + 1);
if (sec3Start < 0 || sec3End < 0) {
  fail('VERIFICATION.md: §3 / §4 の見出しが見つからない');
}
const sec3 = sec3Start < 0 ? '' : verification.slice(sec3Start, sec3End);

/** 「| B-1 | 項目 | 確認方法 | 落ちていたら |」 */
const bRowRe = /^\| *(B-\d+) *\| *([^|]*?) *\| *([^|]*?) *\| *([^|]*?) *\|$/gm;
const bRows = [...sec3.matchAll(bRowRe)].map((m) => ({
  id: m[1],
  item: plain(m[2]),
  how: plain(m[3]),
  diagnosis: plain(m[4]),
}));

if (bRows.length === 0) {
  fail('VERIFICATION.md §3: 検品票の行を 1 件も取れなかった');
} else {
  // 4-a. 連番が 1 から詰まっていること
  bRows.forEach((r, i) => {
    const want = `B-${i + 1}`;
    if (r.id !== want) fail(`VERIFICATION.md §3: ${i + 1} 行目が ${r.id}（${want} であるべき）`);
  });
  // 4-b. 各列が空でないこと（「落ちていたら」は — を許す）
  for (const r of bRows) {
    if (!r.item) fail(`${r.id}: 項目名が空`);
    if (!r.how) fail(`${r.id}: 確認方法が空`);
    if (!r.diagnosis) fail(`${r.id}: 「落ちていたら」が空（書けないなら — と書く）`);
  }
}

if (!existsSync(join(root, CHECK_PAGE))) {
  fail(`${CHECK_PAGE} が無い`);
} else if (bRows.length > 0) {
  const html = read(CHECK_PAGE);

  const liRe =
    /<li data-item="([^"]*)">\s*<input type="checkbox" id="chk-(B-\d+)" aria-labelledby="([^"]+)">[\s\S]*?<label class="what" id="([^"]+)" for="chk-(B-\d+)">([\s\S]*?)<\/label>\s*<span class="fail">([\s\S]*?)<\/span>/g;
  const page = [...html.matchAll(liRe)].map((m) => ({
    dataItem: plain(m[1]),
    id: m[2],
    ariaLabelledby: m[3],
    labelId: m[4],
    labelFor: m[5],
    label: plain(m[6]),
    fail: plain(m[7]),
  }));

  // 4-c. ID の集合と順序
  const docIds = bRows.map((r) => r.id).join(',');
  const pageIds = page.map((r) => r.id).join(',');
  if (docIds !== pageIds) {
    fail(`${CHECK_PAGE}: 検品票の ID か順序が VERIFICATION.md §3 と違う\n            文書: ${docIds}\n            ページ: ${pageIds}`);
  } else {
    // 4-d. 1 項目ずつ照合
    const seenLabelIds = new Set();
    for (let i = 0; i < bRows.length; i += 1) {
      const doc = bRows[i];
      const el = page[i];
      if (!doc || !el) continue;
      if (el.dataItem !== doc.item) {
        fail(`${doc.id}: 項目名が食い違う（文書「${doc.item}」/ ページ「${el.dataItem}」）`);
      }
      if (!el.label.startsWith(doc.item)) {
        fail(`${doc.id}: 可視ラベルが項目名「${doc.item}」で始まっていない（「${el.label}」）`);
      }
      const wantFail = `落ちていたら: ${doc.diagnosis}`;
      if (el.fail !== wantFail) {
        fail(`${doc.id}: 「落ちていたら」が食い違う（文書「${wantFail}」/ ページ「${el.fail}」）`);
      }
      // 4-e. ラベル配線が双方向に閉じているか
      if (el.ariaLabelledby !== el.labelId) {
        fail(`${doc.id}: aria-labelledby="${el.ariaLabelledby}" が label#${el.labelId} を指していない`);
      }
      if (el.labelFor !== el.id) {
        fail(`${doc.id}: label[for="chk-${el.labelFor}"] がチェックボックス ${el.id} を指していない`);
      }
      if (seenLabelIds.has(el.labelId)) fail(`${doc.id}: ラベル id "${el.labelId}" が重複している`);
      seenLabelIds.add(el.labelId);
    }

    // 4-f. 見出しと進捗表示の件数
    const headingNum = html.match(/検品チェックリスト（(\d+)項目）/);
    if (!headingNum) fail(`${CHECK_PAGE}: 「検品チェックリスト（N項目）」の見出しが無い`);
    else if (Number(headingNum[1]) !== bRows.length) {
      fail(`${CHECK_PAGE}: 見出しが ${headingNum[1]} 項目（実際は ${bRows.length} 項目）`);
    }
    const progress = html.match(/<output id="progress">(\d+) \/ (\d+)<\/output>/);
    if (!progress) fail(`${CHECK_PAGE}: 進捗表示 <output id="progress"> が無い`);
    else if (Number(progress[2]) !== bRows.length) {
      fail(`${CHECK_PAGE}: 進捗の分母が ${progress[2]}（実際は ${bRows.length}）`);
    }

    if (problems.length === 0) {
      ok(`検品票 ${bRows.length} 項目が VERIFICATION.md §3 と ${CHECK_PAGE} で一致`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 5. 文書が書いている件数の照合
 *
 * 「201 件のテストが通る」のような数は、増えるたびに古くなる。
 * 主張している場所を列挙しておき、実測とずれたら落とす。
 * ------------------------------------------------------------------ */

// テスト件数は「ユニークな it() のタイトル数」ではなく出現回数で数える
let testCount = 0;
for (const f of readdirSync(testDir)) {
  if (!/\.test\.tsx?$/.test(f)) continue;
  const s = readFileSync(join(testDir, f), 'utf8');
  testCount += [...s.matchAll(/^\s*(?:it|test)\(\s*['"`]/gm)].length;
}
if (testCount !== testTitles.size) {
  fail(`tests/: it() が ${testCount} 件あるのにタイトルが ${testTitles.size} 種類（重複タイトルは根拠に引けない）`);
}

// 公開 API の数は check-dist.mjs の REQUIRED_EXPORTS を正とする
let exportCount = 0;
const distScript = read('scripts/check-dist.mjs');
const exportBlock = distScript.match(/const REQUIRED_EXPORTS = \[([\s\S]*?)\];/);
if (!exportBlock) fail('scripts/check-dist.mjs: REQUIRED_EXPORTS が読めない');
else exportCount = [...exportBlock[1].matchAll(/'[^']+'/g)].length;

// テストファイル数（VERIFICATION.md §1 が "N passed (M files)" と書いている）
const testFileCount = readdirSync(testDir).filter((f) => /\.test\.tsx?$/.test(f)).length;

/*
 * 文書のコード例の件数。scripts/check-docs.mjs と同じ規則で数える。
 * 片方だけ動かしたときに気づけるよう、ここでも独立に実測する。
 */
let docExampleCount = 0;
const READMES = ['README.md', 'README_ja.md', 'README_zh.md'];
for (const f of [...READMES, ...readdirSync(join(root, 'docs')).filter((n) => n.endsWith('.md')).map((n) => join('docs', n))]) {
  const md = read(f);
  for (const m of md.matchAll(/```(?:tsx|ts|jsx)\n([\s\S]*?)```/g)) {
    if (/^import .*from '(?!@genelab\/gassan)/m.test(m[1])) continue; // 外部依存は対象外
    docExampleCount += 1;
  }
}

/** 文書が主張している数値。[ファイル, 正規表現, 期待値, 説明] */
const CLAIMS = [
  ['ROADMAP.md', /(\d+) テスト \/ 型チェック/, testCount, 'テスト件数'],
  ['ROADMAP.md', /lint → (\d+) tests → trace/, testCount, 'テスト件数'],
  ['ROADMAP.md', /公開 API (\d+) 個/, exportCount, '公開 API 数'],
  ['VERIFICATION.md', /### テストの内訳（(\d+)件/, testCount, 'テスト件数'],
  ['VERIFICATION.md', /`npm run test` \| (\d+) 件/, testCount, 'テスト件数'],
  [CHECK_PAGE, /単体テスト (\d+) 件/, testCount, 'テスト件数'],
  ['VERIFICATION.md', /vitest run\s+… (\d+) passed/, testCount, 'テスト件数'],
  ['VERIFICATION.md', /… \d+ passed \((\d+) files\)/, testFileCount, 'テストファイル数'],
  ['VERIFICATION.md', /check-trace\.mjs.*?（(\d+) 項目が追跡表に実在/, TOTAL, '振る舞いの項目数'],
  ['VERIFICATION.md', /項目が追跡表に実在、(\d+) 件のテストが根拠/, testCount, 'テスト件数'],
  ['VERIFICATION.md', /コード例 (\d+) 件が公開 API/, docExampleCount, '文書のコード例の件数'],
  // README は 3 言語。どれか 1 つだけ直して他が古いまま、を落とす。
  ['README.md', /a table of (\d+) behaviors/, TOTAL, '振る舞いの項目数'],
  ['README.md', /each of the (\d+) behaviors in `modal\.skill\.md`/, TOTAL, '振る舞いの項目数'],
  ['README_ja.md', /(\d+)項目の振る舞い表/, TOTAL, '振る舞いの項目数'],
  ['README_ja.md', /`modal\.skill\.md` の(\d+)項目が/, TOTAL, '振る舞いの項目数'],
  ['README_zh.md', /(\d+) 项行为表/, TOTAL, '振る舞いの項目数'],
  ['README_zh.md', /`modal\.skill\.md` 的 (\d+) 项行为/, TOTAL, '振る舞いの項目数'],
];

let claimsChecked = 0;
for (const [file, re, expected, label] of CLAIMS) {
  if (!existsSync(join(root, file))) {
    fail(`件数照合: ${file} が無い`);
    continue;
  }
  const m = read(file).match(re);
  if (!m) {
    fail(`件数照合: ${file} に ${label} の記述（${re}）が無い。文言を変えたらこの表も直す`);
    continue;
  }
  claimsChecked += 1;
  if (Number(m[1]) !== expected) {
    fail(`件数照合: ${file} の${label}が ${m[1]}（実測 ${expected}）`);
  }
}
if (claimsChecked === CLAIMS.length && problems.length === 0) {
  ok(`文書の件数 ${CLAIMS.length} 箇所が実測と一致（テスト ${testCount} / 公開 API ${exportCount} / 項目 ${TOTAL}）`);
}

/* ------------------------------------------------------------------ *
 * 6. 報告
 * ------------------------------------------------------------------ */

if (problems.length === 0) {
  const byStatus = [...statusCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `${s} ${n}`)
    .join(' / ');
  ok(`状態の内訳: ${byStatus}`);
  ok(`${citedTests.size} 件のテストが根拠として引かれている（全 ${testTitles.size} 件中）`);
  const mCount = [...traceItems.values()].filter((i) => i.priority === 'M').length;
  ok(`必須（M）${mCount} 項目はすべてロードマップ送りになっていない`);
  const proven = [...traceItems.values()].filter((i) => i.status === '実装').length;
  ok(`${proven} 項目が自動テストで証明済み（${Math.round((proven / traceItems.size) * 100)}%）`);
}

function report() {
  console.log('\nchecking requirement traceability\n');
  for (const n of notes) console.log(n);
  if (weakMust.length) {
    console.log(
      `\n  gap   必須（M）だが描画結果が未確認の ${weakMust.length} 項目` +
        `（値は機械検証済み。描画は実機 CI で埋める / ROADMAP v0.4.0）:`
    );
    for (const w of weakMust) console.log(`          - ${w}`);
  }
  if (orphanTests.length) {
    console.log(`\n  info  どの項目からも引かれていないテスト ${orphanTests.length} 件:`);
    for (const t of orphanTests.slice(0, 12)) console.log(`          - ${t}`);
    if (orphanTests.length > 12) console.log(`          ... 他 ${orphanTests.length - 12} 件`);
  }
  if (problems.length) {
    console.log('\n  問題:');
    for (const p of problems) console.log(`  FAIL  ${p}`);
    console.log(`\ntraceability check failed (${problems.length}).\n`);
    process.exit(1);
  }
  console.log('\ntraceability check passed.\n');
}

report();
