import type ja from '../../ja/demos/registrationNumbers';

export default {
  try: '输入 7000012050002 后，公司名称中会填入“国税庁”（日本国税厅，示例数据）。',
  comments: {
    lookup: '根据法人编号查询公司名称。示例从本地的表中查询（实际中从自己的服务器调用日本国税厅法人编号系统的 Web-API）',
    myNumber: '也接受全角、空格和连字符，统一为纯数字',
    check: '位数和校验位，在尝试提交之后用 isMyNumber 检查（输入过程中不报错）',
    company: '凑齐正确的 13 位后查询，只填写空着的输入框，或之前补全后未改动的输入框',
  },
} satisfies typeof ja;
