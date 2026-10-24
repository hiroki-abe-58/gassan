import type ja from '../../ja/demos/dateForm';

export default {
  open: '预约',
  title: '预约',
  date: '日期',
  dateHelp: '今天及以后',
  time: '时间',
  timeHelp: '11:00〜21:00，间隔 15 分钟',
  people: '人数',
  peopleUnit: '人',
  cancel: '取消',
  submit: '预约',
  comments: {
    today: '按设备时间计算的今天（YYYY-MM-DD）。sv-SE 会输出这种格式',
    calendar: '日历显示在 top layer。月份名称和星期来自 labels.locale 的 Intl（I-13）',
    time: '时间从时和分的列中选择。不符合间隔的时间和营业时间以外的时间不能选（I-20）',
  },
} satisfies typeof ja;
