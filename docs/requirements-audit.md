# 要件監査 — 元依頼を要件表に分解し直す

対象: `@genelab/gassan` v0.1.0（公開前）
日付: 2026-09-29

元依頼は「React / Next.js 向けの理想のモーダル」を作ること。
ここでは依頼を要件に分解し直し、各要件が今どの状態にあるかを 3 値で記録する。

| 状態 | 意味 |
|---|---|
| **実装済み** | gassan のコンポーネント・CSS・テストで直接満たしている |
| **合成で対応** | gassan は器と配線だけを持ち、中身はネイティブ要素や Base UI などを組み合わせて満たす。**意図した境界**であり、未実装ではない |
| **ロードマップ** | 今は満たしていない。[`ROADMAP.md`](../ROADMAP.md) の版に割り当ててある |

「合成で対応」を「実装済み」と書かないのは、責任の所在をはっきりさせるためだ。
スライダーのキーボード操作が壊れていたら、それは gassan ではなくスライダーの持ち主の問題になる。

---

## 1. 要件表

### 1-1. 土台（層1〜3）

| # | 要件 | 状態 | 満たし方 | 根拠 |
|---|---|---|---|---|
| R-01 | React / Next.js（App Router）でそのまま使える | 実装済み | `"use client"` を dist の先頭に付与。SSR で `window` に触れない | `check-dist` / `check-ssr` |
| R-02 | 背景を操作不能にし、フォーカスを閉じ込める | 実装済み（委譲） | ネイティブ `<dialog>.showModal()`。自前のトラップは書かない | MDN `<dialog>`、W3C APG |
| R-03 | 背景（scrim）の濃さを意図別に選べる | 実装済み | `scrim` トークン 4 段階＋none。既定は黒 32%・blur なし | `modal.skill.md` §3-1 |
| R-04 | 開閉アニメーション | 実装済み | 入場は `@starting-style`。退出は **`overlay` が Limited availability（Baseline ではない）** なので、JS が `data-exiting` を付けて `--g-dur-out` 待ってから `close()` する fallback を持つ | `tests/exit.test.tsx`、VERIFICATION §1-2 |
| R-05 | 寸法・配置（中央 / 上寄せ / シート） | 実装済み | `size` 5 種、`placement` の `auto` は JS で解決 | `tests/lifecycle.test.tsx` |
| R-06 | 閉じる理由を区別し、拒否できる | 実装済み | `CloseReason` 8 種、`onRequestClose`（同期 / 非同期） | `tests/lifecycle.test.tsx` |

### 1-2. ヘッダ（層4）

| # | 要件 | 状態 | 満たし方 | 根拠 |
|---|---|---|---|---|
| R-07 | 戻る / 閉じる | 実装済み | `Modal.Back`（左スロット）/ `Modal.Close`（右スロット） | H-01〜H-04 |
| R-08 | ページング（現在地の表示） | 実装済み | `Modal.Indicator`。視覚は「2 / 5」、読み上げは「5ステップ中2ステップ目」 | H-06 |
| R-09 | タイトルはコントロールと**別行** | 実装済み | `Modal.Controls` と `Modal.Title` を別要素にする構造 | H-05 |
| R-10 | 長いタイトルでも**完全なテキスト**を保つ | 実装済み | 省略は CSS `line-clamp` だけ。DOM とアクセシブルネームは常に全文 | T-03 / T-04 |
| R-11 | 全文を見る手段 | 実装済み | 溢れたときだけ出る**明示的な展開トグル**（`aria-expanded`）。hover / `title` 属性 / 長押しには頼らない | T-05〜T-08 |

### 1-3. 本文

| # | 要件 | 状態 | 満たし方 | 根拠 |
|---|---|---|---|---|
| R-12 | 本文セクション | 実装済み | `Modal.Section`（見出しがあれば `section` + `aria-labelledby`） | B-07 |
| R-13 | 本文だけがスクロールする | 実装済み | `Modal.Body`（`tabIndex=0` + 名前 + `overscroll-behavior`） | B-01〜B-04 |
| R-14 | 画像・動画・音声 | 実装済み | `Modal.Media`（`aspect-ratio` で揺れ防止、autoplay なし） | B-10 / B-11 |
| R-15 | ギャラリー（スライダー） | 実装済み | `Modal.Gallery`（scroll-snap、矢印 / Home / End、位置の読み上げ） | B-12 |
| R-16 | 表 | 実装済み | `Modal.Table`（横スクロール領域に名前とフォーカス） | B-13 |
| R-17 | グラフ類 | 実装済み（器）＋合成 | `Modal.Chart` が名前（`label`）・傾向のテキスト代替（`summary`）・元データの開閉（`data` → `<details>`）を配線する。**視覚チャートの描画は持ち込み**（SVG / canvas / 任意のライブラリ）。既定で視覚側は `aria-hidden` | B-14、`tests/chart.test.tsx` |

### 1-4. フォーム（各種コントロール）

モーダルはコントロールを**再実装しない**。`Modal.Field`（単一の入力: ラベル・補助文・エラーの配線）と
`fieldset` / `legend`（選択肢のグループ）が境界で、中身はネイティブ要素か Base UI に任せる。
最小例は [`control-recipes.md`](./control-recipes.md) にすべてある。

| # | コントロール | 状態 | 推奨する中身 | gassan が持つもの |
|---|---|---|---|---|
| R-18 | テキスト / テキストエリア | 合成で対応 | `<input type="text">` / `<textarea>` | `Modal.Field` の配線、タッチ端末で初期フォーカスを当てない（K-04） |
| R-19 | チェックボックス（単体） | 合成で対応 | `<input type="checkbox">` | 同意用は `Modal.Consent`（ゲート連動）が実装済み |
| R-20 | チェックボックス（複数）/ ラジオ | 合成で対応 | ネイティブ input を `fieldset` + `legend` で包む | なし（`label` ではなく `legend` でグループに名前を付ける） |
| R-21 | トグル | 実装済み＋合成 | `Modal.Switch`（`role="switch"` の button）。Base UI Switch でも可 | `Modal.Switch` |
| R-22 | レンジ（スライダー） | 合成で対応 | `<input type="range">`。2 つ摘みや目盛りが要るなら Base UI Slider | `Modal.Field` の配線 |
| R-23 | セレクト / ドロップダウン | 合成で対応 | 選択肢が固定で少ないなら `<select>`。見た目の自由・検索・複数選択が要るなら Base UI Select / Combobox | `Modal.Field` の配線。ポップアップの重なり順は ROADMAP v0.3 で検証 |
| R-24 | ファイル | 合成で対応 | `<input type="file">` | `Modal.Field` の配線 |
| R-25 | 日付 / 時刻 | 合成で対応 | `<input type="date">` / `type="time"` / `datetime-local` | `Modal.Field` の配線 |
| R-26 | チップス（タグの付け外し） | 実装済み | `Modal.Chips`（`aria-pressed` のトグルボタン群） | `Modal.Chips` |
| R-27 | エラーのまとめ | 実装済み | `Modal.Alert`（`role="status"`、必要時のみ `alert`） | F-08 |

### 1-5. フッタとゲート

| # | 要件 | 状態 | 満たし方 | 根拠 |
|---|---|---|---|---|
| R-28 | primary / secondary / tertiary の階層 | 実装済み | `Modal.Button variant`（＋`danger`） | F-01 / F-06 |
| R-29 | ボタン順が視覚・読み上げ・Tab で一致 | 実装済み | DOM 順 = 視覚順。広幅は最初の tertiary を左へ分離、狭幅も**反転せず** DOM 順で縦に積む（`column-reverse` は廃止） | F-02〜F-04、`tests/styles.test.tsx` |
| R-30 | 二重送信の防止・処理中表示 | 実装済み | `onAction` が解決するまで再クリックを握りつぶす | F-07 / F-08 |
| R-31 | 読了ゲート | 実装済み | センチネル可視 OR 末尾へのフォーカス到達 OR スクロール不要、の論理和 | G-03〜G-05 |
| R-32 | 同意ゲート | 実装済み | `Modal.Consent` + `Modal.Button gate`。`disabled` ではなく `aria-disabled`、押すと理由を読み上げて誘導 | G-01 / G-07 / G-08 |

### 1-6. 仕様書と公開

| # | 要件 | 状態 | 満たし方 | 根拠 |
|---|---|---|---|---|
| R-33 | skill.md（AI に渡せる仕様） | 実装済み | [`modal.skill.md`](../modal.skill.md) v1.2。128 項目、§9 に貼り付け用の圧縮ルール | — |
| R-34 | 段階公開 | 実装済み（計画）＋ロードマップ | v0.1.0 は公開形態まで整備済み（publish はしていない）。v0.2〜v1.0 は [`ROADMAP.md`](../ROADMAP.md) | `check-pack` / `check-consumer` |
| R-35 | 実ブラウザ・実機での保証 | ロードマップ | jsdom で保証できない 15 項目は VERIFICATION §3。Playwright + axe は v0.4 | VERIFICATION.md |

---

## 2. 「合成で対応」を選んだ理由

コントロールを gassan に取り込まないのは、手抜きではなく設計上の判断である。

1. **モーダルの仕事は器と配線。** ラベル・補助文・エラーを `aria-describedby` で結ぶこと、
   タッチ端末で入力に初期フォーカスを当てないこと、ゲートと連動させること。ここまでが器の責務。
2. **ネイティブ要素はすでにアクセシブル。** `range` / `date` / `file` / `radio` は
   キーボード操作も読み上げもブラウザが持っている。包み直すほど壊れる箇所が増える。
3. **複雑な部品は専門のライブラリのほうが良い。** Select / Combobox の listbox キーボード規約や
   ポップアップの位置決めは、Base UI のような専業のほうが確実に正しい。競う理由がない。

境界は `Modal.Field` の render prop（`id` / `aria-describedby` / `aria-invalid` / `aria-required` を渡す）と、
選択肢のグループに使う `fieldset` / `legend` の 2 つだけ。

---

## 3. 今回の監査で見つけて塞いだ穴

| 穴 | 対応 |
|---|---|
| `overlay` 非対応ブラウザで退出アニメが一瞬で消える | `data-exiting` を付けて `--g-dur-out` 待ってから `close()` する fallback を実装（R-04） |
| 前回の `returnValue` が残り、次の外部 `close()` が submit と誤分類される | `showModal()` の前に `returnValue = ''`（R-06） |
| ネイティブ側が先に閉じると後始末（onExited / スクロールロック解除 / リセット）が走らない | 閉じた dialog を検知して後始末を実行（R-06） |
| 狭幅のフッタで視覚順と Tab 順が逆になる | `column-reverse` を廃止し DOM 順で積む（R-29） |
| 広幅で最初の tertiary が左へ分離されていなかった（セレクタが一致していなかった） | `.g-footer-actions` を `flex: 1` にし、その直下の最初の tertiary に `margin-inline-end: auto`（R-29） |
| グラフの器がなかった | `Modal.Chart` を追加（R-17） |
| 命令的 `confirm()` の 2 枚目で名前なし警告が誤検知される | 登録数を同期的な ref でも持ち、判定に使う |

詳細は [`VERIFICATION.md`](../VERIFICATION.md) 第2節。
