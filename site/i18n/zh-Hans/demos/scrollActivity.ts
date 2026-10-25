import type ja from '../../ja/demos/scrollActivity';

export default {
  label: '最近操作',
  visibility: '滚动条的显示方式',
  modes: { auto: '自动', hover: '悬停', scroll: '滚动时', always: '始终' },
  items: [
    '佐藤开具了“4 月账单”',
    '田中加入了项目“Atlas 2.0”',
    '存储空间用量已达 80%',
    '铃木评论了“价格表调整”',
    '创建了新的 API 密钥',
    '高桥邀请了 3 名成员',
    '发送了周报',
    '伊藤导出了“流失原因”',
    '将套餐从 Pro 改为 Max',
    '渡边开启了两步验证',
    '修改了账单地址',
    '山本修改了工作区名称',
    '中村起草了“新用户引导”邮件',
    '登录失败 3 次（东京）',
    '小林发布了“客户案例”',
    '加藤修改了通知设置',
  ],
  comments: {
    height: '高度上限加在容器上（滚动区域随容器的高度缩小，内容溢出多少就能滚动多少）',
  },
} satisfies typeof ja;
