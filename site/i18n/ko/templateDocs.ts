import type ja from '../ja/templateDocs';

export default {
  auth: {
    lead: '로그인·계정 만들기·비밀번호 재설정·2단계 인증·이메일 확인·로그아웃. 컴포넌트 하나만 두면, 자동 완성 속성·고칠 곳 요약·보내는 동안의 중복 제출 방지·화면이 바뀔 때의 포커스까지 갖춘 페이지가 된다.',
    setup: {
      title: '사용법',
      intro: '앱의 루트에 SiteProvider를 하나 두고, 제품의 이름·로고·이동할 곳을 넘긴다. 템플릿의 스타일은 templates.css에 있다(styles.css 다음에 불러온다). Next.js의 Link 등은 linkComponent에 넘긴다.',
      code: "import '@genelab/gassan/styles.css';\nimport '@genelab/gassan/templates.css';\nimport { SiteProvider, SignInPage } from '@genelab/gassan';\n\n<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', signIn: '/login', signUp: '/signup', forgotPassword: '/forgot', terms: '/terms', privacy: '/privacy' }}\n  linkComponent={Link}\n>\n  <SignInPage\n    onSubmit={async ({ email, password, remember }) => {\n      const ok = await signIn(email, password, remember);\n      // 실패하면 기본 문구(어느 쪽이 틀렸는지 밝히지 않는다)를 보여 준다\n      if (!ok) return { error: true };\n    }}\n  />\n</SiteProvider>",
    },
    signIn: {
      title: '로그인',
      intro: '이메일 주소(autocomplete="username")와 비밀번호(current-password)로 비밀번호 관리자의 자동 완성이 작동한다. 실패한 이유는 어느 쪽이 틀렸는지 밝히지 않으며, 입력한 내용은 지우지 않는다. 외부 ID 제공자의 버튼도 나란히 둘 수 있다. 견본에서는 비밀번호에 “gassan”을 입력하면 2단계 인증으로 넘어간다.',
    },
    signUp: {
      title: '계정 만들기',
      intro: '비밀번호는 입력하는 동안 강도와 조건을 알 수 있고, 입력란의 설명으로 읽힌다. 이용약관과 개인정보 처리방침에 대한 동의를 받는다. 제출하기 전까지는 오류로 다그치지 않는다.',
    },
    reset: {
      title: '비밀번호 재설정',
      intro: '재설정 메일을 요청하면 가입 여부와 관계없이 같은 화면으로 넘어간다(계정이 있는지 밝히지 않는다). 보낸 뒤에는 대기 시간이 지나면 다시 보낼 수 있다. 링크의 유효 기간이 지났다면 다시 보내는 안내만 보여 준다.',
      forgot: '메일 보내기',
      reset: '새 비밀번호',
      expired: '링크 만료',
    },
    twoFactor: {
      title: '2단계 인증',
      intro: '입력란은 하나(autocomplete="one-time-code")로, SMS 자동 완성과 붙여넣기가 작동한다. 자릿수가 다 차면 자동으로 보내고, 틀리면 코드를 지우고 입력란으로 돌아간다. 견본의 인증 코드는 “123456”이다.',
    },
    verifyEmail: {
      title: '이메일 주소 확인',
      intro: '메일을 보낸 곳을 보여 주고, 다시 보내기·주소 변경·확인된 뒤의 다음 단계를 안내한다.',
    },
    signOut: {
      title: '로그아웃',
      intro: '로그아웃해도 되는지 묻는 화면과, 로그아웃한 뒤의 화면.',
      confirm: '확인',
      done: '로그아웃한 뒤',
    },
    a11yCaption: '로그인과 가입 템플릿이 충족하는 명세',
  },
  status: {
    lead: '4xx / 5xx·오프라인·점검. 무슨 일이 일어났는지·왜인지·다음에 무엇을 할 수 있는지를 사용자를 탓하지 않는 말로 쓰고, 다음 한 걸음을 상태마다 바꾼다.',
    error: {
      title: '오류 페이지',
      intro: '401은 로그인, 403은 권한 요청, 404는 홈과 이전 페이지, 429·5xx·오프라인은 다시 시도로 이끈다. 상태 코드는 크게 보여 주고, 스크린 리더에서는 “오류 404”로 읽게 한다. 5xx의 문의 번호는 복사할 수 있다. 429는 대기 시간 동안 “다시 시도”를 누를 수 없다.',
      variants: {
        notFound: '404 찾을 수 없음',
        server: '500 서버 문제',
        forbidden: '403 권한 없음',
        unauthorized: '401 로그인 필요',
        tooMany: '429 요청 과다',
        offline: '오프라인',
      },
    },
    maintenance: {
      title: '점검',
      intro: '일정은 보는 사람의 시간대로, 시간대 이름을 붙여 보여 준다(같은 날이면 날짜는 한 번만). 서비스 상태 페이지가 있으면 먼저 안내하고, 진행 소식을 시각과 함께 나열한다.',
    },
    code: "import { ErrorPage, MaintenancePage } from '@genelab/gassan';\n\n// Next.js의 app/not-found.tsx\nexport default function NotFound() {\n  return <ErrorPage status={404} />;\n}\n\n<ErrorPage status={500} reference={error.digest} onRetry={reset} />\n<ErrorPage status={429} retryAfter={30} />\n\n<MaintenancePage start=\"2026-10-24T02:00:00+09:00\" end=\"2026-10-24T04:00:00+09:00\" />",
    codeCaption: '사용법',
    a11yCaption: '오류와 점검 템플릿이 충족하는 명세',
  },
  public: {
    lead: '요금·자주 묻는 질문·문의·약관과 개인정보 처리방침·업데이트 내역. 헤더와 푸터(SiteLayout)까지 컴포넌트 하나로 보여 준다. 탐색과 푸터의 열은 SiteProvider에 한 번만 쓰면 모든 페이지에 적용된다.',
    site: {
      title: '바깥 틀',
      intro: '본문으로 건너뛰는 링크·헤더의 탐색(현재 페이지에 aria-current)·푸터의 링크 열·약관 링크. 컨테이너가 좁으면 탐색을 “메뉴” 버튼 아래로 접는다. 자체 레이아웃 안에 둘 때는 layout={false}.',
      code: "<SiteProvider\n  name=\"Atlas\"\n  links={{ home: '/', pricing: '/pricing', faq: '/faq', contact: '/contact', terms: '/terms', privacy: '/privacy', signIn: '/login', signUp: '/signup' }}\n  nav={[\n    { label: '요금', href: '/pricing' },\n    { label: '자주 묻는 질문', href: '/faq' },\n  ]}\n  footer={[{ title: '회사', links: [{ label: '회사 소개', href: '/about' }] }]}\n  copyright=\"© 2026 Atlas, Inc.\"\n>\n  <PricingPage plans={plans} yearlyNote=\"2개월분 할인\" />\n</SiteProvider>",
    },
    pricing: {
      title: '요금제',
      intro: '월 결제와 연 결제를 전환하고, 가격은 통화 형식으로 보여 준다. 스크린 리더는 “월 ¥1,500”처럼 기간을 말로 읽는다. 추천하는 요금제는 “추천”이라는 말과 바깥 테두리로 나타내고, 비교 표는 열과 행의 제목을 갖는다.',
    },
    faq: {
      title: '자주 묻는 질문',
      intro: '질문을 낱말로 좁히고(히라가나와 가타카나, 전각과 반각을 구별하지 않는다), 결과 수를 읽어 준다. 분류마다 제목으로 나누고, 주소의 #id에 해당하는 질문은 펼친 상태로 보여 준다. 마지막에 문의로 가는 길을 둔다.',
    },
    contact: {
      title: '문의하기',
      intro: '일본의 문의 양식 관례대로 필수와 선택 표시를 한다. 유형은 셀렉트, 내용은 글자 수를 보여 주며, 개인정보 처리방침에 대한 동의를 받는다. 보내면 접수 화면으로 바뀐다.',
    },
    document: {
      title: '약관과 문서',
      intro: '시행일과 수정일(time 요소)·목차(이름이 있는 nav)·번호가 붙은 조항(“제1조”). 컨테이너가 넓으면 목차를 옆에 두고 따라오게 하며, 인쇄할 때는 목차와 바깥 틀을 뺀다. 특정상거래법에 따른 표기는 이름과 값의 목록으로 쓸 수 있다.',
      variants: { terms: '이용약관', privacy: '개인정보 처리방침', legal: '특정상거래법에 따른 표기' },
    },
    changelog: {
      title: '업데이트 내역',
      intro: '업데이트마다 제목·날짜(time 요소)·버전·종류를 말로 나타낸 배지를 가지며, 실제로 쓰인 종류로만 필터링할 수 있다. 컨테이너가 넓으면 날짜와 버전을 옆 열에 둔다.',
    },
    a11yCaption: '공개 페이지 템플릿이 충족하는 명세',
  },
  app: {
    lead: '로그인한 뒤의 화면을 감싸는 바깥 틀. 왼쪽의 내비게이션 바·상단 바(검색·알림·계정)·본문. 컨테이너가 좁을 때는 상단 바의 “메뉴”에서 옆 패널로 내비게이션을 연다. 내용은 페이지 헤더·수치 요약·데이터 표로 구성한다.',
    setup: {
      title: '사용법',
      intro: '내비게이션은 묶음별로 넘기고, 현재 페이지의 이동할 곳을 current에 넘긴다. 제품의 이름과 로고, 링크를 그리는 컴포넌트(Next.js의 Link 등)는 SiteProvider에서 가져온다.',
      code: "import { AppShell, PageHeader, DataTable } from '@genelab/gassan';\n\n<AppShell\n  current={pathname}\n  nav={[\n    { items: [{ label: '홈', href: '/app', icon: <HomeIcon /> }] },\n    { title: '워크스페이스', items: [{ label: '멤버', href: '/app/members' }] },\n  ]}\n  actions={<IconButton label=\"검색\"><SearchIcon /></IconButton>}\n  account={{ name: '김민준', menu: [{ value: 'sign-out', label: '로그아웃', onSelect: signOut }] }}\n>\n  <PageHeader title=\"멤버\" actions={<Button variant=\"primary\">초대하기</Button>} />\n  <DataTable label=\"멤버\" rows={members} columns={columns} getRowId={(m) => m.id} selectable />\n</AppShell>",
    },
    shell: {
      title: '앱 셸',
      intro: '컨테이너가 넓을 때는 왼쪽에 내비게이션 바를 두고, 현재 페이지를 바탕색과 굵은 글씨로 나타낸다. “스마트폰”으로 바꾸면 내비게이션이 접히고, “메뉴”에서 옆 패널로 연다(Esc나 바깥을 누르면 닫히고, 내비게이션의 링크를 눌러도 닫힌다). 내비게이션에서 멤버·요금제와 결제·설정 견본으로 이동할 수 있다.',
      variants: { dashboard: '홈(대시보드)', members: '멤버(데이터 표)' },
    },
    a11yCaption: '앱 셸이 충족하는 명세',
  },
  appPages: {
    lead: '로그인한 뒤, 어느 SaaS에나 있는 화면. 계정 설정·멤버와 초대·요금제와 결제·초기 설정·초대 수락 페이지. 앱 셸 안에 두고 데이터와 처리 함수만 넘기면, 제출 흐름·확인 모달·결과 읽어 주기까지 갖춰진다.',
    setup: {
      title: '사용법',
      intro: '내용은 앱 셸(AppShell) 안에 둔다. 넘기는 것은 데이터와 처리 함수(저장·초대·해지 등)뿐이다. 처리에 실패했을 때 { error }를 돌려주면, 그 문장이 끼어들어 읽힌다. 넘기지 않은 구역이나 작업은 보여 주지 않는다.',
      code: "import { AppShell, MembersPage, SettingsPage } from '@genelab/gassan';\n\n<AppShell current=\"/settings\" nav={nav} account={account}>\n  <SettingsPage\n    profile={{ name: user.name, email: user.email, onSubmit: saveProfile }}\n    password={{ onSubmit: changePassword }}\n    sessions={{ items: sessions, onRevoke: revokeSession, onRevokeOthers: revokeOtherSessions }}\n    deleteAccount={{ confirmText: user.email, onDelete: deleteAccount }}\n  />\n</AppShell>\n\n<MembersPage\n  members={members}\n  roles={[{ value: 'admin', label: '관리자' }, { value: 'editor', label: '편집자' }]}\n  currentUserId={user.id}\n  onInvite={({ emails, role }) => invite(emails, role)}\n  onRemove={(ids) => removeMembers(ids)}\n/>",
    },
    settings: {
      title: '계정 설정',
      intro: '프로필·비밀번호·2단계 인증·로그인한 기기·계정 삭제를 제목이 있는 구역으로 나누어 늘어놓는다. 컨테이너가 넓을 때는 구역의 제목과 설명을 왼쪽 열에 둔다. 기기를 로그아웃시키는 버튼에는 기기 이름이 붙고, 지금 쓰고 있는 기기에는 그 버튼을 두지 않는다. 삭제는 확인 모달에서 하며, 정해 둔 문자(이메일 주소 등)를 입력할 때까지 누를 수 없다.',
    },
    members: {
      title: '멤버',
      intro: '사용 중인 좌석·이름과 이메일 주소로 좁히기(히라가나와 가타카나, 전각과 반각을 구별하지 않는다)·멤버 표·초대 중 목록. 초대는 모달에서 하며, 이메일 주소를 태그로 한꺼번에 넣는다. 자신의 행은 선택할 수 없고, 제외할 수 없으며, 역할도 바꿀 수 없다. 제외할 때는 확인 모달을 거친다.',
    },
    billing: {
      title: '요금제와 결제',
      intro: '현재 요금제와 다음 갱신일·결제 수단(카드는 끝 4자리만)·사용량·청구서 표. 사용량은 80%에서 주의 색, 상한에서 오류 색이 되며, 숫자로도 보여 준다. 결제에 실패했다면 페이지 위쪽의 알림 배너로 알린다. 견본에서 해지하면, 쓸 수 있는 마지막 날을 보여 주는 표시로 바뀐다.',
    },
    onboarding: {
      title: '초기 설정',
      intro: '가입한 직후의 단계. 카드 위에 진행 상황을 두고, 단계가 바뀌면 제목으로 포커스를 옮긴다. 다음으로 넘어갈 수 없는 이유는 내용 위에 보여 주고 읽어 준다. 건너뛸 수 있는 단계에는 “나중에 하기”를 보여 준다. 견본에서는 워크스페이스 이름을 입력하지 않으면 다음으로 넘어갈 수 없다.',
    },
    invite: {
      title: '초대 수락',
      intro: '누가·어느 워크스페이스에·어떤 역할로 초대했는지 보여 주고, 수락 / 거절을 둔다. 로그인하지 않았다면 로그인과 계정 만들기로, 기간이 지났다면 다음에 할 일만 안내한다. 거절하면 그 화면으로 바꾸고 제목으로 포커스를 옮긴다.',
      variants: { pending: '초대', signedOut: '로그인하지 않음', expired: '기간 만료' },
    },
    a11yCaption: '앱 안의 페이지 템플릿이 충족하는 명세',
  },
} satisfies typeof ja;
