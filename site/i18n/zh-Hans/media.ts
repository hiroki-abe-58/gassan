import type ja from '../ja/media';

export default {
  lead: '图片、视频、音频，以及横向翻看它们的图库。先占好比例以消除跳动，不自动播放。图库的本体是 scroll-snap，按钮和按键只负责指定位置。',
  gallery: {
    title: '图库',
    intro: '前后按钮、方向键、Home / End、手指滑动，无论用哪种方式移动，指向的都是同一个位置。位置会被播报。',
    exampleTitle: '山脊习作',
    exampleDescription: '打开后用 ← → 翻看。标题中的“n / 5”由 onIndexChange 更新。',
  },
  media: {
    title: '媒体的默认行为',
    body: [
      '传入 `ratio="16 / 9"` 后，加载前就会预留位置。因为加载后高度发生变化，模态框会跳动（B-10）。比例加在内部的 `img` / `video` 上，而不是包含图注的 `figure`（§10-7）。',
      '视频和音频不带 `autoplay`，带 `controls`，并设为 `preload="metadata"`。模态框一打开就出声，违背了“现在请专注于这里”的意图（B-11）。',
    ],
    callout: '图片忘记传 `alt` 时，开发时会给出警告。如果是装饰性图片，请显式写 `alt=""`。',
  },
  notify: {
    title: '位置通知',
    body: [
      '`onIndexChange` 只在用户看到的位置发生变化时触发。仅仅挂载不会触发。`items` 缩短导致位置被截断时，属于“发生了变化”，因此会触发（D-14）。`items[].id` 重复时，会点名是哪个值并给出警告（D-13）。',
    ],
  },
  a11yCaption: '媒体与图库满足的规范',
} satisfies typeof ja;
