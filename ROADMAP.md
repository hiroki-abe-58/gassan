# ROADMAP

段階的に出す。各版の「受け入れ条件」は、観察して真偽が決まる形で書く。
書けないものはスコープに入れない。

---

## 方針

1. **層1を実装しない。** ブラウザが持っている機能（top layer / フォーカストラップ / inert / Esc）を
   再実装した瞬間に、このライブラリの存在理由が消える。
2. **中身の部品を自作しない。** range / date / time / file / select はネイティブ、
   検索つきセレクト・コンボボックス・摘み2つのスライダーは Base UI に委ねる。
   `Modal.Field` の render prop と `fieldset` / `legend` がその境界（[`docs/control-recipes.md`](./docs/control-recipes.md)）。
3. **API を増やす前に、既存 API の穴を塞ぐ。** コンポーネントの数は競争力ではない。
4. **各版に「これができるようになった」を1文で書けること。** 書けないなら出さない。

---

## v0.1.0 — シェルとゲート（完了）

**これができる**: 閉じる理由を区別し、読了と同意をゲートにした同意ダイアログを、`disabled` を使わずに作れる。

- [x] `<dialog>` + `showModal()` に委譲した Root
- [x] `CloseReason` 8種と dismiss ポリシー、拒否時のフィードバック
- [x] スクリム4段階トークン（既定は黒32%・blur なし）
- [x] CSS `line-clamp` によるタイトル省略と展開トグル
- [x] 読了ゲート（可視 / フォーカス到達 / スクロール不要 の論理和）
- [x] `aria-disabled` ベースのゲート付きボタンと理由の読み上げ・誘導
- [x] ギャラリー・フォーム部品・命令的 `confirm()`
- [x] `Modal.Chart`（グラフの名前・傾向の要約・元データの開閉。描画はしない）
- [x] `overlay` 非対応ブラウザでも見える退出アニメ（`data-exiting` → 待って `close()`）
- [x] フッタの視覚順 = DOM 順 = Tab 順（狭幅でも反転しない）
- [x] 要件監査・コントロールの合成レシピ・ライブラリ比較の3文書（`docs/`）
- [x] `data-*` の受け渡し（D-11。E2E の選択子が通る。予約名は守り、落とすときは警告する）
- [x] 135 項目の追跡表（`docs/traceability.md`）と、それを機械検証する `check:trace`
- [x] 387 テスト / 型チェック / lint / dist 検品が CI で通る
- [x] 公開形態の整備（LICENSE / CHANGELOG / `publishConfig.access` / dual-package の型条件）

**受け入れ条件（すべて満たした）**

数値はこの木で `npm run verify` / `npm run check:dist` が出す実測値であり、
`npm run check:trace` が文書との食い違いを落とす。v0.2.0 で先行着手したシート分を含む。

- `npm run verify` が緑（typecheck → lint → 387 tests → trace → docs → build → dist → SSR → pack）
- `dist/index.js` が gzip 22 KB 未満、`styles.css` が gzip 6 KB 未満
  … 実測 19,482 B / 4,885 B（2026-10-02 再計測。v0.2.0 のシート分・入れ子の修正・data-* の受け渡し・ゲートの登録まわり・props の契約の修正を含む）
- `"use client"` が両フォーマットの先頭にある
- 公開 API 33 個が dist に存在する
- `modal.skill.md` の 135 項目が 1 件残らず `docs/traceability.md` に現れ、
  各行の根拠（テスト名・CSS の文字列・ファイル）が実在する
- 実機検品票 B-1〜B-18 が、`VERIFICATION.md` と `examples/css-check.html` で一致する
- `npm run check:consumer` が緑。tarball を実インストールし、
  `bundler` / `node16` / `nodenext` の3解決方式すべてで型が通る

**公開手順**

```bash
npm run verify            # prepublishOnly でも自動で走る
npm run check:consumer    # 外からの見え方を最終確認
npm publish               # publishConfig.access: public 済み
```

`repository` / `homepage` / `bugs` は実在するリポジトリ `github.com/hiroki-abe-58/gassan` を指している。
npm にはまだ出していない（`@genelab/gassan` は 2026-10-02 時点で未使用）。

---

## v0.2.0 — 実機とシート

**これができる**: スマートフォンでボトムシートとして開き、下フリックで閉じられる。その挙動を実機で確認済みと言える。

コードで閉じられる部分（つまみ・ディテント・高さの遷移）は先に実装し、`jsdom` で 58 件の
テストを当てた（判定式 42 件 ＋ 指を離したあとの経路 16 件）。
残りは **実機でしか真偽が決まらない項目** であり、端末を触るまで `[ ]` のままにする。

先行実装の自己監査で、**ドラッグそのものではなく「指を離したあと」で 6 件壊れていた**
（合成 click による段の二重移動、パネル外での固着、React が持つインラインスタイルの消失、
掴んだまま閉じたときの残留、`detents` 短縮時の不正な ARIA、2 本目のポインタの割り込み）。
実機でしか出ないと思っていたが、原因はすべて `jsdom` で再現できた。
経緯は `modal.skill.md` §10-13〜15 と CHANGELOG に残した。

- [ ] `VERIFICATION.md` 第3節の検品票 B-1〜B-18 を実機で消化し、結果を表に記録
      （`examples/css-check.html` を実機で開くと同じ 18 項目がチェックボックスになっている。
      シートの段は `examples/react` のデモ 9 で触れる）
- [ ] `overlay` 非対応ブラウザ（Safari / Firefox）で退出 fallback が見えること（B-5）
- [ ] iOS Safari / Android Chrome での背面スクロールと仮想キーボード
- [x] `Modal.Handle`（シートのつまみ。スワイプ領域を明示する。段があれば `role="slider"`、無ければ飾り）
- [x] シートのディテント（peek / half / full）とスワイプでのスナップ（M-03。判定は `src/internal/detent.ts` の純粋関数）
- [x] パネルの高さ変化のアニメーション（`interpolate-size: allow-keywords`。フロー型で本文が差し替わるとき。C-08）
- [ ] ネストしたモーダルの実機確認（スクリムの二重掛け、フォーカス復帰の連鎖）
- [ ] `closeOnBack` の実挙動と、Next.js App Router での相互作用

**受け入れ条件**
- iOS 18+ / Android の実機2種で B-13・B-14 が再現しない
- 2枚重ねたとき、背景の暗さが1枚のときと同じである（スクリーンショット比較）

---

## v0.3.0 — 他のエコシステムと繋ぐ

**これができる**: Base UI の Select や react-hook-form を、配線を書かずにモーダルへ載せられる。

- [ ] `Modal.Field` と react-hook-form の統合例（`register` をそのまま渡せる形）
- [ ] Base UI（`@base-ui/react`）の Select / Combobox / Slider を載せた実例と、
      「Portal の `container` をパネルに向けたとき、inert・スクリム・Esc の順序がどうなるか」の検証
- [ ] `Modal.Form`（`<form method="dialog">` を安全に使うラッパ。`returnValue` の型付け）
- [ ] 送信エラーのまとめを `Modal.Alert` に集約するパターン

**受け入れ条件**
- Base UI の Select をモーダル内で開いたとき、選択肢がスクリムの下に隠れない
- フォーム送信の失敗が、フォーカス移動つきで1箇所に集約される例が動く

---

## v0.4.0 — 実ブラウザの CI

**これができる**: 「アクセシビリティが壊れていないこと」を人手ではなく CI が言える。

- [ ] Playwright + axe-core を Chromium / WebKit / Firefox で実行
- [ ] 視覚回帰（scrim 4段階 × placement 3種 × ライト/ダーク）
- [ ] `prefers-reduced-motion` / `forced-colors` のエミュレーション込み検査
- [ ] キーボードのみの操作でフロー型を最後まで完了できることの自動確認

**受け入れ条件**
- axe の violations が 0 件（incomplete は許容し、理由を記録）
- VRT の差分が意図した変更のみ

---

## v0.5.0 — ヘッドレス層の分離

**これができる**: 自分のデザインシステムの見た目のまま、gassan の振る舞いだけを使える。

- [ ] `useModalShell()` / `useGate()` を公開し、DOM を利用側が書ける形にする
- [ ] `styles.css` を任意にする（クラス名に依存しない構成）
- [ ] Tailwind プリセット（`@genelab/gassan/tailwind`）
- [ ] トークンのカスタマイズ手順書

**受け入れ条件**
- 既存のデモを、`styles.css` を読み込まずに Tailwind だけで再現できる

---

## v1.0.0 — 凍結

- [ ] API の破壊的変更を止める宣言
- [ ] ドキュメントサイト（各項目が `modal.skill.md` の ID と相互リンク）
- [ ] 移行ガイド（Radix Dialog / react-modal / Headless UI から）

**受け入れ条件**
- v0.5 から 3 ヶ月、公開 API に破壊的変更が入っていない
- 自分以外のプロジェクトで 1 件以上使われている

---

## 発表の順序

ライブラリを作ったこと自体は記事の主題にしない。**主題は常に、読者が自分の環境で今すぐ動かせる標準技術のほうに置く。**
新しく作ったものを主役にすると、読者にとっては「知らない名前の話」になり、評価も伸びない。

| # | 媒体 | 主題 | gassan の扱い |
|---|---|---|---|
| 1 | Qiita / Zenn | `<dialog>` と `showModal()` — フォーカストラップを自作しなくてよくなった話 | 最後に実装例として1節 |
| 2 | Qiita / Zenn | `@starting-style` と `allow-discrete` — 退出アニメを CSS だけで書く | `overlay` の落とし穴を実演 |
| 3 | note | 「モーダルが毎回しっくりこない」の正体を 130 項目に分解した | `modal.skill.md` の公開 |
| 4 | Zenn | 活性化ゲート — `disabled` を使わずに「読んだら押せる」を作る | ここで初めて主役にする |
| 5 | GitHub | v0.2 リリース。実機検証の結果表を添える | — |
| 6 | YouTube / TikTok | スクリム黒60%と32%の見え方の比較（30秒） | — |

1 と 2 は公開から年数の経った Baseline 技術が主題なので、読者も評価系も前提知識を持っている。
3 で問題意識を共有し、4 で初めて「それを解いたもの」として出す。

---

## やらないと決めたこと

| 項目 | 理由 |
|---|---|
| フォーカストラップの自前実装 | ブラウザが持っている。再実装は退化 |
| セレクト・日付選択・コンボボックスの自作 | ネイティブか Base UI のほうが良い。競う意味がない |
| チャートの描画 | 描画ライブラリは選択肢が多く、用途で最適解が違う。gassan は名前・要約・元データの配線（`Modal.Chart`）だけを持つ |
| トースト・ポップオーバー・ツールチップ | モーダルではない。別の問題 |
| アニメーションライブラリへの依存 | CSS だけで足りる。依存ゼロを保つ |
| `<dialog>` を使わないフォールバック | 対象ブラウザがすべて対応済み。分岐を持つほうが危険 |
| React 以外への移植 | 先に React で 1.0 にする |
