import type ja from '../ja/imperative';

export default {
  lead: 'Writing a confirmation dialog declaratively bloats the code with open state and passing the result around. useModals().confirm() returns the result as a Promise.',
  confirm: {
    title: 'Receive it with await',
    intro: 'Call two at once, and they still appear one at a time. With two stacked, the user cannot tell which one they are answering.',
  },
  host: {
    title: 'Put exactly one ModalHost',
    body: ['Without somewhere to render, the Promise from `confirm()` would never resolve. So three ways out are guaranteed (L-15).'],
    exits: [
      'A warning if a confirm is left waiting with no host. The check is delayed by one tick (child effects run before the parent’s, so a synchronous check would misfire even in a correct setup).',
      'A warning if there are two or more hosts. Each would render the head of the same queue, and one answer would resolve them all.',
      'A warning if the host disappears while a confirm is waiting. Swallowing it silently would leave only “the await never returns”, with no way to trace the cause.',
    ],
    callout:
      'Use the imperative API while the confirmation stays simple; when you need gates or custom content, write it declaratively with `Modal.Root`. Pass `consent`, and it becomes a confirmation that requires a consent checkbox.',
  },
  a11yCaption: 'Specification items the imperative API satisfies',
} satisfies typeof ja;
