# ライブラリの見取り図 — native `<dialog>` / Base UI / React Aria / Radix

時点: **2026-09-29**
方針: 一次資料（MDN / W3C / 各公式ドキュメント / GitHub releases）で確認できたことだけを書く。
確認できなかった細部は書かないか「未確認」と明記する。仕様もライブラリも動いているので、採用前には各リンク先を読み直すこと。

---

## 1. 結論

- **kasane はシェル（層1〜3）を native `<dialog>` に任せ、中身のコントロールは Base UI などに委ねる。**
  モーダル自体を Base UI / React Aria / Radix の Dialog で作る案とは競合関係にあり、併用はしない。
- **React Aria と W3C APG は「答え合わせ」に使う。** キーボード操作・フォーカス・名前付けの期待挙動を
  照合する基準として参照し、実装の依存にはしない。
- **`overlay` は MDN 上 Limited availability（Baseline ではない）。** CSS だけの退出アニメに頼らず、
  kasane は今回 JS の fallback（`data-exiting` を付けて `--k-dur-out` 待ってから `close()`）を持った。
- **`requestClose()` は Baseline 2025、`closedby` は Limited availability。** 前者は理由付きの close を
  1経路に集める kasane の設計と同じ方向だが、kasane は `cancel` を常に止めて React 側の `requestClose(reason)` に
  集約しているため、現時点で置き換える必要はない。`closedby` は採用しない。

断定しすぎないために書いておく。Radix / React Aria / Base UI の Dialog は、どれも成熟していて
アクセシビリティにも真剣に取り組んでいる。kasane が native を選ぶ理由は「そちらが劣るから」ではなく、
**2026 年のブラウザが層1を標準で持っているなら、それを使うのが最短**という判断による。

---

## 2. プラットフォーム側の現況（MDN）

| 機能 | MDN の表示（2026-09-29 閲覧） | kasane での扱い |
|---|---|---|
| `<dialog>` / `showModal()` / `close()` | Baseline Widely available（2022-03 から主要ブラウザで利用可） | 層1を全面委譲 |
| `showModal()` 中の外側の inert 化 | `<dialog>` の説明に記載 | 自前の `aria-hidden` 付与はしない |
| `HTMLDialogElement.requestClose()` | **Baseline 2025**（Newly available、2025-05 から） | 使わない。`cancel` → 自前の `requestClose(reason)` で同等の経路を持つ |
| `closedby` 属性 / `closedBy` プロパティ | **Limited availability** | 使わない。`closedby="none"` では `cancel` が出ず、拒否理由を返せない |
| CSS `overlay`（transition 用） | **Limited availability**、Experimental | transition list には入れる（対応ブラウザ用）。**JS fallback を併用** |
| `returnValue` | `close(value)` / `requestClose(value)` で更新 | `showModal()` の前に `''` へ戻す（前回値の持ち越し防止） |

出典:
- MDN `<dialog>` — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- MDN `HTMLDialogElement.requestClose()` — https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/requestClose
- MDN `HTMLDialogElement.closedBy` — https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy
- MDN `HTMLDialogElement.close()` — https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close
- MDN CSS `overlay` — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overlay

`overlay` について補足する。MDN は「`overlay` は作者が値を設定できず、`allow-discrete` の transition list に
入れることで top layer からの除去を遅らせられる」と説明している。つまり**未対応ブラウザでは、`close()` した瞬間に
top layer から外れて消える**。kasane は close 前に `data-exiting` で退出状態を描き、待ってから `close()` するので、
対応の有無にかかわらず退出が見える（手元の Chrome での実測は [`VERIFICATION.md`](../VERIFICATION.md) 第1節）。

---

## 3. 比較

### 3-1. 何を土台にしているか

| | native `<dialog>` | Base UI Dialog | React Aria (Components) | Radix Dialog |
|---|---|---|---|---|
| 形 | HTML 要素 | 未スタイルの React 部品 | 未スタイルの React 部品＋フック | 未スタイルの React 部品 |
| 部品構成（公式の Anatomy） | `<dialog>` のみ | `Root` / `Trigger` / `Portal` / `Backdrop` / `Viewport` / `Popup` / `Title` / `Description` / `Close` | `DialogTrigger` / `ModalOverlay` / `Modal` / `Dialog` / `Heading slot="title"` | `Root` / `Trigger` / `Portal` / `Overlay` / `Content` / `Title` / `Description` / `Close` |
| 描画先 | top layer（ブラウザ） | `Portal`（既定の描画先の明記は Select / Combobox の API 表で `<body>`。Dialog の既定は未確認） | overlay をポータルで描画（旧 `useDialog` 解説に「React Portal で body の末尾へ」） | `Portal` |
| 背景の不活性化 | `showModal()` が外側を inert に | 未確認 | 旧解説に「OverlayProvider が外側を `aria-hidden` にする」 | 概要に「背後の内容を inert にする」旨の記載 |
| フォーカスの閉じ込め | ブラウザ | 未確認 | 「overlay 内にフォーカスを閉じ込め、閉じると戻す」（`FocusScope` / `useDialog`） | 「modal では自動でトラップ」 |
| Esc / 外側クリック | Esc は `cancel`。外側クリックは自前（`closedby="any"` は Limited availability） | 未確認 | `Modal isDismissable`（外側クリック）、`isKeyboardDismissDisabled` | 「Esc で閉じる」 |
| モーダル / 非モーダル | `showModal()` / `show()` | 未確認 | Modal と Popover は別部品 | 両モードをサポートと明記 |

「未確認」は、今回の一次資料の範囲で確かめられなかった項目である。存在しないという意味ではない。

### 3-2. kasane から見た役割

| 候補 | kasane での位置づけ | 理由 |
|---|---|---|
| native `<dialog>` | **シェルそのもの** | 層1（top layer・inert・フォーカス・Esc）がブラウザにある。ポータルも z-index も要らない |
| Base UI | **中身のコントロールの委譲先**（Select / Combobox / Slider など） | 未スタイルで、デザインシステムに載せやすい。Portal の `container` に要素か ref を渡せるので、`showModal()` の inert 領域の内側へ描画できる（[`control-recipes.md`](./control-recipes.md) §3） |
| React Aria | **答え合わせ**（期待挙動の参照） | フォーカス管理・dismiss の props 設計が文書化されている。kasane の振る舞い表（`modal.skill.md` §4）と突き合わせる |
| W3C APG | **答え合わせ**（規範） | modal dialog パターンの期待挙動（フォーカス移動、Tab の循環、Esc、閉じた後のフォーカス復帰、close ボタン） |
| Radix Dialog | 使わない（シェルとして競合） | ポータル＋自前トラップで層1を持つ設計。kasane と同じ層を二重に持つことになる |

### 3-3. APG との差分（記録）

APG の modal dialog パターンは `role="dialog"` の要素に `aria-modal="true"` を付ける前提で書かれている。
kasane はネイティブの `showModal()` がモーダル状態を持つため `aria-modal` を付けない（`modal.skill.md` A-03）。
これは意図した差分であり、スクリーンリーダーでの実挙動は VERIFICATION 第3節の実機確認に含める。

---

## 4. 各ライブラリの出典

| 対象 | URL | 今回確認したこと |
|---|---|---|
| W3C APG — Dialog (Modal) Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | inert な外側、フォーカス移動と閉じ込め、close ボタン、Tab の循環 |
| Base UI — Dialog | https://base-ui.com/react/components/dialog | Anatomy（`@base-ui/react/dialog` からの import と部品構成） |
| Base UI — Select / Combobox | https://base-ui.com/react/components/select ／ https://base-ui.com/react/components/combobox | `Portal` は既定で `<body>` に追加、`container` は HTMLElement / ShadowRoot / RefObject を受け付ける |
| Base UI — Forms handbook | https://base-ui.com/react/handbook/forms | Select / Slider などのラベル付けの作法 |
| Base UI — Releases | https://github.com/mui/base-ui/releases ／ https://base-ui.com/react/overview/releases | v1.0.0 で安定版。パッケージ名が `@base-ui-components/react` から `@base-ui/react` に変更 |
| React Aria — Dialog / Modal | https://react-spectrum.adobe.com/react-aria/Dialog.html ／ https://react-aria.adobe.com/Modal/useModalOverlay | `DialogTrigger` / `ModalOverlay` / `Modal` / `Dialog` の構成、`isDismissable`、フォーカスの閉じ込め |
| React Aria — FocusScope | https://react-aria.adobe.com/FocusScope | `contain` / `restoreFocus` |
| Radix — Dialog | https://www.radix-ui.com/primitives/docs/components/dialog | modal / 非モーダル、フォーカスの自動トラップ、Esc、`Portal` / `Overlay` / `Content` の構成 |

---

## 5. 次に見直すとき

- `overlay` が Baseline に入ったら、JS fallback の待ち時間を残すか（残しても害はない）を再評価する。
- `closedby` が Baseline に入っても、`none` で `cancel` が出ない限り採用しない方針は変わらない。
  `closerequest` / `any` の挙動と `cancel` の関係を MDN で確認し直す。
- Base UI の Dialog 側の「未確認」項目（描画先の既定、inert / フォーカスの扱い）を公式 API 表で埋める。
