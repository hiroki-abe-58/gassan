# gassan

[English](./README.md) · **日本語** · [简体中文](./README_zh.md) · [繁體中文](./README_zh-Hant.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md)

ネイティブ `<dialog>` を土台にした、SaaS のための React UI ライブラリ。

モーダル・フォーム部品・UI 部品・トースト・コマンドパレットから、ログイン・エラー・料金のページ、設定・メンバー・請求を中に持つアプリの枠まで、どれも部品を 1 つ置くだけで出せる。
フォーカストラップ・Esc・背景の inert 化・top layer は**一行も実装していない**。ブラウザに任せている。
日本語・中国語・韓国語の折り返しとアクセシビリティは、仕様に書いてテストで確かめている。

- **モーダル** — 5 つの類型。活性化ゲート（「最後まで読んだら」「チェックしたら」押せるボタンを、`disabled` を使わずに作る）。アクセシブルネームを完全に保つタイトルの省略。8 種類の `CloseReason`（拒否するときは必ず理由を返す）。段で止まるシート。黒 60% の決め打ちをやめた、意図別の 4 段階のスクリム
- **フォーム部品** — テキスト・パスワード・検索・数値・確認コード・チェックボックス・ラジオ・セグメント・評価・スイッチ・チップ・スライダー・セレクト・コンボボックス・日本の祝日と期間の選択を持つカレンダー・時刻・タグ・パスワードの強さ・ファイル。中身はネイティブの要素のまま枠と印を描き替え、色はテーマのアクセントに従う。一覧とカレンダーは top layer に出るので、モーダルに切り取られない。`Field` は、ラベルを入力欄の中に置き、フォーカスや入力で左上へ縮んで退かせる形（`labelPlacement="floating"`）にもできる
- **UI 部品** — ボタン・バッジ・アバター・進み具合・骨組み・カード・数の要約・空の状態・名前と値の一覧・出来事の並び・知らせの帯・タブ・アコーディオン・ツールチップ・ポップオーバー・メニュー・パンくず・ページ送り・ステップ・ページの見出しの帯・データの表（並べ替え・行の選択・まとめての操作）・コマンドパレット（⌘K）
- **トースト** — 消えるまでの残り時間をメーターで見せる。ポインタとフォーカスで止まり、払っても手でも閉じられる
- **ページのテンプレート** — ログイン・アカウントの作成・2 段階認証・パスワードの再設定・メールの確認・ログアウト・IANA に登録された 4xx / 5xx の 40 個すべてとオフラインのエラー・メンテナンス・規約とプライバシーポリシー・よくある質問・料金・お問い合わせ・更新履歴。アプリの枠と、その中の設定・メンバー・料金と請求・はじめの設定・招待を受けるページ
- **日本語・中国語・韓国語の折り返し** — ボタンもタイトルも表のセルもグラフの要約も、語の途中では改行しない。日本語は文節（「プロフィールを｜編集」であって、「プロフィールを編｜集」にはしない）、中国語は語、韓国語は空白の切れ目でだけ折る。タイ語と英語はブラウザがもともと正しく折るので、手を出さない
- **動きとテーマ** — 4 段の動きから選べる（動きを減らす設定には必ず従う）。ライトとダーク、任意のプライマリカラー。どの色を選んでも、文字と塗りが WCAG のコントラスト比を満たすように導く

**ドキュメントサイト: <https://hiroki-abe-58.github.io/gassan/>**
— 設計思想（存在理由・4層モデル・5類型・アクセシビリティ）、スタイル（スクリム・色とコントラスト・テーマ・寸法・折り返し・モーション）、
全コンポーネントとフォーム部品の動くデモと API、ページのテンプレート、256項目の振る舞い仕様を、Material Design 3 のガイドラインのような形で読める。
サイトは日本語・[English](https://hiroki-abe-58.github.io/gassan/#/en)・[简体中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hans)・[繁體中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hant)・[한국어](https://hiroki-abe-58.github.io/gassan/#/ko)・[ไทย](https://hiroki-abe-58.github.io/gassan/#/th) で読める（トップバーの地球の印で切り替える）。
ライト・ダークの表示とプライマリカラーも切り替えられる。どの色を選んでも、文字と塗りが WCAG のコントラスト比を満たすように色を導いている。
表・件数・API の説明はすべて仕様書と型定義からビルド時に生成していて、手で書いた数値は無い。

設計の全文は [`modal.skill.md`](./modal.skill.md)（256項目の振る舞い表・意思決定マトリクス・品質ルーブリック）にある。
AI コーディング時はそのファイルをコンテキストに入れる。

| 文書 | 内容 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md` の256項目が、どのテスト・どの CSS で満たされているかの対応表。`npm run check:trace` が機械検証する |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 元の要件を分解し、「実装済み / 合成で対応 / ロードマップ」を1行ずつ示した監査表 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | gassan の入力部品をモーダルに載せる最小例と、gassan に無い部品をほかのライブラリから包むときの注意 |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | native `<dialog>` / Base UI / React Aria / Radix の比較（2026-09-29 時点、一次資料のみ） |

仕様書（`modal.skill.md`）と `docs/` は日本語で書いている。ドキュメントサイトは説明を 6 言語に訳していて、
仕様書から引いた文（振る舞いの項目名と要点・実装ノート・API の説明）は原文の日本語のまま載せている。

---

## インストール

npm で公開している（[`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan)）。

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer は React 18.2 以上（19 でも動く）。Next.js App Router では `"use client"` 済みなので、そのまま import できる。

ライブラリが出す文字列（読み上げ・ボタンの文言）の既定は日本語。英語にするには `<GassanProvider labels={englishLabels}>` で包む（どちらもパッケージから export している）。
ほかの言語は `labels` に自分の文字列を渡す（部分指定でよい）。ドキュメントサイトの中国語・韓国語・タイ語の文言
（[`site/i18n/<言語>/`](https://github.com/hiroki-abe-58/gassan/tree/main/site/i18n) の `gassan.ts`）を下敷きにできる。
カレンダーの月名・曜日とファイルの大きさは、`labels.locale`（BCP 47。既定は `ja-JP`）から `Intl` で出す。

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
            {(control) => <Modal.Input {...control} />}
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

## ページのテンプレート

アプリのルートに `SiteProvider` を 1 つ置き（製品の名前・ロゴ・行き先・ルーターのリンク部品）、ページは部品を 1 つ置くだけで出す。
テンプレートの見た目は `templates.css` にある。`styles.css` の後に読み込む。

```tsx
import { SiteProvider, SignInPage } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
import '@genelab/gassan/templates.css';

export function SignIn() {
  return (
    <SiteProvider name="Atlas" links={{ home: '/', signUp: '/signup', forgotPassword: '/forgot' }}>
      <SignInPage
        onSubmit={async ({ email, password }) => {
          const ok = await signIn(email, password);
          // 失敗なら既定の文を出す（どちらが違うかを明かさない）
          if (!ok) return { error: true };
        }}
      />
    </SiteProvider>
  );
}
```

ログインした後は `AppShell` が左の案内の帯・上の帯・狭い画面での案内の面を持ち、その中を `SettingsPage`・`MembersPage`・`BillingPage`・`OnboardingPage`・`InviteAcceptPage`・`ChatPage`・`AssistantPage`・`MailboxPage` で埋める。
渡すのはデータと処理だけ。処理が `{ error }` を返すとその文を読み上げ、二度押しは起きない。
日時は `SiteProvider` の `timeZone` で描く。無ければ見ている人の時間帯で描き、hydration を終えるまでは UTC で描くので、サーバーとブラウザで文字が食い違わない。

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

## 折り返し（日本語・中国語・韓国語）

ブラウザに任せると、日本語はどの文字の間でも改行される。狭いボタンは「プロフィールを編｜集」になる。
中国語（「编辑个人资｜料」）と韓国語（「프로필 편｜집」）も、同じように語の途中で割れる。
gassan は語の途中では改行しない。タイトル・説明・ボタン・入力欄のラベル・表のセル・グラフの要約など、部品が文字を描くところはすべて対象。

| 言語 | ブラウザ任せ | gassan |
|---|---|---|
| 日本語 | どの文字の間でも折れる | 文節の切れ目でだけ折る（「プロフィールを｜編集」） |
| 中国語（簡体・繁体） | 語の途中で折れる（「编辑个人资｜料」） | 語の切れ目でだけ折る（「编辑个人｜资料」） |
| 韓国語 | 語の途中で折れる（「프로필 편｜집」） | 空白でだけ折る（「프로필｜편집」） |
| タイ語・ラオ語・クメール語・ビルマ語 | 辞書で語の切れ目を探して折る（もともと正しい） | 手を出さない |
| 英語など空白で語を区切る言語 | 空白で折れる（もともと正しい） | 手を出さない |

言語ごとに、Chrome で狭い箱に入れて実際の改行位置を測って決めた。
タイ語などに手を出さないのは意図的で、`word-break: keep-all` を掛けるとブラウザ自身の辞書の切れ目まで消え、かえって語の途中で折れる。

```tsx
// gassan の部品の中では既定で効いている。自分の UI には Phrase を使う
const edit = (
  <button type="button">
    <Phrase>プロフィールを編集</Phrase>
  </button>
);

// ブラウザ任せに戻す（既定は 'phrase'）
const plain = <GassanProvider lineBreak="browser">{edit}</GassanProvider>;
```

- 言語は文字列の文字で決める。かなを含めば日本語、ハングルを含めば韓国語、どちらも無く漢字を含めば中国語。`lang` 属性を付け忘れても結果は変わらない。
- 切れ目は `Intl.Segmenter` と文字種の規則で決める（依存は足さない）。切れ目に `<wbr aria-hidden="true">` を置き、文字列には `word-break: keep-all` を掛ける。器より長い文節は、はみ出さずに文字単位で折る。韓国語は印が要らず、`keep-all` だけで空白でだけ折れる。
- 文字は 1 つも足さないので、読み上げの名前・コピーした文字列・検索は変わらない。素の `<wbr>` は Chrome で読み上げの名前に空白を混ぜるので、`aria-hidden` を付けている。
- サーバーとクライアントで同じマークアップになる。

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
| `Modal.Field` `Modal.Fieldset` | 1 つの欄と選択肢の束に、名前・ヘルプ・エラーを配線する |
| `Modal.Input` `Modal.PasswordInput` `Modal.SearchInput` `Modal.Textarea` `Modal.NumberField` `Modal.CodeInput` | テキスト入力 |
| `Modal.Checkbox` `Modal.RadioGroup` `Modal.Segmented` `Modal.Rating` `Modal.Switch` `Modal.Chips` | 選択肢 |
| `Modal.Slider` `Modal.RangeSlider` | スライダー（摘みと塗りはテーマの色） |
| `Modal.Select` `Modal.Combobox` `Modal.DatePicker` | 一覧・カレンダーを top layer に出す部品 |
| `Modal.FileDrop` | ファイルの受け皿（ドロップにも `accept` を当てる） |
| `Modal.Table` `Modal.Alert` | 横スクロールする表・送信結果のまとめ |
| `Modal.Chart` | 持ち込んだ図（外部のライブラリ・自前の SVG や canvas）の器。名前（`label`）と傾向のテキスト代替（`summary`）を配線し、元データを `<details>` で開閉する |
| `Modal.Handle` | シートのつまみ。段があれば `role="slider"` の操作子、無ければ掴みどころの飾り |
| `ModalHost` `useModals` | 命令的 API（`await confirm()`） |
| `Modal.Calendar` `Modal.RangeCalendar` `Modal.DateRangePicker` `Modal.TimePicker` `Modal.ColorPicker` | 日本の祝日と期間の選択を持つカレンダーと、テーマで描く時刻の選択と色の選択 |
| `Modal.TagInput` `Modal.PasswordStrength` | タグ（貼り付けと IME に対応）と、新しいパスワードの強さ |
| `toast` `ToastHost` | 残り時間のメーターつきのトースト |
| `Button` `ButtonLink` `IconButton` `CopyButton` `Badge` `Avatar` `AvatarGroup` `Kbd` `Divider` | ページの上（モーダルの外）で使うボタンと印 |
| `Card` `Stat` `EmptyState` `DescriptionList` `Timeline` `Progress` `Spinner` `Skeleton` `Banner` | 器・数・進み具合・知らせ |
| `Tabs` `Accordion` `Tooltip` `Popover` `Menu` `ContextMenu` `Breadcrumbs` `Pagination` `Steps` | 行き来の部品と、起点の脇や右クリックした位置に出る部品 |
| `PageHeader` `DataTable` `CommandPalette` | ページの見出しの帯・データの表（並べ替え・行の選択・まとめての操作）・コマンドパレット（⌘K） |
| `LineChart` `BarChart` `DonutChart` `Sparkline` `BarList` `Gauge` | 依存なしで SVG と HTML で描くグラフ。点をキーでたどって値を読み上げ、元データを表で開け、色はテーマに従う |
| `Carousel` | 指でも、前へ・次へ・点でも送れるカルーセル。自動再生は止めるボタンを先頭に置き、ポインタやフォーカスが乗ると止まる |
| `ChatThread` `ChatComposer` `TypingIndicator` `ChatSuggestions` | 人どうしのチャットと AI との対話。上を読んでいる間は位置を動かさず、日本語の変換中の Enter では送らず、流しながら書く回答は書き終えてから読み上げる |
| `CodeBlock` `TreeView` `NotificationCenter` `Checklist` | 写すボタンつきのコードの塊、矢印キーと打った文字で動くツリー、鈴から開く通知の一覧、手順を終えると次の手順へフォーカスを移すはじめのチェックリスト |
| `SiteProvider` `SignInPage` `SignUpPage` `TwoFactorPage` `ForgotPasswordPage` `ResetPasswordPage` `VerifyEmailPage` `SignOutPage` | ログインとアカウントのページ（`templates.css`） |
| `ErrorPage` `MaintenancePage` `DocumentPage` `FaqPage` `PricingPage` `ContactPage` `ChangelogPage` | エラー・メンテナンス・公開ページ |
| `AppShell` `SettingsPage` `MembersPage` `BillingPage` `OnboardingPage` `InviteAcceptPage` `ChatPage` `AssistantPage` `MailboxPage` | アプリの枠と、その中のページ |
| `GassanProvider` | 文言の差し替え（既定は日本語、`englishLabels` も同梱）と、折り返しの切り替え（`lineBreak`） |
| `Phrase` `splitPhrases` | 自分の UI の日本語・中国語・韓国語にも同じ折り返しを効かせる（gassan の部品の中では既定で効いている） |

フォーム部品には `Modal` を付けない中立の名前（`Field`・`Input`・`Select`・`Calendar` …）もあり、ページの上でもそのまま使える。
入力部品は中身がネイティブの要素で、`Modal.Field` の render prop をそのまま広げて受ける。
選択肢の束（ラジオ・複数チェック・評価・2 つ摘みのスライダー）は `label` ではなく `Modal.Fieldset`（`fieldset` / `legend`）で名前を付ける。
一覧とカレンダーは popover API で top layer に出し、開いているときの Esc は一覧だけを閉じる。
gassan に無い部品（複数選択のコンボボックスなど）は、ほかのライブラリの部品を同じように包む。例は [`docs/control-recipes.md`](./docs/control-recipes.md)。

```tsx
<Modal.Field label="配送方法">
  {(control) => <Modal.Select {...control} value={shipping} onValueChange={setShipping} options={SHIPPING} />}
</Modal.Field>

<Modal.Fieldset label="価格帯">
  <Modal.RangeSlider value={price} onValueChange={setPrice} min={0} max={10000} step={500} showValue />
</Modal.Fieldset>
```

```tsx
<Modal.Chart
  label="月別の売上（万円）"
  summary="3月が最大の120万円。4月以降は100万円前後で横ばい。"
  data={<Modal.Table label="元データ"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 任意のライブラリ。既定で aria-hidden */}
</Modal.Chart>
```

```tsx
import { LineChart } from '@genelab/gassan';

<LineChart
  label="月ごとの売上"
  description="売上は 3 月が最大。"
  data={[
    { month: '1月', revenue: 1180, cost: 820 },
    { month: '2月', revenue: 1240, cost: 850 },
    { month: '3月', revenue: 1520, cost: 900 },
  ]}
  x="month"
  series={[
    { key: 'revenue', label: '売上' },
    { key: 'cost', label: '費用' },
  ]}
  area
  table
/>
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
npm run dev              # examples/react のデモ（Vite）。実機検品の台
npm run site:dev         # ドキュメントサイトを手元で開く（http://localhost:5180）
npm run site:build       # サイトを site/dist に書き出す（npm run site:preview で確認）
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack 検品
npm run check:consumer   # tarball を実インストールして外から検証（ネットワークが要る）
```

ドキュメントサイトは `site/` にある。仕様書・追跡表・検証レポート・`src` の型定義を
ビルド時に読み込んで表と API を組み立てる（`site/plugins/gassan-data.ts`）。
デモのコード表示は、動いているデモのファイルそのもの（`?raw`）なので、見本とコードがずれない。
`main` に push すると GitHub Actions がビルドして GitHub Pages に公開する。

`examples/css-check.html` はブラウザで直接開ける。
top layer・退出アニメ・スクリムの濃度など、jsdom では確かめられない層を目視するためのページ。

検証済みの範囲と、検証していない範囲は [`VERIFICATION.md`](./VERIFICATION.md) に分けて書いてある。
**「テストが緑である」ことと「保証されている」ことは別物**なので、
ブラウザでしか確かめられない18項目は同ファイルの第3節に切り出してある。

変更履歴は [`CHANGELOG.md`](./CHANGELOG.md)、v1.0 までの公開計画は [`ROADMAP.md`](./ROADMAP.md)。

---

## ライセンス

MIT。全文は [`LICENSE`](./LICENSE)。
