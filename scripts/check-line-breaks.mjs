#!/usr/bin/env node
/**
 * ドキュメントサイトの折り返しを、実ブラウザで実測して検査する（W-01〜W-05 の実機側）。
 *
 *   npm run site:build && npm run check:breaks
 *
 * ビルド済みのサイト（site/dist）を vite preview で配り、ヘッドレス Chrome で
 * 全ページ（部品のページは API とアクセシビリティのタブも）× 言語 × 画面幅で開き、
 * **実際に改行された位置を 1 文字ずつ測る**。デモのモーダル・トップバーのポップオーバー・
 * スマホのナビも開いて測る。
 *
 * 改行してよいのは次の位置だけ。それ以外で折れていたら、その要素と前後の文字を出して落とす。
 *   - <wbr>（Phrase が置いた文節・語の切れ目）
 *   - 空白（ただし「Esc｜を」「30｜日」のように、英数字の後で付属語や単位が行頭に立つものは除く）
 *   - 句読点・閉じ括弧・中黒などの後、開き括弧の前
 *
 * 「規約を確認す｜る」のような崩れは、Phrase を通っていない文字列（サイトの素のボタンなど）か、
 * Phrase の規則の穴で起きる。ただし、行の中に改行してよい位置が 1 つも無いまま折れたものは、
 * 1 行に収まらない塊を W-02 の安全弁が折ったものなので、崩れに数えない（forced）。
 * 文字が行の器の右端からはみ出したもの（overflow）は崩れに数える。
 * 文書そのものが画面より広くなり、横にスクロールできてしまうもの（scroll。WCAG 1.4.10）も崩れに数える。
 * jsdom はレイアウトを持たないので、この検査は単体テストでは書けない。
 *
 * 環境変数:
 *   CHROME_PATH   Chrome の実行ファイル（既定: macOS の標準の場所、無ければ google-chrome）
 *   LANGS         既定 ja,zh-Hans,zh-Hant,ko,en,th（英語とタイ語のページにも、原文の日本語が載る）
 *   WIDTHS        既定 320,375,768,1280
 *   PAGES         パスの前方一致で絞る（例: /components/field,/）
 *   SKIP_MODALS   1 ならデモのモーダルを開かない
 *   BASE          既に配っているサイトの URL（指定すると preview を立てない）
 *   VERBOSE       1 なら安全弁で折れた位置（forced）も一覧に出す
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

if (typeof WebSocket !== 'function') {
  console.error('Node 22 以上が要る（組み込みの WebSocket で Chrome DevTools Protocol を話すため）。');
  process.exit(2);
}

const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME = process.env.CHROME_PATH ?? (existsSync(MAC_CHROME) ? MAC_CHROME : 'google-chrome');
const LANGS = (process.env.LANGS ?? 'ja,zh-Hans,zh-Hant,ko,en,th').split(',');
const WIDTHS = (process.env.WIDTHS ?? '320,375,768,1280').split(',').map(Number);
const MODAL_WIDTHS = [375, 1280].filter((w) => WIDTHS.includes(w));
const PAGE_FILTER = process.env.PAGES ? process.env.PAGES.split(',') : null;
const PREVIEW_PORT = 4300 + Math.floor(Math.random() * 500);
const DEBUG_PORT = 9300 + Math.floor(Math.random() * 500);

/* -------------------------------------------------------------------------- */
/* 調べるページ                                                                */
/* -------------------------------------------------------------------------- */

const routes = [...readFileSync('site/routes.tsx', 'utf8').matchAll(/path: '([^']+)', key: '(\w+)', section: '(\w+)'/g)]
  .map((m) => ({ path: m[1], section: m[3] }))
  .filter((r) => r.path !== '/404');
// ページのテンプレートの見本（#/preview/<name>）。iframe の中で読まれるが、1 枚のページとして直に開いて測る。
const previews = [
  ...(readFileSync('site/previews/TemplatePreview.tsx', 'utf8').match(/export const PREVIEWS = \[([\s\S]*?)\] as const/)?.[1] ?? '').matchAll(/'([^']+)'/g),
].map((m) => `/preview/${m[1]}`);
const paths = [
  ...routes.flatMap(({ path, section }) => (section === 'components' || section === 'forms' ? [path, `${path}/api`, `${path}/a11y`] : [path])),
  ...previews,
];
const targets = PAGE_FILTER ? paths.filter((p) => PAGE_FILTER.some((f) => (f === '/' ? p === '/' : p.startsWith(f)))) : paths;

/* -------------------------------------------------------------------------- */
/* ページの中で走らせる測定                                                    */
/* -------------------------------------------------------------------------- */

/**
 * scope（CSS セレクタ）の中の文字を 1 文字ずつ測り、許されない位置の改行を返す。
 * 同じ「行の器」（ブロック、または flex / grid の項目）の中で、次の文字が下の行へ移ったところが改行。
 */
const AUDIT = `(${(scope) => {
  const root = scope ? document.querySelector(scope) : document.body;
  if (!root) return [];
  const CJK = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Script=Hangul}ー]/u;
  const LATIN = /[A-Za-z0-9]/;
  const HIRAGANA = /\p{Script=Hiragana}/u;
  const HAN_KANA = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
  const SENTENCE_END = /[,.;:!?、。，．！？」』）〕】〉》］｝]/;
  const AFTER_OK = /[\s、。，．,.!?！？)）\]］}｝」』】〕〉》〙〗・·:;：；%％…‥/／＼|｜=＝+＋〜～\-–—→]/;
  const BEFORE_OK = /[\s(（[［{｛「『【〔〈《〘〖←→–—]/;
  // [data-mode="browser"] は折り返しのページの「ブラウザ任せ」の見本。崩れて見えるのが正しい。
  const SKIP = 'pre, textarea, input, select, script, style, svg, math, .g-sr-only, .s-sr-only, [data-mode="browser"]';
  // 文中の code は測る（前後の日本語との境目を正しい位置で見るため）が、code の中どうしの改行は数えない。
  const CODE = 'code, kbd, samp';

  const contexts = new Map();
  const contextOf = (node) => {
    if (contexts.has(node)) return contexts.get(node);
    let child = node;
    let el = node.parentElement;
    let found = el;
    while (el && el !== document.documentElement) {
      const display = getComputedStyle(el).display;
      if (display === 'inline' || display === 'contents') {
        child = el;
        el = el.parentElement;
        continue;
      }
      found = display.includes('flex') || display.includes('grid') ? child : el;
      break;
    }
    contexts.set(node, found);
    return found;
  };
  const describe = (node) => {
    const parts = [];
    for (let el = node.parentElement; el && parts.length < 4 && el !== document.body; el = el.parentElement) {
      const cls = [...el.classList].slice(0, 2).join('.');
      parts.unshift(cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase());
    }
    return parts.join(' > ');
  };

  const findings = [];
  const range = document.createRange();
  const between = document.createRange();

  /** prev と cur の境目で改行してよいか。code の中どうし（spaceOnly）は空白だけを数える。 */
  const breakable = (prev, cur, spaceOnly) => {
    let gapText;
    let hasWbr = false;
    if (prev.node === cur.node) {
      gapText = cur.node.data.slice(prev.i + prev.ch.length, cur.i);
    } else {
      between.setStart(prev.node, prev.i + prev.ch.length);
      between.setEnd(cur.node, cur.i);
      gapText = between.toString();
      hasWbr = between.cloneContents().querySelector('wbr, br') !== null;
    }
    const atSpace = /\s/.test(gapText);
    if (spaceOnly) return atSpace;
    // 空白で折れても、英数字・記号の後で付属語が行頭に立つ（「Esc｜を押す」「close()｜した」）、
    // 数と単位が離れる（「30｜日後」「第 2｜层」）のは崩れとして数える。
    // 「overlay｜プロパティ」は語の切れ目、韓国語は空白が語の切れ目なので数えない。
    const orphaned =
      atSpace &&
      !CJK.test(prev.ch) &&
      !SENTENCE_END.test(prev.ch) &&
      (HIRAGANA.test(cur.ch) || (/\d/.test(prev.ch) && HAN_KANA.test(cur.ch)));
    return !orphaned && (atSpace || hasWbr || AFTER_OK.test(prev.ch) || BEFORE_OK.test(cur.ch));
  };

  // 行の器の右端（はみ出しの検出用）。スクロールや省略記号で切る器は、はみ出しが仕様なので見ない。
  const rights = new Map();
  const rightOf = (context) => {
    // flex の器に直接入った文字列は、行の器が文字ノード自身（無名の flex 項目）になる。右端は親で見る
    const el = context.nodeType === Node.ELEMENT_NODE ? context : context.parentElement;
    if (!rights.has(el)) {
      const style = getComputedStyle(el);
      const clips = style.overflowX !== 'visible' || style.textOverflow === 'ellipsis';
      const right = el.getBoundingClientRect().right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
      rights.set(el, clips ? Infinity : right);
    }
    return rights.get(el);
  };
  const overflowed = new Set();
  const snippet = (prev, cur) =>
    `${prev.node.data.slice(Math.max(0, prev.i - 10), prev.i + prev.ch.length)}｜${cur.node.data.slice(cur.i, cur.i + 10)}`.replace(/\s+/g, ' ');

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.data.trim() && !n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  let prev = null;
  // 今の行の中に、改行してよい境目が 1 つでもあったか。無いまま折れたら、1 行に収まらない塊を
  // ブラウザが安全弁（W-02）で折ったもので、崩れではない（狭い表の欄の長い文節、行より長いコードと助詞）。
  let lineHasBreak = false;
  // 今の行の最初の文字。行の頭から折れ目までが 1 つの code の中なら、code と後ろの付属語を
  // 同じ行に置く余地は無い（「`<div className="overflow-y-auto">`｜だけで」）。これも安全弁に数える。
  let lineStart = null;
  const fillsLine = (prev, cur) => {
    const code = prev.node.parentElement.closest(CODE);
    return code !== null && !code.contains(cur.node) && lineStart !== null && code.contains(lineStart.node);
  };
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    // nowrap の中は折れないが、前後との境目は測る（.g-nobr の直後で折れていないか）ので飛ばさない
    if (getComputedStyle(node.parentElement).whiteSpace === 'pre') {
      prev = null;
      continue;
    }
    const context = contextOf(node);
    const inCode = node.parentElement.closest(CODE) !== null;
    const text = node.data;
    for (let i = 0; i < text.length; ) {
      const ch = String.fromCodePoint(text.codePointAt(i));
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const rect = range.getClientRects()[0];
      if (rect && rect.width > 0 && rect.height > 0 && !/\s/.test(ch)) {
        const cur = { node, i, ch, top: rect.top, bottom: rect.bottom, context, inCode };
        if (prev && prev.context === context) {
          const wrapped = cur.top >= prev.top + (prev.bottom - prev.top) * 0.6;
          const codePair = prev.inCode && inCode;
          if (!wrapped) {
            if (!lineHasBreak) lineHasBreak = breakable(prev, cur, codePair);
          } else {
            // タイ語などはブラウザが辞書で語の切れ目を探して折る。その切れ目はここでは分からないので数えない
            const script = CJK.test(prev.ch) || CJK.test(ch) ? 'cjk' : LATIN.test(prev.ch) && LATIN.test(ch) ? 'latin' : null;
            if (script && !codePair && !breakable(prev, cur, false)) {
              const kind = !lineHasBreak || fillsLine(prev, cur) ? 'forced' : script;
              findings.push({ kind, text: snippet(prev, cur), where: describe(node) });
            }
            lineHasBreak = false;
            lineStart = cur;
          }
        } else {
          lineHasBreak = false;
          lineStart = cur;
        }
        if (rect.right > rightOf(context) + 1 && !overflowed.has(context)) {
          overflowed.add(context);
          findings.push({ kind: 'overflow', text: snippet(prev ?? cur, cur), where: describe(node) });
        }
        prev = cur;
      }
      i += ch.length;
    }
  }
  return findings;
}})`;

/**
 * 文書が画面より広くなっていないか（横スクロールが出ないか）。出ていれば、はみ出している要素のうち、
 * どのスクロールの器にも切り抜かれていない、いちばん外側のものを 3 つまで返す。
 * 切り抜く器は親ではなく「位置の基準」をたどって探す。position: absolute の要素（読み上げ専用の文字など）は、
 * position を持たないスクロールの器の外の祖先を基準に置かれ、器に切り抜かれずに文書を広げる。
 */
const PAGE_SCROLL = `(${() => {
  const root = document.documentElement;
  const width = root.clientWidth;
  if (root.scrollWidth <= width) return [];
  const containerOf = (el) => {
    const style = getComputedStyle(el);
    if (style.position === 'fixed') return undefined; // 画面に固定したもの（と top layer）は文書を広げない
    if (style.position !== 'absolute') return el.parentElement;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.position !== 'static' || s.transform !== 'none' || s.contain.includes('paint')) return a;
    }
    return root;
  };
  /** 文書の広さに効くか。途中で横を切る器に入っていれば効かない。固定したものの中も効かない。 */
  const widens = (el) => {
    for (let a = containerOf(el); ; a = containerOf(a)) {
      if (a === undefined) return false;
      if (a === null || a === root || a === document.body) return true;
      if (getComputedStyle(a).overflowX !== 'visible') return false;
    }
  };
  const name = (el) => {
    const cls = [...el.classList].slice(0, 2).join('.');
    return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
  };
  const culprits = [];
  for (const el of document.body.querySelectorAll('*')) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.right <= width + 1 || !widens(el)) continue;
    const parent = containerOf(el);
    if (parent && parent !== root && parent.getBoundingClientRect().right > width + 1 && widens(parent)) continue;
    culprits.push(`${name(el)} (${parent && parent !== root ? `in ${name(parent)}, ` : ''}right ${String(Math.round(rect.right))}px)`);
    if (culprits.length === 3) break;
  }
  return [{ kind: 'scroll', text: `scrollWidth ${String(root.scrollWidth)} > ${String(width)}`, where: culprits.join(' / ') || '?' }];
}})()`;

/* -------------------------------------------------------------------------- */
/* Chrome と preview                                                          */
/* -------------------------------------------------------------------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const children = [];
const cleanup = () => {
  for (const child of children) child.kill('SIGKILL');
};
process.on('exit', cleanup);

let base = process.env.BASE;
if (!base) {
  if (!existsSync('site/dist/index.html')) {
    console.error('site/dist が無い。先に npm run site:build を走らせる。');
    process.exit(2);
  }
  // npx を通すと kill が当たるのは npm だけで、その子の vite preview が残り続ける。node で vite を直に起動する
  children.push(
    spawn(process.execPath, [join('node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--config', 'vite.site.config.ts', '--port', String(PREVIEW_PORT), '--strictPort'], {
      stdio: 'ignore',
    }),
  );
  base = `http://localhost:${String(PREVIEW_PORT)}/`;
  for (let i = 0; i < 60; i += 1) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {
      /* 立ち上がるまで待つ */
    }
    await sleep(250);
  }
}

const profile = mkdtempSync(join(tmpdir(), 'gassan-breaks-'));
children.push(
  spawn(
    CHROME,
    [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--use-mock-keychain',
      '--password-store=basic',
      '--hide-scrollbars',
      '--no-sandbox',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${String(DEBUG_PORT)}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  ),
);
// 殺した直後の Chrome がまだプロファイルに書いていて ENOTEMPTY になることがあるので、少し待って再試行する
process.on('exit', () => rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }));

let pages;
for (let i = 0; i < 60; i += 1) {
  try {
    pages = await (await fetch(`http://127.0.0.1:${String(DEBUG_PORT)}/json/list`)).json();
    break;
  } catch {
    await sleep(250);
  }
}
const target = pages?.find((p) => p.type === 'page');
if (!target) {
  console.error(`Chrome が起動しない（${CHROME}）。CHROME_PATH で場所を指定する。`);
  process.exit(2);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    seq += 1;
    pending.set(seq, resolve);
    ws.send(JSON.stringify({ id: seq, method, params }));
  });
// ページの中の例外は投げ直す。握りつぶすと、測定が落ちたのに「崩れ 0 件」で通ってしまう。
const evaluate = async (expression) => {
  const { result } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const thrown = result?.exceptionDetails;
  if (thrown) throw new Error(thrown.exception?.description ?? thrown.text);
  return result?.result?.value;
};
const setWidth = (width) =>
  send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
/**
 * 開き直して、新しい文書が描き終わるまで待つ。
 * 決め打ちの待ち時間だと、重いページ（仕様の全項目）の読み込み中に前のページを測ってしまう
 * （初回の実行で、仕様のページの文字列がほかのページの結果に混ざった）。
 * 読み込み前に印を置き、印が消えて（＝別の文書になって）ページの見出しが出るまで待つ。
 */
let visit = 0;
const open = async (hash) => {
  // 毎回クエリを変えて、別の文書として読み込ませる。ハッシュだけの移動に reload を続けると、
  // 移動が確定する前に読み込み直して前のページが出ることがある（2 回目の実行で見つけた）。
  visit += 1;
  await send('Page.navigate', { url: `${base}?visit=${String(visit)}#${hash}` });
  for (let i = 0; i < 100; i += 1) {
    await sleep(100);
    // ドキュメントのページは見出し（#page-title）、テンプレートの見本はページの器（.g-page）が出たら描き終わり。
    const ready = await evaluate(
      `location.search === '?visit=${String(visit)}' && document.readyState === 'complete' && !!(document.getElementById('page-title') || document.querySelector('.g-page'))`,
    );
    if (ready) break;
  }
  await evaluate('document.fonts.ready.then(() => true)');
  await sleep(150);
};
const audit = (scope = '') => evaluate(`${AUDIT}(${JSON.stringify(scope)})`);
const key = async (k, code, vk) => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code, windowsVirtualKeyCode: vk });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk });
};

/* -------------------------------------------------------------------------- */
/* 巡回                                                                       */
/* -------------------------------------------------------------------------- */

await send('Runtime.enable');
await send('Page.enable');

const seen = new Map();
const record = (lang, where, width, findings) => {
  for (const f of findings ?? []) {
    const id = `${lang}|${where}|${f.kind}|${f.text}`;
    const entry = seen.get(id) ?? { lang, page: where, ...f, widths: [] };
    if (!entry.widths.includes(width)) entry.widths.push(width);
    seen.set(id, entry);
  }
};
const hashOf = (lang, path) => (lang === 'ja' ? path : `/${lang}${path === '/' ? '' : path}`);

let views = 0;
for (const lang of LANGS) {
  for (const path of targets) {
    await setWidth(WIDTHS[0] ?? 1280);
    await open(hashOf(lang, path));
    for (const width of WIDTHS) {
      await setWidth(width);
      await sleep(120);
      record(lang, path, width, await audit());
      record(lang, path, width, await evaluate(PAGE_SCROLL));
      views += 1;
    }

    // デモのモーダル。開くたびに読み込み直して、前のデモの状態を持ち越さない。
    if (process.env.SKIP_MODALS !== '1' && !path.endsWith('/api') && !path.endsWith('/a11y')) {
      const count = await evaluate("document.querySelectorAll('.s-example-stage > button.s-btn, .s-example-stage .s-kind-demo > button.s-btn, .s-kinds button.s-btn').length");
      for (let n = 0; n < (count ?? 0); n += 1) {
        for (const width of MODAL_WIDTHS) {
          await setWidth(width);
          await open(hashOf(lang, path));
          const opened = await evaluate(`(() => {
            const buttons = document.querySelectorAll('.s-example-stage > button.s-btn, .s-example-stage .s-kind-demo > button.s-btn, .s-kinds button.s-btn');
            const button = buttons[${String(n)}];
            if (!button) return false;
            button.click();
            return true;
          })()`);
          if (!opened) continue;
          await sleep(500);
          record(lang, `${path} (demo ${String(n + 1)})`, width, await audit('dialog.g-dialog[open]'));
          views += 1;
          await key('Escape', 'Escape', 27);
        }
      }
    }
  }

  // トップバーのポップオーバー（テーマ・言語）と、スマホのナビ
  for (const width of [375, 1280].filter((w) => WIDTHS.includes(w))) {
    await setWidth(width);
    await open(hashOf(lang, '/'));
    for (const [label, button, panel] of [
      ['theme', '.s-theme-btn:not(.s-lang-btn)', '.s-theme-panel:not(.s-lang-panel)'],
      ['language', '.s-lang-btn', '.s-lang-panel'],
      ['menu', '.s-menu-btn', 'dialog.g-dialog[open]'],
    ]) {
      const clicked = await evaluate(`(() => { const b = document.querySelector('${button}'); if (!b || !b.offsetParent) return false; b.click(); return true; })()`);
      if (!clicked) continue;
      await sleep(400);
      record(lang, `(${label})`, width, await audit(panel));
      views += 1;
      await key('Escape', 'Escape', 27);
      await sleep(200);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 報告                                                                       */
/* -------------------------------------------------------------------------- */

const all = [...seen.values()];
const of = (kind) => all.filter((f) => f.kind === kind);
const [cjk, overflow, scroll, latin, forced] = ['cjk', 'overflow', 'scroll', 'latin', 'forced'].map(of);
const LABEL = { cjk: 'FAIL', overflow: 'FAIL', scroll: 'FAIL', latin: 'warn', forced: 'W-02' };
console.log(`checked ${String(views)} views (${LANGS.join(', ')} × ${String(targets.length)} pages × ${WIDTHS.join('/')} px)`);
for (const f of [...cjk, ...overflow, ...scroll, ...latin, ...(process.env.VERBOSE === '1' ? forced : [])]) {
  const what = f.kind === 'cjk' || f.kind === 'latin' || f.kind === 'forced' ? f.text : `${f.kind} ${f.text}`;
  console.log(`  ${LABEL[f.kind]}  [${f.lang}] ${f.page} @${f.widths.join('/')}  ${what}   (${f.where})`);
}
if (errors.length) console.log(`  page errors: ${String(errors.length)}\n    ${errors.slice(0, 5).join('\n    ')}`);
console.log(
  `${String(cjk.length)} CJK breaks outside phrase boundaries, ${String(overflow.length)} overflows, ` +
    `${String(scroll.length)} pages wider than the screen, ` +
    `${String(latin.length)} mid-word Latin breaks, ${String(forced.length)} forced breaks (W-02, VERBOSE=1 で一覧)`,
);
ws.close();
cleanup();
process.exit(cjk.length + overflow.length + scroll.length > 0 ? 1 : 0);
