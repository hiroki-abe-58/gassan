import type ja from '../ja/templateDocs';

export default {
  auth: {
    lead: '登录、创建账号、重置密码、两步验证、验证邮箱、退出登录。只要放一个组件，就能得到一个完整的页面：自动填充的属性、需要修改之处的汇总、发送期间防止重复提交，连画面切换时的焦点也都处理好了。',
    setup: {
      title: '用法',
      intro: '在应用的根部放一个 SiteProvider，传入产品的名称、标志和各个跳转地址。模板的样式在 templates.css 中（在 styles.css 之后加载）。Next.js 的 Link 等组件传给 linkComponent。',
      code: "import '@genelab/gassan/styles.css';\nimport '@genelab/gassan/templates.css';\nimport { SiteProvider, SignInPage } from '@genelab/gassan';\n\n<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' }}\n  linkComponent={Link}\n>\n  <SignInPage\n    onSubmit={async ({ email, password, remember }) => {\n      const ok = await signIn(email, password, remember);\n      // 失败时显示默认的提示（不透露是哪一项错了）\n      if (!ok) return { error: true };\n    }}\n  />\n</SiteProvider>",
    },
    signIn: {
      title: '登录',
      intro: '邮箱地址（autocomplete="username"）和密码（current-password）能让密码管理器自动填充。失败时不透露是哪一项错了，也不清空已输入的内容。还可以并列外部身份提供方的按钮。在示例中，密码输入“gassan”即可进入两步验证。',
    },
    signUp: {
      title: '创建账号',
      intro: '输入密码时会显示强度和要满足的条件，并作为输入框的说明被读出。要求同意服务条款和隐私政策。在提交之前不会报错。',
    },
    reset: {
      title: '重置密码',
      intro: '无论邮箱是否已注册，发送重置邮件后都会进入同一个画面（不透露账号是否存在）。发送后，等待一段时间即可重新发送。如果链接已过期，只显示重新发送的指引。',
      forgot: '发送邮件',
      reset: '新密码',
      expired: '链接已过期',
    },
    twoFactor: {
      title: '两步验证',
      intro: '只有一个输入框（autocomplete="one-time-code"），支持短信自动填充和粘贴。位数凑齐后自动提交，验证码错误时清空并回到输入框。示例中的验证码是“123456”。',
    },
    verifyEmail: {
      title: '验证邮箱地址',
      intro: '显示邮件发到了哪里，并引导重新发送、更改地址，以及验证完成后的下一步。',
    },
    signOut: {
      title: '退出登录',
      intro: '询问是否退出登录的画面，以及退出登录之后的画面。',
      confirm: '确认',
      done: '退出登录后',
    },
    a11yCaption: '登录与注册模板满足的规范',
  },
  status: {
    lead: '4xx / 5xx、离线、维护。用不责怪用户的措辞写明发生了什么、为什么、接下来能做什么，并按状态改变下一步。',
    error: {
      title: '错误页面',
      intro: '在 IANA 注册的 4xx 和 5xx 共 40 个状态码，以及离线，各自都有标题、说明和下一步（未注册的状态以 4xx / 5xx 的文案显示）。下一步按状态改变：401 引导登录，402 引导前往账单设置，403 和 451 引导联系客服，无法到达页面或功能时（404、410 等）引导回到首页，发送的内容有问题时引导回到上一页，稍等或刷新就能恢复时引导重试（若是服务器端的问题，还会附上运行状态）。状态码显示得很大，读屏时读作“错误 404”。5xx 的参考编号可以复制。429 在等待期间无法按下“重试”。',
      offline: '离线',
      tableCaption: '错误页面涵盖的状态',
      head: { code: '代码', title: '标题', description: '说明' },
    },
    maintenance: {
      title: '维护',
      intro: '计划时间按访问者所在的时区显示，并附上时区名称（同一天时日期只显示一次）。如果有运行状态页面，会优先引导前往，并按时间列出进展通知。',
    },
    code: "import { ErrorPage, MaintenancePage } from '@genelab/gassan';\n\n// Next.js 的 app/not-found.tsx\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />",
    codeCaption: '用法',
    a11yCaption: '错误与维护模板满足的规范',
  },
  public: {
    lead: '价格、常见问题、联系我们、服务条款与隐私政策、更新日志。连同页眉和页脚（SiteLayout）一起，由一个组件输出。导航和页脚的各列只要在 SiteProvider 中写一次，就会作用于所有页面。',
    site: {
      title: '页面外框',
      intro: '跳到正文的链接、页眉的导航（当前页面带 aria-current）、页脚的链接列，以及条款的链接。容器较窄时，导航会收进“菜单”按钮下面。放进自己的外框时，使用 layout={false}。',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: '价格', href: '/pricing' },\n    { label: '常见问题', href: '/faq' },\n  ]}\n  footer={[{ title: '公司', links: [{ label: '公司简介', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"省 2 个月费用\" />\n</SiteProvider>",
    },
    pricing: {
      title: '套餐与价格',
      intro: '可以切换按月付款和按年付款，价格以货币的格式显示。读屏时会把周期读成文字，例如“每月 ¥1,500”。推荐的套餐用“推荐”字样和外圈的轮廓标示，对比表带有列标题和行标题。',
    },
    faq: {
      title: '常见问题',
      intro: '可以按词语筛选问题（不区分平假名与片假名、全角与半角），并读出结果数量。按类别用标题分组，地址中 #id 指向的问题会以展开状态显示。最后放上联系我们的入口。',
    },
    contact: {
      title: '联系我们',
      intro: '按照日本联系表单的惯例，标出必填和选填。类型用下拉选择，内容显示字数，并要求同意隐私政策。发送后切换到受理完成的画面。',
    },
    document: {
      title: '条款与文档',
      intro: '生效日期与更新日期（time 元素）、目录（带名称的 nav）、带编号的条款（“第 1 条”）。容器较宽时，目录放在侧边并跟随滚动；打印时省略目录和外框。依据《特定商业交易法》的标示，可以写成名称与值的列表。',
      variants: { terms: '服务条款', privacy: '隐私政策', legal: '依据《特定商业交易法》的标示' },
    },
    changelog: {
      title: '更新日志',
      intro: '每次更新都有标题、日期（time 元素）、版本和用文字表示类型的标签，可以只按实际用到的类型筛选。容器较宽时，日期和版本放在侧边的一列。',
    },
    a11yCaption: '公开页面模板满足的规范',
  },
  app: {
    lead: '登录之后的界面外框。左侧的导航栏、顶部栏（搜索、通知、账户）和正文。容器较窄时，从顶部栏的“菜单”以侧边面板打开导航。内容由页面标题栏、数值摘要和数据表格组成。',
    setup: {
      title: '用法',
      intro: '导航按分组传入，并把当前页面的跳转地址传给 current。产品的名称和标志，以及渲染链接的组件（Next.js 的 Link 等），都从 SiteProvider 中获取。',
      code: "import { AppShell, PageHeader, DataTable } from '@genelab/gassan';\n\n<AppShell\n  current={pathname}\n  nav={[\n    { items: [{ label: '首页', href: '/app', icon: <HomeIcon /> }] },\n    { title: '工作区', items: [{ label: '成员', href: '/app/members' }] },\n  ]}\n  actions={<IconButton label=\"搜索\"><SearchIcon /></IconButton>}\n  account={{ name: '王芳', menu: [{ value: 'sign-out', label: '退出登录', onSelect: signOut }] }}\n>\n  <PageHeader title=\"成员\" actions={<Button variant=\"primary\">邀请</Button>} />\n  <DataTable label=\"成员\" rows={members} columns={columns} getRowId={(m) => m.id} selectable />\n</AppShell>",
    },
    shell: {
      title: '应用外框',
      intro: '容器较宽时，在左侧放置导航栏，并用底色和粗体标示当前页面。切换到“手机”后，导航会收起，可以从“菜单”以侧边面板打开（按 Esc 或点击外部即可关闭，点击导航中的链接也会关闭）。从导航可以前往成员、套餐与账单、设置的示例。',
      variants: { dashboard: '首页（仪表盘）', members: '成员（数据表格）' },
    },
    a11yCaption: '应用外框满足的规范',
  },
  appPages: {
    lead: '登录之后、每个 SaaS 都有的界面：账号设置、成员与邀请、套餐与账单、初始设置、接受邀请的页面。放在应用外框中，只要传入数据和处理函数，提交流程、确认模态框，连结果的播报也都处理好了。',
    setup: {
      title: '用法',
      intro: '内容放在应用外框（AppShell）中。传入的只有数据和处理函数（保存、邀请、取消订阅等）。处理失败时返回 { error }，就会打断当前的播报，读出这段文字。没有传入的区块和操作不会显示。',
      code: "import { AppShell, MembersPage, SettingsPage } from '@genelab/gassan';\n\n<AppShell current=\"/settings\" nav={nav} account={account}>\n  <SettingsPage\n    profile={{ name: user.name, email: user.email, onSubmit: saveProfile }}\n    password={{ onSubmit: changePassword }}\n    sessions={{ items: sessions, onRevoke: revokeSession, onRevokeOthers: revokeOtherSessions }}\n    deleteAccount={{ confirmText: user.email, onDelete: deleteAccount }}\n  />\n</AppShell>\n\n<MembersPage\n  members={members}\n  roles={[{ value: 'admin', label: '管理员' }, { value: 'editor', label: '编辑者' }]}\n  currentUserId={user.id}\n  onInvite={({ emails, role }) => invite(emails, role)}\n  onRemove={(ids) => removeMembers(ids)}\n/>",
    },
    settings: {
      title: '账号设置',
      intro: '个人资料、密码、两步验证、已登录的设备、删除账号，分成带标题的区块依次排列。容器较宽时，区块的标题和说明放在左侧一列。让设备退出登录的按钮带有设备名称，当前正在使用的设备上不放这个按钮。删除要在确认模态框中进行，输入指定的文字（如邮箱地址）之前无法按下。',
    },
    members: {
      title: '成员',
      intro: '已用席位、按姓名和邮箱地址筛选（不区分平假名与片假名、全角与半角）、成员表格、邀请中的列表。邀请在模态框中进行，把邮箱地址作为标签一次性输入。自己所在的行不能选择、不能移除，也不能更改角色。移除时会先经过确认模态框。',
    },
    billing: {
      title: '套餐与账单',
      intro: '当前套餐和下次续订日期、支付方式（卡号只显示末 4 位）、用量、发票表格。用量达到 80% 时显示为警告色，达到上限时显示为错误色，同时也用数字标示。付款失败时，会用页面顶部的通知横幅告知。在示例中取消订阅后，会改为显示可以使用的最后一天。',
    },
    onboarding: {
      title: '初始设置',
      intro: '注册之后紧接着的步骤。在卡片上方放置进度，步骤切换时把焦点移到标题。无法进入下一步的原因会显示在内容上方并播报出来。可以跳过的步骤会显示“稍后设置”。在示例中，不输入工作区名称就无法进入下一步。',
    },
    invite: {
      title: '接受邀请',
      intro: '标明是谁、邀请你加入哪个工作区、担任什么角色，并放上接受 / 拒绝。未登录时引导去登录和创建账号；邀请过期时只引导接下来该做的事。拒绝后，切换到已拒绝的画面，并把焦点移到标题。',
      variants: { pending: '邀请', signedOut: '未登录', expired: '已过期' },
    },
    a11yCaption: '应用内页面模板满足的规范',
  },
  conversations: {
    lead: '聊天与 AI 助手的界面。放在应用外框中，只要传入会话、消息和发送的处理函数，列表与会话的切换、未读数、按会话保留的草稿，连停止回答的按钮也都处理好了。',
    setup: {
      title: '用法',
      intro: '打开的会话及其消息由应用自行管理。选择会话时调用 onConversationChange，选择历史记录中的对话时调用 onThreadChange。容器较窄时，列表和会话切换着显示。',
      code: "import { AssistantPage, ChatPage } from '@genelab/gassan';\n\n<ChatPage\n  conversations={conversations}\n  current={currentId}\n  onConversationChange={setCurrentId}\n  messages={messagesOf(currentId)}\n  currentUserId={user.id}\n  onSend={(text) => send(currentId, text)}\n/>\n\n<AssistantPage\n  messages={messages}\n  currentUserId={user.id}\n  onSend={ask}\n  generating={generating}\n  onStop={stop}\n  suggestions={suggestions}\n  history={threads}\n  currentThreadId={threadId}\n  onThreadChange={openThread}\n  onNewThread={startThread}\n/>",
    },
    chat: {
      title: '聊天',
      intro: '左侧是会话列表（频道和私信、未读数、最后一条消息），右侧是打开的会话。打开会话后未读数会清零，并从新消息的分隔线开始阅读。发送后，“发送中”的状态会随之更新；在私信中，输入中提示之后会收到回复。切换到“手机”后，列表和会话切换显示，点击标题前的“返回会话列表”即可回到列表。',
    },
    assistant: {
      title: 'AI 助手',
      intro: '还没有对话时，显示问候语和示例问题；开始对话后，回答会以流式方式边写边显示。写的过程中，发送按钮会变成“停止”。左侧的历史记录分为今天、昨天、过去 7 天、更早，点击“新对话”即可回到示例问题的画面。切换到“手机”后，用标题前的时钟按钮打开历史记录。',
    },
    a11yCaption: '会话页面模板满足的规范',
  },
  mail: {
    lead: '邮件的界面。文件夹、邮件列表和阅读窗格会按容器的宽度，以三栏、两栏或切换的方式显示。可以选中多行，一起归档、删除、标为已读；写邮件、回复和转发都在模态框中进行。',
    setup: {
      title: '用法',
      intro: '文件夹和打开的邮件由应用自行管理。打开邮件时会调用 onOpen（标为已读也由应用负责）。批量操作和发送只需传入处理函数，处理失败时返回 { error }，就会打断当前的播报，读出这段文字。没有传入的操作不会显示。',
      code: "import { MailboxPage } from '@genelab/gassan';\n\n<MailboxPage\n  folders={folders}\n  currentFolder={folderId}\n  onFolderChange={setFolderId}\n  messages={messagesIn(folderId)}\n  current={messageId}\n  onOpen={openMessage}\n  onArchive={(ids) => archive(ids)}\n  onDelete={(ids) => moveToTrash(ids)}\n  onMarkRead={(ids, read) => markRead(ids, read)}\n  onStar={(id, starred) => star(id, starred)}\n  onSend={(values) => send(values)}\n/>",
    },
    preview: {
      title: '邮件',
      intro: '容器较宽时，文件夹、列表和阅读窗格并排显示。选中行后，上方会出现“已选择 n 封”和批量操作，并播报归档或删除的结果。打开邮件后会标为已读；点击“回复”会打开已填好收件人和主题的写邮件画面。切换到“手机”后，文件夹会变成列表上方的下拉选择框，列表和阅读窗格切换显示。',
    },
    a11yCaption: '邮件模板满足的规范',
  },
} satisfies typeof ja;
