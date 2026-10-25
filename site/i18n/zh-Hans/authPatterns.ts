import type ja from '../ja/authPatterns';

export default {
  lead: '登录与注册是服务的入口，也是用户最容易流失的地方。这里汇集了几种形式：沿用页面式登录与注册的表单和提交流程，只改变呈现的方式与顺序。包括从页眉打开的窗口、先问邮箱地址再分流的登录、不用密码的邮件链接与短信、只需邮箱地址的临时注册与正式注册的步骤、通行密钥、选择账号、身份验证与登录过期，以及购买后创建账号。',
  choose: {
    title: '根据服务来选择',
    intro: '这些形式都可以组合使用。比如金融类服务，可以从页眉的窗口进入临时注册，再从邮件中的链接进入正式注册的步骤，完成后询问是否创建通行密钥。',
    tableCaption: '服务与适合的形式',
    head: { service: '服务', pattern: '形式', why: '理由' },
    rows: [
      {
        service: '一般的网络服务、SaaS',
        pattern: '`AuthDialog`（窗口）',
        why: '不离开正在浏览的页面就能登录和注册，完成后可以回到原来的操作',
      },
      {
        service: '面向企业的 SaaS',
        pattern: '`EmailFirstPage`（先问邮箱地址）',
        why: '把公司的域名分流到组织的身份提供方（SSO），登录和注册的入口合而为一',
      },
      {
        service: '金融、保险、房地产、人力资源',
        pattern: '`QuickSignUpPage` → `RegistrationWizardPage`',
        why: '要问的内容很多，所以入口只问邮箱地址，正式注册则一边保存一边逐步进行',
      },
      {
        service: '偶尔才用的服务',
        pattern: '`MagicLinkPage`（邮件链接）',
        why: '很多人会忘记密码。用邮件中的链接和验证码就能登录，省去重置密码的麻烦',
      },
      {
        service: '以手机为主的服务',
        pattern: '`PhoneSignInPage`（短信）、通行密钥',
        why: '减少输入。验证码从短信自动填入，第二次起可以用指纹或人脸登录',
      },
      {
        service: '家庭和工作分别使用不同账号的服务',
        pattern: '`AccountChooserPage`',
        why: '只要选择在此设备上用过的账号，不必重新输入邮箱地址',
      },
      {
        service: '涉及付款、注销账号或更改密码的画面',
        pattern: '`ReauthDialog`',
        why: '不离开页面，再次询问密码。即使登录过期，正在输入的内容也不会丢失',
      },
      {
        service: '电商、预约',
        pattern: '`GuestAccountCard`',
        why: '购买前不要求注册会员。在购买完成的画面上，只需设置密码即可创建账号',
      },
    ],
  },
  setup: {
    title: '从页眉以窗口打开',
    intro: '把 `AuthDialog` 和页眉的按钮放在一起，并选择要打开的画面（`mode`）。在窗口中可以在登录、注册、重置密码之间切换，完成后关闭窗口，并把焦点移回按下的按钮。',
    code: `import { useState } from 'react';
import { AuthDialog, Button, type AuthDialogMode } from '@genelab/gassan';

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>('signIn');
  const openAs = (next: AuthDialogMode) => {
    setMode(next);
    setOpen(true);
  };
  return (
    <>
      <Button variant="tertiary" onClick={() => openAs('signIn')}>登录</Button>
      <Button variant="primary" onClick={() => openAs('signUp')}>免费开始</Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        onSignIn={async ({ email, password }) => {
          // 失败时显示默认的提示（不透露是哪一项错了）
          if (!(await signIn(email, password))) return { error: true };
        }}
        onSignUp={(values) => signUp(values)}
        onForgotPassword={({ email }) => sendResetEmail(email)}
      />
    </>
  );
}`,
  },
  dialog: {
    title: '窗口中的登录与注册',
    intro: '从页眉的“登录”“免费开始”打开，不离开当前页面。点击外部不会关闭（不会清除已输入的内容），按 Esc 或关闭按钮才会关闭。已输入的邮箱地址，在登录和注册之间切换时也会保留。在示例中，密码输入“gassan”即可登录。',
  },
  emailFirst: {
    title: '先询问邮箱地址的登录',
    intro: '一开始只问邮箱地址。根据应用的回答，分流到密码、注册、组织的身份提供方或邮件链接。在密码画面中，以不可更改的形式显示邮箱地址，并告诉密码管理器是哪个账号。如果不想透露账号是否存在，对不存在的账号也返回密码或链接。',
  },
  magicLink: {
    title: '邮件链接与验证码',
    intro: '不使用密码的登录。只询问邮箱地址，然后发送登录链接和验证码。比如在手机上看邮件、在电脑上登录时，即使在打不开链接的设备上，也能用验证码登录。本示例的验证码是“123456”。',
  },
  quickSignUp: {
    title: '只需邮箱地址的临时注册与正式注册',
    intro: '入口只询问邮箱地址。提交后临时注册即完成，并通过邮件发送正式注册的链接。正式注册的步骤每前进一步都会保存，即使通过“保存并稍后继续”离开，也能从中断处继续；在最后的确认画面中可以修改各个步骤。地址、姓名和出生日期由日本表单输入的部件组成。',
    quick: '临时注册',
    wizard: '正式注册的步骤',
  },
  phone: {
    title: '电话号码与短信',
    intro: '无论号码怎么写，都统一为纯数字，并检查是否为能接收短信的手机号码。如果是固定电话号码，会用说明修改方法的文字提示。验证码从短信自动填入，位数凑齐后自动提交。本示例的验证码是“123456”。',
  },
  passkey: {
    title: '通行密钥',
    intro: '在登录页面放置“使用通行密钥登录”，并让用户也能从邮箱地址输入框选择通行密钥。登录后立即询问一次是否创建通行密钥（“稍后”也以同等分量供选择）。WebAuthn 的调用由应用传入。',
    prompt: '询问是否创建',
    signIn: '登录按钮',
  },
  accountChooser: {
    title: '选择账号',
    intro: '列出曾在此设备上登录过的账号，只要选择即可进入该账号的登录。始终显示“使用其他账号”，不再使用的账号可以从此设备移除。',
  },
  reauth: {
    title: '身份验证与登录过期',
    intro: '不离开页面、再次询问密码的窗口。有两种用法：重要操作之前的身份验证，以及登录过期。登录过期的窗口无法关闭，可以在保留正在输入的内容的同时重新登录。本示例的密码是“gassan”。',
    confirm: '重要操作之前',
    expired: '登录过期',
  },
  guestAccount: {
    title: '购买后创建账号',
    intro: '购买前不要求注册会员（可以以游客身份购买）。在购买完成的画面上放一张卡片，只需设置密码即可创建账号。邮箱地址使用订单中的地址。',
  },
  a11yCaption: '各种形式的登录与注册的行为',
  samples: {
    signIn: '登录',
    startFree: '免费开始',
    heroTitle: '团队的工作，集中在一处',
    heroDescription: '按下右上角的“登录”或“免费开始”，会在此页面上方打开窗口（示例）。',
    signedUp: '已创建账号（示例）',
    passkeyNotice: '这是示例，不会真正调用通行密钥。',
    emailFirstHint:
      '示例：以“new”开头的地址进入注册，“@corp.example.com”进入组织的身份提供方，以“link”开头的地址进入邮件链接。其他地址则询问密码（gassan）。',
    expiresIn: '24 小时',
    quickSteps: ['打开邮件中的链接', '填写个人信息和地址', '确认内容后注册'],
    useEmail: '使用邮箱地址登录',
    accounts: [
      { id: 'hana', name: '王欣怡', email: 'hana@example.com' },
      { id: 'aoi', name: '王芳', email: 'aoi@corp.example.com' },
      { id: 'ren', name: '周宇航', email: 'ren@example.jp' },
    ],
    securityTitle: '安全',
    securityDescription: '更改密码之前，会再次确认密码。本示例的密码是“gassan”。',
    changePassword: '更改密码',
    securityDone: '已完成身份验证（示例）',
    expiredTitle: '周报',
    expiredDescription: '点击“模拟登录过期”，会打开登录过期时显示的窗口。写了一半的周报原样保留。本示例的密码是“gassan”。',
    expiredLabel: '本周完成的工作',
    expiredDraft: '上线了新的价格页面。通过联系表单收到的咨询增加了两成。',
    expiredDone: '已重新登录。写了一半的内容原样保留（示例）',
    expire: '模拟登录过期',
    orderTitle: '感谢您的订购',
    orderDescription: '订单确认邮件已发送到 hana@example.com。',
    orderRows: [
      { term: '订单编号', details: 'A-20261026-0042' },
      { term: '预计送达', details: '10月29日（周四）' },
      { term: '付款', details: '¥4,180（信用卡）' },
    ],
    guestLater: '也可以稍后再创建账号（示例）',
    wizard: {
      profileTitle: '个人信息',
      profileDescription: '为了验证身份，请按照官方证件上的写法填写。',
      name: '姓名',
      birth: '出生日期',
      profileRequired: '请输入姓名和出生日期',
      addressTitle: '地址与联系方式',
      addressDescription: '输入邮政编码后，会自动填入部分地址。',
      address: '地址',
      phone: '电话号码',
      addressRequired: '请输入地址和电话号码',
      purposeTitle: '使用目的',
      purposeDescription: '用于改进服务。也可以稍后填写。',
      purpose: '主要目的',
      choose: '请选择',
      purposes: ['投资理财', '管理生活开支', '经营资金', '其他'],
      notAnswered: '未回答',
      savedExit: '已保存。可以通过邮件中的链接继续填写（示例）',
      doneNext: '继续',
    },
  },
} satisfies typeof ja;
