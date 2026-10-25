import type ja from '../../ja/demos/japaneseName';

export default {
  label: '姓名',
  hint: '以輸入法輸入「やまだ」並轉換成「山田」後，「姓（片假名）」會填入「ヤマダ」。修改振假名後，之後就不再自動填入。',
  comments: {
    fields: '以輸入法輸入姓名時，把轉換前的假名填入振假名（讀音是推測出來的，所以振假名隨時都能修改）',
  },
} satisfies typeof ja;
