import type ja from '../../ja/demos/bookingCalendar';

export default {
  label: '到店日期',
  selected: '已选择 {0}',
  empty: '请选择日期',
  comments: {
    today: '按设备时间计算的今天（YYYY-MM-DD）。sv-SE 会输出这种格式',
    large: 'size="lg" 会撑满容器，并在日期下方写出节假日名称。固定休息日不能选择，带圆点的日期余位不多（I-16 / I-19）',
  },
} satisfies typeof ja;
