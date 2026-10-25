import type ja from '../ja/japaneseInput';

export default {
  lead: '在输入部件这一侧，消除人们在日本的表单上半途放弃的原因。全角与半角、有无连字符、平假名与片假名，不让输入的人去改，而是由接收的一方统一（不说“请用全角输入”）。像根据邮政编码得出地址、根据输入姓名时的读音得出振假名（姓名的假名读音）这样能推断出的内容，会预先填好；用户输入的值和浏览器自动填充的值则不会被覆盖。',
  principles: {
    title: '不让人放弃的约定',
    rows: [
      '**不把能统一的差异当成错误。** 全角与半角、连字符的种类、平假名与片假名、电话号码的写法，都由接收的一方修正。',
      '**能推断的内容预先填好。** 但不覆盖用户和浏览器自动填充填入的值。',
      '**不擅自移动焦点。** 只在像按下候选按钮时那样、由用户做出选择时才移动。',
      '**让浏览器的自动填充生效。** 给输入框加上 `autocomplete` 的名称，都道府县和出生日期使用原生 select。',
      '**改不改由用户决定。** 邮箱地址的拼写错误只给出候选，不会擅自修改。读音是推测出来的，所以振假名随时可以修改。',
    ],
  },
  normalize: {
    title: '统一输入的文字',
    intro: '给 `Input` 传入 `normalize`，每次输入时都会统一文字。输入法组字期间不做处理，在确认、粘贴、自动填充时统一，并保持光标位置。`onChange` 接收统一后的值。所有函数用在输入到一半的字符串上也不会出错。',
    exampleTitle: '6 个输入框',
    exampleDescription: '试着混合输入全角数字、各种连字符和平假名。下方会显示应用接收到的值。',
  },
  address: {
    title: '地址（根据邮政编码自动填写）',
    intro: '以浏览器自动填充能识别的名称，排列邮政编码、都道府县、市区町村、町名门牌号、建筑名。邮政编码凑齐 7 位后，用 `lookup` 查询地址，只填写空着的输入框。结果显示在输入框下方，并通过读屏播报，焦点不会移动。库本身不持有地址数据，也不会发送到任何地方。',
    exampleTitle: '收货地址',
    exampleDescription: '输入邮政编码，0.4 秒后会填入地址（示例数据）。在“町名・门牌号”中补上门牌号后再修改邮政编码，只会替换町名部分。',
  },
  name: {
    title: '姓名与振假名',
    intro: '分开询问姓和名（自动填充可以生效），并根据用输入法输入姓名时转换前的假名填写振假名。用户自己改过振假名后，就不再改动。要用平假名询问振假名，传入 `kana="hiragana"`；不询问时传入 `kana={false}`。',
    exampleTitle: '姓名',
    exampleDescription: '打开日语输入法，试着输入姓和名并转换。',
  },
  birthDate: {
    title: '出生日期',
    intro: '年、月、日 3 个原生 select（自动填充和手机的选择器都能生效）。不让人在日历上往回翻几十年。年份旁附上日本年号（和历），选齐后显示周岁。年龄条件用 `ageOn` 判断。',
    exampleTitle: '须年满 20 周岁',
    exampleDescription: '选择未满 20 周岁的日期会出错。选择 2 月时，29 日之后的日期无法选择。',
  },
  email: {
    title: '邮箱地址',
    intro: '修正全角字符，以及开着输入法输入的「。」「ー」；离开输入框时，对常用域名的拼写错误给出候选。对手机运营商的邮箱，提示确认邮件可能因垃圾邮件设置而收不到。',
    exampleTitle: '用于发送确认邮件的输入框',
    exampleDescription: '试着输入“taro@gmial.com”后离开输入框。',
  },
  bank: {
    title: '收款账户',
    intro: '金融机构和支行是可以用假名或代码搜索的候选列表。户名即使用平假名或半角片假名输入，也会统一为全角片假名，发送时用 `toZenginKana` 转换为全银（日本银行间转账）格式。对于日本邮政银行，会根据存折上的记号和号码，生成转账用的支行名和账号。',
    exampleTitle: '销售款的收款账户',
    exampleDescription: '试着在金融机构中输入「みつびし」或“0005”。也可以选择日本邮政银行（「ゆうちょ銀行」）。',
  },
  recipes: {
    title: '各输入项用什么',
    intro: '没有成组部件的输入项，也可以用 `Input` 的 `normalize` 和判别函数同样处理。',
    tableCaption: '各输入项的部件与统一方式',
    head: { field: '输入项', use: '使用的部件', value: '接收的值' },
    rows: [
      { field: '只有邮政编码（估算运费等）', use: '`Input` + `normalize={formatPostalCode}`', value: '`123-4567`' },
      { field: '地址', use: '`AddressFields`（传入 `lookup`）', value: '`{ postalCode, prefecture, city, line1, line2 }`' },
      { field: '电话号码', use: '`Input type="tel"` + `normalize={normalizePhone}`', value: '`09012345678`（仅数字）' },
      { field: '发送短信的号码', use: '同上 + 用 `isMobilePhone` 判断', value: '以 060、070、080、090 开头的 11 位数字' },
      { field: '邮箱地址', use: '`EmailInput`', value: '`taro@gmail.com`' },
      { field: '姓名与振假名', use: '`NameFields`', value: '`{ familyName, givenName, familyNameKana, givenNameKana }`' },
      { field: '出生日期', use: '`BirthDateInput` + `ageOn`', value: '`1990-04-01`' },
      { field: '公司名称、商号', use: '`Input` + `normalize={normalizeText}`', value: '英文字母和数字为半角，假名为全角' },
      { field: '法人编号', use: '`Input` + `normalize={digitsOf}` + `isCorporateNumber`', value: '13 位数字（连校验位也会检查）' },
      { field: '合格发票的登记号码', use: '`Input` + `normalize={normalizeInvoiceNumber}` + `isInvoiceNumber`', value: '`T` 加 13 位数字' },
      { field: '个人编号（My Number）', use: '`Input` + `normalize={digitsOf}` + `isMyNumber`', value: '12 位（收集目的和保管方式须遵守《番号法》）' },
      { field: '收款账户', use: '`BankAccountFields`（发送时用 `toZenginKana`）', value: '金融机构、支行、存款类型、账号、户名' },
      { field: '发送到要求全角的系统的输入项', use: '`Input` + `normalize={toFullWidth}`', value: '全角字符' },
    ],
  },
  functions: {
    title: '规范化函数与判别函数',
    intro: '都是纯函数，服务器端的校验也可以使用同样的函数。判别函数不论写法（全角、连字符、空格、〒）如何，只拒绝混有英文字母或假名的值。',
    tableCaption: '函数、示例与结果',
    head: { name: '函数', input: '示例', output: '结果' },
  },
  lookup: {
    title: '接入地址查询',
    intro: '`lookup` 接收 7 位数字，返回候选（都道府县、市区町村、町域）的数组。也可以返回 Promise。最可靠的做法是把日本邮政的邮政编码数据放在自己的服务器上查询。如果使用外部 API，请确认其使用条款，以及能否把邮政编码发送到外部。对于已经改掉的邮政编码，返回的结果会被部件丢弃。',
    code: `import { AddressFields, type PostalAddress } from '@genelab/gassan';

// 从放在自己服务器上的日本邮政邮政编码数据中查询
async function lookup(postalCode: string): Promise<PostalAddress[]> {
  const response = await fetch(\`/api/postal-codes/\${postalCode}\`);
  if (!response.ok) return [];
  return response.json(); // [{ prefecture: '東京都', city: '千代田区', town: '千代田' }]
}

export function ShippingAddress() {
  return <AddressFields label="收货地址" required lookup={lookup} autoCompleteSection="shipping" />;
}`,
  },
  a11yCaption: '日本表单输入的行为',
} satisfies typeof ja;
