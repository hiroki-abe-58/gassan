import type ja from '../../ja/demos/chatAssistant';

export default {
  label: '与 AI 助手的对话',
  me: '你',
  bot: '助手',
  greeting: '想查些什么？',
  sales: '总结一下上个月的销售额',
  salesDescription: '与前一个月比较，也说明增长的原因',
  churn: '为什么客户流失变多了？',
  churnDescription: '按套餐和时期分开来看',
  mail: '给未付款的客户写一封通知',
  mailDescription: '措辞礼貌、简短',
  answer:
    '上个月的销售额为 2,140 万日元，比前一个月增长了 8%。增长部分的六成来自 10 月推出的按年付费套餐。另外，从 Pro 升级到 Business 的工作区也有 14 个，席位数随之增加。另一方面，从 Free 转为 Pro 的比例下降了 0.4 个百分点，因此试用期的引导还有改进的余地。',
  placeholder: '输入问题',
  note: 'AI 的回答可能有误。重要的数字请用原始数据核实。',
  comments: {
    stream: '示例中，把固定的回答一点一点追加，以流式方式写出。在应用中，收到多少就把 content 延长多少，写完后去掉 streaming',
  },
} satisfies typeof ja;
