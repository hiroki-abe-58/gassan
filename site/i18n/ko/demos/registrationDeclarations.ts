import type ja from '../../ja/demos/registrationDeclarations';

export default {
  note: '계좌를 개설하는 업종(은행·증권·암호자산·송금 등)에서 본인 확인 전에 묻는 신고와 표명.',
  comments: {
    labels: '법령에 따른 문장(표명 문장이나 범위 설명)도 가입 문구 표에서 가져올 수 있다',
    tax: '“일본만”이면 한 번 누르기만 하면 된다. 다른 나라가 있는 사람에게만 국가와 납세자 번호 입력란을 보여 준다',
    usPerson: '“있음”이라고 답한 사람에게만 미국 납세자 번호와 보고 동의를 묻는다',
    declaration: '범위에 관한 긴 설명은 열고 닫을 수 있는 details에 둔다',
  },
} satisfies typeof ja;
