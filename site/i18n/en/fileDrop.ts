import type ja from '../ja/fileDrop';

export default {
  lead: 'FileDrop is a drop zone for files. Underneath is a native file input stretched across the whole zone, so files can be chosen by clicking, with Enter / Space, or by dropping.',
  gallery: {
    title: 'Examples',
    intro: 'Chosen files are listed by name and size, and can be removed one at a time.',
    items: {
      single: 'Single file',
      multiple: 'Multiple (images only)',
      disabled: 'Disabled',
    },
  },
  modal: {
    title: 'Inside a modal',
    intro: 'Underneath is a native input, so the label of Modal.Field becomes its name as is.',
    exampleTitle: 'Submit documents',
    exampleDescription: 'Accepts only PDFs and images. Dropping any other format is reported as an error.',
  },
  reject: {
    title: 'Files that don’t match',
    callout:
      'Dropped files bypass the native `accept`. gassan applies the same rules (extensions, wildcards like `image/*`, and MIME types) and passes the files that fail to `onReject`. How to report them is left to the `error` of `Modal.Field` (I-14).',
  },
  a11yCaption: 'Specification items the file drop zone satisfies',
} satisfies typeof ja;
