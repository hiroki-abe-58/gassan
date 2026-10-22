import type ja from '../../ja/demos/bookingCalendar';

export default {
  label: '到店日期',
  selected: '已選擇 {0}',
  empty: '請選擇日期',
  comments: {
    today: '以裝置時間計算的今天（YYYY-MM-DD）。sv-SE 會輸出這種格式',
    large: 'size="lg" 會撐滿容器，並在日期下方寫出國定假日的名稱。公休日無法選擇，有圓點的日期名額所剩不多（I-16 / I-19）',
  },
} satisfies typeof ja;
