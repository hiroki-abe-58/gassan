# gassan

[English](./README.md) · [日本語](./README_ja.md) · **简体中文** · [繁體中文](./README_zh-Hant.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md)

基于原生 `<dialog>` 的 React 模态框外壳（modal shell）。
焦点陷阱、Esc、背景 inert 化、top layer **一行都没有自己实现**，全部交给浏览器。

取而代之，gassan 专注于现有库几乎没有触及的那一层。

- **激活门控（activation gate）** — 不使用 `disabled`，做出“读到最后”“勾选之后”才能按下的按钮
- **标题截断** — 不截断 DOM 文本也能省略显示，可访问名称（accessible name）始终完整
- **关闭原因** — 区分 8 种 `CloseReason`，拒绝关闭时必定给出理由
- **遮罩层（scrim）** — 不再写死 60% 的黑色，改为按意图划分的 4 级令牌
- **日语、中文、韩语的换行** — 无论按钮、标题、表格单元格还是图表摘要，文字都不会在词的中间换行。日语在文节边界处换行（是「プロフィールを｜編集」，而不是「プロフィールを編｜集」），中文在词的边界处换行，韩语只在空格处换行。泰语和英语交给浏览器处理，浏览器本来就能正确换行
- **表单部件** — 文本、密码、搜索、数值、验证码、复选框、单选、分段控件、评分、滑块、下拉选择、组合框、日历、文件等 18 个部件。里面仍是原生元素，只重绘边框和标记，颜色跟随主题的强调色。列表和日历显示在 top layer，不会被模态框裁切

**文档站点：<https://hiroki-abe-58.github.io/gassan/#/zh-Hans>**
— 以类似 Material Design 3 指南的形式，阅读设计理念（模态框存在的理由、四层模型、五种类型、无障碍）、
样式（遮罩层、颜色与对比度、主题、尺寸、换行、动效）、所有组件与表单部件的可运行示例与 API、页面模板，以及 224 项行为规范。
站点提供简体中文、[English](https://hiroki-abe-58.github.io/gassan/#/en)、[日本語](https://hiroki-abe-58.github.io/gassan/)、[繁體中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hant)、[한국어](https://hiroki-abe-58.github.io/gassan/#/ko) 和 [ไทย](https://hiroki-abe-58.github.io/gassan/#/th) 版本（用顶栏的地球图标切换）。
站点还支持切换浅色 / 深色显示和主色。无论选择哪种颜色，文字与填充色都会被推导为满足 WCAG 对比度要求的颜色。
站点上的表格、数量和 API 说明全部在构建时从规范文档和类型定义生成，没有任何手写的数字。

完整设计见 [`modal.skill.md`](./modal.skill.md)（224 项行为表、决策矩阵、质量评分标准）。
使用 AI 编程时，请把这个文件放进上下文。

| 文档 | 内容 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md` 的 224 项行为分别由哪些测试、哪些 CSS 满足的对照表。由 `npm run check:trace` 机器校验 |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 拆解原始需求，逐行标明“已实现 / 通过组合实现 / 在路线图中”的审计表 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | 在模态框中放置 gassan 表单部件的最小示例，以及用其他库的组件补足 gassan 没有的部件时需要注意的地方 |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | 原生 `<dialog>` / Base UI / React Aria / Radix 的比较（截至 2026-09-29，仅引用一手资料） |

规范（`modal.skill.md`）和 `docs/` 中的文件用日语撰写。
文档站点的说明文字已翻译为全部六种语言；引自规范的段落（行为的名称与要点、实现说明、API 说明）以日语原文显示。

---

## 安装

已发布到 npm：[`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan)。

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer 依赖为 React 18.2 及以上（19 也可用）。产物已带有 `"use client"`，可在 Next.js App Router 中直接 import。

内置文案（读屏播报、按钮标签）默认是日语。
英文请用 `<GassanProvider labels={englishLabels}>` 包裹应用，两者都从包中导出。
其他语言请把自己的文案传给 `labels`（只覆盖部分条目也可以）。可以把文档站点的中文、韩语和泰语文案
（[`site/i18n/<lang>/`](https://github.com/hiroki-abe-58/gassan/tree/main/site/i18n) 下的 `gassan.ts`）作为起点。
日历的月份名称、星期和文件大小由 `labels.locale`（BCP 47，默认为 `ja-JP`）通过 `Intl` 生成。

---

## 最小示例

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>编辑个人资料</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="显示名称" required>
            {(control) => <Modal.Input {...control} />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">取消</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>保存</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**模态框要始终保持挂载。** 不要写成 `{open && <Modal.Root .../>}`。
条件挂载会让关闭动画从原理上无法绘制。

---

## 五种类型

确定 `kind` 后，遮罩层、关闭方式和位置的默认值随之确定。如果同时符合多种类型，那其实是应该拆开的两个模态框。

| kind | 用途 | 遮罩层 | Esc | 点击背景 |
|---|---|---|:-:|:-:|
| `confirm` | 确认不可撤销的操作 | default | ○ | ○ |
| `form` | 输入 | default | ○ | **×** |
| `view` | 浏览、放大查看 | default | ○ | ○ |
| `consent` | 同意、必须确认的事项 | strong | **×** | **×** |
| `flow` | 多个步骤 | default | ○ | **×** |

即使设置为不可关闭，也不会默默忽略关闭操作。面板会抖动，并播报原因。

---

## 激活门控

这是 gassan 与其他库差别最大的部分。

```tsx
<Modal.Body readGate="read">
  {/* 很长的条款 */}
  <Modal.Consent gate="terms">我同意上述条款</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>同意并继续</Modal.Button>
</Modal.Footer>
```

**不使用 `disabled`。** 改用 `aria-disabled`。
`disabled` 的按钮无法获得焦点，用户也就失去了弄清“为什么按不了”的手段。
按下时，gassan 会播报原因，并把焦点移到卡住的位置。

**“已读完”的判定是逻辑或（OR）。**

1. 内容末尾的哨兵元素进入可视区域（鼠标、触摸）
2. 焦点到达内容末尾的标记（键盘、读屏软件）
3. 内容本来就不需要滚动

只看滚动位置来判定的话，用虚拟光标阅读的用户不会触发 scroll 事件，按钮将永远无法按下。

任意条件都可以用 `Modal.Gate` 注册。

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="请至少选择三项"
  focus={() => listRef.current?.focus()}
/>
```

**在注册完成之前，门控保持关闭。**

门控在子组件的 effect 中注册。服务端不会运行 effect，客户端在首次渲染时也还没有运行。
在这段时间里注册表是空的，但这意味着“还不知道”，而不是“没有条件”。
带 `gate` 的按钮在服务端输出的标记中也是 `aria-disabled="true"`，
挂载后再切换为实际的条件。如果一个门控都没有，那时就会变为可按。

| 写法 | 注册前 | 含义 |
|---|---|---|
| `gate` / `gate={true}` | 关闭 | 要检查的条件集合尚未确定 |
| `gate={['terms']}` | 关闭 | 未注册的名称按“未满足”处理 |
| `gate={[]}` | 打开 | 已确定没有任何条件，无需等待 |

服务端标记与客户端首次渲染一致，因此不会出现 hydration 不匹配。
原因文本可通过 `GassanProvider` 的 `unresolvedReason` 替换。

---

## 换行（日语、中文、韩语）

交给浏览器处理时，日语可以在任意两个字符之间换行，窄按钮就会显示成「プロフィールを編｜集」。
中文（「编辑个人资｜料」）和韩语（「프로필 편｜집」）也同样会在词的中间断开。
gassan 绝不在词的中间换行。标题、说明、按钮、输入框标签、表格单元格、图表摘要等组件渲染文字的地方全部适用。

| 语言 | 交给浏览器 | gassan |
|---|---|---|
| 日语 | 在任意两个字符之间换行 | 只在文节边界处换行：「プロフィールを｜編集」 |
| 中文（简体、繁体） | 在词的中间换行：「编辑个人资｜料」 | 只在词的边界处换行：「编辑个人｜资料」 |
| 韩语 | 在词的中间换行：「프로필 편｜집」 | 只在空格处换行：「프로필｜편집」 |
| 泰语、老挝语、高棉语、缅甸语 | 用词典查找词的边界（本来就正确） | 不做处理 |
| 英语等以空格分词的语言 | 在空格处换行（本来就正确） | 不做处理 |

这些规则是逐种语言在 Chrome 中把文字放进窄框、实测实际换行位置后确定的。
泰语等语言是有意不做处理的：对它们施加 `word-break: keep-all` 会压制浏览器自身基于词典的断行，反而导致在词的中间换行。

```tsx
// gassan 组件内部默认已启用。你自己的 UI 请使用 Phrase
const edit = (
  <button type="button">
    <Phrase>プロフィールを編集</Phrase>
  </button>
);

// 交还给浏览器处理（默认为 'phrase'）
const plain = <GassanProvider lineBreak="browser">{edit}</GassanProvider>;
```

- 语言由字符串中的字符决定：含假名即为日语，含谚文即为韩语，两者都不含而含汉字即为中文。即使漏写 `lang` 属性，结果也不会改变。
- 边界由 `Intl.Segmenter` 加字符类别规则确定（不增加依赖），并用 `<wbr aria-hidden="true">` 标记，文字设置 `word-break: keep-all`。比容器还长的文节仍会按字符换行，不会溢出。韩语不需要标记：仅靠 `keep-all` 就只会在空格处换行。
- 不向文本添加任何字符，因此可访问名称、复制的文本和搜索都不受影响。在 Chrome 中，普通的 `<wbr>` 会给可访问名称混入空格，所以加上了 `aria-hidden`。
- 服务端与客户端生成相同的标记。

---

## 组件

| 名称 | 作用 |
|---|---|
| `Modal.Root` | 第 1〜3 层：`<dialog>` / 遮罩层 / 面板 / 实时播报区域 |
| `Modal.Header` `Modal.Controls` | 头部，以及 1fr auto 1fr 的三个插槽 |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | 返回 / 关闭 / 当前位置 |
| `Modal.Title` `Modal.Description` | 名称与说明（自动关联到 aria） |
| `Modal.Body` `Modal.Section` | 唯一的滚动区域及其小节 |
| `Modal.Footer` `Modal.Button` | 按钮层级、门控、防止重复提交 |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | 激活门控 |
| `Modal.Media` `Modal.Gallery` | 图片、视频、音频、轮播 |
| `Modal.Field` `Modal.Fieldset` | 为单个输入项和一组选项关联名称、帮助文字和错误信息 |
| `Modal.Input` `Modal.PasswordInput` `Modal.SearchInput` `Modal.Textarea` `Modal.NumberField` `Modal.CodeInput` | 文本输入 |
| `Modal.Checkbox` `Modal.RadioGroup` `Modal.Segmented` `Modal.Rating` `Modal.Switch` `Modal.Chips` | 选项 |
| `Modal.Slider` `Modal.RangeSlider` | 滑块（手柄和填充使用主题的颜色） |
| `Modal.Select` `Modal.Combobox` `Modal.DatePicker` | 把列表或日历显示在 top layer 的部件 |
| `Modal.FileDrop` | 文件放置区（拖放进来的文件也套用 `accept`） |
| `Modal.Table` `Modal.Alert` | 可横向滚动的表格、提交结果的汇总 |
| `Modal.Chart` | 图表的容器。关联名称（`label`）和趋势的文字替代（`summary`），并用 `<details>` 展开原始数据。本身不负责绘制 |
| `Modal.Handle` | 底部面板（sheet）的拖动把手。有档位（detent）时是 `role="slider"` 的控件，没有时只是装饰性的抓取区域 |
| `ModalHost` `useModals` | 命令式 API（`await confirm()`） |
| `GassanProvider` | 替换界面文案（默认日语，随附 `englishLabels`），并切换换行方式（`lineBreak`） |
| `Phrase` `splitPhrases` | 让你自己的 UI 中的日语、中文和韩语文字也采用同样的换行方式（gassan 组件内部默认已启用） |

表单部件里面是原生元素，直接展开 `Modal.Field` 的 render prop 参数来接收。
选项组（单选、多选、评分、双手柄滑块）用 `Modal.Fieldset`（`fieldset` / `legend`）命名，而不是 `label`。
列表和日历通过 popover API 显示在 top layer，打开时按 Esc 只会关闭列表。
gassan 没有的部件（如可多选的组合框），同样把其他库的组件包起来即可。示例见 [`docs/control-recipes.md`](./docs/control-recipes.md)。

```tsx
<Modal.Field label="配送方式">
  {(control) => <Modal.Select {...control} value={shipping} onValueChange={setShipping} options={SHIPPING} />}
</Modal.Field>

<Modal.Fieldset label="价格区间">
  <Modal.RangeSlider value={price} onValueChange={setPrice} min={0} max={10000} step={500} showValue />
</Modal.Fieldset>
```

```tsx
<Modal.Chart
  label="月度销售额（万元）"
  summary="3 月最高，为 120 万元。4 月以后基本持平在 100 万元左右。"
  data={<Modal.Table label="原始数据"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 任意库。默认 aria-hidden */}
</Modal.Chart>
```

---

## `data-*` 的透传

所有组件都会把 `data-*` 原样传给宿主元素，可直接用作 E2E 测试的选择器。

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

只有两类不会透传，而且都**不会被默默丢弃，开发时会给出警告**。

| 传入的内容 | 结果 | 应改用 |
|---|---|---|
| `data-kind` 等 gassan 内部使用的名称 | 被忽略（否则会破坏内部状态） | 换一个名称 |
| `aria-label` 等 `data-` 以外的带连字符的 prop | 被忽略 | 名称用 `label` 或 `Modal.Title`，说明用 `aria-describedby` |

TypeScript 不会对带连字符的 JSX 属性名做多余属性检查，
所以**这些都不会报类型错误。** 既然类型拦不住，运行时就不保持沉默。

---

## 底部面板与档位（detent）

`placement="sheet"` 会让面板从底部升起。传入 `detents` 后，面板会停在这些高度。

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
    <Modal.Title>路线</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

有三条约定。

1. **快速向下轻扫不会关闭，而是下降一档。** 既然有档位，用户轻扫时的意图是“缩小一点”。
   只有在最低一档继续向下轻扫时才会关闭。
2. **把手不只能拖动。** 有档位时它是 `role="slider"`，
   方向键、Home / End 和点击都能切换档位。不让无法拖动的人失去操作途径。
3. **不指定档位时，高度和以前一样随内容而定。** 把手退化为装饰（`aria-hidden`）。
   不能操作的东西不会被当作控件读出来。

目标档位的判定被拆成了纯函数 `resolveDetents` / `snapToDetent`（可单独 import）。

---

## 命令式 API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: '确定要删除吗？', tone: 'danger' });
```

在应用根部放置一个 `<ModalHost />`。即使同时请求两个，也会一个接一个地显示。

---

## 浏览器要求

使用了 `<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`。
它们都已是 Baseline（`<dialog>` 自 2022 年起，其余自 2023〜2024 年起）。

只有退出动画用到的 CSS `overlay` 属性在 MDN 上是 **Limited availability（不属于 Baseline）**。
因此 gassan 带有 JS 回退方案：收到关闭请求后添加 `data-exiting`，在 dialog 仍处于打开状态时绘制退出状态，
等待 `--g-dur-out`（在 `prefers-reduced-motion` 下不等待）后再调用 `close()`。
`onExited`、内容重置、焦点恢复和解除滚动锁定，全部在 `close()` 之后进行。

`requestClose()` 是 Baseline 2025，`closedby` 是 Limited availability。两者都没有使用，
而是拦下 `cancel`，统一交给自己的 `requestClose(reason)` 处理（详见 [`docs/library-landscape.md`](./docs/library-landscape.md)）。

在较旧的环境中只会退化为“没有动画的模态框”，打开、关闭和无障碍都能保持。

---

## 开发

```bash
npm install
npm run dev              # examples/react 的演示（Vite），用于真机检查
npm run site:dev         # 在本地打开文档站点（http://localhost:5180）
npm run site:build       # 把站点输出到 site/dist（用 npm run site:preview 预览）
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack 检查
npm run check:consumer   # 实际安装 tarball，从外部验证（需要网络）
```

文档站点位于 `site/`。它在构建时读取规范、追踪表、验证报告和 `src` 中的类型定义，
组装出表格和 API 参考（`site/plugins/gassan-data.ts`）。
每个演示显示的代码就是正在运行的演示文件本身（`?raw`），示例与代码不会不一致。
推送到 `main` 后，GitHub Actions 会构建站点并发布到 GitHub Pages。

`examples/css-check.html` 可以直接在浏览器中打开。
它用于目视检查 jsdom 无法验证的部分：top layer、退出动画、遮罩层的浓度等。

哪些已经验证、哪些尚未验证，分别写在 [`VERIFICATION.md`](./VERIFICATION.md) 中。
**“测试是绿的”与“有保证”是两回事**，
因此只能在真实浏览器中确认的 18 个项目被单独列在该文件的第 3 节。

变更记录见 [`CHANGELOG.md`](./CHANGELOG.md)，到 v1.0 为止的发布计划见 [`ROADMAP.md`](./ROADMAP.md)。

---

## 许可证

MIT。全文见 [`LICENSE`](./LICENSE)。
