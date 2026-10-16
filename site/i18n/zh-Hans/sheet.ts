import type ja from '../ja/sheet';

export default {
  lead: 'placement="sheet" 会变成从底部升起的面板。传入 detents 后，会停在 peek / half / full。把手不是装饰，而是用键盘也能操作的控件。',
  detents: {
    title: '按档位停靠的底部面板',
    intro: '拖动把手，或让它获得焦点后按 ↑ ↓ 切换档位。当前档位可以通过 onDetentChange 获取。',
    exampleTitle: '前往月山的路线',
    exampleDescription: '窄屏上可以用手指，宽屏上可以用键盘和点击来试。',
  },
  rules: {
    title: '三条约定',
    items: [
      {
        title: '快速向下轻扫不会关闭，而是下降一档',
        body: '既然有档位，用户轻扫时的意图是“缩小一点”。只有在最低一档继续向下轻扫时才会关闭。',
      },
      {
        title: '把手不只能拖动',
        body: '有档位时它是 role="slider"，方向键、Home / End 和点击都能切换档位。不让无法拖动的人失去操作途径。',
      },
      {
        title: '不指定档位时，高度随内容而定',
        body: '把手退化为装饰（aria-hidden）。不能操作的东西不会被当作控件读出来。',
      },
    ],
  },
  release: {
    title: '松开手指之后',
    body: [
      '比起拖动的判定本身，松开手指后浏览器自作主张触发的行为更容易出问题：拖动后合成的 click 让档位移动两次；在面板外松开手指导致卡死；回到同一档位时高度的指定消失——这些都是真实踩过、修好、并用测试固定下来的（§10-13〜§10-15）。',
    ],
    callout:
      '目标档位的判定被拆成了纯函数 `resolveDetents` / `snapToDetent`，可以单独 import。这是为了在没有布局的测试环境中也能验证。',
  },
  api: {
    body: [
      '档位本身由 `Modal.Root` 的 `detents` / `defaultDetent` / `onDetentChange` / `swipeToDismiss` 指定（[Modal.Root 的 API](#/components/root/api)）。',
    ],
  },
  a11yCaption: '底部面板与移动端的规范',
} satisfies typeof ja;
