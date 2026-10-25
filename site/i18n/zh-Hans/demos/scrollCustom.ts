import type ja from '../../ja/demos/scrollCustom';

export default {
  looks: { thin: '细', standard: '默认', thick: '粗、直角', accent: '强调色' },
  items: ['收件箱', '草稿', '已发送', '已加星标', '定时发送', '归档', '垃圾邮件', '已删除', '账单', '招聘', '外部', '稍后阅读'],
  comments: {
    looks: '外观用自定义属性更改（写在容器上或其外侧，里面的滚动条就会跟着变）',
    always: '为了看出差别，这里始终显示',
  },
} satisfies typeof ja;
