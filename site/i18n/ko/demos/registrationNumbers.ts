import type ja from '../../ja/demos/registrationNumbers';

export default {
  try: '7000012050002를 입력하면 회사명에 “国税庁”(일본 국세청)이 들어간다(견본 데이터).',
  comments: {
    lookup: '법인번호로 회사명을 찾는다. 견본은 가지고 있는 표에서 찾는다(실제로는 자기 서버에서 일본 국세청의 법인번호 시스템 Web-API를 호출한다)',
    myNumber: '전각·공백·하이픈도 받아들이고 숫자만으로 맞춘다',
    check: '자릿수와 검사 숫자는 보내려고 한 뒤에 isMyNumber로 확인한다(입력하는 도중에는 오류로 다그치지 않는다)',
    company: '올바른 13자리가 되면 찾고, 빈 입력란이나 앞서 채운 그대로인 입력란만 채운다',
  },
} satisfies typeof ja;
