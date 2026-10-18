import type ja from '../../ja/demos/dateForm';

export default {
  open: '预约',
  title: '预约',
  date: '日期',
  dateHelp: '今天及以后',
  time: '时间',
  people: '人数',
  peopleUnit: '人',
  cancel: '取消',
  submit: '预约',
  comments: {
    today: '按设备时间计算的今天（YYYY-MM-DD）。sv-SE 会输出这种格式',
    calendar: '日历显示在 top layer。月份名称和星期来自 labels.locale 的 Intl（I-13）',
    native: '时间把原生输入控件放进同样的边框（I-15）',
  },
} satisfies typeof ja;
