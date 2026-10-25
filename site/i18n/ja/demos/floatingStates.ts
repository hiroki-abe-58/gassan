export default {
  name: '表示名',
  nameValue: '佐藤 葵',
  email: 'メールアドレス',
  emailValue: 'aoi@',
  emailError: 'メールアドレスの形で入力してください',
  workspace: 'ワークスペースの URL',
  workspaceValue: 'atlas-design',
  workspaceHelp: '作ったあとは変えられません',
  reset: '最初の値に戻す',
  comments: {
    reset: 'form.reset() で空や最初の値に戻ると、ラベルもそれに合わせて動く（制御している値は onReset で戻す）',
    initial: 'defaultValue があれば、最初の描画から浮いた形で出る（サーバーで描いても同じ）',
    error: 'エラーは欄の下に出し、ラベルも赤くする。配線（aria-invalid / aria-describedby）は上のラベルと同じ',
    disabled: '使えない欄は、枠とラベルを一緒に薄くする',
  },
};
