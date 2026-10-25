import type ja from '../../ja/demos/japaneseBank';

export default {
  label: '收款账户',
  hint: '也可以用「みつびし」或“0005”搜索。选择日本邮政银行（「ゆうちょ銀行」）后，会根据存折上的记号和号码（例如 10180 和 12345671）生成转账用的支行名和账号。支行是示例。',
  comments: {
    fields: '金融机构和支行的候选由使用方传入（来自全国银行协会的数据或 API）',
    zengin: '户名以全角片假名保存，发送时转换为全银格式（半角片假名）',
  },
} satisfies typeof ja;
