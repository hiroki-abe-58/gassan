# gassan

**English** · [日本語](./README_ja.md) · [简体中文](./README_zh.md)

A modal shell for React, built on the native `<dialog>`.
Focus trapping, Esc, making the background inert and the top layer are **not implemented here at all, not a single line**. The browser does them.

Instead, gassan concentrates on the layer that existing libraries have barely touched.

- **Activation gates** — buttons that become pressable "once you have read to the end" or "once you have ticked the box", built without `disabled`
- **Title truncation** — truncate without cutting the DOM text, so the accessible name always stays complete
- **Close reasons** — distinguish 8 kinds of `CloseReason`, and always return a reason when refusing to close
- **Scrim** — drop the hard-coded 60% black and use four intent-based tokens instead

**Documentation site: <https://hiroki-abe-58.github.io/gassan/>**
— design principles (why modals exist, the 4-layer model, the 5 kinds, accessibility), styles (scrim, color and contrast, sizing, motion),
live demos and the API of every component, and the specification of 135 behaviors, laid out like the Material Design 3 guidelines.
Every table, count and API description on the site is generated at build time from the specification and the type definitions; no number is written by hand.

The full design lives in [`modal.skill.md`](./modal.skill.md) (a table of 135 behaviors, a decision matrix and a quality rubric).
Put that file in the context when coding with an AI assistant.

| Document | Contents |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | Maps each of the 135 behaviors in `modal.skill.md` to the tests and CSS that satisfy it. Verified mechanically by `npm run check:trace` |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | The original requirements broken down, one row each: implemented / achieved by composition / on the roadmap |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | Minimal examples of putting range / checkbox / radio / toggle / select / text / file / date / time / chips inside a modal |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | Native `<dialog>` vs Base UI vs React Aria vs Radix (as of 2026-09-29, primary sources only) |

The specification (`modal.skill.md`), the files in `docs/` and the documentation site are currently written in Japanese.

---

## Installation

Published on npm as [`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan).

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

The peer dependency is React 18.2 or later (19 works too). The bundle already carries `"use client"`, so it can be imported as is from the Next.js App Router.

Built-in strings (screen reader announcements, button labels) default to Japanese.
For English, wrap your app in `<GassanProvider labels={englishLabels}>`; both are exported from the package.

---

## Minimal example

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>Edit profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="Display name" required>
            {(control) => <input {...control} type="text" />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">Cancel</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>Save</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**Keep the modal mounted at all times.** Do not write `{open && <Modal.Root .../>}`.
With conditional mounting, the closing animation simply cannot be drawn.

---

## The five kinds

Choosing a `kind` sets the defaults for the scrim, dismissal and placement. If a modal fits more than one kind, it is really two modals that should be split.

| kind | Use | Scrim | Esc | Backdrop click |
|---|---|---|:-:|:-:|
| `confirm` | Confirming an irreversible action | default | ○ | ○ |
| `form` | Input | default | ○ | **×** |
| `view` | Viewing, enlarging | default | ○ | ○ |
| `consent` | Consent, mandatory acknowledgement | strong | **×** | **×** |
| `flow` | Multiple steps | default | ○ | **×** |

Even when closing is not allowed, the attempt is never silently ignored. The panel shakes and the reason is announced.

---

## Activation gates

This is where gassan differs most from other libraries.

```tsx
<Modal.Body readGate="read">
  {/* long terms of service */}
  <Modal.Consent gate="terms">I agree to the terms</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>Agree and continue</Modal.Button>
</Modal.Footer>
```

**No `disabled`.** The button uses `aria-disabled` instead.
A `disabled` button cannot receive focus, which takes away the user's only way of finding out why it cannot be pressed.
When the button is pressed, gassan announces the reason and moves focus to where the user is stuck.

**"Read to the end" is a logical OR.**

1. The sentinel at the end of the content became visible (mouse, touch)
2. Focus reached the end-of-content marker (keyboard, screen reader)
3. The content never needed scrolling in the first place

Judging by scroll position alone locks out people who read with a virtual cursor: they never fire scroll events, so the button can never be pressed.

Any other condition can be registered with `Modal.Gate`.

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="Choose at least three"
  focus={() => listRef.current?.focus()}
/>
```

**A gate stays closed until registration is complete.**

Gates are registered in child effects. Effects do not run on the server, and on the client they have not run yet during the first render.
During that window the registry is empty, but that means "not known yet", not "no conditions".
A button with `gate` is rendered with `aria-disabled="true"` even in the server markup,
and switches to the real conditions after mount. If there are no gates at all, it becomes pressable at that point.

| Syntax | Before registration | Meaning |
|---|---|---|
| `gate` / `gate={true}` | closed | The set of conditions to check is not settled yet |
| `gate={['terms']}` | closed | Unregistered names are treated as unsatisfied |
| `gate={[]}` | open | Known to have zero conditions; nothing to wait for |

The server markup and the first client render match, so there is no hydration mismatch.
The reason text can be replaced with `unresolvedReason` on `GassanProvider`.

---

## Components

| Name | Role |
|---|---|
| `Modal.Root` | Layers 1–3: `<dialog>` / scrim / panel / live region |
| `Modal.Header` `Modal.Controls` | Header and its three slots (1fr auto 1fr) |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | Back / close / current step |
| `Modal.Title` `Modal.Description` | Name and description (wired to aria automatically) |
| `Modal.Body` `Modal.Section` | The only scroll area, and its subsections |
| `Modal.Footer` `Modal.Button` | Button hierarchy, gates, double-submit prevention |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | Activation gates |
| `Modal.Media` `Modal.Gallery` | Images, video, audio, slider |
| `Modal.Field` `Modal.Chips` `Modal.Switch` `Modal.Table` `Modal.Alert` | Form parts and tables |
| `Modal.Chart` | A container for charts. Wires up the name (`label`) and a text alternative for the trend (`summary`), and exposes the raw data in a `<details>`. It does not draw anything |
| `Modal.Handle` | The grip of a sheet. With detents it is a `role="slider"` control; without them, a decorative grab area |
| `ModalHost` `useModals` | Imperative API (`await confirm()`) |
| `GassanProvider` | Replaces UI strings (Japanese by default; `englishLabels` is bundled) |

`Modal.Field` is a render prop, so the control inside can be a native input or a Base UI component.
Groups of options (radios, multiple checkboxes) are named with `fieldset` / `legend`, not `label`.
**Do not build your own controls.** Use native range / date / time / file / select first,
and leave searchable selects and two-thumb sliders to Base UI. Examples are in [`docs/control-recipes.md`](./docs/control-recipes.md).

```tsx
<Modal.Chart
  label="Monthly sales (USD thousands)"
  summary="March peaked at 120. From April onward it stays flat at around 100."
  data={<Modal.Table label="Raw data"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / any library. aria-hidden by default */}
</Modal.Chart>
```

---

## Passing `data-*` through

Every component passes `data-*` straight through to its host element, so they work as E2E selectors.

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

Only two things are not passed through, and neither is **dropped silently: both trigger a development-time warning**.

| What you pass | What happens | Use instead |
|---|---|---|
| Names gassan uses internally, such as `data-kind` | Ignored (it would corrupt internal state) | A different name |
| Hyphenated props other than `data-`, such as `aria-label` | Ignored | `label` or `Modal.Title` for the name, `aria-describedby` for the description |

TypeScript exempts hyphenated JSX attribute names from excess property checks,
so **none of these are type errors.** Since types cannot catch them, the runtime refuses to stay quiet.

---

## Sheets and detents

`placement="sheet"` turns the panel into one that slides up from the bottom. Pass `detents` and it stops at those heights.

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
    <Modal.Title>Route</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

Three rules apply.

1. **A fast downward flick does not close the sheet. It drops one detent.** When there are detents, people flick meaning "a bit smaller".
   The sheet closes only when flicked further down from the lowest detent.
2. **The grip is not drag-only.** With detents it becomes `role="slider"`,
   and arrow keys, Home / End and clicks move between detents too. People who cannot drag are not left without a way.
3. **Without detents, the sheet is as tall as its content, as before.** The grip falls back to decoration (`aria-hidden`).
   Something that cannot be moved is never announced as a control.

The snapping logic is factored out into the pure functions `resolveDetents` / `snapToDetent` (importable on their own).

---

## Imperative API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: 'Delete this?', tone: 'danger' });
```

Put one `<ModalHost />` at the root of your app. Even if two confirms are requested at once, they are shown one at a time.

---

## Browser requirements

gassan uses `<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`.
All of them are Baseline (`<dialog>` since 2022, the rest since 2023–2024).

Only the CSS `overlay` property used for exit animations is **Limited availability on MDN (not Baseline)**.
gassan therefore carries a JS fallback: on a close request it adds `data-exiting`, draws the exit state while the dialog is still open,
and calls `close()` after `--g-dur-out` (immediately under `prefers-reduced-motion`).
`onExited`, resetting the content, restoring focus and releasing the scroll lock all happen after `close()`.

`requestClose()` is Baseline 2025 and `closedby` is Limited availability. gassan uses neither;
it stops `cancel` and routes everything through its own `requestClose(reason)` (details in [`docs/library-landscape.md`](./docs/library-landscape.md)).

In older environments it degrades to "a modal without animation"; opening, closing and accessibility are preserved.

---

## Development

```bash
npm install
npm run dev              # demos in examples/react (Vite); the bench for on-device checks
npm run site:dev         # open the documentation site locally (http://localhost:5180)
npm run site:build       # write the site to site/dist (check it with npm run site:preview)
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack checks
npm run check:consumer   # install the tarball for real and verify it from outside (needs network)
```

The documentation site lives in `site/`. At build time it reads the specification, the traceability table, the verification report
and the type definitions in `src` to assemble its tables and API reference (`site/plugins/gassan-data.ts`).
The code shown for each demo is the demo file itself (`?raw`), so the example and its code cannot drift apart.
Pushing to `main` makes GitHub Actions build the site and publish it to GitHub Pages.

`examples/css-check.html` can be opened directly in a browser.
It is a page for eyeballing what jsdom cannot check: the top layer, exit animations, scrim density and so on.

What has been verified, and what has not, is written up separately in [`VERIFICATION.md`](./VERIFICATION.md).
**"The tests are green" and "it is guaranteed" are different things**,
so the 18 items that can only be checked in a real browser are split out into section 3 of that file.

The change history is in [`CHANGELOG.md`](./CHANGELOG.md), and the release plan up to v1.0 is in [`ROADMAP.md`](./ROADMAP.md).

---

## License

MIT. The full text is in [`LICENSE`](./LICENSE).
