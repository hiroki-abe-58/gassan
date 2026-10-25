import type ja from '../../ja/demos/japaneseAddress';

export default {
  label: '收货地址',
  tryLead: '可以试试的邮政编码（示例数据）',
  tryCodes: ['100-0001（東京）', '530-0001（大阪）', '810-0001（福岡）', '000-0000（多个候选）', '000-0001（找不到）'],
  comments: {
    lookup: '根据邮政编码（7 位数字）返回地址候选。示例从本地的表中查询（实际中调用自己的服务器或外部 API）',
    fields: '只填写空着的输入框，以及之前自动填写后未改动的输入框（不覆盖用户输入的值和浏览器自动填充的值）',
  },
} satisfies typeof ja;
