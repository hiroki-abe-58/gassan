import type ja from '../ja/start';

export default {
  lead: '安装，选定一个 kind，始终挂载。要记住的只有这些，其余的约定都由 kind 承担。',
  install: {
    title: '安装',
    body: ['已发布到 npm（`@genelab/gassan`）。peer 依赖为 React 18.2 及以上（19 也可用）。'],
    nextjs:
      '在 Next.js App Router 中，产物开头已带有 `"use client"`，可以直接 import。如果希望页面跳转时关闭，传入 `routeKey={usePathname()}`（L-13）。',
  },
  minimal: {
    title: '最小示例',
    intro: '头部、正文、底部三行。名称由 Modal.Title 负责，标签与说明的关联由 Modal.Field 负责。',
    exampleTitle: '编辑个人资料',
  },
  alwaysMounted: {
    title: '模态框要始终挂载',
    body: [
      '关闭动画的前提是“关闭之后元素仍然存在”。如果条件挂载，`open` 变为 false 的那一刻元素就整个消失，从原理上就不存在可以绘制退出效果的对象。',
    ],
    do: '始终挂载，用 `open` 控制开关。退出动画、焦点恢复、内容重置由库依次完成。',
    dont: '不要写成 `{open && <Modal.Root />}`。关闭的瞬间就会消失，无法绘制退出动画（§5 第 3 条）。',
  },
  choose: {
    title: '选定一个 kind',
    body: [
      '`kind` 有 `confirm` / `form` / `view` / `consent` / `flow` 五种。确定后，遮罩层、能否用 Esc 和点击背景关闭、位置的默认值随之确定。如果同时符合多种，那其实是应该拆开的两个模态框。',
    ],
    doTitle: '要删除草稿吗',
    doCancel: '算了',
    doDelete: '删除',
    do: '一个模态框只有一个目的。确认就只做确认。',
    dontTitle: '要删除吗？还有设置',
    dontSave: '保存并删除',
    dont: '不要把确认和表单混在一个模态框里。正确的关闭方式会变成两种，总有一种会辜负用户。',
    more: '五种类型与决策矩阵 →',
  },
  imperative: {
    title: '只是确认的话，可以用 await 来写',
    body: [
      '用声明式写法写确认对话框，state 会变多。`useModals().confirm()` 以 Promise 返回结果。在应用根部只放一个 `<ModalHost />`。',
    ],
    code: "const modals = useModals();\nconst ok = await modals.confirm({ title: '要删除吗', tone: 'danger' });",
  },
  browsers: {
    title: '浏览器要求',
    intro:
      '既然把第 1 层交给浏览器，浏览器的现状就直接成为前提。在较旧的环境中只会退化为“没有动画的模态框”，打开、关闭和无障碍都能保持。',
    tableCaption: '使用的平台特性及其支持情况',
  },
  ai: {
    title: '让 AI 来写的时候',
    intro:
      '给 Cursor / Claude Code / Copilot 只传规范 §9 的这一段。提前拦住 2022 年以前实现的习惯（自制焦点陷阱、z-index: 9999、条件挂载）。',
  },
} satisfies typeof ja;
