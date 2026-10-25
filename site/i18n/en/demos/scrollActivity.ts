import type ja from '../../ja/demos/scrollActivity';

export default {
  label: 'Recent activity',
  visibility: 'Scrollbar visibility',
  modes: { auto: 'Auto', hover: 'Hover', scroll: 'Scrolling', always: 'Always' },
  items: [
    'Sato issued the April invoice',
    'Tanaka joined the project “Atlas 2.0”',
    'Storage reached 80%',
    'Suzuki commented on “Pricing review”',
    'Created a new API key',
    'Takahashi invited 3 members',
    'Sent the weekly report',
    'Ito exported “Cancellation reasons”',
    'Changed the plan from Pro to Max',
    'Watanabe turned on two-step verification',
    'Changed the billing address',
    'Yamamoto renamed the workspace',
    'Nakamura drafted the “Onboarding” email',
    '3 failed sign-in attempts (Tokyo)',
    'Kobayashi published “Customer stories”',
    'Kato changed the notification settings',
  ],
  comments: {
    height: 'Put the height limit on the container (the viewport shrinks to the container’s height and scrolls only as far as the content overflows)',
  },
} satisfies typeof ja;
