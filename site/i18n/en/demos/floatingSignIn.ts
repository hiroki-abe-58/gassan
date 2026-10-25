import type ja from '../../ja/demos/floatingSignIn';

export default {
  account: 'Email or phone number',
  accountError: 'Enter an email address or phone number',
  password: 'Password',
  submit: 'Continue',
  comments: {
    floating: 'labelPlacement="floating" puts the label inside the input. With focus or a value, it shrinks out of the way to the top left (I-24)',
    password: 'PasswordInput works the same way. The label does not stretch over the visibility toggle',
  },
} satisfies typeof ja;
