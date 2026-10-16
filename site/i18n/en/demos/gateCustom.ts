import type ja from '../../ja/demos/gateCustom';

export default {
  topicDesign: 'Design',
  topicA11y: 'Accessibility',
  topicPerf: 'Performance',
  topicTesting: 'Testing',
  open: 'Choose your interests',
  title: 'Tune your recommendations',
  remaining: 'Choose {0} more',
  topics: 'Topics (3 or more)',
  submit: 'Save these choices',
  comments: {
    gate: 'Turn any condition into a gate. Until it is met, the button is aria-disabled (pressing it announces the reason and brings focus back here)',
    status: 'The reason is visible before the button is pressed (G-10)',
  },
} satisfies typeof ja;
