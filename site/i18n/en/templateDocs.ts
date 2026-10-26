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
    lead: '4xx / 5xx, offline, maintenance and system status. Each says what happened, why, and what you can do next, in words that don’t blame the user, and the next step changes with each status.',
    error: {
      title: 'Error pages',
      intro: 'Each of the 40 IANA-registered 4xx and 5xx codes, plus offline, has its own heading, description and next step (a status that isn’t registered falls back to the general 4xx / 5xx text). The next step changes with the status: sign-in for 401, billing settings for 402, contacting support for 403 and 451, home when a page or feature can’t be reached (404, 410 and so on), the previous page when there’s a problem with what was sent, and trying again when a wait or a reload will fix it (for server-side problems, the status page too). The status code is shown large and read out as “Error 404”. The reference on 5xx can be copied. On 429, “Try again” can’t be pressed while the wait lasts.',
      offline: 'Offline',
      tableCaption: 'Statuses the error page covers',
      head: { code: 'Code', title: 'Heading', description: 'Description' },
    },
    maintenance: {
      title: 'Maintenance',
      intro: 'The schedule is shown in the viewer’s time zone, with the time zone’s name (when both ends fall on the same day, the date appears only once). If there is a status page, it is pointed to first, and progress updates are listed with their times.',
    },
    serviceStatus: {
      title: 'System status',
      intro: 'The overall status (the sentence for the worst part), ongoing incidents, the status of each part with a 90-day uptime bar, past incidents and ways to get updates, on one page. The bar is a one-row table: only today’s day is a Tab stop, ← and → move between days, and each reads like “Sat, October 3: Partial outage”. Nothing relies on color alone: the uptime and the number of days with issues are tied to the bar as its description. A pointer picks a day anywhere along the bar, so nobody has to hit a thin day. Dates are shown as the calendar days of the time zone the service records them in. Place it where the error pages and the footer’s “System status” link point (links.status).',
    },
    code: "import { ErrorPage, MaintenancePage, ServiceStatusPage } from '@genelab/gassan';\n\n// app/not-found.tsx in Next.js\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />\n\n// Each part’s days run oldest first (the last is today). Incidents run newest first\n<ServiceStatusPage components={components} incidents={incidents} updatedAt={checkedAt} onSubscribe={subscribe} feedHref=\"/status.rss\" />",
    codeCaption: 'Usage',
    a11yCaption: 'Specification items the error, maintenance and system status templates satisfy',
  },
  public: {
    lead: 'Pricing, FAQ, contact, terms and privacy policy, changelog, and search results. Except for search results, each comes as one component, header and footer (SiteLayout) included. Write the navigation and the footer columns once in SiteProvider, and they apply to every page.',
    site: {
      title: 'Site layout',
      intro: 'A link that skips to the content, header navigation (aria-current on the current page), footer link columns and links to the legal documents. When the container is narrow, the navigation folds under a “Menu” button. To place a page inside your own layout, use layout={false}.',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: 'Pricing', href: '/pricing' },\n    { label: 'FAQ', href: '/faq' },\n  ]}\n  footer={[{ title: 'Company', links: [{ label: 'About us', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"2 months free\" />\n</SiteProvider>",
    },
    pricing: {
      title: 'Pricing',
      intro: 'Switch between monthly and yearly billing; prices use the currency’s format. Screen readers hear the period in words, as in “¥1,500 per month”. The plan you recommend is marked with the word “Recommended” and an outline, and the comparison table has column and row headers. With four plans (Free, Pro, Max and Enterprise in this example), they line up in four columns, two columns or one, depending on the container’s width, never in uneven rows such as 3 + 1.',
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
    search: {
      title: 'Search results',
      intro: 'A search field (sent with Enter or “Search”), filters, the count, the results and pagination. Searching and paging happen on the server, and your app holds the query. Where the search terms appear in a result’s title and excerpt, they are marked (ignoring kana type and character width). The page tells “not searched yet” apart from “no results”, and when nothing matches it offers a way to clear the filters. In a narrow container, the filters move into a panel opened from the “Filters” button. It is used both in public help pages and inside apps, so it has no site frame of its own (this sample wraps it in SiteLayout and indexes the FAQ and changelog samples).',
    },
    a11yCaption: 'Specification items the public page templates satisfy',
  },
  app: {
    lead: 'The frame around the screens people see after signing in: a navigation sidebar on the left, a top bar (search, notifications and account) and the content. When the container is narrow, the navigation opens in a side panel from “Menu” in the top bar. The content is built from a page header, stats and a data table.',
    setup: {
      title: 'Usage',
      intro: 'Pass the navigation in groups, and pass the href of the current page to current. The product’s name and logo, and the component that renders links (such as Next.js’s Link), come from SiteProvider.',
      code: "import { AppShell, PageHeader, DataTable } from '@genelab/gassan';\n\n<AppShell\n  current={pathname}\n  nav={[\n    { items: [{ label: 'Home', href: '/app', icon: <HomeIcon /> }] },\n    { title: 'Workspace', items: [{ label: 'Members', href: '/app/members' }] },\n  ]}\n  actions={<IconButton label=\"Search\"><SearchIcon /></IconButton>}\n  account={{ name: 'Olivia Chen', menu: [{ value: 'sign-out', label: 'Sign out', onSelect: signOut }] }}\n>\n  <PageHeader title=\"Members\" actions={<Button variant=\"primary\">Invite</Button>} />\n  <DataTable label=\"Members\" rows={members} columns={columns} getRowId={(m) => m.id} selectable />\n</AppShell>",
    },
    shell: {
      title: 'App shell',
      intro: 'When the container is wide, the navigation sits in a sidebar on the left, and the current page is marked with a background color and bold text. Switch to “Phone”, and the navigation folds away and opens in a side panel from “Menu” (Esc or a press outside closes it, and so does pressing a link in the navigation). From the navigation, you can move on to the examples for members, plan and billing, and settings.',
      variants: { dashboard: 'Home (dashboard)', members: 'Members (data table)' },
    },
    a11yCaption: 'Specification items the app shell satisfies',
  },
  appPages: {
    lead: 'The screens every SaaS has after sign-in: pages for account settings, members and invitations, plan and billing, getting started, and accepting an invitation. Place them inside the app shell and pass only data and handlers, and you get the submit flow, confirmation modals and even announcements of the results.',
    setup: {
      title: 'Usage',
      intro: 'Place the content inside the app shell (AppShell). You pass only data and handlers (saving, inviting, canceling and so on). If a handler fails, return { error }, and that message is announced, interrupting whatever is being read. Sections and actions you don’t pass aren’t shown.',
      code: "import { AppShell, MembersPage, SettingsPage } from '@genelab/gassan';\n\n<AppShell current=\"/settings\" nav={nav} account={account}>\n  <SettingsPage\n    profile={{ name: user.name, email: user.email, onSubmit: saveProfile }}\n    password={{ onSubmit: changePassword }}\n    sessions={{ items: sessions, onRevoke: revokeSession, onRevokeOthers: revokeOtherSessions }}\n    deleteAccount={{ confirmText: user.email, onDelete: deleteAccount }}\n  />\n</AppShell>\n\n<MembersPage\n  members={members}\n  roles={[{ value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }]}\n  currentUserId={user.id}\n  onInvite={({ emails, role }) => invite(emails, role)}\n  onRemove={(ids) => removeMembers(ids)}\n/>",
    },
    settings: {
      title: 'Account settings',
      intro: 'Profile, password, two-factor authentication, signed-in devices and account deletion are laid out in sections with headings. When the container is wide, each section’s heading and description sit in a column on the left. The button that signs out a device carries the device’s name, and the device in use has no such button. Deletion goes through a confirmation modal, and it can’t be confirmed until the specified text (such as the email address) is typed.',
    },
    members: {
      title: 'Members',
      intro: 'Seats used, filtering by name and email address (hiragana and katakana, and full-width and half-width forms, match each other), the member table and pending invitations. Invitations happen in a modal, where email addresses go in together as tags. Your own row can’t be selected or removed, and its role can’t be changed. Removing someone goes through a confirmation modal.',
    },
    billing: {
      title: 'Plan and billing',
      intro: 'The current plan and next renewal date, the payment method (only the card’s last 4 digits), usage, and a table of invoices. Usage turns the warning color at 80% and the error color at the limit, and is shown in numbers too. If a payment has failed, a banner at the top of the page says so. Canceling in the example switches the display to the last day the plan can be used.',
    },
    onboarding: {
      title: 'Getting started',
      intro: 'The steps right after signing up. Progress sits above the card, and when the step changes, focus moves to its heading. The reason you can’t go on is shown above the content and announced. Steps that can be skipped show “Skip for now”. In the example, you can’t go on to the next step until you enter a workspace name.',
    },
    invite: {
      title: 'Accepting an invitation',
      intro: 'Shows who sent the invitation, to which workspace and with what role, and lets you accept or decline. If you aren’t signed in, it leads to sign-in and account creation; if the invitation has expired, it explains only what to do next. After declining, it switches to that screen and moves focus to its heading.',
      variants: { pending: 'Invitation', signedOut: 'Not signed in', expired: 'Expired' },
    },
    a11yCaption: 'Specification items the in-app page templates satisfy',
  },
  conversations: {
    lead: 'Screens for chat and an AI assistant. Place them inside the app shell and pass only the conversations, the messages and a send handler, and you get switching between the list and the conversation, unread counts, a draft kept for each conversation and even a button that stops the answer.',
    setup: {
      title: 'Usage',
      intro: 'Your app holds the open conversation and its messages. Choosing a conversation calls onConversationChange, and choosing a conversation from the history calls onThreadChange. When the container is narrow, the list and the conversation are shown one at a time.',
      code: "import { AssistantPage, ChatPage } from '@genelab/gassan';\n\n<ChatPage\n  conversations={conversations}\n  current={currentId}\n  onConversationChange={setCurrentId}\n  messages={messagesOf(currentId)}\n  currentUserId={user.id}\n  onSend={(text) => send(currentId, text)}\n/>\n\n<AssistantPage\n  messages={messages}\n  currentUserId={user.id}\n  onSend={ask}\n  generating={generating}\n  onStop={stop}\n  suggestions={suggestions}\n  history={threads}\n  currentThreadId={threadId}\n  onThreadChange={openThread}\n  onNewThread={startThread}\n/>",
    },
    chat: {
      title: 'Chat',
      intro: 'The conversation list on the left (channels and direct messages, with unread counts and the last message), and the open conversation on the right. Opening a conversation clears its unread count, and reading starts from the line that marks new messages. When you send a message, its “Sending” status changes, and in a direct message the reply arrives after the typing indicator. Switch to “Phone”, and the list and the conversation take turns on screen; the “Back to conversations” button before the heading returns you to the list.',
    },
    assistant: {
      title: 'AI assistant',
      intro: 'Before anything has been said, it shows a greeting and suggestions; once the conversation starts, answers stream in as they are written. While an answer is being written, the send button becomes “Stop”. The history on the left is grouped into “Today”, “Yesterday”, “Previous 7 days” and “Older”, and “New chat” goes back to the screen with the suggestions. On “Phone”, the clock button before the heading opens the history.',
    },
    a11yCaption: 'Specification items the conversation page templates satisfy',
  },
  mail: {
    lead: 'The mail screen. Depending on the container’s width, the folders, the message list and the reading pane appear in three columns, two columns, or one at a time. Select rows to archive, delete or mark them as read all at once; Compose, Reply and Forward open a modal to write in.',
    setup: {
      title: 'Usage',
      intro: 'Your app holds the current folder and the open message. Opening a message calls onOpen (marking it as read is also up to your app). For bulk actions and sending, you pass only handlers. If a handler fails, return { error }, and that message is announced, interrupting whatever is being read. Actions you don’t pass aren’t shown.',
      code: "import { MailboxPage } from '@genelab/gassan';\n\n<MailboxPage\n  folders={folders}\n  currentFolder={folderId}\n  onFolderChange={setFolderId}\n  messages={messagesIn(folderId)}\n  current={messageId}\n  onOpen={openMessage}\n  onArchive={(ids) => archive(ids)}\n  onDelete={(ids) => moveToTrash(ids)}\n  onMarkRead={(ids, read) => markRead(ids, read)}\n  onStar={(id, starred) => star(id, starred)}\n  onSend={(values) => send(values)}\n/>",
    },
    preview: {
      title: 'Mail',
      intro: 'In a wide container, the folders, the list and the reading pane sit side by side. Selecting rows brings up “n selected” and the bulk actions at the top, and the result of archiving or deleting is announced. Opening a message marks it as read, and Reply opens the compose window with the recipient and subject already filled in. Switch to “Phone”, and the folders become a select above the list, while the list and the reading pane take turns on screen.',
    },
    a11yCaption: 'Specification items the mail template satisfies',
  },
} satisfies typeof ja;
