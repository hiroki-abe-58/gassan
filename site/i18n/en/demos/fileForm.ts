import type ja from '../../ja/demos/fileForm';

export default {
  open: 'Submit documents',
  title: 'Submit documents',
  documents: 'Identity documents',
  documentsHelp: 'PDF or images. You can select several at once',
  rejected: 'Unsupported format: {0}',
  cancel: 'Cancel',
  submit: 'Submit',
  comments: {
    reject: 'Drops bypass accept, so gassan applies the same rules. Files that fail go to onReject (I-14)',
  },
} satisfies typeof ja;
