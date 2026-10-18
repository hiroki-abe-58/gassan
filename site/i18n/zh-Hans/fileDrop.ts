import type ja from '../ja/fileDrop';

export default {
  lead: 'FileDrop 是接收文件的放置区。里面是铺满整个放置区的原生 file input，点击、按 Enter / Space 或拖放都能选择文件。',
  gallery: {
    title: '示例',
    intro: '选中的文件以名称和大小的列表显示，可以逐个移除。',
    items: {
      single: '仅一个',
      multiple: '多个（仅限图片）',
      disabled: '不可用',
    },
  },
  modal: {
    title: '在模态框中',
    intro: '里面是原生 input，所以 Modal.Field 的 label 会直接成为名称。',
    exampleTitle: '提交材料',
    exampleDescription: '只接受 PDF 和图片。拖入其他格式时，会作为错误提示。',
  },
  reject: {
    title: '不符合的文件',
    callout:
      '拖放进来的文件不经过原生的 `accept`。gassan 套用同样的规则（扩展名、像 `image/*` 这样的通配符、类型），把不符合的交给 `onReject`。如何提示则交给 `Modal.Field` 的 `error`（I-14）。',
  },
  a11yCaption: '文件放置区满足的规范',
} satisfies typeof ja;
