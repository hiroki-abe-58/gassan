import type ja from '../../ja/demos/japaneseBirthDate';

export default {
  label: 'Date of birth',
  help: 'Alcohol is sold only to people aged 20 or older',
  underage: 'You can’t apply if you are under 20',
  comments: {
    age: 'Check the requirement against age in completed years (it goes up by 1 on the birthday)',
  },
} satisfies typeof ja;
