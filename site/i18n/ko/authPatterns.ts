import type ja from '../ja/authPatterns';

export default {
  lead: '로그인과 가입은 서비스의 입구이자 사람들이 이탈하기 쉬운 곳이다. 페이지로 된 로그인과 가입과 같은 폼과 제출 흐름은 그대로 두고, 보여 주는 방식과 순서를 바꾼 형태를 모았다. 헤더에서 여는 창, 이메일 주소를 먼저 물어 갈래를 나누는 로그인, 비밀번호 없이 쓰는 메일 링크와 SMS, 이메일 주소만으로 하는 임시 가입과 정식 가입 단계, 패스키, 계정 선택, 본인 확인과 로그인 만료, 구매 후 계정 만들기.',
  choose: {
    title: '서비스에 맞춰 고르기',
    intro: '모두 조합해서 쓸 수 있다. 예를 들어 금융 서비스라면 헤더의 창에서 임시 가입으로 들어가게 하고, 메일의 링크에서 정식 가입 단계로 이어 가며, 끝나면 패스키를 만들지 묻는다.',
    tableCaption: '서비스와 어울리는 형태',
    head: { service: '서비스', pattern: '형태', why: '이유' },
    rows: [
      {
        service: '일반 웹 서비스·SaaS',
        pattern: '`AuthDialog`(창)',
        why: '지금 보고 있는 페이지를 떠나지 않고 로그인과 가입을 할 수 있고, 끝나면 하던 작업으로 돌아갈 수 있다',
      },
      {
        service: '기업용 SaaS',
        pattern: '`EmailFirstPage`(이메일 주소 먼저)',
        why: '회사 도메인을 조직의 ID 제공자(SSO)로 보내고, 로그인과 가입의 입구를 하나로 만들 수 있다',
      },
      {
        service: '금융·보험·부동산·채용',
        pattern: '`QuickSignUpPage` → `RegistrationWizardPage`',
        why: '물어볼 것이 많으므로 입구에서는 이메일 주소만 받고, 정식 가입은 저장하면서 조금씩 진행한다',
      },
      {
        service: '가끔만 쓰는 서비스',
        pattern: '`MagicLinkPage`(메일 링크)',
        why: '비밀번호를 잊는 사람이 많다. 메일의 링크와 코드로 로그인할 수 있어 재설정하는 수고가 없다',
      },
      {
        service: '스마트폰 중심 서비스',
        pattern: '`PhoneSignInPage`(SMS)·패스키',
        why: '입력할 것을 줄일 수 있다. 코드는 SMS에서 자동으로 들어가고, 두 번째부터는 지문이나 얼굴로 로그인할 수 있다',
      },
      {
        service: '가족용·업무용으로 계정을 나눠 쓰는 서비스',
        pattern: '`AccountChooserPage`',
        why: '이 기기에서 쓴 계정을 고르기만 하면 되므로 이메일 주소를 다시 입력하지 않아도 된다',
      },
      {
        service: '결제·탈퇴·비밀번호 변경이 있는 화면',
        pattern: '`ReauthDialog`',
        why: '페이지를 떠나지 않고 비밀번호를 한 번 더 묻는다. 로그인이 만료되어도 입력 중인 내용을 잃지 않는다',
      },
      {
        service: '온라인 쇼핑·예약',
        pattern: '`GuestAccountCard`',
        why: '사기 전에 회원 가입을 요구하지 않는다. 구매를 마친 화면에서 비밀번호만 정하면 계정을 만들 수 있다',
      },
    ],
  },
  setup: {
    title: '헤더에서 창으로 열기',
    intro: '`AuthDialog`를 헤더의 버튼과 함께 두고, 열 화면(`mode`)을 고른다. 창 안에서 로그인·가입·비밀번호 재설정을 오갈 수 있고, 끝나면 창을 닫고 누른 버튼으로 포커스를 되돌린다.',
    code: `import { useState } from 'react';
import { AuthDialog, Button, type AuthDialogMode } from '@genelab/gassan';

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>('signIn');
  const openAs = (next: AuthDialogMode) => {
    setMode(next);
    setOpen(true);
  };
  return (
    <>
      <Button variant="tertiary" onClick={() => openAs('signIn')}>로그인</Button>
      <Button variant="primary" onClick={() => openAs('signUp')}>무료로 시작하기</Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onModeChange={setMode}
        onSignIn={async ({ email, password }) => {
          // 실패하면 기본 문구(어느 쪽이 틀렸는지 밝히지 않는다)를 보여 준다
          if (!(await signIn(email, password))) return { error: true };
        }}
        onSignUp={(values) => signUp(values)}
        onForgotPassword={({ email }) => sendResetEmail(email)}
      />
    </>
  );
}`,
  },
  dialog: {
    title: '창에서 하는 로그인과 가입',
    intro: '헤더의 “로그인”·“무료로 시작하기”에서 지금 페이지를 떠나지 않고 연다. 바깥을 눌러도 닫히지 않고(입력한 내용을 지우지 않는다), Esc와 닫기 버튼으로 닫는다. 입력한 이메일 주소는 로그인과 가입을 오가도 남는다. 견본에서는 비밀번호에 “gassan”을 입력하면 로그인할 수 있다.',
  },
  emailFirst: {
    title: '이메일 주소를 먼저 묻는 로그인',
    intro: '처음에는 이메일 주소만 묻는다. 사용하는 쪽의 답에 따라 비밀번호·가입·조직의 ID 제공자·메일 링크로 나눠 보낸다. 비밀번호 화면에서는 주소를 바꿀 수 없는 형태로 보여 주고, 비밀번호 관리자에게는 어느 계정인지 넘긴다. 계정이 있는지 밝히고 싶지 않다면, 없는 계정에도 비밀번호나 링크를 돌려준다.',
  },
  magicLink: {
    title: '메일 링크와 인증 코드',
    intro: '비밀번호를 쓰지 않는 로그인. 이메일 주소만 묻고 로그인 링크와 인증 코드를 보낸다. 메일은 스마트폰으로 보고 로그인은 PC에서 하는 경우처럼, 링크를 열 수 없는 기기에서도 코드로 로그인할 수 있다. 견본의 인증 코드는 “123456”이다.',
  },
  quickSignUp: {
    title: '이메일 주소만으로 하는 임시 가입과 정식 가입',
    intro: '입구에서 묻는 것은 이메일 주소뿐이다. 보내면 임시 가입이 끝나고, 정식 가입 링크를 메일로 보낸다. 정식 가입 단계는 넘어갈 때마다 저장하므로 “저장하고 나중에 계속하기”로 떠나도 이어서 시작할 수 있고, 마지막 확인 화면에서 각 단계를 고칠 수 있다. 주소·이름·생년월일은 일본 폼 입력 컴포넌트로 만들었다.',
    quick: '임시 가입',
    wizard: '정식 가입 단계',
  },
  phone: {
    title: '전화번호와 SMS',
    intro: '번호는 어떻게 쓰든 숫자만으로 맞추고, SMS를 받을 수 있는 휴대폰 번호인지 확인한다. 유선 전화번호에는 고치는 방법을 알 수 있는 문장으로 알린다. 코드는 SMS에서 자동으로 들어가고, 자릿수가 다 차면 보낸다. 견본의 인증 코드는 “123456”이다.',
  },
  passkey: {
    title: '패스키',
    intro: '로그인 페이지에 “패스키로 로그인”을 두고, 이메일 주소 입력란에서도 패스키를 고를 수 있게 한다. 로그인 직후에 한 번만 패스키를 만들지 묻는다(“나중에”도 같은 무게로 고를 수 있다). WebAuthn 호출은 사용하는 쪽이 넘긴다.',
    prompt: '만들지 묻기',
    signIn: '로그인 버튼',
  },
  accountChooser: {
    title: '계정 선택',
    intro: '이 기기에서 로그인한 적이 있는 계정을 늘어놓고, 고르기만 하면 그 계정의 로그인으로 넘어간다. “다른 계정 사용하기”를 항상 보여 주고, 더는 쓰지 않는 계정은 이 기기에서 제거할 수 있다.',
  },
  reauth: {
    title: '본인 확인과 로그인 만료',
    intro: '페이지를 떠나지 않고 비밀번호를 한 번 더 묻는 창. 중요한 작업 전의 본인 확인과 로그인 만료, 두 가지로 쓴다. 로그인 만료 창은 닫을 수 없고, 입력 중인 내용을 남긴 채 다시 로그인할 수 있다. 견본의 비밀번호는 “gassan”이다.',
    confirm: '중요한 작업 전',
    expired: '로그인 만료',
  },
  guestAccount: {
    title: '구매 후 계정 만들기',
    intro: '사기 전에 회원 가입을 요구하지 않는다(비회원으로 살 수 있다). 구매를 마친 화면에 비밀번호만 정하면 계정을 만들 수 있는 카드를 둔다. 이메일 주소는 주문할 때 쓴 것을 사용한다.',
  },
  a11yCaption: '형태를 바꾼 로그인과 가입의 동작',
  samples: {
    signIn: '로그인',
    startFree: '무료로 시작하기',
    heroTitle: '팀의 일을 한곳에서',
    heroDescription: '오른쪽 위의 “로그인”이나 “무료로 시작하기”를 누르면 이 페이지 위에 창이 열립니다(견본).',
    signedUp: '계정을 만들었습니다(견본)',
    passkeyNotice: '견본이므로 실제로 패스키를 호출하지 않습니다.',
    emailFirstHint:
      '견본: “new”로 시작하는 주소는 가입으로, “@corp.example.com”은 조직의 ID 제공자로, “link”로 시작하는 주소는 메일 링크로 넘어갑니다. 그 밖의 주소는 비밀번호(gassan)를 묻습니다.',
    expiresIn: '24시간',
    quickSteps: ['메일의 링크 열기', '고객 정보와 주소 입력하기', '내용을 확인하고 가입하기'],
    useEmail: '이메일 주소로 로그인',
    accounts: [
      { id: 'hana', name: '김하나', email: 'hana@example.com' },
      { id: 'aoi', name: '김민준', email: 'aoi@corp.example.com' },
      { id: 'ren', name: '한도윤', email: 'ren@example.jp' },
    ],
    securityTitle: '보안',
    securityDescription: '비밀번호를 바꾸기 전에 비밀번호를 한 번 더 확인합니다. 견본의 비밀번호는 “gassan”입니다.',
    changePassword: '비밀번호 변경',
    securityDone: '본인 확인을 마쳤습니다(견본)',
    expiredTitle: '주간 보고',
    expiredDescription: '“만료 체험하기”를 누르면 로그인이 만료됐을 때 열리는 창을 볼 수 있습니다. 작성 중이던 보고는 그대로 남아 있습니다. 견본의 비밀번호는 “gassan”입니다.',
    expiredLabel: '이번 주에 한 일',
    expiredDraft: '새 요금 페이지를 공개했다. 문의 폼으로 들어오는 건수가 20% 늘었다.',
    expiredDone: '다시 로그인했습니다. 작성 중이던 내용은 그대로입니다(견본)',
    expire: '만료 체험하기',
    orderTitle: '주문해 주셔서 감사합니다',
    orderDescription: '주문 확인 메일을 hana@example.com 주소로 보냈습니다.',
    orderRows: [
      { term: '주문 번호', details: 'A-20261026-0042' },
      { term: '배송 예정일', details: '10월 29일(목)' },
      { term: '결제', details: '¥4,180(신용카드)' },
    ],
    guestLater: '계정은 나중에 만들어도 됩니다(견본)',
    wizard: {
      profileTitle: '고객 정보',
      profileDescription: '본인 확인을 위해 신분증 등 공적 서류와 같은 표기로 입력해 주세요.',
      name: '이름',
      birth: '생년월일',
      profileRequired: '이름과 생년월일을 입력해 주세요',
      addressTitle: '주소와 연락처',
      addressDescription: '우편번호를 입력하면 주소 일부가 채워집니다.',
      address: '주소',
      phone: '전화번호',
      addressRequired: '주소와 전화번호를 입력해 주세요',
      purposeTitle: '이용 목적',
      purposeDescription: '서비스 개선에 사용합니다. 나중에 입력할 수도 있습니다.',
      purpose: '주된 목적',
      choose: '선택하세요',
      purposes: ['자산 운용', '생활비 관리', '사업 자금', '기타'],
      notAnswered: '미응답',
      savedExit: '저장했습니다. 메일의 링크에서 이어서 입력할 수 있습니다(견본)',
      doneNext: '계속',
    },
  },
} satisfies typeof ja;
