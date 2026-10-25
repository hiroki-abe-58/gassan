import type ja from '../ja/authPatterns';

export default {
  lead: '登入與註冊是服務的入口，也是使用者最容易離開的地方。這裡整理了幾種形式：沿用頁面式登入與註冊的表單與送出流程，只改變呈現的方式與順序。包括從頁首開啟的視窗、先詢問電子郵件地址再分流的登入、不用密碼的郵件連結與簡訊、只需電子郵件地址的暫時註冊與正式註冊步驟、密碼金鑰、選擇帳號、身分驗證與登入逾時，以及購買後建立帳號。',
  choose: {
    title: '依服務類型選擇',
    intro: '這些形式都能組合使用。例如金融服務，可以從頁首的視窗進入暫時註冊，再從郵件中的連結進入正式註冊的步驟，完成後詢問是否要建立密碼金鑰。',
    tableCaption: '服務與適合的形式',
    head: { service: '服務', pattern: '形式', why: '理由' },
    rows: [
      {
        service: '一般的網路服務、SaaS',
        pattern: '`AuthDialog`（視窗）',
        why: '不必離開正在瀏覽的頁面就能登入與註冊，完成後可以回到原本的操作',
      },
      {
        service: '企業用的 SaaS',
        pattern: '`EmailFirstPage`（先問電子郵件地址）',
        why: '將公司的網域分流到組織的身分提供者（SSO），登入與註冊的入口合而為一',
      },
      {
        service: '金融、保險、不動產、人力資源',
        pattern: '`QuickSignUpPage` → `RegistrationWizardPage`',
        why: '要詢問的項目很多，所以入口只問電子郵件地址，正式註冊則一邊儲存一邊逐步進行',
      },
      {
        service: '偶爾才使用的服務',
        pattern: '`MagicLinkPage`（郵件連結）',
        why: '很多人會忘記密碼。用郵件中的連結與驗證碼就能登入，省去重設密碼的麻煩',
      },
      {
        service: '以手機為主的服務',
        pattern: '`PhoneSignInPage`（簡訊）、密碼金鑰',
        why: '減少輸入。驗證碼會從簡訊自動填入，第二次起可以用指紋或臉孔登入',
      },
      {
        service: '家庭與工作分別使用不同帳號的服務',
        pattern: '`AccountChooserPage`',
        why: '只要選擇在這部裝置上用過的帳號，不必重新輸入電子郵件地址',
      },
      {
        service: '涉及付款、刪除帳號或變更密碼的畫面',
        pattern: '`ReauthDialog`',
        why: '不離開頁面，再詢問一次密碼。即使登入逾時，正在輸入的內容也不會遺失',
      },
      {
        service: '電商、預約',
        pattern: '`GuestAccountCard`',
        why: '購買前不要求註冊會員。在購買完成的畫面上，只要設定密碼就能建立帳號',
      },
    ],
  },
  setup: {
    title: '從頁首以視窗開啟',
    intro: '將 `AuthDialog` 與頁首的按鈕放在一起，並選擇要開啟的畫面（`mode`）。在視窗中可以在登入、註冊、重設密碼之間切換，完成後關閉視窗，並將焦點移回按下的按鈕。',
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
      <Button variant="tertiary" onClick={() => openAs('signIn')}>登入</Button>
      <Button variant="primary" onClick={() => openAs('signUp')}>免費開始</Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        onSignIn={async ({ email, password }) => {
          // 失敗時顯示預設的訊息（不透露是哪一項錯誤）
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
    title: '視窗中的登入與註冊',
    intro: '從頁首的「登入」「免費開始」開啟，不必離開目前的頁面。點擊外側不會關閉（不會清除已輸入的內容），按 Esc 或關閉按鈕才會關閉。已輸入的電子郵件地址，在登入與註冊之間切換時也會保留。在範例中，密碼輸入「gassan」即可登入。',
  },
  emailFirst: {
    title: '先詢問電子郵件地址的登入',
    intro: '一開始只問電子郵件地址。依應用程式的回應，分流到密碼、註冊、組織的身分提供者或郵件連結。在密碼畫面中，以無法變更的形式顯示地址，並告訴密碼管理工具是哪個帳號。如果不想透露帳號是否存在，對不存在的帳號也回傳密碼或連結。',
  },
  magicLink: {
    title: '郵件連結與驗證碼',
    intro: '不使用密碼的登入。只詢問電子郵件地址，然後寄送登入連結與驗證碼。例如在手機上收信、在電腦上登入時，即使在無法開啟連結的裝置上，也能以驗證碼登入。本範例的驗證碼是「123456」。',
  },
  quickSignUp: {
    title: '只需電子郵件地址的暫時註冊與正式註冊',
    intro: '入口只詢問電子郵件地址。送出後即完成暫時註冊，並以電子郵件寄送正式註冊的連結。正式註冊的步驟每前進一步就會儲存，即使透過「儲存並稍後繼續」離開，也能從中斷處繼續；在最後的確認畫面中可以修改各個步驟。地址、姓名與出生日期是以日本表單輸入的元件組成。',
    quick: '暫時註冊',
    wizard: '正式註冊的步驟',
  },
  phone: {
    title: '電話號碼與簡訊',
    intro: '無論號碼怎麼寫，都統一為純數字，並確認是否為能接收簡訊的手機號碼。若是市話號碼，會以說明修正方法的文字告知。驗證碼會從簡訊自動填入，位數到齊就自動送出。本範例的驗證碼是「123456」。',
  },
  passkey: {
    title: '密碼金鑰',
    intro: '在登入頁面放置「使用密碼金鑰登入」，並讓使用者也能從電子郵件地址欄位選擇密碼金鑰。登入後立即詢問一次是否要建立密碼金鑰（「稍後」也以同等份量供選擇）。WebAuthn 的呼叫由應用程式傳入。',
    prompt: '詢問是否建立',
    signIn: '登入按鈕',
  },
  accountChooser: {
    title: '選擇帳號',
    intro: '列出曾在這部裝置上登入過的帳號，只要選擇就會進入該帳號的登入。一律顯示「使用其他帳號」，不再使用的帳號可以從這部裝置移除。',
  },
  reauth: {
    title: '身分驗證與登入逾時',
    intro: '不離開頁面、再詢問一次密碼的視窗。有兩種用法：重要操作前的身分驗證，以及登入逾時。登入逾時的視窗無法關閉，可以保留正在輸入的內容並重新登入。本範例的密碼是「gassan」。',
    confirm: '重要操作之前',
    expired: '登入逾時',
  },
  guestAccount: {
    title: '購買後建立帳號',
    intro: '購買前不要求註冊會員（可以用訪客身分購買）。在購買完成的畫面上放一張卡片，只要設定密碼就能建立帳號。電子郵件地址使用訂單中的地址。',
  },
  a11yCaption: '各種形式的登入與註冊的行為',
  samples: {
    signIn: '登入',
    startFree: '免費開始',
    heroTitle: '團隊的工作，集中在一處',
    heroDescription: '按下右上角的「登入」或「免費開始」，就會在這個頁面上方開啟視窗（範例）。',
    signedUp: '已建立帳號（範例）',
    passkeyNotice: '這是範例，不會實際呼叫密碼金鑰。',
    emailFirstHint:
      '範例：以「new」開頭的地址會進入註冊，「@corp.example.com」會進入組織的身分提供者，以「link」開頭的地址會進入郵件連結。其他地址則會詢問密碼（gassan）。',
    expiresIn: '24 小時',
    quickSteps: ['開啟郵件中的連結', '填寫個人資料與地址', '確認內容後註冊'],
    useEmail: '使用電子郵件地址登入',
    accounts: [
      { id: 'hana', name: '陳思妤', email: 'hana@example.com' },
      { id: 'aoi', name: '陳怡君', email: 'aoi@corp.example.com' },
      { id: 'ren', name: '吳柏翰', email: 'ren@example.jp' },
    ],
    securityTitle: '安全性',
    securityDescription: '變更密碼之前，會再確認一次密碼。本範例的密碼是「gassan」。',
    changePassword: '變更密碼',
    securityDone: '已完成身分驗證（範例）',
    expiredTitle: '週報',
    expiredDescription: '按下「模擬登入逾時」，會開啟登入逾時時顯示的視窗。寫到一半的週報原封不動。本範例的密碼是「gassan」。',
    expiredLabel: '本週完成的事',
    expiredDraft: '上線了新的價格頁面。透過聯絡表單收到的詢問增加了兩成。',
    expiredDone: '已重新登入。寫到一半的內容原封不動（範例）',
    expire: '模擬登入逾時',
    orderTitle: '感謝您的訂購',
    orderDescription: '訂單確認信已寄到 hana@example.com。',
    orderRows: [
      { term: '訂單編號', details: 'A-20261026-0042' },
      { term: '預計送達', details: '10月29日（週四）' },
      { term: '付款', details: '¥4,180（信用卡）' },
    ],
    guestLater: '帳號也可以稍後再建立（範例）',
    wizard: {
      profileTitle: '個人資料',
      profileDescription: '為了驗證身分，請依照官方證件上的寫法填寫。',
      name: '姓名',
      birth: '出生日期',
      profileRequired: '請輸入姓名與出生日期',
      addressTitle: '地址與聯絡方式',
      addressDescription: '輸入郵遞區號後，會自動填入部分地址。',
      address: '地址',
      phone: '電話號碼',
      addressRequired: '請輸入地址與電話號碼',
      purposeTitle: '使用目的',
      purposeDescription: '用於改善服務。也可以稍後再填寫。',
      purpose: '主要目的',
      choose: '請選擇',
      purposes: ['投資理財', '管理生活開支', '營運資金', '其他'],
      notAnswered: '未回答',
      savedExit: '已儲存。可以從郵件中的連結繼續填寫（範例）',
      doneNext: '繼續',
    },
  },
} satisfies typeof ja;
