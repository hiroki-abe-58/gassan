import type ja from '../ja/authPatterns';

export default {
  lead: 'Sign-in and sign-up sit at the entrance to a service, where people are most likely to give up. These variations keep the same forms and submission flow as the sign-in and sign-up pages, and change how and in what order they appear: a dialog opened from the header, sign-in that asks for the email address first and routes from there, password-free sign-in by email link or SMS, a provisional sign-up with just an email address followed by full registration steps, passkeys, choosing an account, identity checks and expired sessions, and creating an account after a purchase.',
  choose: {
    title: 'Choosing for your service',
    intro: 'All of them can be combined. A financial service, for example, could start a provisional sign-up from the header dialog, lead people from the email link into the full registration steps, and ask at the end whether to create a passkey.',
    tableCaption: 'Services and the patterns that suit them',
    head: { service: 'Service', pattern: 'Pattern', why: 'Why' },
    rows: [
      {
        service: 'General web services and SaaS',
        pattern: '`AuthDialog` (dialog)',
        why: 'People can sign in or sign up without leaving the page they are on, and get back to what they were doing afterwards',
      },
      {
        service: 'Business SaaS',
        pattern: '`EmailFirstPage` (email address first)',
        why: 'Routes company domains to the organization’s identity provider (SSO), and gives sign-in and sign-up a single entrance',
      },
      {
        service: 'Finance, insurance, real estate and staffing',
        pattern: '`QuickSignUpPage` → `RegistrationWizardPage`',
        why: 'There is a lot to ask, so the entrance asks only for the email address, and the full registration moves ahead a little at a time, saving as it goes',
      },
      {
        service: 'Services people use only now and then',
        pattern: '`MagicLinkPage` (email link)',
        why: 'Many people forget their password. They can sign in with the link or the code in an email, with no password reset to go through',
      },
      {
        service: 'Mobile-first services',
        pattern: '`PhoneSignInPage` (SMS) and passkeys',
        why: 'Less typing. The code fills in from the SMS automatically, and from the second time on, people can sign in with a fingerprint or their face',
      },
      {
        service: 'Services used with separate accounts for family or work',
        pattern: '`AccountChooserPage`',
        why: 'People just pick an account used before on this device, without typing the email address again',
      },
      {
        service: 'Screens for payments, closing an account or changing a password',
        pattern: '`ReauthDialog`',
        why: 'Asks for the password again without leaving the page. Even if the session expires, nothing being typed is lost',
      },
      {
        service: 'E-commerce and booking',
        pattern: '`GuestAccountCard`',
        why: 'Doesn’t ask people to sign up before buying. On the screen after the purchase, choosing a password is all it takes to create an account',
      },
    ],
  },
  setup: {
    title: 'Opening a dialog from the header',
    intro: 'Place `AuthDialog` alongside the buttons in the header and choose which screen it opens to (`mode`). Inside the dialog, people can move between sign-in, sign-up and password reset; once they are done, it closes and returns focus to the button they pressed.',
    code: `import { useState } from 'react';
import { AuthDialog, Button, type AuthDialogMode } from '@genelab/gassan';

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>('signIn');
  const openAs = (next: AuthDialogMode) => {
    setMode(next);
    setOpen(true);
  };
  return (
    <>
      <Button variant="tertiary" onClick={() => openAs('signIn')}>Sign in</Button>
      <Button variant="primary" onClick={() => openAs('signUp')}>Start for free</Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        onSignIn={async ({ email, password }) => {
          // On failure, show the default message (it doesn’t reveal which one was wrong)
          if (!(await signIn(email, password))) return { error: true };
        }}
        onSignUp={(values) => signUp(values)}
        onForgotPassword={({ email }) => sendResetEmail(email)}
      />
    </>
  );
}`,
  },
  dialog: {
    title: 'Sign-in and sign-up in a dialog',
    intro: 'Opens from “Sign in” or “Start for free” in the header, without leaving the current page. Pressing outside doesn’t close it (nothing typed is lost); Esc and the close button do. The email address typed stays when switching between sign-in and sign-up. In the example, enter “gassan” as the password to sign in.',
  },
  emailFirst: {
    title: 'Sign-in that asks for the email address first',
    intro: 'It starts with just the email address. Depending on your app’s answer, it routes to the password, sign-up, the organization’s identity provider or an email link. The password screen shows the address in a form that can’t be edited, and tells password managers which account it is for. If you don’t want to reveal whether an account exists, answer with the password or the link even for addresses that have no account.',
  },
  magicLink: {
    title: 'Email link and verification code',
    intro: 'Sign-in without a password. It asks only for the email address and sends a sign-in link and a verification code. When the link can’t be opened on the device signing in, such as reading the email on a phone while signing in on a computer, the code still gets people in. In the example, the verification code is “123456”.',
  },
  quickSignUp: {
    title: 'Provisional sign-up with just an email, then full registration',
    intro: 'The entrance asks only for the email address. Submitting it completes a provisional sign-up, and a link to the full registration is sent by email. The full registration steps save as people go, so they can leave with “Save and continue later” and pick up where they left off, and every step can be edited from the final review screen. The address, name and date of birth are built from the Japanese input components.',
    quick: 'Provisional sign-up',
    wizard: 'Full registration steps',
  },
  phone: {
    title: 'Phone number and SMS',
    intro: 'However the number is written, it is normalized to digits only and checked to be a mobile number that can receive SMS. A landline number gets a message that explains how to fix it. The code fills in automatically from the SMS and is submitted once every digit is in. In the example, the verification code is “123456”.',
  },
  passkey: {
    title: 'Passkeys',
    intro: 'Put “Sign in with a passkey” on the sign-in page, and let people pick a passkey from the email field too. Right after sign-in, ask once whether to create a passkey (“Not now” is offered with equal weight). Your app supplies the WebAuthn calls.',
    prompt: 'Asking to create one',
    signIn: 'Sign-in button',
  },
  accountChooser: {
    title: 'Choosing an account',
    intro: 'Lists the accounts that have signed in on this device, and choosing one goes straight to signing in to that account. “Use another account” is always shown, and accounts no longer in use can be removed from this device.',
  },
  reauth: {
    title: 'Identity checks and expired sessions',
    intro: 'A dialog that asks for the password again without leaving the page. It has two uses: confirming identity before an important action, and an expired session. The expired-session dialog can’t be closed, and people sign in again with what they were typing still in place. In the example, the password is “gassan”.',
    confirm: 'Before an important action',
    expired: 'Expired session',
  },
  guestAccount: {
    title: 'Creating an account after a purchase',
    intro: 'Don’t require an account before buying (guest checkout is allowed). On the screen after the purchase, place a card where choosing a password is all it takes to create an account. It uses the email address from the order.',
  },
  a11yCaption: 'How the sign-in and sign-up variations behave',
  samples: {
    signIn: 'Sign in',
    startFree: 'Start for free',
    heroTitle: 'All your team’s work, in one place',
    heroDescription: 'Press “Sign in” or “Start for free” at the top right, and a dialog opens over this page (example).',
    signedUp: 'Account created (example)',
    passkeyNotice: 'This is an example, so no passkey is actually used.',
    emailFirstHint:
      'Example: an address starting with “new” goes to sign-up, one ending in “@corp.example.com” goes to the organization’s identity provider, and one starting with “link” goes to the email link. Any other address asks for the password (gassan).',
    expiresIn: '24 hours',
    quickSteps: ['Open the link in the email', 'Enter your personal details and address', 'Review and register'],
    useEmail: 'Sign in with your email address',
    accounts: [
      { id: 'hana', name: 'Hannah Chen', email: 'hana@example.com' },
      { id: 'aoi', name: 'Olivia Chen', email: 'aoi@corp.example.com' },
      { id: 'ren', name: 'Ryan Mitchell', email: 'ren@example.jp' },
    ],
    securityTitle: 'Security',
    securityDescription: 'We’ll check your password once more before you change it. In this example, the password is “gassan”.',
    changePassword: 'Change password',
    securityDone: 'Identity confirmed (example)',
    expiredTitle: 'Weekly report',
    expiredDescription: 'Press “Try an expired session” to open the dialog people see when their session expires. Your unfinished report stays as it is. In this example, the password is “gassan”.',
    expiredLabel: 'What I did this week',
    expiredDraft: 'Published the new pricing page. Inquiries from the contact form are up 20%.',
    expiredDone: 'Signed in again. Your draft is just as you left it (example)',
    expire: 'Try an expired session',
    orderTitle: 'Thank you for your order',
    orderDescription: 'We sent an order confirmation email to hana@example.com.',
    orderRows: [
      { term: 'Order number', details: 'A-20261026-0042' },
      { term: 'Estimated delivery', details: 'Thursday, October 29' },
      { term: 'Payment', details: '¥4,180 (credit card)' },
    ],
    guestLater: 'You can create an account later, too (example)',
    wizard: {
      profileTitle: 'Personal details',
      profileDescription: 'To verify your identity, enter them exactly as they appear on your official documents.',
      name: 'Name',
      birth: 'Date of birth',
      profileRequired: 'Enter your name and date of birth',
      addressTitle: 'Address and contact details',
      addressDescription: 'Enter your postal code, and part of the address fills in automatically.',
      address: 'Address',
      phone: 'Phone number',
      addressRequired: 'Enter your address and phone number',
      purposeTitle: 'Intended use',
      purposeDescription: 'We use this to improve the service. You can also answer later.',
      purpose: 'Main purpose',
      choose: 'Choose one',
      purposes: ['Investing', 'Managing living expenses', 'Business funds', 'Other'],
      notAnswered: 'Not answered',
      savedExit: 'Saved. You can continue from the link in the email (example)',
      doneNext: 'Continue',
    },
  },
} satisfies typeof ja;
