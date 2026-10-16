import type ja from '../ja/gate';

export default {
  lead: 'Buttons that become pressable “once you have read to the end”, “once you have ticked the box” or “once you have chosen three”, built without disabled. Press one, and it announces what is missing and takes you there.',
  consent: {
    title: 'Reading and consent',
    intro: 'The readGate of Modal.Body and Modal.Consent each register a named gate. A button with gate cannot be pressed until all of them are satisfied.',
    exampleTitle: 'Updated terms of service',
    exampleDescription: 'Press “Agree and continue” before reading. The reason is announced, and the content scrolls down by one screen.',
  },
  custom: {
    title: 'Any condition',
    intro: 'Pass satisfied and reason to Modal.Gate, and any condition can become a gate. Pass focus, and pressing the button takes the user there.',
    exampleTitle: 'Choose at least three',
  },
  selector: {
    title: 'Which gates a button watches',
    tableLabel: 'How to write gate',
    tableCaption: 'How to write gate, and the state before registration',
    head: { code: 'Syntax', before: 'Before registration', meaning: 'Meaning' },
    rows: [
      { code: 'gate / gate={true}', before: 'Closed', meaning: 'Watches every registered gate. Until registration is complete, the answer is “not known yet”' },
      { code: "gate={['terms']}", before: 'Closed', meaning: 'Names the gates. Unregistered names are treated as unsatisfied' },
      { code: 'gate={[]}', before: 'Open', meaning: 'Known to have zero conditions. Nothing to wait for' },
    ],
    body: [
      'Gates are registered in child effects. Effects do not run on the server, and on the client they have not run yet during the first render. During that window the registry is empty, but that means “not known yet”, not “no conditions”. So a button with `gate` is rendered with `aria-disabled="true"` even in the server markup, and switches to the real conditions after mount. The server and the first client render match, so there is no hydration mismatch either (G-12).',
    ],
  },
  rules: {
    title: 'Conditions that must not become gates',
    callout:
      'Do not build “pressable after N seconds” (WCAG 2.2.1). Do not judge by “the scroll position reached the end” alone (virtual cursor users could never proceed). The only conditions that justify an unpressable state are form validity, explicit consent and legally required reading.',
    codeCaption: 'What happens when it is pressed',
    code: '// 1. Announce the reason in a role="status" live region (G-07)\n// 2. Take the user to where they are stuck (G-08)\n//    If unread, scroll the content by one screen. Never jump straight to the end (that would defeat the gate)\n//    If unchecked, move focus to the checkbox\n// 3. onClick is not called',
  },
  a11yCaption: 'Activation gate specification',
} satisfies typeof ja;
