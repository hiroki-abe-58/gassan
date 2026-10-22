import type ja from '../../ja/demos/dateForm';

export default {
  open: '預約',
  title: '預約',
  date: '日期',
  dateHelp: '今天以後',
  time: '時間',
  timeHelp: '11:00〜21:00，間隔 15 分鐘',
  people: '人數',
  peopleUnit: '位',
  cancel: '取消',
  submit: '預約',
  comments: {
    today: '以裝置時間計算的今天（YYYY-MM-DD）。sv-SE 會輸出這種格式',
    calendar: '月曆顯示在 top layer。月份名稱與星期來自 labels.locale 的 Intl（I-13）',
    time: '時間從時與分的欄中選擇。不符合間隔的時間與營業時間以外的時間無法選擇（I-20）',
  },
} satisfies typeof ja;
