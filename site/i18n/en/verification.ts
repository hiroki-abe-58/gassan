import type ja from '../ja/verification';

export default {
  lead: '“The tests are green” and “it is guaranteed” are different things. What is verified at which level, and what cannot be verified yet, are written up separately.',
  stats: {
    tests: (files: number): string => `Tests (${String(files)} files)`,
    items: 'Behavior items',
    proven: 'Items proven by tests',
    device: 'Items only checkable on a real device',
  },
  pipeline: {
    intro: 'They run top to bottom and stop at the first failure. Each lower stage catches accidents that the stages above cannot find, by their nature.',
    steps: [
      { command: 'tsc --noEmit', catches: 'Type mismatches' },
      { command: 'eslint .', catches: 'Mistakes detectable statically' },
      { command: 'vitest run', catches: 'Accessible names, the logical OR of gates, close reason classification, color contrast ratios' },
      { command: 'check:trace', catches: 'Missing or extra spec items and evidence, citations of test names that do not exist, counts in documents that have drifted' },
      { command: 'check:docs', catches: 'Code examples in the README and docs that do not compile against the public API' },
      { command: 'tsup', catches: 'Failures generating ESM / CJS / types' },
      { command: 'check:dist', catches: 'A lost "use client", missing public API, an exceeded size budget' },
      {
        command: 'check:ssr',
        catches: 'window references during render (which crash the Next.js App Router), gates failing open at SSR time',
      },
      {
        command: 'check:pack',
        catches: 'Accidents in the shape published to npm (a missing LICENSE, mixed-up types conditions, broken links in bundled documents)',
      },
    ],
  },
  status: {
    title: 'Item status',
    intro: (count: number): string => `How strongly each of the ${String(count)} items is guaranteed.`,
    count: (n: number): string => `${String(n)} items`,
    weakMust: (n: number): string =>
      `${String(n)} Must (M) items are only “Described”. Their values are verified mechanically, but the rendered result can only be checked in a real browser. This is the library’s current weak point, and it is shown here, not hidden.`,
  },
  device: {
    title: 'What jsdom cannot verify',
    intro:
      'Items whose truth cannot be decided without rendering, such as the top layer, exit animations and scrim density. Open examples/css-check.html on a real device, and the same items appear as checkboxes.',
    tableCaption: 'On-device inspection sheet',
    columns: { id: 'ID', item: 'Item', how: 'How to check', diagnosis: 'If it fails' },
    pending: (n: number): string =>
      `These ${String(n)} items have not been worked through on real devices yet (ROADMAP v0.2.0). Automated checks in real browsers (Playwright + axe) arrive in v0.4.0. Details are in [VERIFICATION.md](VERIFICATION.md) and [ROADMAP.md](ROADMAP.md).`,
  },
} satisfies typeof ja;
