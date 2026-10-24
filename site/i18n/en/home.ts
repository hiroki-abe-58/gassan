import type ja from '../ja/home';

export default {
  eyebrow: 'A React UI library for SaaS',
  heroTitle: ['From sign-in to billing,', 'just place one component.'],
  lead: 'gassan is a React UI library built on the native `<dialog>`. It ships modals, form controls, UI parts, toasts and a command palette, and goes as far as pages for sign-in, errors, pricing, settings, members and billing. Focus trapping, Esc and making the background inert are left to the browser. Instead, what screen readers announce, keyboard operation and Japanese line breaking are written into the specification and checked by tests.',
  start: 'Get started',
  templates: 'See the templates',
  stats: {
    exports: 'Public APIs',
    items: 'Behaviors listed',
    tests: 'Automated tests',
    trap: 'Hand-rolled focus traps',
  },
  showcase: {
    title: 'Sample app',
    intro: 'Atlas is a fictional SaaS. Its navigation and buttons take you around inside it: home, members, plan and billing, settings, sign-in and pricing. The screens are built from gassan’s templates and parts; the only additions are the logo, the sample data and the way the numbers are laid out on the home screen. Switch to “Phone” for the narrow-screen layout.',
    frameTitle: 'Atlas',
    variants: { dashboard: 'Home', members: 'Members', billing: 'Plan and billing', settings: 'Settings', signIn: 'Sign-in', pricing: 'Pricing' },
  },
  features: {
    title: 'What’s included',
    intro: 'What SaaS screens need, as components and as whole pages. Everything is a named import, and parts you don’t use are not bundled into your app.',
    items: {
      modal: {
        title: 'Modals',
        body: 'Five kinds, activation gates, title truncation, close reasons and sheets that stop at detents. Focus, Esc and the background are left to the browser.',
      },
      forms: {
        title: 'Form controls',
        body: 'Text fields, choices, selects, a calendar with Japanese public holidays and range selection, a time picker, tags, password strength and files.',
      },
      ui: {
        title: 'UI parts',
        body: 'Buttons, badges, cards, stats, tabs, menus, breadcrumbs, pagination, steps, data tables and a command palette.',
      },
      feedback: {
        title: 'Notices',
        body: 'Toasts with a meter that runs down the time left, banners and progress. A toast can be paused to read, and closed with a swipe or by hand.',
      },
      templates: {
        title: 'Page templates',
        body: 'Sign-in, sign-up, two-step verification, password reset, errors, maintenance, pricing, FAQ, terms, contact and changelog.',
      },
      app: {
        title: 'App screens',
        body: 'The app shell, and pages for settings, members, plan and billing, getting started and accepting an invitation. Pass only data and handlers, and they work.',
      },
      motion: {
        title: 'Motion',
        body: 'Choose from four motion levels, complete down to press feedback, exits and springs that settle back. The reduced-motion setting is always respected.',
      },
      a11y: {
        title: 'Screen readers and keyboard',
        body: 'For each component, the name, the state and where focus goes are written into the specification and checked by tests. Nothing is conveyed by color alone.',
      },
    },
  },
  languages: {
    title: 'Built for Japanese, Chinese and Korean screens',
    intro:
      'No more buttons that split into “プロフィールを編｜集” or “保存更改并关｜闭” on narrow screens. Change the colors with “Theme” at the top right, and the text stays readable.',
    browserNote: 'Breaks in the middle of words',
    phraseNote: 'Breaks at word and phrase boundaries',
    details: {
      lineBreak: {
        title: 'Line breaking',
        body: 'In buttons, titles, table cells and chart summaries alike, Japanese wraps only at phrase boundaries, Chinese only between words, and Korean only at spaces. Thai and English are left alone. The accessible name and the copied text stay unchanged.',
      },
      theme: {
        title: 'Theme',
        body: (presets: number): string =>
          `Light and dark, ${String(presets)} presets and any color you like. Whichever color you pick, its text and fills are derived to meet the WCAG requirements.`,
      },
      button: {
        title: 'Button variants and states',
        body: 'primary, secondary, tertiary and danger. Ready, loading, gated and unavailable can be told apart by shape, not by color alone.',
      },
    },
  },
  promises: {
    title: 'The modal core — four things other libraries have not solved',
    intro: 'The browser has already solved layer 1 (top layer, focus, Esc). gassan spends its time on the design work above it.',
    gate: {
      title: 'Activation gates',
      body: 'Buttons that become pressable “once you have read to the end” or “once you have ticked the box”, built without disabled. Press one, and it announces what is missing and takes you there.',
      mockTitle: 'Updated terms of service',
      mockButton: 'Agree and continue',
      mockNote: 'Please read to the end of the content',
    },
    clamp: {
      title: 'Title truncation',
      body: 'Truncates with CSS line-clamp alone, without cutting the DOM text. The accessible name is always complete. “Show the full title” appears only when the title overflows.',
      mockTitle: 'Change the sharing settings of the FY2026 Q3 Tohoku region sales report by store',
      mockToggle: 'Show the full title',
    },
    reasons: {
      title: 'Close reasons',
      body: 'Esc, backdrop, ×, submit, swipe, back, navigation and an external close(). All 8 are told apart, and a refusal is never silent.',
    },
    scrim: {
      title: 'Scrim tokens',
      body: 'Drop the hard-coded 60% black and use four intent-based levels. The default is 32% with no blur, so the modal keeps the one thing it does best: the context.',
    },
  },
  kinds: {
    title: 'Choose from five kinds',
    intro:
      'Pick one kind, and the scrim density, whether Esc and backdrop clicks close the modal, and the placement are set for you. If a modal fits more than one kind, it is really two modals that should be split. Press a button to open the real thing.',
    items: {
      confirm: { label: 'Confirmation', use: 'Confirming an irreversible action' },
      form: { label: 'Input', use: 'Secondary input without losing context' },
      view: { label: 'Viewing', use: 'Details and enlarged media' },
      consent: { label: 'Consent', use: 'Explicit consent to terms or permissions' },
      flow: { label: 'Flow', use: 'Multi-step procedures' },
    },
    scrim: 'Scrim',
    esc: 'Esc',
    backdrop: 'Backdrop',
    closes: 'Closes',
    stays: 'Stays open',
    more: 'How to choose a kind, and the decision matrix →',
  },
  verified: {
    title: 'Not claims, but check results',
    intro: (items: number): string =>
      `Every one of the ${String(items)} items in the specification is tied to a test name, CSS or the roadmap. Cite a test name that does not exist, and CI fails.`,
    count: (count: number): string => `${String(count)} items`,
    bar: (parts: readonly string[]): string => parts.join(', '),
    spec: (items: number): string => `View the ${String(items)}-item behavior specification`,
    verification: 'What is verified, and what is not →',
  },
  install: {
    title: 'Install',
    caption: 'Installation',
    cssCaption: 'Load the styles',
    css: "import '@genelab/gassan/styles.css';\n// Only when you use the page templates (load it after styles.css)\nimport '@genelab/gassan/templates.css';",
    more: 'Minimal example and browser requirements →',
  },
} satisfies typeof ja;
