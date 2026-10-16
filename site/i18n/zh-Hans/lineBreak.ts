import type ja from '../ja/lineBreak';

export default {
  lead: '不再出现「プロフィールを編｜集」。gassan 不会在词语中间给日语、中文、韩语的文字换行：日语只在文节边界，中文只在词语边界，韩语只在空格处断开。按钮、标题、表格单元格、图表摘要都是如此。',
  compare: {
    title: '用同样的宽度比较',
    intro:
      '左边是交给浏览器的结果，右边是 gassan。两边用的是同一个库，只是左边把 lineBreak 切换成了 `browser`。请更换示例的语言和宽度，看看在哪里换行。',
    language: '示例语言',
    width: (em: string): string => `容器宽度：${em}em`,
    labels: {
      buttons: '按钮',
      title: '标题',
      table: '表格',
      chart: '图表摘要',
      tableLabel: '变更记录示例',
    },
    notes: {
      ja: { browser: '按字符断开', phrase: '在文节边界处断开' },
      'zh-Hans': { browser: '在词语中间断开', phrase: '在词语边界处断开' },
      'zh-Hant': { browser: '在词语中间断开', phrase: '在词语边界处断开' },
      ko: { browser: '在词语（音节序列）中间断开', phrase: '只在空格处断开' },
      th: { browser: '用词典查找词语边界后断开', phrase: '不做处理（与浏览器相同）' },
      en: { browser: '在空格处断开', phrase: '不做处理（与浏览器相同）' },
    },
  },
  languages: {
    title: '各语言的处理方式',
    intro:
      '词与词之间不加空格的语言，交给浏览器时容易在词语中间断开。但如果对所有语言施加同样的处理，有些语言反而会出问题。我们在 Chrome 中把文字放进窄框，实测换行位置，按语言分别决定处理方式。',
    caption: '各语言交给浏览器时的换行与 gassan 的处理',
    head: { language: '语言', browser: '交给浏览器', gassan: 'gassan', why: '理由' },
    rows: [
      {
        language: '日语',
        browser: '按字符断开。「プロフィールを編｜集」「プロフィール｜を編集」',
        gassan: '只在文节边界处断开',
        why: '词与词之间没有空格，助词出现在行首时难以阅读。',
      },
      {
        language: '中文（简体、繁体）',
        browser: '在词语中间断开。「编辑个人资｜料」「保存更改并关｜闭」',
        gassan: '只在词语边界处断开',
        why: '排版中按字符换行是惯例，但在简短的 UI 文字中，词语的最后一个字会掉到下一行。',
      },
      {
        language: '韩语',
        browser: '在词语中间断开。「프로필 편｜집」「삭제｜하면」',
        gassan: '只在空格处断开',
        why: '词语已由空格分隔，所以不加标记，只给容器加上 `keep-all`。',
      },
      {
        language: '泰语、老挝语、高棉语、缅甸语',
        browser: '用词典查找词语边界后断开（不会在词语中间断开）',
        gassan: '不做处理',
        why: '加上 `keep-all` 后，连浏览器找到的词语边界也会消失，反而在词语中间断开（实测）。',
      },
      {
        language: '英语等用空格分隔词语的语言',
        browser: '在空格处断开',
        gassan: '不做处理',
        why: '浏览器的换行本来就是正确的。',
      },
    ],
    note: '无论哪种语言，读屏读出的名称和复制得到的文字都保持不变。判定依据是字符的种类，所以即使忘了加 `lang` 属性，行为也一样。',
  },
  modal: {
    title: '在真实的模态框中',
    intro: '宽度 360px 的模态框。取消勾选后会回到交给浏览器的方式。',
    exampleTitle: '窄模态框中的换行',
    exampleDescription: '对比底部按钮、标题和表格单元格。读屏读出的名称两边都一样。',
  },
  try: {
    title: '输入文字试一试',
    intro: '可以当场确认在哪里分开。',
    input: '要试的文字',
    resultLabel: '切分结果',
    split: (count: number): string => `分成了 ${String(count)} 段。换行只会发生在这些边界处。`,
    single: '只有一个文节（词语）的文字，不放置标记。',
    korean: '韩文只在空格处换行。gassan 只给容器加 keep-all，不添加标记。',
    untouched: '英语、泰语等不做处理。浏览器会通过空格或词典找到词语边界。',
  },
  how: {
    title: '工作原理',
    steps: [
      {
        title: '看字符种类',
        body: '含假名的按日语处理，含韩文的按韩语处理，两者都没有但含汉字的按中文处理。其他（英语、泰语等）不做处理。',
      },
      {
        title: '切分词语',
        body: '用浏览器和 Node 自带的 `Intl.Segmenter` 取出词语边界作为候选。不增加依赖。',
      },
      {
        title: '只保留可以断开的位置',
        body: '日语按字符种类的规则归并成文节（平假名之后开始出现汉字、片假名、英文数字时，标点或右括号之后，等等。送假名、「お」「ご」、数字与单位之间不断开）。中文使用词典给出的词语边界，单字词并入前后的词语。韩语直接以空格为边界。',
      },
      {
        title: '在边界处放置标记',
        body: '在边界处插入 `<wbr aria-hidden="true">`。不增加任何字符，所以复制、搜索得到的都是原文。',
      },
      {
        title: '只在那里断开',
        body: '给容器加上 `word-break: keep-all`，字符之间不断开。只有当一个文节比容器还长时，才用 `overflow-wrap: break-word` 按字符断开。',
      },
    ],
    cssComments: {
      keepAll: '字符之间不断开',
      breakWord: '只有一个文节比容器还长时才按字符断开',
      strict: '此时也不让小写假名、长音符出现在行首',
    },
  },
  name: {
    title: '不污染读屏内容',
    intro: '即使改变了换行位置，读屏软件读出的名称和复制得到的文字也不变。',
    body: [
      '普通的 `<wbr>` 在 Chrome 的无障碍树中会作为空格混入名称。`<button>プロフィールを<wbr>編集</button>` 会被读成「プロフィールを 編集」，而画面上的文字（`innerText`）里明明没有空格。我们在真实浏览器中实测了 3 种方式后做出选择。',
    ],
    tableLabel: '方式比较',
    caption: '换行标记的加法及其结果',
    head: { method: '方式', name: '读屏读出的名称', breaks: '能否在文节处断开', long: '过长的文节' },
    rows: [
      { method: '`<wbr aria-hidden="true">` ＋ keep-all（采用）', name: '保持原样', breaks: '能', long: '不溢出' },
      { method: '每个文节的 span 加 white-space: nowrap', name: '保持原样', breaks: '能', long: '溢出' },
      { method: '每个文节的 span 加 word-break: keep-all', name: '保持原样', breaks: '不能（按字符）', long: '—' },
      { method: '普通的 `<wbr>`', name: '混入空格', breaks: '能', long: '不溢出' },
    ],
    callout: '不使用零宽空格。它看不见，却作为字符留在文本中，复制的文字、搜索、与输入值的比较都会悄无声息地出错。',
  },
  use: {
    title: '用法',
    intro: '在 gassan 的组件中，什么都不用写，换行就已经整齐。对 gassan 之外的 UI，可以用 Phrase 获得同样的换行效果。',
    codeComments: {
      outside: '也作用于 gassan 之外的按钮和标题',
      revert: "交还给浏览器处理（默认为 'phrase'）",
    },
    body: [
      '服务端和客户端在相同的位置放置标记，因此 hydration 不会出现偏差。CSS 的 `word-break: auto-phrase` 是在浏览器端解决同一问题的机制，但支持的浏览器和语言有限，换行位置也因浏览器而异。gassan 在任何浏览器中都在相同的位置断开。',
    ],
  },
  spec: {
    title: '换行的条目',
    caption: '换行的规范',
  },
} satisfies typeof ja;
