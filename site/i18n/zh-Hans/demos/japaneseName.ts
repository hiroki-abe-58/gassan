import type ja from '../../ja/demos/japaneseName';

export default {
  label: '姓名',
  hint: '用输入法输入「やまだ」并转换为「山田」后，“姓（片假名）”中会填入「ヤマダ」。修改振假名后，之后就不再自动填写。',
  comments: {
    fields: '用输入法输入姓名时，把转换前的假名填入振假名（读音是推测出来的，所以振假名随时可以修改）',
  },
} satisfies typeof ja;
