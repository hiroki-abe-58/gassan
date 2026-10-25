import type ja from '../../ja/demos/japaneseNormalize';

export default {
  postalCode: '邮政编码',
  postalCodeHelp: '不论有无〒、全角或连字符，都统一为“123-4567”',
  phone: '电话号码',
  phoneHelp: '统一为纯数字（+81 改为 0）',
  kana: '振假名',
  kanaHelp: '平假名、半角片假名转为片假名',
  company: '公司名称',
  companyHelp: '英文字母和数字转为半角，半角片假名转为全角',
  invoice: '登记号码（发票）',
  invoiceHelp: '从数字开始输入也会补上 T',
  legacy: '发送到要求全角的系统的地址',
  legacyHelp: '英文字母、数字和空格也转为全角',
  comments: {
    postalCode: '每次输入时统一（输入法组字期间不处理）。onChange 接收统一后的值',
    phone: '值只有数字（加分隔需要区号表，所以不加）',
    legacy: '不说“请用全角输入”，而是由接收的一方转为全角',
    received: '应用接收到的值',
  },
} satisfies typeof ja;
