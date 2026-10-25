import type ja from '../ja/commerce';

export default {
  lead: '購物的最終確認、Cookie 與外部傳送的同意、接收者清單、取消訂閱的流程。日本法令對這些畫面的要求（《特定商業交易法》規定的最終確認畫面，以及《電氣通信事業法》的外部傳送規範），都原樣做成了章節與文字。',
  law: {
    title: '關於法令',
    body: '標示事項是根據 2026 年 10 月當時的條文（e-Gov 法令檢索）整理出的參考，並非法律意見。需要的標示會因販售的商品、服務與傳送的資訊而不同，開始之前請向專業人士確認。',
  },
  orderReview: {
    title: '訂單的最終確認',
    intro: '《特定商業交易法》第 12 條之 6 要求網路訂購的最後一個畫面標示數量、價金、付款的時間與方式、交付的時間、訂購期限，以及撤回訂購與解除契約的規定，並禁止會讓人誤解該操作是否構成訂購、或誤解標示事項的表示。`OrderReviewPage` 把這些內容分別放進帶標題的章節，告知訂單尚未送出，按下「送出訂單」後才會送出。',
    tableCaption: '最終確認畫面的標示事項與 props',
    head: { item: '標示事項', prop: 'props' },
    rows: [
      { item: '數量（第 12 條之 6 第 1 項第 1 款）', prop: '`items` 的 `quantity` 與 `unit`' },
      { item: '銷售價格與運費（第 11 條第 1 款）', prop: '`items` 的 `price`、`shippingFee`、`fees`、`discounts`（總計由元件計算）' },
      { item: '付款的時間與方式（第 11 條第 2 款）', prop: '`payment` 的 `method` 與 `timing`' },
      { item: '交付的時間（第 11 條第 3 款）', prop: '`delivery` 的 `method` 與 `timing`' },
      { item: '訂購期限（第 11 條第 4 款）', prop: '`offerPeriod`（限時販售時）' },
      { item: '撤回訂購與解除契約（第 11 條第 5 款）', prop: '`cancellationPolicy`（不要只放連結，要寫明條件）' },
      { item: '定期購買條件', prop: '`subscription`（每次的金額、配送週期、最低購買次數、取消方式）' },
    ],
  },
  cookieConsent: {
    title: 'Cookie 與外部傳送的同意',
    intro: '《電氣通信事業法》第 27 條之 12（外部傳送規範）要求，在將使用者的資訊傳送到外部之前，須通知傳送的資訊與接收者等事項，或使其處於使用者容易得知的狀態（已取得同意，或可由使用者停止者除外）。`CookieConsent` 會對尚未做出選擇的人顯示橫幅，以同等份量並列「全部允許」與「僅允許必要項目」，並開啟可依類型選擇的視窗。儲存由應用程式在 `onChange` 中進行。',
  },
  externalTransmission: {
    title: '外部傳送的公示',
    intro: '`ExternalTransmissionList` 會依接收者列出傳送的資訊、目的與類型，並附上接收者的隱私權政策與停止傳送頁面的連結。請把它放在橫幅中「接收者清單」連結指向的地方（例如隱私權政策中的某一節）。',
  },
  cancel: {
    title: '取消訂閱的流程',
    intro: '最多 3 個步驟：原因（選用）→ 建議（選用，只出現一次）→ 確認。在任何畫面都能透過「保留方案」離開；在建議的畫面上，「繼續取消」的份量要與建議相同或更重。在確認畫面上，先說明可使用到哪一天、資料如何處理以及如何匯出，再進行取消。',
  },
  setup: {
    title: '放置同意橫幅',
    intro: '把橫幅放在頁面的最後，並將使用者的選擇儲存到 Cookie 或 localStorage。在伺服器端渲染的頁面中，要在渲染之後（`useEffect`）再讀取已儲存的選擇，讀取完成前不渲染橫幅（若先傳入 `null`，已經做出選擇的人也會看到橫幅閃現一下）。可以從頁面底部的「Cookie 設定」，透過 `settingsOpen` 重新開啟視窗。',
    code: `import { useEffect, useState } from 'react';
import { CookieConsent, type CookieConsentValue } from '@genelab/gassan';

const KEY = 'cookie-consent';

type Props = { settingsOpen: boolean; onSettingsOpenChange: (open: boolean) => void };

export function Consent({ settingsOpen, onSettingsOpenChange }: Props) {
  const [value, setValue] = useState<CookieConsentValue | null | undefined>(undefined);
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setValue(saved ? (JSON.parse(saved) as CookieConsentValue) : null);
  }, []);
  if (value === undefined) return null;
  return (
    <CookieConsent
      value={value}
      onChange={(next) => {
        localStorage.setItem(KEY, JSON.stringify(next));
        setValue(next);
        // 只載入已允許類型的標籤
      }}
      settingsOpen={settingsOpen}
      onSettingsOpenChange={onSettingsOpenChange}
      policyHref="/privacy#external"
    />
  );
}`,
  },
  samples: {
    coffee: '咖啡豆 200g',
    coffeeOption: '中度烘焙、原豆',
    bag: '袋',
    dripper: '濾杯',
    coupon: '首購優惠券',
    address: ['佐藤花', '〒100-0001 東京都千代田區千代田 1-1', '090-1234-5678'],
    deliveryMethod: '宅配',
    deliveryTiming: '下單後 2〜4 天送達（可指定日期與時段）',
    paymentMethod: '信用卡（Visa 末四碼 4242）',
    paymentTiming: '送出訂單時',
    offerPeriod: '至 2026 年 11 月 30 日 23:59 為止（此組合的販售期間）',
    cancellationPolicy: '商品送達後 8 天內，未拆封的商品可以退貨。退貨運費由顧客負擔。瑕疵品由本店負擔費用更換。',
    interval: '每月',
    priceNote: '第 2 次起每次 ¥2,160（九折）',
    howToCancel: '最晚請於下次配送的 7 天前，從會員中心的「定期購買」辦理。也接受電話辦理。',
    consent: '我同意服務條款與定期購買條件',
    edit: '返回上一個畫面（範例）',
    shopTitle: '週末咖啡定期送',
    shopText: '每月為你送上剛烘焙好的咖啡豆。在本範例中，畫面底部會出現 Cookie 橫幅。',
    openSettings: 'Cookie 設定',
    consentSaved: '已儲存 Cookie 設定（範例）',
    policyTitle: '傳送給第三方的資訊與接收者',
    policyText: '本網站可能會將使用者的資訊傳送給以下業者。若想停止，可以從各業者的頁面進行。',
    recipientsTitle: '接收者與傳送的資訊',
    transmissions: [
      {
        recipient: 'Google LLC',
        service: 'Google Analytics',
        information: '瀏覽頁面的 URL、來源網頁、裝置與瀏覽器的類型、Cookie 識別碼',
        purpose: '統計頁面的瀏覽次數與使用方式，用來改善網站。',
        category: 'analytics',
        policyHref: 'https://policies.google.com/privacy',
        optOutHref: 'https://tools.google.com/dlpage/gaoptout',
      },
      {
        recipient: 'Meta Platforms, Inc.',
        service: 'Meta Pixel',
        information: '瀏覽頁面的 URL、是否購買、裝置資訊、Cookie 識別碼',
        purpose: '衡量廣告成效，並顯示符合興趣的廣告。',
        category: 'marketing',
        policyHref: 'https://www.facebook.com/privacy/policy/',
      },
      {
        recipient: 'Atlas Inc.',
        service: '保持登入狀態',
        information: '表示登入狀態的識別碼',
        purpose: '用來保持登入。',
        category: 'necessary',
      },
    ],
    plan: 'Pro',
    reasons: { price: '價格太高', unused: '不太常用', missing: '缺少需要的功能', switching: '要改用其他服務', other: '其他' },
    pauseTitle: '只暫停 1 個月',
    pauseDescription: '暫停期間不收取費用，資料也會原樣保留。',
    pauseAction: '暫停 1 個月',
    downgradeTitle: '改為免費方案',
    downgradeDescription: '成員最多 3 人，儲存空間最多 1 GB。資料可以照常使用。',
    downgradeAction: '改為 Free',
    dataNotice: '取消訂閱 30 天後，將刪除工作區的資料。在此之前都可以匯出。',
  },
  a11yCaption: '購買與同意範本的行為',
} satisfies typeof ja;
