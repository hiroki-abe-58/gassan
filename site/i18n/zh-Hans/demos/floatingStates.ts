import type ja from '../../ja/demos/floatingStates';

export default {
  name: '显示名称',
  nameValue: '王芳',
  email: '邮箱地址',
  emailValue: 'aoi@',
  emailError: '请按邮箱地址的格式输入',
  workspace: '工作区 URL',
  workspaceValue: 'atlas-design',
  workspaceHelp: '创建后无法更改',
  reset: '恢复初始值',
  comments: {
    reset: '用 form.reset() 回到空值或初始值时，标签也会随之移动（受控的值在 onReset 中恢复）',
    initial: '有 defaultValue 时，从首次渲染起就以浮起的样子显示（服务端渲染也一样）',
    error: '错误显示在输入框下方，标签也变成红色。关联（aria-invalid / aria-describedby）与标签在上方时相同',
    disabled: '不可用的输入框，边框和标签一起变淡',
  },
} satisfies typeof ja;
