import type ja from '../ja/registrationPresets';

export default {
  lead: '金融、網購、醫療、交友配對等產業的正式註冊，這些產業須詢問的項目由日本法令規定。入口只詢問電子郵件地址，交易前須詢問的項目，則依產業整理成各自的步驟與順序。每個步驟都依據法令寫明詢問的理由，未成年人的法定代理人同意、年齡下限與身分驗證方式，也配合產業組合。',
  law: {
    title: '關於法令',
    body: '這些步驟與依據，是根據 2026 年 10 月 26 日當時的條文（e-Gov 法令檢索）與政府機關的資料整理出的參考，並非法律意見。須詢問的項目會因業者登記或申報的類型而不同，法令也經常修正。推出服務之前，請向專業人士確認適用於自家公司的法令與最新的修正。出處請見下方表格中的連結。',
  },
  presets: {
    title: '選擇產業',
    intro: '把產業傳給 `preset`，就會以該產業的步驟與欄位組成正式註冊。這張表是由 `REGISTRATION_PRESETS` 產生的，因此與函式庫的內容一致。',
    tableCaption: '各產業正式註冊的步驟與依據',
    head: { preset: '產業', steps: '正式註冊的步驟', age: '年齡', laws: '依據' },
    minAge: (age: number) => `年滿 ${String(age)} 歲`,
    guardianUnder: (age: number) => `未滿 ${String(age)} 歲須法定代理人同意`,
    noAge: '無規定',
  },
  sample: {
    title: '範例',
    intro: '選擇產業後，可以實際走一遍正式註冊的步驟。按下「下一步」時，需要修正的地方會顯示在欄位下方，每前進一個步驟就會儲存。郵遞區號輸入 100-0001 等會填入地址，法人編號輸入 7000012050002 會填入公司名稱（範例資料）。身分驗證只是範例，選擇方式並按下按鈕就會視為已完成驗證。',
  },
  flow: {
    title: '從入口到正式註冊',
    intro: '入口的 `QuickSignUpPage` 只詢問電子郵件地址，送出後即完成暫時註冊。法令的寫法是在簽約或交易的時間點才負有確認義務，因此可以解讀為不必在入口就要求身分驗證（找不到明確如此表示的官方資料）。從郵件中的連結開啟 `RegistrationPresetPage`，每個步驟都以 `onSave` 儲存，讓使用者離開後也能從中斷處繼續。',
    code: `import { QuickSignUpPage, RegistrationPresetPage } from '@genelab/gassan';

// 1. 入口：只有電子郵件地址。送出後即完成暫時註冊，並以電子郵件寄送正式註冊的連結
export function Entry() {
  return (
    <QuickSignUpPage
      onSubmit={({ email }) => api.preRegister(email)}
      expiresIn="24 小時"
      steps={['開啟郵件中的連結', '填寫基本資料', '身分驗證']}
    />
  );
}

// 2. 從郵件中的連結：依產業的正式註冊
export function Registration({ draft }: { draft: Draft }) {
  return (
    <RegistrationPresetPage
      preset="securities"
      defaultValues={draft.values}
      defaultStep={draft.stepId}
      onSave={(values, stepId) => api.saveDraft(values, stepId)}
      onSaveAndExit={() => navigate('/home')}
      lookupAddress={(postalCode) => api.postalCode(postalCode)}
      onVerifyIdentity={(method, values) => ekyc.start(method, values)}
      onSubmit={(values) => api.register(values)}
    />
  );
}`,
  },
  timing: {
    title: '何時詢問',
    intro: '入口詢問的項目越少，使用者越不容易離開。把詢問延後到法令要求的時間點，詢問時則在步驟的說明中寫明理由。',
    tableCaption: '詢問的時間點與項目',
    head: { stage: '時間點', items: '詢問的項目', how: '元件' },
    rows: [
      {
        stage: '入口（暫時註冊）',
        items: '只有電子郵件地址與同意服務條款。個人資料的利用目的須在送出前明示（《個人資料保護法》第 21 條第 2 項）。廣告郵件的同意要另外做成選填的核取方塊，預設不勾選（《特定電子郵件法》第 3 條）。',
        how: '`QuickSignUpPage`',
      },
      {
        stage: '正式註冊（交易前）',
        items: '姓名、地址、出生日期，以及各產業的項目。金融業則包括職業、交易目的、外國 PEPs、稅務居住國、並非反社會勢力的聲明，以及身分驗證。',
        how: '`RegistrationPresetPage`',
      },
      {
        stage: '進行該項交易之前',
        items: '是否為上市公司的董監事（首次買賣上市股票前）、網購的收件地址（首次訂購前）、收購時的身分驗證（收購前）。',
        how: '拆成另一個步驟，或設為 `optional` 之後再詢問',
      },
      {
        stage: '不詢問的項目',
        items: '法令未要求的項目不設為必填。若要詢問任職單位或電話號碼，請附上理由。招募時不詢問本籍、家人、宗教等（日本厚生勞動省關於公正錄用甄選的基本原則）。',
        how: '`optional`',
      },
    ],
  },
  fields: {
    title: '欄位元件',
    intro: '正式註冊的步驟，是用法令要求的項目做成的元件組成的。也可以只把元件放進自己的畫面。文字可以透過 `SiteProvider` 的 `registrationLabels` 替換（預設為日文與英文）。',
    work: {
      title: '職業與交易目的',
      intro: '依《犯罪收益移轉防止法》進行交易時確認所詢問的項目。不採自由填寫，而是以金融廳的分類作為選項。交易目的可以複選，選項的組合會因業態而不同。',
      exampleTitle: '職業與交易目的',
      exampleDescription: '變更業態後，交易目的的選項也會跟著改變。值以鍵（key）的形式接收。',
    },
    declarations: {
      title: '申報與聲明',
      intro: '外國 PEPs、稅務居住國（CRS、CARF）、美國納稅義務（FATCA）都是二選一：問題作為群組的名稱，適用對象的範圍寫在說明中。只對適用的人顯示追加的欄位。排除反社會勢力的聲明，範圍的說明可以展開與收合。',
      exampleTitle: '申報與聲明',
      exampleDescription: '選擇「日本以外還有其他國家」與「有」後，就會出現國家與稅籍編號的欄位，以及美國稅籍編號與同意的欄位。',
    },
    numbers: {
      title: '個人編號與法人編號',
      intro: '個人編號統一為純數字，並關閉自動填入與拼字檢查。確認畫面只顯示末 4 碼。法人編號在湊齊連檢查碼都正確的 13 位數後，查詢並補上公司名稱（不覆寫使用者輸入的公司名稱）。',
      exampleTitle: '個人編號與法人編號',
      exampleDescription: '即使輸入「１２３４-５６７８ ９０１８」這樣的寫法，也會只留下數字。在法人編號輸入 7000012050002，就會填入公司名稱。',
    },
    identity: {
      title: '身分驗證方式',
      intro: '可使用的方式由依據的法令決定，並會隨修法而改變。方式以名稱而非條文編號保存；傳入日期後，該日已無法使用的方式就不會顯示。身分驗證本身（讀取 IC 晶片或拍攝）由使用端的身分驗證服務執行。',
      exampleTitle: '身分驗證方式',
      exampleDescription: '在「銀行、證券等」下選擇「2027 年 4 月 1 日起」，「拍攝證件與臉部」就會消失（《犯罪收益移轉防止法》的修正）。',
    },
    guardian: {
      title: '法定代理人同意與廣告郵件同意',
      intro: '未成年人簽訂的契約，若未經法定代理人同意即可撤銷。從出生日期得知是未成年人時，就詢問法定代理人的姓名、關係、電子郵件地址與同意。廣告郵件的同意，要做成與同意服務條款分開的選填核取方塊。',
      exampleTitle: '法定代理人同意與廣告郵件同意',
      exampleDescription: '法定代理人的欄位不會被自動填入本人的姓名或電子郵件地址。',
    },
  },
  amendments: {
    title: '修法時程',
    intro: '身分驗證與個人資料的規定，這幾年會接連改變。依日期切換的規定，元件會根據日期自動切換。',
    tableCaption: '施行日期與 gassan 的對應',
    head: { date: '施行日期', change: '變更內容', gassan: 'gassan' },
    rows: [
      {
        date: '2026-01-01',
        change: '加密資產交易須申報稅務居住國（CARF。《租稅條約等實施特例法》第 10 條之 9）。既有使用者的期限為 2026 年底。',
        gassan: '在 `crypto` 的確認事項中加入了稅務居住國',
      },
      {
        date: '2026-04-01',
        change: '行動電話簽約時的線上身分驗證，原則上改為讀取 IC 晶片，傳送證件影像的方式已廢止。',
        gassan: '`identityMethods("telecom")` 不顯示拍攝證件與臉部的方式',
      },
      {
        date: '2026-04-16',
        change: '交友網站的年齡確認，新增了使用個人編號卡的方式。',
        gassan: '`identityMethods("matching")` 包含個人編號卡 PIN 碼與電子憑證的方式',
      },
      {
        date: '2027-04-01',
        change: '《犯罪收益移轉防止法》的線上身分驗證，將廢止拍攝證件與臉部的方式。',
        gassan: '`identityMethods("aml")` 從這天起不再顯示拍攝證件與臉部的方式（依日期切換）',
      },
      {
        date: '政令所定日期（2027 年 7 月前）',
        change: '加密資產交換業將改為《金融商品交易法》下的加密資產交易業。',
        gassan: '`crypto` 已具備詢問投資經驗與資產（適合性）的步驟',
      },
      {
        date: '政令所定日期（2028 年 7 月前）',
        change: '依《個人資料保護法》的修正，未滿 16 歲者的個人資料，須向法定代理人取得同意並進行通知。',
        gassan: '接受未滿 16 歲使用者的產業，請加上 `guardianUnder`（見下一節）',
      },
    ],
  },
  customize: {
    title: '增減步驟',
    intro: '`preset` 也可以傳入自己組合的預設組合。展開 `REGISTRATION_PRESETS` 中的產業，再增減步驟、必填與選填，以及年齡規定。步驟的說明文字，則以 `registrationLabels` 的 `presets` 替換。',
    code: `import { REGISTRATION_PRESETS, RegistrationPresetPage, type RegistrationPreset } from '@genelab/gassan';

// 在網購的註冊中加入出生日期，並要求未滿 16 歲者取得法定代理人同意
const shop: RegistrationPreset = {
  ...REGISTRATION_PRESETS.ec,
  guardianUnder: 16,
  steps: [{ id: 'delivery', fields: ['name', 'birthDate', 'address', 'phone', 'marketing'], optional: ['marketing'] }],
};

export function ShopRegistration() {
  return <RegistrationPresetPage preset={shop} onSubmit={(values) => api.register(values)} />;
}`,
  },
  samples: {
    savedExit: '已儲存。隨時都能從郵件中的連結繼續填寫。',
    doneNext: '前往首頁',
  },
  a11yCaption: '各產業的註冊所滿足的規格',
} satisfies typeof ja;
