import type ja from '../../ja/demos/fileForm';

export default {
  open: '提交文件',
  title: '提交文件',
  documents: '身分證明文件',
  documentsHelp: 'PDF 或圖片。可一次選擇多個',
  rejected: '不接受的格式：{0}',
  cancel: '取消',
  submit: '提交',
  comments: {
    reject: '拖放不會經過 accept，所以由 gassan 套用相同的規則。不符合的檔案交給 onReject（I-14）',
  },
} satisfies typeof ja;
