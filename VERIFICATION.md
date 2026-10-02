# 検証レポート

対象: `@genelab/kasane` v0.1.0（公開前の追補を含む）
日付: 2026-09-29
環境: macOS 15.6.1 / Node v18.20.8 / npm 10.8.2 / TypeScript 5.9.3 / Vitest 3.2.7 / React 19 / jsdom 26
実ブラウザ計測: Google Chrome 154.0.8037.58（headless、CDP 経由。第1-2節）

---

## 1. 実行した検証

すべてこのリポジトリで実際に走らせた結果である。

```
npm run verify                        … EXIT 0
  ├─ tsc --noEmit                     … エラー 0
  ├─ eslint .                         … エラー 0 / 警告 0
  ├─ vitest run                       … 387 passed (17 files)
  ├─ node scripts/check-trace.mjs     … 8 項目すべて ok（135 項目が追跡表に実在、387 件のテストが根拠として結線）
  ├─ node scripts/check-docs.mjs      … 文書のコード例 20 件が公開 API でコンパイル（外部依存の 3 件は対象外と明示）
  ├─ tsup                             … ESM / CJS / d.ts / d.cts 生成成功
  ├─ node scripts/check-dist.mjs      … 8 項目すべて ok（公開 API 33 個、文書の実測サイズ 4 箇所がビルドと一致）
  ├─ node scripts/ssr-smoke.mjs       … 23 項目すべて ok（dist 経由の data-* 透過 8 項目を含む）
  └─ node scripts/check-pack.mjs      … 11 項目すべて ok（同梱必須 16 ファイル、同梱 Markdown 9 本のリンク）

npm run check:consumer                … 5 項目すべて ok（ネットワークが要るため verify とは別。Modal.Chart の型と export も検査）
npm run build:demo                    … EXIT 0（48 モジュール、JS gzip 83.70 KB / CSS gzip 4.73 KB）
```

検証は3層に分かれている。**層が上がるほど、下の層では原理的に見つからない事故を捕まえる。**

| 層 | 見るもの | ここでしか捕まらない事故 |
|---|---|---|
| `vitest`（jsdom） | コンポーネントの振る舞い | アクセシブルネーム、ゲートの論理和、close 理由の分類 |
| `check-dist` / `ssr-smoke` | ビルド成果物 | `"use client"` の消失、レンダー中の `window` 参照、サイズ肥大 |
| `check-pack` / `check-consumer` | npm に載る形 | `types` 条件の取り違え、LICENSE 欠落、同梱文書のリンク切れ |

三層目を足したのは、**リポジトリ内の `tsc` が相対パスで `src` を直接見るため、
exports マップの不整合を構造的に検出できない**と分かったからである（第2節の #10）。

`ssr-smoke` は**ビルド済みの dist を Node 上で `renderToString` する**。
Next.js App Router ではクライアントコンポーネントもサーバーで一度レンダーされるため、
レンダー本体で `window` / `document` に触れていると本番で落ちる。
jsdom のテストは `window` がある環境なので、この穴だけは原理的に見つけられない。
全 23 コンポーネントを載せた木を open=false / open=true / 文言差し替えの3通りで描画し、
SSR 時点でゲートが fail-closed になっていること、`Modal.Chart` の視覚側が `aria-hidden` で出ることまで確認している。

### 配布物の実測

| ファイル | raw | gzip | 予算 |
|---|---:|---:|---:|
| `dist/index.js` (ESM) | 79,700 B | 19,482 B | 22,528 B |
| `dist/index.cjs` | 82,588 B | 19,712 B | 22,528 B |
| `dist/styles.css` | 23,447 B | 4,885 B | 6,144 B |

追補前（13,495 B / 13,659 B / 4,503 B）からの増分は、退出 fallback・`Modal.Chart`・フッタ規則のぶん。

`styles.css` は配布用にコメントを落としてある。設計意図つきの原文は `dist/styles.source.css`。

### テストの内訳（387件 = 追補前 103件 + 25件 + 構造 8件 + 環境 28件 + トークン 45件 + シート 42件 + シートの指離し 16件 + 入れ子 13件 + 受け渡しの静的検査 3件 + 構造コンテナの空入力 8件 + ゲートの多重登録と命令的 API の出口 24件 + 登録が出揃う前のゲート 19件 + props の契約 22件）

追補3 で 65 件足し、**追跡表の「未検証」を 6 件から 0 件にした。**

- `tests/environment.test.tsx`（28件）— ブラウザ環境に依存すると思って後回しにしていた 6 項目
  （F-10 送信ショートカット / B-11 メディア既定 / M-04 仮想キーボード / M-07 戻るジェスチャ /
  T-06 長押しの禁止 / G-06 拡大耐性）を、`visualViewport` と寸法を差し替えて配線ごと証明する。
- `tests/tokens.test.ts`（37件）— これまで「CSS に文字列がある」としか言えなかった項目を、
  **約束した値まで**機械検証する。スクリム 32%、タップ 44px、`100vh` ゼロ、
  ゲート中ボタンに `pointer-events: none` を置かないこと、などが後退したら落ちる。

この追補にあわせて追跡表の語彙も変えた。状態「記述」は `C:` に加えて `T:` を要求するようになり、
`npm run check:trace` が「値を検証していない記述」を落とす。
各テストがどの要件を証明しているかは [`docs/traceability.md`](./docs/traceability.md) にある。

| ファイル | 件数 | 追加 | 対象 |
|---|---:|---:|---|
| `tests/units.test.ts` | 22 | 0 | スワイプ判定・ゲート選択・CSS 時間のパース・ポインタ判定・スタック |
| `tests/lifecycle.test.tsx` | 36 | 0 | 開閉・close 理由8種・dismiss ポリシー・ガード・スクリム・フォーカス・命名 |
| `tests/content.test.tsx` | 46 | +1 | タイトル省略・本文・読了ゲート・ボタン・ギャラリー・フォーム部品・命令的 API |
| `tests/exit.test.tsx` | 9 | +9（新規） | 退出 fallback・returnValue のリセット・ネイティブ close の後始末・A-01 の誤検知 |
| `tests/chart.test.tsx` | 7 | +7（新規） | `Modal.Chart` の名前 / 要約 / aria-hidden 既定 / visualAccessible / details / 文言 / 開発時警告 |
| `tests/styles.test.tsx` | 8 | 0 | フッタの順序規則と退出状態の CSS（静的な回帰検査）、フッタの DOM 順 |
| `tests/environment.test.tsx` | 28 | +28（新規） | 送信ショートカット・メディア既定・仮想キーボード・戻るジェスチャ・長押しの禁止・拡大耐性 |
| `tests/structure.test.tsx` | 8 | 0 | 見出しレベル・スロット配置・インジケータ・テーブルの配線 |
| `tests/tokens.test.ts` | 45 | +45（新規） | トークンの値と CSS 不変条件（スクリム濃度・タップ寸法・`100vh` 禁止・ゲート中の当たり判定・`@layer` の閉じ込め・つまみの寸法・ディテントの割合） |
| `tests/detent.test.tsx` | 42 | +42（新規） | つまみ（H-09）・ディテントの解決とスナップ（M-03）・ドラッグの開始条件と後始末（M-02） |
| `tests/props-contract.test.tsx` | 22 | +22（新規） | 制御 `loading` と内部 pending の論理和（F-08）・リストの識別子重複（D-13）・変化通知の条件（D-14）・`Modal.Button` の予約名（D-11）・空のリスト |

追加 25 件の内訳:

| 区分 | 件数 | 主な検査 |
|---|---:|---|
| 退出 fallback（fake timers） | 5 | close 要求後 100ms は `open=true` + `data-exiting`、140ms で close・属性除去・`onExited` 1回 / 途中の再オープンで `close()` を一度も呼ばず中身も保持 / reduced-motion は 1ms で閉じる / スクロールロック解除とフォーカス復帰は close 後 / 退出中の Esc・背景クリックは無視 |
| ネイティブ close（F-11） | 2 | 前回の `returnValue` を持ち越さない（2回目の外部 `close()` が `programmatic`）/ ネイティブ側が先に閉じても `onExited`・ロック解除・リセット |
| 名前なし警告（A-01） | 2 | 名前が無いときだけ警告 / 命令的 `confirm()` の2枚目で誤検知しない |
| ギャラリー | 1 | 幅が測れない間に位置を巻き戻さない |
| `Modal.Chart` | 7 | 上表のとおり |
| CSS / フッタ | 8 | `column-reverse` 不在、`.k-footer-actions { flex: 1 }` と最初の tertiary の auto margin、狭幅規則の順序、DOM 順、3配置の退出状態、`[data-exiting] { transition: none }`、`z-index` 不在 |

**追加テストが穴を捕まえられることの確認。** 追補前のソースに新しいテストを当てると、
`exit.test.tsx` は 9 件中 7 件、`styles.test.tsx` は 8 件中 7 件、ギャラリーの 1 件が落ちる
（通るのは「退出中の Esc を無視」「名前が無いときだけ警告」「DOM 順」の3件で、これらは元から正しかった振る舞いの固定）。

特に、次の「壊れていても気づきにくい」振る舞いに対して回帰テストを置いた。

- ゲート中のボタンのアクセシブルネームに理由が混入しないこと（`toHaveAccessibleName` の厳密一致）
- 処理中のボタンの名前が消えないこと
- 押下と解放の両方がスクリム上のときだけ閉じること（テキスト選択が外へ抜けたときに閉じない）
- 展開中のタイトルを再測定しないこと（トグルが消えて戻れなくなる事故）
- 一度満たした読了が取り消されないこと
- 命令的 API が FIFO で1枚ずつ出ること
- 退出中も dialog が開いたままで、close の後にだけ後始末が走ること（fake timers で時刻を固定）

### 1-2. 実ブラウザでの計測（headless Chrome）

jsdom は CSS を適用しないので、退出 fallback とフッタ配置は Chrome 154 を CDP で動かして実測した。
計測用のハーネスは使い捨てで、リポジトリには置いていない（手順は第5節）。

**退出 fallback（`src/styles.css` を読み込んだ素の `<dialog>`。React 版と同じ手順を再現）**

| 配置 | 退出 60ms 時点 | 140ms 時点（panel） | close 直後の dialog |
|---|---|---|---|
| center | `open=true`、panel opacity 0.57 | opacity 0 / translate `0px 8px` / scale 0.97、scrim opacity 0 | `display: none`、残存 transition 0 本、`pointer-events: none` |
| top | `open=true`、opacity 0.72 | center と同じ | 同上 |
| sheet | `open=true`、opacity 0.57 | opacity 0 / translate `0px 100%` / scale 1 | 同上 |
| 反例: 属性付きのままスタイルを確定させない | — | — | **`display: grid`、transition 2 本が残る**（二重待ち） |
| 参考: ネイティブ側が先に閉じた場合（CSS のみ） | — | — | `display: grid`、transition 2 本（`overlay` による CSS 退出。対応ブラウザでのみ見える） |

この Chrome は `CSS.supports('overlay', 'auto')` が true である。非対応ブラウザでの見え方は未計測（第4節）。
ただし fallback は `overlay` に依存しない手順（open のまま退出状態を描き、待ってから close）なので、原理上は同じ結果になる。

**React デモのビルド成果物（`vite preview`）**

| 確認 | 結果 |
|---|---|
| 「月次レポート」を開く → `Modal.Chart` の名前 / 説明 | 「月別の売上（万円）」/「3月が最大の120万円。…」、視覚側 `aria-hidden="true"`、`<summary>` は「元データを表示」 |
| × で閉じる → 40ms 時点 | `open=true`、`data-exiting`、panel opacity 0.85 |
| 同 → 300ms 時点 | `open=false`、属性なし、`display: none`、残存 transition 0 本 |
| フォーカスとスクロールロック | 開くとパネルに合焦 → 退出中はトリガーに戻らず `html{overflow:hidden}` のまま → close 後にトリガーへ復帰し `overflow: visible` |
| 「配送の設定」（部品の合成） | range / date / time / file がそれぞれ `Modal.Field` のラベルで命名、ラジオ 2 個が `legend`「配送方法」の下、range の説明に「現在 40 / 100」 |

**フッタ配置（`getBoundingClientRect` の実測）**

| ビューポート | パネル幅 | 並び（左端 x / 上端 y / 幅, px） |
|---|---:|---|
| 900 × 720 | 522 | note(206) → やめる(331) … 81px の空き … 下書き保存(475) → 公開する(596、右端 694 = パネル右端 − 余白)。1行 |
| 360 × 780 | 330 | 補足(y 555) → やめる(y 583) → 下書き保存(y 635) → 公開する(y 687)、いずれも幅 296 の全幅。**上から DOM 順** |

スクリーンショットの目視検品（Gemini による項目別判定）でも、重なり・はみ出しは無し。
広幅の「白いパネル」の項目だけが FAIL になったが、原因は headless Chrome がダークモードで起動したこと
（`prefers-color-scheme: dark` のトークンで面が暗色になる、意図した表示）。
デモの「配送の設定」で補助文が下端で切れて見えた件は、本文のスクロール途中だっただけで、
最後までスクロールすると補助文の下端 369px < フッタ上端 385px、`data-at-end` も立つことを確認した。

---

## 2. 実装中に見つけて直した欠陥

設計段階の紙の上では見えず、実際に動かして初めて出たものだけを挙げる。

| # | 症状 | 原因 | 影響 |
|---|---|---|---|
| 1 | **開く前に読了ゲートが充足する** | 閉じている `<dialog>` は `display:none` なので `clientHeight` も `scrollHeight` も 0。「スクロール不要＝読み終えた」と判定していた | 規約を一度も表示せずに同意ボタンが押せる。**同意取得の実装として致命的** |
| 2 | **`"use client"` が消える** | tsup の `banner` で入れたディレクティブを rollup が「バンドル時に壊れる」として削除 | Next.js App Router で import した瞬間に実行時エラー |
| 3 | 名前なし警告の誤検知 | `Modal.Title` の登録は子の effect で起き、親に届くのは次のレンダー。親の effect が先に判定していた | 正しく実装している利用者のコンソールが毎回汚れる |
| 4 | ローディング中にボタン名が消える | `.k-btn-label { visibility: hidden }` はアクセシビリティツリーからも除去される | 送信中のボタンが「名前のないボタン」になる |
| 5 | 処理中テキストがボタン名を汚す | `sr-only` の「処理中」を `<button>` の内側に置いていた | 名前が「送信 処理中」になる |
| 6 | キャプション付き画像が潰れる | `figure` に `aspect-ratio` を掛けていたため、キャプション込みで比率が決まっていた | 画像の縦横比が崩れる |
| 7 | 補足文まで上下反転する | 狭幅時の `column-reverse` を `.k-footer` 全体に掛けていた | 「後から変更できます」がボタンの下に落ちる（その後、反転そのものを廃止した。#18） |
| 8 | 右スロットのボタンが重なる | `justify-self: end` を直接ボタンに掛けており、複数置くと同じグリッドセルで重なる | メニュー＋閉じるの並置ができない |
| 9 | ゲート更新のたびに一瞬 fail-closed | 登録と解除を1つの effect に同居させていた | 理由テキストがちらつく |

1 と 2 は、テストを書いていなければ本番まで到達していた種類の欠陥である。

### 2-2. 「npm に載る形」にして初めて出た欠陥

リポジトリ内では全チェックが緑でも、`npm pack` して別ディレクトリへ実インストールすると
出てくる種類の不具合がある。これらは `tsc` も `vitest` も原理的に検出できない。

| # | 症状 | 原因 | 影響 |
|---|---|---|---|
| 10 | **CJS 利用者の型解決が TS1479 で落ちる** | `exports` の `types` を `import`/`require` の外側に1つだけ置いていた。`require` 解決でも ESM 用の `.d.ts` が返り、`package.json` が `type: module` なので「ESM を require しようとしている」と判定される。`.d.cts` は生成済みなのに参照されていなかった | `moduleResolution: node16` / `nodenext` の利用者が**インストール直後にビルドできない** |
| 11 | **`npm publish` が 402 で失敗する** | スコープ付き（`@genelab/`）なのに `publishConfig.access: "public"` が無い。既定は restricted で、有料プランが要る | 公開作業がその場で止まる |
| 12 | **LICENSE の実体が無い** | `license: "MIT"` と書いてあるだけで、ファイルを置いていなかった | 法的な裏づけのないパッケージが世に出る |
| 13 | **README のリンクが npm 上で 404** | `./modal.skill.md` へ相対リンクしていたが、`files` に含めていなかった | 本ライブラリの設計文書＝主要な価値へ到達できない |
| 14 | CHANGELOG の `CloseReason` 名が実装と違う | 会話中の呼び名（`scrim` / `action` / `browser-back`）のまま書いた。実装と `modal.skill.md` は `backdrop` / `submit` / `route-change` | 利用者が存在しない文字列で分岐を書く |

10 が最も重い。**`.d.cts` をビルドしていることと、それが利用者に届くことは別問題**だった。
再発防止として `check-pack.mjs` に「`types` が条件ごとに分かれているか」の判定を、
`check-consumer.mjs` に「`bundler` / `node16` / `nodenext` の3方式で型が解決できるか」の
実測を置いた。修正後、3方式すべてで `tsc` が通ることを確認している。

### 2-3. 要件の再監査（2026-09-29）で見つけて直した欠陥

元の要件を分解し直した監査（[`docs/requirements-audit.md`](./docs/requirements-audit.md)）と、その実装中に見つけたもの。

| # | 症状 | 原因 | 影響 |
|---|---|---|---|
| 15 | **`overlay` 非対応ブラウザで退出が一瞬で消える** | `data-exiting` を付けた直後に `close()` していた。close した瞬間に top layer から外れるので、付けた属性も `z-index` の保険も意味がなかった | 「退出アニメ」が Chromium 以外で成立していなかった |
| 16 | **前回の `returnValue` が次回に持ち越される** | `close()` は引数があるときだけ `returnValue` を更新し、`showModal()` は何もしない | 2回目の外部 `close()` が `submit` に誤分類される |
| 17 | **ネイティブ側が先に閉じると後始末が走らない** | 閉じる処理を「`el.open` のとき」だけに書いていた。`<form method="dialog">` や外部 `close()` の後は `el.open` がもう false | スタックに残る（下のモーダルのスクリムが消えたまま）、`lockScroll` が解除されない、`onExited` が来ない（命令的 API なら Promise が解決しない） |
| 18 | 狭幅で視覚順と Tab 順が逆 | `column-reverse` | キーボード利用者が「上から下へ」進めない |
| 19 | 最初の tertiary が左へ分離されない | 規則が `.k-footer > .k-btn` だったが、ボタンは `.k-footer-actions` の中にある。**一度も一致していなかった** | 「やめる」が右側のボタン群に紛れる |
| 20 | 命令的 `confirm()` の2枚目で名前なし警告 | 外部ストア起点の再マウントでは、判定タイマー（0ms）が Title 登録の再レンダーより先に走る。#3 の対策（1 tick 待つ）では足りなかった | 正しく実装しているのにコンソールが汚れる（追補前のテスト出力にも出ていた） |
| 21 | ギャラリーが進めた位置を巻き戻す | 幅 0（測れない）を 1 とみなして割っていた。#1 と同じ種類の穴 | jsdom ではテストが負荷次第で落ちる（実際に verify 中に落ちた）。実ブラウザでは閉じた dialog 内で起こりうる |
| 22 | 閉じた dialog の内側にフォーカスが取り残される | フォーカス復帰を「`activeElement` が body のとき」に限っていた | フォーカス復帰を持たない環境で、見えない要素にフォーカスが残る |
| 23 | `check-pack` が `docs/` 内の相対リンクを誤判定する | リンク先をリポジトリのルート基準で解決していた | 文書を増やした瞬間にリンク検査が機能しなくなる |

15 と 17 は、jsdom の polyfill が `close()` の結果を即座に反映するため、
「close した後に何が起きるか」を時刻付きで検査するまで見えなかった。fake timers のテストで固定してある。

---

## 3. jsdom では検証できないもの

ここが本レポートで最も重要な節である。**下記はテストが通っていても保証されない。**
一部は配線だけ単体テストで固めてある（B-14 / B-15 / B-16 / B-17 / B-18）が、
*描画結果と体感*はここでしか確かめられない。
`examples/css-check.html` をブラウザで開いて目視する。

この表は**検品票の原本**である。`examples/css-check.html` の 18 項目のチェックボックスは
この表の写しであり、両者が食い違っていないことを `npm run check:trace` が機械検証する
（項目名と「落ちていたら」の文言、ID の順序と件数が一致すること）。片方だけ直すと CI が落ちる。

「確認方法」は*実ブラウザで何をするか*、「落ちていたら」は*失敗から逆算される原因*を書く。
単体テストで固めてある範囲は「確認方法」側に注記し、「落ちていたら」には混ぜない。

| # | 項目 | 確認方法 | 落ちていたら |
|---|---|---|---|
| B-1 | top layer に載るか | 背景の「押せてはいけない」ボタンが押せないこと | inert が効いていない |
| B-2 | フォーカストラップ | Tab を押し続けてモーダル内で循環すること | `showModal()` ではなく `show()` を呼んでいる |
| B-3 | フォーカス復帰 | 閉じた後に元のトリガーへ戻ること | — |
| B-4 | 入場アニメ | `@starting-style` でふわりと出ること | `@starting-style` に未対応 |
| B-5 | 退出アニメ | 閉じるときに消え去らず、動きが見えること。**Safari / Firefox（`overlay` 非対応）でも**確認する。Chrome 154 での計測は第 1-2 節にある | `data-exiting` の退出状態が効いていない／`close()` が早すぎる |
| B-6 | スクリムの濃度 | default(32%) で背後の文脈が読めること | トークンの適用漏れ |
| B-7 | `backdrop-filter` の負荷 | immersive で大画面がカクつかないこと | blur を既定にしてはいけない理由の実演 |
| B-8 | `line-clamp` の省略 | 長いタイトルが2行で `…` になり、選択コピーで全文が取れること | JS で文字列を切っている |
| B-9 | スクロール端の影 | 上下端で影が出入りすること | `:has()` か `data-at-*` の不一致 |
| B-10 | `prefers-reduced-motion` | OS 設定を切り替えるとアニメが止まること | メディアクエリの漏れ |
| B-11 | `prefers-reduced-transparency` | 透明度を下げる設定で blur が切れること | 同上 |
| B-12 | `forced-colors` | Windows ハイコントラストで境界が見えること | 同上 |
| B-13 | iOS の背面スクロール | シート表示で背後が動かないこと | `lockScroll` が要る場面 |
| B-14 | 仮想キーボード | 入力にフォーカスしても本文が隠れないこと。`--k-keyboard-inset` の計算は単体テスト済み（`tests/environment.test.tsx`）で、実機の `visualViewport` の挙動だけが未確認 | `--k-keyboard-inset` が実機で反映されていない |
| B-15 | スワイプで閉じる | 下フリックで閉じ、本文スクロール中は反応しないこと。判定ロジックは単体テスト済み（`shouldDismissBySwipe`）で、体感だけが未確認 | 判定のしきい値が実機の指の速度と合っていない |
| B-16 | 400% ズーム | 拡大しても読了ゲートが成立し、横スクロールが出ないこと。再評価の配線は単体テスト済み（G-06）で、リフロー結果だけが未確認 | リフロー後に寸法が再評価されていない |
| B-17 | 長押し | タイトルを長押ししたとき OS のコンテキストメニューが出ること。kasane が長押しを奪っていないことは単体テスト済み（T-06） | kasane が長押しを奪っている |
| B-18 | 段の吸い付き | `peek` / `half` / `full` の 3 段で、指を離すと最も近い段へ吸い付くこと。速い下フリックでは閉じずに 1 段下がり、最下段からさらに投げたときだけ閉じること。つまみを選んで矢印キーでも段が移ること。判定は単体テスト済み（`snapToDetent` / `tests/detent.test.tsx`）で、慣性と体感だけが未確認 | 段の割合（peek 30% / half 60% / full 92%）が実機の画面比と合っていない |

### jsdom が「実ブラウザと同じ」だった点

検証中に分かった有用な事実として、jsdom は既定スタイルシートに `dialog:not([open]) { display: none }` を持っている。
そのため**閉じている間の中身は `getByRole` で引けない**。これは実ブラウザと同じ挙動であり、
「閉じているのに読み上げられる」類の事故はテストでも検出できる。

### 意図的に自動テストしていないもの

- **axe などの自動 a11y 検査**: `<dialog>` の top layer を jsdom が再現しないため、
  偽陽性・偽陰性のどちらも出る。実ブラウザ上の Playwright + axe に回す（ROADMAP v0.4）。
- **視覚回帰**: 同上。

---

## 4. 既知の制約

1. **Node 18 では一部の依存が engine 警告を出す**（`eslint-visitor-keys` が Node 20+ を要求）。
   現状は動作しているが、CI は Node 20 / 22 で回すべき。
2. **`closeOnBack` は `popstate` の受け口まで自動テスト済み**（`tests/environment.test.tsx`）だが、
   実機の戻るジェスチャ、および Next.js App Router の履歴操作との相互作用は未確認。既定は off。
3. **スワイプは判定ロジックのみ検証済み。** ポインタ操作の連続性は実機確認が要る。
4. **`Modal.Gallery` の位置検出は `clientWidth` に依存する。** jsdom では 0 なので、
   index の遷移だけを検証している（幅 0 の間は再計算しない）。実際のスナップ位置は未検証。
5. **実ブラウザでの計測は Chrome 154（`overlay` 対応）だけ。** Safari / Firefox での退出 fallback、
   実機（iOS / Android）、スクリーンリーダーでの `Modal.Chart` の読み上げ、Base UI のポップアップとの
   組み合わせ（Portal の `container`、Esc の順序）は未検証。
6. **退出待ちは `--k-dur-out` を JS が読む。** 利用側が `transition-duration` だけを直接上書きし、
   `--k-dur-out` を変えなかった場合、待ち時間と動きがずれる。トークンで変えること。

---

## 5. 再現手順

```bash
git clone <this repo>
npm install

npm run verify          # 第1節の全チェック（オフラインで完結、約30秒）
npm run check:consumer  # tarball を実インストールして外から検証（ネットワークが要る）

npm run build:demo      # デモの本番ビルド
npm run dev             # http://localhost:5173 で React デモ
open examples/css-check.html   # 第3節の目視確認（退出は React 版と同じ手順で再現してある）
```

第1-2節の実ブラウザ計測は、Chrome を `--headless=new --remote-debugging-port` で起動し、
CDP の `Runtime.evaluate` で `getComputedStyle` / `getBoundingClientRect` / `getAnimations()` を
時刻を置いて読んだもの。ハーネスは使い捨てでリポジトリには含めていない。
恒久化は ROADMAP v0.4（Playwright）で行う。

個別に走らせる場合:

| コマンド | 見るもの |
|---|---|
| `npm run typecheck` | 型 |
| `npm run lint` | 静的解析 |
| `npm run test` | 387 件の単体・結合テスト |
| `npm run build` | ESM / CJS / `.d.ts` / `.d.cts` / CSS |
| `npm run check:dist` | `"use client"`・公開 API・サイズ予算 |
| `npm run check:ssr` | SSR で落ちないか（Next.js App Router 互換） |
| `npm run check:pack` | npm に載る形（同梱物・types 条件・ライセンス・リンク） |
| `npm run check:consumer` | 実インストール後の import と型解決（3解決方式） |
