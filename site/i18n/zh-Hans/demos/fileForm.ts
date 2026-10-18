import type ja from '../../ja/demos/fileForm';

export default {
  open: '提交材料',
  title: '提交材料',
  documents: '身份证明材料',
  documentsHelp: 'PDF 或图片。可以一次选择多个',
  rejected: '不接受的格式：{0}',
  cancel: '取消',
  submit: '提交',
  comments: {
    reject: '拖放不经过 accept，所以由 gassan 套用同样的规则。不符合的交给 onReject（I-14）',
  },
} satisfies typeof ja;
