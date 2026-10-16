import type ja from '../ja/button';

export default {
  lead: 'primary、secondary、tertiary 三级，加上用于无法挽回操作的 danger。可按、处理中、门控中、不可用这些状态，不只靠颜色，也能从形状上区分。',
  variants: {
    title: '种类',
    intro: '用轻重不同的三级，让人一眼看出按哪个才能继续。一个底部区域中每种最多放一个。',
    items: {
      primary: {
        label: '发布',
        role: '完成该界面目的的操作。一个界面只有一个（F-01）。',
        look: '强调色的填充，配上与之匹配的文字颜色。',
        reasons: [
          '同样大小时，填充最引人注目。为了把视线最先停留的地方限定为一处，只给 primary 填充。',
          '文字与填充之间达到 4.5:1 以上。即使用站点主题换了颜色，也由计算来保证。',
          '放在一行的最后。DOM 顺序 = 视觉顺序 = Tab 顺序，所以它会出现在读完的位置（F-02）。也可以用 ⌘ / Ctrl + Enter 按下（F-10）。',
        ],
      },
      secondary: {
        label: '保存草稿',
        role: '与 primary 并列的另一个选项，例如保存草稿、返回。',
        look: '不填充，用较深的轮廓和与正文相同的文字颜色。',
        reasons: [
          '不填充以表明它与 primary 的主次关系，用轮廓表明可点击的范围。',
          '让人认出这是按钮的线索由文字承担（与正文同色，4.5:1 以上）。轮廓只是体现主次的辅助；在提高对比度的设置（prefers-contrast: more）下，连文字颜色也会加深。',
        ],
      },
      tertiary: {
        label: '算了',
        role: '退出类操作，例如算了、稍后、查看详情。',
        look: '既无填充也无轮廓，文字颜色与补充说明相同。放在一行的最左端并分开（F-03）。',
        reasons: [
          '外观最弱，位置也远离 primary，以免匆忙时按错。',
          '即使是补充说明的文字颜色，对表面也有 4.5:1 以上。',
          '只收紧左右内边距，高度保持 44px（F-05）。外观接近文字，可点击面积却不减少。',
        ],
      },
      danger: {
        label: '删除',
        role: '无法挽回的操作。代替 primary 使用。',
        look: '保持在 primary 的位置，红色填充。',
        reasons: [
          '不改位置，只改颜色（F-06）。这样按惯常位置的肌肉记忆就不会让人按到别的操作。',
          '不把初始焦点放在这个按钮上（K-05）。按一次 Enter 就无法挽回。',
          '不只靠红色，还用标签中的动词说明会发生什么。即使分辨不清颜色，读一下也能明白。',
        ],
      },
    },
  },
  states: {
    title: '状态',
    intro: '6 种状态在全部 4 个种类上都画了出来。下面的比值是当场测量当前画面上所绘颜色得出的。切换主题会重新测量。',
    look: '外观',
    why: '依据',
    items: {
      rest: {
        name: '可按',
        api: '默认',
        look: '各种类的基本外观。指针会变成手指形状。',
        why: '可按的按钮即使种类不同，也有相同的高度（44px，粗指针下为 48px）和圆角。统一可按之物的形状，与不可按之物区分开。',
      },
      hover: {
        name: '指针悬停',
        api: ':hover',
        look: 'secondary 和 tertiary 铺上一层浅色背景。primary 和 danger 不改填充，用阴影抬起。',
        why: '如果让填充按钮的背景变亮或变暗，主题中刚好卡在 4.5:1 的颜色就会让文字对比度不达标。所以用阴影而不是颜色来反馈。',
      },
      focus: {
        name: '通过键盘到达',
        api: ':focus-visible',
        look: '在距按钮 2px 处画一个 2px 的环。',
        why: '因为隔开绘制，即使是填充按钮，焦点环也不会融进填充色。焦点环对表面达到 3:1 以上（K-07）。用鼠标按下时不会出现。',
      },
      loading: {
        name: '处理中',
        api: 'onAction 返回 Promise / loading',
        look: '把标签设为透明并叠上加载指示器。宽度不变。',
        why: '按了也不会有任何反应（防止重复提交，F-08）。标签用 `opacity: 0` 隐藏，所以读屏读出的名称仍在。如果用 `visibility: hidden`，名称会一起消失，变成没有名称的按钮（F-07）。加载指示器不是文字，要求 3:1 以上。',
      },
      gated: {
        name: '门控中（条件满足后可按）',
        api: 'gate',
        look: '灰色填充（secondary 和 tertiary 为细轮廓）。文字清晰可读。',
        why: '用 `aria-disabled` 而不是 `disabled`（G-01）。可以获得焦点，按下时播报原因并把用户带到卡住的位置（G-07 / G-08）。既然能获得焦点，就不能依赖 WCAG“非活动状态不在要求范围内”的规定，所以不用 `opacity` 调淡，而是保持 4.5:1（G-10）。',
      },
      unavailable: {
        name: '不可用',
        api: 'unavailable',
        look: '去掉填充，改为虚线轮廓。',
        why: '真正的 `disabled`，只在没有权限等、在这个界面上无论如何都不能按的时候使用。也不会获得焦点。为了在形状上与门控中（有填充的灰色）区分，使用虚线。虽不在 WCAG 要求范围内，但文字仍保持与补充说明同色、可阅读的对比度。',
      },
    },
    callout:
      '状态不只靠颜色传达。阴影、焦点环、加载指示器、有填充的灰色、虚线，形状全都不同。即使是难以分辨颜色的人，或在强制颜色模式（Windows 的高对比度）下，也能区分。',
  },
  measure: {
    ink: '文字',
    spinner: '加载指示器',
    ring: '焦点环',
    exempt: '（不在要求范围内）',
    meets: (min: number): string => `（标准 ${String(min)}）`,
    fails: (min: number): string => `（未达标准 ${String(min)}）`,
  },
  gated: {
    title: '区分门控中与不可用',
    intro: '两者都是“现在按不了”，区别在于有没有办法变成可按。gassan 几乎不用 disabled。',
    tableCaption: '门控中与不可用的区别',
    aspect: '角度',
    gated: '门控中',
    unavailable: '不可用',
    rows: [
      { aspect: '写法', gated: 'gate（aria-disabled）', unavailable: 'unavailable（disabled）' },
      { aspect: '焦点', gated: '能获得', unavailable: '不能获得' },
      { aspect: '按下后', gated: '播报原因，并把用户带到卡住的位置', unavailable: '什么也不发生' },
      { aspect: '外观', gated: '灰色填充', unavailable: '虚线轮廓' },
      { aspect: '文字对比度', gated: '保持 4.5:1（G-10）', unavailable: '不在 WCAG 要求范围内，但仍保持可读的对比度' },
      { aspect: '使用场景', gated: '读完、同意、输入齐全后即可按', unavailable: '没有权限等，在这个界面上按不了' },
    ],
    body: [
      '`disabled` 的按钮无法获得焦点。键盘和读屏软件的用户既不知道按钮的存在，也不知道为什么按不了。把“满足条件就能按”的按钮设为 `disabled`，就只有这些人无法继续。',
    ],
    exampleTitle: '试着按一下门控中的按钮',
    exampleDescription: '选择话题之前，“按此内容保存”处于门控中。按下会播报原因，并把焦点移到选项上。',
  },
  live: {
    title: '实际按一按',
    intro: '处理中时，按多少次都只会执行一次。',
    exampleTitle: '发布文章',
    exampleDescription: '按 tertiary、secondary、primary 由弱到强排列的底部区域。试着连续点击“发布”。',
  },
  size: {
    title: '大小与摆放',
    rules: [
      {
        title: '高度至少 44px',
        body: '比 WCAG 2.5.8 的最低 24px 更严格，与 Apple 的 44pt 一致。在用手指触摸的设备（`pointer: coarse`）上为 48px（F-05）。',
      },
      {
        title: '由弱到强书写',
        body: '按 tertiary → secondary → primary 的顺序写，DOM 顺序、视觉顺序、Tab 顺序就能一致（F-02）。窄屏上保持同样的顺序纵向堆叠，不反转（F-04）。',
      },
      {
        title: '标签按文节换行',
        body: '即使标签在窄屏上变成 2 行，也像「プロフィールを｜編集」那样在文节边界处断开。参见[日语换行](#/styles/line-break)。',
      },
      {
        title: '用动词说明结果',
        body: '不用“确定”“是”，而用“发布”“删除”。只读按钮本身，也能知道按下后的结果。',
      },
    ],
  },
  a11yCaption: '按钮满足的规范',
} satisfies typeof ja;
