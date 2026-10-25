import type ja from '../ja/commerce';

export default {
  lead: 'The final review of an order, consent for cookies and data sent to third parties, the list of recipients, and cancelling a subscription. What Japanese law asks of these screens (the final confirmation screen under the Act on Specified Commercial Transactions, and the external transmission rules of the Telecommunications Business Act) is built in as sections and wording.',
  law: {
    title: 'About the law',
    body: 'The required items follow the statutes as of October 2026 (e-Gov law search) as a guide, not legal advice. What you must show depends on what you sell and what data you send, so check with a professional before you start.',
  },
  orderReview: {
    title: 'Final order review',
    intro: 'Article 12-6 of the Act on Specified Commercial Transactions requires the last screen of an online order to show the quantity, price, payment timing and method, delivery timing, offer period, and how to withdraw or cancel, and prohibits displays that mislead about whether submitting places an order. `OrderReviewPage` puts each of these in its own headed section, says the order is not placed yet, and places it with “Place order”.',
    tableCaption: 'Required items on the final confirmation screen and their props',
    head: { item: 'Required item', prop: 'props' },
    rows: [
      { item: 'Quantity (Art. 12-6(1)(i))', prop: '`quantity` and `unit` of `items`' },
      { item: 'Price and shipping (Art. 11(i))', prop: '`price` of `items`, `shippingFee`, `fees`, `discounts` (the component computes the total)' },
      { item: 'Payment timing and method (Art. 11(ii))', prop: '`method` and `timing` of `payment`' },
      { item: 'Delivery timing (Art. 11(iii))', prop: '`method` and `timing` of `delivery`' },
      { item: 'Offer period (Art. 11(iv))', prop: '`offerPeriod` (for time-limited sales)' },
      { item: 'Withdrawal and cancellation (Art. 11(v))', prop: '`cancellationPolicy` (write out the conditions, not just a link)' },
      { item: 'Subscription terms', prop: '`subscription` (price per delivery, interval, minimum number, how to cancel)' },
    ],
  },
  cookieConsent: {
    title: 'Cookie and data-sharing consent',
    intro: 'Article 27-12 of the Telecommunications Business Act (the external transmission rules) requires that, before user information is sent to third parties, users are notified of what is sent and to whom, or that this is made easy to find (information sent with consent, or that users can stop, is exempt). `CookieConsent` shows a banner to people who have not chosen yet, gives “Allow all” and “Necessary only” equal weight, and opens a dialog to choose by kind. Your app saves the choice in `onChange`.',
  },
  externalTransmission: {
    title: 'Publishing external transmissions',
    intro: '`ExternalTransmissionList` lists, for each recipient, the information sent, the purpose and the kind, with links to the recipient’s privacy policy and to the page to stop the transmission. Put it where the banner’s “List of recipients” link points (for example a section of your privacy policy).',
  },
  cancel: {
    title: 'Cancelling a subscription',
    intro: 'At most three steps: reason (optional), options (optional, shown once), confirm. “Keep subscription” is available on every screen, and on the options screen “Continue to cancel” carries at least as much weight as the offers. The confirm screen shows the last day of access, what happens to the data and how to export it before cancelling.',
  },
  setup: {
    title: 'Placing the consent banner',
    intro: 'Put the banner at the end of the page and save the choice in a cookie or localStorage. On server-rendered pages, read the saved choice after rendering (`useEffect`) and render nothing until then (passing `null` first makes the banner flash for people who have already chosen). Reopen the dialog from a “Cookie settings” link in the footer with `settingsOpen`.',
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
        // Load only the tags for the kinds that are allowed
      }}
      settingsOpen={settingsOpen}
      onSettingsOpenChange={onSettingsOpenChange}
      policyHref="/privacy#external"
    />
  );
}`,
  },
  samples: {
    coffee: 'Coffee beans, 200g',
    coffeeOption: 'Medium roast, whole bean',
    bag: 'bag',
    dripper: 'Dripper',
    coupon: 'First-order coupon',
    address: ['Hana Sato', '1-1 Chiyoda, Chiyoda-ku, Tokyo 100-0001', '090-1234-5678'],
    deliveryMethod: 'Home delivery',
    deliveryTiming: '2–4 days after your order (you can choose a date and time)',
    paymentMethod: 'Credit card (Visa ending in 4242)',
    paymentTiming: 'When you place the order',
    offerPeriod: 'Until 23:59 on November 30, 2026 (the sale period for this set)',
    cancellationPolicy: 'Unopened items can be returned within 8 days of delivery. You pay the return shipping. Defective items are exchanged at our cost.',
    interval: 'Every month',
    priceNote: '¥2,160 per delivery from the second delivery (10% off)',
    howToCancel: 'Up to 7 days before the next delivery, from “Subscriptions” in your account. We also accept cancellations by phone.',
    consent: 'I agree to the terms of use and the subscription terms',
    edit: 'Going back to the previous step (sample)',
    shopTitle: 'Weekend coffee club',
    shopText: 'Freshly roasted beans, delivered every month. In this sample, a cookie banner appears at the bottom of the screen.',
    openSettings: 'Cookie settings',
    consentSaved: 'Cookie settings saved (sample)',
    policyTitle: 'Information sent to third parties',
    policyText: 'This site may send information about you to the companies below. You can stop each of them from that company’s page.',
    recipientsTitle: 'Recipients and the information sent',
    transmissions: [
      {
        recipient: 'Google LLC',
        service: 'Google Analytics',
        information: 'URLs of the pages you view, the referrer, your device and browser type, and a cookie identifier',
        purpose: 'Counts page views and how pages are used, to improve the site.',
        category: 'analytics',
        policyHref: 'https://policies.google.com/privacy',
        optOutHref: 'https://tools.google.com/dlpage/gaoptout',
      },
      {
        recipient: 'Meta Platforms, Inc.',
        service: 'Meta Pixel',
        information: 'URLs of the pages you view, whether you made a purchase, device information, and a cookie identifier',
        purpose: 'Measures ad performance and shows ads that match your interests.',
        category: 'marketing',
        policyHref: 'https://www.facebook.com/privacy/policy/',
      },
      {
        recipient: 'Atlas Inc.',
        service: 'Keeping you signed in',
        information: 'An identifier for your sign-in session',
        purpose: 'Keeps you signed in.',
        category: 'necessary',
      },
    ],
    plan: 'Pro',
    reasons: { price: 'It costs too much', unused: 'I don’t use it much', missing: 'It lacks a feature I need', switching: 'I’m moving to another service', other: 'Other' },
    pauseTitle: 'Pause for a month',
    pauseDescription: 'You are not charged while paused, and your data stays as it is.',
    pauseAction: 'Pause for 1 month',
    downgradeTitle: 'Switch to the free plan',
    downgradeDescription: 'Up to 3 members and 1 GB of storage. You keep all your data.',
    downgradeAction: 'Switch to Free',
    dataNotice: 'Your workspace data will be deleted 30 days after you cancel. You can export it until then.',
  },
  a11yCaption: 'How the commerce and consent templates behave',
} satisfies typeof ja;
