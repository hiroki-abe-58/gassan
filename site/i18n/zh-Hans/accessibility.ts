import type ja from '../ja/accessibility';

export default {
  lead: '浏览器做的事不插手，浏览器不做的事全部承担。gassan 的无障碍由这两部分构成。',
  native: {
    title: '交给浏览器的事',
    intro: '由 showModal() 负责。自己实现必然会有疏漏，所以不写才是正解。',
    tableCaption: '委托给原生实现的条目',
    callout:
      '也不加 `aria-modal`。`showModal()` 的 top layer 与 inert 已有同等以上的效果，重复指定反而会让部分读屏软件的行为不稳定（A-03）。',
  },
  name: {
    title: '名称不会残缺',
    body: [
      '对话框的名称通过 `aria-labelledby` 指向 `<h2>` 内部的 `<span>`。长标题的省略只用 CSS 的 `line-clamp`，不截断 DOM 中的文字。因此即使画面上在第 2 行被截断，读屏读出的名称也始终完整。',
    ],
    mockLong: '更改第三季度东北地区各门店销售报告的共享设置',
    mockToggle: '显示全文',
    mockCut: '更改第三季度东北地区各门店销…',
    mockTooltip: 'title 属性的提示框',
    do: '用 CSS 省略，只在溢出时显示明确的切换按钮。切换按钮的文字放在名称的 span 之外（T-03 / T-08）。',
    dont: "不要用 JS 写 `title.slice(0, 30) + '…'` 来截断，名称也会一起残缺。把后半部分挪到 `title` 属性里也不行：触摸时不会出现，不满足 WCAG 1.4.13（T-05）。",
  },
  gate: {
    title: '按不下去的原因，按一下就能问到',
    body: [
      '满足条件之前不能按的按钮，不使用 `disabled`。`disabled` 无法获得焦点，键盘和读屏软件的用户就连弄清“为什么无法继续”的手段都失去了。gassan 改用 `aria-disabled="true"`，按下时播报原因，并把用户带到卡住的位置。',
    ],
    mockTitle: '服务条款更新',
    mockButton: '同意并继续',
    mockNote: '请勾选同意',
    do: '`aria-disabled` + 始终可见的原因 + 按下时的播报与引导（G-01 / G-07 / G-08）。外观用专用令牌保持 4.5:1（G-10）。',
    dont: '不要用 `disabled` 加 `opacity: .4` 了事。既不知道原因，文字也看不清。',
  },
  read: {
    title: '“已读完”用逻辑或判定',
    intro:
      '如果只凭滚动位置判定“已读”，用虚拟光标阅读的用户不会触发 scroll 事件，就永远无法继续。',
    signals: [
      { who: '鼠标、触摸、滚轮', signal: '正文末尾的哨兵元素进入了可视区域' },
      { who: '键盘、读屏软件', signal: '焦点到达了末尾的标记（“正文结束”）' },
      { who: '大屏幕、短正文', signal: '高度本来就不需要滚动（仅在能测量时判定）' },
    ],
    chips: '读完门控的规范',
  },
  focus: {
    title: '焦点放在哪里',
    mockTitle: '邀请成员',
    mockButton: '邀请',
    do: '打开后焦点立即放在面板本身（K-03）。读屏软件可以从标题开始依次朗读。',
    dont: '在触屏设备上不要把焦点放到第一个输入框。虚拟键盘会弹起，遮住正文（K-04）。放在 × 按钮上也会让人跳过正文，同样避免。',
  },
  tables: {
    title: '键盘与辅助技术的条目',
    keyboardCaption: '键盘/焦点的条目',
    assistiveCaption: '辅助技术的条目',
  },
  preferences: {
    title: '遵循用户的设置',
    tableCaption: '跟随操作系统与浏览器设置的条目',
  },
} satisfies typeof ja;
