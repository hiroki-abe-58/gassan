import type ja from '../../ja/demos/toastPromise';

export default {
  succeed: 'Save (succeeds)',
  fail: 'Save (fails)',
  loading: 'Saving…',
  success: 'Saved',
  error: 'Couldn’t save: {0}',
  reason: 'The server is not responding',
  comments: {
    promise: 'Show loading while the task runs, then replace it in place when it finishes (N-07)',
  },
} satisfies typeof ja;
