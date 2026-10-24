import type ja from '../ja/uiCommand';

export default {
  lead: '이름을 입력해 페이지나 작업을 찾고 실행하는 창. ⌘K(Windows 등에서는 Ctrl+K)로 화면 위에 겹쳐 열리고, 키보드만으로 고를 수 있다. 이 사이트 오른쪽 위의 “검색”도 이 컴포넌트로 만들었다.',
  example: {
    title: '견본',
    intro: '페이지와 작업을 그룹으로 나누어 늘어놓는다. 이름뿐 아니라 “invoice” 같은 별칭으로도 찾을 수 있고, 대문자 “INVOICE”나 전각 “ｉｎｖｏｉｃｅ”로 입력해도 찾아진다. 사용할 수 없는 작업은 흐리게 보여 주고, 키로 이동할 때는 건너뛴다.',
    exampleTitle: '명령 팔레트',
    exampleDescription: '↑↓로 이동하고 Enter로 고른다. 일치한 부분은 굵게 표시되고, 일치한 개수를 읽어 준다.',
  },
  matching: {
    title: '찾는 방식과 순서',
    intro: '입력한 글자를 이름·설명·별칭과 맞춰 본다. 이때 전각과 반각, 대문자와 소문자를 구별하지 않으며, 일본어의 히라가나와 가타카나도 같은 글자로 본다. 순서는 다음과 같고, 같은 순위끼리는 넘겨준 순서를 그대로 따른다.',
    tableCaption: '정렬 순서',
    head: { rank: '순서', rule: '일치하는 곳', typed: '입력한 글자', hits: '일치하는 예' },
    rows: [
      { rank: '1', rule: '이름의 시작', typed: '멤버', hits: '멤버·멤버 초대' },
      { rank: '2', rule: '이름의 다른 위치', typed: '내보내기', hits: '데이터 내보내기' },
      { rank: '3', rule: '설명과 별칭', typed: 'INVOICE', hits: '요금제와 결제(별칭 invoice)' },
    ],
  },
  site: {
    title: '이 사이트의 검색',
    intro: '오른쪽 위의 “검색”(⌘K / Ctrl+K)으로 여는 창이 바로 이 컴포넌트다. 모든 페이지를 이름으로 찾을 수 있으며, 섹션별로 묶어 보여 준다. 페이지 주소의 영어(“datepicker”, “toast” 등)로도 찾아진다.',
  },
  codeCaption: '사용법',
  code: "import { CommandPalette } from '@genelab/gassan';\n\n// ⌘K / Ctrl+K로 연다. 열고 닫기를 직접 관리하려면 open과 onOpenChange를 넘긴다\n<CommandPalette\n  items={[\n    { id: 'members', group: '페이지', label: '멤버', href: '/members', keywords: ['members'] },\n    { id: 'invite', group: '작업', label: '멤버 초대', shortcut: ['G', 'I'], onSelect: openInvite },\n  ]}\n/>",
  a11yCaption: '명령 팔레트의 동작',
} satisfies typeof ja;
