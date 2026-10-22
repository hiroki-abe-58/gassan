import type ja from '../ja/uiBadges';

export default {
  lead: '상태나 개수를 짧은 말로 나타내는 배지, 사람이나 조직의 얼굴이 되는 아바타, 키 표기. 모두 색만으로 전하지 않고, 반드시 말이나 이름을 가진다.',
  badges: {
    title: '배지',
    intro: '바탕은 톤의 색을 옅게 깔고, 글자는 톤의 색을 조금 진하게 해서 라이트와 다크 모두 4.5:1 이상을 확보한다. 점은 장식이며, 의미는 말로 쓴다.',
  },
  avatars: {
    title: '아바타',
    intro: '이름이 읽어 주는 이름이 되고, 이미지는 장식이다. 이미지가 없거나 불러올 수 없을 때는 이니셜을 표시한다. 바탕색은 이름으로 정해지므로, 같은 사람은 항상 같은 색이 된다.',
  },
  group: {
    title: '겹쳐서 늘어놓기',
    intro: '표시할 개수(max)를 넘는 만큼은 “+N”으로 묶고, “외 N명”이라고 읽어 준다.',
    label: '담당자',
  },
  kbd: {
    title: '키 표기',
    intro: '단축키 안내에. kbd 요소로, 아래쪽 선만 조금 두껍게 해서 누를 수 있는 키처럼 보이게 한다.',
  },
  labels: {
    neutral: 'neutral(기본값)',
    accent: 'accent',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    dot: '점 포함',
    initials: '이니셜',
    japanese: '한국어 이름',
    square: '사각형(조직)',
    sizes: '크기',
    group: 'max={3}',
    shortcut: '단축키',
  },
  sample: {
    draft: '초안',
    beta: '베타',
    paid: '결제 완료',
    review: '검토 중',
    overdue: '기한 초과',
    failed: '실패',
    online: '가동 중',
    personEn: 'Mina Carter',
    personJa: '김지아',
    team: 'Acme Studio',
    search: '검색',
    close: '닫기',
  },
  code: "import { Badge, Avatar, AvatarGroup, Kbd } from '@genelab/gassan';\n\n<Badge tone=\"success\" dot>결제 완료</Badge>\n\n<AvatarGroup label=\"담당자\" max={3}>\n  {members.map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}\n</AvatarGroup>\n\n<Kbd>⌘</Kbd> <Kbd>K</Kbd>",
  codeCaption: '사용법',
  a11yCaption: '배지와 아바타가 충족하는 명세',
} satisfies typeof ja;
