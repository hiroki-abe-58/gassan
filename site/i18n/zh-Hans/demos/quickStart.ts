import type ja from '../../ja/demos/quickStart';

export default {
  open: '打开',
  title: '编辑个人资料',
  name: '显示名称',
  cancel: '算了',
  save: '保存',
  comments: {
    alwaysMounted: '始终挂载，用 open 控制开关。写成 {open && <Modal.Root />} 就无法绘制退出动画',
  },
} satisfies typeof ja;
