import type ja from '../ja/registrationPresets';

export default {
  lead: 'Full registration for industries where Japanese law sets what you have to ask, such as finance, e-commerce, healthcare and matching services. The entrance asks only for an email address, and everything that has to be asked before a transaction is laid out in steps, in the order each industry needs. Each step says why it asks, citing the law behind it, and parental consent for minors, minimum ages and identity verification methods are also set up to fit each industry.',
  law: {
    title: 'A note on the law',
    body: 'The steps and their legal basis are guidance put together from Japanese statutes as of October 26, 2026 (e-Gov Law Search) and materials from government agencies. They are not legal advice. What you have to ask varies with the type of registration or notification your business operates under, and the laws are amended often. Before launching your service, confirm with a professional which laws apply to your business and what the latest amendments are. The sources are linked from the table below.',
  },
  presets: {
    title: 'Choosing an industry',
    intro: 'Pass an industry to `preset`, and full registration is built from that industry’s steps and fields. This table is generated from `REGISTRATION_PRESETS`, so it matches what is in the library.',
    tableCaption: 'Full registration steps and legal basis by industry',
    head: { preset: 'Industry', steps: 'Full registration steps', age: 'Age', laws: 'Legal basis' },
    minAge: (age: number) => `${String(age)} or older`,
    guardianUnder: (age: number) => `Parental consent if under ${String(age)}`,
    noAge: 'No requirement',
  },
  sample: {
    title: 'Example',
    intro: 'Choose an industry and walk through its full registration steps. Pressing “Next” shows what needs fixing below the fields, and each step is saved as you move on. A postal code such as 100-0001 fills in the address, and the corporate number 7000012050002 fills in the company name (sample data). Identity verification is only simulated here: choose a method and press the button, and it counts as verified.',
  },
  flow: {
    title: 'From the entrance to full registration',
    intro: 'The entrance, `QuickSignUpPage`, asks only for an email address, and submitting it completes a provisional sign-up. The statutes are worded so that the duty to verify applies at the time of a contract or transaction, which can be read as not requiring identity verification at the entrance (no official source has been found that states this outright). Open `RegistrationPresetPage` from the link in the email and save each step with `onSave`, so people can leave and pick up where they left off.',
    code: `import { QuickSignUpPage, RegistrationPresetPage } from '@genelab/gassan';

// 1. Entrance: email address only. Submitting completes a provisional sign-up and emails a link to full registration
export function Entry() {
  return (
    <QuickSignUpPage
      onSubmit={({ email }) => api.preRegister(email)}
      expiresIn="24 hours"
      steps={['Open the link in the email', 'Enter your details', 'Verify your identity']}
    />
  );
}

// 2. From the email link: full registration for the industry
export function Registration({ draft }: { draft: Draft }) {
  return (
    <RegistrationPresetPage
      preset="securities"
      defaultValues={draft.values}
      defaultStep={draft.stepId}
      onSave={(values, stepId) => api.saveDraft(values, stepId)}
      onSaveAndExit={() => navigate('/home')}
      lookupAddress={(postalCode) => api.postalCode(postalCode)}
      onVerifyIdentity={(method, values) => ekyc.start(method, values)}
      onSubmit={(values) => api.register(values)}
    />
  );
}`,
  },
  timing: {
    title: 'When to ask',
    intro: 'The less the entrance asks, the fewer people give up. Put off asking until the point the law requires, and when you do ask, give the reason in the step’s description.',
    tableCaption: 'When to ask, and what',
    head: { stage: 'When', items: 'What to ask', how: 'Component' },
    rows: [
      {
        stage: 'Entrance (provisional sign-up)',
        items: 'Only the email address and agreement to the terms. Show the purpose of use of personal information before submission (Act on the Protection of Personal Information, Article 21(2)). Make consent to marketing emails a separate, optional checkbox that starts unchecked (Act on Regulation of Transmission of Specified Electronic Mail, Article 3).',
        how: '`QuickSignUpPage`',
      },
      {
        stage: 'Full registration (before transactions)',
        items: 'Name, address, date of birth and the items for each industry. For finance, that means occupation, purpose of transactions, foreign PEP status, country of tax residence, a declaration of not being an anti-social force, and identity verification.',
        how: '`RegistrationPresetPage`',
      },
      {
        stage: 'Right before the transaction that needs it',
        items: 'Whether the person is an executive of a listed company (before their first trade in listed shares), a delivery address for online shopping (before the first order) and identity verification for buyback (before buying the items).',
        how: 'A separate step, or `optional` and asked later',
      },
      {
        stage: 'What not to ask',
        items: 'Don’t make anything mandatory that the law doesn’t require. If you ask for an employer or a phone number, say why. In recruiting, don’t ask about registered domicile, family or religion (the Ministry of Health, Labour and Welfare’s guidance on fair recruitment screening).',
        how: '`optional`',
      },
    ],
  },
  fields: {
    title: 'Field components',
    intro: 'The full registration steps are built from components for the items the law requires. You can also put the components on your own screens. The wording can be replaced with `registrationLabels` on `SiteProvider` (Japanese and English are built in).',
    work: {
      title: 'Occupation and purpose of transactions',
      intro: 'Items asked in the verification at the time of transaction under the Act on Prevention of Transfer of Criminal Proceeds. They aren’t free text: the options follow the Financial Services Agency’s categories. Any number of purposes can be chosen, and the set of options changes with the business type.',
      exampleTitle: 'Occupation and purpose of transactions',
      exampleDescription: 'Change the business type, and the purpose options change. Values are received as keys.',
    },
    declarations: {
      title: 'Notifications and declarations',
      intro: 'Foreign PEPs, country of tax residence (CRS and CARF) and U.S. tax status (FATCA) are two-option questions, with the question as the group’s label and who it covers in the description. Only people it applies to get the extra fields. The anti-social forces declaration comes with a description of its scope that can be opened and closed.',
      exampleTitle: 'Notifications and declarations',
      exampleDescription: 'Choose “Japan and other countries” to get fields for the country and taxpayer identification number, or “Yes” to the U.S. tax question to get fields for the U.S. taxpayer identification number and consent.',
    },
    numbers: {
      title: 'My Number and corporate number',
      intro: 'My Number is normalized to digits only, with autofill and spell checking turned off. The review screen shows only the last 4 digits. Once the corporate number is a valid 13 digits, check digit included, the company name is looked up and filled in (a company name the person typed is never overwritten).',
      exampleTitle: 'My Number and corporate number',
      exampleDescription: 'Typing “１２３４-５６７８ ９０１８” still gives digits only. Enter 7000012050002 as the corporate number, and the company name fills in.',
    },
    identity: {
      title: 'Identity verification methods',
      intro: 'The applicable law decides which methods are allowed, and amendments change them. Methods are referred to by name, not by article and item references, and when given a date, the component leaves out methods that are no longer allowed on that day. The verification itself (reading the IC chip, taking photos) is done by the identity verification service your app uses.',
      exampleTitle: 'Identity verification methods',
      exampleDescription: 'With “Banks and brokers” (Act on Prevention of Transfer of Criminal Proceeds) selected, choose “From April 1, 2027”, and “Photos of your ID and your face” disappears.',
    },
    guardian: {
      title: 'Parental consent and marketing email consent',
      intro: 'A contract a minor makes without consent from a parent or guardian can be rescinded. When the date of birth shows the person is a minor, ask for the parent or guardian’s name, relationship and email address, and their consent. Make consent to marketing emails an optional checkbox, separate from agreeing to the terms.',
      exampleTitle: 'Parental consent and marketing email consent',
      exampleDescription: 'Autofill doesn’t put the person’s own name or email address into the parent or guardian fields.',
    },
  },
  amendments: {
    title: 'Recent and upcoming amendments',
    intro: 'The rules on identity verification and personal information change several times over a few years. Where a change takes effect on a set date, the component checks the date and switches over.',
    tableCaption: 'Effective dates and how gassan handles them',
    head: { date: 'Effective date', change: 'What changes', gassan: 'gassan' },
    rows: [
      {
        date: '2026-01-01',
        change: 'Crypto-asset transactions require a declaration of the country of tax residence (CARF; Act on Special Provisions for the Implementation of Tax Treaties, Article 10-9). Existing users have until the end of 2026.',
        gassan: '`crypto` asks for the country of tax residence in its declarations step',
      },
      {
        date: '2026-04-01',
        change: 'Online identity verification for mobile phone contracts now relies on reading the IC chip as a rule, and sending images of ID documents is no longer allowed.',
        gassan: '`identityMethods("telecom")` doesn’t offer photos of ID and face',
      },
      {
        date: '2026-04-16',
        change: 'Age verification for online dating services gained methods that use the My Number Card.',
        gassan: '`identityMethods("matching")` includes the My Number Card PIN and electronic certificate methods',
      },
      {
        date: '2027-04-01',
        change: 'The method of photographing ID documents and the face is removed from online identity verification under the Act on Prevention of Transfer of Criminal Proceeds.',
        gassan: 'From this date, `identityMethods("aml")` no longer offers photos of ID and face (it switches by date)',
      },
      {
        date: 'Date set by Cabinet Order (by July 2027)',
        change: 'Crypto-asset exchange business becomes crypto-asset trading business under the Financial Instruments and Exchange Act.',
        gassan: '`crypto` has a step that asks about investment experience and assets (suitability)',
      },
      {
        date: 'Date set by Cabinet Order (by July 2028)',
        change: 'An amendment to the Act on the Protection of Personal Information requires consent and notices concerning the personal information of children under 16 to go to their legal representative.',
        gassan: 'Industries that accept people under 16 add `guardianUnder` (see the next section)',
      },
    ],
  },
  customize: {
    title: 'Adding and removing steps',
    intro: '`preset` also accepts a preset you build yourself. Spread an industry from `REGISTRATION_PRESETS` and add or remove steps, required and optional fields, and age rules. Replace the step descriptions with `presets` in `registrationLabels`.',
    code: `import { REGISTRATION_PRESETS, RegistrationPresetPage, type RegistrationPreset } from '@genelab/gassan';

// Add date of birth to the online shop, and require parental consent for anyone under 16
const shop: RegistrationPreset = {
  ...REGISTRATION_PRESETS.ec,
  guardianUnder: 16,
  steps: [{ id: 'delivery', fields: ['name', 'birthDate', 'address', 'phone', 'marketing'], optional: ['marketing'] }],
};

export function ShopRegistration() {
  return <RegistrationPresetPage preset={shop} onSubmit={(values) => api.register(values)} />;
}`,
  },
  samples: {
    savedExit: 'Saved. You can continue anytime from the link in the email.',
    doneNext: 'Continue to home',
  },
  a11yCaption: 'Specification items registration by industry satisfies',
} satisfies typeof ja;
