import type ja from '../../ja/demos/rangeReport';

export default {
  open: 'Export a report',
  title: 'Export a report',
  period: 'Date range',
  periodHelp: 'Choose a start date and an end date',
  format: 'Format',
  cancel: 'Cancel',
  submit: 'Export',
  comments: {
    presets: 'Common ranges come from commonDateRanges, with names looked up in labels.rangePreset (I-17)',
  },
} satisfies typeof ja;
