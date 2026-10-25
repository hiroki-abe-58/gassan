import type ja from '../../ja/demos/chartGantt';

export default {
  label: 'Schedule for the new billing screen',
  description: 'Screen design runs until this Friday’s review. API work has started, and the release is on a Monday five weeks out.',
  design: 'Design',
  build: 'Build',
  qa: 'Testing and release',
  requirements: 'Agree on requirements',
  screens: 'Design the screens',
  review: 'Design review',
  api: 'Build the API',
  frontend: 'Build the screens',
  testing: 'Acceptance testing',
  release: 'Release',
  comments: {
    relative: 'Sample dates count from this week’s Monday, so the today line falls inside the schedule whenever you open it',
  },
} satisfies typeof ja;
