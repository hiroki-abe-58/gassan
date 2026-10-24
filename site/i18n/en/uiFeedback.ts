import type ja from '../ja/uiFeedback';

export default {
  lead: 'A progress bar, a spinner, skeletons shown before content loads, and banners that carry notices on the page. Each one tells both the eye and the screen reader “what is happening right now”.',
  progress: {
    title: 'Progress',
    intro: 'Give role="progressbar" a name and a value. By default the value is announced as a percentage; with valueText it can also be written like “12 / 20 GB”. When the value is unknown, a line sweeps along the track.',
  },
  spinner: {
    title: 'Spinner',
    intro: 'For short waits. role="status" announces “Working” just once, and the ring is decoration. Under the “Reduce Motion” setting, it spins more slowly.',
  },
  skeleton: {
    title: 'Skeleton',
    intro: 'Shows only the shape before content loads, to reduce the jolt when it appears. It is decoration, so it is not announced. Convey that loading is under way with aria-busy on the container it sits in, or with a spinner. The shimmer stops under the “Reduce Motion” setting and at the motion level none.',
  },
  banner: {
    title: 'Banner',
    intro: 'Notices that concern the whole page, such as upcoming maintenance, a failed payment or the time left in a trial. A subtle background color sets it apart from the body text; it is not boxed in with a border or a thick line on the left. Only a banner that appears later is announced, with live.',
  },
  labels: {
    value: 'With a value',
    custom: 'Custom value text',
    small: 'Thin (sm)',
    indeterminate: 'Value unknown',
    sizes: 'Sizes',
    text: 'Text skeleton',
    card: 'Card skeleton',
  },
  sample: {
    upload: 'Upload',
    storage: 'Storage',
    storageText: (used: number, max: number): string => `${String(used)} / ${String(max)} GB`,
    sync: 'Sync',
    preparing: 'Preparing the export',
    maintenanceTitle: 'Scheduled maintenance',
    maintenance: 'The service will be unavailable on Sat, Oct 24, from 2:00 to 4:00.',
    paymentTitle: 'Payment failed',
    payment: 'We couldn’t charge the card on file. Please update your card.',
    update: 'Update card',
    trial: '5 days left in your trial.',
    upgrade: 'Choose a plan',
    saved: 'Settings saved.',
  },
  code: "import { Progress, Spinner, Skeleton, Banner } from '@genelab/gassan';\n\n<Progress label=\"Storage\" value={12} max={20} valueText={(v, m) => `${v} / ${m} GB`} />\n\n<Spinner label=\"Syncing\" />\n\n<div aria-busy={loading}>{loading ? <Skeleton lines={3} /> : <Article />}</div>\n\n<Banner tone=\"error\" title=\"Payment failed\" action={<Button size=\"sm\">Update card</Button>}>\n  We couldn’t charge the card on file.\n</Banner>",
  codeCaption: 'Usage',
  a11yCaption: 'Specification items progress indicators and notices satisfy',
} satisfies typeof ja;
