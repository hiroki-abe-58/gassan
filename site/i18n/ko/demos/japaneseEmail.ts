import type ja from '../../ja/demos/japaneseEmail';

export default {
  label: '이메일 주소',
  hint: '“taro@gmial.com”을 입력하고 입력란을 벗어나면 후보가 나온다. “@docomo.ne.jp” 같은 휴대폰 통신사 메일에는 수신 설정에 관한 주의가 나온다.',
  comments: {
    sender: '확인 메일의 발신자(휴대폰 통신사 메일에 대한 주의에 넣는다)',
  },
} satisfies typeof ja;
