import type ja from '../../ja/demos/sheetDetents';

export default {
  tsuruoka: '쓰루오카역 앞',
  haguro: '하구로산 정상',
  eighthStation: '갓산 8합목',
  midagahara: '미다가하라',
  summitHut: '갓산 정상 산장',
  open: '경로 보기',
  detent: '현재 디텐트: {0}',
  title: '쓰루오카역 앞 → 갓산 정상 산장',
  description: '버스와 도보로 4시간. 8합목부터는 도보.',
  stops: '경유지',
  comments: {
    handle: '디텐트가 있을 때 핸들은 role="slider"인 조작 요소. 화살표 키·Home / End·클릭으로도 움직인다',
  },
} satisfies typeof ja;
