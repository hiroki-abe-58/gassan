import type ja from '../ja/layout';

export default {
  lead: '宽度由令牌决定，高度由 CSS Grid 和 dvh 决定。不用 JS 计算高度。只有正文会滚动。',
  size: {
    title: '宽度令牌',
    intro: '面板宽度为 min(100%, 令牌)。窄屏上不会溢出，宽屏上也能收在易读的行长之内。',
  },
  placement: {
    title: '位置',
    intro: 'placement="auto" 先用 JS 解析为 center 或 sheet，再交给 DOM。start 和 end 是从侧边滑出的面板，按用途选用（auto 不会解析为这两者）。',
    mockTitle: '路线',
    when: {
      center: '桌面端的默认值',
      top: '内容高度变化很大时。居中的话，高度一变就会上下乱跳',
      sheet: '宽度小于 600px 时的默认值。能把 primary 放在单手够得着的位置',
      start: '导航抽屉。在窄屏上打开应用的导航',
      end: '详情或筛选的面板。一边看列表一边确认内容',
    },
  },
  grid: {
    title: '面板的网格',
    intro: '头部、正文、底部三行。正文这一行如果不是 minmax(0, 1fr)，正文就不会收缩，也就不会滚动。',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* 不使用 100vh */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: '思路（实际的规则在 src/styles.css）',
    mockTitle: '更新记录',
    mockClose: '关闭',
    do: '只有正文会滚动。头部和底部始终可见（B-01 / H-10）。',
    mockCut: '标题被截在屏幕上方',
    dont: '不要用 `max-h-[90vh]` 或单独的 `1fr` 了事。移动端地址栏会让高度出错，居中时顶部会被截掉。',
  },
  touch: {
    title: '可触摸的尺寸',
    body: (tap: string): string =>
      `按钮和图标按钮的点击区域为 \`${tap}\`。WCAG 2.5.8 的最低要求是 24px，但这里采用 Apple HIG 的 44px。“返回”与“×”之间至少留出 8px，因为这两者的误按是代价最高的事故（H-03 / H-04）。`,
    callout: '安全区域一定要用 `max()` 包起来，以免在 `env(safe-area-inset-bottom)` 为 0 的设备上留白消失（C-04 / F-12）。',
  },
  spec: {
    title: '容器的条目',
    tableCaption: '容器的规范',
  },
} satisfies typeof ja;
