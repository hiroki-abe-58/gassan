# CHANGELOG

このファイルは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に従う。
バージョンは [Semantic Versioning](https://semver.org/lang/ja/) に従う。

v1.0 までの公開計画は [`ROADMAP.md`](./ROADMAP.md) にある。

---

## [Unreleased]

### 変更（名前を kasane から gassan へ）

npm に一度も出していないので、利用者への影響は無い。名残を残さないよう全面的に改めた。

| 対象 | 旧 | 新 |
|---|---|---|
| パッケージ | `@genelab/kasane` | `@genelab/gassan` |
| Provider / 文言の型 | `KasaneProvider` / `KasaneProviderProps` / `KasaneLabels` | `GassanProvider` / `GassanProviderProps` / `GassanLabels` |
| CSS のクラス・カスタムプロパティ・状態属性 | `.k-*` / `--k-*` / `data-k-*` | `.g-*` / `--g-*` / `data-g-*` |
| カスケードレイヤ | `@layer kasane` | `@layer gassan` |
| 開発時警告の接頭辞 | `[kasane]` | `[gassan]` |
| リポジトリ | `github.com/hiroki-abe-58/kasane`（仮置き） | `github.com/hiroki-abe-58/gassan` |

`data-kind` のように `data-k` で始まるだけの名前は対象外（`data-k-` の接頭辞だけを改めた）。
置換後も `npm run verify` は全段通り、配布物の raw サイズは 1 バイトも変わっていない。

### 修正（実ブラウザで描いて初めて見えた配置の崩れ 3 件。H-09 / F-02 / A-02）

ドキュメントサイトのデモを実際のブラウザで撮って見比べたところ、jsdom では原理的に見えない
（レイアウトを計算しない）配置の崩れが 3 件あった。どれも既存のデモ（examples/react）でも起きていた。

- **シートのつまみがパネルの下端に出ていた（H-09）** — パネルの格子はヘッダ・本文・フッタの 3 行を
  明示しているが、`.g-handle` に行を割り当てていなかった。自動配置で暗黙の 4 行目（フッタの下）に入る。
  つまみを置いたときだけ `:has(> .g-handle)` で 4 行にし、つまみを 1 行目に置く。
- **ゲートの理由（`Modal.GateStatus`）が本文の先頭へ飛んでいた（F-02 と同じ穴）** — `order: -1` が付いていて、
  README どおり本文の末尾に置いても画面上だけ先頭に出ていた。読み上げ・Tab 順は末尾のまま。
  gassan 自身が「`order` で見た目だけ入れ替えない」と決めているのに、自分の CSS で破っていた。
  `order` を外し、CSS に `order:` が 1 つも無いことをテストで固定した。
- **本文やヘッダに置いた `Modal.Description` が二重に字下げされていた（A-02）** — 置き場所のヘッダも本文も
  左右の余白を持っているのに、説明文自身も余白を足していた。
- 3 件とも、規則を静的に固定するテストを足した（395 テスト）。修正前の CSS で落ちることを確かめてある。
  描画結果そのものは、引き続き実ブラウザでしか確かめられない（ROADMAP v0.4.0）。

### 修正（ブラウザが止めさせない Esc を、拒否して誤報していた。L-09）

ドキュメントサイトの動作確認で、実ブラウザ（Chrome）の同意型モーダルが **2 回目の Esc で閉じた。**
HTML の close watcher は、利用者の操作を挟まずに続けて押された Esc の `cancel` を
`cancelable: false` で送り、`preventDefault()` を無視して閉じる。ページが利用者を閉じ込められないための
濫用防止で、仕様どおりの挙動である。経緯は `modal.skill.md` §10-24 に残した。

壊れていたのは閉じたことではなく、その扱いだった。

- 止められない `cancel` にも拒否の処理を走らせ、「このダイアログはまだ閉じられません」と**読み上げた直後に閉じていた。**
- 直後のネイティブの `close` を外部からの `close()` と区別できず、理由を **`programmatic` と誤報していた。**

`cancelable` が `false` なら止めようとせず、拒否の案内も出さず、`onRequestClose` にも聞かず
（守れない答えを聞かない）、直後の `close` を `esc` として報告するようにした。
ブラウザに逆らって開き直すことはしない。それは濫用防止をすり抜けて利用者を閉じ込める行為である。

- `modal.skill.md` の L-09 と §3-3 に追記した。同意型の「Esc ✕」は「1 回目を止めて理由を返す」までで、
  閉じ込めの保証ではない。閉じたことを同意とみなす設計にしてはいけない。
- `tests/lifecycle.test.tsx` に 2 件追加（392 テスト）。jsdom は close watcher を持たないので、
  `cancelable: false` の `cancel` と `close()` を手で投げて再現する。修正前のコードで 2 件とも落ちることを確かめてある。

### 修正（色のコントラストが約束を破っていた。G-10 / F-06）

`--g-accent-muted` には「白文字で 4.5:1 を維持する」とコメントしてあったが、
実際の値 `#8b91a0` は **3.16:1** だった。G-10 は必須項目で、追跡表では「記述」——
つまり「値は機械検証している」と書いていたのに、検査していたのは
「`opacity` で潰していないこと」までで、**比そのものは誰も計算していなかった。**
ドキュメントサイトの色のページで比を表示しようとして気づいた。

- ライトの `--g-accent-muted` を `#6e7483` に（白文字で 4.68:1）。
- ダークの `--g-danger` を `#e35d54` に（`#e0564d` は面との比が 4.45:1 で、danger ボタンの文字にも
  エラー文にもわずかに足りなかった。4.73:1 になった）。
- ゲート中の secondary / tertiary の文字色を `--g-accent-muted` から `--g-fg-muted` に変えた。
  背景用のトークンを文字色に流用していたのが原因で、ダークでは 2.52:1 だった。
  明るい文字を載せる背景と、暗い面に載る文字の両方で 4.5:1 を取れる色は、ダークでは存在しない。
- `tests/tokens.test.ts` に、ライト / ダークそれぞれでトークンの組（本文・補足・primary・
  ゲート中の primary・danger・エラー文・フォーカスリング）のコントラスト比を計算して落とすテストを足した。
  修正前の値で実際に落ちることを確かめてある。テストは 387 件から 390 件になった。

### 追加（v0.2.0 に向けて先行着手）

- **`Modal.Handle`（H-09）** — シートのつまみ。段を指定していなければ `aria-hidden` の飾り、
  段があれば `role="slider"` の操作子になる。矢印キー・Home / End・クリックでも段を移れる。
  ドラッグできない人の経路を消さないための分岐である。
- **ディテント（M-03）** — `detents={['peek', 'half', 'full']}` と `defaultDetent` / `onDetentChange`。
  行き先の判定は `src/internal/detent.ts` の純粋関数（`resolveDetents` / `snapToDetent`）に切り出してあり、
  レイアウトを持たない jsdom でも検証できる。速い下フリックは**閉じずに 1 段下げる**。
  段がある以上、利用者は「1 段下げたい」つもりで投げるからである。
- **パネルの高さの遷移（C-08）** — `interpolate-size: allow-keywords`。段のあるシートにだけ効かせる。
- 公開 API が 28 個から 31 個になった（`ModalHandle` / `resolveDetents` / `snapToDetent`）。
- テストを 201 件から 314 件に増やした（`tests/detent.test.tsx` 42 件、`tests/tokens.test.ts` に 8 件、
  `tests/sheet-drag.test.tsx` 16 件、`tests/nested.test.tsx` 13 件、`tests/passthrough.test.tsx` 34 件）。

### 修正（props の契約。制御と非制御の混在・重複値・変化通知）

公開 API ごとに「制御／非制御」「非同期」「アンマウント」「動的 props」「空・重複・境界値」を
突き合わせて監査した。どれも**主たる経路は動いているのに、脇の入力で静かに壊れる**種類で、
利用側からは観測しにくい。経緯は `modal.skill.md` §10-22・§10-23 に残した。

- **`loading={false}` で二重送信の防止が外れていた（F-08）** — 外から渡す `loading` と
  内部の pending を `loading ?? pending` で合成していた。`??` は `undefined` のときしか右へ落ちないので、
  `loading={isSubmitting}` のように `false` を渡すと、`onAction` の最中でも何度でも押せた。
  論理和（`Boolean(loading) || pending`）に直した。`onAction` が reject しても pending は解ける。
- **リストの識別子重複を名指しで警告する（D-13、新規項目）** — `Modal.Gallery` の `items[].id`、
  `Modal.Chips` の `options[].value` が重複したら、どの prop のどの値かを開発時に警告する。
  React の key 警告は prop 名を言わない。重複は黙って間引かず、渡した件数のまま描く。
- **変化の通知を「観測できる値が変わったとき」に揃えた（D-14、新規項目）** —
  `onIndexChange` はマウントしただけで `0` を鳴らしていた。直前に知らせた値と違うときだけ鳴らす。
  逆に `onDetentChange` は操作のハンドラの中でしか鳴らさず、`detents` が縮んで段が丸められたとき・
  開き直して既定の段へ戻ったときは黙っていた。Gallery は同じ状況（`items` の縮小で位置が切り詰められた）で
  鳴らしており、2 つの部品で約束が逆だった。通知を「見えている値」の effect から出すようにした。
- **`Modal.Button` も予約名を守る（D-11）** — ここだけは `ButtonHTMLAttributes` をそのまま受けるため
  生の `{...rest}` を通しており、`data-variant` などを渡されても警告が出ていなかった。
  `stripReservedData` を通し、他の部品と同じく警告して落とす。生の `{...rest}` はリポジトリから無くなった。
- 項目を 133 件から 135 件に、テストを 365 件から 387 件に増やした（`tests/props-contract.test.tsx` 22 件）。
  調査用に置いていた `tests/probe.test.tsx` は、全ケースを上へ移したうえで削除した。

### 修正（登録が出揃う前のゲート。独立監査で見つけた 3 件目の fail-open）

ゲートは子の effect で登録される。サーバーでは effect が走らず、クライアントでも
最初のレンダーの時点では走っていない。その窓で登録簿は空になるが、
`gate={true}` の実装はそれを「参照すべき条件が無い」と読み、**ボタンを通していた**。

名前を並べた形（`gate={['terms']}`）は未登録を 1 件ずつ未充足として合成するので、
元から fail-closed だった。同じ窓で `gate={true}` だけが通る、という非対称が残っていた。
経緯は `modal.skill.md` §10-21 に残した。

- **登録が出揃う前のゲート（G-12、新規項目）** — Root に「この世代の登録が出揃った」を持たせ、
  出揃うまで `gate={true}` を未充足として扱う。確定の記録は Root の effect で行う。
  React は子の effect を親より先に流すので、その時点で配下の登録は済んでおり、
  登録による setState と同じフラッシュで束ねられる。再レンダーは 1 回で済み、ちらつかない。
  フラグは**世代番号**として持つ。単独の boolean を effect で false に戻す作りだと、
  `resetOnClose` で子を作り直したときに、戻すまでの 1 レンダーだけ fail-open する。
  `gate={[]}`（条件ゼロだと確定している）は待たせない。
- **空振りしていた SSR アサーション** — `scripts/ssr-smoke.mjs` は
  `html.includes('aria-disabled="true"')` で fail-closed を確かめていた。
  これが `Modal.Gallery` の「前へ」（1 枚目なので正しく無効）に一致し、
  **ゲートが完全に壊れていても緑のままだった。** 当該ボタンを `data-probe` で名指しし、
  ゲートを参照しない側が巻き込まれていないことまで見るようにした。
  空振りするアサーションは、守られている証拠として数えられるぶん、無いより悪い。
- **未登録ゲートの理由が `GassanLabels` を通っていなかった** — 日本語のベタ書きだったため、
  `englishLabels` を入れていてもそこだけ日本語が出ていた。
  `unresolvedReason` を追加し、既定値を `DEFAULT_UNRESOLVED_GATE_MESSAGE` として公開した。
- `selectBlockers` に第 3 引数 `SelectBlockersOptions`（`ready` / `unresolvedReason`）を足した。
  どちらも省略可で、既定は `ready: true`。2 引数で呼ぶ既存のコードの挙動は変わらない。
- 公開 API が 33 個になった（`DEFAULT_UNRESOLVED_GATE_MESSAGE` を追加し、
  `selectBlockers` を dist の検品対象に入れた）。
- テストを 346 件から 365 件に増やした（`tests/gate-readiness.test.tsx` 19 件）。
  振る舞いの項目は 133 件になった。

### 修正（ゲートの多重登録と命令的 API の出口。独立監査で見つけた fail-open）

ゲートの登録簿は `Map<name, entry>` だった。同じ名前で 2 つ登録すると後勝ちになり、
**先に登録したほうが unmount しただけで名前ごと消えていた。**
消えた名前は参照側から見れば「そんな条件は無い」なので、
未充足の条件が残っているのにボタンが押せるようになる。

未登録の名前はわざわざ fail-closed に倒してある（`selectBlockers`）。
その隣で登録済みの条件が黙って消えて fail-open するのは筋が通らない。
経緯は `modal.skill.md` §10-19・§10-20 に残した。

- **ゲート名の多重登録（G-11、新規項目）** — 登録簿を `name → instanceId → entry` の二段にし、
  参照の直前に連言（ひとつでも未充足なら未充足）で畳む。畳む処理は
  `src/internal/gate-registry.ts` の純粋関数（`setGateInstance` / `mergeGateInstances` /
  `duplicateGateNames`）に切り出した。畳んだ結果は**実際に登録された entry そのもの**であり、
  reason と focus を別々の登録者から拾った合成物は作らない。
  「A の文言を読み上げてから B へ飛ばす」案内を生まないためである。名前の重複は開発時に警告する。
- **参照側の重複** — `gate={['a', 'a']}` のように同じ名前を 2 回書いても 1 件に畳む。
  重複を残すと `blockers.length` が実際の条件数と食い違い、件数を出す利用側が嘘をつく。
- **命令的 API の出口の保証（L-15、新規項目）** — 3 つ直した。
  (1) ホストの有無の判定を 1 ティック遅らせた。**React の effect は子から親の順に走る**ため、
  `<ModalHost />` をルートに正しく置いていても、子の effect から `confirm()` を呼ぶと
  同期判定では「ホストがありません」と誤報していた。誤報を出す警告はやがて全部無視される。
  (2) `<ModalHost />` が 2 つ以上あるときに警告する。各々が同じキューの先頭を描くので
  ダイアログが二重に出て、1 つの回答が全部を解決してしまう。
  (3) 待機中にホストが消えたときに警告する。黙って握りつぶすと
  「`await` が返ってこない」という結果だけが残り、原因を辿れない。
- `registerGate` に省略可能な第3引数 `instanceId` を足した。公開型（`ModalContextValue`）なので
  省略時は従来どおり名前そのものが登録者 ID になり、2 引数の呼び出しはそのまま動く。
- 項目を 130 件から 133 件に、テストを 322 件から 365 件に増やした
  （`tests/gate-registry.test.tsx` 24 件）。

### 修正（入れ子のモーダル。v0.2.0 の「ネストの確認」を実機送りにせず前倒しで監査した）

スタックは素の `<dialog>` を直接叩く単体テストしか持っておらず、**実際の `Modal.Root` を
2 枚マウントした経路は一度も通っていなかった**。通してみると 4 件壊れていた。
いずれも描画ではなくイベントの配り方の問題なので、jsdom で真偽が決まる。

- **Esc 一回で 2 枚とも閉じていた（L-12）** — 本文からモーダルを開くと、内側の `<dialog>` は
  外側の DOM 子孫になる。ネイティブの `cancel` は最前面にしか飛ばないが、
  **React は `scroll` 以外の非バブルイベントでも fiber ツリーを遡り、祖先の `onCancel` を呼ぶ。**
  内側で Esc を押すと外側まで閉じていた。`close` も同じ経路で漏れていた
  （こちらは `el.open` の早期 return に偶然救われていた）。
  最も近い `dialog.g-dialog` が自分自身のときだけ通すようにして、両方塞いだ。
- **内側の Cmd/Ctrl + Enter が外側の primary まで押していた（F-10）** — `keydown` は
  ネイティブでバブルするため、外側の `<dialog>` のハンドラにも届いていた。
- **外側の Cmd/Ctrl + Enter が内側の primary を押していた（F-10）** — `panel.querySelector` は
  パネル配下を全部見るので、本文の中にマウントされた内側のモーダルのボタンを先に拾う。
  **内側が閉じていても DOM には居るため、閉じていても誤爆した。**
  `querySelectorAll` して自分の dialog に属する最初の 1 件を選ぶ。
- **戻る 1 回でスタックごと閉じていた（M-07）** — `popstate` は window のイベントなので、
  開いている全モーダルの購読者に届く。最前面だけが応答するようにした。
  併せて、上を × で閉じたときの後始末 `history.back()` が生む `popstate` を
  下がユーザー操作と取り違えて連鎖して閉じる問題も直した。
  **「次の popstate を無視する」印は使っていない**。`history.back()` が最初の entry で
  空振りすると印が消費されず、次の本物の戻るを飲み込むためである
  （この漏れは実際に一度作り込み、既存テストに落とされた）。
  行き先の state が自分の印かどうかで判定する、状態を持たない形にした。

### 修正（`data-*` が黙って消えていた。D-11）

gassan の props はすべて閉じた interface で、宣言していない prop は捨てていた。
ところが **TypeScript は、ハイフンを含む JSX 属性名を過剰プロパティ検査から外す。**
つまり `<Modal.Root data-testid="x">` は型エラーにならず、実行時に黙って消える。
型が「通る」と言い、実装が「捨てる」。利用者からは観測できない。
v0.4.0 で入れる Playwright は `data-testid` でしか要素を掴めないので、実害も出る。

公開面を総なめにしたところ、**23 個中 22 個が落としていた**
（唯一通っていたのは `ButtonHTMLAttributes` を継承していた `Modal.Button`）。

- `data-*` はホスト要素へそのまま渡す。gassan 自身が書く名前（`RESERVED_DATA` 22 個）は
  上書きさせず、渡されたら DEV で警告して gassan の値を優先する。
- `aria-*` など他のハイフン付き prop は受け取らない。**黙って落とすのが問題なのであって、
  落とすこと自体が問題なのではない**ので、警告して落とす。名前は `label` / `Modal.Title`、
  説明は `aria-describedby` と、すでに専用の入口がある。
- 新しい `data-*` を足して予約表への登録を忘れたら落ちるよう、`src/` を走査して照合する。

**実効的な防御はスプレッドの順序のほうだった。** 予約ガードを丸ごと外しても
「上書きされない」ことを見るテストは通ってしまう。JSX が後勝ちなので、
`{...domPassthrough(rest, ...)}` が自分の `data-*` より前にある限り gassan の値が勝つからである。
予約表が担っているのは警告の層だけ、と役割を切り分けた上で、
順序そのものと「生の `{...rest}` を増やさないこと」を静的に固定した（経緯は `modal.skill.md` §10-18）。

受け渡しは **ビルド済みの `dist` でも**確かめる（`check:ssr`）。単体テストは `src/` を
import するので、tsup の変換で壊れても気づけない。消費者が触るのは `dist` のほうである。

### 修正（文書のコード例が誰にも検査されていなかった。D-12）

型チェックの対象は `src` / `tests` / `examples` だけで、**README と docs のコードブロックは
一度もコンパイルされていなかった**。利用者が最初に写すのはそこなので、優先度としては逆である。

`scripts/check-docs.mjs` を足し、`README.md` と `docs/*.md` の tsx / ts / jsx ブロックを
1 ブロック 1 ファイルに展開して `tsc` に通すようにした。初回の実行で 1 件落ちた。

- **README のシート例がコンパイルできなかった** —
  `<Modal.Body>{/* … *\/}</Modal.Body>` が
  `Property 'children' is missing in type '{}' but required in type 'ModalBodyProps'` で落ちる。
  写してそのまま動かない例を載せていた。

原因を追うと、`children: ReactNode` を必須にしても中身があることは保証できないと分かった。
`{null}` `{undefined}` `{false}` `{[]}` はすべて ReactNode なので型を通り、弾けるのは
**実行時には `undefined` と等価な「コメントだけ」の書き方に限られる**。
保証にならない制約で書き方だけを縛っていたことになる。

そこで規約を決め、**D-12** として仕様に起こした。

| 区分 | 対象 | `children` |
|---|---|---|
| 構造コンテナ | `Root` / `Header` / `Body` / `Section` / `Footer` | 任意 |
| 名前を持つ部品 | `Title` / `Button` / `Consent` / `Description` など | 必須（空だとアクセシブルネームが消えるため） |

`Body` と `Section` だけが構造コンテナなのに必須だったので、任意に合わせた。
入力の型を広げる方向なので、既存の利用側コードは壊れない。

- `tests/containers.test.tsx` を追加（8 件）。型の規約は `@ts-expect-error` で両方向に固定してあり、
  必須／任意のどちらにずれても `tsc` が落ちる。実行時は**空の本文でも読了ゲートが満たされる**ことを
  確かめている（満たされないと、読む中身が無いのにボタンが永久に押せない）。
- `VERIFICATION.md` §1 の実行結果が `128 passed (6 files)` のまま腐っていた。実測に直したうえで、
  この節の数値（テスト件数・テストファイル数・項目数・コード例の件数）も `check:trace` の
  照合対象に入れた。照合は 8 箇所から 13 箇所になった。
- CI に `check:docs` を追加。追跡表のステップ名から件数の直書きを外した（腐るため）。

### 変更

- **文書が名指ししている実測バイト数を機械照合するようにした** — テスト件数と公開 API 数は
  `check:trace` が見ていたが、サイズだけ誰も見ておらず、ROADMAP の gzip 値が 1 ビルドぶん
  古いまま残っていた。`check:dist` が `VERIFICATION.md` の実測表と `ROADMAP.md` の
  受け入れ条件を今回のビルドと突き合わせ、ずれたら落ちる。

### 修正（シートのドラッグ。いずれも先行着手分の自己監査で見つけたもの）

ドラッグの判定そのものではなく、**指を離したあとにブラウザが勝手に起こすこと**で
5 件壊れていた。実機でしか出ないと思っていたが、原因はすべて jsdom で再現できた。

- **ドラッグ直後の合成 click で段が二重に動いていた（H-09）** — つまみは `button` なので、
  ブラウザは `pointerup` のあとに `click` を出す。ドラッグで `half` へ吸い付いた直後に
  つまみの `onClick`（1 段上げる）が走り、`full` へ戻っていた。
  `DRAG_SLOP`（6px）を超えて動いた場合だけ、直後の click を 1 回捨てる。
  叩いただけの揺れは tap のまま残し、キーボードの Enter は時間窓（400ms）で守る。
- **パネルの外で指を離すとドラッグが畳まれなかった（M-02）** — ハンドラはパネル上の
  React プロパティなので、ポインタが外へ出た時点で `pointermove` も `pointerup` も届かない。
  マウスには暗黙の捕捉が無く、縮んだ姿で固まる。`setPointerCapture` で捕捉し、
  `lostpointercapture` を中断として扱う。捕捉 API が無い環境では従来どおり動く。
- **同じ段に戻ると高さの指定が消えていた（C-08）** — `--g-sheet-detent` は React が
  style prop として書いている。ドラッグ終了時に `removeProperty` すると、吸い付く先が
  元と同じ段のときは再レンダーが起きず、`block-size` が `auto` に落ちてシートが縮んだ。
  書式を `detentCssValue()` に 1 本化し、終了時は**消すのではなく React が持つ値へ戻す**。
- **掴んだまま閉じると次に開いたとき縮んでいた（M-03）** — `data-g-dragging` と px の高さが
  パネルに残っていた。`open` が false になった時点でドラッグを畳む。
- **段を減らすと `aria-valuenow` が `aria-valuemax` を超えた（M-03）** — `detents` は prop なので
  開いている最中に減りうる。読み取り時に丸め、state と ref も揃え直す。
  （当初はこの丸めで `onDetentChange` を鳴らさないとしていたが、D-14 で
  「見えている段が変わったら原因を問わず鳴らす」に統一した。上の「props の契約」を参照）
- 2 本目のポインタはドラッグ中に割り込めないようにした。`pointerType` が違えば
  どちらも `isPrimary` になりうるため、`isPrimary` だけでは弾けない。

### 予定

- 実機での検品票 B-1〜B-18 の消化（v0.2.0 の残り。端末を触るまで閉じない）
- Playwright + axe による実ブラウザ検証（`VERIFICATION.md` 第3節の B-1〜B-18 の自動化）
- 視覚回帰テスト
- `overlay` 非対応ブラウザ（Safari / Firefox）の実機で、退出 fallback の見え方を確認する
- `closedby` 属性の Baseline 入りにあわせた層1の見直し

---

## [0.1.0] — 2026-09-28

最初の公開。**器だけを作り、中身は作らない**という方針を確定させた版。

### 公開前の追補2 — 追跡表（128項目 → 根拠）

要件の「対応した」を主張から検査結果に変えた。

**追加**

- `docs/traceability.md` — `modal.skill.md` §4 の 128 項目を、状態（実装 / 実機 / 記述 / 未検証 / 委譲 / 合成 / ロードマップ）と
  根拠（テスト名・CSS 文字列・ファイル・ロードマップ項目）に 1 行ずつ結びつけた表
- `scripts/check-trace.mjs` / `npm run check:trace` — 上の表を機械検証する。
  ID の欠落・余剰、`modal.skill.md` との必須度の食い違い、存在しないテスト名の引用、
  必須（M）項目のロードマップ送りを検出して落とす。CI とローカルの `verify` に組み込み済み
- `tests/structure.test.tsx` — 監査で「実装はあるが自動テストが無い」と判明した箇所に 8 件。
  見出しレベル（T-02 / A-08）、コントロールのスロット配置（H-01 / H-02 / H-05 / K-08）、
  ページインジケータの視覚と読み上げの分離（H-06）、テーブルの横スクロール（B-13）

**直した**

- `ROADMAP.md` に v0.2.0 の項目が 2 つ欠けていた（C-08 パネルの高さ変化のアニメーション、
  M-03 シートのディテント）。未実装項目の行き先が無い状態だったので追加
- 追跡表の初稿で B-13 の必須度を M と書いていた（`modal.skill.md` は S）。検証器が検出

**現在の内訳** — 実装 86 / 記述 28 / 委譲 4 / 実機 4 / ロードマップ 3 / 合成 3。
128 項目のうち 86 項目（67%）が自動テストで証明済み。**「未検証」は 0 になった。**

追補3 でテストを 136 件から 201 件に増やし、残っていた 6 項目の穴を埋めた。
あわせて状態「記述」の定義を強め、`C:`（CSS に書いた）だけでなく
`T:`（約束した値を機械検証した）を必須にした。検証器がこれを強制する。

必須（M）79 項目のうち 21 項目は、値は機械検証済みだが**描画結果が未確認**である。
これは `npm run check:trace` が毎回一覧で出力する。v0.4.0 の実ブラウザ CI で埋める。

---

### 公開前の追補（2026-09-29）

未公開のため版は 0.1.0 のまま。元の要件を監査し直して見つけた穴を塞いだ。
監査表は [`docs/requirements-audit.md`](./docs/requirements-audit.md)。

**追加**

- **`Modal.Chart`**（`ModalChart` / `ModalChartProps`）— グラフのヘッドレスな器。
  `label`（図の名前 → `figcaption` / `aria-labelledby`）と `summary`（傾向のテキスト代替 → `aria-describedby`）が必須。
  `data` を渡すと元データを `<details>` で開閉できる。視覚チャートは既定で `aria-hidden`、
  `visualAccessible` で開放する。チャートの描画は持たない。
- `GassanLabels.chartData`（既定「元データを表示」/ 英語「Show data」）。
- 文書 3 本: [`docs/requirements-audit.md`](./docs/requirements-audit.md) /
  [`docs/control-recipes.md`](./docs/control-recipes.md) / [`docs/library-landscape.md`](./docs/library-landscape.md)。
  tarball にも同梱する（`files` に `docs` を追加）。
- デモに「部品の合成（range / radio / file / date / time）」と「グラフ」の2節。

**修正**

- **`overlay` 非対応ブラウザで退出アニメが一瞬で消える。** `data-exiting` を付けた直後に `close()` していた。
  今は dialog を open のまま退出状態へ遷移させ、`--g-dur-out`（`prefers-reduced-motion` なら 0）待ってから `close()` する。
  途中で開き直されたらタイマーを取り消して open のまま戻す。`onExited` / 中身のリセット / フォーカス復帰 /
  スクロールロック解除は `close()` の後。CSS に center / top / sheet の退出状態を追加し、
  `[data-exiting]` の間は dialog の discrete transition を止めて、`overlay` 対応環境での二重待ちを防ぐ。
  効かない `z-index` の保険は削除した。
- **前回の `returnValue` が残り、次の外部 `close()` が `submit` と誤分類される。** `showModal()` の前に `''` へ戻す。
- **ネイティブ側が先に閉じると後始末が走らない。** `<form method="dialog">` や外部の `el.close()` で閉じた場合に、
  スタック・スクロールロック・`onExited`・リセットが漏れていた。
- **狭幅のフッタで視覚順と Tab 順が逆になる。** `column-reverse` を廃止し、DOM 順のまま縦に積む。
- **最初の tertiary が左へ分離されていなかった。** 規則のセレクタが一度も一致していなかった。
  `.g-footer-actions` を `flex: 1` にし、その直下の最初の tertiary に `margin-inline-end: auto`。
- 命令的 `confirm()` の2枚目で、名前なし警告（A-01）が誤検知される。
- `Modal.Gallery` が幅を測れない間（`clientWidth` 0）に位置を 0 と誤算し、ボタンやキーで進めた位置を巻き戻す。
- 閉じた dialog の内側にフォーカスが取り残された場合も、トリガーへ戻すようにした。
- `check-pack` のリンク検査を「文書のあるディレクトリ」基準で解決するようにした（`docs/` 内の相対リンクを正しく判定する）。

**文書**

- `modal.skill.md` を v1.2 に。L-07 の改訂、§3-4 / F-02〜F-04 からの `column-reverse` 撤回、F-11 の `returnValue`、
  B-14 の `Modal.Chart`、タイトル全文は明示トグルのみ（hover / `title` / 長押しではない）、
  §1-4 を MDN の現況（`overlay`・`closedby` は Limited availability、`requestClose()` は Baseline 2025）に更新。
  既存の記述矛盾（F-07 と §10-4、L-12 の属性名、§9 の close 理由）も解消。128 項目の数は変えていない。

### 追加

- **`Modal.Root`** — ネイティブ `<dialog>` + `showModal()` に層1（top layer / フォーカストラップ /
  Esc / 背景の inert 化 / フォーカス復帰）を全面委譲する。該当コードは1行も書いていない。
- **5類型（`kind`）** — `confirm` / `form` / `view` / `consent` / `flow`。
  スクリム濃度・dismiss 可否・配置の既定がこれ1つで決まる。
- **8種の `CloseReason`** — `esc` / `backdrop` / `close-button` / `back-button` / `submit` /
  `programmatic` / `swipe` / `route-change`。`onRequestClose` で理由ごとに拒否できる。
  拒否したときは無言で無視せず、パネルを震わせて理由を読み上げる。
- **活性化ゲート** — `Modal.Gate` / `Modal.Consent` / `Modal.GateStatus` と `Modal.Button gate`。
  `disabled` を使わず `aria-disabled` で表現し、押下時に理由をアナウンスして
  詰まっている場所へフォーカスを移す。
- **読了判定の論理和** — 「末尾センチネルの可視化」「末尾へのフォーカス到達」「スクロール不要な高さ」の
  いずれかで成立。スクロール位置のみの判定をやめ、仮想カーソル利用者が詰まる問題を解消した。
- **タイトルの省略** — CSS `line-clamp` のみで省略する。DOM のテキストは常に完全なので
  アクセシブルネームが壊れない。`title` 属性は使わない（タッチで出ず WCAG 1.4.13 を満たさないため）。
  溢れているときだけ展開トグルを出す。
- **4段階のスクリムトークン** — `subtle 20%` / `default 32%` / `strong 50%` / `immersive 72%+blur`。
  **既定は 32%・blur なし。** blur は明示 opt-in で、`prefers-reduced-transparency` と
  `prefers-reduced-motion` で自動的に落ちる。
- **CSS 主体の出入りアニメーション** — `@starting-style` + `transition-behavior: allow-discrete` +
  `overlay`。退出アニメのために JS ライブラリを使わない（`overlay` 非対応環境向けに、JS は「待ってから `close()`」だけを担う。上の追補を参照）。
- 構造部品 — `Header` / `Controls` / `Back` / `Close` / `Indicator` / `Title` / `Description` /
  `Body` / `Section` / `Footer` / `Button`。
- 内容部品 — `Media` / `Gallery` / `Field` / `Chips` / `Switch` / `Table` / `Alert`。
  `Field` は render prop で、中身はネイティブ入力でも Base UI でも差し替えられる。
- **命令的 API** — `ModalHost` と `useModals().confirm()`。同時要求は FIFO で1枚ずつ出る。
- **`GassanProvider`** — 全文言の差し替え。既定は日本語、`englishLabels` を同梱。
- モバイル — `placement="sheet"`、スワイプで閉じる、safe-area、仮想キーボードの回避。
- `modal.skill.md` を同梱。AI コーディング時にそのままコンテキストへ入れられる。

### 意図的に作らなかったもの

- セレクト / 日付選択 / スライダー / ドロップダウンなどの複雑なフォーム部品。Base UI に委ねる。
- フォーカストラップ、スクロールロックの JS 実装（iOS 向けの opt-in `lockScroll` を除く）、
  退出アニメーションの JS ライブラリ。いずれもプラットフォーム側で解決済みである。
- チャートの描画。`Modal.Chart` は名前・要約・元データの配線だけを持つ。

### 検証

`npm run verify` = typecheck → lint → 201 tests（追補前は 103）→ 追跡検証 → build → dist 検品 → SSR スモーク → pack 検品。
件数は 0.1.0 時点のもの。現在の木は v0.2.0 のシート分を含んで 267 件である（`[Unreleased]` を参照）。
jsdom で保証されない項目（0.1.0 時点で 17、現在は 18）は `VERIFICATION.md` 第3節に分けて記載し、
`examples/css-check.html` で目視できるようにしてある。

[Unreleased]: https://github.com/hiroki-abe-58/gassan/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/hiroki-abe-58/gassan/releases/tag/v0.1.0
