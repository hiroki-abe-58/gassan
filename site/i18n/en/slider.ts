import type ja from '../ja/slider';

export default {
  lead: 'Slider and RangeSlider. Underneath is a native range input; the thumb and fill are drawn in the theme’s accent color. Change the theme at the top right, and the sliders on this page change color too.',
  gallery: {
    title: 'Examples',
    intro: 'The fill runs up to the value. The track is inset by the thumb’s radius, so the end of the fill lines up with the center of the thumb.',
    items: {
      slider: 'Slider',
      value: 'Value shown beside it',
      range: 'Two thumbs',
      disabled: 'Disabled',
    },
    samples: {
      volume: 'Volume',
      opacity: 'Opacity',
      price: 'Price range',
      percent: '{0}%',
      yen: '¥{0}',
    },
  },
  modal: {
    title: 'Inside a modal',
    intro: 'How the value is expressed (formatValue) is used both for the display beside the slider and for what is announced (aria-valuetext).',
    exampleTitle: 'Search filters',
    exampleDescription: 'Pick the price range with two thumbs and the distance with one. On the keyboard, ←→ and Home / End work.',
  },
  theme: {
    title: 'Follows the theme',
    callout:
      'The colors of a native range belong to the browser, and inside a modal they stayed the default blue. Even with `accent-color`, the outline added to light colors and the shape of the thumb differ from browser to browser. gassan redraws the thumb and track, and makes the fill up to the value a `--g-accent` gradient. When a theme changes `--g-accent`, the thumb and fill change with it (I-10).',
  },
  a11yCaption: 'Specification items sliders satisfy',
} satisfies typeof ja;
