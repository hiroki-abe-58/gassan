import type ja from '../../ja/demos/rangeReport';

export default {
  open: '导出报表',
  title: '导出报表',
  period: '日期范围',
  periodHelp: '选择开始日期和结束日期',
  format: '格式',
  cancel: '取消',
  submit: '导出',
  comments: {
    presets: '常用的范围用 commonDateRanges 生成。名称取自 labels.rangePreset（I-17）',
  },
} satisfies typeof ja;
