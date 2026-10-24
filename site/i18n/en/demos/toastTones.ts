import type ja from '../../ja/demos/toastTones';

export default {
  success: 'Success',
  saved: 'Saved',
  savedDetail: 'Everyone on the team can see your changes.',
  info: 'Info',
  update: 'A new version is available',
  warning: 'Warning',
  storage: 'Storage is almost full',
  storageDetail: 'Only 2% left. Please clear out old files.',
  error: 'Error',
  failed: 'Couldn’t send',
  failedDetail: 'The connection was lost. Please try again.',
  neutral: 'No icon',
  copied: 'Link copied',
  comments: {
    tones: 'The tone changes the icon and color. Color appears only on the icon and the meter (N-02)',
  },
} satisfies typeof ja;
