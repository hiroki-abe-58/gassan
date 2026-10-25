import type ja from '../../ja/demos/floatingSignIn';

export default {
  account: '電子郵件或電話號碼',
  accountError: '請輸入電子郵件地址或電話號碼',
  password: '密碼',
  submit: '繼續',
  comments: {
    floating: '以 labelPlacement="floating" 把標籤放進輸入欄位中。有焦點或有值時，標籤會縮小並退到左上角（I-24）',
    password: 'PasswordInput 也一樣。標籤不會延伸到切換顯示的按鈕上',
  },
} satisfies typeof ja;
