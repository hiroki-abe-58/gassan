---
name: modal-shell
description: React / Next.js におけるモーダル（ダイアログ）実装の完全仕様。<dialog> と top layer を前提に、スクリム・コンテナ・タイトル省略・スクロール領域・活性化ゲート・フッタ順序までの振る舞いを135項目で列挙し、意思決定マトリクス、品質ルーブリック、AIコーディング用の圧縮ルールを含む。
version: 1.3
updated: 2026-10-02
target: React 19 / Next.js 15+ (App Router) / Baseline 2024（CSS overlay は非 Baseline のため JS fallback を併用）
---

# 理想のモーダル — 実装仕様

## 0. このファイルの使い方

あなたはこれからモーダルを実装する。順番は固定。飛ばさない。

1. **§1 を読み、モーダルの存在理由と4層モデルを理解する。** ここを飛ばすと「それっぽいけど毎回どこか気持ち悪い」ものが出来る。
2. **§2 で作るモーダルの型を決める。** 5種類しかない。型が決まればスクリム・配置・dismiss・フッタ順序が自動で決まる（§3）。
3. **§10 の実装ノートを先に読む。** 設計段階では見えない23の落とし穴が書いてある。
4. **§4 の振る舞い表から、該当する行だけを拾って実装する。** 135項目あるが、1つのモーダルで必要なのは通常 40〜60 行。
5. **§5 の禁止事項を機械的に照合する。** 1つでも踏んだら書き直す。
6. **§6 のルーブリックで採点する。** 12点未満は §3 に戻る。15点満点。

AI コーディングエージェントに渡す場合は **§9 の圧縮ルールだけを貼る**。

---

## 1. 中核理論

### 1-1. モーダルの唯一の存在理由

モーダルは「情報を表示する箱」ではない。

```
モーダル = ユーザーの操作の流れを、意図的に、一時的に、分岐させる装置
```

分岐させる正当な理由は4つしかない。

| # | 理由 | 例 |
|---|---|---|
| 1 | 破壊的操作の確認 | 削除、公開取消、課金 |
| 2 | 現在の文脈を保ったままの副次入力 | タグ追加、メンバー招待 |
| 3 | 文脈を保ったままの詳細閲覧 | 画像拡大、行の詳細 |
| 4 | 法的・手続的な明示同意 | 規約、権限付与 |

この4つに当てはまらないなら、それはページかインライン展開（disclosure）かポップオーバーであるべきだ。**モーダルは「置き場所に困ったUIの避難所」ではない。**

NN/g が overlay の乱用を批判しつつ lightbox を擁護するのは、この「文脈を保つ」という一点においてのみモーダルが他を上回るからである。

### 1-2. 4層モデル

モーダルの実装を4つの層に分解する。**層を混ぜると必ず破綻する。**

```
層1  Layer   … top layer への出入り、inert、フォーカス、Esc、退出アニメ
層2  Scrim   … 背後が不活性であることの通知、コントラスト確保
層3  Container … 寸法、配置、スクロール境界、safe-area、レスポンシブ
層4  Flow    … ヘッダ／ボディ／フッタの情報構造、ゲート、送信
```

2026年時点の正解は明快である。

```
層1 → ネイティブ <dialog>.showModal() に全部委譲する。1行も自分で書かない
層2 → CSS トークン。既定値を疑い、意図別に4段階持つ
層3 → CSS Grid + dvh + env(safe-area-inset-*)。JS で高さを計算しない
層4 → ここだけが本当の設計仕事。ライブラリが解いてくれない唯一の層
```

**多くのモーダル実装が納得いかない原因は、層1と層2に労力の9割を使い、層4に1割しか使っていないこと。** 層1は既に解かれている。層4に全部を注ぐための仕様がこのファイルである。

### 1-3. 前提の更新（なぜ既存コードが古いのか）

AI の学習データには 2022年以前のモーダル実装が大量に含まれている。以下の3点で前提が変わった。

| 項目 | 旧 | 新 |
|---|---|---|
| フォーカストラップ | JS で自作／focus-trap 依存 | `showModal()` がネイティブに実施。**書いてはいけない** |
| 退出アニメーション | Framer Motion / AnimatePresence | `@starting-style` + `transition-behavior: allow-discrete` + `overlay`。**ただし `overlay` は非 Baseline** なので、close 前に `data-exiting` を付けて待つ小さな JS fallback を併用する（L-07） |
| ポータル | `createPortal(document.body)` 必須 | **不要。** top layer は祖先の `overflow` / `transform` / `z-index` の影響を受けない |

### 1-4. ブラウザサポート（2026-09-29 時点、MDN で確認。★は要再確認）

| 機能 | 状態 | 備考 |
|---|---|---|
| `<dialog>` / `showModal()` / `::backdrop` | Baseline（2022-03〜） | 全主要ブラウザ |
| `@starting-style` | Baseline（2024-08〜） | Chrome 117 / Safari 17.5 / Firefox 129 |
| `transition-behavior: allow-discrete` | Baseline（2024〜） | 同上 |
| `overlay` プロパティ | **Limited availability（not Baseline）**、Experimental | 未対応ブラウザでは `close()` した瞬間に top layer から外れて消える。§4 L-07 の fallback（close 前に `data-exiting`、`--g-dur-out` 待って `close()`）を実装せよ |
| `:has()` | Baseline（2023-12〜） | スクロールロックとスクロールシャドウに使用 |
| `:modal` 擬似クラス | Baseline | `html:has(dialog:modal)` でスクロールロック |
| `dvh` / `svh` / `lvh` | Baseline | `100vh` は禁止 |
| `prefers-reduced-transparency` | ★Chrome 118 / Safari 17、Firefox 未対応 | 未対応環境では blur が残る前提で既定値を設計する |
| `scrollbar-gutter: stable` | ★Safari 18.2〜 | 古い Safari ではレイアウトシフトが残る |
| `closedby` 属性 | **Limited availability** | 採用しない。`closedby="none"` では `cancel` すら発火せず、拒否の理由を返せない。JS 側で同等の制御を持つ |
| `requestClose()` | **Baseline 2025**（2025-05〜） | `cancel` → `close` の順で発火する「取り消せる close」。gassan は `cancel` を常に止め、React 側の `requestClose(reason)` に集約しているので置き換えない（理由を持てないため） |
| `env(keyboard-inset-height)` | ★Chromium のみ | VisualViewport API で fallback |
| CSS カルーセル（`::scroll-marker`） | ★Chrome 135〜 | Progressive enhancement としてのみ |

---

## 2. モーダルの5類型

作る前に、これから作るものがどれかを1つ選ぶ。**複数該当するなら、それは分割すべき2つのモーダルである。**

| 型 | 目的 | 典型的な高さ | ゲート | 既定 dismiss |
|---|---|---|---|---|
| **A. 確認** | 破壊的操作の確認 | 短い（スクロールなし） | なし／チェック1個 | Esc ○ 背景 ○ |
| **B. 入力** | フォーム | 中〜長 | バリデーション | Esc △ 背景 ✕（dirty guard） |
| **C. 閲覧** | 詳細・メディア | 中〜長 | なし | Esc ○ 背景 ○ |
| **D. 同意** | 規約・権限 | 長い（必ずスクロール） | 読了 + チェック | Esc ✕ 背景 ✕ |
| **E. フロー** | 複数ステップ | 可変 | ステップ毎 | Esc △ 背景 ✕ |

型が決まれば §3 のマトリクスで残りの選択肢が確定する。

---

## 3. 意思決定マトリクス

### 3-1. スクリム

**既定は「黒 32% / blur なし」。** これは Material Design 3 の scrim 規定に一致する。60〜80% の黒は背後の文脈を殺し、モーダルの唯一の優位性（文脈保持）を自ら捨てる行為である。

| トークン | 不透明度 | blur | 使う場面 |
|---|---:|---:|---|
| `subtle` | 20% | 0 | 非破壊・短命（トースト的確認、ポップオーバー寄り） |
| `default` | 32% | 0 | **既定。** A / B / C / E 型 |
| `strong` | 50% | 0 | D型（同意）、破壊的確認 |
| `immersive` | 72% | 12px | メディア閲覧、ライトボックス。**明示 opt-in のみ** |

blur の適用条件（すべて満たす場合のみ）。

```
□ 型が C（閲覧）かつ背後の情報が読解の邪魔になる
□ prefers-reduced-transparency: reduce ではない
□ blur 半径が 16px 以下（それ以上は効果に対してコストが跳ねる）
□ スクリムが全画面固定であり、スクロールに追従して再計算されない
```

blur を切るときの代替は「不透明度を上げる」。ぼかしを消して 32% のままにすると、OS で透明度を下げている人には何も伝わらない。

ダークテーマでの注意。**黒スクリムはダーク UI 上では機能しない。** 暗い背景に暗いスクリムを重ねても分離が生まれないため、ダークでは「スクリムを濃くする」のではなく「パネルの面を明るくし、境界線を1px引く」で分離する。

### 3-2. 配置

| 配置 | 条件 |
|---|---|
| `center` | デスクトップ既定 |
| `top`（上寄せ） | 内容の高さが大きく変動する場合。中央寄せだと高さ変化で内容が上下に暴れる |
| `sheet`（下端シート） | 幅 600px 未満の既定。片手操作領域に primary を置ける |
| `drawer`（横） | 主タスクを継続しながらの参照。**それはモーダルではなく非モーダルであるべき場合が多い** |

`auto` を指定した場合、**JS 側（`matchMedia`）で `center` / `sheet` に解決してから DOM に流す。** CSS のメディアクエリで分岐させると、配置固有の `@starting-style` を二重管理することになり、必ず片方が腐る。

### 3-3. dismiss の可否

| 型 | Esc | 背景クリック | ×ボタン | 理由 |
|---|:-:|:-:|:-:|---|
| A 確認 | ○ | ○ | ○ | 誤操作の取り消しは常に容易であるべき |
| B 入力 | △ | ✕ | ○ | 入力中に背景クリックで消えるのは最悪の体験。Esc は dirty guard 付きで許可 |
| C 閲覧 | ○ | ○ | ○ | 失うものがない |
| D 同意 | ✕ | ✕ | △ | ただし「同意しない」で抜ける道は必ず用意する |
| E フロー | △ | ✕ | ○ | ×は「中断しますか」を挟む |

**dismiss を禁止する場合、無言で無視してはいけない。** Esc や背景クリックは「閉じたい」という明確な意思表示である。無反応だと壊れていると判断される。パネルを 320ms ほど横に揺らす（reduced-motion 時は境界線を発光）+ `role="status"` で理由をアナウンスする。

### 3-4. フッタのボタン順序

```
デスクトップ（水平）
  [note][tertiary]………………[secondary][primary]
  DOM 順 = 視覚順（左→右）= Tab 順 = 読み上げ順
  ボタン列は残り幅を占め（flex: 1）、最初の tertiary だけを margin-inline-end: auto で左へ分離する

モバイル／狭いパネル（縦積み・全幅）
  [tertiary]
  [secondary]
  [primary]
  DOM 順のまま積む。CSS で反転させない
```

**`column-reverse` / `order` で見た目だけ入れ替えてはいけない。** 視覚順と Tab 順・読み上げ順が逆になり、
キーボード利用者は「上のボタンから下へ」進めなくなる（WCAG 1.3.2 意味のある順序 / 2.4.3 フォーカス順序）。
v1.1 までは「primary を上に出すため column-reverse」としていたが、この理由で撤回した。

狭幅で primary を上に置きたいプロダクトは、CSS ではなく **DOM の順序そのもの**を変える
（その場合はデスクトップでも同じ順序になる。視覚順と DOM 順を別々に持たない）。

**破壊的操作で色と位置を同時に変えてはいけない。** 位置は通常の primary と同じまま、色だけ danger にする。位置まで変えると筋肉記憶が外れ、かえって誤操作を生む。

### 3-5. 活性化ゲートの選択

| 条件 | 使ってよいか | 実装 |
|---|---|---|
| フォームの妥当性 | ○ | 常に第一候補 |
| チェックボックス同意 | ○ | D型で必須 |
| 本文の読了 | △ | 法的要件がある場合のみ。§4 G-03〜G-06 を全部実装すること |
| 経過時間（N秒待つ） | ✕ | WCAG 2.2.1 違反。実装しない |
| スクロール位置のみ | ✕ | スクリーンリーダー利用者が永久に進めなくなる |

---

## 4. 振る舞いの全列挙（135項目）

凡例 — 必須度 `M`=必須 / `S`=推奨 / `O`=opt-in

この表は要件の定義であって、実装状況ではない。参照実装 `@genelab/gassan` が各項目を
どこで満たしているか（テスト名・CSS・未実装の行き先）は [`docs/traceability.md`](docs/traceability.md) にある。
そちらは `npm run check:trace` が機械検証していて、**存在しないテスト名を根拠に書くと CI が落ちる。**
「135 項目に対応した」を主張ではなく検査結果にするための仕組みで、
このファイルを自分のプロジェクトに持ち込むときも、同じ形の表を 1 枚持つことを勧める。

### L. レイヤ／ライフサイクル（15）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| L-01 | top layer への昇格 | M | `showModal()` のみ。`z-index` を書かない |
| L-02 | 背景の不活性化 | M | ネイティブが `inert` 相当を適用。自前の `aria-hidden` 付与は禁止 |
| L-03 | 開閉の宣言的同期 | M | `open` prop の変化を effect で `showModal()` / `close()` に写す |
| L-04 | 入場アニメーション | S | `@starting-style` で初期値を与える。180ms |
| L-05 | 退出アニメーション | S | `transition-behavior: allow-discrete` を `display` に指定。120ms（入場より速く） |
| L-06 | 退出中の top layer 保持 | M | `transition` list に **`overlay` を含める**（対応ブラウザ用）。ネイティブ側が先に閉じたときの退出はこれだけが頼り |
| L-07 | `overlay` 未対応時の fallback | S | close 要求で **`close()` を呼ばずに** `data-exiting` を付け、dialog を open のまま scrim / panel を閉状態へ遷移させる。`--g-dur-out`（reduced-motion は最短）待ってから `close()`。途中で再オープンされたらタイマーを取り消し、属性を外して open のまま戻す。onExited / リセット / フォーカス復帰 / スクロールロック解除は `close()` の後。center / top / sheet の3配置すべてに退出状態を書く。`[data-exiting]` の間は dialog の discrete transition を止め、close 後に二周目を走らせない |
| L-08 | close 理由の分類 | M | `esc / backdrop / close-button / back-button / submit / programmatic / swipe / route-change` |
| L-09 | close の拒否（guard） | S | `cancel` イベントを常に `preventDefault()` し、自前の `requestClose(reason)` に一本化 |
| L-10 | 拒否時のフィードバック | S | 無反応にしない。揺らす + `role="status"` |
| L-11 | ネストの許可 | O | top layer のスタックはネイティブが管理。Esc は最上位のみ閉じる（ネイティブ挙動） |
| L-12 | ネスト時のスクリム二重掛け防止 | S | スタック登録簿を持ち、最上位以外に `data-g-covered` を付けてスクリムを 0 にする |
| L-13 | ルート変更での自動クローズ | O | Next.js の `usePathname` を監視。`route-change` 理由で閉じる |
| L-14 | 同時オープンの抑制 | O | 型Aの確認はキューイングし、同時に2枚出さない |
| L-15 | 命令的 API の出口の保証 | S | `confirm()` の Promise は描画先が無いと永久に解決しない。(1) ホストの有無の判定は 1 ティック遅らせる（**子の effect は親より先に走るので、正しい構成でも同期判定では誤報になる**）(2) ホストが 2 つ以上なら警告する（同じキューの先頭を各々が描き、1 つの回答が全部を解決してしまう）(3) 待機中にホストが消えたら警告する。黙って握りつぶすと「await が返らない」だけが残り原因を辿れない |

### S. スクリム（10）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| S-01 | 意図別4段階トークン | M | §3-1。単一値を持たない |
| S-02 | 既定は blur なし | M | blur は opt-in |
| S-03 | フェード同期 | M | パネルと同じ duration / easing |
| S-04 | `prefers-reduced-transparency` 対応 | M | blur を 0 に、不透明度を +0.1 |
| S-05 | `prefers-reduced-motion` 対応 | M | フェードを 1ms に。ただし **0 にはしない**（discrete transition が壊れる） |
| S-06 | `forced-colors` 対応 | S | blur は無視される前提。パネル側に `1px solid CanvasText` を保証 |
| S-07 | ダークテーマでの分離 | M | スクリムを濃くせず、面の明度と境界線で分離 |
| S-08 | クリック判定の正確さ | M | `pointerdown` と `pointerup` の**両方**がスクリム上のときだけ閉じる。テキスト選択のドラッグ抜けで閉じてはならない |
| S-09 | `::backdrop` ではなく自前要素 | S | カスタムプロパティの継承挙動がブラウザ間で揺れるため、フル制御可能な `div` を dialog 直下に置く |
| S-10 | スクリムの `aria-hidden` | M | `aria-hidden="true"` + 非フォーカサブル |

### C. コンテナ（12）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| C-01 | 幅トークン | M | `sm 360 / md 520 / lg 720 / xl 960 / full` |
| C-02 | 幅の上限と実幅 | M | `inline-size: min(100%, var(--g-panel-max))` |
| C-03 | 高さの上限 | M | `max-block-size: 100%`（dialog の padding box 基準）。`100vh` 禁止 |
| C-04 | ビューポート余白 | M | `padding: max(16px, env(safe-area-inset-*))` |
| C-05 | 内部グリッド | M | `grid-template-rows: auto minmax(0, 1fr) auto`。**`minmax(0,1fr)` を `1fr` にすると body が縮まずスクロールしない** |
| C-06 | 行の明示割当 | M | Header/Body/Footer に `grid-row` を明示。暗黙行に落とさない |
| C-07 | 角丸でのクリップ | S | パネルに `overflow: hidden` |
| C-08 | 高さ変化のアニメーション | O | フロー型のみ。`interpolate-size: allow-keywords` か JS 実測 |
| C-09 | 上寄せ配置 | S | 高さが変動するなら `center` を避ける |
| C-10 | 縦オーバーフローの封じ込め | M | dialog を `overflow: hidden` にし、パネル側で吸収。中央寄せで上端が切れる古典バグを構造的に消す |
| C-11 | コンテナクエリ | O | パネルに `container-type: inline-size`。内部レイアウトはビューポート幅ではなくパネル幅で分岐 |
| C-12 | 独立スタッキング文脈の自覚 | M | パネル内の tooltip / select は popover API か dialog 内ポータルへ。`position: fixed` はパネルの `transform` で壊れる |

### H. ヘッダ／コントロール群（10）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| H-01 | 3カラムグリッド | M | `grid-template-columns: 1fr auto 1fr`。戻るの有無で中央がズレない |
| H-02 | 左＝戻る、右＝閉じる | M | `data-slot="start" / "center" / "end"` で位置を宣言。DOM 順に依存しない |
| H-03 | タップ領域 44×44 | M | WCAG 2.5.8 の最低は 24×24 だが、Apple HIG の 44 を採る |
| H-04 | ボタン間の最小距離 8px | M | 「戻る」と「×」の誤タップは最も高コストな事故 |
| H-05 | タイトルをコントロール行に置かない | M | 長文で必ず干渉する。別行にする |
| H-06 | ページインジケータ | O | 中央スロット。`1 / 5` は視覚用、SR 用に「5ステップ中 1ステップ目」を別途 |
| H-07 | 追加メニュー | O | 右スロットの×の内側 |
| H-08 | スクロール時の境界線 | S | `.g-panel:has(> .g-body:not([data-at-start])) > .g-header` |
| H-09 | ドラッグハンドル | O | シート配置時のみ。装飾ではなく実際にドラッグ可能にする |
| H-10 | ヘッダの固定 | M | grid の行1。`position: sticky` を使わない（スクロール領域はボディだけ） |

### T. タイトル（9）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| T-01 | アクセシブルネームの付与 | M | `aria-labelledby` を **h2 内側の span** に向ける |
| T-02 | 見出しセマンティクス | M | `<h2>`。`<div class="title">` は不可 |
| T-03 | CSS による省略 | M | `line-clamp: 2`。**JS で文字列を切らない** |
| T-04 | 省略時も完全な名前 | M | T-03 の帰結。DOM テキストは常に完全 |
| T-05 | `title` 属性の禁止 | M | hover 前提。タッチで出ず、WCAG 1.4.13（hoverable / dismissible / persistent）を満たさない |
| T-06 | 長押しの禁止 | M | OS のコンテキストメニューと衝突する。a11y 的にも代替手段がない。全文表示は T-08 の明示トグルだけで行う |
| T-07 | 溢れ検出 | S | `scrollHeight - clientHeight > 1`。ResizeObserver で再評価。**展開中は再測定しない**（溢れ判定が false に反転してトグルが消える） |
| T-08 | 展開トグル | S | 押して開く明示的な `<button>`（hover / `title` / 長押しではない）。`aria-expanded` + `aria-controls`。文言はアクセシブルネームの対象 span の外に置く。溢れていない時は描画しない |
| T-09 | 折返し品質 | O | `text-wrap: pretty`。1文字だけ次行に落ちるのを防ぐ |

### B. ボディ（14）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| B-01 | スクロールはボディのみ | M | ヘッダ／フッタは固定。ページ全体をスクロールさせない |
| B-02 | スクロール領域のフォーカス可能化 | M | `tabIndex={0}`。Firefox 以外は自動でフォーカス可能にならず、キーボードのみの利用者がスクロールできない |
| B-03 | スクロール領域の名前 | M | B-02 の帰結。`role="group"` + `aria-labelledby`（名前のないフォーカサブル要素を作らない） |
| B-04 | スクロール連鎖の遮断 | M | `overscroll-behavior: contain` |
| B-05 | スクロールバー幅の予約 | S | `scrollbar-gutter: stable` |
| B-06 | 上下のスクロールシャドウ | S | `data-at-start` / `data-at-end` を rAF スロットルで更新 |
| B-07 | セクション | S | `<section aria-labelledby>` + `<h3>`。見出しレベルを飛ばさない |
| B-08 | フォーム項目 | M | ラベル必須、`aria-describedby` でヘルプとエラー、`aria-invalid` |
| B-09 | エラー時のフォーカス移動 | M | 送信失敗時は最初のエラー項目へ。サマリを `role="alert"` |
| B-10 | メディアの CLS 防止 | M | `aspect-ratio` 指定。読み込み後に高さが変わるとモーダルが飛び跳ねる |
| B-11 | 自動再生の禁止 | M | 動画・音声は `autoplay` なし、`controls` あり |
| B-12 | ギャラリー | O | scroll-snap + 前後ボタン + `aria-live` のカウンタ + キーボード左右。reduced-motion で自動送り停止 |
| B-13 | テーブルの横スクロール | S | ラッパに `tabIndex={0}` + `role="group"` + `aria-label`。B-02 と同じ理由 |
| B-14 | グラフのテキスト等価 | M | 図には必ず名前と傾向の要約を添え、元データは表で開閉可能にする。canvas 単体は情報ゼロ。gassan では `Modal.Chart`（`label` と `summary` が必須、`data` は `<details>`、視覚チャートは既定 `aria-hidden`） |

### F. フッタ／ボタン群（12）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| F-01 | 階層は3つまで | M | primary 1 / secondary 1 / tertiary 1 |
| F-02 | 順序 | M | §3-4。DOM 順 = 視覚順 = Tab 順 |
| F-03 | tertiary の左寄せ | S | ボタン列（`.g-footer-actions`）を `flex: 1` にし、その最初の tertiary に `margin-inline-end: auto`。補足（note）があっても崩れない |
| F-04 | モバイル縦積み | S | `flex-direction: column`（**reverse にしない**）+ 全幅。縦積み時は F-03 の auto margin を 0 に戻す |
| F-05 | 最小高さ 44px | M | |
| F-06 | 破壊的操作の色 | M | 位置は据え置き、色のみ danger |
| F-07 | ローディング状態 | M | `aria-busy` + ラベルを `opacity: 0` にしてスピナーを重ね、**幅を変えない**（`visibility: hidden` は名前ごと消える。§10-4） |
| F-08 | 二重送信の防止 | M | ローディング中は click を `preventDefault`。外から渡す `loading` と内部の pending は**論理和**で合成する（`??` で外を優先すると `loading={false}` が内部 pending を消し、`onAction` の最中に連打できる。§10-22）。`onAction` が reject しても pending は必ず解く |
| F-09 | 完了の通知 | S | `role="status"` |
| F-10 | 送信ショートカット | O | `Cmd/Ctrl + Enter` |
| F-11 | `<form method="dialog">` | O | 使う場合、`close` イベントの理由を `submit` として扱う。`showModal()` の前に `returnValue = ''` へ戻す（前回値が残ると次の外部 `close()` が submit に化ける）。ネイティブ側が先に閉じても後始末は行う |
| F-12 | フッタのセーフエリア | M | シート時 `padding-block-end: max(12px, env(safe-area-inset-bottom))` |

### G. 活性化ゲート（12）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| G-01 | `disabled` の禁止 | M | フォーカスが当たらず、なぜ進めないかを本人が確認できない。`aria-disabled="true"` を使う |
| G-02 | ゲートの合成 | M | 名前付きゲートの集合。ボタンは `gate={true}`（全部）か `gate={['read','terms']}`（指定） |
| G-03 | 読了判定は論理和 | M | 末尾センチネル可視化 **OR** 末尾へのフォーカス到達 **OR** スクロール不要 **OR** 明示確認 |
| G-04 | 非スクロール時の即時充足 | M | ウィンドウが大きい／文字が短い場合、スクロールイベントは永久に発火しない |
| G-05 | 末尾センチネルのフォーカス可能化 | M | `tabIndex={0}` + sr-only の「本文の終わりです」。SR 利用者の仮想カーソルはスクロールを発火させない |
| G-06 | 400% ズーム耐性 | S | G-03 の条件が拡大時にも成立すること |
| G-07 | 阻害理由の提示 | M | 押下時に `role="status"` でアナウンス + `aria-describedby` で常時参照可能に |
| G-08 | 阻害箇所への誘導 | S | 未読なら 1 画面分スクロール、未チェックならチェックボックスへフォーカス。**末尾まで一気にスクロールさせてはいけない**（ゲートの意味が消える） |
| G-09 | 充足の粘着 | M | 一度満たしたら、内容の再描画で解除しない |
| G-10 | 非活性ボタンのコントラスト | M | `disabled` と違い `aria-disabled` 要素はフォーカス可能なので、WCAG の非活性コントロール除外規定に頼れない。4.5:1 を維持する。`opacity: .5` で済ませない |
| G-11 | ゲート名の多重登録 | M | 登録簿を `name → entry` で持つと後勝ちになり、**先に登録したほうが unmount しただけで名前ごと消える**。残った条件が未充足でもボタンが押せる＝ fail-open になる。`name → instanceId → entry` の二段で持ち、参照直前に連言（ひとつでも未充足なら未充足）で畳む。畳んだ結果は実際に登録された entry そのものにし、reason と focus を混ぜた合成物を作らない。重複は開発時に警告する。参照側（`gate={['a','a']}`）の重複も 1 件に畳む |
| G-12 | 登録が出揃う前のゲート | M | ゲートは子の effect で登録される。サーバーでは effect が走らず、クライアントでも最初のレンダーでは走っていない。その窓で登録簿は空になるが、`gate={true}` が「空＝条件が無い」と読むと fail-open する。**登録簿が権威を持つ世代**を Root が持ち、出揃うまでは `gate={true}` を未充足として扱う。名前を並べた形は未登録を 1 件ずつ合成するので元から fail-closed、`gate={[]}` は「条件ゼロ」と確定しているので待たせない。フラグは世代（`resetOnClose` の作り直し）と結び付ける。確定の記録は Root の effect で行う（React は子の effect を先に流すので、その時点で配下の登録は済んでおり、同じフラッシュで束ねられてちらつかない）。理由テキストは `GassanLabels` を通す |

### K. キーボード／フォーカス（10）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| K-01 | フォーカストラップ | M | **実装しない。** ネイティブに委譲 |
| K-02 | Esc | M | `cancel` イベント。常に `preventDefault` して自前ルートに集約 |
| K-03 | 初期フォーカス | M | 既定はパネル本体（`tabIndex={-1}`）。×ボタンに当てると SR 利用者が本文を読み飛ばす |
| K-04 | 初期フォーカスの上書き | O | `initialFocus` prop。**タッチ端末でテキスト入力に当てない**（仮想キーボードが跳ね上がる） |
| K-05 | 破壊的ボタンに初期フォーカスしない | M | |
| K-06 | フォーカス復帰 | M | ネイティブが実施。ただしトリガーが unmount された場合は `document.body` に落ちるので fallback を用意 |
| K-07 | `:focus-visible` の可視性 | M | スクリム上・パネル上の双方で 3:1 を確保 |
| K-08 | Tab 順序 | M | DOM 順 = 視覚順。`tabindex` に正の値を使わない |
| K-09 | スクロール領域のキー操作 | M | B-02 の帰結。矢印 / PageDown / Space が効くこと |
| K-10 | ギャラリーの印キー | O | 左右で項目移動。Home / End で端 |

### A. 支援技術（8）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| A-01 | ダイアログの名前 | M | `aria-labelledby`。無い場合のみ `aria-label` |
| A-02 | 説明 | S | `aria-describedby` |
| A-03 | `aria-modal` | S | **付けない。** `showModal()` が top layer + inert で同等以上の効果を持つ。二重指定は一部 SR で挙動が不安定になる |
| A-04 | `role="dialog"` | S | `<dialog>` に明示不要 |
| A-05 | ライブリージョン | M | dialog 内に `role="status" aria-live="polite"` を1つ常設。同一文言の再通知のため一度空にしてから入れる |
| A-06 | 装飾アイコンの除外 | M | `aria-hidden="true"` |
| A-07 | アイコンのみボタンの名前 | M | `aria-label`（「戻る」「閉じる」） |
| A-08 | 見出し構造 | M | ダイアログ内は h2 から始め、セクションは h3 |

### M. モバイル（9）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| M-01 | シート化 | S | 600px 未満。JS で解決してから DOM に流す |
| M-02 | スワイプで閉じる | O | スクロール位置が最上部のときだけドラッグを開始する。さもなくばスクロールと競合する |
| M-03 | ディテント | O | peek / half / full |
| M-04 | 仮想キーボード | S | `interactive-widget=resizes-content` を viewport meta に。VisualViewport でフッタを押し上げる |
| M-05 | セーフエリア | M | C-04 / F-12 |
| M-06 | iOS の背景スクロール | S | `html:has(dialog:modal){overflow:hidden}` だけでは不十分な場合がある。opt-in の JS ロック（scrollY 保存 + `position: fixed` + 復帰）を用意 |
| M-07 | 戻るジェスチャ | O | `history.pushState` 連携。ブラウザバックで閉じる |
| M-08 | ホバー前提の UI 禁止 | M | T-05 の一般化 |
| M-09 | 100vh の禁止 | M | URL バーの伸縮で破綻する。`dvh` を使う |

### D. 実装／DX（14）

| ID | 振る舞い | 度 | 実装の要点 |
|---|---|:-:|---|
| D-01 | ポータル不要 | M | top layer があるので DOM 位置は自由。SSR でもそのまま出せる |
| D-02 | 宣言的 API | M | `<Modal.Root open onOpenChange>` |
| D-03 | 命令的 API | S | `const ok = await confirm({...})`。確認ダイアログは宣言的に書くと state が爆発する |
| D-04 | 状態の DOM 公開 | S | `data-*` 属性（`data-size` / `data-scrim` / `data-placement` / `data-gated` / `data-exiting`）。テストとスタイル上書きの両方に効く |
| D-05 | CSS カスケードレイヤ | S | `@layer gassan`。利用側が詳細度戦争なしで上書きできる |
| D-06 | トークンによるテーマ | M | すべての色・寸法・時間をカスタムプロパティに |
| D-07 | `useEvent` パターン | S | ゲート登録のコールバックが毎レンダー変わると登録・解除ループに入る |
| D-08 | ゲート登録は2つの effect に分ける | M | 更新用（deps あり）と解除用（unmount のみ）。1つにすると cleanup → 再登録で無限ループ |
| D-09 | jsdom 対策 | M | jsdom は `showModal` / `close` / `::backdrop` を実装していない。テスト setup で polyfill する（D-10 参照） |
| D-10 | テスト polyfill | M | `HTMLDialogElement.prototype.showModal = function(){ this.open = true; }` と `close` を setup ファイルで定義し、`cancel` / `close` イベントを手で dispatch する |
| D-11 | `data-*` の受け渡し | M | 閉じた props でも `data-*` はホスト要素へ通す。**TypeScript はハイフンを含む JSX 属性名を過剰プロパティ検査から外すため、捨てると「型は通るのに消える」になる。** 自前の名前は予約し、上書きを拒んで警告する。E2E の選択子がここに依存する |
| D-12 | 構造コンテナの `children` は任意 | S | `children: ReactNode` を必須にしても中身があることは保証できない。`{null}` `{undefined}` `{false}` `{[]}` はすべて ReactNode なので型を通り、弾けるのは実行時に `undefined` と等価な「コメントだけ」の書き方に限られる。保証にならない制約で書き方を縛らない。Root / Header / Body / Section / Footer は任意、Title / Button / Consent / Description など**名前を持つ部品は必須**にして意図を残す。空の本文でも読了ゲートは満たされること（G-03） |
| D-13 | リスト props の識別子は一意 | S | Gallery の `items[].id`、Chips の `options[].value` が重複したら、開発時に**どの prop のどの値か**を名指しで警告する。React の key 警告は prop 名を言わない。重複を黙って間引かない（「2 件渡したのに 1 件しか出ない」は原因に辿り着けない）。描いたうえで知らせる |
| D-14 | 変化の通知は変化したときだけ | S | `onIndexChange` / `onDetentChange` は**利用側が観測できる値が変わったとき**に 1 回だけ鳴らす。マウントしただけ・同じ値に留まる操作では鳴らさない。逆に、props の縮小で位置が切り詰められた・開き直して既定へ戻った、は原因が利用側でも「変わった」なので鳴らす（§10-23） |

---

## 5. 禁止事項

**AI が書きがちな順**に並べてある。1つでも踏んだら書き直す。

| # | 禁止 | 落ちる層 | 理由 |
|---|---|---|---|
| 1 | `<div role="dialog">` + 自作フォーカストラップ | 層1 | ネイティブで解決済み。自作は必ずどこか漏れる |
| 2 | `z-index: 9999` | 層1 | top layer は z-index の外側。書いた時点で設計を誤解している |
| 3 | `{open && <Modal/>}` | 層1 | 退出アニメーションが原理的に不可能になる |
| 4 | `transition` に `overlay` を入れ忘れる／`overlay` だけに頼る | 層1 | 対応ブラウザでは退出が一瞬で消える。`overlay` は非 Baseline なので、入れても未対応ブラウザでは消える。L-07 の fallback を持つ |
| 5 | `createPortal(document.body)` | 層1 | 不要。top layer の意味を無効化する |
| 6 | `useEffect` で `keydown` を監視して Esc 処理 | 層1 | `cancel` イベントを使う。ネストで必ず破綻する |
| 7 | `onClick` 一発で背景クリック判定 | 層2 | テキスト選択のドラッグが外に抜けた瞬間に閉じる |
| 8 | `backdrop-filter: blur(20px)` 決め打ち | 層2 | 描画コストと OS 設定を無視している |
| 9 | スクリム 60〜80% | 層2 | 文脈保持というモーダルの唯一の優位性を捨てている |
| 10 | `100vh` | 層3 | モバイルで破綻 |
| 11 | `document.body.style.overflow = 'hidden'` のみ | 層3 | スクロールバー幅ぶんレイアウトがシフトする |
| 12 | `grid-template-rows: auto 1fr auto` | 層3 | `minmax(0,1fr)` でないとボディが縮まずスクロールしない |
| 13 | `title.substring(0, 30) + '...'` | 層4 | アクセシブルネームが壊れる。CSS でやる |
| 14 | `title` 属性でツールチップ | 層4 | タッチで出ない。WCAG 1.4.13 違反 |
| 15 | 長押しで全文表示 | 層4 | OS のコンテキストメニューと衝突 |
| 16 | `disabled` によるゲート | 層4 | 理由を本人が確認できない |
| 17 | スクロール位置のみで読了判定 | 層4 | SR 利用者が永久に進めない |
| 18 | スクロール領域に `tabIndex` を付けない | 層4 | キーボードのみの利用者が本文を読めない |
| 19 | 初期フォーカスを最初の input に当てる | 層4 | モバイルで仮想キーボードが跳ね上がり、本文が隠れる |
| 20 | 非活性ボタンを `opacity: .4` で表現 | 層4 | コントラスト不足。`aria-disabled` は除外規定の対象外 |

---

## 6. 品質ルーブリック

15点満点。**12点未満は §3 に戻る。**

| 軸 | 配点 | 判定基準 |
|---|---:|---|
| **正統性** | 0-3 | 3=`<dialog>` + top layer + CSS のみで層1を実現 ／ 2=一部 JS 補完 ／ 1=ライブラリ依存 ／ 0=自作トラップ |
| **可逆性** | 0-3 | 3=すべての close 理由が分類され、拒否時にフィードバックがある ／ 0=閉じられない・無言 |
| **到達性** | 0-3 | 3=キーボードのみ・SR のみ・400%ズームの3経路すべてで完遂できる ／ 0=いずれかで詰む |
| **節度** | 0-2 | 2=スクリム・モーション・blur が意図に対して最小 ／ 0=装飾が主張している |
| **適応** | 0-2 | 2=幅・高さ・セーフエリア・仮想キーボード・reduced-* に追従 ／ 0=固定値 |
| **DX** | 0-2 | 2=宣言的と命令的の両 API、`data-*` で状態が観測可能、テストが通る ／ 0=毎回書き直し |

### 採点の構造

```
正統性 と 到達性 は掛け算の関係にある。
  正統性3 × 到達性0 = 「ネイティブを使っているのに使えないモーダル」
  正統性0 × 到達性3 = 「動くが保守できないモーダル」
どちらかが 0 なら他が満点でも不採用。

まず 正統性≧2 かつ 到達性≧2 を確認する。それから節度・適応・DX を積む。
```

### 検算の型

各実装について、次の形式で1文書く。

```
「〜は満たしている。ただし〜。」
```

「ただし」の後ろを埋められたら、それが減点理由。埋まらなくなるまで直す。

---

## 7. 実装の核（これだけは暗記する）

```css
/* 退出アニメーションが成立する最小構成 */
.dialog {
  display: none;
  transition: display 120ms allow-discrete, overlay 120ms allow-discrete;
  /*                  ^^^^^^^^^^^^^^^^^^^^  ^^^^^^^ この2つが要 */
}
.dialog[open] { display: grid; }

.panel { opacity: 0; translate: 0 8px; transition: opacity 120ms, translate 120ms; }
.dialog[open] .panel { opacity: 1; translate: 0 0; transition-duration: 180ms; }
@starting-style { .dialog[open] .panel { opacity: 0; translate: 0 8px; } }

/* スクロールロック */
html:has(dialog:modal) { overflow: hidden; }
```

```tsx
// 開閉同期の最小構成（overlay 非対応でも退出が見える版。L-07）
useEffect(() => {
  const el = ref.current; if (!el) return;
  if (open) {
    clearTimeout(timer.current); el.removeAttribute('data-exiting');   // 退出中の再オープン
    if (!el.open) { el.returnValue = ''; el.showModal(); }
  } else if (el.open) {
    el.setAttribute('data-exiting', '');                               // open のまま退出状態へ
    timer.current = setTimeout(() => {
      el.close();
      void getComputedStyle(el).display;                               // 属性付きでスタイルを確定
      el.removeAttribute('data-exiting');
      onExited();                                                      // 後始末は close() の後
    }, reducedMotion ? 0 : 140);
  }
}, [open]);

// Esc を自前ルートに集約
<dialog onCancel={(e) => { e.preventDefault(); requestClose('esc'); }} />
```

---

## 8. 公開前チェックリスト

```
[層1 レイヤ]
□ showModal() を使っている。フォーカストラップを自作していない
□ z-index / createPortal を書いていない
□ transition に overlay が入っている（対応ブラウザ用）
□ overlay 非対応でも退出が見える（data-exiting → 待って close()、再オープンで取り消し）
□ close 理由が enum で分類されている
□ dismiss 拒否時にフィードバックがある

[層2 スクリム]
□ 不透明度が 32% 前後（immersive 以外）
□ blur は opt-in で、reduced-transparency で切れる
□ 背景クリックは pointerdown / pointerup 両方で判定している
□ ダークテーマで面の明度と境界線により分離している

[層3 コンテナ]
□ 100vh を使っていない
□ grid-template-rows に minmax(0, 1fr) がある
□ env(safe-area-inset-*) を考慮している
□ パネル幅は min(100%, トークン)

[層4 フロー]
□ aria-labelledby が h2 内側の span を指している
□ タイトル省略は CSS の line-clamp のみ
□ title 属性を使っていない
□ スクロール領域に tabIndex と名前がある
□ ゲートは aria-disabled、理由のアナウンスと誘導がある
□ 読了判定が論理和になっている
□ 初期フォーカスがパネル本体（または明示指定）
□ フッタ順序が §3-4 に一致（狭幅でも DOM 順。column-reverse を使っていない）
□ グラフに名前と傾向の要約があり、元データに到達できる

[検証]
□ キーボードのみで完遂できる
□ スクリーンリーダーのみで完遂できる
□ 400% ズームで完遂できる
□ prefers-reduced-motion / reduced-transparency / forced-colors で破綻しない
□ jsdom の polyfill を入れてテストが通る
```

---

## 9. AI コーディング用 圧縮ルール（貼り付け用）

Cursor / Claude Code / Copilot にはこのブロックだけを渡す。

```text
# モーダル実装ルール（React / 2026）

## 必ずこうする
- ネイティブ <dialog> + showModal() / close() を使う。フォーカストラップ・inert・Esc・
  フォーカス復帰は一切自作しない（ネイティブが実施済み）。
- 常時マウントし、open prop の変化を useEffect で showModal()/close() に同期する。
  {open && <Modal/>} は禁止（退出アニメが不可能になる）。
- 退出アニメは CSS が主、JS は待つだけ:
  display: none; transition: display Xms allow-discrete, overlay Xms allow-discrete;
  [open] 側で display: grid;  @starting-style で初期値。transition list に overlay を含める。
  ただし overlay は非 Baseline。close 要求では close() を呼ばずに data-exiting を付け、
  dialog を open のまま退出状態へ遷移させ、Xms（reduced-motion は 0）後に close() する。
  再オープンされたらタイマーを取り消して data-exiting を外す。onExited・リセット・
  フォーカス復帰・スクロールロック解除は close() の後。showModal() の前に returnValue='' 。
- dialog は position:fixed; inset:0; 全画面・透明。中に .scrim(fixed inset 0) と
  .panel を置く。::backdrop は使わず自前 scrim にする。
- スクリムは黒 32%・blur なしを既定とする。blur は明示指定時のみ。
  prefers-reduced-transparency: reduce で blur を 0 にし不透明度を上げる。
- 背景クリックは pointerdown と pointerup の両方が scrim 上のときだけ閉じる。
- パネルは grid-template-rows: auto minmax(0,1fr) auto。1fr 単体にしない。
- 高さは dvh と env(safe-area-inset-*)。100vh 禁止。
- スクロールはボディのみ。ボディに tabIndex={0} と role="group" + aria-labelledby、
  overscroll-behavior: contain を付ける。
- タイトルは <h2> の内側 <span id> に aria-labelledby を向ける。
  省略は CSS の line-clamp のみ。JS で文字列を切らない。title 属性・hover・長押しに頼らない。
  溢れている時だけ「全文を表示」の明示トグル button（aria-expanded + aria-controls）を出す。
- 条件付き活性化のボタンは disabled ではなく aria-disabled="true"。
  押されたら role="status" で理由をアナウンスし、詰まっている箇所へフォーカス／
  1画面分スクロールする。
- 読了ゲートは「末尾センチネルの可視化 OR 末尾へのフォーカス到達 OR
  そもそもスクロール不要 OR 明示確認」の論理和。スクロール位置だけで判定しない。
  センチネルは tabIndex={0} + sr-only テキストを持つ。
- 初期フォーカスはパネル本体（tabIndex={-1}）。×ボタンやテキスト入力に当てない。
- スクロールロックは html:has(dialog:modal){overflow:hidden} + scrollbar-gutter: stable。
- Esc は onCancel で e.preventDefault() し、自前の requestClose(reason) に集約する。
  keydown を監視しない。
- フッタ DOM 順は [tertiary, secondary, primary]。視覚順 = DOM 順 = Tab 順。
  デスクトップはボタン列を flex:1 にし、最初の tertiary だけ margin-inline-end:auto で左へ。
  狭いパネル（400px 以下）は DOM 順のまま column で縦積み。column-reverse は使わない。
- グラフは名前（figcaption）と傾向の要約（aria-describedby）を必ず付け、元データは表で
  開閉可能にする。視覚チャートは既定で aria-hidden。
- close 理由を 'esc'|'backdrop'|'close-button'|'back-button'|'submit'|'programmatic'|'swipe'|
  'route-change' の8種で分類する。

## 絶対に書かない
z-index / createPortal / focus-trap / role="dialog" の div / aria-modal /
100vh / title 属性 / 長押し・hover での全文表示 / disabled によるゲート / JS の文字列切り詰め /
document.body.style.overflow の直接操作 / {open && ...} の条件マウント /
column-reverse でのボタン順の反転 / closedby 属性
```

---

## 10. 実装ノート（実装して初めて出た落とし穴）

§4 の表は設計段階で書いたものだが、次の23件は**実際に動かすまで見えなかった**。
紙の上では正しく、コードにすると壊れる類のものなので、ここに固定しておく。
AI に実装させると、ほぼ確実にこの順序で踏む。

### 10-1. 「スクロール不要なら読了」を閉じている間に判定してはいけない（G-04 の穴）

読了ゲートの成立条件のひとつに「そもそもスクロールが要らない高さだった」を置いた。
これは正しい。だが `<dialog>` は閉じているあいだ `display: none` であり、
`scrollHeight` も `clientHeight` も **0 を返す**。

```
scrollable = scrollHeight - clientHeight > 1   →  0 - 0 > 1  →  false
           → 「スクロール不要」→ 読了成立
```

つまり**一度も表示していない規約に対して、同意ボタンが最初から押せる状態になる。**
同意取得の実装としては致命的で、しかも画面上は何も起きないので気づかない。

```
必ず測定可能性を先に確かめる。
  if (el.clientHeight === 0) return;   // 測れないなら判定しない
```

「0 が返ってきた」と「0 だった」を区別しない計測は、すべてこの穴を持つ。

### 10-2. `"use client"` はバンドラに消される

Next.js App Router 向けに `"use client"` を付けるとき、tsup / rollup の `banner` オプションを使うと、
rollup が「モジュールレベルディレクティブはバンドル時に壊れる」と判断して**黙って削除する**。
ビルドは成功し、警告は1行出るだけで、App Router から import した瞬間に実行時エラーになる。

```
ビルド後にファイルの先頭へ直接書き込む。改行を入れずに連結すれば sourcemap の行がずれない。
そして「先頭にディレクティブがあること」を CI で毎回検査する。
```

### 10-3. 読み上げ専用テキストをボタンの内側に置かない（A-04 / G-07 の穴）

`aria-describedby` で参照するテキストであっても、それが `<button>` の**子孫**にあると、
アクセシブルネームの計算に合流する。

```
×  <button aria-describedby="r">送信<span id="r" class="sr-only">同意が必要です</span></button>
       → 名前が「送信 同意が必要です」になる
○  <><button aria-describedby="r">送信</button><span id="r" class="sr-only">同意が必要です</span></>
```

「処理中」「必須」「未読」のような状態テキストはすべて同じ。**名前と説明は DOM の位置で分ける。**
テストは `toHaveAccessibleName` の厳密一致で書く。部分一致で書くと素通りする。

### 10-4. ローディング中のラベル隠しに `visibility: hidden` を使わない

スピナーを重ねるときラベルを隠したくなるが、`visibility: hidden` と `display: none` は
**アクセシビリティツリーからも要素を除去する**。送信中のボタンが「名前のないボタン」になる。

```
opacity: 0 を使う。幅も保たれるのでボタンが縮まない。
```

### 10-5. 子の登録を親の effect で検査しない

「タイトルが無ければ警告する」を親の effect に書くと、必ず誤検知する。
React の effect は子から先に走るが、子の `setState` が親に届くのは**次のレンダー**だからだ。
親の初回 effect の時点では、正しく `<Title>` を置いていても「無い」と見える。

```
登録の集計を見て判定する処理は 1 tick 遅らせ、cleanup でキャンセルできるようにする。
```

同じ理由で、**未登録のゲートは fail-closed（ブロック側）にする。**
Footer のボタンは Body の Consent より先にレンダーされるので、初回の一瞬だけ必ず未登録になる。
ここで通す実装にすると「開いた直後だけ押せる」という最悪の競合が生まれる。

### 10-6. 登録と解除を同じ effect に同居させない（D-07 の具体化）

```
×  useEffect(() => { register(name, entry); return () => register(name, null); }, [deps])
       → 依存が変わるたびに 解除 → 登録 が走り、その隙間で fail-closed に落ちてちらつく
○  effect を3つに割る
     1. 更新用（cleanup なし）
     2. 名前が変わったときだけ旧キーを掃除
     3. unmount 専用
```

### 10-7. `figure` に `aspect-ratio` を掛けない

キャプション付きのメディアで `figure` 自体に比率を指定すると、
**キャプションの高さを含めて**比率が決まり、画像が潰れる。比率は中の `img` / `video` に掛ける。

### 10-8. 狭幅時にボタン順を反転させない（F-02〜F-04 の穴。v1.2 で方針変更）

v1.0 では「`column-reverse` で primary を上に出す」とし、v1.1 で「フッタ全体に掛けると補足まで落ちるので
ボタン列だけに掛ける」と直した。だが反転そのものが誤りだった。**視覚順と Tab 順・読み上げ順が逆になる。**
v1.2 で `column-reverse` を廃止し、DOM 順のまま縦に積む。

もう一つ、`.g-footer > .g-btn[data-variant="tertiary"]:first-child` という左寄せ規則は、
ボタンが `.g-footer-actions` の中にあるため**一度も一致していなかった**。
ボタン列を `flex: 1` にし、その直下の最初の tertiary に `margin-inline-end: auto` を当てる。
さらに、狭幅の `@container` 規則は同じ詳細度の基本規則より**後ろ**に置かないと負ける。

同じく、コントロール群の `justify-self: end` をボタンに直接掛けると、
右スロットにボタンを2つ置いたとき同じグリッドセルで重なる。**スロットは必ず器で包む。**

### 10-9. テスト環境が「分岐に到達できない」ことがある

jsdom には `PointerEvent` も `HTMLDialogElement.prototype.showModal` も無い。
穴埋めをしないと、`fireEvent.pointerDown(el, { button: 2 })` が素の `Event` になり、
`button` も `isPrimary` も落ちる。すると「右クリックでは閉じない」という分岐は、
**テストから到達できないまま緑になる。**

```
穴埋めは実物に寄せる。
  close() は queueMicrotask で close イベントを流す（実ブラウザは非同期）
  PointerEvent は MouseEvent を継承させる（button が生きる）
そして「穴埋めしたもの＝検証できていないもの」を一覧にして残す。
```

なお jsdom は既定スタイルに `dialog:not([open]) { display: none }` を持っている。
つまり**閉じているモーダルの中身は role で引けない**。これは実ブラウザと同じ挙動なので、
「閉じているのに読み上げられる」類の事故はテストでも検出できる。

### 10-10. `data-exiting` を付けた直後に `close()` しても fallback にならない（L-07 の穴）

v1.1 までの L-07 は「退出中だけ `data-exiting` を付けて高 `z-index`」だった。だが `close()` した瞬間に
dialog は top layer から外れ、`[open]` も消える。`overlay` 非対応ブラウザでは、何を付けても一瞬で消える。
しかも top layer の外では `z-index` の保険も意味がない。

```
×  setAttribute('data-exiting') → close() → 120ms 後に属性を外す
○  setAttribute('data-exiting') → dialog は open のまま退出状態へ遷移 → 120ms 後に close()
```

`overlay` 対応ブラウザで二重待ちを起こさない工夫が1つ要る。`close()` と属性の除去を同じタスクで行うと、
スタイル計算は1回にまとまり、`[data-exiting] { transition: none }` が効かないまま
`display` / `overlay` の discrete transition がもう一周走る（見えない全画面要素が 120ms 居座る）。
**属性を付けたまま `getComputedStyle(el).display` を読んでスタイルを確定させてから外す。**
Chrome での実測では、確定させた場合は close 直後に `display: none`・残存 transition 0 本、
確定させない場合は `display: grid`・transition 2 本が残った。

### 10-11. `returnValue` は勝手に戻らない（F-11 の穴）

`close()` は引数があるときだけ `returnValue` を更新し、`showModal()` は何もしない。
前回 `<form method="dialog">` で閉じた値が残ったまま次に開くと、外部からの `close()` が
「returnValue あり＝submit」と誤分類される。**`showModal()` の前に `returnValue = ''`。**

### 10-12. ネイティブ側が先に閉じると、後始末の経路を通らない

`open` prop の変化だけを見て「`el.open` なら退出を始める」と書くと、`<form method="dialog">` や
外部の `el.close()` で先に閉じた場合、`el.open` はもう false なので何も起きない。
スタックからの除去・スクロールロック解除・`onExited`・中身のリセットがすべて漏れる。
「開いた記録があるのに閉じている」状態を検知して、後始末だけは必ず行う。

### 10-13. ドラッグした指を離すと、ブラウザが click を 1 発足す（H-09 の穴）

シートのつまみを `button` にして「ドラッグでも動く、クリックでも 1 段上がる」と両対応にすると、
**1 回のドラッグで段が 2 つ動く。** `pointerup` のあとにブラウザが合成 `click` を出すためで、
ドラッグの着地と `onClick` が続けて走る。

直し方は「ドラッグ中は click を無効化する」ではない。それだと叩いただけの揺れ（数 px）まで
殺してしまい、タップで段を変えられなくなる。**6px 動いたときだけ、直後の click を 1 回捨てる。**

捨て方にも条件がある。真偽値のフラグを立てっぱなしにすると、パネルの外で指を離して
click が来なかったとき、残骸が次のキーボード操作（Enter）を飲み込む。
**時刻を記録して 400ms で失効させ、次の `pointerdown` でも捨てる。**

### 10-14. ポインタを捕捉しないと、パネルの外で指を離した瞬間に固まる（M-02 の穴）

ドラッグのハンドラをパネルに付けると、ポインタが外へ出た時点で `pointermove` も
`pointerup` も届かなくなる。タッチには暗黙の捕捉があるが、**マウスには無い。**
縮んだ高さのまま、`data-g-dragging` が付いたまま固まる。

`pointerdown` で `setPointerCapture(event.pointerId)` を呼ぶ。合わせて
`lostpointercapture` を**中断**として扱う（段は動かさず元に戻す）。正常に指を離したときも
`pointerup` のあとに届くが、そのときは既にセッションが無いので素通りする。

`setPointerCapture` は既に離されたポインタだと `NotFoundError` を投げる。必ず `try` で囲む。

### 10-15. JS が消したインラインスタイルを、React は書き直さない（C-08 の穴）

シートの高さを React の `style` prop で持ち、ドラッグ中だけ JS が px で上書きする構成は自然だが、
**終了時に `removeProperty` してはいけない。** 吸い付く先が元と同じ段だと state が変わらず
再レンダーが起きないため、React は「自分が書いた値はまだ DOM にある」と信じたまま差分を出さない。
高さの指定が消えたままになり、`block-size` が `auto` に落ちてシートが内容なりに縮む。

戻すべき値は「React が最後に書いた文字列ちょうど 1 つ」であり、
**ref や state から組み立て直すと別の値になる**（まだ同期していない ref を拾う）。
レンダーで使っている変数から同じ関数で作る。書式を 2 箇所に書いた時点で負けている。

### 10-16. 入れ子にすると、内側のイベントが外側のハンドラまで上がる（L-12 の穴）

モーダルの本文からモーダルを開くと、内側の `<dialog>` は外側の `<dialog>` の **DOM 子孫**になる。
ここから2経路で、内側のイベントが外側まで届く。

1. `keydown` のようにネイティブでバブルするもの。素直に DOM を遡る。
2. `cancel` / `close` のようにバブルしないもの。ネイティブは最前面の dialog にしか飛ばさないが、
   **React は `scroll` 以外の非バブルイベントでも fiber ツリーを遡って祖先の `onCancel` / `onClose` を呼ぶ。**
   ネイティブが届けていないイベントを、React が届けてしまう。

結果はどちらも「Esc 一回で重なった2枚が同時に閉じる」。`<dialog>` に任せているつもりでも、
ハンドラを React の prop で書いた時点でこの穴が開く。

**最も近い `dialog.g-dialog` が自分自身のときだけ通す**、で2経路とも塞げる。

```ts
target.closest('dialog.g-dialog') === myDialog
```

同じ罠が DOM 検索にもある。`panel.querySelector('.g-btn[data-variant="primary"]')` は
パネル配下を全部見るので、**本文の中にマウントされた内側のモーダルのボタンを先に拾う**。
内側が閉じていても DOM には居るので、閉じていても誤爆する。
`querySelectorAll` して、自分の dialog に属する最初の 1 件を選ぶ。

### 10-17. 「次の popstate を無視する」印は、いつか必ず漏れる（M-07 の穴）

`popstate` は window のイベントなので、開いている全モーダルの購読者に届く。
素直に書くと戻る 1 回でスタックごと消えるため、**最前面だけが応答する**ようにする。

厄介なのはもう一方で、上のモーダルを × で閉じると、履歴の印を片付けるための
`history.back()` が `popstate` を生む。下のモーダルはこれをユーザーの戻る操作と区別できず、
連鎖して閉じる。ここで「自前の back() だからカウンタを 1 立てて、次の popstate は無視する」と
書きたくなるが、**これは漏れる**。`history.back()` が最初の entry で何も起こさないと
`popstate` が来ず、印が消費されないまま残り、**次の本物の戻るを飲み込む**。
一度漏れると自然には治らない。

状態を持たずに判定できる。**行き先が自分の印そのものなら、戻るジェスチャではない。**

- 上が × で閉じた後始末の `back()` → 下から見た行き先は「自分が積んだ entry」。一致する → 無視。
- ユーザーが戻るを押した → 行き先は自分の entry より手前。一致しない → 閉じる。

カウンタもタイマーも要らない。印の寿命を管理し始めたら、だいたい設計が間違っている。

### 10-18. 内部の `data-*` を守っているのは、予約表ではなくスプレッドの順序（D-11 の穴）

`data-*` を素通しにすると、消費者が `data-kind` のような**内部状態**まで書けてしまう。
そこで予約名の一覧を作り、一致したら捨てて警告する——という作りにした。
正しいのだが、**それが効いていることの確認方法を間違えやすい。**

予約ガードを丸ごと外して「上書きされないこと」を検査するテストを走らせたところ、
**テストは通ってしまった。** JSX は後勝ちなので、

```tsx
<dialog {...domPassthrough(rest, 'Modal.Root')} data-kind={kind}>
```

この順序である限り、濾過が無くても gassan の値が勝つ。
つまり実際に内部状態を守っているのは順序のほうで、予約表が担っているのは
**「黙って捨てない」という警告の層**だけである。両者は別の仕事をしている。

守るべき不変条件は 2 つあり、どちらも静的に固定できる。

- gassan が書く `data-*` は 1 つ残らずスプレッドより後ろにある（順序＝実効的な防御）
- 濾過を通さない生の `{...rest}` を増やさない（警告の層を迂回させない）

振る舞いのテストだけ見ていると、防御が消えても緑のままになる。
**「そのガードを外したらテストは落ちるか」を実際に試す**まで、効いているとは言えない。

---

### 10-19. 名前で引く登録簿は、2 人目が来た時点で fail-open する（G-11 の穴）

ゲートは名前で引く。素朴に `Map<name, entry>` で持つと、同じ名前の 2 人目は後勝ちで上書きになる。
ここまでは「行儀の悪い使い方をすれば壊れる」で済む話に見える。問題は解除側にある。

```
<Gate name="dup" satisfied={false} />   ← A。先に登録
<Gate name="dup" satisfied={false} />   ← B。後勝ちで上書き

A が unmount → registerGate('dup', null) → 名前ごと消える
→ B の条件は未充足のままなのに、参照側からは「そんな名前は無い」
→ ボタンが押せるようになる
```

未登録の名前はわざわざ fail-closed に倒してある（`selectBlockers`）。
その隣で、**登録済みの条件が黙って消えて fail-open する**経路が残っていた。
倒す方向が逆になっているので、片方だけ正しくても意味がない。

`name → instanceId → entry` の二段で持ち、参照の直前に連言で畳む。
畳んだ結果は実際に登録された entry そのものにする。
reason は A、focus は B、のような合成物を作ると、
「A の文言を読み上げてから B へ飛ばす」という最悪の案内になるからである。

### 10-20. 子の effect は親より先に走るので、「親が居るか」をその場で見てはいけない（L-15 の穴）

`confirm()` は描画先（`<ModalHost />`）が無いと Promise が永久に解決しない。
そこで呼ばれた瞬間にホストの有無を見て警告していた。これが誤報を出す。

React の effect は**子から親の順**に走る。`<ModalHost />` をアプリのルートに正しく置いていても、
子コンポーネントの effect から `confirm()` を呼べば、ホストの登録はまだ済んでいない。
正しい構成に対して「ホストがありません」と言う警告になる。

誤報を出す警告は、やがて全部無視される。無視される警告は、無いのと同じではなく**有害**である。
本当に出口が無いときにも読み飛ばされるからだ。

判定を 1 ティック遅らせ、「まだホストが無く、かつ自分がまだ待たされたまま」のときだけ言う。
併せて、本当に危ない 2 つを検出するようにした。
ホストが 2 つ以上あるとき（同じキューの先頭を各々が描き、1 つの回答が全部を解決してしまう）と、
待機中にホストが消えたとき（`await` が返らないという結果だけが残り、原因を辿れない）である。

### 10-21. 「登録簿が空」は「条件が無い」ではない（G-12 の穴）

ゲートは子の effect で登録される。サーバーでは effect が走らず、
クライアントでも最初のレンダーの時点ではまだ走っていない。
その窓で登録簿は空になる。`gate={true}` の実装はこう書いてあった。

```
entries = [...gates.values()]   // 空
blockers = entries.filter(未充足)  // 空
→ ブロッカー 0 件 → 押せる
```

未登録の名前は fail-closed に倒してある（10-19 と同じ方針）。
ところが `gate={true}` は「名前を知らない」ので、未登録を合成しようがない。
結果、**名前を並べた形だけが fail-closed で、全部指定だけが fail-open** という非対称が残った。

直し方は「空を未充足として扱う」ではない。それだと、ゲートが本当に 1 つも無い
`gate={true}` が永久に押せなくなる。区別すべきは**件数ではなく、登録簿が権威を持っているか**である。

Root に「この世代の登録が出揃った」を持たせる。React は子の effect を親より先に流すので、
Root の effect が走る時点では配下の Gate / Consent / Body(readGate) の登録は済んでいる。
登録による setState と「出揃った」の setState は同じフラッシュで束ねられるため、
再レンダーは 1 回で済み、ちらつきも出ない。

フラグを単独の boolean にして effect で false に戻す作りにすると、
`resetOnClose` で子を作り直したときに**戻すまでの 1 レンダーが「空の登録簿 × 確定済み」**になり、
そこだけ fail-open する。確定したのは世代番号のほうなので、世代番号を保存してレンダー時に突き合わせる。

この穴は、SSR スモークに「fail-closed であること」のアサーションが**既にあった**のに見つからなかった。
`html.includes('aria-disabled="true"')` と書いてあり、
`Modal.Gallery` の「前へ」（1 枚目なので正しく無効）に一致して、ずっと緑だったからである。
**空振りするアサーションは、無いより悪い。** 守られている証拠として数えられてしまう。
当該の要素を名指しし、反対側（ゲートを参照しないボタン）が巻き込まれていないことまで見る。

ついでに、未登録ゲートの理由が日本語のベタ書きだった。
`englishLabels` を入れていても、そこだけ日本語が出る。
**ライブラリが出す文字列は、例外なく `GassanLabels` を通す。**
「めったに出ない文言」ほどベタ書きされやすく、だから最後まで残る。

### 10-22. 制御 prop の `false` は「指定なし」ではない（F-08 の穴）

`Modal.Button` は二重送信を 2 つの経路で止める。外から渡す `loading` と、
`onAction` が Promise を返したときに立つ内部の pending である。合成をこう書いていた。

```
const busy = loading ?? pending;
```

`??` は `undefined` のときだけ右へ落ちる。`loading={false}` を渡すと、
**内部 pending が立っていても `busy` は false になる。** `onAction` が解決するまでの間、
何度でも押せる。送信ボタンを `loading={isSubmitting}` で制御するのはごく普通の書き方で、
`isSubmitting` が立つ前の数フレームがまさにこの窓になる。

`loading={false}` が言っているのは「自分の都合では処理中ではない」であって、
「`onAction` の最中でも押させてよい」ではない。どちらか一方でも処理中と言っているなら処理中である。

```
const busy = Boolean(loading) || pending;
```

制御と非制御を混ぜる箇所で `??` を書いたら、`false` を渡されたときに何が消えるかを必ず確かめる。

### 10-23. 「描いた」と「変わった」を区別する（D-14）

`Modal.Gallery` は位置が変わるたびに `onIndexChange` を鳴らす。effect で素直に書くと、
**マウントしただけで `onIndexChange(0)` が飛ぶ。** 計測を繋いだ利用側は幻の表示を 1 回数え、
`setState` を繋いだ利用側は初回に 1 回余分に描き直す。直前に知らせた値を持ち、それと違うときだけ鳴らす。

反対側の穴もある。シートの `onDetentChange` は操作のハンドラの中で鳴らしていたので、
`detents` が縮んで段が丸められたとき・開き直して既定の段へ戻ったときは**何も言わなかった。**
「prop を変えたのは利用側だから知っているはず」という理屈だったが、利用側が知っているのは
自分が渡した配列であって、パネルがどの段に落ちたかではない。Gallery は同じ状況
（`items` が縮んで位置が切り詰められた）で鳴らしており、2 つの部品で約束が逆になっていた。

鳴らす条件は原因ではなく**観測できる値**で決める。通知は「見えている値」の effect から出し、
操作のハンドラからは出さない。閉じている間は見えていないので、次に開いたときに
最後に知らせた値と比べる。

## 付録A. アンチパターン変換表

| よくある実装 | 問題 | 正しい実装 |
|---|---|---|
| `<div className="fixed inset-0 z-50">` | top layer を使っていない | `<dialog>` + `showModal()` |
| `useEffect(() => { document.addEventListener('keydown', onEsc) })` | ネストで最上位以外も閉じる | `onCancel` |
| `<AnimatePresence>{open && <motion.div/>}</AnimatePresence>` | JS で層1を再実装 | `@starting-style` + `allow-discrete` |
| `onClick={(e) => e.target === e.currentTarget && close()}` | ドラッグ抜けで閉じる | `pointerdown` + `pointerup` の一致判定 |
| `<h2>{title.length > 30 ? title.slice(0,30)+'…' : title}</h2>` | 名前が壊れる | CSS `line-clamp` + 完全な DOM テキスト |
| `<span title={title}>` | タッチ不可、WCAG 1.4.13 違反 | 展開トグル |
| `<button disabled={!agreed}>` | 理由が伝わらない | `aria-disabled` + アナウンス + 誘導 |
| `onScroll={e => { if (atBottom) setRead(true) }}` | SR 利用者が詰む | 4条件の論理和 |
| `<div data-slot="x" {...rest}>` | 消費者が内部状態を上書きできる | スプレッドを先頭に置き、自分の `data-*` は後ろ |
| `panel.querySelector('.g-btn[data-variant="primary"]')` | 入れ子の内側のボタンを拾う | `closest('dialog.g-dialog')` で自分のものに絞る |
| `let skipNextPopstate = true` | back() が空振りすると印が漏れる | 行き先の state が自分の印かで判定 |
| `<div className="overflow-y-auto">` | キーボードでスクロール不可 | `tabIndex={0}` + `role="group"` + 名前 |
| `max-h-[90vh]` | モバイルで破綻 | `max-block-size: 100%`（dvh 基準の親） |

## 付録B. 参考資料

| ソース | URL | 要点 |
|---|---|---|
| W3C ARIA APG — Dialog (Modal) Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | モーダルダイアログの規範的な期待挙動 |
| Chrome for Developers — Entry and exit animations | https://developer.chrome.com/blog/entry-exit-animations | `@starting-style` / `allow-discrete` / `overlay` の3点セット |
| MDN — `<dialog>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog | `showModal()` で外側が inert、`closedby`、`requestClose()` |
| MDN — CSS `overlay` | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overlay | Limited availability（not Baseline）、Experimental |
| MDN — `HTMLDialogElement.requestClose()` | https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/requestClose | Baseline 2025。`cancel` → `close` の順 |
| MDN — `HTMLDialogElement.closedBy` | https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy | Limited availability |
| MDN — `prefers-reduced-transparency` | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency | OS の透明度低減設定の検出 |
| Material Design 3 — Elevation / Scrim | https://m3.material.io/styles/elevation/applying-elevation | scrim 32% の根拠 |
| NN/g — The Overuse of Overlays | https://www.nngroup.com/articles/overuse-of-overlays/ | lightbox の利点は文脈を失わせないこと |
| OpenReplay — Accessible modals: dialog vs library | https://blog.openreplay.com/accessible-modals-dialog-vs-library/ | ネイティブ `<dialog>` とライブラリの比較 |
| Vivian Voss — The dialog element | https://vivianvoss.net/blog/the-dialog-element | 不要になったフォーカストラップ実装が今も大量に使われている件 |
| Headless UI #690 | https://github.com/tailwindlabs/headlessui/issues/690 | `backdrop-filter` による実測のパフォーマンス劣化 |
| WebAIM discussion — forcing users to scroll | https://webaim.org/discussion/mail_thread?thread=8934 | 読了強制のアクセシビリティ上の問題 |

---

**Version:** 1.3（2026-10-02）
**v1.3 の変更:** 項目を 128 から 135 に（L-15 / G-11 / G-12 / D-11 / D-12 / D-13 / D-14 を追加）/ F-08 に制御 `loading` と内部 pending の論理和 / §10 に 10-13〜10-23 を追加
**v1.2（2026-09-29）の変更:** L-07 を「open のまま退出して待ってから close()」に改訂 / §3-4・F-02〜F-04 から column-reverse を撤回 / F-11 に returnValue のリセット / B-14 に `Modal.Chart` / T-05・T-06・T-08 に「明示トグル」を明記 / §1-4 を MDN の現況（overlay・closedby は Limited availability、requestClose は Baseline 2025）に更新 / §10 に 10-10〜10-12 を追加。項目数（128）は変えていない
**次回更新の観点:** `overlay` と `closedby` の Baseline 入り、CSS カルーセル（`::scroll-marker`）の普及度を再確認し、§1-4 の表と fallback の要否を更新する
