# 入力部品のレシピ

モーダルの中に置く入力部品の最小例。v1.6 の仕様（I-01〜I-15）から、gassan は入力部品を自分で持つ。
**中身はネイティブの要素のまま、枠と印だけを描き替える。** ネイティブで足りないセレクト・コンボボックス・
カレンダーだけを WAI-ARIA APG のパターンどおりに作った。それでも足りないもの（複数を選べるコンボボックス、
日付の範囲選択など）は、ほかのライブラリの部品を同じ配線で包む（§3）。

名前の付け方は 2 通りしかない。

| 境界 | 使う場面 | gassan が渡すもの |
|---|---|---|
| `Modal.Field` | **1 つの欄**に名前・補助文・エラーを付ける | render prop で `id` / `aria-describedby` / `aria-invalid` / `aria-required` |
| `Modal.Fieldset` | **選択肢の束**（ラジオ、複数チェック、評価、2 つ摘みのスライダー）に名前を付ける | `fieldset` + `legend`。ヘルプとエラーは束の説明（`aria-describedby`） |

束に `label` を使わないこと。`label` は 1 つのコントロールにしか結び付かず、
「配送方法」という問いがラジオ群の名前として読み上げられない。束の名前は `legend` の仕事である。

以下のコードはすべて `<Modal.Body>` の中に置く前提で、`import { Modal } from '@genelab/gassan'` 済みとする。
どの部品も `value`（制御）と `defaultValue`（非制御）の両方を受ける（I-01）。

---

## 1. どれを使うか

| 欲しいもの | gassan の部品 | 仕様 |
|---|---|---|
| テキスト・メール・URL・電話 | `Modal.Input`（`start` / `end` で単位や記号） | I-03 |
| パスワード | `Modal.PasswordInput` | I-04 |
| 検索 | `Modal.SearchInput` | I-05 |
| 複数行 | `Modal.Textarea`（`maxLength` で文字数） | I-06 |
| 数値 | `Modal.NumberField` | I-07 |
| 確認コード | `Modal.CodeInput` | I-08 |
| チェックボックス・ラジオ・セグメント・評価 | `Modal.Checkbox` / `Modal.RadioGroup` / `Modal.Segmented` / `Modal.Rating` | I-09 |
| トグル・タグ | `Modal.Switch` / `Modal.Chips` | — |
| スライダー（1 つ・2 つ摘み） | `Modal.Slider` / `Modal.RangeSlider` | I-10 |
| ドロップダウン | `Modal.Select` | I-11 |
| 打って絞り込むドロップダウン | `Modal.Combobox` | I-12 |
| 日付（カレンダー） | `Modal.DatePicker` | I-13 |
| 日付・時刻・色（ネイティブ） | `Modal.Input` に `type="date"` / `"time"` / `"color"` | I-15 |
| ファイル | `Modal.FileDrop` | I-14 |
| ラベルを欄の中に置く（浮くラベル） | `Modal.Field` の `labelPlacement="floating"` と `Modal.Input` / `Modal.PasswordInput` | I-24 |
| 全角半角・ハイフン・かなを受け取った側でそろえる | `Modal.Input` の `normalize`（`toHalfWidth` / `normalizeText` / `toKatakana` / `formatPostalCode` / `normalizePhone` など） | I-25 |
| 自動入力が効くドロップダウン（都道府県・国・生年月日） | `Modal.NativeSelect` | I-26 |
| 日本の住所（郵便番号から住所を入れる） | `AddressFields`（`lookup` を渡す） | I-27 |
| 姓名とフリガナ | `NameFields` | I-28 |
| 生年月日（和暦と満年齢） | `BirthDateInput` | I-29 |
| メールアドレス（打ち間違いの候補・携帯会社のメール） | `Modal.EmailInput` | I-30 |
| 振込先の口座（ゆうちょ銀行の記号・番号） | `BankAccountFields` | I-31 |

---

## 2. レシピ

### 2-1. テキスト / テキストエリア

```tsx
<Modal.Field label="表示名" required help="全角20文字まで" error={nameError}>
  {(control) => <Modal.Input {...control} value={name} onChange={(e) => setName(e.target.value)} />}
</Modal.Field>

<Modal.Field label="ひとこと">
  {(control) => <Modal.Textarea {...control} maxLength={140} value={memo} onChange={(e) => setMemo(e.target.value)} />}
</Modal.Field>
```

`Modal.Input` と `Modal.Textarea` は input / textarea の属性をそのまま受け、`ref` も中の要素に届く。
`className` だけは外側の枠に付く。

`initialFocus` でテキスト入力を指定しても、タッチ端末ではパネル本体に当たる（K-04）。
仮想キーボードが本文を隠すのを防ぐためで、意図した挙動である。

### 2-2. パスワード・検索・数値・確認コード

```tsx
<Modal.Field label="パスワード" help="8 文字以上">
  {(control) => <Modal.PasswordInput {...control} autoComplete="new-password" minLength={8} />}
</Modal.Field>

<Modal.SearchInput aria-label="部品を探す" value={query} onChange={(e) => setQuery(e.target.value)} />

<Modal.Field label="席数">
  {(control) => <Modal.NumberField {...control} value={seats} onValueChange={setSeats} min={1} max={20} unit="席" />}
</Modal.Field>

<Modal.Field label="確認コード" help="メールで届いた 6 桁">
  {(control) => <Modal.CodeInput {...control} value={code} onValueChange={setCode} onComplete={verify} />}
</Modal.Field>
```

### 2-3. チェックボックス（複数）— Fieldset

```tsx
<Modal.Fieldset label="通知の方法" help="1 つ以上選ぶ" required>
  <Modal.Checkbox
    checked={selected.includes('mail')}
    onCheckedChange={(on) => setSelected(on ? [...selected, 'mail'] : selected.filter((v) => v !== 'mail'))}
    description="1 日 1 通まで"
  >
    メール
  </Modal.Checkbox>
  <Modal.Checkbox
    checked={selected.includes('push')}
    onCheckedChange={(on) => setSelected(on ? [...selected, 'push'] : selected.filter((v) => v !== 'push'))}
  >
    プッシュ通知
  </Modal.Checkbox>
</Modal.Fieldset>
```

補足（`description`）は `<label>` の外に置かれ、`aria-describedby` で結ばれる。中に置くと補足まで名前になる（§10-31）。
「すべて選択」には `indeterminate` を渡す（読み上げは mixed）。

### 2-4. ラジオ・セグメント・評価 — Fieldset

```tsx
<Modal.Fieldset label="配送方法">
  <Modal.RadioGroup value={shipping} onValueChange={setShipping} options={SHIPPING} />
</Modal.Fieldset>

<Modal.Fieldset label="プラン">
  <Modal.Segmented value={plan} onValueChange={setPlan} options={KINDS} />
</Modal.Fieldset>

<Modal.Fieldset label="満足度">
  <Modal.Rating value={rating} onValueChange={setRating} />
</Modal.Fieldset>
```

中身はどれも同じ `name` のネイティブの radio。矢印キーでの移動と、Tab で束に 1 回だけ止まることはブラウザが守る。
Fieldset の外で使うなら `aria-label` を渡す（そのときだけ `role="radiogroup"` になる）。

### 2-5. トグル・タグ

```tsx
<Modal.Switch checked={notify} onCheckedChange={setNotify}>
  新着があれば知らせる
</Modal.Switch>

<Modal.Chips label="ジャンル" options={GENRES} value={genres} onChange={setGenres} />
```

### 2-6. スライダー

```tsx
<Modal.Field label="通知音の大きさ">
  {(control) => (
    <Modal.Slider {...control} value={volume} onValueChange={setVolume} step={5} showValue formatValue={(v) => `${v}%`} />
  )}
</Modal.Field>

<Modal.Fieldset label="価格帯">
  <Modal.RangeSlider value={price} onValueChange={setPrice} min={0} max={10000} step={500} showValue />
</Modal.Fieldset>
```

摘みと値までの塗りは `--g-accent` で描く。テーマを変えると一緒に変わる（I-10）。
`formatValue` は横の表示と `aria-valuetext` の両方に使う。2 つ摘みの名前は「下限」「上限」（`labels.rangeStart` / `rangeEnd`）。

### 2-7. セレクト・コンボボックス

```tsx
<Modal.Field label="配送方法">
  {(control) => <Modal.Select {...control} value={shipping} onValueChange={setShipping} options={SHIPPING} />}
</Modal.Field>

<Modal.Field label="国" help="打って絞り込める">
  {(control) => <Modal.Combobox {...control} value={country} onValueChange={setCountry} options={COUNTRIES} />}
</Modal.Field>
```

一覧は popover API で top layer に出る（I-02）。パネルの `transform` にも本文のスクロールにも切り取られない。
一覧が開いているときの Esc は一覧だけを閉じ、モーダルの `cancel` まで届かない。
フォームで送るなら `name` を渡す（hidden input に値が載る）。

### 2-8. 日付 / 時刻 / 色

```tsx
<Modal.Field label="受け取り日" required>
  {(control) => <Modal.DatePicker {...control} value={date} onValueChange={setDate} min="2026-10-01" />}
</Modal.Field>

<Modal.Field label="時間帯の開始" help="30分単位">
  {(control) => <Modal.Input {...control} type="time" step={1800} value={time} onChange={(e) => setTime(e.target.value)} />}
</Modal.Field>
```

日付は `'YYYY-MM-DD'` の文字列で受け渡す。月名と曜日は `GassanProvider` の `labels.locale` で `Intl` が出す。
スマホで OS の日付ホイールのほうが速いなら、`Modal.Input` に `type="date"` を入れる。枠と明暗（`--g-color-scheme`）は同じになる。

### 2-9. ファイル

```tsx
<Modal.Field label="書類" help="PDF か画像">
  {(control) => (
    <Modal.FileDrop {...control} accept=".pdf,image/*" multiple value={files} onValueChange={setFiles} />
  )}
</Modal.Field>
```

ドロップはネイティブの `accept` を通らないので、gassan が同じ規則を当てる。外れたものは `onReject` に渡る（I-14）。

### 2-10. 浮くラベル

ラベルを入力欄の中に置き、フォーカスか値があると左上へ縮めて退かせる形。サインインの欄のように、短い欄を
縦に並べるときに使う。`Modal.Field` に `labelPlacement="floating"` を渡すだけで、中身と配線は上のラベルと同じ（I-24）。

```tsx
<Modal.Field label="メールまたは電話番号" labelPlacement="floating" required requiredBadge={false}>
  {(control) => (
    <Modal.Input {...control} type="text" autoComplete="username" value={account} onChange={(e) => setAccount(e.target.value)} />
  )}
</Modal.Field>

<Modal.Field label="パスワード" labelPlacement="floating" required requiredBadge={false}>
  {(control) => <Modal.PasswordInput {...control} autoComplete="current-password" />}
</Modal.Field>
```

浮くか休むかは、入力欄のフォーカスと値から CSS が決める（`:placeholder-shown` と `:has()`）。JS の状態を持たないので、
制御・非制御・`defaultValue`・`form.reset()`・自動入力・パスワードマネージャー・IME の変換中・SSR のどれでも、見えている値とずれない。
空を見分けるため、`Modal.Input` と `Modal.PasswordInput` は浮くラベルの中でだけ、空白 1 文字のプレースホルダを持つ。
自分のプレースホルダを渡せば、ラベルが退いている間（フォーカスがあって空のとき）だけ見える。

重ねられるのは、前に飾りの無い `Modal.Input` と `Modal.PasswordInput` で、後ろの単位や表示の切替はよい。
前に記号のある `Modal.Input` や `Modal.Select` などに渡すと、上のラベルの形で出る（重ならない側に倒す）。
ページの上では、中立の名前（`Field`・`Input`・`PasswordInput`）で同じように書ける。

---

## 3. gassan に無いもの — ほかのライブラリの部品を包む

複数を選べるコンボボックス、日付の範囲選択、リッチテキストなどは、ほかのライブラリの部品を `Modal.Field` で包む。
配線（`id` / `aria-*`）を渡す先は、ラベルと結び付けたい要素（ボタンや入力欄）である。

ポップアップを持つ部品は、**描画先をダイアログの内側に向ける**ことだけ注意する。
`showModal()` で開いたダイアログの外側は inert になる。多くのライブラリの Portal は既定で `<body>` に出すため、
そのままだと選択肢が**表示されるのに押せない**。Base UI（`@base-ui/react`）なら `Portal` の `container` に、gassan のパネルを渡す。

```tsx
import { useModalContext } from '@genelab/gassan';

function usePanelContainer() {
  // Modal.Root の内側で呼ぶ。panelRef は .g-panel を指す。
  return useModalContext('PanelContainer').panelRef;
}
```

```tsx
import { Combobox } from '@base-ui/react/combobox';

function CityTags() {
  const container = usePanelContainer();
  return (
    <Modal.Field label="訪れた都市">
      {(control) => (
        <Combobox.Root items={CITIES} multiple>
          <Combobox.Input {...control} />
          <Combobox.Portal container={container}>
            <Combobox.Positioner>
              <Combobox.Popup>
                <Combobox.List>
                  {(city: string) => (
                    <Combobox.Item key={city} value={city}>
                      {city}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      )}
    </Modal.Field>
  );
}
```

上の Base UI のコードは形を示す最小例で、props の細部は
[Base UI の公式ドキュメント](https://base-ui.com/react/components/combobox)（v1 系）で確かめること。

---

## 4. モーダルの中で気をつけること

| 注意 | 理由 |
|---|---|
| ほかのライブラリのポップアップでは、開いている間の Esc でモーダルまで閉じないか確かめる | gassan の部品は keydown を `preventDefault` してポップアップだけを閉じる（Chrome 155 で実測。§10-30）。ほかのライブラリが同じことをするとは限らない。gassan は `cancel` を常に止めて理由 `esc` として扱い、`kind` の dismiss ポリシーと `onRequestClose` に従う |
| 初期フォーカスをテキスト入力に当てない（タッチ端末） | 仮想キーボードが本文を隠す。K-04 |
| 送信エラーは `Modal.Alert` にまとめ、最初のエラー項目へフォーカス | 入力のたびに `role="alert"` で割り込むと入力できなくなる。B-09 / F-08 |
| 束の補足を `<label>` の中に置かない | 補足まで名前として読まれる。I-09 / §10-31 |

---

## 5. 関連

- [`modal.skill.md`](../modal.skill.md) §4 の I（入力部品）/ B-08（フォーム項目）/ K-04（初期フォーカス）
- [`requirements-audit.md`](./requirements-audit.md) — どの要件を「合成で対応」としたか
- [`library-landscape.md`](./library-landscape.md) — Base UI / React Aria / Radix と native `<dialog>` の比較
