import type ja from '../ja/provider';

export default {
  lead: 'Every string the library renders goes through here, without exception. The default is Japanese, and englishLabels is bundled. Partial overrides are fine.',
  english: {
    title: 'Switch to English',
    intro: 'Every string is replaced, including the ones only screen readers hear: “Close”, “End of content.”, “Step 2 of 5”, “Agree to the terms to continue.”',
    exampleDescription: 'Press the button before reading, and the reason is announced in English.',
  },
  why: {
    title: 'The rarer the string, the more likely it is hard-coded',
    body: [
      'The reason for a gate before registration is complete used to be hard-coded in Japanese. Even with `englishLabels`, that one string came out in Japanese. The rarer a string is, the more likely it is to be hard-coded, and so the longer it survives (§10-21). Now every string the library renders is gathered here.',
    ],
    callout:
      'Strings that embed numbers or names, such as the step announcement or the detent names, are passed as functions. Word order differs between languages, so they are never built by concatenating strings.',
  },
  a11yCaption: 'Specification items that involve strings',
} satisfies typeof ja;
