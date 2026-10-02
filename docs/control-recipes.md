# コントロールの合成レシピ

モーダルの中に置く入力部品の最小例。gassan はどの部品も**作り直さない**。
境界は2つだけで、それ以外はネイティブ要素か Base UI の持ち物である。

| 境界 | 使う場面 | gassan が渡すもの |
|---|---|---|
| `Modal.Field` | **1 つの入力**に名前・補助文・エラーを付ける | render prop で `id` / `aria-describedby` / `aria-invalid` / `aria-required` |
| `fieldset` + `legend` | **選択肢のグループ**（ラジオ、複数チェック）に名前を付ける | なし（HTML のまま） |

グループに `label` を使わないこと。`label` は1つのコントロールにしか結び付かず、
「配送方法」という問いがラジオ群の名前として読み上げられない。グループの名前は `legend` の仕事である。

以下のコードはすべて `<Modal.Body>` の中に置く前提で、`import { Modal } from '@genelab/gassan'` 済みとする。

---

## 1. どれを使うか

| 部品 | まず試すもの | Base UI に委ねる条件 |
|---|---|---|
| テキスト / テキストエリア | `<input type="text">` / `<textarea>` | — |
| チェックボックス（単体） | `<input type="checkbox">`（同意なら `Modal.Consent`） | — |
| チェックボックス（複数） | ネイティブ + `fieldset` | — |
| ラジオ | ネイティブ + `fieldset` | — |
| トグル | `Modal.Switch` | Base UI Switch に揃えたいとき |
| レンジ | `<input type="range">` | 摘みが2つ・目盛り・値の吹き出しが要る → Base UI Slider |
| セレクト / ドロップダウン | `<select>`（選択肢が固定で少ない） | 見た目の自由・検索・複数選択・非同期の選択肢 → Base UI Select / Combobox |
| ファイル | `<input type="file">` | — |
| 日付 / 時刻 | `<input type="date">` / `type="time"` / `datetime-local` | 範囲選択・独自のカレンダー表示が要る → 専用ライブラリ（gassan は関与しない） |
| チップス | `Modal.Chips` | — |

判断基準は1つ。**ネイティブで要件を満たせるなら、ネイティブを使う。**
キーボード操作・読み上げ・モバイルの専用 UI（日付のホイール、ファイル選択のシート）はブラウザがすでに持っている。

---

## 2. ネイティブで済むもの

### 2-1. テキスト / テキストエリア

```tsx
<Modal.Field label="表示名" required help="全角20文字まで" error={nameError}>
  {(control) => (
    <input {...control} type="text" value={name} onChange={(e) => setName(e.target.value)} />
  )}
</Modal.Field>

<Modal.Field label="ひとこと">
  {(control) => <textarea {...control} value={memo} onChange={(e) => setMemo(e.target.value)} />}
</Modal.Field>
```

`initialFocus` でテキスト入力を指定しても、タッチ端末ではパネル本体に当たる（K-04）。
仮想キーボードが本文を隠すのを防ぐためで、意図した挙動である。

### 2-2. チェックボックス（単体）

```tsx
<label className="g-consent">
  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
  <span>お知らせをメールで受け取る</span>
</label>
```

押せるかどうかをこのチェックに連動させるなら、`Modal.Consent gate="..."` を使う（ゲートの登録・誘導まで付く）。

### 2-3. チェックボックス（複数）— fieldset / legend

```tsx
<fieldset>
  <legend className="g-label">通知の種類</legend>
  {KINDS.map((kind) => (
    <label key={kind.value}>
      <input
        type="checkbox"
        name="notify"
        value={kind.value}
        checked={selected.includes(kind.value)}
        onChange={(e) =>
          setSelected((prev) =>
            e.target.checked ? [...prev, kind.value] : prev.filter((v) => v !== kind.value),
          )
        }
      />
      <span>{kind.label}</span>
    </label>
  ))}
</fieldset>
```

「3つ以上選んだら進める」のような条件は `Modal.Gate` で登録する。

```tsx
<Modal.Gate name="min-3" satisfied={selected.length >= 3} reason="3つ以上選んでください" />
```

### 2-4. ラジオ — fieldset / legend

```tsx
<fieldset>
  <legend className="g-label">配送方法</legend>
  {SHIPPING.map((option) => (
    <label key={option.value}>
      <input
        type="radio"
        name="shipping"
        value={option.value}
        checked={shipping === option.value}
        onChange={() => setShipping(option.value)}
      />
      <span>{option.label}</span>
    </label>
  ))}
</fieldset>
```

矢印キーでの移動と「2個中1個目」の読み上げはブラウザが行う。`role="radiogroup"` を自分で書く必要はない。

### 2-5. トグル

```tsx
<Modal.Switch checked={notify} onCheckedChange={setNotify}>
  新着があれば知らせる
</Modal.Switch>
```

`role="switch"` の `<button>`。Space / Enter はネイティブ button のまま効く。

### 2-6. レンジ

```tsx
<Modal.Field label="通知音の大きさ" help={`現在 ${volume} / 100`}>
  {(control) => (
    <input
      {...control}
      type="range"
      min={0}
      max={100}
      step={5}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
    />
  )}
</Modal.Field>
```

現在値を `help` に出すと `aria-describedby` 経由で読み上げにも乗る。
値に単位や意味がある（「40%」「中」）なら `aria-valuetext` を input に足す。

### 2-7. セレクト（ネイティブ）

```tsx
<Modal.Field label="タイムゾーン">
  {(control) => (
    <select {...control} value={tz} onChange={(e) => setTz(e.target.value)}>
      <option value="Asia/Tokyo">東京</option>
      <option value="America/Los_Angeles">ロサンゼルス</option>
    </select>
  )}
</Modal.Field>
```

選択肢のポップアップはブラウザが描くので、モーダルの top layer やスクリムと重なりの問題が起きない。

### 2-8. ファイル

```tsx
<Modal.Field label="置き配の写真" help={fileName ? `選択中: ${fileName}` : 'JPEG / PNG、1枚まで'}>
  {(control) => (
    <input
      {...control}
      type="file"
      accept="image/jpeg,image/png"
      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
    />
  )}
</Modal.Field>
```

### 2-9. 日付 / 時刻

```tsx
<Modal.Field label="受け取り日" required>
  {(control) => <input {...control} type="date" min="2026-10-01" value={date} onChange={(e) => setDate(e.target.value)} />}
</Modal.Field>

<Modal.Field label="時間帯の開始" help="30分単位">
  {(control) => <input {...control} type="time" step={1800} value={time} onChange={(e) => setTime(e.target.value)} />}
</Modal.Field>
```

日付と時刻を1つにするなら `type="datetime-local"`。値は常に ISO 形式の文字列で届く。

### 2-10. チップス

```tsx
<Modal.Chips label="ジャンル" options={GENRES} value={genres} onChange={setGenres} />
```

`aria-pressed` のトグルボタン群。`listbox` にしないのは、「押して付け外しする」ほうが実態に近く、
`listbox` のキーボード規約を持ち込まずに済むため。

---

## 3. Base UI に委ねるもの

Base UI（`@base-ui/react`。v1.0.0 で `@base-ui-components/react` から改名）の部品を載せるときは、
**ポップアップの描画先をダイアログの内側に向ける**ことだけ注意する。

`showModal()` で開いたダイアログの外側は inert になる。Base UI の Portal は既定で `<body>` に出すため、
そのままだと選択肢が**表示されるのに押せない**。`Select.Portal` / `Combobox.Portal` の `container`
（要素か ref を受け付ける）に、gassan のパネルを渡す。

```tsx
import { useModalContext } from '@genelab/gassan';

function usePanelContainer() {
  // Modal.Root の内側で呼ぶ。panelRef は .g-panel を指す。
  return useModalContext('PanelContainer').panelRef;
}
```

以下の Base UI のコードは形を示す最小例で、props の細部は
[Base UI の公式ドキュメント](https://base-ui.com/react/components/select)（v1 系）で確認すること。

### 3-1. Select

```tsx
import { Select } from '@base-ui/react/select';

function TimezoneSelect() {
  const container = usePanelContainer();
  return (
    <Modal.Field label="タイムゾーン" help="通知の時刻に使います">
      {(control) => (
        <Select.Root value={tz} onValueChange={setTz}>
          {/* label の htmlFor は id を持つ要素に結び付く。Trigger（button）に配線を渡す。 */}
          <Select.Trigger {...control}>
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal container={container}>
            <Select.Positioner>
              <Select.Popup>
                {ZONES.map((zone) => (
                  <Select.Item key={zone.value} value={zone.value}>
                    <Select.ItemText>{zone.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      )}
    </Modal.Field>
  );
}
```

### 3-2. Combobox（検索つき）

```tsx
import { Combobox } from '@base-ui/react/combobox';

function CitySearch() {
  const container = usePanelContainer();
  return (
    <Modal.Field label="都市">
      {(control) => (
        <Combobox.Root items={CITIES}>
          <Combobox.Input {...control} />
          <Combobox.Portal container={container}>
            <Combobox.Positioner>
              <Combobox.Popup>
                <Combobox.Empty>見つかりません</Combobox.Empty>
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

### 3-3. Slider（摘みが2つ）

```tsx
import { Slider } from '@base-ui/react/slider';

<Slider.Root value={range} onValueChange={setRange} min={0} max={10000}>
  <Slider.Label>価格帯</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb aria-label="下限" />
      <Slider.Thumb aria-label="上限" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

ポップアップを持たない部品は Portal の注意が要らない。名前付けは Base UI 側の `Label` 部品に任せてよい。

---

## 4. モーダルの中で気をつけること

| 注意 | 理由 |
|---|---|
| ポップアップが開いている間の Esc で、モーダルまで一緒に閉じないか確かめる | Esc はポップアップ側とダイアログ側（ネイティブの `cancel`）の両方に関わる。gassan は `cancel` を常に止めて理由 `esc` として扱い、`kind` の dismiss ポリシーと `onRequestClose` に従う。ポップアップとの順序は実ブラウザでの確認事項（未検証） |
| 初期フォーカスをテキスト入力に当てない（タッチ端末） | 仮想キーボードが本文を隠す。K-04 |
| 送信エラーは `Modal.Alert` にまとめ、最初のエラー項目へフォーカス | 入力のたびに `role="alert"` で割り込むと入力できなくなる。B-09 / F-08 |
| 選択肢のポップアップがスクリムの下に隠れないか確認する | 実ブラウザでの検証は ROADMAP v0.3 の受け入れ条件 |

---

## 5. 関連

- [`requirements-audit.md`](./requirements-audit.md) — どの要件を「合成で対応」としたか
- [`library-landscape.md`](./library-landscape.md) — Base UI / React Aria / Radix と native `<dialog>` の比較
- [`modal.skill.md`](../modal.skill.md) §4 の B-08（フォーム項目）/ K-04（初期フォーカス）
