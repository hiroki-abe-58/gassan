import type ja from '../../ja/demos/chartGantt';

export default {
  label: '新账单页面的计划',
  description: '页面设计持续到本周五的评审。API 的开发已经开始，发布定在 5 周后的周一。',
  design: '设计',
  build: '开发',
  qa: '测试与发布',
  requirements: '确定需求',
  screens: '设计页面',
  review: '设计评审',
  api: '开发 API',
  frontend: '开发页面',
  testing: '验收测试',
  release: '发布',
  comments: {
    relative: '示例的日期从本周一开始计算（这样无论何时打开，表示今天的线都会落在计划之内）',
  },
} satisfies typeof ja;
