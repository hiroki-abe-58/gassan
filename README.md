# gassan

ネイティブ `<dialog>` を土台にした React のモーダルシェル。
フォーカストラップ・Esc・背景の inert 化・top layer は**一行も実装していない**。ブラウザに任せている。

その代わり、既存ライブラリがほぼ手を付けていない層に集中する。

- **活性化ゲート** — 「最後まで読んだら」「チェックしたら」押せるボタンを、`disabled` を使わずに作る
- **タイトルの省略** — DOM のテキストを切らずに省略し、アクセシブルネームを完全に保つ
- **閉じる理由** — 8種類の `CloseReason` を区別し、拒否するときは必ず理由を返す
- **スクリム** — 黒60%の決め打ちをやめ、意図別の4段階トークンにする

設計の全文は [`modal.skill.md`](./modal.skill.md)（135項目の振る舞い表・意思決定マトリクス・品質ルーブリック）にある。
AI コーディング時はそのファイルをコンテキストに入れる。

| 文書 | 内容 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md` の135項目が、どのテスト・どの CSS で満たされているかの対応表。`npm run check:trace` が機械検証する |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 元の要件を分解し、「実装済み / 合成で対応 / ロードマップ」を1行ずつ示した監査表 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | range / checkbox / radio / toggle / select / text / file / date / time / chips をモーダルに載せる最小例 |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | native `<dialog>` / Base UI / React Aria / Radix の比較（2026-09-29 時点、一次資料のみ） |

---

## インストール

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer は React 18.2 以上（19 でも動く）。Next.js App Router では `"use client"` 済みなので、そのまま import できる。

---

## 最小の例

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>開く</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>プロフィールを編集</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="表示名" required>
            {(control) => <input {...control} type="text" />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">やめる</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>保存する</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**モーダルは常時マウントする。** `{open && <Modal.Root .../>}` と書いてはいけない。
条件マウントにすると、閉じるアニメーションが原理的に描けなくなる。

---

## 5つの類型

`kind` を決めると、スクリム・dismiss・配置の既定が決まる。複数に当てはまるなら、それは分割すべき2つのモーダルである。

| kind | 用途 | スクリム | Esc | 背景クリック |
|---|---|---|:-:|:-:|
| `confirm` | 取り消せない操作の確認 | default | ○ | ○ |
| `form` | 入力 | default | ○ | **×** |
| `view` | 閲覧・拡大 | default | ○ | ○ |
| `consent` | 同意・必須の確認 | strong | **×** | **×** |
| `flow` | 複数ステップ | default | ○ | **×** |

閉じない設定でも無言で無視しない。パネルが震え、理由が読み上げられる。

---

## 活性化ゲート

ここが他のライブラリと最も違う部分。

```tsx
<Modal.Body readGate="read">
  {/* 長い規約 */}
  <Modal.Consent gate="terms">規約に同意します</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>同意して続ける</Modal.Button>
</Modal.Footer>
```

**`disabled` を使わない。** `aria-disabled` にする。
`disabled` はフォーカスを受け取らないので、なぜ押せないのかを本人が確かめる手段が消えるからだ。
押されたら理由を読み上げ、詰まっている場所へフォーカスを移す。

**読了判定は論理和で行う。**

1. 末尾センチネルが可視になった（マウス・タッチ）
2. 末尾マーカーにフォーカスが到達した（キーボード・スクリーンリーダー）
3. そもそもスクロールが要らない高さだった

スクロール位置だけで判定すると、仮想カーソルで読む利用者は scroll イベントを発生させないため、永久にボタンを押せない。

任意の条件は `Modal.Gate` で登録できる。

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="3つ以上選んでください"
  focus={() => listRef.current?.focus()}
/>
```

**ゲートは、登録が出揃うまで閉じている。**

ゲートは子の effect で登録される。サーバーでは effect が走らず、クライアントでも最初のレンダーでは走っていない。
その窓では登録簿が空になるが、それは「条件が無い」ではなく「まだ分からない」である。
`gate` を付けたボタンはサーバー側のマークアップでも `aria-disabled="true"` になり、
マウント後に実際の条件へ差し替わる。ゲートが 1 つも無ければ、そこで押せるようになる。

| 書き方 | 登録前 | 意味 |
|---|---|---|
| `gate` / `gate={true}` | 閉じる | 参照する条件の集合がまだ確定していない |
| `gate={['terms']}` | 閉じる | 未登録の名前は未充足として合成する |
| `gate={[]}` | 開く | 条件ゼロだと確定している。待つ理由が無い |

サーバーのマークアップとクライアントの初回レンダーが一致するので、hydration のずれは起きない。
理由テキストは `GassanProvider` の `unresolvedReason` で差し替えられる。

---

## コンポーネント

| 名前 | 役割 |
|---|---|
| `Modal.Root` | 層1〜3。`<dialog>` / scrim / パネル / ライブリージョン |
| `Modal.Header` `Modal.Controls` | ヘッダと 1fr auto 1fr の3スロット |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | 戻る / 閉じる / 現在地 |
| `Modal.Title` `Modal.Description` | 名前と説明（aria に自動配線） |
| `Modal.Body` `Modal.Section` | 唯一のスクロール領域とサブセクション |
| `Modal.Footer` `Modal.Button` | ボタン階層・ゲート・二重送信防止 |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | 活性化ゲート |
| `Modal.Media` `Modal.Gallery` | 画像・動画・音声・スライダー |
| `Modal.Field` `Modal.Chips` `Modal.Switch` `Modal.Table` `Modal.Alert` | フォーム部品・表 |
| `Modal.Chart` | グラフの器。名前（`label`）と傾向のテキスト代替（`summary`）を配線し、元データを `<details>` で開閉する。描画はしない |
| `Modal.Handle` | シートのつまみ。段があれば `role="slider"` の操作子、無ければ掴みどころの飾り |
| `ModalHost` `useModals` | 命令的 API（`await confirm()`） |
| `GassanProvider` | 文言の差し替え（既定は日本語、`englishLabels` も同梱） |

`Modal.Field` は render prop なので、中身はネイティブ入力でも Base UI でも構わない。
選択肢のグループ（ラジオ・複数チェック）は `label` ではなく `fieldset` / `legend` で名前を付ける。
**コントロールは自作しない。** range / date / time / file / select はまずネイティブ、
検索つきセレクトや摘み2つのスライダーは Base UI に委ねる。例は [`docs/control-recipes.md`](./docs/control-recipes.md)。

```tsx
<Modal.Chart
  label="月別の売上（万円）"
  summary="3月が最大の120万円。4月以降は100万円前後で横ばい。"
  data={<Modal.Table label="元データ"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 任意のライブラリ。既定で aria-hidden */}
</Modal.Chart>
```

---

## `data-*` の受け渡し

すべてのコンポーネントが `data-*` をホスト要素へそのまま渡す。E2E の選択子に使える。

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

2 つだけ通らないものがある。どちらも**黙って捨てずに開発時の警告を出す**。

| 渡したもの | どうなるか | 代わりに |
|---|---|---|
| `data-kind` など gassan が内部で使う名前 | 無視される（内部状態が壊れるため） | 別の名前を使う |
| `aria-label` など `data-` 以外のハイフン付き prop | 無視される | 名前は `label` か `Modal.Title`、説明は `aria-describedby` |

TypeScript はハイフンを含む JSX 属性名を過剰プロパティ検査から外すので、
**これらは型エラーにならない。** 型で止められない以上、実行時に黙らせない。

---

## シートと段（ディテント）

`placement="sheet"` は下から出るパネルになる。`detents` を渡すと、その高さで止まる。

```tsx
<Modal.Root
  open={open}
  onOpenChange={setOpen}
  placement="sheet"
  swipeToDismiss
  detents={['peek', 'half', 'full']}
  defaultDetent="half"
  onDetentChange={(d) => console.log(d)}
>
  <Modal.Handle />
  <Modal.Header>
    <Modal.Title>経路</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

決めごとが3つある。

1. **速い下フリックは閉じない。1 段下げる。** 段がある以上、利用者は「少し縮めたい」つもりで投げる。
   閉じるのは、最下段からさらに下へ投げたときだけ。
2. **つまみはドラッグ専用にしない。** 段があるときは `role="slider"` になり、
   矢印キー・Home / End・クリックでも段を移れる。ドラッグできない人の経路を消さない。
3. **段を指定しなければ、今までどおり内容なりの高さ。** つまみは飾り（`aria-hidden`）に落ちる。
   動かせないものを操作子として読み上げさせない。

行き先の判定は `resolveDetents` / `snapToDetent` という純粋関数に切り出してある（単体で import できる）。

---

## 命令的 API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: '削除しますか', tone: 'danger' });
```

アプリのルートに `<ModalHost />` を1つ置く。同時に2枚要求しても1枚ずつ順に出る。

---

## ブラウザ要件

`<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`
を使う。いずれも Baseline（`<dialog>` は 2022 年、その他は 2023〜2024 年）。

退出アニメに使う CSS の `overlay` だけは **MDN 上 Limited availability（Baseline ではない）**。
そのため gassan は JS の fallback を持つ。閉じる要求を受けたら `data-exiting` を付けて dialog を開いたまま退出状態を描き、
`--g-dur-out`（`prefers-reduced-motion` なら待たない）後に `close()` する。
`onExited`・中身のリセット・フォーカス復帰・スクロールロック解除は、すべて `close()` の後に行う。

`requestClose()` は Baseline 2025、`closedby` は Limited availability。どちらも使わず、
`cancel` を止めて自前の `requestClose(reason)` に集約している（詳細は [`docs/library-landscape.md`](./docs/library-landscape.md)）。

古い環境では「アニメーションしないモーダル」に劣化するだけで、開閉とアクセシビリティは保たれる。

---

## 開発

```bash
npm install
npm run dev              # examples/react のデモ（Vite）
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack 検品
npm run check:consumer   # tarball を実インストールして外から検証（ネットワークが要る）
```

`examples/css-check.html` はブラウザで直接開ける。
top layer・退出アニメ・スクリムの濃度など、jsdom では確かめられない層を目視するためのページ。

検証済みの範囲と、検証していない範囲は [`VERIFICATION.md`](./VERIFICATION.md) に分けて書いてある。
**「テストが緑である」ことと「保証されている」ことは別物**なので、
ブラウザでしか確かめられない18項目は同ファイルの第3節に切り出してある。

変更履歴は [`CHANGELOG.md`](./CHANGELOG.md)、v1.0 までの公開計画は [`ROADMAP.md`](./ROADMAP.md)。

---

## ライセンス

MIT。全文は [`LICENSE`](./LICENSE)。
