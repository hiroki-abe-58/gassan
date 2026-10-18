import type ja from '../ja/select';

export default {
  lead: 'Select 是连列表都由 gassan 绘制的下拉选择，Combobox 是可以输入筛选的下拉选择。列表通过 popover 显示在 top layer，所以既不会被模态框的 transform 裁切，也不会被正文的滚动裁切。',
  gallery: {
    title: '示例',
    intro: '箭头放在边框内边距的内侧。原生 select 即使加了 padding，也会把箭头紧贴在右端绘制。',
    items: {
      select: '下拉选择',
      placeholder: '未选择',
      combobox: '组合框',
      invalid: '错误',
      disabled: '不可用',
    },
    samples: {
      sizeLabel: '尺寸',
      sizeS: '小（360px）',
      sizeM: '中（520px）',
      sizeL: '大（720px）',
      cityLabel: '城市',
      citySapporo: '札幌',
      cityTokyo: '东京',
      cityNagoya: '名古屋',
      cityOsaka: '大阪',
      cityFukuoka: '福冈',
    },
  },
  modal: {
    title: '在模态框中',
    intro: '列表展开时按 Esc 只关闭列表，不关闭模态框。',
    exampleTitle: '选择收货地址',
    exampleDescription: '国家可以输入筛选。匹配时不区分大小写和全角/半角。',
  },
  keys: {
    title: '键盘操作',
    tableCaption: 'Select 和 Combobox 的键盘操作',
    head: { key: '按键', select: 'Select', combobox: 'Combobox' },
    rows: [
      { key: '↓ / ↑', select: '打开。已打开时移到上一项或下一项', combobox: '打开。已打开时移到上一项或下一项' },
      { key: 'Home / End', select: '移到第一个或最后一个选项', combobox: '移到输入框的开头或末尾（原生行为）' },
      { key: '字符', select: '跳到以该字符开头的选项', combobox: '筛选，并指向第一个候选项' },
      { key: 'Enter', select: '确定并关闭', combobox: '确定当前指向的候选项（输入法组字中不确定）' },
      { key: 'Space', select: '确定并关闭（逐字查找途中当作字符处理）', combobox: '输入空格' },
      { key: 'Tab', select: '确定当前指向的选项，并移到下一处', combobox: '完全一致时确定，否则恢复原状并移到下一处' },
      { key: 'Esc', select: '只关闭列表', combobox: '只关闭列表' },
    ],
  },
  a11yCaption: '下拉选择与组合框满足的规范',
} satisfies typeof ja;
