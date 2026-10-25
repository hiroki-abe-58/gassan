import type ja from '../ja/japaneseInput';

export default {
  lead: '在輸入元件這一端，消除人們在日本的表單上半途放棄的原因。全形與半形、有無連字號、平假名與片假名，不讓輸入的人修改，而是由接收的一方統一（不說「請以全形輸入」）。像依郵遞區號得出地址、依輸入姓名時的讀音得出振假名（姓名的假名讀音）這類能推斷出的內容，會預先填好；使用者輸入的值與瀏覽器自動填入的值則不會被覆寫。',
  principles: {
    title: '不讓人放棄的約定',
    rows: [
      '**不把能統一的差異當成錯誤。** 全形與半形、連字號的種類、平假名與片假名、電話號碼的寫法，都由接收的一方修正。',
      '**能推斷的內容預先填好。** 但不覆寫使用者與瀏覽器自動填入的值。',
      '**不擅自移動焦點。** 只有像按下建議按鈕時那樣、由使用者做出選擇時才移動。',
      '**讓瀏覽器的自動填入生效。** 為欄位加上 `autocomplete` 的名稱，都道府縣與出生日期使用原生 select。',
      '**改不改由使用者決定。** 電子郵件地址的拼寫錯誤只提供建議，不會擅自修改。讀音是推測出來的，所以振假名隨時都能修改。',
    ],
  },
  normalize: {
    title: '統一輸入的文字',
    intro: '把 `normalize` 傳給 `Input`，每次輸入時都會統一文字。輸入法組字期間不處理，在確認、貼上、自動填入時統一，並保持游標位置。`onChange` 會收到統一後的值。每個函式套用在輸入到一半的字串上也不會出錯。',
    exampleTitle: '6 個欄位',
    exampleDescription: '試著混合輸入全形數字、各種連字號與平假名。下方會顯示應用程式收到的值。',
  },
  address: {
    title: '地址（依郵遞區號自動填入）',
    intro: '以瀏覽器自動填入能辨識的名稱，排列郵遞區號、都道府縣、市區町村、町名門牌號、建築名稱。郵遞區號湊齊 7 位後，以 `lookup` 查詢地址，只填入空白的欄位。結果顯示在欄位下方並朗讀出來，焦點不會移動。函式庫本身不持有地址資料，也不會傳送到任何地方。',
    exampleTitle: '收件地址',
    exampleDescription: '輸入郵遞區號，0.4 秒後會填入地址（範例資料）。在「町名・門牌號」補上門牌號後再修改郵遞區號，只會替換町名的部分。',
  },
  name: {
    title: '姓名與振假名',
    intro: '分開詢問姓與名（自動填入可以生效），並依以輸入法輸入姓名時轉換前的假名，填入振假名。使用者自行修改振假名後，就不再更動。要以平假名詢問振假名時傳入 `kana="hiragana"`，不詢問時傳入 `kana={false}`。',
    exampleTitle: '姓名',
    exampleDescription: '開啟日文輸入法，試著輸入姓與名並轉換。',
  },
  birthDate: {
    title: '出生日期',
    intro: '年、月、日 3 個原生 select（自動填入與手機的選擇器都能生效）。不讓人在日曆上往回翻好幾十年。年份附上日本年號（和曆），選齊後顯示足歲年齡。年齡條件以 `ageOn` 判斷。',
    exampleTitle: '須年滿 20 歲',
    exampleDescription: '選擇未滿 20 歲的日期會出現錯誤。選擇 2 月時，無法選擇 29 日之後的日期。',
  },
  email: {
    title: '電子郵件地址',
    intro: '修正全形字元，以及開著輸入法輸入的「。」「ー」；離開欄位時，針對常用網域的拼寫錯誤提供建議。對電信業者的信箱，會提醒確認信可能因垃圾郵件設定而收不到。',
    exampleTitle: '寄送確認信的欄位',
    exampleDescription: '試著輸入「taro@gmial.com」後離開欄位。',
  },
  bank: {
    title: '收款帳戶',
    intro: '金融機構與分行是可用假名或代碼搜尋的選項清單。戶名即使以平假名或半形片假名輸入，也會統一為全形片假名，傳送時以 `toZenginKana` 轉成全銀（日本的銀行轉帳）格式。日本郵政銀行則依存摺上的記號與號碼，產生轉帳用的分行名稱與帳號。',
    exampleTitle: '營收的收款帳戶',
    exampleDescription: '試著在金融機構輸入「みつびし」或「0005」。也可以選擇日本郵政銀行（「ゆうちょ銀行」）。',
  },
  recipes: {
    title: '各欄位該用什麼',
    intro: '沒有成組元件的欄位，也能以 `Input` 的 `normalize` 與判別函式同樣處理。',
    tableCaption: '各欄位的元件與統一方式',
    head: { field: '欄位', use: '使用的元件', value: '收到的值' },
    rows: [
      { field: '只有郵遞區號（估算運費等）', use: '`Input` + `normalize={formatPostalCode}`', value: '`123-4567`' },
      { field: '地址', use: '`AddressFields`（傳入 `lookup`）', value: '`{ postalCode, prefecture, city, line1, line2 }`' },
      { field: '電話號碼', use: '`Input type="tel"` + `normalize={normalizePhone}`', value: '`09012345678`（只有數字）' },
      { field: '發送簡訊的號碼', use: '同上 + 以 `isMobilePhone` 確認', value: '060、070、080、090 開頭的 11 位數' },
      { field: '電子郵件地址', use: '`EmailInput`', value: '`taro@gmail.com`' },
      { field: '姓名與振假名', use: '`NameFields`', value: '`{ familyName, givenName, familyNameKana, givenNameKana }`' },
      { field: '出生日期', use: '`BirthDateInput` + `ageOn`', value: '`1990-04-01`' },
      { field: '公司名稱、商號', use: '`Input` + `normalize={normalizeText}`', value: '英數字為半形，假名為全形' },
      { field: '法人編號', use: '`Input` + `normalize={digitsOf}` + `isCorporateNumber`', value: '13 位數字（連檢查碼也會確認）' },
      { field: '合格發票的登記號碼', use: '`Input` + `normalize={normalizeInvoiceNumber}` + `isInvoiceNumber`', value: '`T` 加 13 位數字' },
      { field: '個人編號（My Number）', use: '`Input` + `normalize={digitsOf}` + `isMyNumber`', value: '12 位數（蒐集目的與保管方式須遵循《番號法》）' },
      { field: '收款帳戶', use: '`BankAccountFields`（傳送時用 `toZenginKana`）', value: '金融機構、分行、存款種類、帳號、戶名' },
      { field: '傳送到要求全形之系統的欄位', use: '`Input` + `normalize={toFullWidth}`', value: '全形字元' },
    ],
  },
  functions: {
    title: '正規化函式與判別函式',
    intro: '都是純函式，伺服器端的驗證也能使用相同的函式。判別函式不論寫法（全形、連字號、空白、〒）為何，只拒絕混有英文字母或假名的值。',
    tableCaption: '函式、範例與結果',
    head: { name: '函式', input: '範例', output: '結果' },
  },
  lookup: {
    title: '串接地址查詢',
    intro: '`lookup` 接收 7 位數字，回傳候選（都道府縣、市區町村、町域）的陣列。也可以回傳 Promise。最可靠的做法是把日本郵政的郵遞區號資料放在自己的伺服器上查詢。若使用外部 API，請確認其使用條款，以及是否可以把郵遞區號傳送到外部。針對已經改掉的郵遞區號傳回的結果，元件會直接捨棄。',
    code: `import { AddressFields, type PostalAddress } from '@genelab/gassan';

// 從放在自己伺服器上的日本郵政郵遞區號資料查詢
async function lookup(postalCode: string): Promise<PostalAddress[]> {
  const response = await fetch(\`/api/postal-codes/\${postalCode}\`);
  if (!response.ok) return [];
  return response.json(); // [{ prefecture: '東京都', city: '千代田区', town: '千代田' }]
}

export function ShippingAddress() {
  return <AddressFields label="收件地址" required lookup={lookup} autoCompleteSection="shipping" />;
}`,
  },
  a11yCaption: '日本表單輸入的行為',
} satisfies typeof ja;
