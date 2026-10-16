# gassan

[English](./README.md) · [日本語](./README_ja.md) · [简体中文](./README_zh.md) · **繁體中文** · [한국어](./README_ko.md) · [ไทย](./README_th.md)

以原生 `<dialog>` 為基礎打造的 React modal 外殼（modal shell）。
焦點陷阱、Esc、讓背景變成 inert、top layer，**這裡一行都沒有實作**。全部交給瀏覽器。

取而代之，gassan 專注在現有函式庫幾乎沒碰過的那一層。

- **啟用閘門（activation gate）** — 不用 `disabled`，做出「讀到最後」或「勾選之後」才能按的按鈕
- **標題截斷** — 不切斷 DOM 中的文字也能截斷顯示，無障礙名稱（accessible name）始終保持完整
- **關閉原因** — 區分 8 種 `CloseReason`，拒絕關閉時一定會回傳原因
- **遮罩層（scrim）** — 不再寫死 60% 的黑色，改用依意圖區分的四個 token
- **日文、中文、韓文的換行** — 無論是按鈕、標題、表格儲存格還是圖表摘要，文字都不會在詞的中間斷開。日文在文節邊界斷行（是「プロフィールを｜編集」，絕不會是「プロフィールを編｜集」），中文在詞的邊界，韓文只在空格處。泰文和英文交給瀏覽器處理，因為瀏覽器原本就能正確斷行

**文件網站：<https://hiroki-abe-58.github.io/gassan/#/zh-Hant>**
— 以類似 Material Design 3 指南的形式，整理了設計理念（modal 存在的理由、四層模型、五種類型、無障礙）、樣式（遮罩層、色彩與對比、主題、尺寸、換行、動態效果）、
每個元件可實際操作的示範與 API，以及 141 項行為的規格。
網站提供 [English](https://hiroki-abe-58.github.io/gassan/#/en)、[日本語](https://hiroki-abe-58.github.io/gassan/)、[简体中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hans)、繁體中文、[한국어](https://hiroki-abe-58.github.io/gassan/#/ko) 與 [ไทย](https://hiroki-abe-58.github.io/gassan/#/th) 版本（用頂端列的地球圖示按鈕切換）。
網站可切換淺色 / 深色主題與主色；無論選哪個顏色，文字與填色都會經過推算，以符合 WCAG 的對比度要求。
網站上所有的表格、數量與 API 說明，都是在建置時從規格書與型別定義自動產生，沒有任何手寫的數字。

完整的設計寫在 [`modal.skill.md`](./modal.skill.md)（141 項行為表、決策矩陣、品質評分準則）。
用 AI 助理寫程式時，請把這個檔案放進上下文（context）。

| 文件 | 內容 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md` 的 141 項行為分別由哪些測試、哪些 CSS 滿足的對照表。由 `npm run check:trace` 自動驗證 |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 將原始需求逐項拆解，每項一列，標示已實作 / 透過組合達成 / 列入路線圖 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | 在 modal 中放入 range / checkbox / radio / toggle / select / text / file / date / time / chips 的最小範例 |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | 原生 `<dialog>`、Base UI、React Aria、Radix 的比較（截至 2026-09-29，僅引用第一手資料） |

規格書（`modal.skill.md`）與 `docs/` 中的檔案以日文撰寫。
文件網站的說明文字已翻譯成全部六種語言；引自規格書的段落（行為的名稱與摘要、實作備註、API 說明）則保留日文原文。

---

## 安裝

已在 npm 上發布為 [`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan)。

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer dependency 為 React 18.2 以上（19 也能用）。bundle 已帶有 `"use client"`，可以直接從 Next.js App Router import。

內建字串（螢幕閱讀器的朗讀內容、按鈕標籤）預設為日文。
要改成英文，請用 `<GassanProvider labels={englishLabels}>` 包住整個應用程式；兩者都由套件匯出。
其他語言則把自己的字串傳給 `labels`（只指定部分項目也可以）。文件網站的中文、韓文、泰文字串
（[`site/i18n/<lang>/`](https://github.com/hiroki-abe-58/gassan/tree/main/site/i18n) 底下的 `gassan.ts`）可以拿來當作起點。

---

## 最小範例

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>開啟</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>編輯個人資料</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="顯示名稱" required>
            {(control) => <input {...control} type="text" />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">取消</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>儲存</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**請讓 modal 始終保持掛載。** 不要寫成 `{open && <Modal.Root .../>}`。
改成條件式掛載的話，關閉動畫從根本上就畫不出來。

---

## 五種類型

選定 `kind`，遮罩層、關閉方式與擺放位置的預設值就隨之決定。如果一個 modal 同時符合多種類型，它其實是應該拆開的兩個 modal。

| kind | 用途 | 遮罩層 | Esc | 點擊背景 |
|---|---|---|:-:|:-:|
| `confirm` | 確認無法復原的操作 | default | ○ | ○ |
| `form` | 輸入 | default | ○ | **×** |
| `view` | 檢視、放大 | default | ○ | ○ |
| `consent` | 同意、必須確認的事項 | strong | **×** | **×** |
| `flow` | 多個步驟 | default | ○ | **×** |

即使設定為不可關閉，也不會默默忽略關閉的操作。面板會晃動，並朗讀原因。

---

## 啟用閘門

這是 gassan 與其他函式庫差異最大的地方。

```tsx
<Modal.Body readGate="read">
  {/* 很長的服務條款 */}
  <Modal.Consent gate="terms">我同意上述條款</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>同意並繼續</Modal.Button>
</Modal.Footer>
```

**不使用 `disabled`。** 按鈕改用 `aria-disabled`。
`disabled` 的按鈕無法取得焦點，使用者也就失去了唯一能查明「為什麼按不下去」的途徑。
按下按鈕時，gassan 會朗讀原因，並把焦點移到使用者卡住的地方。

**「已讀到最後」以邏輯 OR 判定。**

1. 內容末端的哨兵元素（sentinel）進入可視範圍（滑鼠、觸控）
2. 焦點到達內容結尾的標記（鍵盤、螢幕閱讀器）
3. 內容本來就不需要捲動

若只看捲動位置來判定，就會把用虛擬游標閱讀的人擋在門外：他們不會觸發 scroll 事件，按鈕永遠按不下去。

其他任何條件都可以用 `Modal.Gate` 註冊。

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="請至少選擇三項"
  focus={() => listRef.current?.focus()}
/>
```

**在註冊完成之前，閘門保持關閉。**

閘門是在子元件的 effect 中註冊的。effect 不會在伺服器端執行，在用戶端的首次渲染時也還沒執行。
這段期間註冊表是空的，但這代表的是「還不知道」，而不是「沒有條件」。
帶有 `gate` 的按鈕，即使在伺服器端輸出的標記中也是 `aria-disabled="true"`，
掛載後才切換為實際的條件。如果一個閘門都沒有，就在那時變成可以按。

| 寫法 | 註冊前 | 意義 |
|---|---|---|
| `gate` / `gate={true}` | 關閉 | 要檢查的條件集合尚未確定 |
| `gate={['terms']}` | 關閉 | 未註冊的名稱視為未滿足 |
| `gate={[]}` | 開啟 | 已確定沒有任何條件，無需等待 |

伺服器端的標記與用戶端的首次渲染一致，因此不會發生 hydration mismatch。
原因文字可以用 `GassanProvider` 的 `unresolvedReason` 替換。

---

## 換行（日文、中文、韓文）

交給瀏覽器處理時，日文可以在任意兩個字元之間換行，於是窄按鈕會顯示成「プロフィールを編｜集」。
中文（「编辑个人资｜料」）和韓文（「프로필 편｜집」）也同樣會在詞的中間斷開。
gassan 絕不在詞的中間換行——標題、說明、按鈕、欄位標籤、表格儲存格、圖表摘要，以及元件繪製文字的所有地方都一樣。

| 語言 | 交給瀏覽器 | gassan |
|---|---|---|
| 日文 | 可在任意兩個字元之間斷開 | 只在文節邊界斷行：「プロフィールを｜編集」 |
| 中文（簡體、繁體） | 在詞的中間斷開：「编辑个人资｜料」 | 只在詞的邊界斷行：「编辑个人｜资料」 |
| 韓文 | 在詞的中間斷開：「프로필 편｜집」 | 只在空格處斷行：「프로필｜편집」 |
| 泰文、寮文、高棉文、緬甸文 | 用字典找出詞的邊界（本來就正確） | 不介入 |
| 英文及其他以空格分詞的語言 | 在空格處斷行（本來就正確） | 不介入 |

這些規則是逐一語言在 Chrome 中把文字放進窄框、實際量測換行位置後決定的。
刻意不碰泰文等語言，是因為對它們套用 `word-break: keep-all` 會壓掉瀏覽器自己依字典找出的斷點，反而在詞的中間斷開。

```tsx
// gassan 的元件內部預設已啟用。自己的 UI 請使用 Phrase
const edit = (
  <button type="button">
    <Phrase>プロフィールを編集</Phrase>
  </button>
);

// 把換行交還給瀏覽器（預設為 'phrase'）
const plain = <GassanProvider lineBreak="browser">{edit}</GassanProvider>;
```

- 語言由字串中的字元決定：含假名就是日文，含韓文字母就是韓文，兩者皆無但含漢字則是中文。沒有加 `lang` 屬性也不影響結果。
- 邊界由 `Intl.Segmenter` 加上字元類別規則決定（不新增相依套件），並以 `<wbr aria-hidden="true">` 標記。文字套用 `word-break: keep-all`，比容器還長的文節仍會換行，不會溢出。韓文不需要標記：光靠 `keep-all` 就只會在空格處斷行。
- 不會在文字中加入任何字元，因此無障礙名稱、複製的文字和搜尋都不受影響。在 Chrome 中，單純的 `<wbr>` 會讓無障礙名稱多出空格；`aria-hidden` 可以避免這個問題。
- 伺服器端與用戶端產生相同的標記。

---

## 元件

| 名稱 | 職責 |
|---|---|
| `Modal.Root` | 第 1–3 層：`<dialog>` / 遮罩層 / 面板 / live region |
| `Modal.Header` `Modal.Controls` | 標頭及其三個插槽（1fr auto 1fr） |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | 返回 / 關閉 / 目前步驟 |
| `Modal.Title` `Modal.Description` | 名稱與說明（自動關聯到 aria） |
| `Modal.Body` `Modal.Section` | 唯一的捲動區域及其子區段 |
| `Modal.Footer` `Modal.Button` | 按鈕層級、閘門、防止重複送出 |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | 啟用閘門 |
| `Modal.Media` `Modal.Gallery` | 圖片、影片、音訊、輪播 |
| `Modal.Field` `Modal.Chips` `Modal.Switch` `Modal.Table` `Modal.Alert` | 表單元件與表格 |
| `Modal.Chart` | 圖表的容器。關聯名稱（`label`）與趨勢的替代文字（`summary`），並以 `<details>` 呈現原始資料。本身不負責繪圖 |
| `Modal.Handle` | 底部面板（sheet）的拖曳把手。有停駐點（detent）時是 `role="slider"` 的控制項；沒有時只是裝飾性的抓取區域 |
| `ModalHost` `useModals` | 命令式 API（`await confirm()`） |
| `GassanProvider` | 替換 UI 字串（預設為日文，內附 `englishLabels`），並切換換行方式（`lineBreak`） |
| `Phrase` `splitPhrases` | 讓自己 UI 中的日文、中文、韓文套用同樣的換行規則（gassan 的元件內部預設已啟用） |

`Modal.Field` 是 render prop，裡面的控制項可以是原生 input，也可以是 Base UI 的元件。
選項群組（單選按鈕、多個核取方塊）要用 `fieldset` / `legend` 命名，而不是 `label`。
**不要自己打造控制項。** range / date / time / file / select 先用原生的，
可搜尋的下拉選單和雙把手滑桿則交給 Base UI。範例見 [`docs/control-recipes.md`](./docs/control-recipes.md)。

```tsx
<Modal.Chart
  label="每月營收（萬元）"
  summary="3 月最高，達 120 萬元。4 月起大致持平，維持在 100 萬元左右。"
  data={<Modal.Table label="原始資料"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 任何函式庫皆可。預設為 aria-hidden */}
</Modal.Chart>
```

---

## 原樣傳遞 `data-*`

所有元件都會把 `data-*` 原樣傳給宿主元素，可直接當作 E2E 測試的選擇器。

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

只有兩類不會傳遞，而且兩者都**不會被默默丟掉，開發時會發出警告**。

| 傳入的內容 | 結果 | 改用 |
|---|---|---|
| `data-kind` 等 gassan 內部使用的名稱 | 被忽略（否則會破壞內部狀態） | 換個名稱 |
| `aria-label` 等 `data-` 以外帶連字號的 prop | 被忽略 | 名稱用 `label` 或 `Modal.Title`，說明用 `aria-describedby` |

TypeScript 會把帶連字號的 JSX 屬性名稱排除在多餘屬性檢查（excess property check）之外，
所以**這些都不會是型別錯誤。** 既然型別攔不住，執行階段就不能保持沉默。

---

## 底部面板與停駐點（detent）

`placement="sheet"` 會讓面板從底部滑上來。傳入 `detents` 後，面板會停在那些高度。

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
    <Modal.Title>路線</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

有三條規則。

1. **快速往下滑不會關閉面板，而是降一個停駐點。** 有停駐點時，使用者往下滑的意思是「縮小一點」。
   只有在最低的停駐點再往下滑時才會關閉。
2. **把手不只能拖曳。** 有停駐點時它會成為 `role="slider"`，
   方向鍵、Home / End 和點擊也都能在停駐點之間移動。無法拖曳的人不會因此無路可走。
3. **沒有停駐點時，面板高度和以往一樣隨內容而定。** 把手退回成裝飾（`aria-hidden`）。
   不能操作的東西，絕不會被當成控制項朗讀出來。

吸附到哪個停駐點的邏輯，已抽離成純函式 `resolveDetents` / `snapToDetent`（可單獨 import）。

---

## 命令式 API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: '確定要刪除嗎？', tone: 'danger' });
```

在應用程式的根部放一個 `<ModalHost />`。即使同時要求兩個 confirm，也會一次只顯示一個，依序出現。

---

## 瀏覽器需求

gassan 使用了 `<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`。
全部都已是 Baseline（`<dialog>` 自 2022 年起，其餘自 2023–2024 年起）。

只有退場動畫用到的 CSS `overlay` 屬性，在 **MDN 上是 Limited availability（不屬於 Baseline）**。
因此 gassan 內建 JS 備援機制（fallback）：收到關閉要求時加上 `data-exiting`，在 dialog 仍開啟的狀態下繪製退場狀態，
等待 `--g-dur-out` 後再呼叫 `close()`（在 `prefers-reduced-motion` 下則立即呼叫）。
`onExited`、重設內容、還原焦點與解除捲動鎖定，全部在 `close()` 之後進行。

`requestClose()` 是 Baseline 2025，`closedby` 是 Limited availability。gassan 兩者都不用，
而是攔下 `cancel`，全部交由自己的 `requestClose(reason)` 處理（詳見 [`docs/library-landscape.md`](./docs/library-landscape.md)）。

在較舊的環境中只會降級為「沒有動畫的 modal」，開啟、關閉與無障礙功能都會保留。

---

## 開發

```bash
npm install
npm run dev              # examples/react 的示範（Vite），實機檢查用的測試台
npm run site:dev         # 在本機開啟文件網站（http://localhost:5180）
npm run site:build       # 將網站輸出到 site/dist（用 npm run site:preview 檢查）
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack 檢查
npm run check:consumer   # 實際安裝 tarball，從外部驗證（需要網路）
```

文件網站位於 `site/`。建置時會讀取規格書、追溯表、驗證報告與 `src` 中的型別定義，
組出表格與 API 參考文件（`site/plugins/gassan-data.ts`）。
每個示範所顯示的程式碼就是示範檔案本身（`?raw`），因此範例與程式碼不會脫節。
推送到 `main` 後，GitHub Actions 會建置網站並發布到 GitHub Pages。

`examples/css-check.html` 可以直接用瀏覽器開啟。
這個頁面用來目視檢查 jsdom 驗證不了的部分：top layer、退場動畫、遮罩層的濃度等。

哪些已經驗證、哪些還沒有，分開寫在 [`VERIFICATION.md`](./VERIFICATION.md) 中。
**「測試全綠」和「有保證」是兩回事**，
因此只能在真實瀏覽器中確認的 18 個項目，另外整理在該檔案的第 3 節。

變更紀錄見 [`CHANGELOG.md`](./CHANGELOG.md)，到 v1.0 為止的發布計畫見 [`ROADMAP.md`](./ROADMAP.md)。

---

## 授權

MIT。全文見 [`LICENSE`](./LICENSE)。
