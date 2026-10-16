import type ja from '../ja/provider';

export default {
  lead: '库输出的文字无一例外都经过这里。默认是日语，并随附 englishLabels。支持只覆盖部分条目。',
  english: {
    title: '切换为英语',
    intro: '从“关闭”“正文结束”“第 2 步，共 5 步”到“需要同意”，供读屏播报的文字也全部替换。',
    exampleDescription: '在读完之前按下按钮，会用英语播报原因。',
  },
  why: {
    title: '越少出现的文字，越容易被写死',
    body: [
      '“注册完成之前的门控”的原因，曾经是写死的日语。即使用了 `englishLabels`，也只有那里会冒出日语。越少出现的文字越容易被写死，因此也最后才被发现（§10-21）。现在库输出的所有文字都集中在这里。',
    ],
    callout:
      '像步骤播报、档位名称这样要嵌入数字或名称的文字，以函数形式传入。语序因语言而异，所以不用字符串拼接来生成。',
  },
  a11yCaption: '与文字相关的规范',
} satisfies typeof ja;
