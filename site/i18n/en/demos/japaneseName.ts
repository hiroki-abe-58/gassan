import type ja from '../../ja/demos/japaneseName';

export default {
  label: 'Name',
  hint: 'Type “やまだ” with the IME and convert it to “山田”, and “ヤマダ” goes into “Family name (kana)”. Once you edit the furigana, it is no longer filled in automatically.',
  comments: {
    fields: 'When a name is typed with the IME, the kana before conversion goes into the furigana (the reading is a guess, so the furigana can always be edited)',
  },
} satisfies typeof ja;
