import type ja from '../ja/commerce';

export default {
  lead: '购物的最终确认、Cookie 与外部发送的同意、接收方列表、取消订阅的流程。日本法律法规对这些画面的要求（《特定商业交易法》规定的最终确认画面，以及《电气通信事业法》的外部发送规则），都原样做成了章节和文字。',
  law: {
    title: '关于法律法规',
    body: '标示事项是根据截至 2026 年 10 月的条文（e-Gov 法令检索）整理出的参考，并非法律意见。需要的标示因销售的商品、服务以及发送的信息而异，开始之前请向专家确认。',
  },
  orderReview: {
    title: '订单的最终确认',
    intro: '《特定商业交易法》第 12 条之 6 要求网上订购的最后一个画面标示数量、价款、付款的时间与方式、交付的时间、订购期限，以及撤回订购与解除合同的规定，并禁止会让人误解该操作是否构成订购、或误解标示事项的表示。`OrderReviewPage` 把这些内容分别放进带标题的章节，告知订单尚未提交，按下“提交订单”后才会提交。',
    tableCaption: '最终确认画面的标示事项与 props',
    head: { item: '标示事项', prop: 'props' },
    rows: [
      { item: '数量（第 12 条之 6 第 1 款第 1 项）', prop: '`items` 的 `quantity` 与 `unit`' },
      { item: '销售价格与运费（第 11 条第 1 项）', prop: '`items` 的 `price`、`shippingFee`、`fees`、`discounts`（合计由部件计算）' },
      { item: '付款的时间与方式（第 11 条第 2 项）', prop: '`payment` 的 `method` 与 `timing`' },
      { item: '交付的时间（第 11 条第 3 项）', prop: '`delivery` 的 `method` 与 `timing`' },
      { item: '订购期限（第 11 条第 4 项）', prop: '`offerPeriod`（限时销售时）' },
      { item: '撤回订购与解除合同（第 11 条第 5 项）', prop: '`cancellationPolicy`（不要只放链接，要写明条件）' },
      { item: '定期购买条件', prop: '`subscription`（每次的金额、配送周期、最低购买次数、取消方式）' },
    ],
  },
  cookieConsent: {
    title: 'Cookie 与外部发送的同意',
    intro: '《电气通信事业法》第 27 条之 12（外部发送规则）要求，在把用户的信息发送到外部之前，告知所发送的信息和接收方等，或使其处于用户容易知晓的状态（已取得同意的、或可以由用户停止的除外）。`CookieConsent` 向尚未做出选择的人显示横幅，以同等分量并列“全部允许”和“仅允许必要项”，并打开可以按类型选择的窗口。保存由应用在 `onChange` 中进行。',
  },
  externalTransmission: {
    title: '外部发送的公示',
    intro: '`ExternalTransmissionList` 按接收方列出发送的信息、目的和类型，并附上接收方的隐私政策和停止发送页面的链接。把它放在横幅中“接收方列表”链接指向的地方（如隐私政策中的某一节）。',
  },
  cancel: {
    title: '取消订阅的流程',
    intro: '最多 3 步：原因（可选）→ 建议（可选，仅出现一次）→ 确认。在任何画面都可以通过“保留套餐”退出；在建议的画面上，“继续取消”的分量要与建议相同或更重。在确认画面上，先说明可以使用到哪一天、数据如何处理以及如何导出，再进行取消。',
  },
  setup: {
    title: '放置同意横幅',
    intro: '把横幅放在页面的最后，并把用户的选择保存到 Cookie 或 localStorage。在服务端渲染的页面中，要在渲染之后（`useEffect`）再读取已保存的选择，读取完成之前不渲染横幅（如果先传入 `null`，已经做出选择的人也会看到横幅闪现一下）。可以从页面底部的“Cookie 设置”，用 `settingsOpen` 重新打开窗口。',
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
        // 只加载已允许类型的标签
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
    coffeeOption: '中度烘焙、整豆',
    bag: '袋',
    dripper: '滤杯',
    coupon: '首单优惠券',
    address: ['佐藤花', '〒100-0001 东京都千代田区千代田 1-1', '090-1234-5678'],
    deliveryMethod: '快递',
    deliveryTiming: '下单后 2〜4 天送达（可指定日期和时间）',
    paymentMethod: '信用卡（Visa 尾号 4242）',
    paymentTiming: '提交订单时',
    offerPeriod: '截至 2026 年 11 月 30 日 23:59（此组合的销售期间）',
    cancellationPolicy: '商品送达后 8 天内，未拆封的商品可以退货。退货运费由顾客承担。如有质量问题，由本店承担费用予以更换。',
    interval: '每月',
    priceNote: '从第 2 次起每次 ¥2,160（九折）',
    howToCancel: '最晚在下次配送的 7 天前，通过个人中心的“定期购买”办理。也可以通过电话办理。',
    consent: '我同意服务条款和定期购买条件',
    edit: '返回上一个画面（示例）',
    shopTitle: '周末咖啡定期送',
    shopText: '每月为你送上新鲜烘焙的咖啡豆。在本示例中，画面底部会出现 Cookie 横幅。',
    openSettings: 'Cookie 设置',
    consentSaved: '已保存 Cookie 设置（示例）',
    policyTitle: '发送给第三方的信息与接收方',
    policyText: '本网站可能会把用户的信息发送给以下企业。如需停止，可以在各企业的页面上操作。',
    recipientsTitle: '接收方与发送的信息',
    transmissions: [
      {
        recipient: 'Google LLC',
        service: 'Google Analytics',
        information: '浏览页面的 URL、来源页面、设备与浏览器的类型、Cookie 标识符',
        purpose: '统计页面的浏览次数和使用方式，用于改进网站。',
        category: 'analytics',
        policyHref: 'https://policies.google.com/privacy',
        optOutHref: 'https://tools.google.com/dlpage/gaoptout',
      },
      {
        recipient: 'Meta Platforms, Inc.',
        service: 'Meta Pixel',
        information: '浏览页面的 URL、是否购买、设备信息、Cookie 标识符',
        purpose: '衡量广告效果，并投放符合兴趣的广告。',
        category: 'marketing',
        policyHref: 'https://www.facebook.com/privacy/policy/',
      },
      {
        recipient: 'Atlas Inc.',
        service: '保持登录状态',
        information: '表示登录状态的标识符',
        purpose: '用于保持登录。',
        category: 'necessary',
      },
    ],
    plan: 'Pro',
    reasons: { price: '价格太高', unused: '不怎么使用', missing: '缺少需要的功能', switching: '要换用其他服务', other: '其他' },
    pauseTitle: '只暂停 1 个月',
    pauseDescription: '暂停期间不收取费用，数据也会原样保留。',
    pauseAction: '暂停 1 个月',
    downgradeTitle: '改为免费套餐',
    downgradeDescription: '成员最多 3 人，存储空间最多 1 GB。数据可以照常使用。',
    downgradeAction: '改为 Free',
    dataNotice: '取消订阅 30 天后，将删除工作区的数据。在此之前可以导出。',
  },
  a11yCaption: '购买与同意模板的行为',
} satisfies typeof ja;
