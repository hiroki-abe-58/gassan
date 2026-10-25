import type ja from '../../ja/demos/floatingModal';

export default {
  open: '打开登录框',
  title: '登录 Atlas',
  account: '邮箱或手机号',
  password: '密码',
  cancel: '取消',
  submit: '登录',
  comments: {
    modal: '在模态框中也一样。给 Modal.Field 传入 labelPlacement="floating"',
  },
} satisfies typeof ja;
