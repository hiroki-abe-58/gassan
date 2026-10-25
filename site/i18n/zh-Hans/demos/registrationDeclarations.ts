import type ja from '../../ja/demos/registrationDeclarations';

export default {
  note: '开立账户的行业（银行、证券、加密资产、汇款等）在身份验证之前询问的申报与声明。',
  comments: {
    labels: '依据法律法规的文字（声明的文字和范围的说明）也可以从注册的文字表中取得',
    tax: '如果是“仅日本”，只需按一次。只对还有其他国家的人，显示国家和纳税人识别号的输入项',
    usPerson: '只对回答“有”的人，询问美国纳税人识别号和对报告的同意',
    declaration: '较长的范围说明，放在可以展开和收起的 details 中',
  },
} satisfies typeof ja;
