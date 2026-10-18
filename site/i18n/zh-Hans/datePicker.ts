import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker 用日历选择日期。时间和颜色则把原生输入控件放进 Modal.Input 的边框里。月份名称和星期由 GassanProvider 的 locale 通过 Intl 生成，所以切换语言，日历也会跟着变。',
  gallery: {
    title: '示例',
    intro: '选中的日期用强调色填充，今天加上一个细圆环。',
    items: {
      datePicker: '日历',
      limited: '从今天起 30 天内',
      date: '日期（原生）',
      time: '时间（原生）',
      color: '颜色（原生）',
    },
  },
  modal: {
    title: '在模态框中',
    intro: '日历通过 popover 显示在 top layer。Esc 只关闭日历，并把焦点送回按钮。',
    exampleTitle: '预约',
    exampleDescription: '日期用日历选，时间用原生输入控件选。不能选择过去的日期。',
  },
  keys: {
    title: '键盘操作',
    tableCaption: '日历的键盘操作',
    head: { key: '按键', action: '动作' },
    rows: [
      { key: '← / →', action: '前一天、后一天' },
      { key: '↑ / ↓', action: '上一周、下一周' },
      { key: 'Home / End', action: '本周的第一天、最后一天' },
      { key: 'PageUp / PageDown', action: '上个月、下个月（月末对齐到该月最后一天）' },
      { key: 'Shift + PageUp / PageDown', action: '上一年、下一年' },
      { key: 'Enter / Space', action: '确定并关闭，回到按钮' },
      { key: 'Esc', action: '不确定直接关闭，回到按钮（模态框不关闭）' },
    ],
  },
  native: {
    title: '与原生日期输入的区分使用',
    body: [
      '在手机上，系统的日期滚轮往往更快。想让用户边看星期边选、想显示不可选的日期、想让外观与其他部件一致时，就用 DatePicker。否则就把 `type="date"` 放进 Modal.Input。边框和明暗（`--g-color-scheme`）都会保持一致（I-15）。',
    ],
  },
  a11yCaption: '日期与时间满足的规范',
} satisfies typeof ja;
