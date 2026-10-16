import type ja from '../../ja/demos/gateCustom';

export default {
  topicDesign: '设计',
  topicA11y: '无障碍',
  topicPerf: '性能',
  topicTesting: '测试',
  open: '选择感兴趣的领域',
  title: '调整推荐内容',
  remaining: '还需再选 {0} 项',
  topics: '领域（至少 3 项）',
  submit: '按此内容保存',
  comments: {
    gate: '把任意条件做成门控。满足之前按钮为 aria-disabled（按下时播报原因，并把焦点带回这里）',
    status: '按下之前就能看到原因（G-10）',
  },
} satisfies typeof ja;
