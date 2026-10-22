import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker 和 DateRangePicker 是弹出式日历，Calendar 和 RangeCalendar 是放在页面上的日历。它们都用颜色和名称标出日本的节假日和周末，并且可以从标题跳到其他月份和年份。月份名称和星期由 GassanProvider 的 locale 通过 Intl 生成，所以切换语言，日历也会跟着变。',
  gallery: {
    title: '示例',
    intro: '选中的日期用强调色填充，今天加上一个细圆环。周日和节假日为红色，周六为蓝色。',
    items: {
      datePicker: '日历',
      rangePicker: '日期范围',
      limited: '从今天起 30 天内',
      date: '日期（原生）',
      time: '时间（原生）',
      color: '颜色（原生）',
    },
  },
  inline: {
    title: '页面上的日历',
    intro: '像预约空位或营业日这样，想让用户边看日期边选择时，就放一个 Calendar。size="lg" 会撑满容器，并在日期下方写出节假日名称。',
    exampleTitle: '到店预约',
    exampleDescription: '周三是固定休息日，不能选择。带圆点的日期余位不多。',
  },
  range: {
    title: '日期范围',
    intro: '按开始日期 → 结束日期分两次确定。反过来按也会自动对调。选定结束日期之前，会用临时的色带显示到当前所指日期为止的范围。',
    exampleTitle: '导出报表',
    exampleDescription: '可以从左侧列表一次选好“最近 7 天”等范围。宽屏上并排显示两个月。',
    body: [
      '当前该选哪一端，会显示在日历下方，并用 `role="status"` 播报。范围两端的日期，会在可访问名称中加上“开始日期”“结束日期”。',
      '常用的范围（今天、昨天、最近 7 天、最近 30 天、本月、上个月）可以用 `commonDateRanges(useLabels())` 生成。名称取自 `labels.rangePreset`，所以切换语言时会一起变。',
    ],
  },
  holidays: {
    title: '节假日与周末',
    intro: '日本的节假日按年份套用当时有效的《关于国民节日的法律》来计算。不内置节假日表，所以只要法律不变，将来的年份也能查到。',
    tableCaption: (year: number): string => `${String(year)} 年的节假日与休息日`,
    head: { date: '日期', name: '名称' },
    body: [
      '包括补休日（2007 年起为“之后第一个不是休息日的日子”）、夹在两个节日之间的国民休息日、快乐星期一制度、东京 2020 奥运会的特例，以及令和元年天皇即位的休息日。春分节和秋分节用近似公式计算（正式日期在前一年的 2 月公布）。',
      '名称来自 `labels.holidays`。日语文字默认显示日本的节假日，英语文字默认不显示。每个部件都可以用 `holidays` 替换，传入 `null` 则不显示。要加上自己公司的休息日，就传入一个叠加在 `japaneseHolidayResolver()` 之上的函数。',
      '不只靠颜色传达。节假日名称会写进日期的可访问名称；在视觉上，小日历在下方一行显示当前所指日期的节假日，大日历则显示在日期下方。周日与节假日的红色（`--g-sunday`）和周六的蓝色（`--g-saturday`）对表面都有 4.5:1 以上。面向不按颜色区分星期的地区，只要把这两个令牌设为 `--g-fg` 即可。',
    ],
    codeCaption: '更改节假日的显示方式',
    code: "import { japaneseHolidayResolver, japaneseHoliday } from '@genelab/gassan';\n\n// 加上自己公司的休息日\nconst closed: Record<string, string> = { '2026-12-29': '年末休业', '2026-12-30': '年末休业' };\nconst holidays = (date: string) => closed[date] ?? japaneseHolidayResolver()(date);\n\n<Modal.DatePicker holidays={holidays} />\n\n// 不显示节假日\n<Modal.DatePicker holidays={null} />\n\n// 只查询某一天\njapaneseHoliday('2026-09-22'); // { date: '2026-09-22', key: 'citizens', name: \"国民の休日\" }（名称默认为日语）",
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
      { key: 'Enter / Space', action: '确定并关闭，回到按钮（选择范围时，第 1 次确定开始日期，第 2 次确定结束日期）' },
      { key: 'Esc', action: '不确定直接关闭，回到按钮（模态框不关闭）。在月份和年份列表中则返回上一级' },
    ],
    note: '按下标题（“2026年10月”）会显示月份列表，再按一次显示年份列表。在列表中也可以用方向键移动，按 Enter 进入下一级。按下“今天”回到今天。',
  },
  native: {
    title: '与原生日期输入的区分使用',
    body: [
      '在手机上，系统的日期滚轮往往更快。想让用户边看星期和节假日边选、想显示不可选的日期、想让用户选择日期范围、想让外观与其他部件一致时，就用 DatePicker。否则就把 `type="date"` 放进 Modal.Input。边框和明暗（`--g-color-scheme`）都会保持一致（I-15）。',
    ],
  },
  apiCaption: {
    datePicker: 'Modal.DatePicker',
    rangePicker: 'Modal.DateRangePicker',
    calendar: 'Modal.Calendar',
    rangeCalendar: 'Modal.RangeCalendar',
  },
  a11yCaption: '日期与时间满足的规范',
} satisfies typeof ja;
