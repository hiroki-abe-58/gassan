import type ja from '../../ja/demos/sliderForm';

export default {
  open: 'Search filters',
  title: 'Search filters',
  price: 'Price range',
  yen: '¥{0}',
  distance: 'Distance from the station',
  km: 'Within {0} km',
  cancel: 'Cancel',
  apply: 'Search with these filters',
  comments: {
    range: 'Two thumbs are two stacked range inputs, named “Minimum” and “Maximum”. The group’s name is the legend (I-10)',
    format: 'formatValue is used both for the display beside the slider and for aria-valuetext',
  },
} satisfies typeof ja;
