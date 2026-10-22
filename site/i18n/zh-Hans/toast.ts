import type ja from '../ja/toast';

export default {
  lead: '在不打扰工作的前提下，告知处理已完成的通知。调用 `toast()` 后，它会出现在屏幕边缘，底部的计时条随剩余时间缩短，时间一到就关闭。也可以用 ×、Esc 或横向轻扫关闭。即使模态框处于打开状态，它也会显示在模态框之上，并且可以操作。',
  tones: {
    title: '示例',
    intro: '图标与颜色分为成功、信息、警告、失败 4 种，外加无图标的默认样式。颜色只用在图标和计时条上，表面与其他部件相同（不用加框的方式强调）。',
    exampleTitle: '色调的区别',
    exampleDescription: '按下按钮，轻提示会出现在右下角。指针悬停在上面时，计时条会暂停。',
  },
  meter: {
    title: '剩余时间的计时条',
    intro: '底部的线按剩余时间的比例缩短。浅色的底条显示总长度，所以一眼就能看出还有多久会消失。',
    body: [
      '指针悬停在上面时、焦点位于其中时、标签页被隐藏时、正在用手指拖动时，时间和计时条都会暂停。不会在用户阅读途中消失（WCAG 2.2.1 / 2.2.2）。恢复后从暂停前的剩余时间继续计时。',
      '计时条是传达剩余时间的信息，所以即使把动效级别设为 `none` 也不会停止。在系统的“减弱动态效果”设置下，不平滑缩短，而是每秒跳一格。',
      '时间可以用 `duration`（ms）修改。传入 `Infinity` 时不会按时间关闭，也不显示计时条。',
    ],
    tableCaption: '默认时长',
    head: { kind: '类型', duration: '时长' },
    rows: [
      { kind: '无图标、成功、信息', duration: '5 秒' },
      { kind: '警告、失败', duration: '8 秒（留出重读的时间）' },
      { kind: '带按钮的', duration: '10 秒以上（留出去按按钮的时间）' },
      { kind: '加载中（toast.promise）', duration: '不按时间关闭' },
    ],
  },
  action: {
    title: '撤销',
    intro: '对于可以撤销的操作，与其用确认模态框拦下，不如立即执行，并在轻提示上附上“撤销”，这样更快。按钮只能放一个。',
    exampleTitle: '删除草稿',
    exampleDescription: '删除会立即生效。在 10 秒内按下“撤销”即可恢复。',
  },
  promise: {
    title: '处理期间',
    intro: '`toast.promise` 在处理期间显示加载中的轻提示（不按时间关闭），完成后在同一位置替换为成功或失败。',
    exampleTitle: '保存',
    exampleDescription: '可以分别试试耗时 1.5 秒的保存成功和失败两种情况。',
  },
  position: {
    title: '显示位置',
    intro: '上下两排各有左、中、右，共 6 个位置。默认是右下（在从右向左书写的语言中是左下）。显示在上方时，新的放在最上面，让视觉顺序与播报顺序一致。',
    choose: '显示位置',
    labels: {
      'top-start': '左上',
      'top-center': '上方',
      'top-end': '右上',
      'bottom-start': '左下',
      'bottom-center': '下方',
      'bottom-end': '右下',
    },
    try: '显示试试',
    message: (place: string): string => `已在${place}显示`,
    body: [
      '同时显示的数量上限为 `max`（默认 3）。超出时从最旧的开始关闭。关闭后，其余的会滑动填补空隙。',
      '进出的动画遵循动效级别的令牌。在 `expressive` 下从边缘以弹簧效果进入，在 `none` 下不移动，直接出现和消失。',
    ],
  },
  modal: {
    title: '模态框之上',
    intro: '模态框打开期间，模态框之外的元素无法按下，也不会被播报（即使显示在 top layer 中也一样）。因此模态框打开时，轻提示会移入最上层的对话框中，在其上方重新显示。',
    exampleTitle: '在模态框中复制',
    exampleDescription: '轻提示显示在模态框之上，可以用 × 关闭。在轻提示上按 Esc，模态框也不会关闭。',
    body: ['移入之后，剩余时间和计时条会接着走。关闭模态框后，轻提示会回到原来的位置。'],
  },
  keys: {
    title: '操作',
    tableCaption: '轻提示的操作',
    head: { key: '操作', action: '动作' },
    rows: [
      { key: 'Tab', action: '移到轻提示的按钮。焦点位于其中时，时间暂停' },
      { key: 'Esc', action: '关闭有焦点的轻提示（不关闭模态框）' },
      { key: 'Enter / Space', action: '按下按钮（撤销、×）。关闭后焦点移到相邻的轻提示；如果是最后一个，则回到原来的位置' },
      { key: '横向轻扫', action: '朝轻扫的方向滑出并关闭（超过宽度的 35%，或快速轻扫）' },
    ],
  },
  host: {
    title: '放置方式',
    body: [
      '在应用根部只放一个 `<ToastHost />`。无论从哪里调用 `toast()`，都会渲染到那里。没有宿主时调用，开发时会给出警告。',
      '通知区域是名为“通知”的地标，带有 `aria-live="polite"`。没有轻提示时也保留该区域（实时播报区域要先于内容存在，才能确保被播报）。',
    ],
  },
  apiCaption: {
    functions: 'toast 的函数',
    head: { call: '调用方式', returns: '返回值', description: '说明' },
    rows: [
      { call: 'toast(message, options?)', returns: 'id', description: '显示无图标的轻提示。可用 options.tone 选择色调' },
      { call: 'toast.success / info / warning / error(message, options?)', returns: 'id', description: '以指定的色调显示' },
      { call: 'toast.promise(promise, messages, options?)', returns: 'Promise', description: '处理期间显示加载中，完成后替换。原样返回传入的 Promise' },
      { call: 'toast.dismiss(id?)', returns: '—', description: '关闭。省略 id 则全部关闭' },
    ],
  },
  a11yCaption: '轻提示满足的规范',
} satisfies typeof ja;
