import type ja from '../../ja/demos/japaneseNormalize';

export default {
  postalCode: '우편번호',
  postalCodeHelp: '〒·전각·하이픈 유무와 관계없이 “123-4567”로',
  phone: '전화번호',
  phoneHelp: '숫자만으로 맞춘다(+81은 0으로)',
  kana: '후리가나',
  kanaHelp: '히라가나·반각 가나는 가타카나로',
  company: '회사명',
  companyHelp: '영숫자는 반각으로, 반각 가나는 전각으로',
  invoice: '등록번호(인보이스)',
  invoiceHelp: '숫자부터 입력해도 T를 채운다',
  legacy: '전각이 필요한 시스템으로 보내는 주소',
  legacyHelp: '영숫자도 공백도 전각으로',
  comments: {
    postalCode: '입력할 때마다 맞춘다(IME 조합 중에는 건드리지 않는다). onChange는 맞춘 뒤의 값을 받는다',
    phone: '값은 숫자만(구분 기호는 지역 번호 표가 필요하므로 붙이지 않는다)',
    legacy: '“전각으로 입력해 주세요”라고 하는 대신, 받는 쪽에서 전각으로 바꾼다',
    received: '앱이 받는 값',
  },
} satisfies typeof ja;
