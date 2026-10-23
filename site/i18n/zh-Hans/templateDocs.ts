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
      intro: '401 引导登录，403 引导申请权限，404 引导回到首页和上一页，429、5xx 和离线则引导重试。状态码显示得很大，读屏时读作“错误 404”。5xx 的参考编号可以复制。429 在等待期间无法按下“重试”。',
      variants: {
        notFound: '404 找不到',
        server: '500 服务器问题',
        forbidden: '403 没有权限',
        unauthorized: '401 需要登录',
        tooMany: '429 请求过多',
        offline: '离线',
      },
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
} satisfies typeof ja;
