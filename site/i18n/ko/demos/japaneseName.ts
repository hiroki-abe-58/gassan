import type ja from '../../ja/demos/japaneseName';

export default {
  label: '이름',
  hint: 'IME로 「やまだ」를 입력해 「山田」로 변환하면 “성(가타카나)”에 「ヤマダ」가 들어간다. 후리가나를 고치면 그 뒤로는 자동으로 넣지 않는다.',
  comments: {
    fields: '이름을 IME로 입력하면 변환 전의 가나를 후리가나에 넣는다(읽기는 추측이므로 후리가나는 언제든 고칠 수 있다)',
  },
} satisfies typeof ja;
