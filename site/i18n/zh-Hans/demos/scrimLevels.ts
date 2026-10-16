import type ja from '../../ja/demos/scrimLevels';

export default {
  subtle: '非破坏性、短暂的确认',
  default: '默认。确认、输入、浏览、流程',
  strong: '同意、破坏性的确认',
  immersive: '灯箱（显式 opt-in）',
} satisfies typeof ja;
