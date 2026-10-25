import type ja from '../ja/registrationPresets';

export default {
  lead: '金融、网购、医疗、交友配对等行业，由法律法规规定了要询问的内容。这里提供这些行业的正式注册：入口只问邮箱地址，交易之前需要询问的项目，按行业整理成相应的步骤和顺序。每个步骤都用依据的法律法规说明为什么要问，未成年人的监护人同意、年龄下限和身份验证的方式，也按行业组合。',
  law: {
    title: '关于法律法规',
    body: '这些步骤与依据，是根据截至 2026 年 10 月 26 日的条文（e-Gov 法令检索）和政府机关的资料整理出的参考，并非法律意见。需要询问的内容因登记或备案的类型而异，修订也很频繁。开始提供服务之前，请向专家确认适用于本公司的法律法规及最新修订。出处见下表中的链接。',
  },
  presets: {
    title: '选择行业',
    intro: '给 `preset` 传入行业，就会用该行业的步骤和输入项组成正式注册。此表由 `REGISTRATION_PRESETS` 生成，因此与库中的内容一致。',
    tableCaption: '各行业正式注册的步骤与依据',
    head: { preset: '行业', steps: '正式注册的步骤', age: '年龄', laws: '依据' },
    minAge: (age: number) => `${String(age)} 岁以上`,
    guardianUnder: (age: number) => `未满 ${String(age)} 岁需监护人同意`,
    noAge: '无规定',
  },
  sample: {
    title: '示例',
    intro: '选择行业后，可以逐步走完正式注册的流程。按下“下一步”时，需要修改的地方会显示在输入项下方，每前进一步都会保存。邮政编码输入 100-0001 等会填入地址，法人编号输入 7000012050002 会填入公司名称（示例数据）。身份验证只是示例，选择方式后按下按钮即视为已验证。',
  },
  flow: {
    title: '从入口到正式注册',
    intro: '入口的 `QuickSignUpPage` 只询问邮箱地址，提交后即完成临时注册。从条文的写法来看，确认身份的义务针对的是签约或交易的时间点，因此可以理解为不必在入口就要求身份验证（但没有找到明确这样说的官方资料）。从邮件中的链接打开 `RegistrationPresetPage`，每个步骤都用 `onSave` 保存，这样即使中途离开，也能从中断处继续。',
    code: `import { QuickSignUpPage, RegistrationPresetPage } from '@genelab/gassan';

// 1. 入口：只问邮箱地址。提交后即完成临时注册，并通过邮件发送正式注册的链接
export function Entry() {
  return (
    <QuickSignUpPage
      onSubmit={({ email }) => api.preRegister(email)}
      expiresIn="24 小时"
      steps={['打开邮件中的链接', '填写个人信息', '身份验证']}
    />
  );
}

// 2. 从邮件中的链接进入：按行业的正式注册
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
    title: '何时询问',
    intro: '入口问得越少，人越不容易流失。把询问推迟到法律法规要求的时间点，询问时在步骤的说明中写明理由。',
    tableCaption: '询问的时间点与项目',
    head: { stage: '时间点', items: '询问的内容', how: '部件' },
    rows: [
      {
        stage: '入口（临时注册）',
        items: '只有邮箱地址和对条款的同意。个人信息的利用目的在提交前告知（《个人信息保护法》第 21 条第 2 款）。广告邮件的同意另设为选填的复选框，初始不勾选（《特定电子邮件法》第 3 条）。',
        how: '`QuickSignUpPage`',
      },
      {
        stage: '正式注册（交易之前）',
        items: '姓名、地址、出生日期，以及各行业特有的项目。金融类则包括职业、交易目的、外国 PEPs、税收居民国、不属于反社会势力的声明，以及身份验证。',
        how: '`RegistrationPresetPage`',
      },
      {
        stage: '即将进行该交易之前',
        items: '是否为上市公司的高管（首次买卖上市股票之前）、网购的收货地址（首次下单之前）、收购时的身份验证（收购之前）。',
        how: '拆分步骤，或设为 `optional` 稍后再问',
      },
      {
        stage: '不询问的项目',
        items: '法律法规未要求的项目不设为必填。如果要询问工作单位或电话号码，请附上理由。招聘时不询问本籍、家庭、宗教等（厚生劳动省关于公正录用选拔的观点）。',
        how: '`optional`',
      },
    ],
  },
  fields: {
    title: '输入项部件',
    intro: '正式注册的步骤，由把法律法规要求的项目做成的部件组合而成。也可以只把部件放到自己的画面中。文字可以通过 `SiteProvider` 的 `registrationLabels` 替换（默认提供日语和英语）。',
    work: {
      title: '职业与交易目的',
      intro: '这是《犯罪收益转移防止法》规定的交易时确认中要询问的项目。不采用自由填写，而是以金融厅的分类作为选项。交易目的可以多选，选项组随业态而变。',
      exampleTitle: '职业与交易目的',
      exampleDescription: '切换业态后，交易目的的选项会随之改变。值以键的形式接收。',
    },
    declarations: {
      title: '申报与声明',
      intro: '外国 PEPs、税收居民国（CRS、CARF）、美国纳税义务（FATCA）都是二选一：把问题作为这组输入项的名称，把适用人群的范围放在说明中。只对适用的人显示追加的输入项。排除反社会势力的声明，其范围说明可以展开和收起。',
      exampleTitle: '申报与声明',
      exampleDescription: '选择“除日本外还有其他国家”和“有”后，会出现国家与纳税人识别号的输入项，以及美国纳税人识别号与同意的输入项。',
    },
    numbers: {
      title: '个人编号与法人编号',
      intro: '个人编号统一为纯数字，并关闭自动填充和拼写检查。在确认画面中只显示后 4 位。法人编号在凑齐连校验位都正确的 13 位后，查询并补全公司名称（不覆盖用户输入的公司名称）。',
      exampleTitle: '个人编号与法人编号',
      exampleDescription: '即使输入“１２３４-５６７８ ９０１８”这样的写法，也会变成纯数字。在法人编号中输入 7000012050002，会填入公司名称。',
    },
    identity: {
      title: '身份验证方式',
      intro: '可用的方式由依据的法律法规决定，并会随修订而变化。方式以名称而非条款编号来表示；传入日期后，不会显示在该日期已不能使用的方式。身份验证本身（读取 IC 芯片或拍摄）由使用方的身份验证服务完成。',
      exampleTitle: '身份验证方式',
      exampleDescription: '选择“银行、证券等”和“2027 年 4 月 1 日起”后，“证件与人脸拍摄”就会消失（《犯罪收益转移防止法》的修订）。',
    },
    guardian: {
      title: '监护人同意与广告邮件的同意',
      intro: '未成年人签订的合同，如果没有监护人的同意，可以撤销。根据出生日期判断为未成年人时，询问监护人的姓名、与本人的关系、邮箱地址，并征得同意。广告邮件的同意，设为与同意条款分开的选填复选框。',
      exampleTitle: '监护人同意与广告邮件的同意',
      exampleDescription: '监护人的输入项中，不会被自动填入本人的姓名或邮箱地址。',
    },
  },
  amendments: {
    title: '修订计划',
    intro: '身份验证和个人信息的规定，这几年接连变化。按日期切换的规定，由部件根据日期自动切换。',
    tableCaption: '施行日期与 gassan 的应对',
    head: { date: '施行日期', change: '变化内容', gassan: 'gassan' },
    rows: [
      {
        date: '2026-01-01',
        change: '加密资产交易需要申报税收居民国（CARF。《租税条约等实施特例法》第 10 条之 9）。已有用户需在 2026 年底之前申报。',
        gassan: '在 `crypto` 的确认事项中加入了税收居民国',
      },
      {
        date: '2026-04-01',
        change: '手机签约的在线身份验证原则上改为读取 IC 芯片，发送证件图像的方式已被废止。',
        gassan: '`identityMethods("telecom")` 不显示证件与人脸拍摄',
      },
      {
        date: '2026-04-16',
        change: '交友网站的年龄确认新增了使用个人编号卡的方式。',
        gassan: '`identityMethods("matching")` 中有个人编号卡密码和电子证书的方式',
      },
      {
        date: '2027-04-01',
        change: '《犯罪收益转移防止法》的在线身份验证将废止证件与人脸拍摄的方式。',
        gassan: '`identityMethods("aml")` 从这一天起不显示证件与人脸拍摄（按日期切换）',
      },
      {
        date: '政令规定之日（2027 年 7 月之前）',
        change: '加密资产交换业将改为《金融商品交易法》下的加密资产交易业。',
        gassan: '`crypto` 带有询问投资经验与资产（适合性）的步骤',
      },
      {
        date: '政令规定之日（2028 年 7 月之前）',
        change: '根据《个人信息保护法》的修订，未满 16 岁者的个人信息，同意的征得与通知都须面向其法定代理人进行。',
        gassan: '接受未满 16 岁用户的行业，请加上 `guardianUnder`（见下一节）',
      },
    ],
  },
  customize: {
    title: '增减步骤',
    intro: '`preset` 也可以传入自己组合的预设。展开 `REGISTRATION_PRESETS` 中的某个行业，再增减步骤、必填与选填、年龄的规定。步骤说明的文字，通过 `registrationLabels` 的 `presets` 替换。',
    code: `import { REGISTRATION_PRESETS, RegistrationPresetPage, type RegistrationPreset } from '@genelab/gassan';

// 给网购加上出生日期，并要求未满 16 岁者取得监护人同意
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
    savedExit: '已保存。可以随时通过邮件中的链接继续填写。',
    doneNext: '前往首页',
  },
  a11yCaption: '按行业注册所满足的规范',
} satisfies typeof ja;
