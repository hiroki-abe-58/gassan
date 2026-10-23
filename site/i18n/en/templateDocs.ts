import type ja from '../ja/templateDocs';

export default {
  auth: {
    lead: 'Sign-in, sign-up, password reset, two-step verification, email verification and sign-out. Place a single component and you get a complete page: autofill attributes, a summary of what to fix, protection against double submission while sending, and even focus handling when the screen changes.',
    setup: {
      title: 'Usage',
      intro: 'Place one SiteProvider at the root of the app and give it the product’s name, logo and destinations. The templates’ styles live in templates.css (load it after styles.css). Pass Next.js’s Link or a similar component to linkComponent.',
      code: "import '@genelab/gassan/styles.css';\nimport '@genelab/gassan/templates.css';\nimport { SiteProvider, SignInPage } from '@genelab/gassan';\n\n<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' }}\n  linkComponent={Link}\n>\n  <SignInPage\n    onSubmit={async ({ email, password, remember }) => {\n      const ok = await signIn(email, password, remember);\n      // On failure, show the default message (it doesn’t reveal which one was wrong)\n      if (!ok) return { error: true };\n    }}\n  />\n</SiteProvider>",
    },
    signIn: {
      title: 'Sign-in',
      intro: 'The email address (autocomplete="username") and the password (current-password) let password managers fill them in. A failure doesn’t reveal which of the two was wrong, and what was typed stays in place. Buttons for external identity providers can sit alongside. In the example, entering “gassan” as the password takes you on to two-step verification.',
    },
    signUp: {
      title: 'Sign-up',
      intro: 'While a password is typed, its strength and the rules it meets show up and are read as the field’s description. Agreement to the terms and the privacy policy is required. Nothing is flagged as an error until the form is submitted.',
    },
    reset: {
      title: 'Password reset',
      intro: 'Requesting a reset email leads to the same screen whether or not the address is registered (it doesn’t reveal whether an account exists). After sending, the email can be sent again once a short wait is over. If the link has expired, only the way to request a new one is shown.',
      forgot: 'Send the email',
      reset: 'New password',
      expired: 'Expired link',
    },
    twoFactor: {
      title: 'Two-step verification',
      intro: 'A single field (autocomplete="one-time-code") supports SMS autofill and pasting. Once every digit is in, it submits by itself; if the code is wrong, it clears the code and returns to the field. In the example, the verification code is “123456”.',
    },
    verifyEmail: {
      title: 'Email verification',
      intro: 'Shows where the email went, and offers sending it again, changing the address, and what comes next once it is verified.',
    },
    signOut: {
      title: 'Sign-out',
      intro: 'A screen that asks whether to sign out, and the screen shown after signing out.',
      confirm: 'Confirmation',
      done: 'After signing out',
    },
    a11yCaption: 'Specification items the sign-in and sign-up templates satisfy',
  },
  status: {
    lead: '4xx / 5xx, offline and maintenance. Each says what happened, why, and what you can do next, in words that don’t blame the user, and the next step changes with each status.',
    error: {
      title: 'Error pages',
      intro: '401 leads to sign-in, 403 to asking for access, 404 to home and the previous page, and 429, 5xx and offline to trying again. The status code is shown large and read out as “Error 404”. The reference on 5xx can be copied. On 429, “Try again” can’t be pressed while the wait lasts.',
      variants: {
        notFound: '404 Not found',
        server: '500 Server problem',
        forbidden: '403 No access',
        unauthorized: '401 Sign-in required',
        tooMany: '429 Too many requests',
        offline: 'Offline',
      },
    },
    maintenance: {
      title: 'Maintenance',
      intro: 'The schedule is shown in the viewer’s time zone, with the time zone’s name (when both ends fall on the same day, the date appears only once). If there is a status page, it is pointed to first, and progress updates are listed with their times.',
    },
    code: "import { ErrorPage, MaintenancePage } from '@genelab/gassan';\n\n// app/not-found.tsx in Next.js\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />",
    codeCaption: 'Usage',
    a11yCaption: 'Specification items the error and maintenance templates satisfy',
  },
  public: {
    lead: 'Pricing, FAQ, contact, terms and privacy policy, and changelog. Each comes as one component, header and footer (SiteLayout) included. Write the navigation and the footer columns once in SiteProvider, and they apply to every page.',
    site: {
      title: 'Site layout',
      intro: 'A link that skips to the content, header navigation (aria-current on the current page), footer link columns and links to the legal documents. When the container is narrow, the navigation folds under a “Menu” button. To place a page inside your own layout, use layout={false}.',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: 'Pricing', href: '/pricing' },\n    { label: 'FAQ', href: '/faq' },\n  ]}\n  footer={[{ title: 'Company', links: [{ label: 'About us', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"2 months free\" />\n</SiteProvider>",
    },
    pricing: {
      title: 'Pricing',
      intro: 'Switch between monthly and yearly billing; prices use the currency’s format. Screen readers hear the period in words, as in “¥1,500 per month”. The plan you recommend is marked with the word “Recommended” and an outline, and the comparison table has column and row headers.',
    },
    faq: {
      title: 'FAQ',
      intro: 'Narrow the questions down by words (hiragana and katakana, and full-width and half-width forms, match each other), and the number of matches is announced. Categories are separated by headings, and the question named by the #id in the address opens already expanded. A way to contact you comes last.',
    },
    contact: {
      title: 'Contact',
      intro: 'Following the convention of Japanese contact forms, fields are marked as required or optional. The topic is a select, the message shows a character count, and agreement to the privacy policy is required. After sending, the page switches to a confirmation screen.',
    },
    document: {
      title: 'Terms and documents',
      intro: 'Effective and updated dates (time elements), a table of contents (a named nav) and numbered sections (“Article 1”). When the container is wide, the table of contents sits alongside and follows as you scroll; printing leaves out the table of contents and the site frame. The legal notice required by Japan’s Specified Commercial Transactions Act can be written as a list of names and values.',
      variants: { terms: 'Terms of Service', privacy: 'Privacy Policy', legal: 'Legal notice (Specified Commercial Transactions Act)' },
    },
    changelog: {
      title: 'Changelog',
      intro: 'Each update has a heading, a date (time element), a version and type badges that use words, and the list can be filtered by the types actually in use. When the container is wide, the date and version sit in a column alongside.',
    },
    a11yCaption: 'Specification items the public page templates satisfy',
  },
} satisfies typeof ja;
