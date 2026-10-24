import type ja from '../ja/uiCarousel';

export default {
  lead: 'A component that shows announcements or customer stories by moving sideways through them. You can move through them directly with a finger or a trackpad, and also with Previous and Next, the dots or autoplay. With autoplay, a stop button comes first, and it stops while the pointer or focus is on the carousel.',
  news: {
    title: 'Announcements (autoplay)',
    intro: 'Shows one slide at a time, large. autoplay moves it on every 6 seconds, and after the last slide it comes back around to the first. The line that grows across the current dot shows the time left until it moves on.',
    exampleTitle: 'Announcements carousel',
    exampleDescription: 'The button at the top left stops autoplay. It also stops while the pointer is over the carousel and while focus is inside it, and once they leave, the count resumes from where it stopped.',
  },
  cases: {
    title: 'Customer stories (several side by side)',
    intro: 'Pass minSlideWidth, and it lines up as many slides as fit in the width of the container. There is one dot for each slide that can come first.',
    exampleTitle: 'Customer stories',
    exampleDescription: 'Narrow the screen, and it shows one slide at a time. When every slide is in view, neither Previous / Next nor the dots appear.',
  },
  rules: {
    title: 'When autoplay stops',
    intro: 'Content that keeps moving disappears before you can finish reading it. In line with WCAG 2.2.2, there is a way to stop it, and the situations in which it stops are defined.',
    tableCaption: 'When autoplay stops',
    head: { when: 'When', then: 'Then' },
    rows: [
      { when: 'The stop button is pressed', then: 'Does not move on until the start button is pressed' },
      { when: 'The pointer is over it', then: 'When the pointer leaves, the count resumes from where it stopped' },
      { when: 'Focus is inside it', then: 'When focus moves out, the count resumes from where it stopped' },
      { when: 'The tab is hidden', then: 'When you come back, the count resumes from where it stopped' },
      { when: 'The “Reduce Motion” setting is on', then: 'Starts out stopped (the start button sets it going)' },
      { when: 'At the last slide (loop={false})', then: 'Stops there' },
    ],
  },
  access: {
    title: 'Screen readers and keyboard',
    intro: 'The carousel is a region with a name and the role description “carousel”, and each slide has a name such as “Item 1 of 5” (or its label). When the position changes, it is announced. While the carousel is moving on automatically, it is not.',
    tableCaption: 'Carousel keyboard interaction',
    head: { key: 'Key', action: 'Action' },
    rows: [
      { key: 'Tab', action: 'Stops at the stop button → links and buttons inside the slides → Previous → the current dot → Next, in that order' },
      { key: 'Enter / Space (Previous / Next)', action: 'Moves to the neighboring slide. Cannot be pressed at either end (with loop, it wraps around to the opposite end)' },
      { key: '← / → (dots)', action: 'Moves to the neighboring dot and puts that slide first' },
      { key: 'Home / End (dots)', action: 'First / last dot' },
    ],
  },
  codeCaption: 'Usage',
  code: "import { Carousel } from '@genelab/gassan';\n\n<Carousel\n  label=\"Announcements\"\n  autoplay\n  items={[\n    { id: 'dashboard', label: 'New dashboard', content: <NewsSlide /> },\n    { id: 'invoices', label: 'Download invoices in bulk', content: <NewsSlide /> },\n  ]}\n/>",
  a11yCaption: 'How the carousel behaves',
} satisfies typeof ja;
