import type ja from '../../ja/demos/floatingStates';

export default {
  name: 'Display name',
  nameValue: 'Olivia Chen',
  email: 'Email address',
  emailValue: 'aoi@',
  emailError: 'Enter a valid email address',
  workspace: 'Workspace URL',
  workspaceValue: 'atlas-design',
  workspaceHelp: 'Can’t be changed once created',
  reset: 'Reset to initial values',
  comments: {
    reset: 'When form.reset() returns fields to empty or to their initial values, the labels move to match (restore controlled values in onReset)',
    initial: 'With a defaultValue, the label is floating from the first render (also when rendered on the server)',
    error: 'The error goes below the field, and the label turns red too. The wiring (aria-invalid / aria-describedby) is the same as with a label on top',
    disabled: 'A disabled field fades its frame and label together',
  },
} satisfies typeof ja;
