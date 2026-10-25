import { useState, type ReactNode } from 'react';

import {
  Button,
  CancelSubscriptionPage,
  CookieConsent,
  DocumentPage,
  ExternalTransmissionList,
  OrderReviewPage,
  PageHeader,
  SiteLayout,
  toast,
  type CookieConsentValue,
} from '@genelab/gassan';

import { useT } from '../i18n';
import { AtlasApp } from './AppPreviews';
import { go, preview, wait } from './shared';

const REASONS = ['price', 'unused', 'missing', 'switching', 'other'] as const;

/** 注文の最終確認（P-32）。合計（￥4,180）は「購入の後」の見本と同じで、確定するとそこへ進む。 */
function OrderReviewSample(): ReactNode {
  const a = useT().commerce.samples;
  return (
    <SiteLayout>
      <OrderReviewPage
        items={[
          { name: a.coffee, options: a.coffeeOption, quantity: 1, unit: a.bag, price: 2400 },
          { name: a.dripper, quantity: 1, price: 1800 },
        ]}
        shippingFee={480}
        discounts={[{ label: a.coupon, amount: 500 }]}
        shippingAddress={a.address}
        delivery={{ method: a.deliveryMethod, timing: a.deliveryTiming }}
        payment={{ method: a.paymentMethod, timing: a.paymentTiming }}
        offerPeriod={a.offerPeriod}
        cancellationPolicy={a.cancellationPolicy}
        subscription={{ interval: a.interval, pricePerDelivery: 2400, priceNote: a.priceNote, howToCancel: a.howToCancel }}
        consent={a.consent}
        onEdit={() => toast(a.edit)}
        onSubmit={async () => {
          await wait(900);
          go('guest-account');
        }}
      />
    </SiteLayout>
  );
}

/** Cookie の同意（P-33）。選ぶまで帯を出し、選んだ後は「Cookie の設定」から窓を開き直せる。 */
function CookieConsentSample(): ReactNode {
  const a = useT().commerce.samples;
  const [value, setValue] = useState<CookieConsentValue | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <SiteLayout>
      <div className="s-preview-hero">
        <PageHeader title={a.shopTitle} description={a.shopText} />
        <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
          {a.openSettings}
        </Button>
      </div>
      <CookieConsent
        value={value}
        onChange={(next) => {
          setValue(next);
          toast(a.consentSaved);
        }}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
        policyHref={preview('external-transmission')}
      />
    </SiteLayout>
  );
}

/** 外部送信の公表（P-34）。プライバシーポリシーの中の節として置く。 */
function ExternalTransmissionSample(): ReactNode {
  const a = useT().commerce.samples;
  return (
    <DocumentPage
      title={a.policyTitle}
      updated="2026-10-01"
      intro={<p>{a.policyText}</p>}
      sections={[{ id: 'recipients', title: a.recipientsTitle, content: <ExternalTransmissionList items={a.transmissions} /> }]}
    />
  );
}

/** 解約の手続き（P-35）。請求のページ（P-15）と同じ Pro のプランを、アプリの中で解約する。 */
function CancelSample(): ReactNode {
  const a = useT().commerce.samples;
  return (
    <AtlasApp page="app-billing">
      <CancelSubscriptionPage
        plan={{ name: a.plan, periodEnd: '2026-11-01' }}
        reasons={REASONS.map((value) => ({ value, label: a.reasons[value] }))}
        offers={[
          { id: 'pause', title: a.pauseTitle, description: a.pauseDescription, action: a.pauseAction },
          { id: 'downgrade', title: a.downgradeTitle, description: a.downgradeDescription, action: a.downgradeAction },
        ]}
        dataNotice={a.dataNotice}
        exportHref={preview('app-settings')}
        onCancel={() => wait(900)}
        onAcceptOffer={() => wait(700)}
        onKeep={() => go('app-billing')}
      />
    </AtlasApp>
  );
}

/** 購入と同意の見本（#/preview/<name>）。名前の一覧は TemplatePreview の PREVIEWS にある。 */
export function CommercePreview({ name }: { name: string }): ReactNode {
  switch (name) {
    case 'order-review':
      return <OrderReviewSample />;
    case 'cookie-consent':
      return <CookieConsentSample />;
    case 'external-transmission':
      return <ExternalTransmissionSample />;
    case 'cancel-subscription':
      return <CancelSample />;
    default:
      return null;
  }
}
