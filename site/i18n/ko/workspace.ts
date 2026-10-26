import type ja from '../ja/workspace';

export default {
  lead: 'API 키·감사 로그·알림 설정. 관리 화면 가운데 자주 다시 만들게 되는 세 화면을, 앱 셸(P-12) 안에 두는 내용으로 준비했다.',
  apiKeys: {
    title: 'API 키',
    intro: '키 자체는 만든 직후에 같은 창에서 한 번만 보여 준다. 읽기 전용 입력란으로 포커스를 옮겨 전체를 선택하고, “복사” 버튼과 “지금만 볼 수 있습니다”라는 안내를 입력란에 연결한다. 키를 보여 주는 동안에는 Esc나 바깥을 눌러도 닫히지 않고, 닫히지 않는 이유를 읽어 준다. 컴포넌트는 키를 계속 갖고 있지 않는다(`onCreate`가 돌려준 `secret`을 보여 주고, 닫으면 버린다). 표에는 키를 구별하기 위한 일부(`hint`)만 넘긴다. 유효 기간은 짧은 것부터 늘어놓고, 맨 앞의 것을 기본값으로 한다.',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: '읽기', description: '프로젝트와 멤버 조회' },
  { value: 'write', label: '쓰기', description: '프로젝트 생성·변경·삭제' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // 서버는 키의 해시만 저장하고, 키 자체는 이번 한 번만 돌려준다
        const { secret } = (await response.json()) as { secret: string };
        reload();
        return { secret };
      }}
      onRevoke={async (id) => {
        const response = await fetch(\`/api/keys/\${id}\`, { method: 'DELETE' });
        if (!response.ok) return { error: true };
        reload();
      }}
    />
  );
}`,
  },
  auditLog: {
    title: '감사 로그',
    intro: '필터링과 페이지 나누기는 서버에서 한다. 컴포넌트는 조건을 갖고 있지 않으며, `query`로 받고 바뀔 때마다 `onQueryChange`로 넘긴다. 검색어는 보냈을 때(Enter나 “검색”), 작업 종류와 기간은 골랐을 때 바뀌고, 조건을 바꾸면 1페이지로 돌아간다. 일시는 초까지 보여 주고, 열 제목에 시간대 이름을 붙인다. 불러오는 동안에는 `loading`을 넘긴다(표가 스켈레톤으로 바뀌고, 다 불러오면 건수를 읽어 준다).',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // 조건을 받아 서버에서 한 페이지 분량을 읽는다

const ACTIONS = [
  { value: 'member.invite', label: '멤버 초대' },
  { value: 'api_key.create', label: 'API 키 생성' },
  { value: 'auth.sign_in', label: '로그인' },
];

export function AuditLog() {
  const [query, setQuery] = useState<AuditLogQuery>({ text: '', action: null, range: null, page: 1 });
  const { data, isLoading } = useAuditLog(query);
  return (
    <AuditLogPage
      query={query}
      onQueryChange={setQuery}
      events={data?.events ?? []}
      total={data?.total ?? 0}
      pageCount={data?.pageCount ?? 1}
      loading={isLoading}
      actions={ACTIONS}
      onExport={async (current) => {
        const response = await fetch('/api/audit-log/exports', { method: 'POST', body: JSON.stringify(current) });
        return response.ok ? undefined : { error: true };
      }}
    />
  );
}`,
  },
  notifications: {
    title: '알림 설정',
    intro: '알림 종류를 행으로, 받는 방법을 열로 놓은 표. 체크박스는 행 제목과 열 제목을 합친 이름을 가진다(“댓글과 멘션 이메일”). 보낼 수 없는 방법은 “—”로 표시하고, 끌 수 없는 알림(보안·결제)은 고르게 하지 않고 “항상 발송됩니다”라고 적는다. “모든 알림 일시 중지”는 표보다 앞에 두고, 일시 중지한 동안에는 표에서 고를 수 없게 하고 그 이유를 적는다. 방해 금지 시간의 종료 시간이 시작 시간보다 이르면 “다음 날”을 붙인다.',
  },
  samples: {
    keys: { production: '운영 서버', ci: 'CI 테스트', analytics: '분석 데이터 내보내기', legacy: '레거시 연동' },
    scopes: {
      read: { label: '읽기', description: '프로젝트와 멤버 조회' },
      write: { label: '쓰기', description: '프로젝트 생성·변경·삭제' },
      billing: { label: '결제', description: '청구서와 사용량 조회' },
    },
    actions: {
      signIn: '로그인',
      signInFailed: '로그인 실패',
      invite: '멤버 초대',
      role: '멤버 역할 변경',
      remove: '멤버 제외',
      keyCreate: 'API 키 생성',
      keyRevoke: 'API 키 무효화',
      plan: '요금제 변경',
      settings: '워크스페이스 설정 변경',
      export: '데이터 내보내기',
    },
    roleChange: '{0}(열람자 → 편집자)',
    planChange: 'Free → Pro',
    settingsTarget: '워크스페이스 이름',
    exportTarget: '멤버 목록(CSV)',
    system: '시스템',
    apiKey: 'API 키',
    locations: { tokyo: '일본 도쿄', osaka: '일본 오사카', fukuoka: '일본 후쿠오카', singapore: '싱가포르' },
    topics: {
      comments: { label: '댓글과 멘션', description: '나에게 온 댓글과 @멘션' },
      invites: { label: '초대와 참여', description: '워크스페이스 초대와 멤버 참여' },
      projects: { label: '프로젝트 업데이트', description: '담당하고 있는 프로젝트의 변경 사항' },
      weekly: { label: '주간 요약', description: '월요일 아침에 지난주 활동을 모아서 보내 드립니다' },
      product: { label: '새로운 기능', description: '새로운 기능과 사용 팁' },
      security: { label: '보안', description: '새 기기에서의 로그인과 비밀번호 변경' },
      billing: { label: '결제', description: '청구서와 결제 실패' },
    },
  },
  a11yCaption: 'API 키·감사 로그·알림 설정 템플릿의 동작',
} satisfies typeof ja;
