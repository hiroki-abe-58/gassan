import type ja from '../../ja/demos/floatingModal';

export default {
  open: '開啟登入視窗',
  title: '登入 Atlas',
  account: '電子郵件或電話號碼',
  password: '密碼',
  cancel: '取消',
  submit: '登入',
  comments: {
    modal: '在模態視窗中也一樣。把 labelPlacement="floating" 傳給 Modal.Field',
  },
} satisfies typeof ja;
